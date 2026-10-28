export type ModelId = 'gemini-3.8-flash' | 'gemini-3.1-flash-lite' | 'gemini-4-argon' | 'gemini-3.8-live';

export interface ModelInfo {
  id: ModelId;
  name: string;
  tagline: string;
  badge: string;
  avgLatencyMs: number;
  maxTokens: number;
  recommendedFor: string;
}

export interface Attachment {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  data: string; // Base64
  previewUrl?: string;
}

export interface CodeArtifact {
  id: string;
  title: string;
  language: string;
  code: string;
  canPreview: boolean;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  model?: ModelId;
  latencyMs?: number;
  tokenCount?: number;
  tokensPerSec?: string;
  attachments?: Attachment[];
  codeArtifacts?: CodeArtifact[];
  isStreaming?: boolean;
  feedback?: 'up' | 'down' | null;
  agentName?: string;
}

export interface Session {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
  model: ModelId;
  systemInstruction?: string;
  isPinned?: boolean;
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  description: string;
  systemInstruction: string;
  color: string;
  iconName: string;
  specialty: string;
}

export interface TelemetryMetrics {
  totalRequests: number;
  totalTokensGenerated: number;
  averageLatencyMs: number;
  peakTokensPerSec: number;
  cacheHitRatio: number;
  uptimeSeconds: number;
  recentRuns: {
    id: string;
    timestamp: number;
    model: string;
    latencyMs: number;
    tokens: number;
    tps: string;
  }[];
}

export type ViewTab = 'chat' | 'agents' | 'prompt-lab' | 'telemetry' | 'artifacts';
