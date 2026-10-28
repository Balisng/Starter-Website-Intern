import React, { useEffect } from 'react';
import { X, ExternalLink, ZoomIn } from 'lucide-react';

interface ImageLightboxProps {
  src: string | null;
  alt?: string;
  onClose: () => void;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({ src, alt, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (src) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [src, onClose]);

  if (!src) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-backdrop cursor-zoom-out"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-4xl max-h-[90vh] bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-700/80 animate-modal cursor-default flex flex-col"
      >
        {/* Top bar with caption & close */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900/90 border-b border-slate-800 text-slate-200">
          <div className="flex items-center gap-2 truncate pr-4">
            <ZoomIn className="w-4 h-4 text-sky-400 shrink-0" />
            <span className="text-xs font-semibold truncate text-slate-300">
              {alt || 'ดูรูปภาพขนาดขยาย'}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-xl text-slate-400 hover:text-sky-400 hover:bg-slate-800 transition-colors"
              title="เปิดรูปในแท็บใหม่"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
              title="ปิด (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Image Display */}
        <div className="p-2 sm:p-4 bg-slate-950/60 flex items-center justify-center overflow-auto max-h-[75vh]">
          <img
            src={src}
            alt={alt || 'Enlarged preview'}
            className="max-h-[70vh] w-auto max-w-full rounded-2xl object-contain shadow-md"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800';
            }}
          />
        </div>
      </div>
    </div>
  );
};
