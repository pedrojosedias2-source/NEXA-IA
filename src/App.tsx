import React, { useState, useEffect, useCallback } from 'react';
import {
  MainSection,
  UserProfile,
  SocialPost,
  VideoItem,
  JournalEntry,
  HabitItem,
  TodoItem,
  AIToolConfig,
  NotificationItem,
  ReportItem,
  PostMediaType,
} from './types/superapp';
import { Session, Message, ModelId, Attachment, CodeArtifact } from './types';
import {
  INITIAL_VIDEOS,
  INITIAL_JOURNAL_ENTRIES,
  INITIAL_HABITS,
  INITIAL_TODOS,
  AI_TOOLS_CATALOG,
  INITIAL_NOTIFICATIONS,
  INITIAL_REPORTS,
} from './data/mockSuperappData';

import { Navbar } from './components/common/Navbar';
import { SidebarNav } from './components/common/SidebarNav';
import { BottomNav } from './components/common/BottomNav';
import { HomeDashboard } from './components/home/HomeDashboard';
import { AIChatView } from './components/ai/AIChatView';
import { CommunityView } from './components/community/CommunityView';
import { VideosView } from './components/videos/VideosView';
import { MyVideosView } from './components/creator/MyVideosView';
import { CreatePostModal } from './components/creator/CreatePostModal';
import { JournalView } from './components/journal/JournalView';
import { AIToolsView } from './components/tools/AIToolsView';
import { AdminDashboardView } from './components/admin/AdminDashboardView';
import { AuthModal } from './components/auth/AuthModal';
import { ProfileModal } from './components/profile/ProfileModal';
import { ArtifactCanvasModal } from './components/ArtifactCanvasModal';
import { streamGeminiResponse, extractCodeArtifacts } from './services/geminiService';
import { api, getStoredToken, setStoredToken } from './services/api';
import { useRealtimeSync } from './hooks/useRealtimeSync';

export default function App() {
  // Navigation
  const [currentSection, setCurrentSection] = useState<MainSection>('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Theme: dark (default) | light
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [createModalDefaultType, setCreateModalDefaultType] = useState<PostMediaType>('text');
  const [selectedArtifact, setSelectedArtifact] = useState<CodeArtifact | null>(null);
  const [selectedToolId, setSelectedToolId] = useState<string | undefined>(undefined);

  // User State: real auth session
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('nexo_current_user');
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);

  // Real Social Posts from Database
  const [posts, setPosts] = useState<SocialPost[]>([]);

  // Videos
  const [videos, setVideos] = useState<VideoItem[]>(() => {
    try {
      const saved = localStorage.getItem('nexo_videos');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_VIDEOS;
  });

  // Journal Entries
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(() => {
    try {
      const saved = localStorage.getItem('nexo_journal');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_JOURNAL_ENTRIES;
  });

  // Habits & Todos
  const [habits, setHabits] = useState<HabitItem[]>(() => {
    try {
      const saved = localStorage.getItem('nexo_habits');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_HABITS;
  });

  const [todos, setTodos] = useState<TodoItem[]>(() => {
    try {
      const saved = localStorage.getItem('nexo_todos');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_TODOS;
  });

  // Notifications & Reports
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [reports, setReports] = useState<ReportItem[]>(INITIAL_REPORTS);

  // AI Chat Sessions
  const [sessions, setSessions] = useState<Session[]>(() => {
    try {
      const saved = localStorage.getItem('nexo_ai_sessions');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'session-superapp-1',
        title: 'Assistente Nexo AI',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        model: 'gemini-3.8-flash',
        messages: [
          {
            id: 'm-1',
            role: 'assistant',
            content: `Olá! Eu sou o assistente de inteligência artificial do **Nexo AI** Superapp.

Posso ajudar você a:
- **Resumir** textos longos e documentos
- **Traduzir** com precisão técnica e cultural
- **Explicar** conceitos complexos de programação, ciência ou negócios
- **Redigir** e-mails, relatórios e roteiros
- **Gerar ideias** e planos de ação estruturados

Como posso colaborar com o seu dia?`,
            timestamp: Date.now() - 30000,
            model: 'gemini-3.8-flash',
            latencyMs: 38,
            tokenCount: 110,
            tokensPerSec: '88.5',
          },
        ],
      },
    ];
  });

  const [currentSessionId, setCurrentSessionId] = useState<string>(sessions[0]?.id || 'session-superapp-1');
  const [selectedModel, setSelectedModel] = useState<ModelId>('gemini-3.8-flash');
  const [isStreaming, setIsStreaming] = useState(false);

  // Sync theme with DOM
  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

  // Persist storage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('nexo_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('nexo_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('nexo_journal', JSON.stringify(journalEntries));
  }, [journalEntries]);

  useEffect(() => {
    localStorage.setItem('nexo_habits', JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem('nexo_todos', JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    localStorage.setItem('nexo_ai_sessions', JSON.stringify(sessions));
  }, [sessions]);

  // Toggle theme
  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Real Session Verification on Mount
  useEffect(() => {
    const token = getStoredToken();
    if (token) {
      api.auth
        .getMe()
        .then((res) => {
          if (res && res.user) {
            setCurrentUser(res.user);
          }
        })
        .catch(() => {
          setStoredToken(null);
          setCurrentUser(null);
        });
    }
  }, []);

  // Fetch real posts from backend
  const fetchPosts = useCallback(async () => {
    try {
      const res = await api.posts.getPosts();
      setPosts(res.posts || []);
    } catch (err) {
      console.error('Failed to load posts from database:', err);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts, currentUser]);

  // Check URL query parameters for direct post link (e.g. unlisted posts)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const postId = params.get('post');
    if (postId) {
      api.posts
        .getPostById(postId)
        .then((res) => {
          if (res && res.post) {
            setPosts((prev) => {
              if (prev.some((p) => p.id === res.post.id)) return prev;
              return [res.post, ...prev];
            });
            setCurrentSection('community');
          }
        })
        .catch(() => {});
    }
  }, []);

  // Real-time synchronization listeners
  const handleRealtimePostCreated = useCallback((newPost: SocialPost) => {
    setPosts((prev) => {
      if (prev.some((p) => p.id === newPost.id)) return prev;
      return [newPost, ...prev];
    });
  }, []);

  const handleRealtimePostDeleted = useCallback((postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  }, []);

  const handleRealtimePostUpdated = useCallback((postId: string, content: string, imageUrl?: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, content, imageUrl: imageUrl ?? p.imageUrl } : p))
    );
  }, []);

  const handleRealtimeLikeUpdated = useCallback(
    (postId: string, count: number, userId: string, isLiked: boolean) => {
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id === postId) {
            return {
              ...p,
              likesCount: count,
              isLiked: currentUser?.id === userId ? isLiked : p.isLiked,
            };
          }
          return p;
        })
      );
    },
    [currentUser?.id]
  );

  const handleRealtimeCommentCreated = useCallback((postId: string, comment: any) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const exists = p.comments.some((c) => c.id === comment.id);
          if (exists) return p;
          return {
            ...p,
            commentsCount: p.commentsCount + 1,
            comments: [comment, ...p.comments],
          };
        }
        return p;
      })
    );
  }, []);

  const handleRealtimeNotification = useCallback((notif: NotificationItem) => {
    setNotifications((prev) => [notif, ...prev]);
  }, []);

  const { onlineUsers } = useRealtimeSync({
    currentUser,
    onPostCreated: handleRealtimePostCreated,
    onPostUpdated: handleRealtimePostUpdated,
    onPostDeleted: handleRealtimePostDeleted,
    onLikeUpdated: handleRealtimeLikeUpdated,
    onCommentCreated: handleRealtimeCommentCreated,
    onNotification: handleRealtimeNotification,
  });

  // Open Creator Modal
  const handleOpenCreateModal = (defaultType: PostMediaType = 'text') => {
    setCreateModalDefaultType(defaultType);
    setIsCreatePostModalOpen(true);
  };

  const handleLikePost = async (postId: string) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    const res = await api.posts.toggleLike(postId);
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            isLiked: res.isLiked,
            likesCount: res.likesCount,
          };
        }
        return p;
      })
    );
  };

  const handleDeletePost = async (postId: string) => {
    await api.posts.deletePost(postId);
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const handleEditPost = async (postId: string, content: string, title?: string) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    const res = await api.posts.updatePost(postId, { content, title });
    if (res.post) {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, content: res.post.content, title: res.post.title, imageUrl: res.post.imageUrl }
            : p
        )
      );
    }
  };

  const handleAddComment = async (postId: string, text: string) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    const res = await api.posts.addComment(postId, text);
    if (res.comment) {
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id === postId) {
            const exists = p.comments.some((c) => c.id === res.comment.id);
            return {
              ...p,
              commentsCount: exists ? p.commentsCount : p.commentsCount + 1,
              comments: exists ? p.comments : [res.comment, ...p.comments],
            };
          }
          return p;
        })
      );
    }
  };

  const handleFollowUser = async (userId: string) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    const res = await api.posts.toggleFollow(userId);
    setPosts((prev) =>
      prev.map((p) => {
        if (p.author.id === userId) {
          return {
            ...p,
            author: {
              ...p.author,
              isFollowing: res.isFollowing,
              followersCount: res.isFollowing
                ? p.author.followersCount + 1
                : Math.max(0, p.author.followersCount - 1),
            },
          };
        }
        return p;
      })
    );
  };

  const handleReportPost = async (postId: string, reason: string) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    const res = await api.posts.reportPost(postId, 'post', reason);
    if (res.report) {
      setReports((prev) => [res.report, ...prev]);
    }
  };

  const handleBlockUser = async (userId: string) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    await api.posts.blockUser(userId);
    setPosts((prev) => prev.filter((p) => p.author.id !== userId));
  };

  const handleLogout = async () => {
    await api.auth.logout();
    setCurrentUser(null);
    setIsProfileModalOpen(false);
  };

  // Video Actions
  const handleLikeVideo = (videoId: string) => {
    setVideos((prev) =>
      prev.map((v) => {
        if (v.id === videoId) {
          const isLiked = !v.isLiked;
          return {
            ...v,
            isLiked,
            likesCount: isLiked ? v.likesCount + 1 : Math.max(0, v.likesCount - 1),
          };
        }
        return v;
      })
    );
  };

  const handleSaveVideo = (videoId: string) => {
    setVideos((prev) =>
      prev.map((v) => (v.id === videoId ? { ...v, isSaved: !v.isSaved } : v))
    );
  };

  const handleUploadVideoProposal = (title: string, category: any, description: string) => {
    handleOpenCreateModal('short');
  };

  // Journal Actions
  const handleSaveJournalEntry = (entryData: Omit<JournalEntry, 'id'>, editId?: string) => {
    if (editId) {
      setJournalEntries((prev) =>
        prev.map((item) => (item.id === editId ? { ...item, ...entryData } : item))
      );
    } else {
      const newEntry: JournalEntry = {
        id: `journal-${Date.now()}`,
        ...entryData,
      };
      setJournalEntries((prev) => [newEntry, ...prev]);
    }
  };

  const handleDeleteJournalEntry = (id: string) => {
    setJournalEntries((prev) => prev.filter((item) => item.id !== id));
  };

  const handleToggleHabitDay = (habitId: string, dateStr: string) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== habitId) return h;
        const exists = h.completedDates.includes(dateStr);
        const newDates = exists
          ? h.completedDates.filter((d) => d !== dateStr)
          : [...h.completedDates, dateStr];
        return {
          ...h,
          completedDates: newDates,
          streakDays: exists ? Math.max(0, h.streakDays - 1) : h.streakDays + 1,
        };
      })
    );
  };

  const handleToggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isCompleted: !t.isCompleted } : t))
    );
  };

  const handleAddTodo = (text: string, category: string, dueDate?: string) => {
    const newTodo: TodoItem = {
      id: `todo-${Date.now()}`,
      text,
      category,
      dueDate,
      isCompleted: false,
    };
    setTodos((prev) => [newTodo, ...prev]);
  };

  const handleExportJournal = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(journalEntries, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `nexo_journal_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // AI Chat Actions
  const activeSession =
    sessions.find((s) => s.id === currentSessionId) || sessions[0];

  const handleNewSession = () => {
    const newId = `session-${Date.now()}`;
    const newSession: Session = {
      id: newId,
      title: 'Nova Conversa',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      model: selectedModel,
      messages: [],
    };
    setSessions((prev) => [newSession, ...prev]);
    setCurrentSessionId(newId);
  };

  const handleDeleteSession = (id: string) => {
    setSessions((prev) => {
      const filtered = prev.filter((s) => s.id !== id);
      if (filtered.length === 0) {
        return [
          {
            id: `session-${Date.now()}`,
            title: 'Nova Conversa',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            model: selectedModel,
            messages: [],
          },
        ];
      }
      return filtered;
    });
    if (currentSessionId === id) {
      setCurrentSessionId(sessions[0]?.id || '');
    }
  };

  const handleRenameSession = (id: string, newTitle: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title: newTitle } : s))
    );
  };

  const handleSendMessage = async (content: string, attachments: Attachment[] = []) => {
    if (!content.trim() && attachments.length === 0) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content,
      timestamp: Date.now(),
      model: selectedModel,
      attachments,
    };

    const updatedMessages = [...(activeSession?.messages || []), userMessage];

    setSessions((prev) =>
      prev.map((s) =>
        s.id === currentSessionId
          ? {
              ...s,
              title:
                s.title === 'Nova Conversa' && content.length > 0
                  ? content.slice(0, 28) + '...'
                  : s.title,
              updatedAt: Date.now(),
              messages: updatedMessages,
            }
          : s
      )
    );

    setIsStreaming(true);

    const assistantMessageId = `msg-assistant-${Date.now()}`;
    let accumulatedText = '';

    setSessions((prev) =>
      prev.map((s) =>
        s.id === currentSessionId
          ? {
              ...s,
              messages: [
                ...updatedMessages,
                {
                  id: assistantMessageId,
                  role: 'assistant',
                  content: '',
                  timestamp: Date.now(),
                  model: selectedModel,
                },
              ],
            }
          : s
      )
    );

    const history = (activeSession?.messages || []).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    await streamGeminiResponse(
      content,
      selectedModel,
      'Você é a Nexo AI, uma inteligência artificial corporativa de altíssimo nível. Responda em Português com clareza impecável.',
      history,
      attachments,
      {
        onChunk: (chunkText: string) => {
          accumulatedText += chunkText;
          setSessions((prev) =>
            prev.map((s) =>
              s.id === currentSessionId
                ? {
                    ...s,
                    messages: s.messages.map((m) =>
                      m.id === assistantMessageId
                        ? { ...m, content: accumulatedText }
                        : m
                    ),
                  }
                : s
            )
          );
        },
        onDone: (metrics: any) => {
          setIsStreaming(false);
          const codeArtifacts = extractCodeArtifacts(accumulatedText);
          setSessions((prev) =>
            prev.map((s) =>
              s.id === currentSessionId
                ? {
                    ...s,
                    messages: s.messages.map((m) =>
                      m.id === assistantMessageId
                        ? {
                            ...m,
                            latencyMs: metrics.durationMs,
                            tokenCount: metrics.tokenCount,
                            tokensPerSec: metrics.tokensPerSec,
                            codeArtifacts:
                              codeArtifacts.length > 0 ? codeArtifacts : undefined,
                          }
                        : m
                    ),
                  }
                : s
            )
          );
        },
        onError: (error: any) => {
          setIsStreaming(false);
          setSessions((prev) =>
            prev.map((s) =>
              s.id === currentSessionId
                ? {
                    ...s,
                    messages: s.messages.map((m) =>
                      m.id === assistantMessageId
                        ? {
                            ...m,
                            content: `**Erro de Conexão Neural**: ${error.message || 'Falha ao processar.'}`,
                          }
                        : m
                    ),
                  }
                : s
            )
          );
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#081425] light:bg-[#f8fafc] text-[#d8e3fb] light:text-[#0f172a] selection:bg-[#3b82f6]/30">
      {/* Top Navigation Bar */}
      <Navbar
        currentSection={currentSection}
        onNavigate={setCurrentSection}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        currentUser={currentUser}
        notifications={notifications}
        onMarkNotificationsRead={() =>
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
        }
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        onGlobalSearchSelect={(type, target) => {
          if (type === 'section') setCurrentSection(target);
        }}
      />

      {/* Main Layout Area: Sidebar + Content */}
      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        {/* Desktop Sidebar Navigation */}
        <SidebarNav
          currentSection={currentSection}
          onNavigate={setCurrentSection}
          currentUser={currentUser}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onOpenProfile={() => setIsProfileModalOpen(true)}
          onOpenCreateModal={handleOpenCreateModal}
        />

        {/* Dynamic Section Content View */}
        <main className="flex-1 flex flex-col overflow-x-hidden pb-16 lg:pb-6">
          {currentSection === 'home' && (
            <HomeDashboard
              onNavigate={setCurrentSection}
              currentUser={currentUser}
              onlineUsers={onlineUsers}
              recentPosts={posts}
              recommendedVideos={videos}
              recentNotes={journalEntries}
              aiTools={AI_TOOLS_CATALOG}
              onSelectTool={(tool) => {
                setSelectedToolId(tool.id);
                setCurrentSection('ai-tools');
              }}
              onOpenVideo={() => setCurrentSection('videos')}
              onOpenAuth={() => setIsAuthModalOpen(true)}
            />
          )}

          {currentSection === 'ai-chat' && (
            <AIChatView
              sessions={sessions}
              currentSessionId={currentSessionId}
              onSelectSession={setCurrentSessionId}
              onNewSession={handleNewSession}
              onDeleteSession={handleDeleteSession}
              onRenameSession={handleRenameSession}
              selectedModel={selectedModel}
              onSelectModel={setSelectedModel}
              onSendMessage={handleSendMessage}
              isStreaming={isStreaming}
              onStopStreaming={() => setIsStreaming(false)}
              onOpenArtifact={(art) => setSelectedArtifact(art)}
              onFeedback={() => {}}
            />
          )}

          {currentSection === 'community' && (
            <CommunityView
              posts={posts}
              currentUser={currentUser}
              onlineUsers={onlineUsers}
              onOpenCreateModal={handleOpenCreateModal}
              onLikePost={handleLikePost}
              onEditPost={handleEditPost}
              onDeletePost={handleDeletePost}
              onAddComment={handleAddComment}
              onFollowUser={handleFollowUser}
              onReportPost={handleReportPost}
              onBlockUser={handleBlockUser}
              onOpenAuth={() => setIsAuthModalOpen(true)}
            />
          )}

          {currentSection === 'videos' && (
            <VideosView
              posts={posts}
              currentUser={currentUser}
              onOpenCreateModal={handleOpenCreateModal}
              onOpenAuth={() => setIsAuthModalOpen(true)}
              onLikePost={handleLikePost}
              onFollowUser={handleFollowUser}
              onAddComment={handleAddComment}
            />
          )}

          {currentSection === 'creator-studio' && (
            <MyVideosView
              currentUser={currentUser}
              onOpenCreateModal={handleOpenCreateModal}
              onOpenAuth={() => setIsAuthModalOpen(true)}
            />
          )}

          {currentSection === 'journal' && (
            <JournalView
              entries={journalEntries}
              habits={habits}
              todos={todos}
              onSaveEntry={handleSaveJournalEntry}
              onDeleteEntry={handleDeleteJournalEntry}
              onToggleTodo={handleToggleTodo}
              onAddTodo={handleAddTodo}
              onToggleHabitDay={handleToggleHabitDay}
              onExportJournal={handleExportJournal}
            />
          )}

          {currentSection === 'ai-tools' && (
            <AIToolsView selectedToolId={selectedToolId} />
          )}

          {currentSection === 'admin' && (
            <AdminDashboardView
              users={allUsers}
              posts={posts}
              reports={reports}
              onDeletePost={handleDeletePost}
              onResolveReport={(id, status) =>
                setReports((prev) =>
                  prev.map((r) => (r.id === id ? { ...r, status } : r))
                )
              }
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav
        currentSection={currentSection}
        onNavigate={setCurrentSection}
      />

      {/* Advanced Creator Publishing Modal */}
      <CreatePostModal
        isOpen={isCreatePostModalOpen}
        onClose={() => setIsCreatePostModalOpen(false)}
        currentUser={currentUser}
        defaultMediaType={createModalDefaultType}
        onPostCreated={fetchPosts}
      />

      {/* Auth Modal (Login / Register / Forgot Password / Email Verification) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
        }}
      />

      {/* Profile & Privacy Settings Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUser={currentUser}
        onUpdateProfile={(updated) => {
          setCurrentUser((prev) => (prev ? { ...prev, ...updated } : null));
        }}
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Artifact Code & Live Preview Sandbox Modal */}
      <ArtifactCanvasModal
        artifact={selectedArtifact}
        onClose={() => setSelectedArtifact(null)}
      />
    </div>
  );
}
