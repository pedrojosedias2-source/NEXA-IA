import React, { useState } from 'react';
import { CodeArtifact } from '../types';
import { Play, Copy, Check, Download, FileCode, Plus, Search } from 'lucide-react';

interface ArtifactsCatalogViewProps {
  artifacts: CodeArtifact[];
  onOpenArtifact: (artifact: CodeArtifact) => void;
  onCreateArtifact: (artifact: CodeArtifact) => void;
}

export const ArtifactsCatalogView: React.FC<ArtifactsCatalogViewProps> = ({
  artifacts,
  onOpenArtifact,
  onCreateArtifact,
}) => {
  const [filterLang, setFilterLang] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Default initial samples if none extracted yet
  const defaultArtifacts: CodeArtifact[] = [
    {
      id: 'sample-1',
      title: 'Botão Glassmórfico com Gradiente Neural',
      language: 'html',
      canPreview: true,
      code: `<div class="flex items-center justify-center min-h-[300px] bg-[#081425]">
  <button class="relative px-8 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-[#7c3aed] to-[#3b82f6] shadow-[0_0_25px_rgba(59,130,246,0.5)] hover:shadow-[0_0_35px_rgba(59,130,246,0.8)] transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0">
    <span class="flex items-center gap-2">
      <svg class="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
      Executar Inferência Neural
    </span>
  </button>
</div>`,
    },
    {
      id: 'sample-2',
      title: 'Card de Métrica com Gráfico SVG Interativo',
      language: 'html',
      canPreview: true,
      code: `<div class="p-6 max-w-sm mx-auto bg-[#111c2d] border border-[#2a3548] rounded-2xl shadow-xl font-sans">
  <div class="flex items-center justify-between text-xs text-[#909096] mb-2">
    <span>Throughput Neural</span>
    <span class="text-emerald-400 font-mono">+18.4%</span>
  </div>
  <div class="text-3xl font-bold text-[#d8e3fb] font-mono mb-4">98.4 tok/s</div>
  <svg class="w-full h-16 stroke-[#3b82f6]" fill="none" viewBox="0 0 200 60">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M0 50 Q 50 10, 100 35 T 200 15" />
    <circle cx="200" cy="15" r="4" fill="#38bdf8" />
  </svg>
</div>`,
    },
  ];

  const allArtifacts = artifacts.length > 0 ? artifacts : defaultArtifacts;

  const filtered = allArtifacts.filter((item) => {
    const matchesLang = filterLang === 'all' || item.language.toLowerCase() === filterLang.toLowerCase();
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) || item.code.toLowerCase().includes(search.toLowerCase());
    return matchesLang && matchesSearch;
  });

  const handleCopy = (art: CodeArtifact) => {
    navigator.clipboard.writeText(art.code);
    setCopiedId(art.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2a3548] pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#d8e3fb] tracking-tight">
            Galeria de Artefatos & Canvas
          </h1>
          <p className="text-sm text-[#c6c6cc] mt-1">
            Explore e execute protótipos de código, UI components e scripts gerados pelas conversas.
          </p>
        </div>

        <button
          onClick={() => {
            const newArt: CodeArtifact = {
              id: `custom-${Date.now()}`,
              title: 'Novo Componente HTML/CSS',
              language: 'html',
              canPreview: true,
              code: `<div class="p-8 text-center text-white bg-slate-900 rounded-xl">\n  <h2 class="text-xl font-bold">Protótipo Rápido</h2>\n  <p class="text-slate-400 mt-2">Edite diretamente no Canvas!</p>\n</div>`,
            };
            onCreateArtifact(newArt);
            onOpenArtifact(newArt);
          }}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white glow-btn-primary rounded-md self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Criar Artefato</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Language Filter Buttons (Zero-Pill: functional segmented button controls) */}
        <div className="flex items-center gap-1 p-1 bg-[#111c2d] rounded-lg border border-[#2a3548] overflow-x-auto">
          {['all', 'html', 'tsx', 'javascript', 'json'].map((lang) => (
            <button
              key={lang}
              onClick={() => setFilterLang(lang)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                filterLang === lang
                  ? 'bg-[#1f2a3c] text-white shadow-sm'
                  : 'text-[#c6c6cc] hover:text-white'
              }`}
            >
              {lang === 'all' ? 'Todos' : lang.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#909096]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filtrar artefatos..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#111c2d] border border-[#2a3548] rounded-md text-xs text-[#d8e3fb] placeholder-[#909096] focus:outline-none focus:border-[#3b82f6]"
          />
        </div>
      </div>

      {/* Grid of Artifacts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="flex flex-col p-4 rounded-xl bg-[#0b172a] border border-[#2a3548] hover:border-[#3b82f6]/40 transition-colors shadow-lg"
          >
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#1f2a3c]">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-[#38bdf8]" />
                <h3 className="font-semibold text-sm text-[#d8e3fb]">{item.title}</h3>
              </div>

              <span className="text-[11px] font-mono text-[#adc6ff] lowercase">
                {item.language}
              </span>
            </div>

            <pre className="flex-1 p-3 bg-[#040e1f] rounded-lg text-xs font-mono text-[#c6c6cc] overflow-x-auto max-h-36 mb-3">
              <code>{item.code}</code>
            </pre>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-[#909096]">
                {item.code.split('\n').length} linhas
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(item)}
                  className="p-1.5 rounded-lg text-[#c6c6cc] hover:text-white hover:bg-[#152031] transition-colors"
                  title="Copiar código"
                >
                  {copiedId === item.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>

                {item.canPreview && (
                  <button
                    onClick={() => onOpenArtifact(item)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#152031] hover:bg-[#1f2a3c] text-xs font-medium text-[#38bdf8] border border-[#3b82f6]/40 transition-colors"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Abrir no Canvas</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
