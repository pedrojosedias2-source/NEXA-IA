import React, { useState } from 'react';
import { ModelId } from '../types';
import { AVAILABLE_MODELS } from '../data/models';
import { streamGeminiResponse } from '../services/geminiService';
import { Play, Copy, Check, Sparkles, Scale, Gauge } from 'lucide-react';

export const PromptLabView: React.FC = () => {
  const [modelA, setModelA] = useState<ModelId>('gemini-3.8-flash');
  const [modelB, setModelB] = useState<ModelId>('gemini-4-argon');

  const [prompt, setPrompt] = useState(
    'Explique o algoritmo Raft de consenso distribuído e como ele lida com a eleição de líder durante uma partição de rede.'
  );

  const [isRunning, setIsRunning] = useState(false);

  const [outputA, setOutputA] = useState('');
  const [outputB, setOutputB] = useState('');

  const [metricsA, setMetricsA] = useState<{ durationMs: number; tokens: number; tps: string } | null>(null);
  const [metricsB, setMetricsB] = useState<{ durationMs: number; tokens: number; tps: string } | null>(null);

  const handleRunComparison = async () => {
    if (!prompt.trim() || isRunning) return;

    setIsRunning(true);
    setOutputA('');
    setOutputB('');
    setMetricsA(null);
    setMetricsB(null);

    let accA = '';
    let accB = '';

    const pA = new Promise<void>((resolve) => {
      streamGeminiResponse(
        prompt,
        modelA,
        undefined,
        [],
        [],
        {
          onChunk: (chunk) => {
            accA += chunk;
            setOutputA(accA);
          },
          onDone: (metrics) => {
            setMetricsA({
              durationMs: metrics.durationMs,
              tokens: metrics.tokenCount,
              tps: metrics.tokensPerSec,
            });
            resolve();
          },
          onError: () => resolve(),
        }
      );
    });

    const pB = new Promise<void>((resolve) => {
      streamGeminiResponse(
        prompt,
        modelB,
        undefined,
        [],
        [],
        {
          onChunk: (chunk) => {
            accB += chunk;
            setOutputB(accB);
          },
          onDone: (metrics) => {
            setMetricsB({
              durationMs: metrics.durationMs,
              tokens: metrics.tokenCount,
              tps: metrics.tokensPerSec,
            });
            resolve();
          },
          onError: () => resolve(),
        }
      );
    });

    await Promise.all([pA, pB]);
    setIsRunning(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="border-b border-[#2a3548] pb-5">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#152031] text-[11px] text-[#38bdf8] mb-2 border border-[#3b82f6]/30">
          <Scale className="w-3.5 h-3.5" />
          <span>Benchmark & Engenharia de Prompt</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#d8e3fb] tracking-tight">
          Prompt Lab & Comparação de Modelos
        </h1>
        <p className="text-sm text-[#c6c6cc] mt-1.5">
          Avalie latência, fidelidade técnica e taxa de transferência (tok/s) entre modelos neurais em paralelo.
        </p>
      </div>

      {/* Prompt input well */}
      <div className="p-4 rounded-xl bg-[#0b172a] border border-[#2a3548] space-y-3">
        <label className="block text-xs font-semibold text-[#d8e3fb]">
          Prompt de Teste & Benchmark
        </label>
        <textarea
          rows={3}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Digite a instrução para comparar ambos os modelos..."
          className="w-full p-3 rounded-lg bg-[#081425] border border-[#2a3548] text-sm text-[#d8e3fb] placeholder-[#909096] resize-none focus:outline-none focus:border-[#3b82f6]"
        />

        <div className="flex justify-end pt-1">
          <button
            onClick={handleRunComparison}
            disabled={isRunning || !prompt.trim()}
            className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white glow-btn-primary rounded-lg disabled:opacity-40 transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isRunning ? 'Executando Benchmark...' : 'Executar Comparação Paralela'}</span>
          </button>
        </div>
      </div>

      {/* Side-by-side comparison grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Model A Card */}
        <div className="flex flex-col rounded-xl bg-[#0b172a] border border-[#2a3548] overflow-hidden shadow-lg">
          {/* Header */}
          <div className="p-3.5 bg-[#111c2d] border-b border-[#2a3548] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#3b82f6]"></span>
              <span className="text-xs font-semibold text-[#d8e3fb]">Modelo A:</span>
              <select
                value={modelA}
                onChange={(e) => setModelA(e.target.value as ModelId)}
                className="bg-[#152031] text-xs text-[#d8e3fb] rounded px-2 py-1 border border-[#2a3548] focus:outline-none focus:border-[#3b82f6]"
              >
                {AVAILABLE_MODELS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            {metricsA && (
              <div className="flex items-center gap-2 text-[11px] font-mono">
                <span className="text-[#38bdf8] tabular-nums">{metricsA.durationMs}ms</span>
                <span className="text-[#909096]">·</span>
                <span className="text-[#d2bbff] tabular-nums">{metricsA.tps} tok/s</span>
              </div>
            )}
          </div>

          {/* Body */}
          <div className="flex-1 p-4 text-xs text-[#d8e3fb] leading-relaxed overflow-y-auto max-h-96 whitespace-pre-wrap">
            {outputA || (
              <span className="text-[#909096] italic">Aguardando execução do benchmark...</span>
            )}
            {isRunning && !metricsA && <span className="streaming-cursor" />}
          </div>
        </div>

        {/* Model B Card */}
        <div className="flex flex-col rounded-xl bg-[#0b172a] border border-[#2a3548] overflow-hidden shadow-lg">
          {/* Header */}
          <div className="p-3.5 bg-[#111c2d] border-b border-[#2a3548] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#7c3aed]"></span>
              <span className="text-xs font-semibold text-[#d8e3fb]">Modelo B:</span>
              <select
                value={modelB}
                onChange={(e) => setModelB(e.target.value as ModelId)}
                className="bg-[#152031] text-xs text-[#d8e3fb] rounded px-2 py-1 border border-[#2a3548] focus:outline-none focus:border-[#3b82f6]"
              >
                {AVAILABLE_MODELS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            {metricsB && (
              <div className="flex items-center gap-2 text-[11px] font-mono">
                <span className="text-[#38bdf8] tabular-nums">{metricsB.durationMs}ms</span>
                <span className="text-[#909096]">·</span>
                <span className="text-[#d2bbff] tabular-nums">{metricsB.tps} tok/s</span>
              </div>
            )}
          </div>

          {/* Body */}
          <div className="flex-1 p-4 text-xs text-[#d8e3fb] leading-relaxed overflow-y-auto max-h-96 whitespace-pre-wrap">
            {outputB || (
              <span className="text-[#909096] italic">Aguardando execução do benchmark...</span>
            )}
            {isRunning && !metricsB && <span className="streaming-cursor" />}
          </div>
        </div>
      </div>
    </div>
  );
};
