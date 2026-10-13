import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';

enum NetworkRole { host, client, none }

class LocalMultiplayerService {
  ServerSocket? _serverSocket;
  Socket? _clientSocket;
  NetworkRole _role = NetworkRole.none;

  Function(int col)? onRemoteMove;
  VoidCallback? onConnected;
  VoidCallback? onDisconnected;
  VoidCallback? onRemoteRestart;

  NetworkRole get role => _role;
  bool get isConnected => _clientSocket != null;

  static Future<String?> getLocalIpAddress() async {
    try {
      final interfaces = await NetworkInterface.list(
        type: InternetAddressType.IPv4,
        includeLinkLocal: false,
      );
      for (final interface in interfaces) {
        for (final addr in interface.addresses) {
          if (!addr.isLoopback) {
            return addr.address;
          }
        }
      }
    } catch (e) {
      debugPrint('Erreur recherche IP: $e');
    }
    return null;
  }

  Future<bool> startHost({int port = 8888}) async {
    try {
      await disconnect();
      _role = NetworkRole.host;
      _serverSocket = await ServerSocket.bind(InternetAddress.anyIPv4, port);

      _serverSocket!.listen((socket) {
        if (_clientSocket != null) {
          socket.destroy();
          return;
        }
        _clientSocket = socket;
        _setupSocketListener(socket);
        onConnected?.call();
      });

      return true;
    } catch (e) {
      debugPrint('Erreur startHost: $e');
      _role = NetworkRole.none;
      return false;
    }
  }

  Future<bool> connectToHost(String hostIp, {int port = 8888}) async {
    try {
      await disconnect();
      _role = NetworkRole.client;
      _clientSocket = await Socket.connect(hostIp, port, timeout: const Duration(seconds: 5));
      _setupSocketListener(_clientSocket!);
      onConnected?.call();
      return true;
    } catch (e) {
      debugPrint('Erreur connectToHost: $e');
      _role = NetworkRole.none;
      return false;
    }
  }

  void _setupSocketListener(Socket socket) {
    socket.listen(
      (data) {
        final raw = utf8.decode(data).trim();
        final lines = raw.split('\n');
        for (final line in lines) {
          if (line.isEmpty) continue;
          try {
            final jsonMap = jsonDecode(line);
            _handleMessage(jsonMap);
          } catch (e) {
            debugPrint('Erreur décodage message: $e');
          }
        }
      },
      onDone: () => _handleDisconnection(),
      onError: (e) => _handleDisconnection(),
    );
  }

  void _handleMessage(Map<String, dynamic> msg) {
    final type = msg['type'];
    if (type == 'MOVE') {
      final col = msg['col'] as int?;
      if (col != null) {
        onRemoteMove?.call(col);
      }
    } else if (type == 'RESTART') {
      onRemoteRestart?.call();
    }
  }

  void sendMove(int col) {
    _sendMessage({'type': 'MOVE', 'col': col});
  }

  void sendRestart() {
    _sendMessage({'type': 'RESTART'});
  }

  void _sendMessage(Map<String, dynamic> data) {
    if (_clientSocket != null) {
      try {
        final payload = '${jsonEncode(data)}\n';
        _clientSocket!.write(payload);
      } catch (e) {
        debugPrint('Erreur envoi message: $e');
      }
    }
  }

  void _handleDisconnection() {
    _clientSocket = null;
    onDisconnected?.call();
  }

  Future<void> disconnect() async {
    _clientSocket?.destroy();
    _clientSocket = null;
    await _serverSocket?.close();
    _serverSocket = null;
    _role = NetworkRole.none;
  }
}
