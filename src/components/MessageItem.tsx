import React, { useState } from 'react';
import { Message, CodeArtifact } from '../types';
import {
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  User,
  Play,
  Clock,
  Zap,
} from 'lucide-react';

interface MessageItemProps {
  message: Message;
  onOpenArtifact: (artifact: CodeArtifact) => void;
  onFeedback: (id: string, feedback: 'up' | 'down') => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  onOpenArtifact,
  onFeedback,
}) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const copyFullContent = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className={`py-5 px-4 sm:px-6 transition-colors ${
        isUser ? 'bg-[#081425]' : 'bg-[#0b172a]/40 border-y border-[#1f2a3c]/40'
      }`}
    >
      <div className="max-w-4xl mx-auto flex gap-4">
        {/* Avatar */}
        <div className="shrink-0 mt-0.5">
          {isUser ? (
            <div className="w-8 h-8 rounded-lg bg-[#152031] border border-[#2a3548] flex items-center justify-center text-[#d8e3fb]">
              <User className="w-4 h-4 text-[#adc6ff]" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#7c3aed] to-[#3b82f6] p-[1px] shadow-[0_0_12px_rgba(59,130,246,0.3)]">
              <div className="w-full h-full bg-[#081425] rounded-[7px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-[#38bdf8]" />
              </div>
            </div>
          )}
        </div>

        {/* Message Content & Metadata */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Unboxed Metadata (Zero-Pill Discipline) */}
          <div className="flex items-center gap-2 text-xs text-[#909096]">
            <span className="font-semibold text-[#d8e3fb]">
              {isUser ? 'Você' : message.agentName || 'Nexo AI'}
            </span>
            <span aria-hidden="true">·</span>
            <span>{formattedTime}</span>

            {!isUser && message.model && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-[#adc6ff]">{message.model}</span>
              </>
            )}

            {!isUser && message.latencyMs && (
              <>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums font-mono text-[#38bdf8]">
                  {message.latencyMs}ms
                </span>
              </>
            )}

            {!isUser && message.tokensPerSec && (
              <>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums font-mono text-[#d2bbff]">
                  {message.tokensPerSec} tok/s
                </span>
              </>
            )}
          </div>

          {/* User Attachments display */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1 pb-2">
              {message.attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center gap-2 p-1.5 rounded-lg bg-[#111c2d] border border-[#2a3548] text-xs text-[#d8e3fb]"
                >
                  {att.previewUrl && (
                    <img
                      src={att.previewUrl}
                      alt={att.name}
                      className="w-8 h-8 object-cover rounded"
                    />
                  )}
                  <div className="truncate max-w-[180px]">
                    <div className="font-medium truncate">{att.name}</div>
                    <div className="text-[10px] text-[#909096]">
                      {(att.size / 1024).toFixed(1)} KB
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Render Parsed Content */}
          <div className="text-[#d8e3fb] text-sm sm:text-[15px] leading-relaxed break-words space-y-3">
            <MarkdownRenderer
              content={message.content}
              onOpenArtifact={onOpenArtifact}
              isStreaming={Boolean(message.isStreaming)}
            />
            {message.isStreaming && <span className="streaming-cursor" />}
          </div>

          {/* Assistant Action Bar (Copy, Feedback) */}
          {!isUser && !message.isStreaming && (
            <div className="flex items-center justify-between pt-2 text-xs text-[#909096]">
              <div className="flex items-center gap-2">
                <button
                  onClick={copyFullContent}
                  className="flex items-center gap-1 px-2 py-1 rounded hover:bg-[#152031] hover:text-[#d8e3fb] transition-colors"
                  title="Copiar mensagem completa"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>

                <div className="h-3 w-px bg-[#2a3548]"></div>

                <button
                  onClick={() => onFeedback(message.id, 'up')}
                  className={`p-1 rounded hover:bg-[#152031] transition-colors ${
                    message.feedback === 'up' ? 'text-[#3b82f6]' : 'hover:text-[#d8e3fb]'
                  }`}
                  title="Resposta útil"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => onFeedback(message.id, 'down')}
                  className={`p-1 rounded hover:bg-[#152031] transition-colors ${
                    message.feedback === 'down' ? 'text-red-400' : 'hover:text-[#d8e3fb]'
                  }`}
                  title="Resposta insatisfatória"
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {message.tokenCount && (
                <div className="text-[11px] font-mono text-[#909096] tabular-nums">
                  ~{message.tokenCount} tokens processados
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Markdown & Code Blocks Parser
interface MarkdownRendererProps {
  content: string;
  onOpenArtifact: (artifact: CodeArtifact) => void;
  isStreaming: boolean;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, onOpenArtifact }) => {
  // Split content by code fences ```
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-3">
      {parts.map((part, index) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const firstLineEnd = part.indexOf('\n');
          const lang = part.substring(3, firstLineEnd).trim() || 'text';
          const code = part.substring(firstLineEnd + 1, part.length - 3);

          const artifact: CodeArtifact = {
            id: `art-${index}`,
            title: `Snippet (${lang})`,
            language: lang,
            code,
            canPreview: ['html', 'jsx', 'tsx', 'svg', 'javascript'].includes(lang.toLowerCase()),
          };

          return (
            <CodeBlock
              key={index}
              artifact={artifact}
              onOpenArtifact={() => onOpenArtifact(artifact)}
            />
          );
        }

        return <TextBlock key={index} text={part} />;
      })}
    </div>
  );
};

// Individual Code Block with copy & interactive canvas preview
interface CodeBlockProps {
  artifact: CodeArtifact;
  onOpenArtifact: () => void;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ artifact, onOpenArtifact }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(artifact.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-lg overflow-hidden border border-[#2a3548] bg-[#040e1f] font-mono text-xs shadow-lg">
      {/* Code Header */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-[#111c2d] border-b border-[#2a3548]">
        <span className="text-[#adc6ff] font-medium tracking-wide lowercase">
          {artifact.language || 'código'}
        </span>

        <div className="flex items-center gap-2">
          {artifact.canPreview && (
            <button
              onClick={onOpenArtifact}
              className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] text-[#38bdf8] hover:bg-[#1f2a3c] transition-colors"
              title="Abrir e executar no Canvas"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Canvas</span>
            </button>
          )}

          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] text-[#c6c6cc] hover:text-white hover:bg-[#1f2a3c] transition-colors"
            title="Copiar código para a área de transferência"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">Copiado</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copiar</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Content */}
      <div className="p-3.5 overflow-x-auto text-[#d8e3fb] leading-relaxed">
        <pre>
          <code>{artifact.code}</code>
        </pre>
      </div>
    </div>
  );
};

// Text Block parser for bold, headers, lists and tables
const TextBlock: React.FC<{ text: string }> = ({ text }) => {
  if (!text.trim()) return null;

  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let tableRows: string[] = [];

  const flushTable = () => {
    if (tableRows.length > 0) {
      elements.push(
        <div key={`table-${elements.length}`} className="my-3 overflow-x-auto">
          <table className="w-full text-left text-xs border border-[#2a3548] rounded-lg overflow-hidden">
            <tbody>
              {tableRows.map((row, rIdx) => {
                const isHeader = rIdx === 0;
                const isDivider = row.includes('---');
                if (isDivider) return null;

                const cells = row
                  .split('|')
                  .map((c) => c.trim())
                  .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);

                return (
                  <tr
                    key={rIdx}
                    className={
                      isHeader
                        ? 'bg-[#152031] font-semibold text-[#d8e3fb] border-b border-[#2a3548]'
                        : 'border-b border-[#1f2a3c] hover:bg-[#111c2d]/60'
                    }
                  >
                    {cells.map((cell, cIdx) => (
                      <td key={cIdx} className="px-3 py-2 text-[#c6c6cc]">
                        {parseInlineMarkup(cell)}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
    }
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    // Table detection
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      tableRows.push(trimmed);
      return;
    } else {
      flushTable();
    }

    // Headings
    if (trimmed.startsWith('### ')) {
      elements.push(
        <h3 key={idx} className="text-base sm:text-lg font-bold text-[#d8e3fb] mt-4 mb-2 tracking-tight">
          {parseInlineMarkup(trimmed.slice(4))}
        </h3>
      );
      return;
    }

    if (trimmed.startsWith('## ')) {
      elements.push(
        <h2 key={idx} className="text-lg sm:text-xl font-bold text-[#d8e3fb] mt-5 mb-2.5 tracking-tight">
          {parseInlineMarkup(trimmed.slice(3))}
        </h2>
      );
      return;
    }

    if (trimmed.startsWith('# ')) {
      elements.push(
        <h1 key={idx} className="text-xl sm:text-2xl font-bold text-[#d8e3fb] mt-6 mb-3 tracking-tight">
          {parseInlineMarkup(trimmed.slice(2))}
        </h1>
      );
      return;
    }

    // Bullet points
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      elements.push(
        <div key={idx} className="flex items-start gap-2 pl-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6] mt-2 shrink-0"></span>
          <span className="text-[#c6c6cc]">{parseInlineMarkup(trimmed.slice(2))}</span>
        </div>
      );
      return;
    }

    // Numbered lists
    const numberMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (numberMatch) {
      elements.push(
        <div key={idx} className="flex items-start gap-2 pl-2">
          <span className="text-[#adc6ff] font-mono text-xs font-semibold shrink-0 mt-0.5">
            {numberMatch[1]}.
          </span>
          <span className="text-[#c6c6cc]">{parseInlineMarkup(numberMatch[2])}</span>
        </div>
      );
      return;
    }

    // Standard paragraph
    if (trimmed) {
      elements.push(
        <p key={idx} className="text-[#c6c6cc]">
          {parseInlineMarkup(trimmed)}
        </p>
      );
    }
  });

  flushTable();

  return <>{elements}</>;
};

function parseInlineMarkup(text: string): React.ReactNode {
  // Handle inline code `code`
  const codeParts = text.split(/(`[^`]+`)/g);

  return codeParts.map((part, i) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={i}
          className="px-1.5 py-0.5 mx-0.5 rounded bg-[#111c2d] border border-[#2a3548] font-mono text-[12px] text-[#38bdf8]"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    // Handle **bold**
    const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
    return boldParts.map((bPart, j) => {
      if (bPart.startsWith('**') && bPart.endsWith('**')) {
        return (
          <strong key={`${i}-${j}`} className="font-semibold text-[#d8e3fb]">
            {bPart.slice(2, -2)}
          </strong>
        );
      }
      return bPart;
    });
  });
}
