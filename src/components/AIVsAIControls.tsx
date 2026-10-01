import React from 'react';
import { AIDifficulty, PlayerConfig } from '../types';
import { Play, Pause, StepForward, Gauge, Bot } from 'lucide-react';

interface AIVsAIControlsProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onStepMove: () => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
  player1: PlayerConfig;
  player2: PlayerConfig;
  onUpdateP1Diff: (diff: AIDifficulty) => void;
  onUpdateP2Diff: (diff: AIDifficulty) => void;
  isGameOver: boolean;
}

export const AIVsAIControls: React.FC<AIVsAIControlsProps> = ({
  isPlaying,
  onTogglePlay,
  onStepMove,
  speed,
  onSpeedChange,
  player1,
  player2,
  onUpdateP1Diff,
  onUpdateP2Diff,
  isGameOver,
}) => {
  return (
    <div className="w-full max-w-2xl bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-purple-400" />
          <span className="text-xs font-semibold text-purple-300 uppercase tracking-wider">
            Mode Démo : IA Alpha vs IA Beta
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onTogglePlay}
            disabled={isGameOver}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              isGameOver
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : isPlaying
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" /> Pause
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" /> Lecture Auto
              </>
            )}
          </button>

          <button
            onClick={onStepMove}
            disabled={isGameOver || isPlaying}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <StepForward className="w-3.5 h-3.5" /> Coup par coup
          </button>
        </div>
      </div>

      {/* Speed & Difficulty row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        {/* IA 1 Diff */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-rose-400 font-medium">IA 1 ({player1.name}) :</label>
          <select
            value={player1.difficulty || 'STANDARD'}
            onChange={(e) => onUpdateP1Diff(e.target.value as AIDifficulty)}
            className="bg-slate-950 border border-slate-700 text-xs text-white rounded-lg p-1.5 focus:outline-none focus:border-rose-500"
          >
            <option value="STANDARD">Standard (Facile++)</option>
            <option value="EXPERT">Expert (Doué+)</option>
            <option value="MAITRE">Maître (Légendaire)</option>
          </select>
        </div>

        {/* IA 2 Diff */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-amber-400 font-medium">IA 2 ({player2.name}) :</label>
          <select
            value={player2.difficulty || 'EXPERT'}
            onChange={(e) => onUpdateP2Diff(e.target.value as AIDifficulty)}
            className="bg-slate-950 border border-slate-700 text-xs text-white rounded-lg p-1.5 focus:outline-none focus:border-amber-500"
          >
            <option value="STANDARD">Standard (Facile++)</option>
            <option value="EXPERT">Expert (Doué+)</option>
            <option value="MAITRE">Maître (Légendaire)</option>
          </select>
        </div>

        {/* Speed */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span className="flex items-center gap-1">
              <Gauge className="w-3 h-3 text-blue-400" /> Vitesse :
            </span>
            <span>{speed <= 100 ? 'Ultra-Rapide' : speed <= 300 ? 'Rapide' : speed <= 700 ? 'Normale' : 'Lente'}</span>
          </div>
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            {[
              { val: 1000, label: '0.5x' },
              { val: 500, label: '1x' },
              { val: 200, label: '2x' },
              { val: 60, label: 'Max' },
            ].map((spd) => (
              <button
                key={spd.val}
                onClick={() => onSpeedChange(spd.val)}
                className={`flex-1 py-1 rounded text-[10px] font-semibold transition-colors ${
                  speed === spd.val
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {spd.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
