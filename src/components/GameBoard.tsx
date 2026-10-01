import React, { useState } from 'react';
import { PlayerConfig, Position } from '../types';
import { NB_COLONNES, NB_LIGNES } from '../engine/Connect4Engine';

interface GameBoardProps {
  grid: (number | null)[][];
  currentPlayer: PlayerConfig;
  player1: PlayerConfig;
  player2: PlayerConfig;
  winningPositions: Position[];
  isGameOver: boolean;
  isAIThinking: boolean;
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
  onDropDisc,
}) => {
  const [hoveredCol, setHoveredCol] = useState<number | null>(null);

  const isWinningCell = (row: number, col: number) => {
    return winningPositions.some((p) => p.x === row && p.y === col);
  };

  const getDiscStyles = (val: number | null, isWinning: boolean) => {
    if (val === null) {
      return 'bg-slate-900/90 shadow-inner border border-slate-800/80';
    }

    const isP1 = val === 1;
    const player = isP1 ? player1 : player2;

    if (isWinning) {
      return 'bg-emerald-500 text-white shadow-[0_0_24px_rgba(16,185,129,0.9)] ring-4 ring-emerald-300 ring-offset-2 ring-offset-slate-900 animate-pulse';
    }

    if (isP1) {
      return 'bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-lg shadow-rose-950/50 border-2 border-rose-400/40';
    } else {
      return 'bg-gradient-to-br from-amber-400 to-yellow-500 text-slate-900 shadow-lg shadow-amber-950/50 border-2 border-yellow-300/40';
    }
  };

  const canPlay = !isGameOver && !isAIThinking && (!currentPlayer.isAI);

  return (
    <div className="flex flex-col items-center select-none w-full max-w-2xl px-2">
      {/* Drop indicators above board */}
      <div className="grid grid-cols-7 gap-2 sm:gap-3 w-full max-w-[480px] sm:max-w-[560px] h-10 sm:h-12 mb-1 px-3 sm:px-4">
        {Array.from({ length: NB_COLONNES }).map((_, col) => {
          const isFull = grid[0][col] !== null;
          const isHovered = hoveredCol === col && canPlay && !isFull;

          return (
            <div
              key={`indicator-${col}`}
              className="flex items-center justify-center cursor-pointer transition-transform"
              onClick={() => canPlay && !isFull && onDropDisc(col)}
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

      {/* Physical Blue Connect 4 Frame */}
      <div className="relative p-3 sm:p-4 bg-gradient-to-b from-blue-700 via-blue-800 to-blue-900 rounded-3xl shadow-[0_20px_50px_rgba(30,58,138,0.4),0_0_0_3px_rgba(59,130,246,0.3)] border border-blue-500/30 w-full max-w-[480px] sm:max-w-[560px]">
        {/* Subtle grid leg screws and textures */}
        <div className="absolute top-2 left-3 w-2 h-2 rounded-full bg-blue-950/60 border border-blue-400/20" />
        <div className="absolute top-2 right-3 w-2 h-2 rounded-full bg-blue-950/60 border border-blue-400/20" />
        <div className="absolute bottom-2 left-3 w-2 h-2 rounded-full bg-blue-950/60 border border-blue-400/20" />
        <div className="absolute bottom-2 right-3 w-2 h-2 rounded-full bg-blue-950/60 border border-blue-400/20" />

        {/* 7 Columns Container */}
        <div className="grid grid-cols-7 gap-2 sm:gap-3">
          {Array.from({ length: NB_COLONNES }).map((_, col) => {
            const isFull = grid[0][col] !== null;
            const isColHovered = hoveredCol === col && canPlay && !isFull;

            return (
              <div
                key={`col-${col}`}
                className={`flex flex-col gap-2 sm:gap-3 rounded-2xl p-1 transition-colors duration-150 ${
                  isColHovered ? 'bg-blue-600/30 ring-1 ring-blue-300/40' : ''
                } ${canPlay && !isFull ? 'cursor-pointer' : ''}`}
                onClick={() => canPlay && !isFull && onDropDisc(col)}
                onMouseEnter={() => setHoveredCol(col)}
                onMouseLeave={() => setHoveredCol(null)}
              >
                {Array.from({ length: NB_LIGNES }).map((_, row) => {
                  const val = grid[row][col];
                  const isWinning = isWinningCell(row, col);
                  const discStyle = getDiscStyles(val, isWinning);
                  const playerSymbol = val === 1 ? player1.symbol : val === 2 ? player2.symbol : '';

                  return (
                    <div
                      key={`cell-${row}-${col}`}
                      className="relative aspect-square w-full rounded-full flex items-center justify-center overflow-hidden transition-all duration-300"
                    >
                      {/* Hole Cutout / Slot */}
                      <div
                        className={`w-full h-full rounded-full flex items-center justify-center font-black text-sm sm:text-base md:text-lg transition-transform duration-200 ${discStyle}`}
                      >
                        {val !== null && (
                          <span className="drop-shadow-sm leading-none">{playerSymbol}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Column labels (0 - 6) like in C++ console */}
      <div className="grid grid-cols-7 gap-2 sm:gap-3 w-full max-w-[480px] sm:max-w-[560px] mt-2 px-3 sm:px-4 text-center">
        {Array.from({ length: NB_COLONNES }).map((_, col) => (
          <button
            key={`label-${col}`}
            disabled={!canPlay || grid[0][col] !== null}
            onClick={() => canPlay && grid[0][col] === null && onDropDisc(col)}
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
