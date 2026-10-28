import React, { useState, useRef, useEffect } from 'react';
import { MainSection, NotificationItem, UserProfile } from '../../types/superapp';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import {
  Search,
  Sun,
  Moon,
  Download,
  Bell,
  Check,
  X,
  Menu,
  Shield,
  MessageSquare,
  Video,
  Users,
  BookOpen,
  Wrench,
} from 'lucide-react';

interface NavbarProps {
  currentSection: MainSection;
  onNavigate: (section: MainSection) => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  currentUser: UserProfile | null;
  notifications: NotificationItem[];
  onMarkNotificationsRead: () => void;
  onOpenProfile: () => void;
  onOpenAuth: () => void;
  onToggleSidebar: () => void;
  onGlobalSearchSelect: (type: 'section' | 'item', target: any) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentSection,
  onNavigate,
  theme,
  onToggleTheme,
  currentUser,
  notifications,
  onMarkNotificationsRead,
  onOpenProfile,
  onOpenAuth,
  onToggleSidebar,
  onGlobalSearchSelect,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const searchResults = searchQuery.trim()
    ? [
        {
          title: 'Assistente de Inteligência Artificial',
          desc: 'Chat e resolução de problemas técnicos',
          section: 'ai-chat' as MainSection,
          icon: <MessageSquare className="w-4 h-4 text-[#38bdf8]" />,
        },
        {
          title: 'Comunidade Social',
          desc: 'Publicações, ideias e discussões',
          section: 'community' as MainSection,
          icon: <Users className="w-4 h-4 text-[#7c3aed]" />,
        },
        {
          title: 'Vídeos Verticais Curtos',
          desc: 'Conteúdos curtos de tecnologia e tutoriais',
          section: 'videos' as MainSection,
          icon: <Video className="w-4 h-4 text-[#3b82f6]" />,
        },
        {
          title: 'Diário Pessoal Inteligente',
          desc: 'Anotações privadas, hábitos e tarefas',
          section: 'journal' as MainSection,
          icon: <BookOpen className="w-4 h-4 text-emerald-400" />,
        },
        {
          title: 'Suíte de Ferramentas IA',
          desc: 'Tradutor, Resumidor, Gerador de Prompts',
          section: 'ai-tools' as MainSection,
          icon: <Wrench className="w-4 h-4 text-[#adc6ff]" />,
        },
      ].filter((item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.desc.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <>
      <header className="sticky top-0 z-40 w-full h-16 border-b border-[#2a3548]/60 bg-[#081425]/90 dark:bg-[#081425]/90 light:bg-white/90 backdrop-blur-xl px-3 sm:px-6 transition-colors">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between gap-3 sm:gap-6">
          {/* Brand & Mobile Hamburger */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onToggleSidebar}
              className="p-1.5 rounded-lg text-[#c6c6cc] hover:text-[#d8e3fb] hover:bg-[#152031] lg:hidden transition-colors"
              aria-label="Abrir menu de navegação"
            >
              <Menu className="w-5 h-5" />
            </button>

            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#7c3aed] to-[#3b82f6] p-[1.5px] shadow-[0_0_15px_rgba(59,130,246,0.4)] group-hover:shadow-[0_0_20px_rgba(59,130,246,0.6)] transition-all">
                <div className="w-full h-full bg-[#081425] rounded-[9.5px] flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-[#38bdf8] shadow-[0_0_6px_#38bdf8]"></span>
                </div>
              </div>

              <div>
                <span className="text-base sm:text-lg font-bold tracking-tight text-[#d8e3fb] light:text-slate-900 leading-none block">
                  Nexo AI
                </span>
                <span className="text-[10px] text-[#909096] uppercase tracking-wider block font-medium">
                  Superapp
                </span>
              </div>
            </button>
          </div>

          {/* Global Search Bar */}
          <div className="flex-1 max-w-md hidden md:block relative" ref={searchRef}>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#909096]" />
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setIsSearchOpen(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                placeholder="Pesquisar em todo o Nexo AI..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#111c2d] light:bg-slate-100 border border-[#2a3548] light:border-slate-300 text-xs text-[#d8e3fb] light:text-slate-900 placeholder-[#909096] focus:outline-none focus:border-[#3b82f6] transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-[#909096] hover:text-[#d8e3fb]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick search dropdown */}
            {isSearchOpen && searchResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 rounded-xl bg-[#081425] light:bg-white border border-[#2a3548] light:border-slate-200 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-2 py-1 text-[10px] uppercase font-semibold text-[#909096]">
                  Resultados Rápidos
                </div>
                {searchResults.map((res, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      onNavigate(res.section);
                      setIsSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="w-full text-left flex items-center gap-2.5 p-2 rounded-lg hover:bg-[#152031] light:hover:bg-slate-100 text-xs text-[#d8e3fb] light:text-slate-800 transition-colors"
                  >
                    <div className="p-1 rounded bg-[#111c2d] light:bg-slate-200">
                      {res.icon}
                    </div>
                    <div>
                      <div className="font-semibold">{res.title}</div>
                      <div className="text-[10px] text-[#909096]">{res.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Action Icons: PWA Install, Theme, Notifications, Profile */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* PWA Install Button (Chromium / Android) */}
            {isInstallable && !isInstalled && (
              <button
                onClick={install}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#3b82f6]/20 hover:bg-[#3b82f6]/30 border border-[#3b82f6]/50 text-xs font-semibold text-[#38bdf8] transition-all"
                title="Instalar Nexo AI no dispositivo"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Instalar App</span>
              </button>
            )}

            {/* iOS Safari PWA Button */}
            {isIOS && !isInstalled && (
              <button
                onClick={() => setShowIOSGuide(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#2a3548] text-xs text-[#c6c6cc] hover:text-[#d8e3fb] transition-colors"
                title="Como instalar no iPhone ou iPad"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Instalar</span>
              </button>
            )}

            {/* Theme Toggle (Dark vs Light) */}
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-lg text-[#c6c6cc] hover:text-[#d8e3fb] hover:bg-[#152031] light:hover:bg-slate-100 transition-colors"
              title={theme === 'dark' ? 'Mudar para Tema Claro' : 'Mudar para Tema Escuro'}
              aria-label="Alternar tema"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>

            {/* Notifications Popover */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifications((prev) => !prev)}
                className="relative p-2 rounded-lg text-[#c6c6cc] hover:text-[#d8e3fb] hover:bg-[#152031] light:hover:bg-slate-100 transition-colors"
                title="Notificações"
                aria-label="Abrir notificações"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_6px_#ef4444]"></span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl bg-[#081425] light:bg-white border border-[#2a3548] light:border-slate-200 shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#2a3548] light:border-slate-200">
                    <span className="text-xs font-bold text-[#d8e3fb] light:text-slate-900">
                      Notificações
                    </span>
                    {unreadCount > 0 && (
                      <button
                        onClick={onMarkNotificationsRead}
                        className="text-[11px] text-[#38bdf8] hover:underline"
                      >
                        Marcar como lidas
                      </button>
                    )}
                  </div>

                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {notifications.length === 0 ? (
                      <div className="text-center py-6 text-xs text-[#909096]">
                        Nenhuma notificação por enquanto.
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-2.5 rounded-xl text-xs transition-colors ${
                            notif.read
                              ? 'bg-transparent text-[#909096]'
                              : 'bg-[#111c2d] light:bg-slate-100 text-[#d8e3fb] light:text-slate-800'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-1 mb-1">
                            <span className="font-semibold">{notif.title}</span>
                            <span className="text-[10px] text-[#909096] shrink-0">
                              {notif.time}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#c6c6cc] light:text-slate-600 leading-relaxed">
                            {notif.description}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar Trigger or Login Button */}
            {currentUser ? (
              <button
                onClick={onOpenProfile}
                className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-[#3b82f6] transition-all ml-1"
                title="Meu Perfil & Configurações"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full object-cover border border-[#3b82f6]/50"
                />
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white glow-btn-primary ml-1"
              >
                Entrar
              </button>
            )}
          </div>
        </div>
      </header>

      {/* iOS Installation Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-[#081425] border border-[#2a3548] p-5 shadow-2xl text-left">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-[#d8e3fb]">Instalar no iPhone / iPad</h3>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="p-1 text-[#909096] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-[#c6c6cc] leading-relaxed mb-4">
              Para instalar o <strong>Nexo AI</strong> como um aplicativo nativo no iOS:
              <br /><br />
              1. Toque no botão <strong>Partilhar (Share)</strong> na barra do Safari.<br />
              2. Role para baixo e selecione <strong>Adicionar ao Ecrã Principal</strong>.
            </p>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2 rounded-xl text-xs font-semibold text-white glow-btn-primary"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
};
