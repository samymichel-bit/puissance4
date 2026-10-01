import React from 'react';
import { Trophy, X, Flame, RotateCcw, Swords, CheckCircle2 } from 'lucide-react';
import { TournamentState, PlayerConfig } from '../types';

interface TournamentModalProps {
  isOpen: boolean;
  tournament: TournamentState;
  player1: PlayerConfig;
  player2: PlayerConfig;
  onClose: () => void;
  onStartTournament: (totalMatches: 3 | 5) => void;
  onRestartTournament: () => void;
}

export const TournamentModal: React.FC<TournamentModalProps> = ({
  isOpen,
  tournament,
  player1,
  player2,
  onClose,
  onStartTournament,
  onRestartTournament,
}) => {
  const [selectedFormat, setSelectedFormat] = React.useState<3 | 5>(3);

  if (!isOpen) return null;

  // Si le tournoi est terminé, afficher l'écran de sacre et de score cumulé
  if (tournament.isCompleted) {
    const isP1Champion = tournament.champion !== 'draw' && tournament.champion?.id === 1;
    const isP2Champion = tournament.champion !== 'draw' && tournament.champion?.id === 2;
    const isDrawTournament = tournament.champion === 'draw';

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
        <div className="bg-slate-900 border-2 border-amber-500/60 rounded-3xl p-5 sm:p-6 w-full max-w-md shadow-2xl relative flex flex-col items-center text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Big Golden Trophy */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-200 p-1 shadow-[0_0_40px_rgba(251,191,36,0.6)] mb-3 flex items-center justify-center animate-bounce">
            <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center">
              <Trophy className="w-10 h-10 text-amber-400" />
            </div>
          </div>

          <span className="text-[11px] font-mono tracking-widest uppercase text-amber-400 font-bold bg-amber-950/70 px-3 py-1 rounded-full border border-amber-500/40 mb-2">
            RÉSULTAT DU TOURNOI
          </span>

          <h2 className="text-xl sm:text-2xl font-black text-white mb-1">
            {isDrawTournament || !tournament.champion || tournament.champion === 'draw'
              ? 'Égalité Parfaite !'
              : `🏆 ${tournament.champion.name} Sacré Champion !`}
          </h2>

          <p className="text-xs sm:text-sm text-slate-400 mb-4">
            {isDrawTournament
              ? 'Aucun vainqueur départagé à l’issue de la série.'
              : `Victoire finale avec ${
                  isP1Champion ? tournament.p1Wins : tournament.p2Wins
                } victoires sur ${tournament.totalMatches} matchs.`}
          </p>

          {/* Final Cumulative Score Box */}
          <div className="w-full bg-slate-950 rounded-2xl p-4 border border-slate-800 mb-4">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Score Cumulé Final
            </div>
            <div className="flex items-center justify-around">
              <div className="flex flex-col items-center">
                <span className="text-sm font-bold text-slate-200">{player1.name}</span>
                <span className="text-3xl font-black text-rose-500">{tournament.p1Wins}</span>
              </div>
              <span className="text-2xl font-black text-slate-600">-</span>
              <div className="flex flex-col items-center">
                <span className="text-sm font-bold text-slate-200">{player2.name}</span>
                <span className="text-3xl font-black text-amber-400">{tournament.p2Wins}</span>
              </div>
            </div>
            {tournament.draws > 0 && (
              <div className="text-[10px] text-slate-500 mt-2">
                {tournament.draws} match(s) nul(s)
              </div>
            )}
          </div>

          {/* Round-by-round recap */}
          <div className="w-full bg-slate-950/60 rounded-xl p-3 border border-slate-800/80 mb-5 text-left">
            <div className="text-[11px] font-semibold text-slate-400 mb-2">
              Détail des manches :
            </div>
            <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
              {tournament.roundHistory.map((r) => (
                <div
                  key={`round-res-${r.round}`}
                  className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-slate-900 border border-slate-800"
                >
                  <span className="text-slate-400 font-medium">Match {r.round} :</span>
                  <span
                    className={`font-bold ${
                      r.winnerId === 1
                        ? 'text-rose-400'
                        : r.winnerId === 2
                        ? 'text-amber-400'
                        : 'text-slate-400'
                    }`}
                  >
                    {r.winnerId === 'draw' ? 'Match Nul' : `Victoire de ${r.winnerName}`}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 w-full">
            <button
              onClick={onRestartTournament}
              className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
            >
              <RotateCcw className="w-4 h-4" /> Revanche
            </button>
            <button
              onClick={onClose}
              className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl text-xs sm:text-sm active:scale-95 transition-all"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Écran de configuration / Lancement du tournoi
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 w-full max-w-md shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Swords className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white">Lancer un Tournoi</h2>
            <p className="text-xs text-slate-400">Défiez vos amis sur une série de matchs</p>
          </div>
        </div>

        {/* Players Matchup Preview */}
        <div className="bg-slate-950 rounded-2xl p-3 border border-slate-800 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-rose-500 text-white font-bold text-xs flex items-center justify-center">
              {player1.symbol}
            </div>
            <span className="text-xs font-bold text-slate-200">{player1.name}</span>
          </div>

          <span className="text-xs font-black text-amber-400">VS</span>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-200">{player2.name}</span>
            <div className="w-7 h-7 rounded-full bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center">
              {player2.symbol}
            </div>
          </div>
        </div>

        {/* Format Selection: 3 or 5 matches */}
        <div className="space-y-3 mb-5">
          <label className="text-xs font-semibold text-slate-300">Format de la série :</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setSelectedFormat(3)}
              className={`p-3 rounded-2xl border flex flex-col items-center text-center transition-all ${
                selectedFormat === 3
                  ? 'bg-amber-950/40 border-amber-500 text-white ring-2 ring-amber-500/30 shadow-md'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="text-sm font-black mb-0.5">Série de 3 matchs</span>
              <span className="text-[10px] text-amber-400/90 font-medium">Premier à 2 victoires</span>
            </button>

            <button
              onClick={() => setSelectedFormat(5)}
              className={`p-3 rounded-2xl border flex flex-col items-center text-center transition-all ${
                selectedFormat === 5
                  ? 'bg-amber-950/40 border-amber-500 text-white ring-2 ring-amber-500/30 shadow-md'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="text-sm font-black mb-0.5">Série de 5 matchs</span>
              <span className="text-[10px] text-amber-400/90 font-medium">Premier à 3 victoires</span>
            </button>
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={() => {
            onStartTournament(selectedFormat);
            onClose();
          }}
          className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
        >
          <Trophy className="w-4 h-4" /> Démarrer la série ({selectedFormat} matchs)
        </button>
      </div>
    </div>
  );
};
