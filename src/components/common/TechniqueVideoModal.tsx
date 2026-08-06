import React from 'react';
import { X, Video, ExternalLink, Play, Sparkles } from 'lucide-react';

interface TechniqueVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  focusText?: string;
  videoUrl?: string;
}

export const TechniqueVideoModal: React.FC<TechniqueVideoModalProps> = ({
  isOpen,
  onClose,
  title,
  focusText,
  videoUrl,
}) => {
  if (!isOpen) return null;

  const parseEmbedUrl = (url?: string) => {
    if (!url) return null;
    const cleanUrl = url.trim();

    // YouTube regex
    const ytMatch = cleanUrl.match(
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/
    );
    if (ytMatch && ytMatch[1]) {
      return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0`;
    }

    // Vimeo regex
    const vimeoMatch = cleanUrl.match(/vimeo\.com\/(?:video\/)?([0-9]+)/);
    if (vimeoMatch && vimeoMatch[1]) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
    }

    return null;
  };

  const embedUrl = parseEmbedUrl(videoUrl);
  const isDirectVideo = videoUrl?.match(/\.(mp4|webm|ogg)$/i);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
      <div className="bg-slate-900 border border-amber-500/50 rounded-2xl max-w-2xl w-full text-white shadow-2xl overflow-hidden relative flex flex-col my-auto">
        
        {/* Header */}
        <div className="p-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">
                Vídeo Demonstrativo da Técnica
              </span>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-100">{title}</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            title="Fechar Vídeo"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-4">
          {focusText && (
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] font-bold text-amber-400 block">Técnica em Destaque:</span>
                <p className="text-xs text-slate-200 font-medium">{focusText}</p>
              </div>
            </div>
          )}

          {/* Video Container */}
          <div className="bg-black rounded-xl overflow-hidden border border-slate-800 aspect-video relative flex items-center justify-center">
            {embedUrl ? (
              <iframe
                src={embedUrl}
                title={`Vídeo: ${title}`}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : isDirectVideo && videoUrl ? (
              <video
                src={videoUrl}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            ) : videoUrl ? (
              <div className="text-center p-6 space-y-3">
                <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30">
                  <Play className="w-6 h-6 ml-0.5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-200">Vídeo Externo da Posição</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                    Clique no botão abaixo para assistir ao vídeo no link fornecido pelo professor.
                  </p>
                </div>
                <a
                  href={videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-lg transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  Abrir Vídeo Completo
                </a>
              </div>
            ) : (
              <div className="text-center p-8 space-y-2 text-slate-500">
                <Video className="w-10 h-10 mx-auto opacity-40" />
                <p className="text-xs">Nenhum link de vídeo foi informado para esta posição.</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950/90 border-t border-slate-800 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
