export type MainSection =
  | 'home'
  | 'ai-chat'
  | 'community'
  | 'videos'
  | 'creator-studio'
  | 'journal'
  | 'ai-tools'
  | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  bio: string;
  role: 'user' | 'creator' | 'admin';
  followersCount: number;
  followingCount: number;
  postsCount: number;
  joinedDate: string;
  isFollowing?: boolean;
}

export interface PostComment {
  id: string;
  postId?: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
  rawCreatedAt?: number;
  likesCount: number;
  isLiked?: boolean;
}

export type PostMediaType = 'text' | 'image' | 'short' | 'video';
export type PostVisibility = 'public' | 'private' | 'unlisted';
export type PostStatus = 'published' | 'draft' | 'scheduled' | 'processing';

export interface SocialPost {
  id: string;
  author: UserProfile;
  title?: string;
  description?: string;
  content: string;
  mediaType?: PostMediaType;
  mediaUrls?: string[];
  imageUrl?: string;
  thumbnailUrl?: string;
  category?: string;
  tags: string[];
  visibility?: PostVisibility;
  status?: PostStatus;
  scheduledAt?: number;
  viewsCount?: number;
  durationSec?: number;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  createdAt: string;
  rawCreatedAt?: number;
  isLiked?: boolean;
  isSaved?: boolean;
  comments: PostComment[];
  isDemo?: boolean;
}

export interface VideoItem {
  id: string;
  title: string;
  description: string;
  category: 'Tecnologia' | 'Inteligência Artificial' | 'Tutoriais' | 'Criatividade' | 'Produtividade' | string;
  creator: UserProfile;
  videoUrl: string;
  thumbnailUrl: string;
  likesCount: number;
  commentsCount: number;
  viewsCount: number;
  tags?: string[];
  visibility?: PostVisibility;
  status?: PostStatus;
  mediaType?: 'short' | 'video';
  isLiked?: boolean;
  isSaved?: boolean;
  isDemo?: boolean;
  durationSec: number;
  formattedDate?: string;
}

export interface CreatorVideoItem {
  id: string;
  title: string;
  description: string;
  mediaType: 'short' | 'video';
  videoUrl: string;
  thumbnailUrl: string;
  category: string;
  tags: string[];
  visibility: PostVisibility;
  status: PostStatus;
  viewsCount: number;
  likesCount: number;
  commentsCount: number;
  durationSec: number;
  createdAt: number;
  formattedDate: string;
}

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  category: 'Pessoal' | 'Ideias' | 'Trabalho' | 'Saúde' | 'Metas';
  imageUrl?: string;
  mood?: 'radiante' | 'produtivo' | 'tranquilo' | 'cansado' | 'reflexivo';
  isPrivate: boolean;
}

export interface HabitItem {
  id: string;
  name: string;
  category: string;
  targetPerWeek: number;
  completedDates: string[]; // YYYY-MM-DD
  streakDays: number;
}

export interface TodoItem {
  id: string;
  text: string;
  dueDate?: string;
  category: string;
  isCompleted: boolean;
}

export interface AIToolConfig {
  id: string;
  title: string;
  description: string;
  category: string;
  iconName: string;
  inputPlaceholder: string;
  inputLabel: string;
  secondaryOptionLabel?: string;
  secondaryOptions?: string[];
  samplePrompt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: 'social' | 'system' | 'ai' | 'video';
  actionUrl?: string;
}

export interface ReportItem {
  id: string;
  targetId: string;
  targetType: 'post' | 'comment' | 'user' | 'video';
  reason: string;
  reportedBy: string;
  createdAt: string;
  status: 'pending' | 'resolved' | 'dismissed';
}
