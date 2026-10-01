import React, { useState } from 'react';
import { PlayerConfig, Position, BoardTheme } from '../types';
import { NB_COLONNES, NB_LIGNES } from '../engine/Connect4Engine';

interface GameBoardProps {
  grid: (number | null)[][];
  currentPlayer: PlayerConfig;
  player1: PlayerConfig;
  player2: PlayerConfig;
  winningPositions: Position[];
  isGameOver: boolean;
  isAIThinking: boolean;
  theme: BoardTheme;
  isPassAndPlay?: boolean;
  lastMove?: { row: number; col: number } | null;
  onDropDisc: (col: number) => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  grid,
  currentPlayer,
  player1,
  player2,
  winningPositions,
  isGameOver,
  isAIThinking,
  theme,
  isPassAndPlay = false,
  lastMove = null,
  onDropDisc,
}) => {
  const [hoveredCol, setHoveredCol] = useState<number | null>(null);

  const isWinningCell = (row: number, col: number) => {
    return winningPositions.some((p) => p.x === row && p.y === col);
  };

  // Thèmes visuels
  const getBoardThemeStyles = () => {
    switch (theme) {
      case 'cyberpunk':
        return {
          frame: 'bg-gradient-to-b from-slate-900 via-purple-950 to-slate-900 border-2 border-fuchsia-500/50 shadow-[0_0_40px_rgba(217,70,239,0.3)]',
          colHover: 'bg-fuchsia-600/20 ring-1 ring-fuchsia-400/40',
          hole: 'bg-black/90 border border-purple-900/50 shadow-[inset_0_2px_8px_rgba(0,0,0,0.9)]',
        };
      case 'wood':
        return {
          frame: 'bg-gradient-to-b from-amber-800 via-amber-900 to-yellow-950 border-4 border-amber-700/60 shadow-[0_15px_40px_rgba(69,26,3,0.5)]',
          colHover: 'bg-amber-600/20 ring-1 ring-amber-400/40',
          hole: 'bg-stone-950 border border-amber-950/80 shadow-[inset_0_3px_10px_rgba(0,0,0,0.9)]',
        };
      case 'classic':
      default:
        return {
          frame: 'bg-gradient-to-b from-blue-700 via-blue-800 to-blue-900 border border-blue-500/30 shadow-[0_20px_50px_rgba(30,58,138,0.4),0_0_0_3px_rgba(59,130,246,0.3)]',
          colHover: 'bg-blue-600/30 ring-1 ring-blue-300/40',
          hole: 'bg-slate-900/90 border border-slate-800/80 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)]',
        };
    }
  };

  const themeStyles = getBoardThemeStyles();

  const getDiscStyles = (val: number | null, isWinning: boolean) => {
    if (val === null) {
      return themeStyles.hole;
    }

    const isP1 = val === 1;

    if (isWinning) {
      return 'bg-emerald-500 text-white shadow-[0_0_30px_rgba(16,185,129,0.95)] ring-4 ring-emerald-300 ring-offset-2 ring-offset-slate-900 animate-pulse';
    }

    if (theme === 'cyberpunk') {
      return isP1
        ? 'bg-gradient-to-br from-fuchsia-500 to-pink-600 text-white shadow-[0_0_15px_rgba(236,72,153,0.8)] border border-pink-300/60'
        : 'bg-gradient-to-br from-cyan-400 to-blue-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.8)] border border-cyan-200/60 font-black';
    }

    if (theme === 'wood') {
      return isP1
        ? 'bg-gradient-to-br from-red-600 to-amber-700 text-white shadow-md border-2 border-red-400/40'
        : 'bg-gradient-to-br from-amber-200 to-yellow-400 text-amber-950 shadow-md border-2 border-yellow-100/60 font-black';
    }

    // Classic
    return isP1
      ? 'bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-lg shadow-rose-950/50 border-2 border-rose-400/40'
      : 'bg-gradient-to-br from-amber-400 to-yellow-500 text-slate-950 shadow-lg shadow-amber-950/50 border-2 border-yellow-300/40';
  };

  const canPlay = !isGameOver && !isAIThinking && (!currentPlayer.isAI);

  const handleColumnTouch = (col: number) => {
    if (!canPlay || grid[0][col] !== null) return;
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(30);
      } catch {}
    }
    onDropDisc(col);
  };

  // Flip rotation for Player 2 in Pass & Play mode
  const isP2TurnInPassAndPlay = isPassAndPlay && currentPlayer.id === 2;

  return (
    <div
      className={`flex flex-col items-center select-none w-full max-w-2xl px-2 transition-transform duration-500 ${
        isP2TurnInPassAndPlay ? 'rotate-180' : ''
      }`}
    >
      {/* Drop indicators above board */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-3 w-full max-w-[420px] sm:max-w-[540px] h-9 sm:h-12 mb-1 px-2 sm:px-4">
        {Array.from({ length: NB_COLONNES }).map((_, col) => {
          const isFull = grid[0][col] !== null;
          const isHovered = hoveredCol === col && canPlay && !isFull;

          return (
            <div
              key={`indicator-${col}`}
              className="flex items-center justify-center cursor-pointer transition-transform"
              onClick={() => handleColumnTouch(col)}
              onMouseEnter={() => setHoveredCol(col)}
              onMouseLeave={() => setHoveredCol(null)}
            >
              {isHovered && (
                <div
                  className={`w-7 h-7 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm animate-bounce shadow-md ${
                    currentPlayer.id === 1
                      ? 'bg-rose-500 text-white shadow-rose-500/50'
                      : 'bg-amber-400 text-slate-950 shadow-amber-400/50'
                  }`}
                >
                  {currentPlayer.symbol}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Connect 4 Frame */}
      <div
        className={`relative p-2.5 sm:p-4 rounded-3xl w-full max-w-[420px] sm:max-w-[540px] overflow-hidden transition-all duration-300 ${themeStyles.frame}`}
      >
        {/* Subtle decorative screws */}
        <div className="absolute top-2 left-3 w-2 h-2 rounded-full bg-black/40 border border-white/20" />
        <div className="absolute top-2 right-3 w-2 h-2 rounded-full bg-black/40 border border-white/20" />
        <div className="absolute bottom-2 left-3 w-2 h-2 rounded-full bg-black/40 border border-white/20" />
        <div className="absolute bottom-2 right-3 w-2 h-2 rounded-full bg-black/40 border border-white/20" />

        {/* 7 Columns Container */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-3">
          {Array.from({ length: NB_COLONNES }).map((_, col) => {
            const isFull = grid[0][col] !== null;
            const isColHovered = hoveredCol === col && canPlay && !isFull;

            return (
              <div
                key={`col-${col}`}
                className={`flex flex-col gap-1.5 sm:gap-3 rounded-2xl p-0.5 sm:p-1 transition-all duration-150 ${
                  isColHovered ? themeStyles.colHover : ''
                } ${canPlay && !isFull ? 'cursor-pointer active:scale-95' : ''}`}
                onClick={() => handleColumnTouch(col)}
                onMouseEnter={() => setHoveredCol(col)}
                onMouseLeave={() => setHoveredCol(null)}
              >
                {Array.from({ length: NB_LIGNES }).map((_, row) => {
                  const val = grid[row][col];
                  const isWinning = isWinningCell(row, col);
                  const isLast = !isWinning && lastMove !== null && lastMove.row === row && lastMove.col === col;
                  const discStyle = getDiscStyles(val, isWinning);
                  const playerSymbol = val === 1 ? player1.symbol : val === 2 ? player2.symbol : '';

                  return (
                    <div
                      key={`cell-${row}-${col}`}
                      className="relative aspect-square w-full rounded-full flex items-center justify-center"
                    >
                      {/* Base Hole Cutout Background (socket vide) */}
                      <div className={`absolute inset-0 rounded-full ${themeStyles.hole}`} />

                      {/* Placed Disc with Drop Animation */}
                      {val !== null && (
                        <div
                          className={`relative z-10 w-full h-full rounded-full flex items-center justify-center font-black text-xs sm:text-base md:text-lg transition-all duration-200 ${discStyle} ${
                            isLast
                              ? `disc-drop-${row} ring-4 ring-amber-400 ring-offset-2 ring-offset-slate-950 shadow-[0_0_15px_rgba(251,191,36,0.9)]`
                              : ''
                          }`}
                        >
                          <span className="drop-shadow-sm leading-none">{playerSymbol}</span>
                        </div>
                      )}

                      {/* Animated Ping Marker on Last Move */}
                      {isLast && (
                        <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center">
                          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-white/90 shadow-md animate-ping" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Column labels (0 - 6) */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-3 w-full max-w-[420px] sm:max-w-[540px] mt-2 px-2 sm:px-4 text-center">
        {Array.from({ length: NB_COLONNES }).map((_, col) => (
          <button
            key={`label-${col}`}
            disabled={!canPlay || grid[0][col] !== null}
            onClick={() => handleColumnTouch(col)}
            className={`text-xs font-mono py-1 rounded transition-colors ${
              hoveredCol === col && canPlay && grid[0][col] === null
                ? 'text-blue-300 bg-blue-900/40 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {col}
          </button>
        ))}
      </div>
    </div>
  );
};
