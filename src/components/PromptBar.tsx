import React, { useState, useRef, useEffect, ChangeEvent, KeyboardEvent } from 'react';
import { ModelId, Attachment } from '../types';
import { AVAILABLE_MODELS } from '../data/models';
import {
  Send,
  Paperclip,
  Mic,
  MicOff,
  Square,
  Sparkles,
  ChevronDown,
  X,
  FileText,
  Image as ImageIcon,
  Cpu,
} from 'lucide-react';

interface PromptBarProps {
  onSendMessage: (text: string, attachments: Attachment[]) => void;
  isStreaming: boolean;
  onStopStreaming: () => void;
  selectedModel: ModelId;
  onSelectModel: (model: ModelId) => void;
}

export const PromptBar: React.FC<PromptBarProps> = ({
  onSendMessage,
  isStreaming,
  onStopStreaming,
  selectedModel,
  onSelectModel,
}) => {
  const [promptText, setPromptText] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Auto-resize textarea smoothly
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 180)}px`;
    }
  }, [promptText]);

  // Handle outside click for model dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsModelDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Web Speech API for voice dictation
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'pt-BR';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setPromptText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('Reconhecimento de voz não suportado pelo seu navegador atual. Use o Google Chrome ou Edge.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error('Falha ao iniciar reconhecimento de voz:', err);
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if ((!promptText.trim() && attachments.length === 0) || isStreaming) return;
    onSendMessage(promptText.trim(), attachments);
    setPromptText('');
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const rawResult = e.target?.result as string;
        const base64Data = rawResult.split(',')[1] || '';

        const newAttachment: Attachment = {
          id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          name: file.name,
          size: file.size,
          mimeType: file.type || 'application/octet-stream',
          data: base64Data,
          previewUrl: file.type.startsWith('image/') ? rawResult : undefined,
        };

        setAttachments((prev) => [...prev, newAttachment]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const currentModel = AVAILABLE_MODELS.find((m) => m.id === selectedModel) || AVAILABLE_MODELS[0];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-4 pt-2">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          handleFileUpload(e.dataTransfer.files);
        }}
        className={`relative glass-input-well rounded-2xl p-3 sm:p-3.5 transition-all duration-200 ${
          isDragOver ? 'border-[#3b82f6] ring-2 ring-[#3b82f6]/40' : ''
        }`}
      >
        {/* Multimodal Attachment Chips Preview */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-2.5 pb-2.5 border-b border-[#2a3548]/60">
            {attachments.map((att) => (
              <div
                key={att.id}
                className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-full bg-[#152031] border border-[#3b82f6]/40 text-xs text-[#d8e3fb]"
              >
                {att.previewUrl ? (
                  <img
                    src={att.previewUrl}
                    alt={att.name}
                    className="w-4 h-4 object-cover rounded-full"
                  />
                ) : (
                  <FileText className="w-3.5 h-3.5 text-[#3b82f6]" />
                )}
                <span className="truncate max-w-[140px] text-[11px]">{att.name}</span>
                <button
                  onClick={() => removeAttachment(att.id)}
                  className="p-0.5 rounded-full hover:bg-[#2a3548] text-[#c6c6cc] hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Text Input area */}
        <div className="relative">
          <textarea
            ref={textareaRef}
            rows={1}
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isRecording
                ? 'Escutando sua voz em tempo real...'
                : 'Envie sua instrução, código ou arquitetura para o Nexo AI...'
            }
            className="w-full bg-transparent text-[#d8e3fb] placeholder-[#909096] text-sm sm:text-base resize-none focus:outline-none min-h-[44px] max-h-[180px] leading-relaxed"
          />

          {/* Voice recording wave pulse indicator */}
          {isRecording && (
            <div className="absolute right-2 top-2 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/40 text-[11px] text-red-300 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              <span>Gravando áudio</span>
            </div>
          )}
        </div>

        {/* Bottom Toolbar & Action buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2 mt-2 pt-2 border-t border-[#2a3548]/40">
          {/* Left Actions: Attachments, Voice, Model Selection */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* File Upload Trigger */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleFileUpload(e.target.files)}
              multiple
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              aria-label="Anexar arquivo ou imagem"
              className="p-2 rounded-lg text-[#c6c6cc] hover:text-[#d8e3fb] hover:bg-[#152031] transition-colors"
              title="Anexar arquivo, imagem ou código"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Voice Dictation Trigger */}
            <button
              onClick={toggleRecording}
              aria-label={isRecording ? 'Parar gravação' : 'Gravar por voz'}
              className={`p-2 rounded-lg transition-colors ${
                isRecording
                  ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                  : 'text-[#c6c6cc] hover:text-[#d8e3fb] hover:bg-[#152031]'
              }`}
              title={isRecording ? 'Parar gravação' : 'Ditar prompt por voz'}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Model Selector Chip Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsModelDropdownOpen((prev) => !prev)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[#111c2d] hover:bg-[#152031] border border-[#2a3548] text-xs text-[#d8e3fb] transition-colors"
              >
                <Cpu className="w-3.5 h-3.5 text-[#3b82f6]" />
                <span className="font-medium text-[11px] sm:text-xs">{currentModel.name}</span>
                <ChevronDown className="w-3 h-3 text-[#909096]" />
              </button>

              {/* Dropdown Menu */}
              {isModelDropdownOpen && (
                <div className="absolute left-0 bottom-full mb-2 w-72 p-1.5 rounded-xl bg-[#081425] border border-[#2a3548] shadow-2xl z-50">
                  <div className="px-2 py-1 text-[10px] font-semibold text-[#909096] uppercase tracking-wider">
                    Modelos Disponíveis
                  </div>
                  {AVAILABLE_MODELS.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => {
                        onSelectModel(model.id);
                        setIsModelDropdownOpen(false);
                      }}
                      className={`w-full text-left p-2 rounded-lg text-xs transition-colors ${
                        selectedModel === model.id
                          ? 'bg-[#152031] text-[#d8e3fb] border border-[#3b82f6]/40'
                          : 'text-[#c6c6cc] hover:bg-[#111c2d]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-semibold text-[#d8e3fb]">{model.name}</span>
                        <span className="text-[10px] font-mono text-[#adc6ff] tabular-nums">
                          ~{model.avgLatencyMs}ms
                        </span>
                      </div>
                      <p className="text-[11px] text-[#909096] leading-tight">{model.tagline}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Action: Send / Stop button */}
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-[11px] text-[#909096]">
              <kbd className="px-1.5 py-0.5 bg-[#111c2d] rounded text-[10px] font-mono border border-[#2a3548]">
                Enter
              </kbd>{' '}
              enviar
            </span>

            {isStreaming ? (
              <button
                onClick={onStopStreaming}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 rounded-lg transition-colors"
                title="Interromper geração"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Parar</span>
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={!promptText.trim() && attachments.length === 0}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white glow-btn-primary rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                title="Executar prompt neural"
              >
                <span>Executar</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
