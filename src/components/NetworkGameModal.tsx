import React, { useState } from 'react';
import { networkPeer } from '../engine/MultiplayerPeer';
import { Wifi, Plus, LogIn, Users, Check, Copy, ArrowRight, Loader2, X } from 'lucide-react';

interface NetworkGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnected: (role: 'host' | 'client', roomCode: string) => void;
  activeRoomCode: string | null;
  onOpenShareModal: () => void;
}

export const NetworkGameModal: React.FC<NetworkGameModalProps> = ({
  isOpen,
  onClose,
  onConnected,
  activeRoomCode,
  onOpenShareModal,
}) => {
  const [tab, setTab] = useState<'create' | 'join'>('create');
  const [inputCode, setInputCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [createdCode, setCreatedCode] = useState<string | null>(activeRoomCode);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCreateRoom = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const code = await networkPeer.createRoom();
      setCreatedCode(code);
      onConnected('host', code);
    } catch {
      setErrorMsg('Impossible de créer la salle.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputCode.trim().toUpperCase();
    if (!clean) return;

    setIsLoading(true);
    setErrorMsg(null);
    try {
      const success = await networkPeer.joinRoom(clean);
      if (success) {
        onConnected('client', clean);
        onClose();
      }
    } catch {
      setErrorMsg('Impossible de rejoindre la salle.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (!createdCode) return;
    const url = `${window.location.origin}${window.location.pathname}?room=${createdCode}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
              <Wifi className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Partie 2 Téléphones (Réseau & En ligne)</h3>
              <p className="text-[11px] text-slate-400">Jouez chacun sur votre écran en temps réel</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 bg-slate-950 rounded-2xl border border-slate-800">
          <button
            onClick={() => setTab('create')}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              tab === 'create'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Plus className="w-4 h-4" /> Créer une salle
          </button>
          <button
            onClick={() => setTab('join')}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              tab === 'join'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LogIn className="w-4 h-4" /> Rejoindre
          </button>
        </div>

        {/* Tab 1: Créer */}
        {tab === 'create' && (
          <div className="space-y-4 text-center">
            {createdCode ? (
              <div className="space-y-3 bg-slate-950/70 p-4 rounded-2xl border border-blue-500/30">
                <div className="text-xs text-blue-300 font-semibold uppercase tracking-wider">
                  Votre salle est ouverte !
                </div>
                <div className="text-3xl font-black text-white font-mono tracking-widest">
                  {createdCode}
                </div>
                <p className="text-xs text-slate-400">
                  Transmettez ce code à votre ami ou faites-lui scanner le QR Code.
                </p>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={onOpenShareModal}
                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-600/30 transition-all"
                  >
                    Afficher QR Code
                  </button>
                  <button
                    onClick={handleCopyLink}
                    className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copié !' : 'Copier lien'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 py-2">
                <p className="text-xs text-slate-400">
                  Créez une salle pour inviter un ami sur le même Wi-Fi ou à distance. Vous jouerez avec les jetons Rouges (J1).
                </p>
                <button
                  onClick={handleCreateRoom}
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-2xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Création en cours...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" /> Générer mon code de salle
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Rejoindre */}
        {tab === 'join' && (
          <form onSubmit={handleJoinRoom} className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1.5 font-medium">
                Entrez le code de la salle (ex: P4-1234)
              </label>
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                placeholder="P4-..."
                maxLength={8}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-lg font-mono font-bold tracking-widest text-center text-white focus:outline-none focus:border-blue-500 uppercase placeholder-slate-700"
                autoFocus
              />
            </div>

            {errorMsg && <div className="text-xs text-rose-400 text-center">{errorMsg}</div>}

            <button
              type="submit"
              disabled={isLoading || !inputCode.trim()}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-2xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition-all active:scale-95"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Connexion...
                </>
              ) : (
                <>
                  <ArrowRight className="w-4 h-4" /> Rejoindre la partie (Joueur 2)
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
