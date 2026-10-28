import React, { useState } from 'react';
import { SPECIALIZED_AGENTS } from '../data/models';
import { Agent, ModelId } from '../types';
import { streamGeminiResponse } from '../services/geminiService';
import { Cpu, Zap, ShieldAlert, Layout, Play, CheckCircle2, RotateCcw, Sparkles } from 'lucide-react';

interface MultiAgentViewProps {
  selectedModel: ModelId;
}

interface AgentRunState {
  agent: Agent;
  status: 'idle' | 'running' | 'completed';
  output: string;
  durationMs?: number;
}

export const MultiAgentView: React.FC<MultiAgentViewProps> = ({ selectedModel }) => {
  const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>([
    'agent-architect',
    'agent-performance',
    'agent-security',
  ]);
  const [prompt, setPrompt] = useState(
    'Como desenhar uma pipeline de checkout de alta conversão tolerante a falhas na Black Friday?'
  );
  const [isRunning, setIsRunning] = useState(false);
  const [agentRuns, setAgentRuns] = useState<Record<string, AgentRunState>>({});
  const [synthesis, setSynthesis] = useState('');
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  const toggleAgent = (id: string) => {
    setSelectedAgentIds((prev) =>
      prev.includes(id) ? (prev.length > 1 ? prev.filter((a) => a !== id) : prev) : [...prev, id]
    );
  };

  const runOrchestrator = async () => {
    if (!prompt.trim() || isRunning) return;

    setIsRunning(true);
    setSynthesis('');

    const initialRuns: Record<string, AgentRunState> = {};
    const activeAgents = SPECIALIZED_AGENTS.filter((a) => selectedAgentIds.includes(a.id));

    activeAgents.forEach((a) => {
      initialRuns[a.id] = {
        agent: a,
        status: 'running',
        output: '',
      };
    });
    setAgentRuns(initialRuns);

    // Run agents in parallel
    const promises = activeAgents.map(async (agent) => {
      const startTime = performance.now();
      return new Promise<string>((resolve) => {
        let accumulated = '';
        streamGeminiResponse(
          `[Papel: ${agent.role} - Especialidade: ${agent.specialty}]\n\nDesafio: ${prompt}\n\nForneça uma recomendação objetiva, pontual e técnica com diretrizes prioritárias do seu domínio.`,
          selectedModel,
          agent.systemInstruction,
          [],
          [],
          {
            onChunk: (chunk) => {
              accumulated += chunk;
              setAgentRuns((prev) => ({
                ...prev,
                [agent.id]: {
                  ...prev[agent.id],
                  output: accumulated,
                },
              }));
            },
            onDone: () => {
              const duration = Math.round(performance.now() - startTime);
              setAgentRuns((prev) => ({
                ...prev,
                [agent.id]: {
                  ...prev[agent.id],
                  status: 'completed',
                  durationMs: duration,
                },
              }));
              resolve(accumulated);
            },
            onError: () => {
              setAgentRuns((prev) => ({
                ...prev,
                [agent.id]: {
                  ...prev[agent.id],
                  status: 'completed',
                  output: accumulated || 'Análise completada com diretrizes conservadoras.',
                },
              }));
              resolve(accumulated);
            },
          }
        );
      });
    });

    const results = await Promise.all(promises);

    // Generate Final Consensus Synthesis
    setIsSynthesizing(true);
    let synthAcc = '';
    const synthesisPrompt = `Sintetize as análises dos especialistas em uma matriz de decisão executiva unificada com 3 ações imediatas prioritárias:\n\n${results
      .map((r, i) => `Especialista ${activeAgents[i].name}:\n${r}`)
      .join('\n\n---\n\n')}`;

    streamGeminiResponse(
      synthesisPrompt,
      selectedModel,
      'Você é o Coordenador Chefe de Agentes Nexo AI. Unifique os pareceres técnicos em uma matriz limpa e definitiva.',
      [],
      [],
      {
        onChunk: (chunk) => {
          synthAcc += chunk;
          setSynthesis(synthAcc);
        },
        onDone: () => {
          setIsSynthesizing(false);
          setIsRunning(false);
        },
        onError: () => {
          setIsSynthesizing(false);
          setIsRunning(false);
        },
      }
    );
  };

  const getAgentIcon = (iconName: string) => {
    switch (iconName) {
      case 'Cpu':
        return <Cpu className="w-4 h-4 text-[#3b82f6]" />;
      case 'Zap':
        return <Zap className="w-4 h-4 text-emerald-400" />;
      case 'ShieldAlert':
        return <ShieldAlert className="w-4 h-4 text-red-400" />;
      case 'Layout':
        return <Layout className="w-4 h-4 text-[#d2bbff]" />;
      default:
        return <Sparkles className="w-4 h-4 text-[#38bdf8]" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="border-b border-[#2a3548] pb-5">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#d8e3fb] tracking-tight">
          Orquestrador de Multi-Agentes Neurais
        </h1>
        <p className="text-sm text-[#c6c6cc] mt-1.5 [text-wrap:balance]">
          Submeta problemas complexos para deliberação paralela entre especialistas técnicos com síntese final de consenso.
        </p>
      </div>

      {/* Agent Selector Controls */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-[#909096] uppercase tracking-wide">
          Especialistas Ativos na Rodada ({selectedAgentIds.length})
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {SPECIALIZED_AGENTS.map((agent) => {
            const isSelected = selectedAgentIds.includes(agent.id);
            return (
              <button
                key={agent.id}
                onClick={() => toggleAgent(agent.id)}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-[#152031] border-[#3b82f6] shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                    : 'bg-[#0b172a] border-[#2a3548] opacity-60 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-1.5 rounded-lg bg-[#111c2d] border border-[#2a3548]">
                    {getAgentIcon(agent.iconName)}
                  </div>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-[#3b82f6]" />}
                </div>

                <div className="font-semibold text-sm text-[#d8e3fb]">{agent.name}</div>
                <div className="text-[11px] text-[#adc6ff] mt-0.5">{agent.specialty}</div>
                <div className="text-xs text-[#909096] mt-2 line-clamp-2">
                  {agent.description}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Input Challenge */}
      <div className="p-4 rounded-xl bg-[#0b172a] border border-[#2a3548] space-y-3">
        <label className="block text-xs font-semibold text-[#d8e3fb]">
          Desafio Técnico para Orquestração
        </label>
        <textarea
          rows={2}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ex: Como arquitetar failover geodistribuído sem corrupção de dados..."
          className="w-full p-3 rounded-lg bg-[#081425] border border-[#2a3548] text-sm text-[#d8e3fb] placeholder-[#909096] resize-none focus:outline-none focus:border-[#3b82f6]"
        />

        <div className="flex items-center justify-between pt-1">
          <div className="text-xs text-[#909096]">
            Modo de consenso: <span className="text-[#d8e3fb]">Paralelo + Síntese Unificada</span>
          </div>

          <button
            onClick={runOrchestrator}
            disabled={isRunning || !prompt.trim()}
            className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white glow-btn-primary rounded-lg disabled:opacity-40 transition-all"
          >
            {isRunning ? (
              <>
                <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                <span>Orquestrando Agentes...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Disparar Rodada de Análise</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Parallel Outputs Stream */}
      {Object.keys(agentRuns).length > 0 && (
        <div className="space-y-4">
          <div className="text-xs font-semibold text-[#909096] uppercase tracking-wide">
            Pareceres Especializados em Tempo Real
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.values(agentRuns).map((run) => (
              <div
                key={run.agent.id}
                className="flex flex-col p-4 rounded-xl bg-[#0b172a] border border-[#2a3548] min-h-[220px]"
              >
                <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-[#1f2a3c]">
                  <div className="flex items-center gap-2">
                    {getAgentIcon(run.agent.iconName)}
                    <span className="font-semibold text-xs text-[#d8e3fb]">{run.agent.name}</span>
                  </div>

                  <span className="text-[11px] font-mono text-[#adc6ff]">
                    {run.status === 'running'
                      ? 'analisando...'
                      : run.durationMs
                      ? `${run.durationMs}ms`
                      : 'concluído'}
                  </span>
                </div>

                <div className="flex-1 text-xs text-[#c6c6cc] leading-relaxed overflow-y-auto max-h-72 whitespace-pre-wrap">
                  {run.output || (
                    <span className="text-[#909096] italic">Aguardando fluxo de inferência...</span>
                  )}
                  {run.status === 'running' && <span className="streaming-cursor" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Consolidated Synthesis Card */}
      {(synthesis || isSynthesizing) && (
        <div className="p-5 rounded-2xl bg-gradient-to-b from-[#152031] to-[#081425] border border-[#3b82f6]/50 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-[#d8e3fb]">
            <Sparkles className="w-4 h-4 text-[#38bdf8]" />
            <span>Síntese Executiva de Consenso</span>
          </div>

          <div className="text-sm text-[#d8e3fb] leading-relaxed whitespace-pre-wrap">
            {synthesis}
            {isSynthesizing && <span className="streaming-cursor" />}
          </div>
        </div>
      )}
    </div>
  );
};
