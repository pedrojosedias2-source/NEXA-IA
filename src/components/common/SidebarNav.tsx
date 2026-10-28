import React from 'react';
import { MainSection, UserProfile } from '../../types/superapp';
import {
  Home,
  MessageSquare,
  Users,
  Video,
  Film,
  BookOpen,
  Wrench,
  ShieldAlert,
  Settings,
  Plus,
  X,
} from 'lucide-react';

interface SidebarNavProps {
  currentSection: MainSection;
  onNavigate: (section: MainSection) => void;
  currentUser: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenAuth: () => void;
  onOpenProfile: () => void;
  onOpenCreateModal?: () => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  currentSection,
  onNavigate,
  currentUser,
  isOpen,
  onClose,
  onOpenAuth,
  onOpenProfile,
  onOpenCreateModal,
}) => {
  const navItems = [
    {
      id: 'home' as MainSection,
      label: 'Painel Inicial',
      icon: <Home className="w-4 h-4" />,
    },
    {
      id: 'ai-chat' as MainSection,
      label: 'Assistente IA',
      icon: <MessageSquare className="w-4 h-4" />,
    },
    {
      id: 'community' as MainSection,
      label: 'Comunidade Social',
      icon: <Users className="w-4 h-4" />,
    },
    {
      id: 'videos' as MainSection,
      label: 'Vídeos Curtos',
      icon: <Video className="w-4 h-4" />,
    },
    {
      id: 'creator-studio' as MainSection,
      label: 'Estúdio de Criação',
      icon: <Film className="w-4 h-4" />,
    },
    {
      id: 'journal' as MainSection,
      label: 'Diário Inteligente',
      icon: <BookOpen className="w-4 h-4" />,
    },
    {
      id: 'ai-tools' as MainSection,
      label: 'Ferramentas de IA',
      icon: <Wrench className="w-4 h-4" />,
    },
  ];

  if (currentUser?.role === 'admin') {
    navItems.push({
      id: 'admin' as MainSection,
      label: 'Painel Admin',
      icon: <ShieldAlert className="w-4 h-4 text-amber-400" />,
    });
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#081425] light:bg-white border-r border-[#2a3548] light:border-slate-200 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-10 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile Header with close button */}
        <div className="p-4 border-b border-[#2a3548]/60 light:border-slate-200 flex items-center justify-between lg:hidden">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]"></span>
            <span className="text-sm font-bold text-[#d8e3fb] light:text-slate-900">
              Nexo AI
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#909096] hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Create Publication Button in Sidebar */}
        <div className="px-3 pt-4 pb-2">
          <button
            onClick={() => {
              if (!currentUser) onOpenAuth();
              else onOpenCreateModal?.();
              onClose();
            }}
            className="w-full py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-[#38bdf8] to-[#6366f1] text-white text-xs font-semibold hover:opacity-95 shadow-md shadow-cyan-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Criar Publicação</span>
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          <div className="px-3 mb-2 text-[10px] uppercase font-bold text-[#909096] tracking-wider">
            Navegação
          </div>

          {navItems.map((item) => {
            const isActive = currentSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-[#152031] light:bg-slate-100 text-[#d8e3fb] light:text-slate-900 border border-[#3b82f6]/40 shadow-sm'
                    : 'text-[#c6c6cc] light:text-slate-600 hover:bg-[#111c2d] light:hover:bg-slate-50 hover:text-white light:hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`${
                      isActive
                        ? 'text-[#38bdf8]'
                        : 'text-[#909096] group-hover:text-[#38bdf8]'
                    } transition-colors`}
                  >
                    {item.icon}
                  </div>
                  <span>{item.label}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* User Profile / Auth Footer */}
        <div className="p-3 border-t border-[#2a3548]/60 light:border-slate-200 bg-[#040e1f]/60 light:bg-slate-50">
          {currentUser ? (
            <div
              onClick={onOpenProfile}
              className="flex items-center justify-between p-2 rounded-xl hover:bg-[#152031] light:hover:bg-slate-100 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover border border-[#3b82f6]/50 shrink-0"
                />
                <div className="truncate">
                  <div className="text-xs font-semibold text-[#d8e3fb] light:text-slate-900 truncate">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-[#909096] truncate">
                    @{currentUser.username}
                  </div>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenProfile();
                }}
                className="p-1.5 text-[#909096] hover:text-[#d8e3fb] light:hover:text-slate-900"
                title="Configurações"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-[#3b82f6] to-[#7c3aed] text-white text-xs font-semibold hover:opacity-90 transition-opacity"
            >
              Iniciar Sessão / Registar
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
