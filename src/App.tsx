import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Connect4Engine } from './engine/Connect4Engine';
import { GameBoard } from './components/GameBoard';
import { TerminalView } from './components/TerminalView';
import { SettingsModal } from './components/SettingsModal';
import { ShareModal } from './components/ShareModal';
import { NetworkGameModal } from './components/NetworkGameModal';
import { AIVsAIControls } from './components/AIVsAIControls';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import { TournamentBanner } from './components/TournamentBanner';
import { TournamentModal } from './components/TournamentModal';
import { networkPeer, NetworkRole, NetworkMessage } from './engine/MultiplayerPeer';
import { sounds } from './engine/audio';
import {
  GameMode,
  PlayerConfig,
  AIDifficulty,
  Position,
  GameStats,
  BoardTheme,
  TournamentState,
} from './types';
import {
  Users,
  Bot,
  RotateCcw,
  Undo2,
  Sliders,
  Terminal,
  LayoutGrid,
  Volume2,
  VolumeX,
  HelpCircle,
  Trophy,
  Sparkles,
  Info,
  Share2,
  Wifi,
  Clock,
  Smartphone,
  Maximize,
  Minimize,
  Flame,
  Shield,
  Swords,
} from 'lucide-react';

export default function App() {
  const [engine, setEngine] = useState<Connect4Engine>(() => new Connect4Engine());
  const [grid, setGrid] = useState<(number | null)[][]>(() => engine.getGrid().map((r) => [...r]));
  const [winningPositions, setWinningPositions] = useState<Position[]>([]);
  const [gameMode, setGameMode] = useState<GameMode>('PVE'); // Default: Joueur vs IA
  const [currentPlayerId, setCurrentPlayerId] = useState<1 | 2>(1);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [winner, setWinner] = useState<PlayerConfig | null>(null);
  const [isDraw, setIsDraw] = useState<boolean>(false);
  const [isAIThinking, setIsAIThinking] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'board' | 'terminal'>('board');
  const [theme, setTheme] = useState<BoardTheme>('classic');
  const [blitzTime, setBlitzTime] = useState<number>(0); // 0 = désactivé, 15 ou 30s
  const [blitzRemaining, setBlitzRemaining] = useState<number>(0);
  const [isPassAndPlay, setIsPassAndPlay] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Modales
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isRulesOpen, setIsRulesOpen] = useState<boolean>(false);
  const [isShareOpen, setIsShareOpen] = useState<boolean>(false);
  const [isNetworkModalOpen, setIsNetworkModalOpen] = useState<boolean>(false);
  const [isTournamentModalOpen, setIsTournamentModalOpen] = useState<boolean>(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(true);

  // Mode Tournoi (Série de 3 ou 5 matchs)
  const [tournament, setTournament] = useState<TournamentState>({
    isActive: false,
    totalMatches: 3,
    currentRound: 1,
    p1Wins: 0,
    p2Wins: 0,
    draws: 0,
    roundHistory: [],
    isCompleted: false,
    champion: null,
  });

  // IA vs IA Demo Controls
  const [isDemoPlaying, setIsDemoPlaying] = useState<boolean>(false);
  const [demoSpeed, setDemoSpeed] = useState<number>(400);

  // Multijoueur Réseau / En ligne
  const [networkRole, setNetworkRole] = useState<NetworkRole>(null);
  const [networkRoomCode, setNetworkRoomCode] = useState<string | null>(null);

  // Joueurs
  const [player1, setPlayer1] = useState<PlayerConfig>({
    id: 1,
    name: 'Joueur 1',
    symbol: 'X',
    color: 'rose',
    isAI: false,
    difficulty: 'STANDARD',
  });

  const [player2, setPlayer2] = useState<PlayerConfig>({
    id: 2,
    name: 'Ordinateur',
    symbol: 'O',
    color: 'amber',
    isAI: true,
    difficulty: 'EXPERT',
  });

  const [stats, setStats] = useState<GameStats>(() => {
    try {
      const saved = localStorage.getItem('puissance4_stats');
      if (saved) return JSON.parse(saved);
    } catch {}
    return { p1Wins: 0, p2Wins: 0, draws: 0, totalGames: 0 };
  });

  const [bestStreak, setBestStreak] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('puissance4_best_streak');
      if (saved) return Number(saved);
    } catch {}
    return 0;
  });

  const [aiRecords, setAiRecords] = useState<{ STANDARD: number; EXPERT: number; MAITRE: number }>(() => {
    try {
      const saved = localStorage.getItem('puissance4_ai_records');
      if (saved) return JSON.parse(saved);
    } catch {}
    return { STANDARD: 0, EXPERT: 0, MAITRE: 0 };
  });

  const [lastMove, setLastMove] = useState<{ row: number; col: number } | null>(null);

  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    'Puissance 4 - Version Mobile & Réseau prête.',
    'Mode sélectionné : Joueur vs IA (Expert).',
    'Bonne partie !',
  ]);

  const moveHistoryRef = useRef<{ col: number; playerId: 1 | 2 }[]>([]);
  const isGameOverRef = useRef<boolean>(false);
  const isAIThinkingRef = useRef<boolean>(false);
  const [streak, setStreak] = useState<number>(0);

  // Sauvegarder les stats dans localStorage
  useEffect(() => {
    try {
      localStorage.setItem('puissance4_stats', JSON.stringify(stats));
    } catch {}
  }, [stats]);

  useEffect(() => {
    try {
      localStorage.setItem('puissance4_best_streak', String(bestStreak));
    } catch {}
  }, [bestStreak]);

  useEffect(() => {
    try {
      localStorage.setItem('puissance4_ai_records', JSON.stringify(aiRecords));
    } catch {}
  }, [aiRecords]);

  const addLog = useCallback((msg: string) => {
    setTerminalLogs((prev) => [...prev.slice(-30), msg]);
  }, []);

  const currentPlayer = currentPlayerId === 1 ? player1 : player2;

  // Lancer une explosion de confettis festifs
  const fireConfetti = useCallback(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ef4444', '#fbbf24', '#3b82f6', '#10b981', '#a855f7'],
      });
    } catch {}
  }, []);

  // Déclencher vibration haptique
  const triggerHaptic = (pattern: number[]) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {}
    }
  };

  // Drop Disc Action
  const handleDropDisc = useCallback(
    (col: number, isFromRemote: boolean = false, isFromAI: boolean = false) => {
      if (isGameOverRef.current) return;
      if (isAIThinkingRef.current && !isFromAI) return;

      // Si mode réseau actif et ce n'est pas notre tour (et coup local)
      if (gameMode === 'ONLINE' && !isFromRemote) {
        if (networkRole === 'host' && currentPlayerId !== 1) return;
        if (networkRole === 'client' && currentPlayerId !== 2) return;
      }

      const pId = currentPlayerId;
      const result = engine.placer(pId, col);
      if (!result) return;

      setLastMove({ row: result.row, col });
      sounds.playDrop(result.row);
      triggerHaptic([35]);

      // Si coup local en mode ONLINE, transmettre au pair
      if (gameMode === 'ONLINE' && !isFromRemote) {
        networkPeer.sendMessage({
          type: 'MOVE',
          col,
        });
      }

      moveHistoryRef.current.push({ col, playerId: pId });
      setGrid(engine.getGrid().map((r) => [...r]));

      const pConfig = pId === 1 ? player1 : player2;
      addLog(`${pConfig.name} (${pConfig.symbol}) a joué dans la colonne ${col}.`);

      // Vérification de victoire
      const winPositions = engine.verifierVictoire(pId);
      if (winPositions) {
        setWinningPositions(winPositions);
        setIsGameOver(true);
        isGameOverRef.current = true;
        setWinner(pConfig);
        sounds.playWin();
        triggerHaptic([50, 40, 100, 50, 150]);
        fireConfetti();
        addLog(`🎉 Victoire de ${pConfig.name} ! 4 pions connectés !`);

        if (pId === 1) {
          setStreak((s) => {
            const next = s + 1;
            setBestStreak((b) => Math.max(b, next));
            if (gameMode === 'PVE') {
              const currentDiff = player2.difficulty || 'EXPERT';
              setAiRecords((prev) => ({
                ...prev,
                [currentDiff]: Math.max(prev[currentDiff] || 0, next),
              }));
            }
            return next;
          });
        } else {
          setStreak(0);
        }

        setStats((s) => ({
          ...s,
          p1Wins: pId === 1 ? s.p1Wins + 1 : s.p1Wins,
          p2Wins: pId === 2 ? s.p2Wins + 1 : s.p2Wins,
          totalGames: s.totalGames + 1,
        }));

        // Mise à jour de la série de tournoi si actif
        setTournament((t) => {
          if (!t.isActive) return t;
          const nextP1 = pId === 1 ? t.p1Wins + 1 : t.p1Wins;
          const nextP2 = pId === 2 ? t.p2Wins + 1 : t.p2Wins;
          const targetWins = Math.ceil(t.totalMatches / 2);
          const nextHistory = [
            ...t.roundHistory,
            { round: t.currentRound, winnerId: pId, winnerName: pConfig.name },
          ];
          const isOver =
            nextP1 >= targetWins ||
            nextP2 >= targetWins ||
            nextP1 + nextP2 + t.draws >= t.totalMatches;
          const champion = isOver
            ? nextP1 > nextP2
              ? player1
              : nextP2 > nextP1
              ? player2
              : 'draw'
            : null;

          if (isOver) {
            setTimeout(() => {
              setIsTournamentModalOpen(true);
              fireConfetti();
            }, 1000);
          }

          return {
            ...t,
            p1Wins: nextP1,
            p2Wins: nextP2,
            roundHistory: nextHistory,
            currentRound: t.currentRound + 1,
            isCompleted: isOver,
            champion,
          };
        });

        return;
      }

      // Vérification de match nul
      if (engine.estPleine()) {
        setIsGameOver(true);
        isGameOverRef.current = true;
        setIsDraw(true);
        sounds.playDraw();
        triggerHaptic([40, 40]);
        addLog('🤝 Match nul ! La grille est pleine.');
        setStreak(0);
        setStats((s) => ({
          ...s,
          draws: s.draws + 1,
          totalGames: s.totalGames + 1,
        }));

        // Tournoi match nul
        setTournament((t) => {
          if (!t.isActive) return t;
          const nextDraws = t.draws + 1;
          const targetWins = Math.ceil(t.totalMatches / 2);
          const nextHistory = [
            ...t.roundHistory,
            { round: t.currentRound, winnerId: 'draw' as const, winnerName: 'Match Nul' },
          ];
          const isOver =
            t.p1Wins >= targetWins ||
            t.p2Wins >= targetWins ||
            t.p1Wins + t.p2Wins + nextDraws >= t.totalMatches;
          const champion = isOver
            ? t.p1Wins > t.p2Wins
              ? player1
              : t.p2Wins > t.p1Wins
              ? player2
              : 'draw'
            : null;

          if (isOver) {
            setTimeout(() => {
              setIsTournamentModalOpen(true);
              fireConfetti();
            }, 1000);
          }

          return {
            ...t,
            draws: nextDraws,
            roundHistory: nextHistory,
            currentRound: t.currentRound + 1,
            isCompleted: isOver,
            champion,
          };
        });

        return;
      }

      // Passer au joueur suivant
      setCurrentPlayerId((prev) => (prev === 1 ? 2 : 1));
      if (blitzTime > 0) {
        setBlitzRemaining(blitzTime);
      }
    },
    [
      currentPlayerId,
      engine,
      player1,
      player2,
      gameMode,
      networkRole,
      blitzTime,
      addLog,
      fireConfetti,
    ]
  );

  // Reset Game
  const resetGame = (overrideMode?: GameMode, sendRemote: boolean = true) => {
    sounds.playClick();
    const newEngine = new Connect4Engine();
    setEngine(newEngine);
    setGrid(newEngine.getGrid().map((r) => [...r]));
    setWinningPositions([]);
    setIsGameOver(false);
    isGameOverRef.current = false;
    isAIThinkingRef.current = false;
    setWinner(null);
    setIsDraw(false);
    setIsAIThinking(false);
    setLastMove(null);
    setCurrentPlayerId(1);
    moveHistoryRef.current = [];

    if (blitzTime > 0) {
      setBlitzRemaining(blitzTime);
    }

    if (gameMode === 'ONLINE' && sendRemote) {
      networkPeer.sendMessage({ type: 'RESTART' });
    }

    const mode = overrideMode || gameMode;
    const p1Name = mode === 'EVE' ? 'IA Alpha' : player1.name;
    const p2Name = mode === 'PVE' ? 'Ordinateur' : mode === 'EVE' ? 'IA Beta' : player2.name;

    addLog(`Nouvelle partie entre ${p1Name} (${player1.symbol}) et ${p2Name} (${player2.symbol}).`);
  };

  const startTournament = (totalMatches: 3 | 5) => {
    sounds.playClick();
    setTournament({
      isActive: true,
      totalMatches,
      currentRound: 1,
      p1Wins: 0,
      p2Wins: 0,
      draws: 0,
      roundHistory: [],
      isCompleted: false,
      champion: null,
    });
    resetGame();
    addLog(`🏆 Mode Tournoi lancé : Série de ${totalMatches} matchs !`);
  };

  const abortTournament = () => {
    sounds.playClick();
    setTournament((t) => ({ ...t, isActive: false, isCompleted: false }));
    addLog('Mode Tournoi interrompu.');
  };

  // Change Game Mode
  const handleModeChange = (mode: GameMode) => {
    sounds.playClick();
    setGameMode(mode);
    setIsDemoPlaying(false);

    if (mode === 'PVP') {
      setPlayer1((p) => ({ ...p, name: 'Joueur 1', isAI: false }));
      setPlayer2((p) => ({ ...p, name: 'Joueur 2', isAI: false }));
      addLog('Mode changé : Joueur vs Joueur (Local).');
    } else if (mode === 'PVE') {
      setPlayer1((p) => ({ ...p, name: 'Joueur 1', isAI: false }));
      setPlayer2((p) => ({ ...p, name: 'Ordinateur', isAI: true }));
      addLog(`Mode changé : Joueur vs IA (${player2.difficulty || 'EXPERT'}).`);
    } else if (mode === 'EVE') {
      setPlayer1((p) => ({ ...p, name: 'IA Alpha', isAI: true, difficulty: 'STANDARD' }));
      setPlayer2((p) => ({ ...p, name: 'IA Beta', isAI: true, difficulty: 'EXPERT' }));
      addLog('Mode changé : IA vs IA (Démo).');
    } else if (mode === 'ONLINE') {
      setPlayer1((p) => ({ ...p, name: 'Hôte (J1)', isAI: false }));
      setPlayer2((p) => ({ ...p, name: 'Invité (J2)', isAI: false }));
      setIsNetworkModalOpen(true);
      addLog('Mode Multijoueur Réseau / 2 Téléphones.');
    }

    resetGame(mode, false);
  };

  // Undo Move (Annuler Coup)
  const handleUndo = () => {
    if (moveHistoryRef.current.length === 0 || isAIThinking || gameMode === 'ONLINE') return;
    sounds.playClick();

    if (gameMode === 'PVE') {
      if (!isGameOver && currentPlayerId === 1 && moveHistoryRef.current.length >= 2) {
        const lastAI = moveHistoryRef.current.pop()!;
        engine.annulerCoup(lastAI.col);
        const lastHuman = moveHistoryRef.current.pop()!;
        engine.annulerCoup(lastHuman.col);
      } else {
        const last = moveHistoryRef.current.pop()!;
        engine.annulerCoup(last.col);
        setCurrentPlayerId(last.playerId);
      }
    } else {
      const last = moveHistoryRef.current.pop()!;
      engine.annulerCoup(last.col);
      setCurrentPlayerId(last.playerId);
    }

    setGrid(engine.getGrid().map((r) => [...r]));
    setWinningPositions([]);
    setIsGameOver(false);
    setWinner(null);
    setIsDraw(false);
    addLog('Dernier coup annulé.');
  };

  // Gestion de la réception réseau (WebRTC / Broadcast)
  useEffect(() => {
    networkPeer.onMessage = (msg: NetworkMessage) => {
      if (msg.type === 'MOVE' && typeof msg.col === 'number') {
        handleDropDisc(msg.col, true);
      } else if (msg.type === 'RESTART') {
        resetGame(undefined, false);
        addLog('L\'adversaire a relancé la partie.');
      }
    };

    networkPeer.onConnected = (role) => {
      setNetworkRole(role);
      addLog(`Connecté à la salle réseau en tant que ${role === 'host' ? 'Hôte (J1)' : 'Invité (J2)'}.`);
    };

    networkPeer.onDisconnected = () => {
      addLog('Déconnexion du réseau.');
    };
  }, [handleDropDisc, addLog]);

  // Détecter un paramètre ?room= dans l'URL pour rejoindre direct
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const room = params.get('room');
      if (room) {
        setGameMode('ONLINE');
        setNetworkRoomCode(room.toUpperCase());
        networkPeer.joinRoom(room).then(() => {
          setNetworkRole('client');
          addLog(`Rejoint la salle ${room} via lien partagé !`);
        });
      }
    }
  }, [addLog]);

  // AI Turn Handling (Ultra rapide, <500ms garanti)
  useEffect(() => {
    if (isGameOver) return;

    const currPlayer = currentPlayerId === 1 ? player1 : player2;

    if (currPlayer.isAI && gameMode !== 'ONLINE') {
      setIsAIThinking(true);
      isAIThinkingRef.current = true;
      const diff = currPlayer.difficulty || 'EXPERT';
      const delay = gameMode === 'EVE' ? Math.min(demoSpeed, 200) : 200;

      const timer = setTimeout(() => {
        try {
          const bestCol = engine.choisirCoupIA(currentPlayerId, diff);
          isAIThinkingRef.current = false;
          setIsAIThinking(false);

          if (bestCol !== -1 && engine.ouValide(bestCol)) {
            handleDropDisc(bestCol, false, true);
          }
        } catch (err) {
          console.error('Erreur IA:', err);
          isAIThinkingRef.current = false;
          setIsAIThinking(false);
        }
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [currentPlayerId, isGameOver, player1, player2, engine, handleDropDisc, gameMode, demoSpeed]);

  // IA vs IA Demo loop
  useEffect(() => {
    if (gameMode !== 'EVE' || !isDemoPlaying || isGameOver || isAIThinking) return;

    const timer = setTimeout(() => {
      const currP = currentPlayerId === 1 ? player1 : player2;
      const bestCol = engine.choisirCoupIA(currentPlayerId, currP.difficulty || 'EXPERT');
      if (bestCol !== -1 && engine.ouValide(bestCol)) {
        handleDropDisc(bestCol, false, true);
      }
    }, demoSpeed);

    return () => clearTimeout(timer);
  }, [gameMode, isDemoPlaying, isGameOver, isAIThinking, currentPlayerId, player1, player2, engine, demoSpeed, handleDropDisc]);

  // Chronomètre Blitz (décompte par seconde)
  useEffect(() => {
    if (blitzTime === 0 || isGameOver || isAIThinking) return;

    if (blitzRemaining <= 0) {
      // Temps écoulé : coup forcé aléatoire ou premier coup valide
      const valid = engine.getValidColumns();
      if (valid.length > 0) {
        addLog(`Temps écoulé pour ${currentPlayer.name} ! Coup automatique joué.`);
        handleDropDisc(valid[Math.floor(Math.random() * valid.length)]);
      }
      return;
    }

    const interval = setInterval(() => {
      setBlitzRemaining((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [blitzTime, blitzRemaining, isGameOver, isAIThinking, engine, currentPlayer, handleDropDisc, addLog]);

  const toggleSound = () => {
    const next = !isSoundEnabled;
    setIsSoundEnabled(next);
    sounds.enabled = next;
    if (next) sounds.playClick();
  };

  const toggleFullscreen = () => {
    sounds.playClick();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-rose-500 selection:text-white pb-6">
      <OfflineIndicator />

      {/* Top Header Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-900/70 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-3 sm:px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-rose-500 to-amber-500 p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center font-black text-rose-400 text-sm sm:text-base">
                4
              </div>
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-1.5 sm:gap-2">
                Puissance 4
                <span className="text-[9px] sm:text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  {gameMode === 'ONLINE' ? 'Réseau' : 'Mobile'}
                </span>
              </h1>
            </div>
          </div>

          {/* Quick Toolbar */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {/* Install PWA Button */}
            <PWAInstallButton />

            {/* Tournament Mode Button */}
            <button
              onClick={() => {
                sounds.playClick();
                setIsTournamentModalOpen(true);
              }}
              className={`p-2 rounded-xl border transition-all ${
                tournament.isActive
                  ? 'bg-amber-600/30 text-amber-400 border-amber-500/60 shadow-[0_0_10px_rgba(251,191,36,0.4)]'
                  : 'border-slate-800 bg-slate-900/80 text-amber-400 hover:text-amber-300 hover:border-slate-700'
              }`}
              title={tournament.isActive ? 'Gérer le tournoi en cours' : 'Lancer un tournoi (3 ou 5 matchs)'}
            >
              <Swords className="w-4 h-4" />
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-xl border border-slate-800 bg-slate-900/80 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
              title={isFullscreen ? 'Quitter plein écran' : 'Mode Plein écran'}
            >
              {isFullscreen ? <Minimize className="w-4 h-4 text-amber-400" /> : <Maximize className="w-4 h-4" />}
            </button>

            {/* Share / QR Code */}
            <button
              onClick={() => {
                sounds.playClick();
                setIsShareOpen(true);
              }}
              className="p-2 rounded-xl border border-slate-800 bg-slate-900/80 text-blue-400 hover:text-white hover:border-slate-700 transition-colors"
              title="Partager ou afficher le QR Code"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {/* View Mode Toggle: Board vs Terminal */}
            <button
              onClick={() => {
                sounds.playClick();
                setViewMode((v) => (v === 'board' ? 'terminal' : 'board'));
              }}
              className={`p-2 rounded-xl border transition-all ${
                viewMode === 'terminal'
                  ? 'bg-emerald-600/30 text-emerald-400 border-emerald-500/50'
                  : 'border-slate-800 bg-slate-900/80 text-slate-400 hover:text-slate-200'
              }`}
              title="Basculer entre le plateau et le Terminal C++"
            >
              {viewMode === 'board' ? <Terminal className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
            </button>

            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              className="p-2 rounded-xl border border-slate-800 bg-slate-900/80 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
              title={isSoundEnabled ? 'Couper le son' : 'Activer le son'}
            >
              {isSoundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>

            {/* Settings */}
            <button
              onClick={() => {
                sounds.playClick();
                setIsSettingsOpen(true);
              }}
              className="p-2 rounded-xl border border-slate-800 bg-slate-900/80 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
              title="Paramètres & Thèmes"
            >
              <Sliders className="w-4 h-4" />
            </button>

            {/* Rules */}
            <button
              onClick={() => {
                sounds.playClick();
                setIsRulesOpen(true);
              }}
              className="p-2 rounded-xl border border-slate-800 bg-slate-900/80 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
              title="Règles"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Area */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-3 sm:px-4 py-4 sm:py-5 flex flex-col items-center gap-4">
        {/* Tournament In-Game Banner */}
        {tournament.isActive && (
          <TournamentBanner
            tournament={tournament}
            player1={player1}
            player2={player2}
            onAbortTournament={abortTournament}
          />
        )}

        {/* Game Mode Selector Tabs */}
        <div className="w-full max-w-md sm:max-w-xl grid grid-cols-4 p-1 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-inner gap-1">
          {[
            { id: 'PVP', label: '1 Téléphone', icon: Users },
            { id: 'ONLINE', label: '2 Écrans (Wi-Fi)', icon: Wifi },
            { id: 'PVE', label: 'Contre IA', icon: Bot },
            { id: 'EVE', label: 'IA Démo', icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = gameMode === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleModeChange(tab.id as GameMode)}
                className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-1.5 sm:py-2 px-1 rounded-xl text-[10px] sm:text-xs font-semibold transition-all ${
                  active
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Quick AI Difficulty Selector (Directement accessible sur l'écran en mode Joueur vs IA) */}
        {gameMode === 'PVE' && (
          <div className="w-full max-w-md sm:max-w-xl bg-slate-900/90 border border-slate-800 rounded-2xl px-3 py-2 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-sm animate-in fade-in">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 w-full sm:w-auto justify-between sm:justify-start">
              <div className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-purple-400" />
                <span>Niveau IA :</span>
              </div>
              <span className="text-[11px] text-amber-400 font-semibold bg-amber-950/40 px-2 py-0.5 rounded-lg border border-amber-500/20">
                🏆 Record {player2.difficulty === 'MAITRE' ? 'Maître' : player2.difficulty === 'STANDARD' ? 'Standard' : 'Expert'} :{' '}
                <strong>{aiRecords[player2.difficulty || 'EXPERT']}</strong> vict.
              </span>
            </div>
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800/80 w-full sm:w-auto justify-center">
              {[
                { id: 'STANDARD', label: 'Standard', desc: 'Facile' },
                { id: 'EXPERT', label: 'Expert', desc: 'Moyen+' },
                { id: 'MAITRE', label: 'Maître', desc: 'Pro' },
              ].map((lvl) => {
                const isSelected = (player2.difficulty || 'EXPERT') === lvl.id;
                return (
                  <button
                    key={lvl.id}
                    onClick={() => {
                      sounds.playClick();
                      setPlayer2((p) => ({ ...p, difficulty: lvl.id as AIDifficulty }));
                      addLog(`Difficulté IA changée : ${lvl.label}`);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {lvl.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Room badge in ONLINE mode */}
        {gameMode === 'ONLINE' && (
          <div className="w-full max-w-md sm:max-w-xl bg-blue-950/40 border border-blue-500/30 rounded-2xl p-2.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-300 font-medium">
                {networkRoomCode ? `Salle : ${networkRoomCode}` : 'Aucune salle active'} • Rôle :{' '}
                <strong className="text-white">
                  {networkRole === 'host' ? 'Hôte (Rouge)' : networkRole === 'client' ? 'Invité (Jaune)' : 'En attente'}
                </strong>
              </span>
            </div>
            <button
              onClick={() => setIsNetworkModalOpen(true)}
              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold text-[11px]"
            >
              Gérer salle
            </button>
          </div>
        )}

        {/* Blitz Countdown Timer Banner (if enabled) */}
        {blitzTime > 0 && !isGameOver && (
          <div className="w-full max-w-md sm:max-w-xl bg-slate-900 border border-amber-500/40 rounded-2xl p-2 flex items-center gap-3">
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="flex-1">
              <div className="flex justify-between text-[11px] font-semibold text-slate-300 mb-1">
                <span>Temps de réflexion :</span>
                <span className={blitzRemaining <= 5 ? 'text-red-400 font-bold animate-pulse' : 'text-amber-400'}>
                  {blitzRemaining}s
                </span>
              </div>
              <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ${
                    blitzRemaining <= 5 ? 'bg-red-500' : 'bg-amber-400'
                  }`}
                  style={{ width: `${(blitzRemaining / blitzTime) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Players Card & Status */}
        <div className="w-full max-w-md sm:max-w-xl bg-slate-900/90 border border-slate-800 rounded-3xl p-3 sm:p-4 shadow-xl flex items-center justify-between gap-2">
          {/* Player 1 Card */}
          <div
            className={`flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1.5 sm:py-2 rounded-2xl border transition-all ${
              currentPlayerId === 1 && !isGameOver
                ? 'bg-rose-950/40 border-rose-500/60 ring-2 ring-rose-500/30'
                : 'bg-slate-950/50 border-slate-800'
            }`}
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold text-xs sm:text-sm shadow-md">
              {player1.symbol}
            </div>
            <div>
              <div className="text-[11px] sm:text-xs font-bold text-slate-200 truncate max-w-[80px] sm:max-w-none">
                {player1.name}
              </div>
              <div className="text-[10px] text-slate-400">{stats.p1Wins} vict.</div>
            </div>
          </div>

          {/* Center Banner / Status */}
          <div className="flex flex-col items-center text-center px-1">
            {isGameOver ? (
              winner ? (
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs sm:text-sm animate-bounce">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>{winner.name} gagne !</span>
                </div>
              ) : (
                <div className="text-amber-400 font-bold text-xs sm:text-sm">🤝 Match Nul !</div>
              )
            ) : isAIThinking ? (
              <div className="flex items-center gap-1.5 text-purple-400 font-semibold text-xs animate-pulse">
                <Bot className="w-3.5 h-3.5 animate-spin" />
                <span>IA réfléchit...</span>
              </div>
            ) : (
              <div className="text-[11px] sm:text-xs text-slate-300 font-medium">
                Tour :{' '}
                <span className={`font-bold ${currentPlayerId === 1 ? 'text-rose-400' : 'text-amber-400'}`}>
                  {currentPlayer.name}
                </span>
              </div>
            )}
            <div className="flex flex-wrap items-center justify-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
              <span>Parties : {stats.totalGames}</span>
              {streak > 1 && (
                <span className="flex items-center gap-0.5 text-amber-400 font-bold bg-amber-950/60 px-1.5 py-0.5 rounded-full border border-amber-500/30">
                  <Flame className="w-3 h-3 text-amber-500 fill-amber-500" /> {streak} d'affilée !
                </span>
              )}
              {bestStreak > 1 && (
                <span className="text-slate-400 font-medium">
                  (Record : {bestStreak})
                </span>
              )}
            </div>
          </div>

          {/* Player 2 Card */}
          <div
            className={`flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1.5 sm:py-2 rounded-2xl border transition-all ${
              currentPlayerId === 2 && !isGameOver
                ? 'bg-amber-950/40 border-amber-500/60 ring-2 ring-amber-500/30'
                : 'bg-slate-950/50 border-slate-800'
            }`}
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-xs sm:text-sm shadow-md">
              {player2.symbol}
            </div>
            <div>
              <div className="text-[11px] sm:text-xs font-bold text-slate-200 flex items-center gap-1">
                <span>{player2.name}</span>
                {player2.isAI && (
                  <button
                    onClick={() => {
                      sounds.playClick();
                      const nextDiff: AIDifficulty =
                        player2.difficulty === 'STANDARD'
                          ? 'EXPERT'
                          : player2.difficulty === 'EXPERT'
                          ? 'MAITRE'
                          : 'STANDARD';
                      setPlayer2((p) => ({ ...p, difficulty: nextDiff }));
                      addLog(`Difficulté IA changée : ${nextDiff}`);
                    }}
                    className="text-[9px] px-1.5 py-0.5 bg-purple-900/80 hover:bg-purple-800 text-purple-200 rounded font-semibold border border-purple-500/40 cursor-pointer active:scale-95"
                    title="Cliquez pour changer la difficulté"
                  >
                    {player2.difficulty || 'EXPERT'}
                  </button>
                )}
              </div>
              <div className="text-[10px] text-slate-400">{stats.p2Wins} vict.</div>
            </div>
          </div>
        </div>

        {/* AI vs AI Special Demo Controls */}
        {gameMode === 'EVE' && (
          <AIVsAIControls
            isPlaying={isDemoPlaying}
            onTogglePlay={() => setIsDemoPlaying((p) => !p)}
            onStepMove={() => {
              if (isGameOver || isAIThinking) return;
              const p = currentPlayerId === 1 ? player1 : player2;
              const bestCol = engine.choisirCoupIA(currentPlayerId, p.difficulty || 'EXPERT');
              if (bestCol !== -1 && engine.ouValide(bestCol)) {
                handleDropDisc(bestCol);
              }
            }}
            speed={demoSpeed}
            onSpeedChange={setDemoSpeed}
            player1={player1}
            player2={player2}
            onUpdateP1Diff={(diff) => setPlayer1((p) => ({ ...p, difficulty: diff }))}
            onUpdateP2Diff={(diff) => setPlayer2((p) => ({ ...p, difficulty: diff }))}
            isGameOver={isGameOver}
          />
        )}

        {/* Active Board or Terminal */}
        {viewMode === 'board' ? (
          <GameBoard
            grid={grid}
            currentPlayer={currentPlayer}
            player1={player1}
            player2={player2}
            winningPositions={winningPositions}
            isGameOver={isGameOver}
            isAIThinking={isAIThinking}
            theme={theme}
            isPassAndPlay={isPassAndPlay && gameMode === 'PVP'}
            lastMove={lastMove}
            onDropDisc={(col) => handleDropDisc(col)}
          />
        ) : (
          <TerminalView
            grid={grid}
            player1={player1}
            player2={player2}
            currentPlayer={currentPlayer}
            winningPositions={winningPositions}
            isGameOver={isGameOver}
            isAIThinking={isAIThinking}
            logs={terminalLogs}
            onDropDisc={(col) => handleDropDisc(col)}
            onResetGame={() => resetGame()}
          />
        )}

        {/* Game Controls Footer */}
        <div className="flex items-center gap-2 sm:gap-3 mt-1">
          {gameMode !== 'ONLINE' && (
            <button
              onClick={handleUndo}
              disabled={moveHistoryRef.current.length === 0 || isAIThinking}
              className="px-3.5 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 rounded-2xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
            >
              <Undo2 className="w-3.5 h-3.5" /> Annuler
            </button>
          )}

          {tournament.isActive && isGameOver && !tournament.isCompleted ? (
            <button
              onClick={() => resetGame()}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 rounded-2xl text-xs font-black flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95 animate-pulse"
            >
              <Trophy className="w-4 h-4" /> Manche Suivante (Match {Math.min(tournament.currentRound, tournament.totalMatches)} / {tournament.totalMatches})
            </button>
          ) : (
            <button
              onClick={() => resetGame()}
              className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-blue-600/30 transition-all active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Rejouer
            </button>
          )}
        </div>
      </main>

      {/* Tournament Setup & Summary Modal */}
      <TournamentModal
        isOpen={isTournamentModalOpen}
        tournament={tournament}
        player1={player1}
        player2={player2}
        onClose={() => setIsTournamentModalOpen(false)}
        onStartTournament={startTournament}
        onRestartTournament={() => {
          setIsTournamentModalOpen(false);
          startTournament(tournament.totalMatches);
        }}
      />

      {/* Share & QR Code Modal */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        roomCode={networkRoomCode}
      />

      {/* Network Game Modal */}
      <NetworkGameModal
        isOpen={isNetworkModalOpen}
        onClose={() => setIsNetworkModalOpen(false)}
        onConnected={(role, code) => {
          setNetworkRole(role);
          setNetworkRoomCode(code);
          addLog(`Partie réseau prête (Salle ${code})`);
        }}
        activeRoomCode={networkRoomCode}
        onOpenShareModal={() => {
          setIsNetworkModalOpen(false);
          setIsShareOpen(true);
        }}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        player1={player1}
        player2={player2}
        aiDifficulty={player2.difficulty || 'EXPERT'}
        isSoundEnabled={isSoundEnabled}
        theme={theme}
        blitzTime={blitzTime}
        isPassAndPlay={isPassAndPlay}
        onUpdateP1={(u) => setPlayer1((p) => ({ ...p, ...u }))}
        onUpdateP2={(u) => setPlayer2((p) => ({ ...p, ...u }))}
        onUpdateAIDifficulty={(diff) => {
          setPlayer2((p) => ({ ...p, difficulty: diff }));
          addLog(`Difficulté IA mise à jour : ${diff}`);
        }}
        onToggleSound={toggleSound}
        onSelectTheme={(t) => setTheme(t)}
        onSelectBlitzTime={(sec) => {
          setBlitzTime(sec);
          setBlitzRemaining(sec);
        }}
        onTogglePassAndPlay={() => setIsPassAndPlay((prev) => !prev)}
      />

      {/* Rules Modal */}
      {isRulesOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-400" /> Règles & Fonctionnalités
              </h3>
              <button
                onClick={() => setIsRulesOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
              <p>
                <strong>But du jeu :</strong> Aligner 4 jetons de sa couleur horizontalement, verticalement ou en diagonale sur la grille 6x7.
              </p>
              <div className="space-y-1.5 text-xs text-slate-400">
                <div>📱 <strong>Installable sur mobile (PWA) :</strong> Jouez hors-ligne directement depuis votre écran d'accueil.</div>
                <div>📡 <strong>Multijoueur 2 Écrans :</strong> Jouez chacun sur votre smartphone via le code de salle ou le QR Code.</div>
                <div>⚡ <strong>IA Ultra-Rapide :</strong> Minimax optimisé par Bitboards avec réponse en &lt; 500ms.</div>
                <div>⏱️ <strong>Mode Blitz :</strong> Activez une limite de 15s ou 30s par coup dans les paramètres.</div>
                <div>🎨 <strong>3 Thèmes :</strong> Classique, Cyberpunk Néon et Bois Élégant.</div>
              </div>
            </div>
            <button
              onClick={() => setIsRulesOpen(false)}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-semibold mt-2"
            >
              Compris !
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
