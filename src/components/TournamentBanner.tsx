import React from 'react';
import { Trophy, X } from 'lucide-react';
import { TournamentState, PlayerConfig } from '../types';

interface TournamentBannerProps {
  tournament: TournamentState;
  player1: PlayerConfig;
  player2: PlayerConfig;
  onAbortTournament: () => void;
}

export const TournamentBanner: React.FC<TournamentBannerProps> = ({
  tournament,
  player1,
  player2,
  onAbortTournament,
}) => {
  if (!tournament.isActive) return null;

  const targetWins = Math.ceil(tournament.totalMatches / 2);

  return (
    <div className="w-full max-w-md sm:max-w-xl bg-gradient-to-r from-amber-950/70 via-slate-900 to-amber-950/70 border border-amber-500/40 rounded-2xl p-2.5 sm:p-3 shadow-lg shadow-amber-950/30 animate-in fade-in">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
          <Trophy className="w-4 h-4 text-amber-400 animate-bounce" />
          <span>MODE TOURNOI</span>
          <span className="text-[10px] font-semibold text-slate-300 bg-amber-900/60 px-2 py-0.5 rounded-full border border-amber-500/30">
            Série de {tournament.totalMatches} matchs (1er à {targetWins})
          </span>
        </div>
        <button
          onClick={onAbortTournament}
          className="p-1 text-slate-400 hover:text-rose-400 transition-colors rounded-lg"
          title="Arrêter le tournoi"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center justify-between gap-2 bg-slate-950/80 rounded-xl p-2 border border-amber-500/20">
        {/* P1 Score & Dots */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-rose-500 text-white font-bold text-xs flex items-center justify-center shadow">
            {player1.symbol}
          </div>
          <div>
            <div className="text-xs font-bold text-slate-200 truncate max-w-[85px] sm:max-w-none">
              {player1.name}
            </div>
            {/* Dots */}
            <div className="flex items-center gap-1 mt-0.5">
              {Array.from({ length: targetWins }).map((_, i) => (
                <span
                  key={`p1-dot-${i}`}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    i < tournament.p1Wins
                      ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)] scale-110'
                      : 'bg-slate-800 border border-slate-700'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Center Round Indicator */}
        <div className="text-center px-2">
          <div className="text-base sm:text-lg font-black text-amber-400 tracking-wider">
            {tournament.p1Wins} - {tournament.p2Wins}
          </div>
          <div className="text-[10px] text-slate-400 font-medium">
            Match {Math.min(tournament.currentRound, tournament.totalMatches)} / {tournament.totalMatches}
          </div>
        </div>

        {/* P2 Score & Dots */}
        <div className="flex items-center gap-2 flex-row-reverse text-right">
          <div className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center shadow">
            {player2.symbol}
          </div>
          <div>
            <div className="text-xs font-bold text-slate-200 truncate max-w-[85px] sm:max-w-none">
              {player2.name}
            </div>
            {/* Dots */}
            <div className="flex items-center justify-end gap-1 mt-0.5">
              {Array.from({ length: targetWins }).map((_, i) => (
                <span
                  key={`p2-dot-${i}`}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    i < tournament.p2Wins
                      ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)] scale-110'
                      : 'bg-slate-800 border border-slate-700'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
