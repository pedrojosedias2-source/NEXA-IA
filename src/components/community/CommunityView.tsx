import React, { useState } from 'react';
import { SocialPost, UserProfile, PostMediaType } from '../../types/superapp';
import { api } from '../../services/api';
import {
  Heart,
  MessageSquare,
  Share2,
  Bookmark,
  Send,
  MoreVertical,
  Flag,
  UserX,
  Search,
  Check,
  UserPlus,
  UserCheck,
  Trash2,
  Edit2,
  X,
  Users,
  Activity,
  AlertCircle,
  Plus,
  Play,
  Film,
  Globe,
  Lock,
  Link2,
  Image as ImageIcon,
  CheckCircle2,
  Eye,
  Tag,
} from 'lucide-react';

interface CommunityViewProps {
  posts: SocialPost[];
  currentUser: UserProfile | null;
  onlineUsers: { id: string; name: string; username: string; avatar: string }[];
  onOpenCreateModal: (defaultType?: PostMediaType) => void;
  onLikePost: (postId: string) => Promise<void>;
  onEditPost: (postId: string, content: string, title?: string) => Promise<void>;
  onDeletePost: (postId: string) => Promise<void>;
  onAddComment: (postId: string, text: string) => Promise<void>;
  onFollowUser: (userId: string) => Promise<void>;
  onReportPost: (postId: string, reason: string) => Promise<void>;
  onBlockUser: (userId: string) => Promise<void>;
  onOpenAuth: () => void;
}

export const CommunityView: React.FC<CommunityViewProps> = ({
  posts,
  currentUser,
  onlineUsers,
  onOpenCreateModal,
  onLikePost,
  onEditPost,
  onDeletePost,
  onAddComment,
  onFollowUser,
  onReportPost,
  onBlockUser,
  onOpenAuth,
}) => {
  const [activeCommentsPostId, setActiveCommentsPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedMediaType, setSelectedMediaType] = useState<'all' | 'image' | 'short' | 'video'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeMenuPostId, setActiveMenuPostId] = useState<string | null>(null);
  const [copiedLinkPostId, setCopiedLinkPostId] = useState<string | null>(null);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);
  const [savedPostIds, setSavedPostIds] = useState<Set<string>>(new Set());

  // Edit Modal
  const [editingPost, setEditingPost] = useState<SocialPost | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Lightbox for photos
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const triggerNotice = (msg: string) => {
    setFeedbackNotice(msg);
    setTimeout(() => setFeedbackNotice(null), 3000);
  };

  const handleShare = (postId: string) => {
    const url = `${window.location.origin}/?post=${postId}`;
    navigator.clipboard.writeText(url);
    setCopiedLinkPostId(postId);
    setTimeout(() => setCopiedLinkPostId(null), 2000);
    triggerNotice('Ligação copiada para a área de transferência!');
  };

  const handleToggleSave = async (postId: string) => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    try {
      const res = await api.posts.toggleSave(postId);
      setSavedPostIds((prev) => {
        const next = new Set(prev);
        if (res.isSaved) {
          next.add(postId);
        } else {
          next.delete(postId);
        }
        return next;
      });
      triggerNotice(res.isSaved ? 'Publicação guardada nos favoritos!' : 'Removida dos favoritos.');
    } catch (err: any) {
      triggerNotice(err.message || 'Erro ao guardar publicação.');
    }
  };

  const handleCommentSubmit = async (postId: string) => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    if (!commentText.trim()) return;

    try {
      await onAddComment(postId, commentText.trim());
      setCommentText('');
      triggerNotice('Comentário guardado na base de dados!');
    } catch (err: any) {
      triggerNotice(err.message || 'Erro ao comentar.');
    }
  };

  const handleOpenEdit = (post: SocialPost) => {
    setEditingPost(post);
    setEditTitle(post.title || '');
    setEditContent(post.content);
    setActiveMenuPostId(null);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost) return;
    setIsUpdating(true);
    try {
      await onEditPost(editingPost.id, editContent.trim(), editTitle.trim());
      setEditingPost(null);
      triggerNotice('Publicação atualizada com sucesso!');
    } catch (err: any) {
      triggerNotice(err.message || 'Erro ao atualizar publicação.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Clickable hashtag filter
  const handleTagClick = (tag: string) => {
    if (selectedTag === tag) {
      setSelectedTag(null);
    } else {
      setSelectedTag(tag);
    }
  };

  const filteredPosts = posts.filter((p) => {
    const matchesSearch =
      p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.title && p.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.author.username.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTag =
      !selectedTag ||
      (p.tags && p.tags.some((t) => t.toLowerCase() === selectedTag.toLowerCase()));

    const matchesMediaType =
      selectedMediaType === 'all' ||
      p.mediaType === selectedMediaType ||
      (selectedMediaType === 'image' && (p.mediaType === 'image' || p.imageUrl));

    const matchesCategory =
      selectedCategory === 'all' || p.category === selectedCategory;

    return matchesSearch && matchesTag && matchesMediaType && matchesCategory;
  });

  const categories = ['all', 'Tecnologia', 'Inteligência Artificial', 'Tutoriais', 'Criatividade', 'Produtividade', 'Geral'];

  return (
    <div className="max-w-4xl mx-auto p-3 sm:p-6 space-y-6">
      {/* Toast Notice */}
      {feedbackNotice && (
        <div className="fixed bottom-6 right-6 z-50 p-3.5 bg-[#131b2e] border border-[#38bdf8]/40 text-[#38bdf8] text-xs font-medium rounded-xl shadow-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedbackNotice}</span>
        </div>
      )}

      {/* TOP CREATOR ACTION BAR */}
      <div className="p-4 sm:p-5 bg-[#0d131f] border border-[#1e293b] rounded-2xl shadow-lg flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#38bdf8] to-[#818cf8] p-0.5 shrink-0">
            <img
              src={
                currentUser?.avatar ||
                'https://api.dicebear.com/7.x/identicon/svg?seed=nexo_guest'
              }
              alt="Avatar"
              className="w-full h-full rounded-full bg-[#0d131f] object-cover"
            />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-white truncate">
              {currentUser ? `Olá, ${currentUser.name}` : 'Bem-vindo ao Nexo AI'}
            </h2>
            <p className="text-xs text-slate-400 truncate">
              Partilhe as suas ideias, fotos, vídeos curtos ou tutoriais técnicos.
            </p>
          </div>
        </div>

        {/* Big Visible Create Publication Button */}
        <button
          onClick={() => {
            if (!currentUser) {
              onOpenAuth();
            } else {
              onOpenCreateModal();
            }
          }}
          className="px-5 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-[#38bdf8] via-[#6366f1] to-[#8b5cf6] hover:opacity-95 rounded-xl shadow-lg shadow-cyan-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Criar Publicação</span>
        </button>
      </div>

      {/* FILTERS & SEARCH ROW */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pesquisar publicações, autores ou conteúdos..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-[#0d131f] border border-[#1e293b] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#38bdf8]"
            />
          </div>

          {/* Media Type Segmented Tabs */}
          <div className="flex items-center p-1 bg-[#0d131f] border border-[#1e293b] rounded-xl overflow-x-auto shrink-0">
            <button
              onClick={() => setSelectedMediaType('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                selectedMediaType === 'all'
                  ? 'bg-[#1e293b] text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setSelectedMediaType('image')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                selectedMediaType === 'image'
                  ? 'bg-[#1e293b] text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Fotografias
            </button>
            <button
              onClick={() => setSelectedMediaType('short')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                selectedMediaType === 'short'
                  ? 'bg-[#1e293b] text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Vídeos Curtos
            </button>
            <button
              onClick={() => setSelectedMediaType('video')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                selectedMediaType === 'video'
                  ? 'bg-[#1e293b] text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Vídeos Completos
            </button>
          </div>
        </div>

        {/* Category Pills & Active Tag Filter */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-1 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <span className="text-[11px] text-slate-500 shrink-0">Categorias:</span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 text-[11px] font-medium rounded-lg whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-[#38bdf8]/15 text-[#38bdf8] border border-[#38bdf8]/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#131b2e]'
                }`}
              >
                {cat === 'all' ? 'Todas' : cat}
              </button>
            ))}
          </div>

          {selectedTag && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs bg-[#38bdf8]/15 text-[#38bdf8] border border-[#38bdf8]/30 rounded-lg">
              <span>#{selectedTag}</span>
              <button onClick={() => setSelectedTag(null)} className="hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Online Users Banner (Honest real presence) */}
      <div className="p-3 bg-[#0d131f]/80 border border-[#1e293b] rounded-xl flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>
            {onlineUsers.length > 0
              ? `${onlineUsers.length} ${onlineUsers.length === 1 ? 'utilizador online agora' : 'utilizadores online agora'}`
              : 'Nenhum utilizador online neste momento.'}
          </span>
        </div>
        {onlineUsers.length > 0 && (
          <div className="flex items-center -space-x-1.5">
            {onlineUsers.slice(0, 5).map((u) => (
              <img
                key={u.id}
                src={u.avatar}
                alt={u.name}
                title={u.name}
                className="w-5 h-5 rounded-full border border-[#0d131f] object-cover"
              />
            ))}
          </div>
        )}
      </div>

      {/* FEED LIST */}
      {filteredPosts.length === 0 ? (
        /* Honest empty state as required */
        <div className="py-16 px-4 text-center border border-dashed border-[#1e293b] rounded-2xl bg-[#090d16]/40 space-y-3">
          <Film className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-sm font-semibold text-white">
            Ainda não existem publicações. Sê a primeira pessoa a publicar.
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Não geramos dados simulados nem utilizadores falsos. O seu conteúdo é guardado e sincronizado em tempo real.
          </p>
          <button
            onClick={() => {
              if (!currentUser) onOpenAuth();
              else onOpenCreateModal();
            }}
            className="mt-2 px-4 py-2 text-xs font-medium text-white bg-gradient-to-r from-[#38bdf8] to-[#6366f1] rounded-xl shadow-lg"
          >
            Publicar Agora
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => {
            const isAuthor = currentUser?.id === post.author.id;
            const isCommentsOpen = activeCommentsPostId === post.id;
            const isSaved = post.isSaved || savedPostIds.has(post.id);

            return (
              <article
                key={post.id}
                className="p-4 sm:p-5 bg-[#0d131f] border border-[#1e293b] rounded-2xl shadow-md space-y-3.5 hover:border-slate-800 transition-colors"
              >
                {/* Author & Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={post.author.avatar}
                      alt={post.author.name}
                      className="w-10 h-10 rounded-full bg-[#131b2e] border border-[#1e293b] object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-white truncate">
                          {post.author.name}
                        </span>
                        <span className="text-xs text-slate-400 truncate">
                          @{post.author.username}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <span>{post.category || 'Geral'}</span>
                        <span>·</span>
                        <span>{post.createdAt}</span>
                        {/* Visibility indicator if author is viewing */}
                        {isAuthor && post.visibility && post.visibility !== 'public' && (
                          <>
                            <span>·</span>
                            <span className="flex items-center gap-1 text-[#38bdf8]">
                              {post.visibility === 'private' ? (
                                <Lock className="w-3 h-3" />
                              ) : (
                                <Link2 className="w-3 h-3" />
                              )}
                              <span className="capitalize">{post.visibility}</span>
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions Dropdown Menu */}
                  <div className="relative">
                    <button
                      onClick={() =>
                        setActiveMenuPostId(activeMenuPostId === post.id ? null : post.id)
                      }
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#1e293b] transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {activeMenuPostId === post.id && (
                      <div className="absolute right-0 top-full mt-1 w-44 bg-[#131b2e] border border-[#1e293b] rounded-xl shadow-2xl py-1 z-20">
                        {isAuthor ? (
                          <>
                            <button
                              onClick={() => handleOpenEdit(post)}
                              className="w-full px-3 py-2 text-left text-xs text-slate-200 hover:bg-[#1e293b] flex items-center gap-2"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-[#38bdf8]" />
                              <span>Editar publicação</span>
                            </button>
                            <button
                              onClick={() => {
                                setActiveMenuPostId(null);
                                onDeletePost(post.id);
                              }}
                              className="w-full px-3 py-2 text-left text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-2"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Eliminar</span>
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setActiveMenuPostId(null);
                                onFollowUser(post.author.id);
                              }}
                              className="w-full px-3 py-2 text-left text-xs text-slate-200 hover:bg-[#1e293b] flex items-center gap-2"
                            >
                              <UserPlus className="w-3.5 h-3.5 text-[#38bdf8]" />
                              <span>
                                {post.author.isFollowing ? 'Deixar de seguir' : 'Seguir autor'}
                              </span>
                            </button>
                            <button
                              onClick={() => {
                                setActiveMenuPostId(null);
                                const reason = prompt('Qual o motivo da denúncia?');
                                if (reason) onReportPost(post.id, reason);
                              }}
                              className="w-full px-3 py-2 text-left text-xs text-amber-400 hover:bg-[#1e293b] flex items-center gap-2"
                            >
                              <Flag className="w-3.5 h-3.5" />
                              <span>Denunciar conteúdo</span>
                            </button>
                            <button
                              onClick={() => {
                                setActiveMenuPostId(null);
                                if (confirm(`Bloquear @${post.author.username}?`)) {
                                  onBlockUser(post.author.id);
                                }
                              }}
                              className="w-full px-3 py-2 text-left text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-2"
                            >
                              <UserX className="w-3.5 h-3.5" />
                              <span>Bloquear autor</span>
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Title (if present) */}
                {post.title && (
                  <h3 className="text-base font-semibold text-white tracking-tight">
                    {post.title}
                  </h3>
                )}

                {/* Content Body */}
                <p className="text-xs sm:text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {post.content}
                </p>

                {/* Media Container: Photos or Video */}
                {post.mediaType === 'video' || post.mediaType === 'short' ? (
                  <div className="rounded-xl overflow-hidden border border-[#1e293b] bg-black">
                    {post.imageUrl?.endsWith('.mp4') || post.imageUrl?.endsWith('.webm') ? (
                      <video
                        src={post.imageUrl}
                        controls
                        poster={post.thumbnailUrl}
                        className={`w-full max-h-[460px] object-contain ${
                          post.mediaType === 'short' ? 'max-w-[320px] mx-auto aspect-[9/16]' : 'aspect-video'
                        }`}
                      />
                    ) : post.thumbnailUrl ? (
                      <div className="relative aspect-video flex items-center justify-center bg-black/80">
                        <img
                          src={post.thumbnailUrl}
                          alt="Thumbnail"
                          className="w-full h-full object-cover opacity-80"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                            <Play className="w-6 h-6 ml-1" />
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : post.mediaUrls && post.mediaUrls.length > 0 ? (
                  <div
                    className={`grid gap-2 rounded-xl overflow-hidden ${
                      post.mediaUrls.length === 1
                        ? 'grid-cols-1'
                        : post.mediaUrls.length === 2
                        ? 'grid-cols-2'
                        : 'grid-cols-2 sm:grid-cols-3'
                    }`}
                  >
                    {post.mediaUrls.map((url, idx) => (
                      <div
                        key={idx}
                        onClick={() => setLightboxImage(url)}
                        className="relative aspect-square sm:aspect-video bg-[#131b2e] overflow-hidden rounded-lg cursor-pointer group"
                      >
                        <img
                          src={url}
                          alt={`Foto ${idx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                ) : post.imageUrl ? (
                  <div
                    onClick={() => setLightboxImage(post.imageUrl!)}
                    className="rounded-xl overflow-hidden border border-[#1e293b] max-h-96 bg-[#131b2e] cursor-pointer"
                  >
                    <img
                      src={post.imageUrl}
                      alt="Publicação"
                      className="w-full h-full object-cover max-h-96"
                    />
                  </div>
                ) : null}

                {/* Hashtags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {post.tags.map((t) => (
                      <button
                        key={t}
                        onClick={() => handleTagClick(t)}
                        className="text-xs text-[#38bdf8] hover:underline"
                      >
                        #{t}
                      </button>
                    ))}
                  </div>
                )}

                {/* Interaction Footer Bar */}
                <div className="flex items-center justify-between pt-2 border-t border-[#1e293b] text-xs text-slate-400">
                  <div className="flex items-center gap-4">
                    {/* Like button */}
                    <button
                      onClick={() => onLikePost(post.id)}
                      className={`flex items-center gap-1.5 transition-colors ${
                        post.isLiked ? 'text-pink-500 font-medium' : 'hover:text-pink-400'
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 ${post.isLiked ? 'fill-pink-500 text-pink-500' : ''}`}
                      />
                      <span className="tabular-nums">{post.likesCount}</span>
                    </button>

                    {/* Comments toggle */}
                    <button
                      onClick={() =>
                        setActiveCommentsPostId(isCommentsOpen ? null : post.id)
                      }
                      className="flex items-center gap-1.5 hover:text-white transition-colors"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span className="tabular-nums">{post.commentsCount}</span>
                    </button>

                    {/* Views counter (honest) */}
                    <div className="flex items-center gap-1 text-slate-500 text-[11px]" title="Visualizações">
                      <Eye className="w-3.5 h-3.5" />
                      <span className="tabular-nums">{post.viewsCount || 0}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Save Bookmark */}
                    <button
                      onClick={() => handleToggleSave(post.id)}
                      className={`p-1.5 rounded-lg hover:bg-[#1e293b] transition-colors ${
                        isSaved ? 'text-[#38bdf8]' : 'text-slate-400 hover:text-white'
                      }`}
                      title={isSaved ? 'Remover dos guardados' : 'Guardar publicação'}
                    >
                      <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-[#38bdf8]' : ''}`} />
                    </button>

                    {/* Share Link */}
                    <button
                      onClick={() => handleShare(post.id)}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#1e293b] transition-colors"
                      title="Copiar link"
                    >
                      {copiedLinkPostId === post.id ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Share2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* COMMENTS SECTION */}
                {isCommentsOpen && (
                  <div className="pt-3 border-t border-[#1e293b] space-y-3">
                    {/* Add comment input */}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleCommentSubmit(post.id);
                          }
                        }}
                        placeholder="Escreva um comentário..."
                        className="flex-1 px-3 py-2 text-xs bg-[#131b2e] border border-[#1e293b] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#38bdf8]"
                      />
                      <button
                        onClick={() => handleCommentSubmit(post.id)}
                        disabled={!commentText.trim()}
                        className="px-3 py-2 text-xs font-medium text-white bg-[#38bdf8] hover:bg-[#0284c7] disabled:opacity-40 rounded-xl transition-colors flex items-center gap-1"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Comments list */}
                    {post.comments.length === 0 ? (
                      <p className="text-xs text-slate-500 py-1">
                        Ainda não existem comentários. Sê o primeiro a comentar!
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        {post.comments.map((c) => (
                          <div
                            key={c.id}
                            className="p-2.5 bg-[#131b2e]/60 rounded-xl flex items-start gap-2.5 text-xs"
                          >
                            <img
                              src={c.authorAvatar}
                              alt={c.authorName}
                              className="w-6 h-6 rounded-full object-cover shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-white truncate">
                                  {c.authorName}
                                </span>
                                <span className="text-[10px] text-slate-500">
                                  {c.createdAt}
                                </span>
                              </div>
                              <p className="text-slate-200 mt-0.5 leading-relaxed">{c.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      {/* LIGHTBOX MODAL */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={lightboxImage}
              alt="Ampliada"
              className="max-w-full max-h-[90vh] object-contain rounded-xl"
            />
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-2 right-2 p-2 bg-black/60 text-white rounded-full hover:bg-black"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* EDIT POST MODAL */}
      {editingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#0d131f] border border-[#1e293b] rounded-2xl p-5 space-y-4">
            <h3 className="text-base font-semibold text-white">Editar Publicação</h3>

            <form onSubmit={handleSaveEdit} className="space-y-3.5">
              <div>
                <label className="block text-xs text-slate-300 mb-1">Título (opcional)</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#131b2e] border border-[#1e293b] rounded-xl text-white focus:outline-none focus:border-[#38bdf8]"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Conteúdo</label>
                <textarea
                  rows={4}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#131b2e] border border-[#1e293b] rounded-xl text-white focus:outline-none focus:border-[#38bdf8] resize-none leading-relaxed"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingPost(null)}
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
