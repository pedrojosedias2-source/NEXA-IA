import React, { useState, useEffect } from 'react';
import { ViewTab, ModelId } from '../types';
import { AVAILABLE_MODELS } from '../data/models';
import {
  Search,
  MessageSquare,
  Users,
  Scale,
  Activity,
  Code,
  Plus,
  Trash2,
  Cpu,
  Download,
  X,
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: ViewTab) => void;
  onNewSession: () => void;
  onClearSession: () => void;
  onSelectModel: (model: ModelId) => void;
  onExportMarkdown: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  onNewSession,
  onClearSession,
  onSelectModel,
  onExportMarkdown,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actions = [
    {
      id: 'tab-chat',
      title: 'Ir para Chat & Studio',
      icon: <MessageSquare className="w-4 h-4 text-[#38bdf8]" />,
      action: () => {
        onSelectTab('chat');
        onClose();
      },
      category: 'Navegação',
    },
    {
      id: 'tab-agents',
      title: 'Ir para Multi-Agentes Neurais',
      icon: <Users className="w-4 h-4 text-[#3b82f6]" />,
      action: () => {
        onSelectTab('agents');
        onClose();
      },
      category: 'Navegação',
    },
    {
      id: 'tab-promptlab',
      title: 'Ir para Prompt Lab & Benchmark',
      icon: <Scale className="w-4 h-4 text-[#d2bbff]" />,
      action: () => {
        onSelectTab('prompt-lab');
        onClose();
      },
      category: 'Navegação',
    },
    {
      id: 'tab-telemetry',
      title: 'Ir para Telemetria & Diagnóstico',
      icon: <Activity className="w-4 h-4 text-emerald-400" />,
      action: () => {
        onSelectTab('telemetry');
        onClose();
      },
      category: 'Navegação',
    },
    {
      id: 'tab-artifacts',
      title: 'Ir para Galeria de Artefatos & Canvas',
      icon: <Code className="w-4 h-4 text-[#adc6ff]" />,
      action: () => {
        onSelectTab('artifacts');
        onClose();
      },
      category: 'Navegação',
    },
    {
      id: 'act-new-session',
      title: 'Iniciar Nova Conversa',
      icon: <Plus className="w-4 h-4 text-white" />,
      action: () => {
        onNewSession();
        onClose();
      },
      category: 'Ações Rápidas',
    },
    {
      id: 'act-export',
      title: 'Exportar Conversa como Markdown',
      icon: <Download className="w-4 h-4 text-[#38bdf8]" />,
      action: () => {
        onExportMarkdown();
        onClose();
      },
      category: 'Ações Rápidas',
    },
    {
      id: 'act-clear',
      title: 'Limpar Mensagens da Sessão Atual',
      icon: <Trash2 className="w-4 h-4 text-red-400" />,
      action: () => {
        onClearSession();
        onClose();
      },
      category: 'Ações Rápidas',
    },
    ...AVAILABLE_MODELS.map((model) => ({
      id: `model-${model.id}`,
      title: `Trocar Modelo para: ${model.name}`,
      icon: <Cpu className="w-4 h-4 text-[#adc6ff]" />,
      action: () => {
        onSelectModel(model.id);
        onClose();
      },
      category: 'Modelos',
    })),
  ];

  const filtered = actions.filter((a) =>
    a.title.toLowerCase().includes(query.toLowerCase()) ||
    a.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-[#081425] border border-[#2a3548] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#2a3548] bg-[#0b172a]">
          <Search className="w-4 h-4 text-[#909096]" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Digite um comando, navegação ou modelo..."
            className="flex-1 bg-transparent text-sm text-[#d8e3fb] placeholder-[#909096] focus:outline-none"
          />
          <kbd className="px-2 py-0.5 rounded bg-[#111c2d] border border-[#2a3548] text-[11px] font-mono text-[#909096]">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-xs text-[#909096]">
              Nenhum comando encontrado para "{query}".
            </div>
          ) : (
            filtered.map((item) => (
              <button
                key={item.id}
                onClick={item.action}
                className="w-full flex items-center justify-between p-2.5 rounded-lg text-left text-xs text-[#d8e3fb] hover:bg-[#152031] transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1 rounded-md bg-[#111c2d] border border-[#2a3548] group-hover:border-[#3b82f6]/40">
                    {item.icon}
                  </div>
                  <span className="font-medium">{item.title}</span>
                </div>
                <span className="text-[10px] text-[#909096] uppercase font-mono">
                  {item.category}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
