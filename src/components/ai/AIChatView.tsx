import React, { useState, useRef, useEffect } from 'react';
import { Session, Message, ModelId, Attachment } from '../../types';
import { PromptBar } from '../PromptBar';
import { MessageItem } from '../MessageItem';
import {
  Sparkles,
  Info,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  MessageSquare,
  FileText,
  Languages,
  BookOpen,
  PenTool,
  Lightbulb,
} from 'lucide-react';

interface AIChatViewProps {
  sessions: Session[];
  currentSessionId: string;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string) => void;
  onRenameSession: (id: string, newTitle: string) => void;
  selectedModel: ModelId;
  onSelectModel: (model: ModelId) => void;
  onSendMessage: (text: string, attachments: Attachment[]) => void;
  isStreaming: boolean;
  onStopStreaming: () => void;
  onOpenArtifact: (artifact: any) => void;
  onFeedback: (id: string, feedback: 'up' | 'down') => void;
}

export const AIChatView: React.FC<AIChatViewProps> = ({
  sessions,
  currentSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onRenameSession,
  selectedModel,
  onSelectModel,
  onSendMessage,
  isStreaming,
  onStopStreaming,
  onOpenArtifact,
  onFeedback,
}) => {
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [hasServerApiKey, setHasServerApiKey] = useState<boolean | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check backend Gemini status
  useEffect(() => {
    fetch('/api/system/health')
      .then((res) => res.json())
      .then((data) => setHasServerApiKey(Boolean(data.geminiLive)))
      .catch(() => setHasServerApiKey(false));
  }, []);

  const currentSession =
    sessions.find((s) => s.id === currentSessionId) || sessions[0] || {
      id: 'default',
      title: 'Conversa Inicial',
      messages: [],
    };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentSession.messages]);

  const quickPrompts = [
    {
      label: 'Resumir Texto',
      icon: <FileText className="w-3.5 h-3.5 text-[#38bdf8]" />,
      prompt: 'Por favor, resuma o seguinte texto destacando os 3 principais pontos executivos:',
    },
    {
      label: 'Traduzir',
      icon: <Languages className="w-3.5 h-3.5 text-[#7c3aed]" />,
      prompt: 'Traduza o seguinte trecho para Português Europeu formal e natural:',
    },
    {
      label: 'Explicar Matéria',
      icon: <BookOpen className="w-3.5 h-3.5 text-emerald-400" />,
      prompt: 'Explique de forma didática e com um exemplo prático do quotidiano:',
    },
    {
      label: 'Escrever Documento',
      icon: <PenTool className="w-3.5 h-3.5 text-[#d2bbff]" />,
      prompt: 'Redija uma proposta técnica profissional com introdução, escopo e benefícios:',
    },
    {
      label: 'Gerar Ideias',
      icon: <Lightbulb className="w-3.5 h-3.5 text-amber-400" />,
      prompt: 'Gere 5 ideias inovadoras e viáveis para solucionar o seguinte problema:',
    },
  ];

  const handleStartRename = (session: Session) => {
    setEditingSessionId(session.id);
    setEditTitle(session.title);
  };

  const handleSaveRename = (id: string) => {
    if (editTitle.trim()) {
      onRenameSession(id, editTitle.trim());
    }
    setEditingSessionId(null);
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] max-w-5xl mx-auto w-full px-2 sm:px-4">
      {/* API Status Notice (Compliant with Section 3) */}
      <div className="mt-2 mb-1 px-3 py-2 rounded-xl bg-[#111c2d] light:bg-slate-100 border border-[#2a3548] light:border-slate-300 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          {hasServerApiKey ? (
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Modelo Real Conectado via Servidor
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
              <Info className="w-3.5 h-3.5" />
              Modo de Demonstração (API não configurada no servidor)
            </span>
          )}
          <span className="text-[#909096] hidden sm:inline">
            · Chaves secretas protegidas no backend
          </span>
        </div>

        {/* Quick Session List Dropdown / Selector */}
        <div className="flex items-center gap-1">
          <button
            onClick={onNewSession}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#152031] light:bg-slate-200 text-[#d8e3fb] light:text-slate-900 hover:bg-[#1f2a3c] text-xs font-semibold"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Nova Conversa</span>
          </button>
        </div>
      </div>

      {/* Sessions Horizontal Pill Bar */}
      <div className="flex items-center gap-1.5 py-2 overflow-x-auto no-scrollbar border-b border-[#2a3548]/50">
        {sessions.map((s) => {
          const isCurrent = s.id === currentSessionId;
          const isEditing = editingSessionId === s.id;

          return (
            <div
              key={s.id}
              onClick={() => onSelectSession(s.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-all shrink-0 ${
                isCurrent
                  ? 'bg-[#152031] light:bg-slate-200 text-[#d8e3fb] light:text-slate-900 border border-[#3b82f6]/40'
                  : 'bg-[#0b172a] light:bg-slate-100 text-[#909096] hover:text-[#d8e3fb] light:hover:text-slate-800'
              }`}
            >
              <MessageSquare className="w-3 h-3 text-[#38bdf8]" />

              {isEditing ? (
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-28 px-1 py-0.5 bg-[#081425] text-white rounded text-[11px] outline-none"
                    autoFocus
                  />
                  <button
                    onClick={() => handleSaveRename(s.id)}
                    className="text-emerald-400 hover:text-white"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => setEditingSessionId(null)}
                    className="text-red-400 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <>
                  <span className="truncate max-w-[120px]">{s.title}</span>
                  {isCurrent && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartRename(s);
                      }}
                      className="p-0.5 text-[#909096] hover:text-[#d8e3fb]"
                      title="Renomear conversa"
                    >
                      <Edit2 className="w-2.5 h-2.5" />
                    </button>
                  )}
                  {sessions.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSession(s.id);
                      }}
                      className="p-0.5 text-[#909096] hover:text-red-400"
                      title="Eliminar conversa"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto py-4 space-y-2">
        {currentSession.messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#7c3aed] to-[#3b82f6] p-[2px] shadow-lg">
              <div className="w-full h-full bg-[#081425] rounded-[14px] flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-[#38bdf8]" />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-[#d8e3fb] light:text-slate-900">
                Como posso ajudar você agora?
              </h3>
              <p className="text-xs text-[#909096] max-w-sm mx-auto mt-1 leading-relaxed">
                Envie uma pergunta ou utilize os atalhos abaixo para acelerar sua redação, traduções e ideias.
              </p>
            </div>

            {/* Quick Action Shortcuts */}
            <div className="flex flex-wrap items-center justify-center gap-2 max-w-md pt-2">
              {quickPrompts.map((qp, i) => (
                <button
                  key={i}
                  onClick={() => onSendMessage(qp.prompt, [])}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#111c2d] light:bg-slate-100 hover:bg-[#152031] border border-[#2a3548] light:border-slate-200 text-xs text-[#d8e3fb] light:text-slate-800 transition-colors"
                >
                  {qp.icon}
                  <span>{qp.label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div>
            {currentSession.messages.map((message) => (
              <MessageItem
                key={message.id}
                message={message}
                onOpenArtifact={onOpenArtifact}
                onFeedback={onFeedback}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Floating Bottom Input Bar */}
      <div className="sticky bottom-0 z-30 pt-2">
        <PromptBar
          onSendMessage={onSendMessage}
          isStreaming={isStreaming}
          onStopStreaming={onStopStreaming}
          selectedModel={selectedModel}
          onSelectModel={onSelectModel}
        />
      </div>
    </div>
  );
};
