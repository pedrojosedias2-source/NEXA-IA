import React, { useState, useRef, useEffect, useCallback } from 'react';
import { SocialPost, UserProfile } from '../../types/superapp';
import { api } from '../../services/api';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Heart,
  MessageSquare,
  Share2,
  Bookmark,
  Plus,
  ChevronDown,
  ChevronUp,
  UserPlus,
  UserCheck,
  Check,
  Eye,
  Film,
  Sparkles,
  Send,
  X,
} from 'lucide-react';

interface VideosViewProps {
  posts: SocialPost[];
  currentUser: UserProfile | null;
  onOpenCreateModal: (defaultType?: 'short' | 'video') => void;
  onOpenAuth: () => void;
  onLikePost: (postId: string) => Promise<void>;
  onFollowUser: (userId: string) => Promise<void>;
  onAddComment: (postId: string, text: string) => Promise<void>;
}

export const VideosView: React.FC<VideosViewProps> = ({
  posts,
  currentUser,
  onOpenCreateModal,
  onOpenAuth,
  onLikePost,
  onFollowUser,
  onAddComment,
}) => {
  // Filter only real short or video posts from the database
  const shortVideos = posts.filter(
    (p) =>
      p.mediaType === 'short' ||
      (p.mediaType === 'video' && p.imageUrl?.match(/\.(mp4|webm|mov)$/i)) ||
      (p.imageUrl && p.imageUrl.startsWith('/uploads/') && p.imageUrl.match(/\.(mp4|webm)$/i))
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(1);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [viewedPostIds, setViewedPostIds] = useState<Set<string>>(new Set());

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentPost = shortVideos[currentIndex] || null;

  // Track deduplicated view on video active
  useEffect(() => {
    if (currentPost && !viewedPostIds.has(currentPost.id)) {
      api.posts.recordView(currentPost.id).catch(() => {});
      setViewedPostIds((prev) => new Set(prev).add(currentPost.id));
    }
  }, [currentPost, viewedPostIds]);

  // Autoplay or pause on slide change
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      if (isPlaying) {
        videoRef.current.play().catch(() => {
          setIsPlaying(false);
        });
      }
    }
  }, [currentIndex]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleNext = useCallback(() => {
    if (currentIndex < shortVideos.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, shortVideos.length]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showComments) return; // ignore when typing in comments
      if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === ' ') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'm') {
        toggleMute();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, showComments, isPlaying, isMuted]);

  const handleShare = () => {
    if (!currentPost) return;
    const url = `${window.location.origin}/?post=${currentPost.id}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleAddCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    if (!commentText.trim() || !currentPost) return;

    try {
      await onAddComment(currentPost.id, commentText.trim());
      setCommentText('');
    } catch (err: any) {
      console.error('Failed to comment:', err);
    }
  };

  // If no short videos uploaded yet -> honest empty state
  if (shortVideos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto min-h-[60vh] space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#38bdf8]/20 to-pink-500/20 border border-[#1e293b] flex items-center justify-center">
          <Film className="w-8 h-8 text-[#38bdf8]" />
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">Vídeos Curtos (Reels / Clips)</h2>
        <p className="text-sm text-slate-400 leading-relaxed">
          Ainda não existem vídeos curtos publicados. Sê a primeira pessoa a carregar um vídeo curto vertical no Nexo AI!
        </p>
        <button
          onClick={() => {
            if (!currentUser) onOpenAuth();
            else onOpenCreateModal('short');
          }}
          className="px-6 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-[#38bdf8] to-pink-500 hover:opacity-95 rounded-xl shadow-lg shadow-pink-500/20 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Criar Primeiro Vídeo Curto</span>
        </button>
      </div>
    );
  }

  const isAuthor = currentUser?.id === currentPost?.author.id;
  const isVideoFile =
    currentPost?.imageUrl?.endsWith('.mp4') || currentPost?.imageUrl?.endsWith('.webm');

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] max-h-[850px] flex items-center justify-center overflow-hidden py-2 sm:py-4">
      {/* Container 9:16 vertical short canvas */}
      <div
        ref={containerRef}
        className="relative w-full max-w-[400px] h-full bg-black rounded-2xl overflow-hidden shadow-2xl border border-[#1e293b] flex items-center justify-center group"
      >
        {/* Main Video Stream */}
        {isVideoFile ? (
          <video
            ref={videoRef}
            src={currentPost.imageUrl}
            poster={currentPost.thumbnailUrl}
            loop
            playsInline
            muted={isMuted}
            onClick={togglePlay}
            className="w-full h-full object-cover cursor-pointer"
          />
        ) : (
          /* Simulated vertical gradient canvas with custom artwork if media is text/image demo */
          <div
            onClick={togglePlay}
            className="w-full h-full bg-gradient-to-b from-[#090d16] via-[#131b2e] to-[#090d16] flex flex-col items-center justify-center p-6 text-center cursor-pointer relative"
          >
            {currentPost?.imageUrl && (
              <img
                src={currentPost.imageUrl}
                alt="Media"
                className="absolute inset-0 w-full h-full object-cover opacity-60"
              />
            )}
            <div className="relative z-10 space-y-3">
              <span className="px-2.5 py-1 text-[11px] font-medium bg-[#38bdf8]/20 text-[#38bdf8] border border-[#38bdf8]/30 rounded-full">
                {currentPost?.category || 'Curto'}
              </span>
              <h3 className="text-lg font-bold text-white px-2">
                {currentPost?.title || currentPost?.content.slice(0, 50)}
              </h3>
            </div>
          </div>
        )}

        {/* Play/Pause Overlay indicator when paused */}
        {!isPlaying && (
          <div
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer pointer-events-auto"
          >
            <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white">
              <Play className="w-8 h-8 ml-1" />
            </div>
          </div>
        )}

        {/* Top Floating Controls */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20 pointer-events-auto">
          {/* Category */}
          <span className="px-2.5 py-1 text-[10px] font-medium bg-black/50 backdrop-blur-md text-white border border-white/10 rounded-full">
            {currentPost?.category || 'Vídeo'}
          </span>

          <div className="flex items-center gap-2">
            {/* Audio Toggle */}
            <button
              onClick={toggleMute}
              className="p-2 bg-black/50 backdrop-blur-md text-white rounded-full hover:bg-black/80 transition-colors"
              title={isMuted ? 'Ativar som' : 'Silenciar'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Create Short Button */}
            <button
              onClick={() => {
                if (!currentUser) onOpenAuth();
                else onOpenCreateModal('short');
              }}
              className="px-3 py-1.5 text-xs font-semibold bg-[#38bdf8] text-white rounded-full shadow-lg hover:bg-[#0284c7] transition-all flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Publicar</span>
            </button>
          </div>
        </div>

        {/* Bottom Metadata & Author Info */}
        <div className="absolute bottom-4 left-4 right-16 z-20 pointer-events-none space-y-2">
          {/* Author info */}
          <div className="flex items-center gap-2 pointer-events-auto">
            <img
              src={currentPost?.author.avatar}
              alt={currentPost?.author.name}
              className="w-9 h-9 rounded-full border border-white/30 object-cover"
            />
            <div className="min-w-0">
              <span className="text-xs font-semibold text-white drop-shadow truncate block">
                {currentPost?.author.name}
              </span>
              <span className="text-[10px] text-slate-300 drop-shadow truncate block">
                @{currentPost?.author.username}
              </span>
            </div>

            {!isAuthor && (
              <button
                onClick={() => onFollowUser(currentPost!.author.id)}
                className={`ml-1 px-2.5 py-1 text-[10px] font-medium rounded-full transition-colors ${
                  currentPost?.author.isFollowing
                    ? 'bg-white/20 text-white'
                    : 'bg-[#38bdf8] text-white hover:bg-[#0284c7]'
                }`}
              >
                {currentPost?.author.isFollowing ? 'A seguir' : 'Seguir'}
              </button>
            )}
          </div>

          {/* Title & Caption */}
          {currentPost?.title && (
            <h4 className="text-sm font-bold text-white drop-shadow leading-snug">
              {currentPost.title}
            </h4>
          )}
          <p className="text-xs text-slate-200 drop-shadow line-clamp-2 leading-relaxed">
            {currentPost?.content}
          </p>

          {/* Hashtags */}
          {currentPost?.tags && currentPost.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pointer-events-auto">
              {currentPost.tags.map((t) => (
                <span key={t} className="text-[11px] font-medium text-[#38bdf8] drop-shadow">
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Floating Right Interaction Sidebar */}
        <div className="absolute right-3 bottom-8 flex flex-col items-center gap-4 z-20 pointer-events-auto">
          {/* Like */}
          <button
            onClick={() => onLikePost(currentPost!.id)}
            className="flex flex-col items-center group cursor-pointer"
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                currentPost?.isLiked
                  ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/30'
                  : 'bg-black/50 backdrop-blur-md text-white hover:bg-black/70'
              }`}
            >
              <Heart
                className={`w-5 h-5 ${currentPost?.isLiked ? 'fill-white text-white' : ''}`}
              />
            </div>
            <span className="text-[10px] font-medium text-white drop-shadow mt-1 tabular-nums">
              {currentPost?.likesCount || 0}
            </span>
          </button>

          {/* Comments */}
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex flex-col items-center group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/70 transition-all">
              <MessageSquare className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-medium text-white drop-shadow mt-1 tabular-nums">
              {currentPost?.commentsCount || 0}
            </span>
          </button>

          {/* Views */}
          <div className="flex flex-col items-center text-white/80" title="Visualizações reais">
            <div className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white">
              <Eye className="w-4 h-4" />
            </div>
            <span className="text-[9px] font-medium text-white drop-shadow mt-0.5 tabular-nums">
              {currentPost?.viewsCount || 0}
            </span>
          </div>

          {/* Share */}
          <button onClick={handleShare} className="flex flex-col items-center group cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/70 transition-all">
              {copiedLink ? <Check className="w-5 h-5 text-emerald-400" /> : <Share2 className="w-5 h-5" />}
            </div>
            <span className="text-[10px] font-medium text-white drop-shadow mt-1">Partilhar</span>
          </button>
        </div>

        {/* Up / Down Navigation Floaters (Desktop & Tablet) */}
        <div className="hidden sm:flex flex-col gap-2 absolute -right-14 top-1/2 -translate-y-1/2">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="w-10 h-10 rounded-full bg-[#131b2e] border border-[#1e293b] text-white flex items-center justify-center hover:bg-[#1e293b] disabled:opacity-30 transition-all"
            title="Vídeo anterior (Seta Cima)"
          >
            <ChevronUp className="w-5 h-5" />
          </button>

          <button
            onClick={handleNext}
            disabled={currentIndex === shortVideos.length - 1}
            className="w-10 h-10 rounded-full bg-[#131b2e] border border-[#1e293b] text-white flex items-center justify-center hover:bg-[#1e293b] disabled:opacity-30 transition-all"
            title="Próximo vídeo (Seta Baixo)"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>

        {/* COMMENTS SLIDE-UP DRAWER */}
        {showComments && (
          <div className="absolute inset-x-0 bottom-0 max-h-[70%] bg-[#0d131f] border-t border-[#1e293b] rounded-t-2xl z-30 flex flex-col p-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#1e293b]">
              <span className="text-xs font-semibold text-white">
                Comentários ({currentPost?.commentsCount || 0})
              </span>
              <button
                onClick={() => setShowComments(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Comments list */}
            <div className="flex-1 overflow-y-auto py-3 space-y-2.5 max-h-56">
              {currentPost?.comments && currentPost.comments.length > 0 ? (
                currentPost.comments.map((c) => (
                  <div key={c.id} className="flex items-start gap-2 text-xs">
                    <img
                      src={c.authorAvatar}
                      alt={c.authorName}
                      className="w-6 h-6 rounded-full object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-white">{c.authorName}</span>
                        <span className="text-[10px] text-slate-500">{c.createdAt}</span>
                      </div>
                      <p className="text-slate-300 mt-0.5 leading-relaxed">{c.content}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 text-center py-4">
                  Ainda não existem comentários neste clip.
                </p>
              )}
            </div>

            {/* Comment form */}
            <form onSubmit={handleAddCommentSubmit} className="pt-2 flex items-center gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Adicionar comentário..."
                className="flex-1 px-3 py-1.5 text-xs bg-[#131b2e] border border-[#1e293b] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#38bdf8]"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="p-1.5 bg-[#38bdf8] text-white rounded-xl hover:bg-[#0284c7] disabled:opacity-40 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
