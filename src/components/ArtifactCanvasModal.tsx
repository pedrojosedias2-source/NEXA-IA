import React, { useState } from 'react';
import { CodeArtifact } from '../types';
import { X, Play, Copy, Check, Download, Code as CodeIcon, Eye, RefreshCw } from 'lucide-react';

interface ArtifactCanvasModalProps {
  artifact: CodeArtifact | null;
  onClose: () => void;
}

export const ArtifactCanvasModal: React.FC<ArtifactCanvasModalProps> = ({ artifact, onClose }) => {
  if (!artifact) return null;

  const [activeView, setActiveView] = useState<'preview' | 'code'>(
    artifact.canPreview ? 'preview' : 'code'
  );
  const [editableCode, setEditableCode] = useState(artifact.code);
  const [copied, setCopied] = useState(false);
  const [key, setKey] = useState(0);

  const handleCopy = () => {
    navigator.clipboard.writeText(editableCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const ext =
      artifact.language === 'html'
        ? 'html'
        : artifact.language === 'typescript' || artifact.language === 'ts'
        ? 'ts'
        : artifact.language === 'tsx' || artifact.language === 'jsx'
        ? 'tsx'
        : artifact.language === 'json'
        ? 'json'
        : 'txt';

    const blob = new Blob([editableCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nexo-artifact.${ext}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Generate sandbox iframe source for preview
  const generatePreviewHtml = () => {
    if (artifact.language.toLowerCase() === 'svg') {
      return `<!DOCTYPE html><html><body style="margin:0;display:flex;align-items:center;justify-content:center;height:100vh;background:#081425;color:#fff;">${editableCode}</body></html>`;
    }

    if (editableCode.includes('<!DOCTYPE html>') || editableCode.includes('<html')) {
      return editableCode;
    }

    // Standard HTML wrapper with Tailwind CDN for interactive previews
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background: #081425; color: #d8e3fb; font-family: system-ui, sans-serif; padding: 1.5rem; }
  </style>
</head>
<body>
  ${editableCode}
</body>
</html>`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md">
      <div className="w-full max-w-5xl h-[88vh] flex flex-col bg-[#081425] border border-[#2a3548] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#2a3548] bg-[#0b172a]">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-[#38bdf8]"></span>
            <div>
              <h2 className="text-sm font-semibold text-[#d8e3fb]">{artifact.title}</h2>
              <p className="text-[11px] text-[#909096] font-mono lowercase">
                linguagem: {artifact.language}
              </p>
            </div>
          </div>

          {/* View Switcher & Action buttons */}
          <div className="flex items-center gap-2">
            {/* View Mode Segmented Control */}
            {artifact.canPreview && (
              <div className="flex items-center p-0.5 rounded-lg bg-[#111c2d] border border-[#2a3548]">
                <button
                  onClick={() => setActiveView('preview')}
                  className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    activeView === 'preview'
                      ? 'bg-[#1f2a3c] text-white shadow-sm'
                      : 'text-[#c6c6cc] hover:text-white'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Pré-visualização</span>
                </button>

                <button
                  onClick={() => setActiveView('code')}
                  className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    activeView === 'code'
                      ? 'bg-[#1f2a3c] text-white shadow-sm'
                      : 'text-[#c6c6cc] hover:text-white'
                  }`}
                >
                  <CodeIcon className="w-3.5 h-3.5" />
                  <span>Código</span>
                </button>
              </div>
            )}

            {activeView === 'preview' && (
              <button
                onClick={() => setKey((k) => k + 1)}
                className="p-1.5 rounded-lg text-[#c6c6cc] hover:text-white hover:bg-[#152031] transition-colors"
                title="Recarregar Pré-visualização"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-[#c6c6cc] hover:text-white hover:bg-[#152031] rounded-lg transition-colors border border-[#2a3548]"
              title="Copiar código"
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

            <button
              onClick={handleDownload}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-[#c6c6cc] hover:text-white hover:bg-[#152031] rounded-lg transition-colors border border-[#2a3548]"
              title="Baixar arquivo"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exportar</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-[#c6c6cc] hover:text-white hover:bg-[#152031] rounded-lg transition-colors"
              title="Fechar canvas"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content Body */}
        <div className="flex-1 overflow-hidden relative bg-[#040e1f]">
          {activeView === 'preview' && artifact.canPreview ? (
            <iframe
              key={key}
              title="Canvas Preview"
              srcDoc={generatePreviewHtml()}
              sandbox="allow-scripts allow-modals"
              className="w-full h-full border-none bg-[#081425]"
            />
          ) : (
            <div className="w-full h-full flex flex-col">
              <div className="p-2 bg-[#0b172a]/60 text-[11px] text-[#909096] border-b border-[#2a3548] flex items-center justify-between">
                <span>Editor interativo direto no navegador</span>
                <span className="font-mono text-[10px]">
                  {editableCode.split('\n').length} linhas
                </span>
              </div>
              <textarea
                value={editableCode}
                onChange={(e) => setEditableCode(e.target.value)}
                spellCheck={false}
                className="flex-1 w-full p-4 bg-[#040e1f] text-[#d8e3fb] font-mono text-xs sm:text-sm leading-relaxed resize-none focus:outline-none"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
