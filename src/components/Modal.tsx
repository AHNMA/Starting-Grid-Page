import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (val?: string) => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  inputMode?: boolean;
  inputValue?: string;
  onInputChange?: (value: string) => void;
}

export default function Modal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Bestätigen',
  cancelText = 'Abbrechen',
  inputMode = false,
  inputValue = '',
  onInputChange
}: ModalProps) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#1a1a1a] border border-white/20 rounded-xl p-6 w-full max-w-md shadow-2xl relative z-[10000]">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <h3 className="text-xl font-bold uppercase italic mb-4 text-white">{title}</h3>
        <p className="text-gray-300 mb-4">{message}</p>
        
        {inputMode && (
          <div className="mb-8">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => onInputChange?.(e.target.value)}
              className="w-full bg-[#141414] border border-white/10 rounded-lg p-3 text-white focus:border-red-500 outline-none"
              autoFocus
            />
          </div>
        )}

        <div className={`flex justify-end gap-3 ${!inputMode ? 'mt-8' : ''}`}>
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white font-bold transition-colors"
          >
            {cancelText}
          </button>
          <button 
            onClick={() => onConfirm(inputMode ? inputValue : undefined)}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold transition-colors"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
