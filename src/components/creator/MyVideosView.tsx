import React, { useState, useEffect, useCallback } from 'react';
import { UserProfile, CreatorVideoItem, PostVisibility, PostStatus } from '../../types/superapp';
import { api } from '../../services/api';
import {
  Video as VideoIcon,
  Play,
  Eye,
  Heart,
  MessageSquare,
  Edit2,
  Trash2,
  Plus,
  Globe,
  Lock,
  Link2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Film,
  Search,
  Filter,
} from 'lucide-react';

interface MyVideosViewProps {
  currentUser: UserProfile | null;
  onOpenCreateModal: (defaultType?: 'short' | 'video') => void;
  onOpenAuth: () => void;
}

export const MyVideosView: React.FC<MyVideosViewProps> = ({
  currentUser,
  onOpenCreateModal,
  onOpenAuth,
}) => {
  const [videos, setVideos] = useState<CreatorVideoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'short' | 'video'>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  // Edit Modal State
  const [editingVideo, setEditingVideo] = useState<CreatorVideoItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editVisibility, setEditVisibility] = useState<PostVisibility>('public');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchVideos = useCallback(async () => {
    if (!currentUser) {
      setVideos([]);
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const res = await api.creator.getMyVideos();
      setVideos(res.videos || []);
    } catch (err: any) {
      console.error('Failed to load user videos:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const triggerNotice = (msg: string) => {
    setNoticeMessage(msg);
    setTimeout(() => setNoticeMessage(null), 3000);
  };

  const handleDelete = async (videoId: string) => {
    if (!window.confirm('Tem a certeza de que deseja eliminar este vídeo permanentemente?')) {
      return;
    }

    try {
      await api.posts.deletePost(videoId);
      setVideos((prev) => prev.filter((v) => v.id !== videoId));
      triggerNotice('Vídeo eliminado com sucesso da base de dados.');
    } catch (err: any) {
      triggerNotice(err.message || 'Erro ao eliminar vídeo.');
    }
  };

  const handleOpenEdit = (v: CreatorVideoItem) => {
    setEditingVideo(v);
    setEditTitle(v.title);
    setEditDescription(v.description);
    setEditVisibility(v.visibility);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVideo) return;

    try {
      setIsUpdating(true);
      await api.posts.updatePost(editingVideo.id, {
        title: editTitle.trim(),
        description: editDescription.trim(),
        content: editDescription.trim() || editTitle.trim(),
        visibility: editVisibility,
      });

      setVideos((prev) =>
        prev.map((v) =>
          v.id === editingVideo.id
            ? {
                ...v,
                title: editTitle.trim(),
                description: editDescription.trim(),
                visibility: editVisibility,
              }
            : v
        )
      );

      triggerNotice('Dados do vídeo atualizados com sucesso!');
      setEditingVideo(null);
    } catch (err: any) {
      triggerNotice(err.message || 'Erro ao atualizar dados do vídeo.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center max-w-md mx-auto min-h-[50vh]">
        <Film className="w-12 h-12 text-slate-500 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Estúdio de Criação Nexo AI</h2>
        <p className="text-sm text-slate-400 mb-6">
          Inicie sessão com a sua conta para aceder à gestão dos seus vídeos curtos e tutoriais completos.
        </p>
        <button
          onClick={onOpenAuth}
          className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-[#38bdf8] to-[#6366f1] rounded-xl shadow-lg shadow-cyan-500/20"
        >
          Iniciar Sessão
        </button>
      </div>
    );
  }

  const filtered = videos.filter((v) => {
    const matchesSearch =
      v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || v.mediaType === filterType;
    const matchesStatus = filterStatus === 'all' || v.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Notice Alert */}
      {noticeMessage && (
        <div className="p-3 bg-[#131b2e] border border-[#38bdf8]/30 text-[#38bdf8] text-xs rounded-xl flex items-center gap-2 shadow-lg">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{noticeMessage}</span>
        </div>
      )}

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1e293b]">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Estúdio de Criação</h1>
          <p className="text-xs text-slate-400 mt-1">
            Faça a gestão dos seus vídeos curtos verticais e vídeos completos, métricas reais e visibilidade.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenCreateModal('short')}
            className="px-3.5 py-2 text-xs font-medium text-slate-200 bg-[#131b2e] hover:bg-[#1e293b] border border-[#1e293b] rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-pink-400" />
            <span>Vídeo Curto</span>
          </button>

          <button
            onClick={() => onOpenCreateModal('video')}
            className="px-4 py-2 text-xs font-medium text-white bg-gradient-to-r from-[#38bdf8] to-[#6366f1] rounded-xl shadow-lg shadow-cyan-500/20 hover:opacity-95 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Carregar Vídeo</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-[#0d131f] border border-[#1e293b] rounded-2xl">
          <span className="text-xs text-slate-400">Total de Vídeos</span>
          <p className="text-xl font-bold text-white mt-1 tabular-nums">{videos.length}</p>
        </div>
        <div className="p-4 bg-[#0d131f] border border-[#1e293b] rounded-2xl">
          <span className="text-xs text-slate-400">Visualizações Reais</span>
          <p className="text-xl font-bold text-[#38bdf8] mt-1 tabular-nums">
            {videos.reduce((acc, v) => acc + (v.viewsCount || 0), 0)}
          </p>
        </div>
        <div className="p-4 bg-[#0d131f] border border-[#1e293b] rounded-2xl">
          <span className="text-xs text-slate-400">Gostos Acumulados</span>
          <p className="text-xl font-bold text-pink-400 mt-1 tabular-nums">
            {videos.reduce((acc, v) => acc + (v.likesCount || 0), 0)}
          </p>
        </div>
        <div className="p-4 bg-[#0d131f] border border-[#1e293b] rounded-2xl">
          <span className="text-xs text-slate-400">Comentários</span>
          <p className="text-xl font-bold text-emerald-400 mt-1 tabular-nums">
            {videos.reduce((acc, v) => acc + (v.commentsCount || 0), 0)}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar vídeos pelo título..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#0d131f] border border-[#1e293b] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#38bdf8]"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2">
          {/* Format filter */}
          <div className="flex items-center p-1 bg-[#0d131f] border border-[#1e293b] rounded-xl">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                filterType === 'all' ? 'bg-[#1e293b] text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterType('short')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                filterType === 'short' ? 'bg-[#1e293b] text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Curtos
            </button>
            <button
              onClick={() => setFilterType('video')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                filterType === 'video' ? 'bg-[#1e293b] text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Completos
            </button>
          </div>
        </div>
      </div>

      {/* Video Content Table / Cards */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-slate-400">A carregar vídeos...</div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-[#1e293b] rounded-2xl bg-[#090d16]/40 space-y-3">
          <Film className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-sm font-semibold text-white">Ainda não existem vídeos publicados</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Carregue os seus vídeos curtos ou tutoriais técnicos para partilhar com a comunidade do Nexo AI.
          </p>
          <button
            onClick={() => onOpenCreateModal('video')}
            className="mt-2 px-4 py-2 text-xs font-medium text-white bg-[#38bdf8]/10 text-[#38bdf8] border border-[#38bdf8]/30 rounded-xl hover:bg-[#38bdf8]/20 transition-all inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Carregar Primeiro Vídeo</span>
          </button>
        </div>
      ) : (
        <div className="border border-[#1e293b] bg-[#0d131f] rounded-2xl overflow-hidden divide-y divide-[#1e293b]">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-[#131b2e]/50 transition-colors"
            >
              {/* Left: Thumbnail & Info */}
              <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                {/* Thumbnail */}
                <div className="relative w-28 h-18 bg-black/60 rounded-xl overflow-hidden shrink-0 border border-[#1e293b] flex items-center justify-center">
                  {item.thumbnailUrl ? (
                    <img
                      src={item.thumbnailUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <VideoIcon className="w-6 h-6 text-slate-500" />
                  )}
                  <span className="absolute bottom-1 right-1 px-1 py-0.5 text-[9px] font-mono bg-black/80 text-white rounded">
                    {item.mediaType === 'short' ? 'Curto' : 'Vídeo'}
                  </span>
                </div>

                {/* Details */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                    <span>{item.category}</span>
                    <span>·</span>
                    <span>{item.formattedDate}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      {item.visibility === 'public' && <Globe className="w-3 h-3 text-emerald-400" />}
                      {item.visibility === 'private' && <Lock className="w-3 h-3 text-amber-400" />}
                      {item.visibility === 'unlisted' && <Link2 className="w-3 h-3 text-[#38bdf8]" />}
                      <span className="capitalize">{item.visibility}</span>
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-white truncate">{item.title}</h3>
                  <p className="text-xs text-slate-400 truncate mt-0.5">
                    {item.description || 'Sem descrição.'}
                  </p>
                </div>
              </div>

              {/* Middle: Metrics */}
              <div className="flex items-center gap-4 text-xs text-slate-300 shrink-0">
                <div className="flex items-center gap-1.5" title="Visualizações reais">
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                  <span className="tabular-nums font-mono">{item.viewsCount}</span>
                </div>
                <div className="flex items-center gap-1.5" title="Gostos">
                  <Heart className="w-3.5 h-3.5 text-pink-400" />
                  <span className="tabular-nums font-mono">{item.likesCount}</span>
                </div>
                <div className="flex items-center gap-1.5" title="Comentários">
                  <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                  <span className="tabular-nums font-mono">{item.commentsCount}</span>
                </div>

                {/* Status tag */}
                <span
                  className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                    item.status === 'published'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : item.status === 'draft'
                      ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                      : 'bg-[#38bdf8]/10 text-[#38bdf8] border border-[#38bdf8]/20'
                  }`}
                >
                  {item.status === 'published'
                    ? 'Pronto'
                    : item.status === 'draft'
                    ? 'Rascunho'
                    : 'Em processamento'}
                </span>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-1 self-end sm:self-center shrink-0">
                <button
                  onClick={() => handleOpenEdit(item)}
                  className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-[#1e293b] transition-colors"
                  title="Editar vídeo"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                  title="Eliminar vídeo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* EDIT VIDEO MODAL */}
      {editingVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#0d131f] border border-[#1e293b] rounded-2xl p-5 space-y-4">
            <h3 className="text-base font-semibold text-white">Editar Detalhes do Vídeo</h3>

            <form onSubmit={handleSaveEdit} className="space-y-3.5">
              <div>
                <label className="block text-xs text-slate-300 mb-1">Título</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#131b2e] border border-[#1e293b] rounded-xl text-white focus:outline-none focus:border-[#38bdf8]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Descrição</label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#131b2e] border border-[#1e293b] rounded-xl text-white focus:outline-none focus:border-[#38bdf8] resize-none"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Visibilidade</label>
                <select
                  value={editVisibility}
                  onChange={(e) => setEditVisibility(e.target.value as PostVisibility)}
                  className="w-full px-3 py-2 text-xs bg-[#131b2e] border border-[#1e293b] rounded-xl text-white focus:outline-none focus:border-[#38bdf8]"
                >
                  <option value="public">🌐 Público (visível no feed)</option>
                  <option value="unlisted">🔗 Não listado (apenas com link)</option>
                  <option value="private">🔒 Privado (apenas você)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingVideo(null)}
                  disabled={isUpdating}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-4 py-2 text-xs font-medium text-white bg-gradient-to-r from-[#38bdf8] to-[#6366f1] rounded-xl shadow-lg disabled:opacity-50"
                >
                  {isUpdating ? 'A guardar...' : 'Guardar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
