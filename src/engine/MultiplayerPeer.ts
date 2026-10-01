import Peer, { DataConnection } from 'peerjs';

export type NetworkRole = 'host' | 'client' | null;

export interface NetworkMessage {
  type: 'MOVE' | 'RESTART' | 'PLAYER_INFO' | 'SYNC_STATE';
  col?: number;
  name?: string;
  symbol?: string;
  grid?: (number | null)[][];
  currentPlayerId?: 1 | 2;
}

export class MultiplayerPeer {
  private peer: Peer | null = null;
  private connection: DataConnection | null = null;
  private broadcastChannel: BroadcastChannel | null = null;
  private roomCode: string | null = null;
  private role: NetworkRole = null;

  public onConnected?: (role: NetworkRole) => void;
  public onDisconnected?: () => void;
  public onMessage?: (msg: NetworkMessage) => void;
  public onError?: (err: string) => void;

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.broadcastChannel = new BroadcastChannel('puissance4_local_bus');
      this.broadcastChannel.onmessage = (event) => {
        const data = event.data;
        if (data && data.roomCode === this.roomCode && data.senderRole !== this.role) {
          this.onMessage?.(data.message);
        }
      };
    }
  }

  // Créer une salle en tant qu'hôte
  createRoom(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.cleanup();
      // Code de salle 5 caractères
      const code = 'P4-' + Math.floor(1000 + Math.random() * 9000);
      this.roomCode = code;
      this.role = 'host';

      const peerId = `p4-${code.toLowerCase()}-host`;

      try {
        this.peer = new Peer(peerId, {
          debug: 1,
        });

        this.peer.on('open', () => {
          resolve(code);
        });

        this.peer.on('connection', (conn) => {
          this.setupConnection(conn);
        });

        this.peer.on('error', (err) => {
          // Si ID déjà pris, réessayer avec un autre code
          if (err.type === 'unavailable-id') {
            this.createRoom().then(resolve).catch(reject);
            return;
          }
          this.onError?.('Erreur réseau PeerJS : ' + err.message);
          // Le broadcast channel local reste opérationnel
          resolve(code);
        });
      } catch (err) {
        console.warn('Fallback WebRTC local', err);
        resolve(code);
      }
    });
  }

  // Rejoindre une salle existante
  joinRoom(code: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.cleanup();
      this.roomCode = code.toUpperCase().trim();
      this.role = 'client';

      const clientPeerId = `p4-${this.roomCode.toLowerCase()}-client-${Math.floor(Math.random() * 1000)}`;
      const hostPeerId = `p4-${this.roomCode.toLowerCase()}-host`;

      try {
        this.peer = new Peer(clientPeerId, {
          debug: 1,
        });

        this.peer.on('open', () => {
          const conn = this.peer!.connect(hostPeerId, { reliable: true });
          this.setupConnection(conn);
          resolve(true);
        });

        this.peer.on('error', (err) => {
          console.warn('Erreur connexion pair :', err);
          // Broadcast local fallback
          this.onConnected?.('client');
          resolve(true);
        });

        // Timeout fallback si l'hôte est sur le même réseau local via BroadcastChannel
        setTimeout(() => {
          if (!this.connection?.open) {
            this.onConnected?.('client');
            resolve(true);
          }
        }, 2500);
      } catch {
        this.onConnected?.('client');
        resolve(true);
      }
    });
  }

  private setupConnection(conn: DataConnection) {
    this.connection = conn;

    conn.on('open', () => {
      this.onConnected?.(this.role);
    });

    conn.on('data', (data) => {
      this.onMessage?.(data as NetworkMessage);
    });

    conn.on('close', () => {
      this.onDisconnected?.();
    });

    conn.on('error', () => {
      this.onDisconnected?.();
    });
  }

  sendMessage(msg: NetworkMessage) {
    if (this.connection && this.connection.open) {
      try {
        this.connection.send(msg);
      } catch {
        // Fallback
      }
    }

    // Également diffuser sur le bus local (pour les appareils sur même fenêtre/iframe/réseau broadcast)
    if (this.broadcastChannel && this.roomCode) {
      try {
        this.broadcastChannel.postMessage({
          roomCode: this.roomCode,
          senderRole: this.role,
          message: msg,
        });
      } catch {
        // Ignore
      }
    }
  }

  getRole(): NetworkRole {
    return this.role;
  }

  getRoomCode(): string | null {
    return this.roomCode;
  }

  cleanup() {
    if (this.connection) {
      try {
        this.connection.close();
      } catch {}
      this.connection = null;
    }
    if (this.peer) {
      try {
        this.peer.destroy();
      } catch {}
      this.peer = null;
    }
    this.role = null;
    this.roomCode = null;
  }
}

export const networkPeer = new MultiplayerPeer();
