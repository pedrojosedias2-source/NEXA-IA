import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Response } from 'express';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'social_db.json');

// Ensure data directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

export interface UserRecord {
  id: string;
  name: string;
  username: string;
  email: string;
  passwordHash: string;
  salt: string;
  emailVerified: boolean;
  avatar: string;
  bio: string;
  role: 'user' | 'creator' | 'admin';
  createdAt: number;
  updatedAt: number;
}

export interface SessionRecord {
  token: string;
  userId: string;
  createdAt: number;
  expiresAt: number;
}

export type PostMediaType = 'text' | 'image' | 'short' | 'video';
export type PostVisibility = 'public' | 'private' | 'unlisted';
export type PostStatus = 'published' | 'draft' | 'scheduled' | 'processing';

export interface PostRecord {
  id: string;
  authorId: string;
  title?: string;
  description?: string;
  content: string;
  mediaType: PostMediaType;
  mediaUrls: string[];
  imageUrl?: string;
  thumbnailUrl?: string;
  category: string;
  tags: string[];
  visibility: PostVisibility;
  status: PostStatus;
  scheduledAt?: number;
  viewsCount: number;
  uniqueViewers: string[];
  durationSec?: number;
  createdAt: number;
  updatedAt: number;
}

export interface CommentRecord {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: number;
}

export interface LikeRecord {
  id: string;
  postId: string;
  userId: string;
  createdAt: number;
}

export interface SavedPostRecord {
  id: string;
  postId: string;
  userId: string;
  createdAt: number;
}

export interface FollowRecord {
  followerId: string;
  followingId: string;
  createdAt: number;
}

export interface NotificationRecord {
  id: string;
  userId: string;
  type: 'social' | 'system' | 'like' | 'comment' | 'video';
  title: string;
  content: string;
  read: boolean;
  actionUrl?: string;
  createdAt: number;
}

export interface ReportRecord {
  id: string;
  targetId: string;
  targetType: 'post' | 'comment' | 'user' | 'video';
  reason: string;
  reporterId: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: number;
}

export interface DatabaseSchema {
  users: UserRecord[];
  sessions: SessionRecord[];
  posts: PostRecord[];
  comments: CommentRecord[];
  likes: LikeRecord[];
  savedPosts: SavedPostRecord[];
  follows: FollowRecord[];
  notifications: NotificationRecord[];
  reports: ReportRecord[];
  blockedUsers: { blockerId: string; blockedId: string; createdAt: number }[];
  passwordResetTokens: { token: string; email: string; expiresAt: number }[];
}

function getInitialDatabase(): DatabaseSchema {
  return {
    users: [],
    sessions: [],
    posts: [],
    comments: [],
    likes: [],
    savedPosts: [],
    follows: [],
    notifications: [],
    reports: [],
    blockedUsers: [],
    passwordResetTokens: [],
  };
}

let dbData: DatabaseSchema = getInitialDatabase();

// Load from disk if exists
try {
  if (fs.existsSync(DB_FILE)) {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    dbData = {
      ...getInitialDatabase(),
      ...parsed,
      savedPosts: Array.isArray(parsed.savedPosts) ? parsed.savedPosts : [],
      posts: Array.isArray(parsed.posts) ? parsed.posts.map((p: any) => ({
        id: p.id,
        authorId: p.authorId,
        title: p.title || '',
        description: p.description || '',
        content: p.content || '',
        mediaType: p.mediaType || (p.imageUrl ? 'image' : 'text'),
        mediaUrls: Array.isArray(p.mediaUrls) ? p.mediaUrls : (p.imageUrl ? [p.imageUrl] : []),
        imageUrl: p.imageUrl,
        thumbnailUrl: p.thumbnailUrl,
        category: p.category || 'Geral',
        tags: Array.isArray(p.tags) ? p.tags : [],
        visibility: p.visibility || 'public',
        status: p.status || 'published',
        scheduledAt: p.scheduledAt,
        viewsCount: typeof p.viewsCount === 'number' ? p.viewsCount : 0,
        uniqueViewers: Array.isArray(p.uniqueViewers) ? p.uniqueViewers : [],
        durationSec: p.durationSec,
        createdAt: p.createdAt || Date.now(),
        updatedAt: p.updatedAt || Date.now(),
      })) : [],
    };
    console.log(`[Nexo AI Database] Loaded ${dbData.users.length} users and ${dbData.posts.length} posts from disk.`);
  } else {
    saveDatabase();
    console.log('[Nexo AI Database] Initialized clean, honest database (zero fake users/posts).');
  }
} catch (err) {
  console.error('[Nexo AI Database] Failed to parse db file, starting clean:', err);
  dbData = getInitialDatabase();
  saveDatabase();
}

function saveDatabase() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(dbData, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Nexo AI Database] Failed to write database to disk:', err);
  }
}

// Password utilities
export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  try {
    const testHash = crypto.scryptSync(password, salt, 64).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(testHash, 'hex'));
  } catch {
    return false;
  }
}

// Active real-time SSE connections
interface ClientConnection {
  id: string;
  userId: string | null;
  res: Response;
  lastHeartbeat: number;
}

const activeClients: ClientConnection[] = [];

export function addClient(userId: string | null, res: Response): string {
  const connectionId = crypto.randomUUID();
  const client: ClientConnection = {
    id: connectionId,
    userId,
    res,
    lastHeartbeat: Date.now(),
  };
  activeClients.push(client);

  // Broadcast presence update
  broadcastPresence();

  return connectionId;
}

export function removeClient(connectionId: string) {
  const index = activeClients.findIndex((c) => c.id === connectionId);
  if (index !== -1) {
    activeClients.splice(index, 1);
    broadcastPresence();
  }
}

export function updateClientUser(connectionId: string, userId: string | null) {
  const client = activeClients.find((c) => c.id === connectionId);
  if (client) {
    client.userId = userId;
    broadcastPresence();
  }
}

export function broadcastEvent(eventType: string, payload: any) {
  const data = `event: ${eventType}\ndata: ${JSON.stringify(payload)}\n\n`;
  for (const client of activeClients) {
    try {
      client.res.write(data);
    } catch (err) {
      // client broken, will be removed on disconnect
    }
  }
}

export function getOnlineUsers(): { id: string; name: string; username: string; avatar: string }[] {
  const activeUserIds = new Set<string>();
  for (const c of activeClients) {
    if (c.userId) {
      activeUserIds.add(c.userId);
    }
  }

  const result: { id: string; name: string; username: string; avatar: string }[] = [];
  for (const uid of activeUserIds) {
    const user = dbData.users.find((u) => u.id === uid);
    if (user) {
      result.push({
        id: user.id,
        name: user.name,
        username: user.username,
        avatar: user.avatar,
      });
    }
  }
  return result;
}

export function broadcastPresence() {
  const online = getOnlineUsers();
  broadcastEvent('presence_update', {
    onlineCount: online.length,
    users: online,
  });
}

// Heartbeat routine
setInterval(() => {
  for (let i = activeClients.length - 1; i >= 0; i--) {
    const client = activeClients[i];
    try {
      client.res.write(': keepalive\n\n');
    } catch {
      activeClients.splice(i, 1);
      broadcastPresence();
    }
  }
}, 15000);

export interface PostFilterOptions {
  category?: string;
  tag?: string;
  mediaType?: PostMediaType;
  authorId?: string;
  includeDrafts?: boolean;
}

// DB CRUD Helpers
export const db = {
  // Users
  getUserById: (id: string) => dbData.users.find((u) => u.id === id) || null,
  getUserByEmail: (email: string) =>
    dbData.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null,
  getUserByUsername: (username: string) =>
    dbData.users.find((u) => u.username.toLowerCase() === username.toLowerCase()) || null,
  getAllUsers: () =>
    dbData.users.map(({ passwordHash, salt, ...rest }) => rest),

  createUser: (user: Omit<UserRecord, 'createdAt' | 'updatedAt'>): UserRecord => {
    const now = Date.now();
    const newRecord: UserRecord = {
      ...user,
      createdAt: now,
      updatedAt: now,
    };
    dbData.users.push(newRecord);
    saveDatabase();
    return newRecord;
  },

  updateUser: (id: string, updates: Partial<Omit<UserRecord, 'id' | 'createdAt'>>): UserRecord | null => {
    const user = dbData.users.find((u) => u.id === id);
    if (!user) return null;
    Object.assign(user, updates, { updatedAt: Date.now() });
    saveDatabase();
    return user;
  },

  // Sessions
  createSession: (userId: string): string => {
    const token = crypto.randomUUID();
    const now = Date.now();
    const expiresAt = now + 30 * 24 * 60 * 60 * 1000; // 30 days
    dbData.sessions.push({
      token,
      userId,
      createdAt: now,
      expiresAt,
    });
    saveDatabase();
    return token;
  },

  getSessionUser: (token: string): UserRecord | null => {
    if (!token) return null;
    const session = dbData.sessions.find((s) => s.token === token);
    if (!session || session.expiresAt < Date.now()) return null;
    return db.getUserById(session.userId);
  },

  deleteSession: (token: string) => {
    dbData.sessions = dbData.sessions.filter((s) => s.token !== token);
    saveDatabase();
  },

  // Password reset
  createPasswordResetToken: (email: string): string => {
    const token = crypto.randomBytes(24).toString('hex');
    const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour
    dbData.passwordResetTokens = dbData.passwordResetTokens.filter((r) => r.email !== email);
    dbData.passwordResetTokens.push({ token, email, expiresAt });
    saveDatabase();
    return token;
  },

  verifyPasswordResetToken: (token: string): string | null => {
    const entry = dbData.passwordResetTokens.find((r) => r.token === token && r.expiresAt > Date.now());
    return entry ? entry.email : null;
  },

  consumePasswordResetToken: (token: string) => {
    dbData.passwordResetTokens = dbData.passwordResetTokens.filter((r) => r.token !== token);
    saveDatabase();
  },

  // Helper to format post for client
  formatPost: (post: PostRecord, currentUserId?: string) => {
    const author = db.getUserById(post.authorId);
    const comments = dbData.comments
      .filter((c) => c.postId === post.id)
      .sort((a, b) => a.createdAt - b.createdAt)
      .map((c) => {
        const cAuthor = db.getUserById(c.authorId);
        return {
          id: c.id,
          postId: c.postId,
          authorId: c.authorId,
          authorName: cAuthor?.name || 'Utilizador',
          authorAvatar: cAuthor?.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${c.authorId}`,
          content: c.content,
          createdAt: new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          rawCreatedAt: c.createdAt,
          likesCount: 0,
        };
      });

    const likes = dbData.likes.filter((l) => l.postId === post.id);
    const isLiked = currentUserId ? likes.some((l) => l.userId === currentUserId) : false;
    const isSaved = currentUserId ? dbData.savedPosts.some((s) => s.postId === post.id && s.userId === currentUserId) : false;

    return {
      id: post.id,
      author: {
        id: post.authorId,
        name: author?.name || 'Utilizador',
        username: author?.username || 'utilizador',
        avatar: author?.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${post.authorId}`,
        bio: author?.bio || '',
        role: author?.role || 'user',
        followersCount: dbData.follows.filter((f) => f.followingId === post.authorId).length,
        followingCount: dbData.follows.filter((f) => f.followerId === post.authorId).length,
        postsCount: dbData.posts.filter((p) => p.authorId === post.authorId && p.status === 'published').length,
        joinedDate: author ? new Date(author.createdAt).toLocaleDateString() : '2026',
        isFollowing: currentUserId ? dbData.follows.some((f) => f.followerId === currentUserId && f.followingId === post.authorId) : false,
      },
      title: post.title || '',
      description: post.description || '',
      content: post.content,
      mediaType: post.mediaType || 'text',
      mediaUrls: post.mediaUrls || (post.imageUrl ? [post.imageUrl] : []),
      imageUrl: post.imageUrl || (post.mediaUrls && post.mediaUrls.length > 0 ? post.mediaUrls[0] : undefined),
      thumbnailUrl: post.thumbnailUrl,
      category: post.category || 'Geral',
      tags: post.tags || [],
      visibility: post.visibility || 'public',
      status: post.status || 'published',
      scheduledAt: post.scheduledAt,
      viewsCount: post.viewsCount || 0,
      durationSec: post.durationSec,
      likesCount: likes.length,
      commentsCount: comments.length,
      sharesCount: 0,
      createdAt: new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      rawCreatedAt: post.createdAt,
      isLiked,
      isSaved,
      comments,
    };
  },

  // Posts query with visibility & permission governance
  getPosts: (currentUserId?: string, options?: PostFilterOptions) => {
    const blockedUserIds = new Set(
      currentUserId
        ? dbData.blockedUsers
            .filter((b) => b.blockerId === currentUserId)
            .map((b) => b.blockedId)
        : []
    );

    const now = Date.now();

    return dbData.posts
      .filter((post) => {
        // Exclude blocked users
        if (blockedUserIds.has(post.authorId)) return false;

        const isAuthor = currentUserId && post.authorId === currentUserId;

        // Drafts: only visible to author
        if (post.status === 'draft' && !isAuthor) return false;

        // Scheduled: visible to author, or publicly once scheduledAt is reached
        if (post.status === 'scheduled') {
          if (!isAuthor && (!post.scheduledAt || post.scheduledAt > now)) {
            return false;
          }
        }

        // Visibility rules:
        // 'private': only author can see
        if (post.visibility === 'private' && !isAuthor) {
          return false;
        }

        // 'unlisted': excluded from general feed! Only returned if author is viewing, or queried directly by ID
        if (post.visibility === 'unlisted' && !isAuthor && !options?.authorId) {
          return false;
        }

        // Optional filters
        if (options?.category && options.category !== 'all' && post.category !== options.category) {
          return false;
        }

        if (options?.mediaType && post.mediaType !== options.mediaType) {
          return false;
        }

        if (options?.tag && !post.tags.some((t) => t.toLowerCase() === options.tag!.toLowerCase())) {
          return false;
        }

        if (options?.authorId && post.authorId !== options.authorId) {
          return false;
        }

        return true;
      })
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((p) => db.formatPost(p, currentUserId));
  },

  // Get specific post by ID (supports direct unlisted link access!)
  getPostById: (postId: string, currentUserId?: string) => {
    const post = dbData.posts.find((p) => p.id === postId);
    if (!post) return null;

    const isAuthor = currentUserId && post.authorId === currentUserId;

    // Private posts only accessible to author
    if (post.visibility === 'private' && !isAuthor) {
      return null;
    }

    // Drafts only accessible to author
    if (post.status === 'draft' && !isAuthor) {
      return null;
    }

    // Unlisted posts ARE allowed here (feature requirement: accessible via direct link/ID)
    return db.formatPost(post, currentUserId);
  },

  createPost: (data: {
    authorId: string;
    content: string;
    title?: string;
    description?: string;
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
  }): PostRecord => {
    const now = Date.now();
    const mediaType = data.mediaType || (data.mediaUrls && data.mediaUrls.length > 0 ? 'image' : 'text');
    const mediaUrls = data.mediaUrls || (data.imageUrl ? [data.imageUrl] : []);

    const post: PostRecord = {
      id: `p-${now}-${Math.random().toString(36).substring(2, 6)}`,
      authorId: data.authorId,
      title: data.title ? data.title.trim() : undefined,
      description: data.description ? data.description.trim() : undefined,
      content: data.content.trim(),
      mediaType,
      mediaUrls,
      imageUrl: mediaUrls.length > 0 ? mediaUrls[0] : undefined,
      thumbnailUrl: data.thumbnailUrl ? data.thumbnailUrl.trim() : undefined,
      category: data.category || 'Geral',
      tags: Array.isArray(data.tags) ? data.tags.map((t) => t.trim().replace(/^#/, '')) : [],
      visibility: data.visibility || 'public',
      status: data.status || 'published',
      scheduledAt: data.scheduledAt,
      viewsCount: 0,
      uniqueViewers: [],
      durationSec: data.durationSec,
      createdAt: now,
      updatedAt: now,
    };

    dbData.posts.unshift(post);
    saveDatabase();
    return post;
  },

  deletePost: (postId: string, userId: string, isAdmin = false): boolean => {
    const postIndex = dbData.posts.findIndex((p) => p.id === postId);
    if (postIndex === -1) return false;

    const post = dbData.posts[postIndex];
    if (post.authorId !== userId && !isAdmin) {
      return false; // Forbidden: can only delete own posts unless admin
    }

    dbData.posts.splice(postIndex, 1);
    dbData.comments = dbData.comments.filter((c) => c.postId !== postId);
    dbData.likes = dbData.likes.filter((l) => l.postId !== postId);
    dbData.savedPosts = dbData.savedPosts.filter((s) => s.postId !== postId);
    saveDatabase();
    return true;
  },

  updatePost: (
    postId: string,
    userId: string,
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
    }>,
    isAdmin = false
  ): PostRecord | null => {
    const post = dbData.posts.find((p) => p.id === postId);
    if (!post) return null;
    if (post.authorId !== userId && !isAdmin) {
      return null; // Forbidden: can only edit own posts unless admin
    }

    if (updates.title !== undefined) post.title = updates.title;
    if (updates.description !== undefined) post.description = updates.description;
    if (updates.content !== undefined) post.content = updates.content;
    if (updates.category !== undefined) post.category = updates.category;
    if (updates.tags !== undefined) post.tags = updates.tags;
    if (updates.visibility !== undefined) post.visibility = updates.visibility;
    if (updates.thumbnailUrl !== undefined) post.thumbnailUrl = updates.thumbnailUrl;
    if (updates.status !== undefined) post.status = updates.status;
    if (updates.mediaUrls !== undefined) {
      post.mediaUrls = updates.mediaUrls;
      if (post.mediaUrls.length > 0) post.imageUrl = post.mediaUrls[0];
    } else if (updates.imageUrl !== undefined) {
      post.imageUrl = updates.imageUrl;
      post.mediaUrls = updates.imageUrl ? [updates.imageUrl] : [];
    }

    post.updatedAt = Date.now();
    saveDatabase();
    return post;
  },

  // Deduplicated view counter (honest stats, no inflation!)
  recordView: (postId: string, viewerIdentifier: string): { viewsCount: number; isNew: boolean } => {
    const post = dbData.posts.find((p) => p.id === postId);
    if (!post) return { viewsCount: 0, isNew: false };

    if (!Array.isArray(post.uniqueViewers)) {
      post.uniqueViewers = [];
    }

    if (!post.uniqueViewers.includes(viewerIdentifier)) {
      post.uniqueViewers.push(viewerIdentifier);
      post.viewsCount = (post.viewsCount || 0) + 1;
      saveDatabase();
      return { viewsCount: post.viewsCount, isNew: true };
    }

    return { viewsCount: post.viewsCount || 0, isNew: false };
  },

  // Toggle bookmark / saved post
  toggleSavePost: (postId: string, userId: string): boolean => {
    const existingIndex = dbData.savedPosts.findIndex((s) => s.postId === postId && s.userId === userId);
    let isSaved = false;
    if (existingIndex !== -1) {
      dbData.savedPosts.splice(existingIndex, 1);
      isSaved = false;
    } else {
      dbData.savedPosts.push({
        id: `save-${Date.now()}`,
        postId,
        userId,
        createdAt: Date.now(),
      });
      isSaved = true;
    }
    saveDatabase();
    return isSaved;
  },

  getSavedPosts: (userId: string) => {
    const savedIds = dbData.savedPosts.filter((s) => s.userId === userId).map((s) => s.postId);
    return dbData.posts
      .filter((p) => savedIds.includes(p.id))
      .map((p) => db.formatPost(p, userId));
  },

  // Creator studio / user videos
  getMyVideos: (userId: string) => {
    return dbData.posts
      .filter((p) => p.authorId === userId && (p.mediaType === 'short' || p.mediaType === 'video'))
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((p) => {
        const comments = dbData.comments.filter((c) => c.postId === p.id);
        const likes = dbData.likes.filter((l) => l.postId === p.id);
        return {
          id: p.id,
          title: p.title || p.content.slice(0, 40) || 'Vídeo sem título',
          description: p.description || p.content,
          mediaType: p.mediaType,
          videoUrl: p.mediaUrls && p.mediaUrls.length > 0 ? p.mediaUrls[0] : (p.imageUrl || ''),
          thumbnailUrl: p.thumbnailUrl || p.imageUrl || '',
          category: p.category,
          tags: p.tags,
          visibility: p.visibility,
          status: p.status,
          viewsCount: p.viewsCount || 0,
          likesCount: likes.length,
          commentsCount: comments.length,
          durationSec: p.durationSec || 60,
          createdAt: p.createdAt,
          formattedDate: new Date(p.createdAt).toLocaleDateString(),
        };
      });
  },

  toggleLike: (postId: string, userId: string): { isLiked: boolean; count: number } => {
    const existingIndex = dbData.likes.findIndex((l) => l.postId === postId && l.userId === userId);
    let isLiked = false;

    if (existingIndex !== -1) {
      dbData.likes.splice(existingIndex, 1);
      isLiked = false;
    } else {
      dbData.likes.push({
        id: `l-${Date.now()}`,
        postId,
        userId,
        createdAt: Date.now(),
      });
      isLiked = true;

      // Notify post author if not self
      const post = dbData.posts.find((p) => p.id === postId);
      if (post && post.authorId !== userId) {
        const liker = db.getUserById(userId);
        db.createNotification(
          post.authorId,
          'like',
          'Novo Gosto',
          `${liker?.name || 'Alguém'} gostou da sua publicação.`
        );
      }
    }
    saveDatabase();
    const count = dbData.likes.filter((l) => l.postId === postId).length;
    return { isLiked, count };
  },

  addComment: (postId: string, authorId: string, content: string) => {
    const comment: CommentRecord = {
      id: `c-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      postId,
      authorId,
      content,
      createdAt: Date.now(),
    };
    dbData.comments.push(comment);

    // Notify post author if not self
    const post = dbData.posts.find((p) => p.id === postId);
    if (post && post.authorId !== authorId) {
      const commenter = db.getUserById(authorId);
      db.createNotification(
        post.authorId,
        'comment',
        'Novo Comentário',
        `${commenter?.name || 'Alguém'} comentou: "${content.slice(0, 40)}..."`
      );
    }

    saveDatabase();
    return comment;
  },

  toggleFollow: (followerId: string, followingId: string): boolean => {
    if (followerId === followingId) return false;
    const existingIndex = dbData.follows.findIndex(
      (f) => f.followerId === followerId && f.followingId === followingId
    );
    let isFollowing = false;

    if (existingIndex !== -1) {
      dbData.follows.splice(existingIndex, 1);
      isFollowing = false;
    } else {
      dbData.follows.push({
        followerId,
        followingId,
        createdAt: Date.now(),
      });
      isFollowing = true;

      const follower = db.getUserById(followerId);
      db.createNotification(
        followingId,
        'social',
        'Novo Seguidor',
        `${follower?.name || 'Alguém'} começou a seguir você.`
      );
    }
    saveDatabase();
    return isFollowing;
  },

  // Notifications
  getUserNotifications: (userId: string) =>
    dbData.notifications
      .filter((n) => n.userId === userId)
      .sort((a, b) => b.createdAt - a.createdAt),

  createNotification: (userId: string, type: any, title: string, content: string, actionUrl?: string) => {
    const notif: NotificationRecord = {
      id: `n-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      userId,
      type,
      title,
      content,
      read: false,
      actionUrl,
      createdAt: Date.now(),
    };
    dbData.notifications.unshift(notif);
    saveDatabase();
    broadcastEvent('notification', { userId, notif });
    return notif;
  },

  markNotificationsRead: (userId: string) => {
    for (const n of dbData.notifications) {
      if (n.userId === userId) {
        n.read = true;
      }
    }
    saveDatabase();
  },

  // Reports
  createReport: (targetId: string, targetType: any, reason: string, reporterId: string) => {
    const report: ReportRecord = {
      id: `rep-${Date.now()}`,
      targetId,
      targetType,
      reason,
      reporterId,
      status: 'pending',
      createdAt: Date.now(),
    };
    dbData.reports.unshift(report);
    saveDatabase();
    return report;
  },

  getReports: () => dbData.reports,

  updateReportStatus: (id: string, status: 'resolved' | 'dismissed') => {
    const rep = dbData.reports.find((r) => r.id === id);
    if (rep) {
      rep.status = status;
      saveDatabase();
    }
    return rep;
  },

  // Block user
  blockUser: (blockerId: string, blockedId: string) => {
    if (blockerId === blockedId) return;
    if (!dbData.blockedUsers.some((b) => b.blockerId === blockerId && b.blockedId === blockedId)) {
      dbData.blockedUsers.push({ blockerId, blockedId, createdAt: Date.now() });
      saveDatabase();
    }
  },
};
