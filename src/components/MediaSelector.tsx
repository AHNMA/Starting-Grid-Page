import React, { useEffect, useState } from 'react';
import { X, Image as LucideImage } from 'lucide-react';
import { MediaFile } from '../types';
import { createPortal } from 'react-dom';

interface MediaSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}

export default function MediaSelector({ isOpen, onClose, onSelect }: MediaSelectorProps) {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch('/api/media')
        .then(res => res.json())
        .then(data => {
          setMediaFiles(Array.isArray(data) ? data : []);
          setLoading(false);
        })
        .catch(err => {
          console.error('Failed to load media files:', err);
          setLoading(false);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#141414] border border-white/20 rounded-2xl w-full max-w-5xl h-[80vh] flex flex-col shadow-2xl relative z-[10000]">

        <div className="p-6 border-b border-white/10 flex items-center justify-between shrink-0">
          <h2 className="text-2xl font-bold uppercase italic flex items-center gap-3 text-white">
            <LucideImage className="w-6 h-6 text-red-600" />
            Media Center
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              Lade Bilder...
            </div>
          ) : mediaFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <LucideImage className="w-16 h-16 mb-4 opacity-20" />
              <p>Keine Bilder im Media Center gefunden.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {mediaFiles.map((file) => (
                <div
                  key={file.name}
                  className="bg-zinc-900 border border-zinc-800 hover:border-red-600/50 transition-all cursor-pointer group relative flex flex-col rounded-xl overflow-hidden"
                  onClick={() => onSelect(file.url)}
                >
                  <div className="aspect-square relative bg-zinc-950 flex items-center justify-center p-2">
                    <img
                      src={file.url}
                      alt={file.name}
                      className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all">
                        Auswählen
                      </span>
                    </div>
                  </div>
                  <div className="p-3 bg-zinc-900">
                    <p className="text-xs text-gray-300 truncate" title={file.name}>{file.name}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>,
    document.body
  );
}
