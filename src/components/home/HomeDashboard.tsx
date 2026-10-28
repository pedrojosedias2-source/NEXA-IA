import React from 'react';
import {
  MainSection,
  SocialPost,
  VideoItem,
  JournalEntry,
  AIToolConfig,
  UserProfile,
} from '../../types/superapp';
import {
  MessageSquare,
  Users,
  Video,
  BookOpen,
  Wrench,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Clock,
  Heart,
  Play,
  CheckCircle,
  Calendar,
} from 'lucide-react';

interface HomeDashboardProps {
  onNavigate: (section: MainSection) => void;
  currentUser: UserProfile | null;
  onlineUsers?: { id: string; name: string; username: string; avatar: string }[];
  recentPosts: SocialPost[];
  recommendedVideos: VideoItem[];
  recentNotes: JournalEntry[];
  aiTools: AIToolConfig[];
  onSelectTool: (tool: AIToolConfig) => void;
  onOpenVideo: (video: VideoItem) => void;
  onOpenAuth?: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  onNavigate,
  currentUser,
  onlineUsers = [],
  recentPosts,
  recommendedVideos,
  recentNotes,
  aiTools,
  onSelectTool,
  onOpenVideo,
  onOpenAuth,
}) => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-8 animate-in fade-in duration-200">
      {/* Welcome Banner / Hero */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#111c2d] via-[#152031] to-[#0b172a] border border-[#2a3548] shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 rounded-full bg-gradient-to-br from-[#7c3aed]/20 to-[#3b82f6]/20 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1f2a3c] border border-[#3b82f6]/40 text-xs text-[#38bdf8] font-medium shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Nexo AI — Superapp Multifuncional</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#d8e3fb] light:text-slate-900 tracking-tight [text-wrap:balance]">
            {currentUser
              ? `Olá, ${currentUser.name.split(' ')[0]}! O que deseja criar ou explorar hoje?`
              : 'Bem-vindo ao Nexo AI! Inicie sessão para explorar a rede.'}
          </h1>

          <p className="text-xs sm:text-sm text-[#c6c6cc] light:text-slate-600 leading-relaxed [text-wrap:balance]">
            Seu centro completo de produtividade, interação social autêntica, vídeos rápidos e inteligência artificial conectada.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('ai-chat')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white glow-btn-primary shadow-lg transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Abrir Assistente IA</span>
            </button>

            <button
              onClick={() => onNavigate('community')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-[#d8e3fb] bg-[#1f2a3c] hover:bg-[#2a3548] border border-[#2a3548] transition-colors"
            >
              <Users className="w-4 h-4 text-[#7c3aed]" />
              <span>Ver Comunidade</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Access Grid to the 5 Core Modules */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#909096]">
            Módulos Principais
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Card 1: Chat IA */}
          <button
            onClick={() => onNavigate('ai-chat')}
            className="group p-4 rounded-2xl bg-[#0b172a] light:bg-white border border-[#2a3548] light:border-slate-200 hover:border-[#38bdf8]/50 text-left transition-all hover:-translate-y-0.5 shadow-md"
          >
            <div className="w-9 h-9 rounded-xl bg-[#38bdf8]/10 text-[#38bdf8] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div className="font-bold text-xs sm:text-sm text-[#d8e3fb] light:text-slate-900">
              Assistente IA
            </div>
            <div className="text-[11px] text-[#909096] mt-0.5">
              Chat & Soluções
            </div>
          </button>

          {/* Card 2: Comunidade Social */}
          <button
            onClick={() => onNavigate('community')}
            className="group p-4 rounded-2xl bg-[#0b172a] light:bg-white border border-[#2a3548] light:border-slate-200 hover:border-[#7c3aed]/50 text-left transition-all hover:-translate-y-0.5 shadow-md"
          >
            <div className="w-9 h-9 rounded-xl bg-[#7c3aed]/10 text-[#7c3aed] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <div className="font-bold text-xs sm:text-sm text-[#d8e3fb] light:text-slate-900">
              Comunidade
            </div>
            <div className="text-[11px] text-[#909096] mt-0.5">
              Posts & Conexões
            </div>
          </button>

          {/* Card 3: Vídeos Curtos */}
          <button
            onClick={() => onNavigate('videos')}
            className="group p-4 rounded-2xl bg-[#0b172a] light:bg-white border border-[#2a3548] light:border-slate-200 hover:border-[#3b82f6]/50 text-left transition-all hover:-translate-y-0.5 shadow-md"
          >
            <div className="w-9 h-9 rounded-xl bg-[#3b82f6]/10 text-[#3b82f6] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Video className="w-5 h-5" />
            </div>
            <div className="font-bold text-xs sm:text-sm text-[#d8e3fb] light:text-slate-900">
              Vídeos Curtos
            </div>
            <div className="text-[11px] text-[#909096] mt-0.5">
              Shorts & Ideias
            </div>
          </button>

          {/* Card 4: Diário Inteligente */}
          <button
            onClick={() => onNavigate('journal')}
            className="group p-4 rounded-2xl bg-[#0b172a] light:bg-white border border-[#2a3548] light:border-slate-200 hover:border-emerald-500/50 text-left transition-all hover:-translate-y-0.5 shadow-md"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="font-bold text-xs sm:text-sm text-[#d8e3fb] light:text-slate-900">
              Diário Pessoal
            </div>
            <div className="text-[11px] text-[#909096] mt-0.5">
              Notas & Hábitos
            </div>
          </button>

          {/* Card 5: Ferramentas de IA */}
          <button
            onClick={() => onNavigate('ai-tools')}
            className="group p-4 rounded-2xl bg-[#0b172a] light:bg-white border border-[#2a3548] light:border-slate-200 hover:border-[#adc6ff]/50 text-left transition-all hover:-translate-y-0.5 shadow-md col-span-2 sm:col-span-1"
          >
            <div className="w-9 h-9 rounded-xl bg-[#adc6ff]/10 text-[#adc6ff] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Wrench className="w-5 h-5" />
            </div>
            <div className="font-bold text-xs sm:text-sm text-[#d8e3fb] light:text-slate-900">
              Ferramentas IA
            </div>
            <div className="text-[11px] text-[#909096] mt-0.5">
              8 Apps Prontos
            </div>
          </button>
        </div>
      </div>

      {/* Suggested Videos Strip */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Video className="w-4 h-4 text-[#38bdf8]" />
            <h2 className="text-sm font-bold text-[#d8e3fb] light:text-slate-900">
              Vídeos em Destaque
            </h2>
            <span className="text-[10px] text-[#909096] font-mono">(Demonstração)</span>
          </div>
          <button
            onClick={() => onNavigate('videos')}
            className="text-xs text-[#38bdf8] hover:underline flex items-center gap-1"
          >
            <span>Ver todos</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {recommendedVideos.slice(0, 3).map((video) => (
            <div
              key={video.id}
              onClick={() => {
                onSelectTool({} as any);
                onOpenVideo(video);
                onNavigate('videos');
              }}
              className="group cursor-pointer rounded-2xl bg-[#0b172a] light:bg-white border border-[#2a3548] light:border-slate-200 overflow-hidden hover:border-[#3b82f6]/50 transition-all shadow-md"
            >
              <div className="relative h-40 overflow-hidden bg-black">
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-3">
                  <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white mb-1 group-hover:scale-110 transition-transform">
                    <Play className="w-4 h-4 fill-white" />
                  </div>
                </div>
                <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/60 text-[10px] font-mono text-white">
                  {video.durationSec}s
                </span>
              </div>

              <div className="p-3.5 space-y-1.5">
                <div className="text-[11px] text-[#adc6ff] font-semibold">
                  {video.category}
                </div>
                <h3 className="text-xs font-bold text-[#d8e3fb] light:text-slate-900 line-clamp-1 group-hover:text-[#38bdf8] transition-colors">
                  {video.title}
                </h3>
                <div className="flex items-center justify-between text-[11px] text-[#909096] pt-1">
                  <span>@{video.creator.username}</span>
                  <span className="flex items-center gap-1 font-mono">
                    <Heart className="w-3 h-3 text-red-400" />
                    {video.likesCount}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Section: Social Highlights + Journal Quick Look */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Community Feed Highlights */}
        <div className="p-5 rounded-2xl bg-[#0b172a] light:bg-white border border-[#2a3548] light:border-slate-200 space-y-4 shadow-lg">
          <div className="flex items-center justify-between pb-2 border-b border-[#1f2a3c] light:border-slate-200">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#7c3aed]" />
              <h2 className="text-sm font-bold text-[#d8e3fb] light:text-slate-900">
                Discussões Recentes na Comunidade
              </h2>
            </div>
            <button
              onClick={() => onNavigate('community')}
              className="text-xs text-[#38bdf8] hover:underline"
            >
              Feed Completo
            </button>
          </div>

          <div className="space-y-3">
            {recentPosts.length === 0 ? (
              <div className="p-6 text-center rounded-xl bg-[#111c2d] light:bg-slate-50 border border-[#2a3548] light:border-slate-200 space-y-2">
                <p className="text-xs text-[#909096]">
                  Ainda não existem publicações. Sê a primeira pessoa a publicar.
                </p>
                <button
                  onClick={() => onNavigate('community')}
                  className="px-3 py-1.5 rounded-lg bg-[#7c3aed]/20 text-[#d2bbff] hover:bg-[#7c3aed]/30 border border-[#7c3aed]/40 text-xs font-semibold transition-colors"
                >
                  Criar Primeira Publicação
                </button>
              </div>
            ) : (
              recentPosts.slice(0, 2).map((post) => (
                <div
                  key={post.id}
                  onClick={() => onNavigate('community')}
                  className="p-3.5 rounded-xl bg-[#111c2d] light:bg-slate-50 border border-[#2a3548] light:border-slate-200 hover:border-[#7c3aed]/40 transition-colors cursor-pointer space-y-2"
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={post.author.avatar}
                      alt={post.author.name}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                    <div>
                      <span className="text-xs font-semibold text-[#d8e3fb] light:text-slate-900 block leading-tight">
                        {post.author.name}
                      </span>
                      <span className="text-[10px] text-[#909096]">
                        {post.createdAt}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-[#c6c6cc] light:text-slate-700 line-clamp-2 leading-relaxed">
                    {post.content}
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-[#909096] pt-1">
                    <span className="flex items-center gap-1 font-mono">
                      <Heart className="w-3.5 h-3.5 text-red-400" />
                      {post.likesCount}
                    </span>
                    <span className="flex items-center gap-1 font-mono">
                      <MessageSquare className="w-3.5 h-3.5 text-[#38bdf8]" />
                      {post.commentsCount} comentários
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Personal Journal & Tasks Preview */}
        <div className="p-5 rounded-2xl bg-[#0b172a] light:bg-white border border-[#2a3548] light:border-slate-200 space-y-4 shadow-lg">
          <div className="flex items-center justify-between pb-2 border-b border-[#1f2a3c] light:border-slate-200">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-[#d8e3fb] light:text-slate-900">
                Seu Diário Pessoal & Hábitos
              </h2>
            </div>
            <button
              onClick={() => onNavigate('journal')}
              className="text-xs text-[#38bdf8] hover:underline"
            >
              Abrir Diário
            </button>
          </div>

          <div className="space-y-3">
            {recentNotes.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#909096]">
                Nenhuma anotação registrada ainda. Comece a escrever hoje!
              </div>
            ) : (
              recentNotes.slice(0, 2).map((note) => (
                <div
                  key={note.id}
                  onClick={() => onNavigate('journal')}
                  className="p-3.5 rounded-xl bg-[#111c2d] light:bg-slate-50 border border-[#2a3548] light:border-slate-200 hover:border-emerald-500/40 transition-colors cursor-pointer space-y-1.5"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-emerald-400">
                      {note.category}
                    </span>
                    <span className="text-[#909096] font-mono">{note.date}</span>
                  </div>

                  <h3 className="text-xs font-bold text-[#d8e3fb] light:text-slate-900">
                    {note.title}
                  </h3>

                  <p className="text-xs text-[#c6c6cc] light:text-slate-700 line-clamp-2 leading-relaxed">
                    {note.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Featured AI Tools Carousel/Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4 text-[#adc6ff]" />
            <h2 className="text-sm font-bold text-[#d8e3fb] light:text-slate-900">
              Ferramentas de IA Populares
            </h2>
          </div>
          <button
            onClick={() => onNavigate('ai-tools')}
            className="text-xs text-[#38bdf8] hover:underline flex items-center gap-1"
          >
            <span>Ver todas as 8</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {aiTools.slice(0, 4).map((tool) => (
            <div
              key={tool.id}
              onClick={() => {
                onSelectTool(tool);
                onNavigate('ai-tools');
              }}
              className="p-4 rounded-2xl bg-[#0b172a] light:bg-white border border-[#2a3548] light:border-slate-200 hover:border-[#38bdf8]/50 transition-all cursor-pointer shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="text-[11px] font-semibold text-[#38bdf8] mb-1">
                  {tool.category}
                </div>
                <h3 className="text-xs font-bold text-[#d8e3fb] light:text-slate-900 mb-1">
                  {tool.title}
                </h3>
                <p className="text-[11px] text-[#909096] line-clamp-2 leading-relaxed">
                  {tool.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 text-[11px] text-[#38bdf8] font-semibold">
                <span>Usar Ferramenta</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
