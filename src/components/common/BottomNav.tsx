import React from 'react';
import { MainSection } from '../../types/superapp';
import { Home, MessageSquare, Users, Video, BookOpen, Wrench } from 'lucide-react';

interface BottomNavProps {
  currentSection: MainSection;
  onNavigate: (section: MainSection) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentSection, onNavigate }) => {
  const items = [
    {
      id: 'home' as MainSection,
      label: 'Início',
      icon: <Home className="w-5 h-5" />,
    },
    {
      id: 'community' as MainSection,
      label: 'Social',
      icon: <Users className="w-5 h-5" />,
    },
    {
      id: 'ai-chat' as MainSection,
      label: 'Nexo IA',
      icon: <MessageSquare className="w-5 h-5" />,
      isPrimary: true,
    },
    {
      id: 'videos' as MainSection,
      label: 'Vídeos',
      icon: <Video className="w-5 h-5" />,
    },
    {
      id: 'journal' as MainSection,
      label: 'Diário',
      icon: <BookOpen className="w-5 h-5" />,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-[#081425]/95 light:bg-white/95 backdrop-blur-xl border-t border-[#2a3548]/60 light:border-slate-200 px-2 py-1.5 flex items-center justify-around safe-area-bottom">
      {items.map((item) => {
        const isActive = currentSection === item.id;

        if (item.isPrimary) {
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="relative -top-3 flex flex-col items-center group"
            >
              <div className="w-12 h-12 rounded-full glow-btn-primary flex items-center justify-center text-white shadow-lg transition-transform active:scale-95">
                {item.icon}
              </div>
              <span className="text-[10px] font-bold text-[#38bdf8] mt-0.5">
                {item.label}
              </span>
            </button>
          );
        }

        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex flex-col items-center py-1 px-2.5 rounded-lg transition-colors ${
              isActive
                ? 'text-[#38bdf8] font-bold'
                : 'text-[#909096] hover:text-[#d8e3fb] light:hover:text-slate-900'
            }`}
          >
            {item.icon}
            <span className="text-[10px] mt-0.5">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
