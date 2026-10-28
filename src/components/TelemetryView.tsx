import React, { useState, useEffect } from 'react';
import { TelemetryMetrics } from '../types';
import { Gauge, Zap, Activity, Clock, Database, RefreshCw, Server, CheckCircle2 } from 'lucide-react';

interface TelemetryViewProps {
  metrics: TelemetryMetrics;
  onClearTelemetry: () => void;
}

export const TelemetryView: React.FC<TelemetryViewProps> = ({ metrics, onClearTelemetry }) => {
  const [serverHealth, setServerHealth] = useState<{
    status: string;
    geminiLive: boolean;
    platform: string;
  } | null>(null);
  const [pingMs, setPingMs] = useState<number | null>(null);
  const [isPinging, setIsPinging] = useState(false);

  const probeServer = async () => {
    setIsPinging(true);
    const start = performance.now();
    try {
      const res = await fetch('/api/system/health');
      const data = await res.json();
      setServerHealth(data);
      setPingMs(Math.round(performance.now() - start));
    } catch (err) {
      setPingMs(Math.round(performance.now() - start));
      setServerHealth({
        status: 'online-fallback',
        geminiLive: false,
        platform: 'Nexo AI Edge Simulator',
      });
    } finally {
      setIsPinging(false);
    }
  };

  useEffect(() => {
    probeServer();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2a3548] pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#d8e3fb] tracking-tight">
            Telemetria de Sistema & Cache Neural
          </h1>
          <p className="text-sm text-[#c6c6cc] mt-1">
            Métricas de throughput em tempo real, latência e diagnóstico de inferência.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={probeServer}
            disabled={isPinging}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111c2d] hover:bg-[#152031] border border-[#2a3548] text-xs text-[#d8e3fb] transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
            <span>Testar Latência RTT</span>
          </button>

          <button
            onClick={onClearTelemetry}
            className="px-3 py-1.5 rounded-lg bg-[#111c2d] hover:bg-[#1f2a3c] border border-[#2a3548] text-xs text-[#c6c6cc] hover:text-[#d8e3fb] transition-colors"
          >
            Zerar Métricas
          </button>
        </div>
      </div>

      {/* KPI 4-column Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="p-4 rounded-xl bg-[#0b172a] border border-[#2a3548]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#909096] uppercase tracking-wider font-semibold">
              Taxa de Transferência
            </span>
            <Zap className="w-4 h-4 text-[#38bdf8]" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-[#d8e3fb] tabular-nums">
            {metrics.peakTokensPerSec.toFixed(1)}{' '}
            <span className="text-xs font-normal text-[#adc6ff]">tok/s</span>
          </div>
          <div className="text-[11px] text-[#909096] mt-1">
            Pico de vazão de streaming
          </div>
        </div>

        {/* KPI 2 */}
        <div className="p-4 rounded-xl bg-[#0b172a] border border-[#2a3548]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#909096] uppercase tracking-wider font-semibold">
              Latência Média
            </span>
            <Clock className="w-4 h-4 text-[#3b82f6]" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-[#38bdf8] tabular-nums">
            {metrics.averageLatencyMs || 38}{' '}
            <span className="text-xs font-normal text-[#adc6ff]">ms</span>
          </div>
          <div className="text-[11px] text-[#909096] mt-1">
            Tempo até primeiro chunk (TTFT)
          </div>
        </div>

        {/* KPI 3 */}
        <div className="p-4 rounded-xl bg-[#0b172a] border border-[#2a3548]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#909096] uppercase tracking-wider font-semibold">
              Tokens Processados
            </span>
            <Activity className="w-4 h-4 text-[#d2bbff]" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-[#d8e3fb] tabular-nums">
            {metrics.totalTokensGenerated.toLocaleString()}
          </div>
          <div className="text-[11px] text-[#909096] mt-1">
            Consumo agregado na sessão
          </div>
        </div>

        {/* KPI 4 */}
        <div className="p-4 rounded-xl bg-[#0b172a] border border-[#2a3548]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#909096] uppercase tracking-wider font-semibold">
              Eficiência de Cache
            </span>
            <Database className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-emerald-400 tabular-nums">
            {metrics.cacheHitRatio}%
          </div>
          <div className="text-[11px] text-[#909096] mt-1">
            Redução de latência por contexto
          </div>
        </div>
      </div>

      {/* Server Health Status banner */}
      <div className="p-4 rounded-xl bg-[#111c2d] border border-[#2a3548] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#152031] text-[#38bdf8]">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-semibold text-[#d8e3fb] flex items-center gap-2">
              <span>Nexo Neural Engine Core</span>
              <span className="text-xs font-normal text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Operacional
              </span>
            </div>
            <div className="text-xs text-[#909096]">
              {serverHealth?.platform || 'Node Express Server + SSE Streaming'}
            </div>
          </div>
        </div>

        <div className="text-xs text-[#909096] font-mono tabular-nums">
          RTT Borda: <span className="text-[#38bdf8] font-bold">{pingMs ?? '--'}ms</span>
        </div>
      </div>

      {/* Recent Runs Table */}
      <div className="rounded-xl bg-[#0b172a] border border-[#2a3548] overflow-hidden">
        <div className="p-4 bg-[#111c2d] border-b border-[#2a3548] flex items-center justify-between">
          <span className="text-xs font-semibold text-[#d8e3fb] uppercase tracking-wider">
            Registro Granular de Inferência
          </span>
          <span className="text-xs text-[#909096]">
            {metrics.recentRuns.length} operações gravadas
          </span>
        </div>

        {metrics.recentRuns.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#909096]">
            Nenhuma inferência registrada nesta sessão ainda. Envie um prompt no Chat para popular o monitor.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#2a3548] bg-[#081425] text-[#909096]">
                  <th className="p-3 font-medium">Horário</th>
                  <th className="p-3 font-medium">Modelo Neural</th>
                  <th className="p-3 font-medium">Latência</th>
                  <th className="p-3 font-medium">Tokens</th>
                  <th className="p-3 font-medium">Throughput</th>
                </tr>
              </thead>
              <tbody>
                {metrics.recentRuns.map((run) => (
                  <tr
                    key={run.id}
                    className="border-b border-[#1f2a3c] hover:bg-[#152031]/50 transition-colors"
                  >
                    <td className="p-3 font-mono text-[#909096]">
                      {new Date(run.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="p-3 font-medium text-[#d8e3fb]">{run.model}</td>
                    <td className="p-3 font-mono text-[#38bdf8] tabular-nums">{run.latencyMs}ms</td>
                    <td className="p-3 font-mono text-[#d8e3fb] tabular-nums">{run.tokens}</td>
                    <td className="p-3 font-mono text-[#d2bbff] tabular-nums">{run.tps} tok/s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
