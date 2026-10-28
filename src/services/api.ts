import {
  UserProfile,
  SocialPost,
  NotificationItem,
  ReportItem,
  CreatorVideoItem,
  PostMediaType,
  PostVisibility,
  PostStatus,
} from '../types/superapp';

const TOKEN_KEY = 'nexo_auth_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Erro de rede (${response.status})`);
  }

  return data as T;
}

export interface CreatePostPayload {
  title?: string;
  description?: string;
  content: string;
  mediaType?: PostMediaType;
  mediaUrls?: string[];
  imageUrl?: string;
  thumbnailUrl?: string;
  category?: string;
  tags?: string[];
  visibility?: PostVisibility;
  status?: PostStatus;
  scheduledAt?: number;
  durationSec?: number;
}

export interface UploadedFile {
  url: string;
  filename: string;
  originalName: string;
  size: number;
  mimetype: string;
  isImage: boolean;
  isVideo: boolean;
}

export const api = {
  auth: {
    register: async (name: string, email: string, password: string) => {
      const res = await request<{ user: UserProfile; token: string; message: string; verificationToken?: string }>(
        '/api/auth/register',
        {
          method: 'POST',
          body: JSON.stringify({ name, email, password }),
        }
      );
      setStoredToken(res.token);
      return res;
    },

    login: async (email: string, password: string) => {
      const res = await request<{ user: UserProfile; token: string; message: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setStoredToken(res.token);
      return res;
    },

    logout: async () => {
      try {
        await request('/api/auth/logout', { method: 'POST' });
      } finally {
        setStoredToken(null);
      }
    },

    getMe: async () => {
      return request<{ user: UserProfile }>('/api/auth/me');
    },

    verifyEmail: async (email?: string, token?: string) => {
      return request<{ success: boolean; message: string }>('/api/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({ email, token }),
      });
    },

    recoverPassword: async (email: string) => {
      return request<{ message: string; resetToken?: string }>('/api/auth/recover-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    },

    resetPassword: async (token: string, newPassword: string) => {
      return request<{ success: boolean; message: string }>('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword }),
      });
    },

    updateProfile: async (data: { name?: string; bio?: string; avatar?: string }) => {
      return request<{ user: UserProfile }>('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
  },

  upload: {
    uploadFiles: async (
      files: File[],
      onProgress?: (percent: number) => void
    ): Promise<UploadedFile[]> => {
      const token = getStoredToken();
      const formData = new FormData();
      for (const file of files) {
        formData.append('files', file);
      }

      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/upload');

        if (token) {
          xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        }

        if (xhr.upload && onProgress) {
          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const percent = Math.round((event.loaded / event.total) * 100);
              onProgress(percent);
            }
          };
        }

        xhr.onload = () => {
          try {
            const data = JSON.parse(xhr.responseText);
            if (xhr.status >= 200 && xhr.status < 300 && data.success) {
              resolve(data.files as UploadedFile[]);
            } else {
              reject(new Error(data.error || 'Falha no carregamento do ficheiro.'));
            }
          } catch {
            reject(new Error('Resposta inválida do servidor durante upload.'));
          }
        };

        xhr.onerror = () => {
          reject(new Error('Erro de ligação de rede durante o upload.'));
        };

        xhr.send(formData);
      });
    },
  },

  posts: {
    getPosts: async (options?: { category?: string; tag?: string; mediaType?: string; authorId?: string }) => {
      const params = new URLSearchParams();
      if (options?.category && options.category !== 'all') params.append('category', options.category);
      if (options?.tag) params.append('tag', options.tag);
      if (options?.mediaType) params.append('mediaType', options.mediaType);
      if (options?.authorId) params.append('authorId', options.authorId);

      const qs = params.toString();
      return request<{ posts: SocialPost[] }>(`/api/posts${qs ? `?${qs}` : ''}`);
    },

    getPostById: async (postId: string) => {
      return request<{ post: SocialPost }>(`/api/posts/${postId}`);
    },

    createPost: async (payload: CreatePostPayload) => {
      return request<{ post: SocialPost; message: string }>('/api/posts', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    deletePost: async (postId: string) => {
      return request<{ success: boolean; message: string }>(`/api/posts/${postId}`, {
        method: 'DELETE',
      });
    },

    updatePost: async (
      postId: string,
      updates: Partial<{
        title: string;
        description: string;
        content: string;
        category: string;
        tags: string[];
        visibility: PostVisibility;
        thumbnailUrl: string;
        status: PostStatus;
        imageUrl: string;
        mediaUrls: string[];
      }>
    ) => {
      return request<{ success: boolean; post: SocialPost }>(`/api/posts/${postId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    },

    recordView: async (postId: string) => {
      return request<{ viewsCount: number; isNew: boolean }>(`/api/posts/${postId}/view`, {
        method: 'POST',
      });
    },

    toggleLike: async (postId: string) => {
      return request<{ isLiked: boolean; likesCount: number }>(`/api/posts/${postId}/like`, {
        method: 'POST',
      });
    },

    toggleSave: async (postId: string) => {
      return request<{ isSaved: boolean }>(`/api/posts/${postId}/save`, {
        method: 'POST',
      });
    },

    getSavedPosts: async () => {
      return request<{ posts: SocialPost[] }>('/api/saved-posts');
    },

    addComment: async (postId: string, content: string) => {
      return request<{ comment: any }>(`/api/posts/${postId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      });
    },

    toggleFollow: async (userId: string) => {
      return request<{ isFollowing: boolean }>(`/api/users/${userId}/follow`, {
        method: 'POST',
      });
    },

    reportPost: async (targetId: string, targetType: string, reason: string) => {
      return request<{ report: ReportItem; message: string }>('/api/reports', {
        method: 'POST',
        body: JSON.stringify({ targetId, targetType, reason }),
      });
    },

    blockUser: async (targetId: string) => {
      return request<{ success: boolean; message: string }>(`/api/users/${targetId}/block`, {
        method: 'POST',
      });
    },
  },

  creator: {
    getMyVideos: async () => {
      return request<{ videos: CreatorVideoItem[] }>('/api/my-videos');
    },
  },

  presence: {
    getPresence: async () => {
      return request<{ onlineCount: number; users: { id: string; name: string; username: string; avatar: string }[] }>(
        '/api/presence'
      );
    },
  },

  notifications: {
    getNotifications: async () => {
      return request<{ notifications: NotificationItem[] }>('/api/notifications');
    },

    markRead: async () => {
      return request<{ success: boolean }>('/api/notifications/read', { method: 'POST' });
    },
  },

  admin: {
    getReports: async () => {
      return request<{ reports: ReportItem[] }>('/api/admin/reports');
    },

    resolveReport: async (reportId: string, status: 'resolved' | 'dismissed') => {
      return request<{ report: ReportItem }>(`/api/admin/reports/${reportId}/resolve`, {
        method: 'POST',
        body: JSON.stringify({ status }),
      });
    },
  },
};
