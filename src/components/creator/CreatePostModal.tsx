import React, { useState, useRef } from 'react';
import { UserProfile, PostMediaType, PostVisibility, PostStatus } from '../../types/superapp';
import { api, CreatePostPayload, UploadedFile } from '../../services/api';
import {
  X,
  FileText,
  Image as ImageIcon,
  Smartphone,
  Video as VideoIcon,
  UploadCloud,
  Eye,
  Calendar,
  Lock,
  Globe,
  Link2,
  Bookmark,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Tag,
  FolderOpen,
} from 'lucide-react';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onPostCreated?: () => void;
  defaultMediaType?: PostMediaType;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onPostCreated,
  defaultMediaType = 'text',
}) => {
  const [activeTab, setActiveTab] = useState<PostMediaType>(defaultMediaType);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Form fields
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Tecnologia');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [visibility, setVisibility] = useState<PostVisibility>('public');
  const [publishAction, setPublishAction] = useState<'now' | 'draft' | 'schedule'>('now');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');

  // Media files
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('');

  // Status & Progress
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const categories = [
    'Tecnologia',
    'Inteligência Artificial',
    'Tutoriais',
    'Criatividade',
    'Produtividade',
    'Geral',
  ];

  const suggestedTags = ['ia', 'tecnologia', 'programacao', 'superapp', 'inovacao', 'tutorial', 'nexo'];

  const handleAddTag = (rawTag: string) => {
    const clean = rawTag.trim().replace(/^#/, '').toLowerCase();
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate size and mime
    for (const f of files) {
      const isVideo = f.type.startsWith('video/');
      const maxSize = isVideo ? 50 * 1024 * 1024 : 15 * 1024 * 1024;
      if (f.size > maxSize) {
        setErrorMessage(
          isVideo
            ? `O vídeo "${f.name}" excede o limite máximo permitido de 50MB.`
            : `A imagem "${f.name}" excede o limite máximo permitido de 15MB.`
        );
        return;
      }
    }

    setErrorMessage(null);
    if (activeTab === 'short' || activeTab === 'video') {
      setSelectedFiles([files[0]]); // single video file
    } else {
      setSelectedFiles((prev) => [...prev, ...files].slice(0, 8)); // up to 8 images
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrorMessage('A miniatura deve ser uma imagem (JPG, PNG ou WEBP).');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage('A miniatura não pode ultrapassar 10MB.');
        return;
      }
      setThumbnailFile(file);
      setErrorMessage(null);
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setErrorMessage('Tem de iniciar sessão para publicar conteúdos.');
      return;
    }

    if (!content.trim() && (activeTab === 'text' || selectedFiles.length === 0)) {
      setErrorMessage('Por favor, escreva uma mensagem ou selecione um ficheiro de multimédia.');
      return;
    }

    if ((activeTab === 'short' || activeTab === 'video') && selectedFiles.length === 0) {
      setErrorMessage('Por favor, selecione um ficheiro de vídeo para carregar.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    setUploadProgress(10);

    try {
      let finalMediaUrls: string[] = [];
      let finalThumbUrl = thumbnailUrl;

      // 1. Upload media files if any
      if (selectedFiles.length > 0) {
        setUploadProgress(20);
        const uploaded = await api.upload.uploadFiles(selectedFiles, (percent) => {
          setUploadProgress(20 + Math.round(percent * 0.5));
        });
        finalMediaUrls = uploaded.map((u) => u.url);
        setUploadedFiles(uploaded);
      }

      // 2. Upload thumbnail if provided
      if (thumbnailFile) {
        const thumbUploaded = await api.upload.uploadFiles([thumbnailFile]);
        if (thumbUploaded && thumbUploaded[0]) {
          finalThumbUrl = thumbUploaded[0].url;
        }
      }

      setUploadProgress(80);

      // Determine status and scheduledAt
      let status: PostStatus = 'published';
      let scheduledAt: number | undefined = undefined;

      if (publishAction === 'draft') {
        status = 'draft';
      } else if (publishAction === 'schedule') {
        status = 'scheduled';
        if (!scheduledDate) {
          throw new Error('Por favor, indique a data de agendamento.');
        }
        const fullDateStr = `${scheduledDate}T${scheduledTime || '12:00'}:00`;
        scheduledAt = new Date(fullDateStr).getTime();
        if (isNaN(scheduledAt) || scheduledAt <= Date.now()) {
          throw new Error('A data de agendamento deve ser no futuro.');
        }
      }

      const payload: CreatePostPayload = {
        title: title.trim() || undefined,
        description: content.trim(),
        content: content.trim(),
        mediaType: activeTab,
        mediaUrls: finalMediaUrls,
        imageUrl: finalMediaUrls.length > 0 ? finalMediaUrls[0] : undefined,
        thumbnailUrl: finalThumbUrl || undefined,
        category,
        tags: tags.length > 0 ? tags : ['Geral'],
        visibility,
        status,
        scheduledAt,
      };

      setUploadProgress(90);
      const res = await api.posts.createPost(payload);
      setUploadProgress(100);

      setSuccessMessage(
        status === 'draft'
          ? 'Rascunho guardado com sucesso!'
          : status === 'scheduled'
          ? 'Publicação agendada com sucesso!'
          : 'Publicação criada e guardada na base de dados!'
      );

      setTimeout(() => {
        onPostCreated?.();
        onClose();
      }, 1000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao publicar. Verifique os dados e tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0d131f] border border-[#1e293b] rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e293b] shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#38bdf8]" />
            <h2 className="text-lg font-semibold text-white tracking-tight">Criar Publicação</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors border ${
                isPreviewMode
                  ? 'bg-[#38bdf8]/10 text-[#38bdf8] border-[#38bdf8]/30'
                  : 'bg-[#131b2e] text-slate-300 border-[#1e293b] hover:border-slate-600'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{isPreviewMode ? 'Modo Edição' : 'Pré-visualizar'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#1e293b] transition-colors"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Format Selector Tabs */}
        {!isPreviewMode && (
          <div className="grid grid-cols-4 gap-1 p-2 bg-[#090d16] border-b border-[#1e293b] shrink-0">
            <button
              type="button"
              onClick={() => {
                setActiveTab('text');
                setSelectedFiles([]);
              }}
              className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium rounded-lg transition-all ${
                activeTab === 'text'
                  ? 'bg-[#1e293b] text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#131b2e]'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-[#38bdf8]" />
              <span className="truncate">Texto</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('image');
                setSelectedFiles([]);
              }}
              className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium rounded-lg transition-all ${
                activeTab === 'image'
                  ? 'bg-[#1e293b] text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#131b2e]'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span className="truncate">Fotografias</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('short');
                setSelectedFiles([]);
              }}
              className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium rounded-lg transition-all ${
                activeTab === 'short'
                  ? 'bg-[#1e293b] text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#131b2e]'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 text-pink-400" />
              <span className="truncate">Vídeo Curto</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('video');
                setSelectedFiles([]);
              }}
              className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium rounded-lg transition-all ${
                activeTab === 'video'
                  ? 'bg-[#1e293b] text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#131b2e]'
              }`}
            >
              <VideoIcon className="w-3.5 h-3.5 text-[#818cf8]" />
              <span className="truncate">Vídeo Completo</span>
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="flex items-center gap-2 p-3 text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* PREVIEW MODE */}
          {isPreviewMode ? (
            <div className="p-4 bg-[#090d16] border border-[#1e293b] rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="text-white font-medium">{currentUser?.name || 'Autor'}</span>
                <span>·</span>
                <span>{category}</span>
                <span>·</span>
                <span className="capitalize">{visibility}</span>
              </div>

              {title && <h3 className="text-base font-semibold text-white">{title}</h3>}
              <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                {content || <span className="italic text-slate-500">Sem conteúdo de texto...</span>}
              </p>

              {/* Media Preview in preview mode */}
              {selectedFiles.length > 0 && (
                <div className="mt-3 rounded-lg overflow-hidden border border-[#1e293b] bg-black/40">
                  {activeTab === 'short' || activeTab === 'video' ? (
                    <div className="aspect-video flex items-center justify-center bg-black/60 text-slate-400 text-xs">
                      <span>Ficheiro de vídeo carregado: {selectedFiles[0]?.name}</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 p-2">
                      {selectedFiles.map((f, i) => (
                        <div key={i} className="text-xs text-slate-400 truncate bg-[#1e293b]/50 p-2 rounded">
                          {f.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {tags.map((t) => (
                    <span key={t} className="text-xs text-[#38bdf8]">
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* EDIT FORM */
            <form id="create-post-form" onSubmit={handleSubmit} className="space-y-4">
              {/* Title (for videos or articles) */}
              {(activeTab === 'video' || activeTab === 'short' || activeTab === 'text') && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Título {activeTab === 'video' ? '(obrigatório)' : '(opcional)'}
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={
                      activeTab === 'short'
                        ? 'Ex: Dica rápida de IA para programadores'
                        : activeTab === 'video'
                        ? 'Ex: Como arquitetar microsserviços modernos com TypeScript'
                        : 'Título ou resumo da publicação'
                    }
                    className="w-full px-3.5 py-2.5 text-sm bg-[#131b2e] border border-[#1e293b] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#38bdf8] transition-colors"
                  />
                </div>
              )}

              {/* Content / Description */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  {activeTab === 'text' ? 'O que pretende partilhar com a comunidade?' : 'Descrição e notas'}
                </label>
                <textarea
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Partilhe reflexões, detalhes técnicos, links ou perguntas..."
                  className="w-full px-3.5 py-2.5 text-sm bg-[#131b2e] border border-[#1e293b] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#38bdf8] transition-colors resize-none leading-relaxed"
                />
              </div>

              {/* Media File Upload Area */}
              {activeTab !== 'text' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-slate-300">
                      {activeTab === 'short'
                        ? 'Ficheiro de Vídeo Curto (formato vertical 9:16 ou MP4)'
                        : activeTab === 'video'
                        ? 'Ficheiro de Vídeo Completo (MP4 ou WebM, máx. 50MB)'
                        : 'Fotografias (JPG, PNG, WebP)'}
                    </label>
                    <span className="text-[11px] text-slate-500">
                      {activeTab === 'image' ? 'Até 8 fotografias' : 'Máx. 50MB'}
                    </span>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple={activeTab === 'image'}
                    accept={activeTab === 'image' ? 'image/*' : 'video/*'}
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {selectedFiles.length === 0 ? (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-6 px-4 border-2 border-dashed border-[#1e293b] hover:border-[#38bdf8]/50 rounded-xl bg-[#090d16]/50 flex flex-col items-center justify-center gap-2 group transition-all"
                    >
                      <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-[#38bdf8] transition-colors" />
                      <div className="text-center">
                        <span className="text-xs font-medium text-slate-200">
                          Clique para selecionar do computador ou telemóvel
                        </span>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {activeTab === 'image' ? 'JPG, PNG, WebP até 15MB' : 'MP4, WebM até 50MB'}
                        </p>
                      </div>
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <div className="p-3 bg-[#131b2e] border border-[#1e293b] rounded-xl space-y-2">
                        {selectedFiles.map((file, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs text-slate-200">
                            <span className="truncate max-w-[80%]">{file.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-slate-400 text-[10px]">
                                {(file.size / (1024 * 1024)).toFixed(1)} MB
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveFile(idx)}
                                className="p-1 hover:text-rose-400"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {activeTab === 'image' && selectedFiles.length < 8 && (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-xs text-[#38bdf8] hover:underline"
                        >
                          + Adicionar mais fotografias
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Custom Thumbnail for Videos */}
              {(activeTab === 'video' || activeTab === 'short') && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-slate-300">
                      Miniatura personalizada (opcional)
                    </label>
                    <span className="text-[11px] text-slate-500">JPG, PNG até 10MB</span>
                  </div>

                  <input
                    ref={thumbnailInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    className="hidden"
                  />

                  {thumbnailFile ? (
                    <div className="flex items-center justify-between p-2.5 bg-[#131b2e] border border-[#1e293b] rounded-xl text-xs text-slate-200">
                      <span className="truncate">{thumbnailFile.name}</span>
                      <button
                        type="button"
                        onClick={() => setThumbnailFile(null)}
                        className="p-1 text-slate-400 hover:text-rose-400"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => thumbnailInputRef.current?.click()}
                      className="px-3 py-2 text-xs text-slate-300 bg-[#131b2e] border border-[#1e293b] hover:border-slate-500 rounded-xl flex items-center gap-2 transition-colors"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-[#38bdf8]" />
                      <span>Carregar imagem de miniatura</span>
                    </button>
                  )}
                </div>
              )}

              {/* Category & Tags Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Category */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Categoria</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#131b2e] border border-[#1e293b] rounded-xl text-white focus:outline-none focus:border-[#38bdf8]"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Visibility */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Visibilidade</label>
                  <select
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value as PostVisibility)}
                    className="w-full px-3 py-2 text-xs bg-[#131b2e] border border-[#1e293b] rounded-xl text-white focus:outline-none focus:border-[#38bdf8]"
                  >
                    <option value="public">🌐 Público (no feed para todos)</option>
                    <option value="unlisted">🔗 Não listado (apenas com o link)</option>
                    <option value="private">🔒 Privado (apenas você)</option>
                  </select>
                </div>
              </div>

              {/* Tags Input */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Hashtags (pressione Enter para adicionar)
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag(tagInput);
                        }
                      }}
                      placeholder="Ex: inteligenciaartificial, react, web"
                      className="w-full pl-8 pr-3 py-2 text-xs bg-[#131b2e] border border-[#1e293b] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#38bdf8]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddTag(tagInput)}
                    className="px-3 py-2 text-xs font-medium bg-[#1e293b] text-slate-200 rounded-xl hover:bg-slate-700 transition-colors"
                  >
                    Adicionar
                  </button>
                </div>

                {/* Rendered Tags */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {tags.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-[#1e293b] text-[#38bdf8] rounded-md"
                      >
                        #{t}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(t)}
                          className="hover:text-rose-400"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Suggested Tags */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[11px] text-slate-500">Sugestões:</span>
                  {suggestedTags.map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleAddTag(st)}
                      className="text-[11px] text-slate-400 hover:text-[#38bdf8] transition-colors"
                    >
                      #{st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Publish Action: Now / Draft / Schedule */}
              <div className="p-3 bg-[#090d16] border border-[#1e293b] rounded-xl space-y-3">
                <label className="block text-xs font-medium text-slate-300">Ação de Publicação</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPublishAction('now')}
                    className={`py-2 px-3 text-xs font-medium rounded-lg border transition-colors ${
                      publishAction === 'now'
                        ? 'bg-[#38bdf8]/10 text-[#38bdf8] border-[#38bdf8]/40'
                        : 'bg-[#131b2e] text-slate-400 border-[#1e293b] hover:text-slate-200'
                    }`}
                  >
                    Publicar agora
                  </button>

                  <button
                    type="button"
                    onClick={() => setPublishAction('draft')}
                    className={`py-2 px-3 text-xs font-medium rounded-lg border transition-colors ${
                      publishAction === 'draft'
                        ? 'bg-amber-500/10 text-amber-300 border-amber-500/40'
                        : 'bg-[#131b2e] text-slate-400 border-[#1e293b] hover:text-slate-200'
                    }`}
                  >
                    Guardar rascunho
                  </button>

                  <button
                    type="button"
                    onClick={() => setPublishAction('schedule')}
                    className={`py-2 px-3 text-xs font-medium rounded-lg border transition-colors ${
                      publishAction === 'schedule'
                        ? 'bg-[#818cf8]/10 text-[#818cf8] border-[#818cf8]/40'
                        : 'bg-[#131b2e] text-slate-400 border-[#1e293b] hover:text-slate-200'
                    }`}
                  >
                    Agendar
                  </button>
                </div>

                {/* Scheduling pickers if selected */}
                {publishAction === 'schedule' && (
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Data</label>
                      <input
                        type="date"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-[#131b2e] border border-[#1e293b] rounded-lg text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Hora</label>
                      <input
                        type="time"
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-[#131b2e] border border-[#1e293b] rounded-lg text-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Upload Progress Bar if submitting */}
              {isSubmitting && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>A enviar para a base de dados...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#1e293b] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#38bdf8] to-[#818cf8] transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-[#1e293b] bg-[#090d16] shrink-0">
          <div className="text-[11px] text-slate-500">
            {visibility === 'public'
              ? 'Será visível no feed de todos os utilizadores'
              : visibility === 'unlisted'
              ? 'Apenas acessível através de ligação direta'
              : 'Visível apenas para o proprietário'}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="create-post-form"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-medium text-white bg-gradient-to-r from-[#38bdf8] to-[#6366f1] hover:opacity-95 rounded-xl shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition-all flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <Clock className="w-3.5 h-3.5 animate-spin" />
                  <span>A processar...</span>
                </>
              ) : (
                <span>
                  {publishAction === 'draft'
                    ? 'Guardar Rascunho'
                    : publishAction === 'schedule'
                    ? 'Agendar Publicação'
                    : 'Publicar Agora'}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
