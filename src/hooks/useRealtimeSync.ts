import { useEffect, useState, useCallback } from 'react';
import { SocialPost, UserProfile, NotificationItem } from '../types/superapp';
import { getStoredToken } from '../services/api';

interface RealtimeSyncProps {
  currentUser: UserProfile | null;
  onPostCreated?: (post: SocialPost) => void;
  onPostUpdated?: (postId: string, content: string, imageUrl?: string) => void;
  onPostDeleted?: (postId: string) => void;
  onLikeUpdated?: (postId: string, count: number, userId: string, isLiked: boolean) => void;
  onCommentCreated?: (postId: string, comment: any) => void;
  onNotification?: (notif: NotificationItem) => void;
}

export function useRealtimeSync({
  currentUser,
  onPostCreated,
  onPostUpdated,
  onPostDeleted,
  onLikeUpdated,
  onCommentCreated,
  onNotification,
}: RealtimeSyncProps) {
  const [onlineUsers, setOnlineUsers] = useState<{ id: string; name: string; username: string; avatar: string }[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const token = getStoredToken() || '';
    const eventSource = new EventSource(`/api/realtime/events?token=${encodeURIComponent(token)}`);

    eventSource.onopen = () => {
      setIsConnected(true);
    };

    eventSource.addEventListener('connected', () => {
      setIsConnected(true);
    });

    eventSource.addEventListener('presence_update', (e) => {
      try {
        const data = JSON.parse(e.data);
        setOnlineUsers(data.users || []);
      } catch (err) {
        console.error('Failed to parse presence update:', err);
      }
    });

    eventSource.addEventListener('post_created', (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.post && onPostCreated) {
          onPostCreated(data.post);
        }
      } catch (err) {
        console.error('Failed to parse post_created event:', err);
      }
    });

    eventSource.addEventListener('post_deleted', (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.postId && onPostDeleted) {
          onPostDeleted(data.postId);
        }
      } catch (err) {
        console.error('Failed to parse post_deleted event:', err);
      }
    });

    eventSource.addEventListener('post_updated', (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.postId && onPostUpdated) {
          onPostUpdated(data.postId, data.content, data.imageUrl);
        }
      } catch (err) {
        console.error('Failed to parse post_updated event:', err);
      }
    });

    eventSource.addEventListener('post_like_updated', (e) => {
      try {
        const data = JSON.parse(e.data);
        if (onLikeUpdated) {
          onLikeUpdated(data.postId, data.likesCount, data.userId, data.isLiked);
        }
      } catch (err) {
        console.error('Failed to parse post_like_updated event:', err);
      }
    });

    eventSource.addEventListener('comment_created', (e) => {
      try {
        const data = JSON.parse(e.data);
        if (onCommentCreated) {
          onCommentCreated(data.postId, data.comment);
        }
      } catch (err) {
        console.error('Failed to parse comment_created event:', err);
      }
    });

    eventSource.addEventListener('notification', (e) => {
      try {
        const data = JSON.parse(e.data);
        if (currentUser && data.userId === currentUser.id && onNotification) {
          onNotification(data.notif);
        }
      } catch (err) {
        console.error('Failed to parse notification event:', err);
      }
    });

    eventSource.onerror = () => {
      setIsConnected(false);
    };

    return () => {
      eventSource.close();
      setIsConnected(false);
    };
  }, [currentUser?.id, onPostCreated, onPostUpdated, onPostDeleted, onLikeUpdated, onCommentCreated, onNotification]);

  return {
    isConnected,
    onlineUsers,
    onlineCount: onlineUsers.length,
  };
}
