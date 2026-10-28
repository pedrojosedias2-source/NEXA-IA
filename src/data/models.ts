import { ModelInfo, Agent } from '../types';

export const AVAILABLE_MODELS: ModelInfo[] = [
  {
    id: 'gemini-3.8-flash',
    name: 'Gemini 3.8 Flash',
    tagline: 'Velocidade Extrema & Raciocínio Balanceado',
    badge: 'Recomendado',
    avgLatencyMs: 38,
    maxTokens: 1048576,
    recommendedFor: 'Desenvolvimento, arquitetura e uso geral de alta velocidade',
  },
  {
    id: 'gemini-3.1-flash-lite',
    name: 'Gemini 3.1 Flash Lite',
    tagline: 'Latência Ultra-baixa e Eficiência Máxima',
    badge: 'Ultra Rápido',
    avgLatencyMs: 19,
    maxTokens: 1048576,
    recommendedFor: 'Consultas instantâneas, categorização e microsserviços',
  },
  {
    id: 'gemini-4-argon',
    name: 'Gemini 4 Argon',
    tagline: 'Raciocínio Profundo, STEM & Engenharia Avançada',
    badge: 'Raciocínio Profundo',
    avgLatencyMs: 85,
    maxTokens: 2097152,
    recommendedFor: 'Algoritmos complexos, refatoração de alta escala e auditoria',
  },
  {
    id: 'gemini-3.8-live',
    name: 'Gemini 3.8 Live Neural',
    tagline: 'Inferência Multimodal e Conversação em Fluxo',
    badge: 'Multimodal',
    avgLatencyMs: 44,
    maxTokens: 1048576,
    recommendedFor: 'Processamento de áudio, imagens e fluxos contínuos',
  },
];

export const SPECIALIZED_AGENTS: Agent[] = [
  {
    id: 'agent-architect',
    name: 'Arquiteto de Sistemas',
    role: 'Engenharia de Software & Alta Disponibilidade',
    description: 'Especialista em microsserviços, cache distribuído, padrões DDD e design resiliente.',
    systemInstruction:
      'Você é o Arquiteto Chefe do Nexo AI. Foque em decisões de design de software de altíssimo impacto, escalabilidade horizontal, desacoplamento e diagramação lógica.',
    color: '#3b82f6',
    iconName: 'Cpu',
    specialty: 'Escalabilidade & Microsserviços',
  },
  {
    id: 'agent-performance',
    name: 'Auditor de Performance & Código',
    role: 'Otimização de Runtime & Profiling',
    description: 'Detecta gargalos de latência, vazamentos de memória, complexidade O(N) e refatora para máxima eficiência.',
    systemInstruction:
      'Você é o Engenheiro Sênior de Performance do Nexo AI. Avalie tempos de execução, alocação de memória, índices de banco e forneça snippets de código super eficientes.',
    color: '#10b981',
    iconName: 'Zap',
    specialty: 'Profiling & Baixa Latência',
  },
  {
    id: 'agent-security',
    name: 'Auditor de Segurança & Red Team',
    role: 'Hardening, Auth & Defesa em Profundidade',
    description: 'Análise de vulnerabilidades OWASP, sanitização de inputs, criptografia e segurança de APIs.',
    systemInstruction:
      'Você é o Especialista em Cibersegurança do Nexo AI. Identifique vetores de ataque potenciais, falhas de autorização e proponha mitigações defensivas robustas.',
    color: '#ef4444',
    iconName: 'ShieldAlert',
    specialty: 'OWASP & Criptografia',
  },
  {
    id: 'agent-ux',
    name: 'Arquiteto de Usabilidade & UX',
    role: 'Ergonomia Cognitiva & Design Systems',
    description: 'Garante que os fluxos sejam intuitivos, com zero fricção, acessibilidade WCAG AA e layout impecável.',
    systemInstruction:
      'Você é o Lead UX Architect do Nexo AI. Avalie a clareza para o usuário, hierarquia visual, latência percebida e consistência das interfaces.',
    color: '#d2bbff',
    iconName: 'Layout',
    specialty: 'Ergonomia & Design Systems',
  },
];

export const PROMPT_ACCELERATORS = [
  {
    title: 'Otimização de Performance React 19',
    category: 'Engenharia Frontend',
    prompt:
      'Como estruturar uma pipeline de dados em React 19 com useTransition e Suspense para evitar re-renders desnecessários e manter 60 FPS contínuos?',
    icon: 'Layers',
  },
  {
    title: 'Arquitetura de Microsserviços de Baixa Latência',
    category: 'Infraestrutura & Backend',
    prompt:
      'Desenhe a arquitetura de um gateway de alta performance com Envoy e gRPC, detalhando estratégias de cache L1/L2 e failover ativo-ativo.',
    icon: 'Server',
  },
  {
    title: 'Auditoria de Vulnerabilidades em APIs REST',
    category: 'Cibersegurança',
    prompt:
      'Quais são os 5 principais vetores de exploração em autenticação JWT stateless e como implementar rotação de refresh tokens segura?',
    icon: 'ShieldCheck',
  },
  {
    title: 'Indexação e Consulta SQL em Tabelas de Milhões de Linhas',
    category: 'Banco de Dados',
    prompt:
      'Como criar índices parciais e particionamento declarativo no PostgreSQL para reduzir o tempo de query de agregação de 4s para menos de 15ms?',
    icon: 'Database',
  },
];
