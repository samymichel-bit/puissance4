import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Connect4Engine } from './engine/Connect4Engine';
import { GameBoard } from './components/GameBoard';
import { TerminalView } from './components/TerminalView';
import { SettingsModal } from './components/SettingsModal';
import { AIVsAIControls } from './components/AIVsAIControls';
import { sounds } from './engine/audio';
import {
  GameMode,
  PlayerConfig,
  AIDifficulty,
  Position,
  GameStats,
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
  Award,
  Sparkles,
  Info,
} from 'lucide-react';

export default function App() {
  const [engine, setEngine] = useState<Connect4Engine>(() => new Connect4Engine());
  const [grid, setGrid] = useState<(number | null)[][]>(() => engine.getGrid().map(r => [...r]));
  const [winningPositions, setWinningPositions] = useState<Position[]>([]);
  const [gameMode, setGameMode] = useState<GameMode>('PVE'); // Default: Joueur vs IA
  const [currentPlayerId, setCurrentPlayerId] = useState<1 | 2>(1);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [winner, setWinner] = useState<PlayerConfig | null>(null);
  const [isDraw, setIsDraw] = useState<boolean>(false);
  const [isAIThinking, setIsAIThinking] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'board' | 'terminal'>('board');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isRulesOpen, setIsRulesOpen] = useState<boolean>(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(true);

  // IA vs IA Demo Controls
  const [isDemoPlaying, setIsDemoPlaying] = useState<boolean>(false);
  const [demoSpeed, setDemoSpeed] = useState<number>(500);

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

  const [stats, setStats] = useState<GameStats>({
    p1Wins: 0,
    p2Wins: 0,
    draws: 0,
    totalGames: 0,
  });

  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    'Puissance 4 - ICT102 POO initialisé.',
    'Mode sélectionné : Joueur vs IA (Standard/Expert).',
    'Bonne partie !',
  ]);

  const moveHistoryRef = useRef<{ col: number; playerId: 1 | 2 }[]>([]);

  const addLog = useCallback((msg: string) => {
    setTerminalLogs((prev) => [...prev.slice(-30), msg]);
  }, []);

  const currentPlayer = currentPlayerId === 1 ? player1 : player2;

  // Change Game Mode
  const handleModeChange = (mode: GameMode) => {
    sounds.playClick();
    setGameMode(mode);
    setIsDemoPlaying(false);

    if (mode === 'PVP') {
      setPlayer1((p) => ({ ...p, name: 'Joueur 1', isAI: false }));
      setPlayer2((p) => ({ ...p, name: 'Joueur 2', isAI: false }));
      addLog('Mode changé : Joueur vs Joueur (2 joueurs en local).');
    } else if (mode === 'PVE') {
      setPlayer1((p) => ({ ...p, name: 'Joueur 1', isAI: false }));
      setPlayer2((p) => ({ ...p, name: 'Ordinateur', isAI: true }));
      addLog(`Mode changé : Joueur vs IA (${player2.difficulty || 'EXPERT'}).`);
    } else {
      setPlayer1((p) => ({ ...p, name: 'IA Alpha', isAI: true, difficulty: 'STANDARD' }));
      setPlayer2((p) => ({ ...p, name: 'IA Beta', isAI: true, difficulty: 'EXPERT' }));
      addLog('Mode changé : IA vs IA (Démo automatique).');
    }

    resetGame(mode);
  };

  // Reset Game
  const resetGame = (overrideMode?: GameMode) => {
    sounds.playClick();
    const newEngine = new Connect4Engine();
    setEngine(newEngine);
    setGrid(newEngine.getGrid().map(r => [...r]));
    setWinningPositions([]);
    setIsGameOver(false);
    setWinner(null);
    setIsDraw(false);
    setIsAIThinking(false);
    setCurrentPlayerId(1);
    moveHistoryRef.current = [];

    const mode = overrideMode || gameMode;
    const p1Name = mode === 'EVE' ? 'IA Alpha' : player1.name;
    const p2Name = mode === 'PVE' ? 'Ordinateur' : mode === 'EVE' ? 'IA Beta' : player2.name;

    addLog(`Nouvelle partie entre ${p1Name} (${player1.symbol}) et ${p2Name} (${player2.symbol}).`);
  };

  // Drop Disc Action
  const handleDropDisc = useCallback(
    (col: number) => {
      if (isGameOver || isAIThinking) return;

      const pId = currentPlayerId;
      const result = engine.placer(pId, col);
      if (!result) return;

      // Play sound
      sounds.playDrop(result.row);

      // Update Move History
      moveHistoryRef.current.push({ col, playerId: pId });

      // Update grid state
      setGrid(engine.getGrid().map(r => [...r]));

      const pConfig = pId === 1 ? player1 : player2;
      addLog(`${pConfig.name} (${pConfig.symbol}) a joué dans la colonne ${col}.`);

      // Check Victory
      const winPositions = engine.verifierVictoire(pId);
      if (winPositions) {
        setWinningPositions(winPositions);
        setIsGameOver(true);
        setWinner(pConfig);
        sounds.playWin();
        addLog(`🎉 Victoire de ${pConfig.name} ! Ligne de 4 connectée !`);

        setStats((s) => ({
          ...s,
          p1Wins: pId === 1 ? s.p1Wins + 1 : s.p1Wins,
          p2Wins: pId === 2 ? s.p2Wins + 1 : s.p2Wins,
          totalGames: s.totalGames + 1,
        }));
        return;
      }

      // Check Draw
      if (engine.estPleine()) {
        setIsGameOver(true);
        setIsDraw(true);
        sounds.playDraw();
        addLog('🤝 Match nul ! La grille est pleine.');
        setStats((s) => ({
          ...s,
          draws: s.draws + 1,
          totalGames: s.totalGames + 1,
        }));
        return;
      }

      // Switch Player
      setCurrentPlayerId((prev) => (prev === 1 ? 2 : 1));
    },
    [isGameOver, isAIThinking, currentPlayerId, engine, player1, player2, addLog]
  );

  // Undo Move (Annuler Coup)
  const handleUndo = () => {
    if (moveHistoryRef.current.length === 0 || isAIThinking) return;
    sounds.playClick();

    if (gameMode === 'PVE') {
      // In PvE, if game is not over and it's human turn, undo both AI and Human move
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

    setGrid(engine.getGrid().map(r => [...r]));
    setWinningPositions([]);
    setIsGameOver(false);
    setWinner(null);
    setIsDraw(false);
    addLog('Dernier coup annulé.');
  };

  // AI Turn Handling
  useEffect(() => {
    if (isGameOver) return;

    const currPlayer = currentPlayerId === 1 ? player1 : player2;

    if (currPlayer.isAI) {
      setIsAIThinking(true);
      const diff = currPlayer.difficulty || 'EXPERT';

      const delay = gameMode === 'EVE' ? Math.min(demoSpeed, 350) : 350;

      const timer = setTimeout(() => {
        const bestCol = engine.choisirCoupIA(currentPlayerId, diff);
        setIsAIThinking(false);

        if (bestCol !== -1 && engine.ouValide(bestCol)) {
          handleDropDisc(bestCol);
        }
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [currentPlayerId, isGameOver, player1, player2, engine, handleDropDisc, gameMode, demoSpeed]);

  // AI vs AI Demo auto loop
  useEffect(() => {
    if (gameMode !== 'EVE' || !isDemoPlaying || isGameOver || isAIThinking) return;

    const timer = setTimeout(() => {
      const currP = currentPlayerId === 1 ? player1 : player2;
      const bestCol = engine.choisirCoupIA(currentPlayerId, currP.difficulty || 'EXPERT');
      if (bestCol !== -1 && engine.ouValide(bestCol)) {
        handleDropDisc(bestCol);
      }
    }, demoSpeed);

    return () => clearTimeout(timer);
  }, [gameMode, isDemoPlaying, isGameOver, isAIThinking, currentPlayerId, player1, player2, engine, demoSpeed, handleDropDisc]);

  const toggleSound = () => {
    const next = !isSoundEnabled;
    setIsSoundEnabled(next);
    sounds.enabled = next;
    if (next) sounds.playClick();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-amber-500 p-0.5 shadow-lg shadow-rose-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center font-black text-rose-400">
                4
              </div>
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                Puissance 4 <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">POO C++</span>
              </h1>
              <p className="text-[11px] text-slate-400 hidden sm:block">ICT102 • Algorithme Minimax & Bitboards</p>
            </div>
          </div>

          {/* Quick Toolbar */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* View Mode Toggle: Board vs Terminal */}
            <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-0.5">
              <button
                onClick={() => {
                  sounds.playClick();
                  setViewMode('board');
                }}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'board'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Mode Plateau Graphique"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Plateau</span>
              </button>

              <button
                onClick={() => {
                  sounds.playClick();
                  setViewMode('terminal');
                }}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'terminal'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Mode Console C++ ANSI"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Terminal ANSI</span>
              </button>
            </div>

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
              title="Paramètres & Personnalisation"
            >
              <Sliders className="w-4 h-4" />
            </button>

            {/* Help */}
            <button
              onClick={() => {
                sounds.playClick();
                setIsRulesOpen(true);
              }}
              className="p-2 rounded-xl border border-slate-800 bg-slate-900/80 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
              title="Règles & Guide"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6 flex flex-col items-center gap-5">
        {/* Game Mode Selector Tabs */}
        <div className="w-full max-w-2xl flex p-1 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-inner">
          {[
            { id: 'PVP', label: 'Joueur vs Joueur', icon: Users },
            { id: 'PVE', label: 'Joueur vs IA', icon: Bot },
            { id: 'EVE', label: 'IA vs IA (Démo)', icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = gameMode === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleModeChange(tab.id as GameMode)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  active
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Score & Status Header */}
        <div className="w-full max-w-2xl bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Player 1 Card */}
          <div
            className={`flex items-center gap-3 px-3 py-2 rounded-xl border transition-all ${
              currentPlayerId === 1 && !isGameOver
                ? 'bg-rose-950/40 border-rose-500/60 ring-2 ring-rose-500/30'
                : 'bg-slate-950/50 border-slate-800'
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-rose-500/40">
              {player1.symbol}
            </div>
            <div>
              <div className="text-xs font-bold text-slate-200 flex items-center gap-1">
                {player1.name}
                {player1.isAI && (
                  <span className="text-[10px] px-1 bg-purple-900/80 text-purple-300 rounded font-normal">
                    {player1.difficulty}
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-400">{stats.p1Wins} victoire{stats.p1Wins > 1 ? 's' : ''}</div>
            </div>
          </div>

          {/* Center Match Banner / Turn Indicator */}
          <div className="flex flex-col items-center text-center">
            {isGameOver ? (
              winner ? (
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm sm:text-base animate-bounce">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  {winner.name} a gagné !
                </div>
              ) : (
                <div className="text-amber-400 font-bold text-sm sm:text-base">🤝 Match Nul !</div>
              )
            ) : isAIThinking ? (
              <div className="flex items-center gap-2 text-purple-400 font-semibold text-xs sm:text-sm animate-pulse">
                <Bot className="w-4 h-4 animate-spin" />
                {currentPlayer.name} réfléchit...
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-300 font-medium">
                Tour de{' '}
                <span
                  className={`font-bold ${
                    currentPlayerId === 1 ? 'text-rose-400' : 'text-amber-400'
                  }`}
                >
                  {currentPlayer.name} ({currentPlayer.symbol})
                </span>
              </div>
            )}

            <div className="text-[11px] text-slate-500 mt-0.5">
              Parties jouées : {stats.totalGames} • Nuls : {stats.draws}
            </div>
          </div>

          {/* Player 2 Card */}
          <div
            className={`flex items-center gap-3 px-3 py-2 rounded-xl border transition-all ${
              currentPlayerId === 2 && !isGameOver
                ? 'bg-amber-950/40 border-amber-500/60 ring-2 ring-amber-500/30'
                : 'bg-slate-950/50 border-slate-800'
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-sm shadow-md shadow-amber-400/40">
              {player2.symbol}
            </div>
            <div>
              <div className="text-xs font-bold text-slate-200 flex items-center gap-1">
                {player2.name}
                {player2.isAI && (
                  <span className="text-[10px] px-1 bg-purple-900/80 text-purple-300 rounded font-normal">
                    {player2.difficulty}
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-400">{stats.p2Wins} victoire{stats.p2Wins > 1 ? 's' : ''}</div>
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

        {/* Active View: Board or Terminal */}
        {viewMode === 'board' ? (
          <GameBoard
            grid={grid}
            currentPlayer={currentPlayer}
            player1={player1}
            player2={player2}
            winningPositions={winningPositions}
            isGameOver={isGameOver}
            isAIThinking={isAIThinking}
            onDropDisc={handleDropDisc}
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
            onDropDisc={handleDropDisc}
            onResetGame={() => resetGame()}
          />
        )}

        {/* Game Controls Footer: Undo, Replay, Reset */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleUndo}
            disabled={moveHistoryRef.current.length === 0 || isAIThinking}
            className="px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-sm transition-colors"
          >
            <Undo2 className="w-4 h-4" /> Annuler le coup
          </button>

          <button
            onClick={() => resetGame()}
            className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all"
          >
            <RotateCcw className="w-4 h-4" /> Nouvelle partie
          </button>
        </div>
      </main>

      {/* Rules Modal */}
      {isRulesOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-400" /> Règles du Puissance 4
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
                <strong>Objectif :</strong> Être le premier joueur à aligner 4 jetons de sa couleur horizontalement, verticalement ou en diagonale.
              </p>
              <p>
                <strong>Déroulement :</strong> À tour de rôle, chaque joueur glisse un jeton dans l'une des 7 colonnes (0 à 6). Le jeton tombe jusqu'à la position la plus basse disponible.
              </p>
              <p>
                <strong>Algorithme & POO :</strong> Ce jeu implémente l'architecture C++ d'origine :
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-400">
                <li>Représentation par <strong>Bitboards 64-bit</strong> pour un calcul d'alignement instantané.</li>
                <li>Moteur <strong>Minimax avec élagage Alpha-Bêta</strong> et heuristique positionnelle.</li>
                <li>3 niveaux d'IA : Standard (4 coups d'avance), Expert (6 coups), Maître (8 coups).</li>
                <li>Mode Terminal ANSI reproduisant fidèlement l'interface console C++.</li>
              </ul>
            </div>
            <button
              onClick={() => setIsRulesOpen(false)}
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold mt-2"
            >
              Compris !
            </button>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        player1={player1}
        player2={player2}
        aiDifficulty={player2.difficulty || 'EXPERT'}
        isSoundEnabled={isSoundEnabled}
        onUpdateP1={(u) => setPlayer1((p) => ({ ...p, ...u }))}
        onUpdateP2={(u) => setPlayer2((p) => ({ ...p, ...u }))}
        onUpdateAIDifficulty={(diff) => {
          setPlayer2((p) => ({ ...p, difficulty: diff }));
          addLog(`Difficulté IA mise à jour : ${diff}`);
        }}
        onToggleSound={toggleSound}
      />
    </div>
  );
}
