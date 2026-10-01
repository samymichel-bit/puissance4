import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Share2, Copy, Check, QrCode, X, Users, Smartphone } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomCode?: string | null;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, roomCode }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const getShareUrl = () => {
    if (typeof window === 'undefined') return '';
    const base = window.location.origin + window.location.pathname;
    return roomCode ? `${base}?room=${roomCode}` : base;
  };

  const shareUrl = getShareUrl();

  useEffect(() => {
    if (isOpen && shareUrl) {
      QRCode.toDataURL(shareUrl, {
        width: 280,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('Erreur génération QR Code', err));
    }
  }, [isOpen, shareUrl]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Puissance 4 Multijoueur',
          text: roomCode
            ? `Rejoins ma partie de Puissance 4 ! Code de salle : ${roomCode}`
            : 'Joue au Puissance 4 avec moi sur mobile !',
          url: shareUrl,
        });
      } catch {
        // Ignorer l'annulation
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-5 text-center">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-left">
            <Smartphone className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="text-base font-bold text-white">
                {roomCode ? 'Inviter à la partie en ligne' : 'Transférer sur un téléphone'}
              </h3>
              <p className="text-[11px] text-slate-400">Scannez ou partagez le lien</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Room Code Badge (if active) */}
        {roomCode && (
          <div className="bg-blue-950/60 border border-blue-500/40 p-3 rounded-2xl">
            <div className="text-[11px] text-blue-300 font-semibold uppercase tracking-wider">
              Code de la salle
            </div>
            <div className="text-2xl font-black text-white tracking-widest font-mono mt-0.5">
              {roomCode}
            </div>
          </div>
        )}

        {/* QR Code Container */}
        <div className="flex flex-col items-center justify-center p-3 bg-white rounded-2xl shadow-inner mx-auto w-fit">
          {qrDataUrl ? (
            <img src={qrDataUrl} alt="QR Code" className="w-48 h-48 sm:w-56 sm:h-56 rounded-lg" />
          ) : (
            <div className="w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center text-slate-400 font-mono text-xs">
              Génération du QR Code...
            </div>
          )}
        </div>

        <p className="text-xs text-slate-400">
          Ouvrez l'appareil photo de n'importe quel smartphone et pointez vers le code pour rejoindre instantanément.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 pt-1">
          <button
            onClick={handleNativeShare}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all active:scale-95"
          >
            <Share2 className="w-4 h-4" /> Partager (WhatsApp, SMS...)
          </button>

          <button
            onClick={handleCopy}
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" /> Lien copié dans le presse-papier !
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" /> Copier le lien
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
