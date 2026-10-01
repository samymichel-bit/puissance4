import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Share2, PlusSquare, X } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // Si déjà installé en mode autonome, masquer
  if (isInstalled) {
    return null;
  }

  // Android / Chrome / Edge
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs shadow-md shadow-emerald-950/40 transition-all active:scale-95"
        title="Installer l'application sur votre appareil"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Installer</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition-all active:scale-95"
          title="Installer sur iPhone / iPad"
        >
          <Download className="w-3.5 h-3.5 text-blue-400" />
          <span>Installer</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Download className="w-5 h-5 text-blue-400" /> Installer sur iPhone
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs sm:text-sm text-slate-300">
                <p className="text-slate-400">Pour ajouter l'application sur votre écran d'accueil sans passer par l'App Store :</p>
                <div className="flex items-start gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">1. Appuyez sur Partager</div>
                    <div className="text-xs text-slate-400">Dans la barre du bas de Safari (icône carré avec flèche).</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                    <PlusSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">2. « Sur l'écran d'accueil »</div>
                    <div className="text-xs text-slate-400">Faites défiler vers le bas puis confirmez avec « Ajouter ».</div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold"
              >
                C'est compris !
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
