import React, { useState } from 'react';
import { PlayerConfig, Position } from '../types';
import { NB_COLONNES, NB_LIGNES } from '../engine/Connect4Engine';
import { Terminal, CornerDownLeft, Play, RefreshCw } from 'lucide-react';

interface TerminalViewProps {
  grid: (number | null)[][];
  player1: PlayerConfig;
  player2: PlayerConfig;
  currentPlayer: PlayerConfig;
  winningPositions: Position[];
  isGameOver: boolean;
  isAIThinking: boolean;
  logs: string[];
  onDropDisc: (col: number) => void;
  onResetGame: () => void;
}

export const TerminalView: React.FC<TerminalViewProps> = ({
  grid,
  player1,
  player2,
  currentPlayer,
  winningPositions,
  isGameOver,
  isAIThinking,
  logs,
  onDropDisc,
  onResetGame,
}) => {
  const [inputVal, setInputVal] = useState('');

  const isWinningCell = (row: number, col: number) => {
    return winningPositions.some((p) => p.x === row && p.y === col);
  };

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputVal.trim();
    if (!trimmed) return;

    if (isGameOver) {
      if (trimmed.toUpperCase() === 'O' || trimmed.toUpperCase() === 'Y') {
        onResetGame();
      }
      setInputVal('');
      return;
    }

    const colNum = parseInt(trimmed, 10);
    if (!isNaN(colNum) && colNum >= 0 && colNum < NB_COLONNES) {
      if (grid[0][colNum] === null && !isAIThinking) {
        onDropDisc(colNum);
      }
    }
    setInputVal('');
  };

  return (
    <div className="w-full max-w-2xl bg-black border border-slate-800 rounded-xl overflow-hidden shadow-2xl font-mono text-xs sm:text-sm">
      {/* Terminal window titlebar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-slate-400">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block" />
          </div>
          <span className="text-xs font-mono ml-2 text-slate-300 flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-emerald-400" /> ./puissance4 (C++ ANSI Console Mode)
          </span>
        </div>
        <div className="text-[11px] text-slate-400">ICT102 POO - bash 80x24</div>
      </div>

      {/* Terminal body */}
      <div className="p-4 bg-slate-950 text-slate-200 overflow-x-auto space-y-4 max-h-[500px] overflow-y-auto">
        {/* Terminal Header */}
        <div className="text-emerald-400 font-bold">
          === PUISSANCE 4 C++ EMULATOR ===
        </div>

        {/* ASCII Colored Grid */}
        <div className="font-mono text-sm leading-snug whitespace-pre select-none bg-slate-900/60 p-3 rounded border border-slate-800/80 inline-block min-w-[320px]">
          {/* Column Indices */}
          <div className="text-slate-400 font-bold">
            {'    '}
            {Array.from({ length: NB_COLONNES }).map((_, c) => (
              <span key={`col-idx-${c}`} className="inline-block w-7 text-center">
                {c}
              </span>
            ))}
          </div>

          {Array.from({ length: NB_LIGNES }).map((_, r) => (
            <React.Fragment key={`row-render-${r}`}>
              {/* Separator row */}
              <div className="text-slate-600">
                {'   +'}
                {Array.from({ length: NB_COLONNES })
                  .map(() => '---+')
                  .join('')}
              </div>

              {/* Data row */}
              <div>
                <span className="text-slate-600">{'   |'}</span>
                {Array.from({ length: NB_COLONNES }).map((_, c) => {
                  const val = grid[r][c];
                  const isWin = isWinningCell(r, c);

                  if (val === null) {
                    return (
                      <span key={`cell-term-${r}-${c}`} className="text-slate-700">
                        {'   |'}
                      </span>
                    );
                  }

                  const isP1 = val === 1;
                  const sym = isP1 ? player1.symbol : player2.symbol;

                  if (isWin) {
                    // ANSI Green: \033[32m
                    return (
                      <span key={`cell-term-${r}-${c}`}>
                        {' '}
                        <span className="text-emerald-400 font-extrabold bg-emerald-950/80 px-0.5 rounded animate-pulse">
                          {sym}
                        </span>{' '}
                        <span className="text-slate-600">|</span>
                      </span>
                    );
                  }

                  if (isP1) {
                    // ANSI Red: \033[31m
                    return (
                      <span key={`cell-term-${r}-${c}`}>
                        {' '}
                        <span className="text-red-400 font-bold">{sym}</span>{' '}
                        <span className="text-slate-600">|</span>
                      </span>
                    );
                  }

                  // ANSI Blue: \033[34m
                  return (
                    <span key={`cell-term-${r}-${c}`}>
                      {' '}
                      <span className="text-blue-400 font-bold">{sym}</span>{' '}
                      <span className="text-slate-600">|</span>
                    </span>
                  );
                })}
              </div>
            </React.Fragment>
          ))}

          {/* Bottom border */}
          <div className="text-slate-600">
            {'   +'}
            {Array.from({ length: NB_COLONNES })
              .map(() => '---+')
              .join('')}
          </div>
        </div>

        {/* Quick action buttons in terminal */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-xs text-slate-400">Colonnes :</span>
          {Array.from({ length: NB_COLONNES }).map((_, c) => {
            const isFull = grid[0][c] !== null;
            return (
              <button
                key={`btn-term-col-${c}`}
                disabled={isGameOver || isAIThinking || isFull}
                onClick={() => onDropDisc(c)}
                className={`px-2 py-0.5 rounded font-mono text-xs border ${
                  isFull || isGameOver || isAIThinking
                    ? 'border-slate-800 text-slate-600 cursor-not-allowed bg-slate-900/30'
                    : 'border-slate-700 bg-slate-800 text-emerald-300 hover:bg-emerald-950 hover:border-emerald-600'
                }`}
              >
                [{c}]
              </button>
            );
          })}
        </div>

        {/* Console Activity Log */}
        <div className="space-y-1 border-t border-slate-800 pt-3">
          {logs.slice(-6).map((log, idx) => (
            <div key={`log-${idx}`} className="text-xs font-mono text-slate-300">
              <span className="text-slate-500 mr-2">&gt;</span>
              {log}
            </div>
          ))}
          {isAIThinking && (
            <div className="text-xs font-mono text-amber-400 animate-pulse">
              &gt; {currentPlayer.name} réfléchit...
            </div>
          )}
        </div>

        {/* Interactive stdin command prompt */}
        <form onSubmit={handleInputSubmit} className="flex items-center gap-2 pt-2 border-t border-slate-800">
          <span className="text-emerald-400 font-bold font-mono">user@puissance4:~$</span>
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder={
              isGameOver
                ? "Entrez 'O' pour rejouer"
                : `${currentPlayer.name} (${currentPlayer.symbol}), entrez colonne 0-6`
            }
            className="flex-1 bg-transparent text-slate-100 placeholder-slate-600 font-mono text-xs sm:text-sm focus:outline-none"
            autoFocus
          />
          <button
            type="submit"
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs flex items-center gap-1 font-mono"
          >
            <CornerDownLeft className="w-3 h-3" /> Entrée
          </button>
        </form>
      </div>
    </div>
  );
};
