import React, { useState } from 'react';
import { Session, ModelId } from '../types';
import { AVAILABLE_MODELS } from '../data/models';
import {
  MessageSquare,
  Search,
  Pin,
  Trash2,
  X,
  Plus,
  Sliders,
  ExternalLink,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: Session[];
  currentSessionId: string;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string) => void;
  onTogglePinSession: (id: string) => void;
  selectedModel: ModelId;
  onSelectModel: (model: ModelId) => void;
  onOpenSettingsModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  sessions,
  currentSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onTogglePinSession,
  selectedModel,
  onSelectModel,
  onOpenSettingsModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedSessions = filteredSessions.filter((s) => s.isPinned);
  const recentSessions = filteredSessions.filter((s) => !s.isPinned);

  const currentModelInfo = AVAILABLE_MODELS.find((m) => m.id === selectedModel) || AVAILABLE_MODELS[0];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Slide-over sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 sm:w-80 bg-[#081425] border-r border-[#2a3548] flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-[#2a3548]/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]"></span>
            <span className="text-sm font-semibold text-[#d8e3fb]">Histórico & Modelos</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#c6c6cc] hover:text-white hover:bg-[#152031] transition-colors"
            title="Fechar menu lateral"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* New Chat & Search */}
        <div className="p-3 space-y-2 border-b border-[#2a3548]/50">
          <button
            onClick={() => {
              onNewSession();
              if (window.innerWidth < 1024) onClose();
            }}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-white glow-btn-primary rounded-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Criar Nova Conversa</span>
          </button>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#909096]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar conversas..."
              className="w-full pl-9 pr-3 py-1.5 bg-[#111c2d] border border-[#2a3548] rounded-md text-xs text-[#d8e3fb] placeholder-[#909096] focus:outline-none focus:border-[#3b82f6]"
            />
          </div>
        </div>

        {/* Sessions list */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
          {pinnedSessions.length > 0 && (
            <div>
              <div className="px-2 mb-1.5 text-[11px] font-medium tracking-wide text-[#909096] uppercase">
                Fixados
              </div>
              <div className="space-y-1">
                {pinnedSessions.map((s) => (
                  <SessionListItem
                    key={s.id}
                    session={s}
                    isActive={s.id === currentSessionId}
                    onSelect={() => {
                      onSelectSession(s.id);
                      if (window.innerWidth < 1024) onClose();
                    }}
                    onDelete={() => onDeleteSession(s.id)}
                    onTogglePin={() => onTogglePinSession(s.id)}
                  />
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="px-2 mb-1.5 text-[11px] font-medium tracking-wide text-[#909096] uppercase">
              Recentes ({recentSessions.length})
            </div>
            {recentSessions.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-[#909096]">
                Nenhuma conversa encontrada.
              </div>
            ) : (
              <div className="space-y-1">
                {recentSessions.map((s) => (
                  <SessionListItem
                    key={s.id}
                    session={s}
                    isActive={s.id === currentSessionId}
                    onSelect={() => {
                      onSelectSession(s.id);
                      if (window.innerWidth < 1024) onClose();
                    }}
                    onDelete={() => onDeleteSession(s.id)}
                    onTogglePin={() => onTogglePinSession(s.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Model Selector footer card */}
        <div className="p-3 border-t border-[#2a3548] bg-[#040e1f]/80">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#909096] uppercase">Motor Neural Ativo</span>
            <button
              onClick={onOpenSettingsModal}
              className="text-[#909096] hover:text-[#d8e3fb] p-1 rounded"
              title="Ajustar parâmetros de inferência"
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1">
            {AVAILABLE_MODELS.map((model) => (
              <button
                key={model.id}
                onClick={() => onSelectModel(model.id)}
                className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors flex items-center justify-between ${
                  selectedModel === model.id
                    ? 'bg-[#1f2a3c] text-[#d8e3fb] border border-[#3b82f6]/50'
                    : 'text-[#c6c6cc] hover:bg-[#111c2d]'
                }`}
              >
                <div className="truncate pr-1">
                  <div className="font-medium truncate">{model.name}</div>
                  <div className="text-[10px] text-[#909096] truncate">{model.tagline}</div>
                </div>
                <span className="text-[10px] text-[#adc6ff] font-mono shrink-0 tabular-nums">
                  {model.avgLatencyMs}ms
                </span>
              </button>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
};

interface SessionListItemProps {
  session: Session;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onTogglePin: () => void;
}

const SessionListItem: React.FC<SessionListItemProps> = ({
  session,
  isActive,
  onSelect,
  onDelete,
  onTogglePin,
}) => {
  return (
    <div
      onClick={onSelect}
      className={`group relative flex items-center justify-between px-2.5 py-2 rounded-md cursor-pointer transition-colors text-xs ${
        isActive
          ? 'bg-[#152031] text-[#d8e3fb] font-medium border border-[#3b82f6]/40'
          : 'text-[#c6c6cc] hover:bg-[#111c2d] hover:text-[#d8e3fb]'
      }`}
    >
      <div className="flex items-center gap-2 overflow-hidden pr-6">
        <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#3b82f6]' : 'text-[#909096]'}`} />
        <span className="truncate">{session.title}</span>
      </div>

      <div className="absolute right-2 opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity bg-inherit">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onTogglePin();
          }}
          className={`p-1 rounded hover:bg-[#2a3548] ${session.isPinned ? 'text-[#3b82f6]' : 'text-[#909096]'}`}
          title={session.isPinned ? 'Desafixar conversa' : 'Fixar conversa'}
        >
          <Pin className="w-3 h-3" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1 rounded text-[#909096] hover:text-[#ffb4ab] hover:bg-[#2a3548]"
          title="Excluir conversa"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
