import React from 'react';
import { X, Sliders, RotateCcw, Check } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  systemInstruction: string;
  setSystemInstruction: (val: string) => void;
  temperature: number;
  setTemperature: (val: number) => void;
  topP: number;
  setTopP: (val: number) => void;
  onResetDefaults: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  systemInstruction,
  setSystemInstruction,
  temperature,
  setTemperature,
  topP,
  setTopP,
  onResetDefaults,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[#081425] border border-[#2a3548] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a3548] bg-[#0b172a]">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#38bdf8]" />
            <h2 className="text-sm font-semibold text-[#d8e3fb]">
              Parâmetros de Inferência Neural
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#c6c6cc] hover:text-white hover:bg-[#152031] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* System Instruction */}
          <div>
            <label className="block text-xs font-semibold text-[#d8e3fb] mb-1.5">
              Instrução do Sistema (Personalidade & Papel)
            </label>
            <textarea
              rows={3}
              value={systemInstruction}
              onChange={(e) => setSystemInstruction(e.target.value)}
              placeholder="Defina as diretrizes operacionais do modelo..."
              className="w-full p-2.5 rounded-lg bg-[#111c2d] border border-[#2a3548] text-xs text-[#d8e3fb] focus:outline-none focus:border-[#3b82f6] leading-relaxed resize-none"
            />
          </div>

          {/* Temperature */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-[#d8e3fb]">Temperatura (Criatividade vs Precisão)</span>
              <span className="font-mono text-[#38bdf8] tabular-nums">{temperature.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full accent-[#3b82f6] bg-[#111c2d] h-1.5 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#909096] mt-1">
              <span>Determinístico (0.0)</span>
              <span>Equilibrado (0.7)</span>
              <span>Criativo (1.0)</span>
            </div>
          </div>

          {/* Top P */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-[#d8e3fb]">Top P (Nucleus Sampling)</span>
              <span className="font-mono text-[#d2bbff] tabular-nums">{topP.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.05"
              value={topP}
              onChange={(e) => setTopP(parseFloat(e.target.value))}
              className="w-full accent-[#7c3aed] bg-[#111c2d] h-1.5 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-[#2a3548] bg-[#0b172a]">
          <button
            onClick={onResetDefaults}
            className="flex items-center gap-1.5 text-xs text-[#909096] hover:text-[#d8e3fb] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar Padrões</span>
          </button>

          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white glow-btn-primary rounded-lg"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Salvar Preferências</span>
          </button>
        </div>
      </div>
    </div>
  );
};
