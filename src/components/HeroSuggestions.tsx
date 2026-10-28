import React from 'react';
import { PROMPT_ACCELERATORS } from '../data/models';
import { Layers, Server, ShieldCheck, Database, Zap, Cpu, Sparkles } from 'lucide-react';

interface HeroSuggestionsProps {
  onSelectPrompt: (prompt: string) => void;
}

export const HeroSuggestions: React.FC<HeroSuggestionsProps> = ({ onSelectPrompt }) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Layers':
        return <Layers className="w-4 h-4 text-[#38bdf8]" />;
      case 'Server':
        return <Server className="w-4 h-4 text-[#3b82f6]" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-4 h-4 text-[#d2bbff]" />;
      case 'Database':
        return <Database className="w-4 h-4 text-[#adc6ff]" />;
      default:
        return <Sparkles className="w-4 h-4 text-[#38bdf8]" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center px-4 py-8 max-w-4xl mx-auto w-full">
      {/* Brand & Headline */}
      <div className="text-center space-y-3 mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#152031] border border-[#3b82f6]/30 text-xs text-[#adc6ff] mb-2 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-[#38bdf8]" />
          <span>Nexo Neural Engine 2026</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#d8e3fb] [text-wrap:balance]">
          Inteligência Artificial de Alta Performance
        </h1>

        <p className="text-sm sm:text-base text-[#c6c6cc] max-w-2xl mx-auto leading-relaxed [text-wrap:balance]">
          Orquestre agentes autônomos, acelere arquiteturas de software e gere soluções técnicas de precisão em tempo real.
        </p>

        {/* Quiet metadata features (Zero-Pill Discipline) */}
        <div className="flex items-center justify-center gap-3 text-xs text-[#909096] pt-1">
          <span>Streaming SSE em Tempo Real</span>
          <span aria-hidden="true">·</span>
          <span>Inferência Multimodal</span>
          <span aria-hidden="true">·</span>
          <span>Latência Sub-50ms</span>
        </div>
      </div>

      {/* 4 Domain Accelerator Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full">
        {PROMPT_ACCELERATORS.map((item, index) => (
          <button
            key={index}
            onClick={() => onSelectPrompt(item.prompt)}
            className="group text-left p-4 rounded-xl bg-[#111c2d]/70 hover:bg-[#152031] border border-[#2a3548]/70 hover:border-[#3b82f6]/50 transition-all duration-200 shadow-sm hover:shadow-[0_4px_20px_rgba(59,130,246,0.12)] cursor-pointer"
          >
            <div className="flex items-center gap-2 mb-2 text-xs text-[#adc6ff] font-medium">
              {getIcon(item.icon)}
              <span>{item.category}</span>
            </div>

            <h3 className="text-sm font-semibold text-[#d8e3fb] group-hover:text-white transition-colors mb-1.5">
              {item.title}
            </h3>

            <p className="text-xs text-[#909096] line-clamp-2 leading-relaxed">
              {item.prompt}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};
