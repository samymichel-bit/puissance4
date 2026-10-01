import React from 'react';
import { PlayerConfig, AIDifficulty } from '../types';
import { X, Sliders, Volume2, VolumeX, Shield, Check } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  player1: PlayerConfig;
  player2: PlayerConfig;
  aiDifficulty: AIDifficulty;
  isSoundEnabled: boolean;
  onUpdateP1: (updates: Partial<PlayerConfig>) => void;
  onUpdateP2: (updates: Partial<PlayerConfig>) => void;
  onUpdateAIDifficulty: (diff: AIDifficulty) => void;
  onToggleSound: () => void;
}

const SYMBOL_PRESETS = ['X', 'O', '●', '▲', '★', '♦', '🔴', '🟡', '🔵', '🟢', '👑', '⚡'];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  player1,
  player2,
  aiDifficulty,
  isSoundEnabled,
  onUpdateP1,
  onUpdateP2,
  onUpdateAIDifficulty,
  onToggleSound,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">Personnalisation & Paramètres</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Joueur 1 Config */}
          <div className="space-y-3 bg-slate-950/50 p-4 rounded-xl border border-slate-800/80">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-rose-400 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500 inline-block shadow-sm shadow-rose-500" />
                Joueur 1 (Rouge)
              </span>
              <span className="text-xs text-slate-400 font-mono">Symbole actuel : {player1.symbol}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Nom du joueur</label>
                <input
                  type="text"
                  value={player1.name}
                  onChange={(e) => onUpdateP1({ name: e.target.value })}
                  maxLength={16}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Symbole</label>
                <input
                  type="text"
                  value={player1.symbol}
                  onChange={(e) => {
                    const char = e.target.value.slice(-2);
                    if (char) onUpdateP1({ symbol: char });
                  }}
                  maxLength={2}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-center font-bold text-rose-400 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-xs text-slate-500 mr-1 self-center">Préréglages :</span>
              {SYMBOL_PRESETS.slice(0, 6).map((sym) => (
                <button
                  key={`p1-sym-${sym}`}
                  onClick={() => onUpdateP1({ symbol: sym })}
                  className={`w-7 h-7 rounded text-xs font-bold transition-colors ${
                    player1.symbol === sym
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {sym}
                </button>
              ))}
            </div>
          </div>

          {/* Joueur 2 Config */}
          <div className="space-y-3 bg-slate-950/50 p-4 rounded-xl border border-slate-800/80">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-amber-400 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-400 inline-block shadow-sm shadow-amber-400" />
                Joueur 2 / IA (Jaune)
              </span>
              <span className="text-xs text-slate-400 font-mono">Symbole actuel : {player2.symbol}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Nom du joueur</label>
                <input
                  type="text"
                  value={player2.name}
                  onChange={(e) => onUpdateP2({ name: e.target.value })}
                  maxLength={16}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Symbole</label>
                <input
                  type="text"
                  value={player2.symbol}
                  onChange={(e) => {
                    const char = e.target.value.slice(-2);
                    if (char) onUpdateP2({ symbol: char });
                  }}
                  maxLength={2}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-center font-bold text-amber-400 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-xs text-slate-500 mr-1 self-center">Préréglages :</span>
              {SYMBOL_PRESETS.slice(6).map((sym) => (
                <button
                  key={`p2-sym-${sym}`}
                  onClick={() => onUpdateP2({ symbol: sym })}
                  className={`w-7 h-7 rounded text-xs font-bold transition-colors ${
                    player2.symbol === sym
                      ? 'bg-amber-600 text-slate-950 font-black'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {sym}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulté de l'IA (Minimax & Bitboards) */}
          <div className="space-y-3 bg-slate-950/50 p-4 rounded-xl border border-slate-800/80">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-400" />
                Niveau d'Intelligence Artificielle (IA)
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: 'STANDARD', label: 'Standard', desc: 'Facile++ (Profondeur 4)' },
                  { id: 'EXPERT', label: 'Expert', desc: 'Doué+ (Profondeur 6)' },
                  { id: 'MAITRE', label: 'Maître', desc: 'Pro/Légendaire (Profondeur 8)' },
                ] as const
              ).map((lvl) => (
                <button
                  key={lvl.id}
                  onClick={() => onUpdateAIDifficulty(lvl.id)}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    aiDifficulty === lvl.id
                      ? 'bg-purple-950/60 border-purple-500 text-white ring-1 ring-purple-500/50'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-semibold text-xs text-purple-300">{lvl.label}</span>
                    {aiDifficulty === lvl.id && <Check className="w-3.5 h-3.5 text-purple-400" />}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1">{lvl.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Audio toggle */}
          <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-xl border border-slate-800/80">
            <div className="flex items-center gap-3">
              {isSoundEnabled ? (
                <Volume2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <VolumeX className="w-5 h-5 text-slate-500" />
              )}
              <div>
                <div className="text-sm font-medium text-white">Effets sonores (Web Audio)</div>
                <div className="text-xs text-slate-400">Sons de chute de jetons et mélodie de victoire</div>
              </div>
            </div>
            <button
              onClick={onToggleSound}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                isSoundEnabled
                  ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              {isSoundEnabled ? 'Activé' : 'Désactivé'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-600/20 transition-colors"
          >
            Enregistrer & Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
