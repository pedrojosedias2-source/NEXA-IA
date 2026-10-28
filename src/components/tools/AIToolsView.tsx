import React, { useState } from 'react';
import { AIToolConfig } from '../../types/superapp';
import { AI_TOOLS_CATALOG } from '../../data/mockSuperappData';
import { streamGeminiResponse } from '../../services/geminiService';
import {
  PenTool,
  Languages,
  FileText,
  Lightbulb,
  GraduationCap,
  BookOpen,
  Sparkles,
  CheckSquare,
  Play,
  RotateCcw,
  Copy,
  Check,
  Info,
} from 'lucide-react';

interface AIToolsViewProps {
  selectedToolId?: string;
}

export const AIToolsView: React.FC<AIToolsViewProps> = ({ selectedToolId }) => {
  const [activeTool, setActiveTool] = useState<AIToolConfig>(
    AI_TOOLS_CATALOG.find((t) => t.id === selectedToolId) || AI_TOOLS_CATALOG[0]
  );

  const [inputVal, setInputVal] = useState('');
  const [secondaryVal, setSecondaryVal] = useState<string>(
    activeTool.secondaryOptions ? activeTool.secondaryOptions[0] : ''
  );
  const [isLoading, setIsLoading] = useState(false);
  const [resultOutput, setResultOutput] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSelectTool = (tool: AIToolConfig) => {
    setActiveTool(tool);
    setInputVal('');
    setSecondaryVal(tool.secondaryOptions ? tool.secondaryOptions[0] : '');
    setResultOutput('');
  };

  const handleExecute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || isLoading) return;

    setIsLoading(true);
    setResultOutput('');

    const formattedPrompt = `[Ferramenta: ${activeTool.title} - Opção: ${secondaryVal}]\n\nInstrução/Entrada do Utilizador:\n${inputVal}\n\nExecute a tarefa solicitada com excelência e precisão em Português:`;

    let accumulated = '';
    await streamGeminiResponse(
      formattedPrompt,
      'gemini-3.8-flash',
      `Você é o módulo de inteligência especializada da Nexo AI para a tarefa de ${activeTool.title}. Responda em Português com formatação Markdown impecável e foco no objetivo do usuário.`,
      [],
      [],
      {
        onChunk: (chunk) => {
          accumulated += chunk;
          setResultOutput(accumulated);
        },
        onDone: () => {
          setIsLoading(false);
        },
        onError: () => {
          setIsLoading(false);
        },
      }
    );
  };

  const handleCopy = () => {
    if (!resultOutput) return;
    navigator.clipboard.writeText(resultOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getToolIcon = (iconName: string) => {
    switch (iconName) {
      case 'PenTool':
        return <PenTool className="w-5 h-5 text-[#38bdf8]" />;
      case 'Languages':
        return <Languages className="w-5 h-5 text-[#7c3aed]" />;
      case 'FileText':
        return <FileText className="w-5 h-5 text-[#3b82f6]" />;
      case 'Lightbulb':
        return <Lightbulb className="w-5 h-5 text-amber-400" />;
      case 'GraduationCap':
        return <GraduationCap className="w-5 h-5 text-emerald-400" />;
      case 'BookOpen':
        return <BookOpen className="w-5 h-5 text-[#d2bbff]" />;
      case 'Sparkles':
        return <Sparkles className="w-5 h-5 text-[#38bdf8]" />;
      case 'CheckSquare':
        return <CheckSquare className="w-5 h-5 text-emerald-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-[#38bdf8]" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="border-b border-[#2a3548] pb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-[#d8e3fb] light:text-slate-900 tracking-tight">
          Suíte de Ferramentas de Inteligência Artificial
        </h1>
        <p className="text-xs text-[#909096] mt-0.5">
          Cartões dedicados para 8 tarefas essenciais de produtividade, escrita e aprendizado.
        </p>
      </div>

      {/* Grid of 8 Tool Selector Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {AI_TOOLS_CATALOG.map((tool) => {
          const isSelected = activeTool.id === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => handleSelectTool(tool)}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                isSelected
                  ? 'bg-[#152031] light:bg-slate-100 border-[#3b82f6] shadow-lg shadow-[#3b82f6]/10'
                  : 'bg-[#0b172a] light:bg-white border-[#2a3548] light:border-slate-200 hover:border-[#3b82f6]/40'
              }`}
            >
              <div className="mb-2 p-1.5 rounded-xl bg-[#111c2d] light:bg-slate-200 w-fit">
                {getToolIcon(tool.iconName)}
              </div>
              <h3 className="text-xs font-bold text-[#d8e3fb] light:text-slate-900 line-clamp-1">
                {tool.title}
              </h3>
              <p className="text-[10px] text-[#909096] mt-0.5 line-clamp-2">
                {tool.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Active Tool Execution Form */}
      <div className="p-6 rounded-3xl bg-[#0b172a] light:bg-white border border-[#2a3548] light:border-slate-200 shadow-2xl space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-[#1f2a3c] light:border-slate-200">
          <div className="p-2 rounded-xl bg-[#111c2d] light:bg-slate-100">
            {getToolIcon(activeTool.iconName)}
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-[#d8e3fb] light:text-slate-900">
              {activeTool.title}
            </h2>
            <p className="text-xs text-[#909096]">{activeTool.description}</p>
          </div>
        </div>

        <form onSubmit={handleExecute} className="space-y-4">
          {/* Secondary Option Selector if available */}
          {activeTool.secondaryOptions && (
            <div>
              <label className="block text-xs font-semibold text-[#d8e3fb] light:text-slate-900 mb-1.5">
                {activeTool.secondaryOptionLabel}
              </label>
              <div className="flex flex-wrap gap-2">
                {activeTool.secondaryOptions.map((opt) => (
                  <button
                    type="button"
                    key={opt}
                    onClick={() => setSecondaryVal(opt)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                      secondaryVal === opt
                        ? 'bg-[#3b82f6] text-white'
                        : 'bg-[#111c2d] light:bg-slate-100 text-[#909096] hover:text-[#d8e3fb]'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Primary Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-[#d8e3fb] light:text-slate-900">
                {activeTool.inputLabel}
              </label>
              <button
                type="button"
                onClick={() => setInputVal(activeTool.samplePrompt)}
                className="text-[11px] text-[#38bdf8] hover:underline"
              >
                Preencher Exemplo
              </button>
            </div>
            <textarea
              rows={4}
              required
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder={activeTool.inputPlaceholder}
              className="w-full p-3.5 rounded-2xl bg-[#111c2d] light:bg-slate-100 border border-[#2a3548] light:border-slate-300 text-xs sm:text-sm text-[#d8e3fb] light:text-slate-900 focus:outline-none focus:border-[#3b82f6] leading-relaxed resize-none"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-[#909096] flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-[#38bdf8]" />
              Inferência neural conectada via servidor seguro
            </span>

            <button
              type="submit"
              disabled={isLoading || !inputVal.trim()}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold text-white glow-btn-primary disabled:opacity-40 transition-all"
            >
              {isLoading ? (
                <>
                  <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                  <span>Processando...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Executar Ferramenta</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Output Stream Result */}
        {(resultOutput || isLoading) && (
          <div className="mt-4 p-5 rounded-2xl bg-[#081425] light:bg-slate-50 border border-[#2a3548] light:border-slate-200 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#1f2a3c] light:border-slate-200">
              <span className="text-xs font-bold text-[#d8e3fb] light:text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#38bdf8]" />
                Resultado da Geração
              </span>

              <button
                onClick={handleCopy}
                disabled={!resultOutput}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-[#adc6ff] hover:bg-[#152031] transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Resultado</span>
                  </>
                )}
              </button>
            </div>

            <div className="text-xs sm:text-sm text-[#d8e3fb] light:text-slate-800 leading-relaxed whitespace-pre-wrap">
              {resultOutput}
              {isLoading && <span className="streaming-cursor" />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
