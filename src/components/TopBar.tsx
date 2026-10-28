import React from 'react';
import { ViewTab } from '../types';
import { Plus, Command } from 'lucide-react';

interface TopBarProps {
  activeTab: ViewTab;
  setActiveTab: (tab: ViewTab) => void;
  onNewSession: () => void;
  onOpenCommandPalette: () => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  setActiveTab,
  onNewSession,
  onOpenCommandPalette,
  isSidebarOpen,
  setIsSidebarOpen,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full h-16 border-b border-[#2a3548]/60 bg-[#081425]/85 backdrop-blur-xl px-4 sm:px-6">
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single text element in display face) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setIsSidebarOpen((prev) => !prev)}
            aria-label="Alternar barra lateral"
            className="p-1.5 rounded-md text-[#c6c6cc] hover:text-[#d8e3fb] hover:bg-[#152031] transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('chat');
            }}
            className="text-xl font-bold tracking-tight text-[#d8e3fb] hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-2"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-[#7c3aed] to-[#3b82f6] shadow-[0_0_10px_#3b82f6]"></span>
            <span>Nexo AI</span>
          </a>
        </div>

        {/* Zone 2: 4-5 clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#c6c6cc]">
          <button
            onClick={() => setActiveTab('chat')}
            className={`transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
              activeTab === 'chat'
                ? 'text-[#d8e3fb] font-semibold border-b-2 border-[#3b82f6]'
                : 'hover:text-[#d8e3fb]'
            }`}
          >
            Chat & Studio
          </button>
          <button
            onClick={() => setActiveTab('agents')}
            className={`transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
              activeTab === 'agents'
                ? 'text-[#d8e3fb] font-semibold border-b-2 border-[#3b82f6]'
                : 'hover:text-[#d8e3fb]'
            }`}
          >
            Multi-Agentes
          </button>
          <button
            onClick={() => setActiveTab('prompt-lab')}
            className={`transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
              activeTab === 'prompt-lab'
                ? 'text-[#d8e3fb] font-semibold border-b-2 border-[#3b82f6]'
                : 'hover:text-[#d8e3fb]'
            }`}
          >
            Prompt Lab
          </button>
          <button
            onClick={() => setActiveTab('telemetry')}
            className={`transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
              activeTab === 'telemetry'
                ? 'text-[#d8e3fb] font-semibold border-b-2 border-[#3b82f6]'
                : 'hover:text-[#d8e3fb]'
            }`}
          >
            Telemetria & Cache
          </button>
          <button
            onClick={() => setActiveTab('artifacts')}
            className={`transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
              activeTab === 'artifacts'
                ? 'text-[#d8e3fb] font-semibold border-b-2 border-[#3b82f6]'
                : 'hover:text-[#d8e3fb]'
            }`}
          >
            Artefatos & Canvas
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenCommandPalette}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-[#c6c6cc] hover:text-[#d8e3fb] bg-[#111c2d] hover:bg-[#152031] border border-[#2a3548] rounded-md transition-colors"
            title="Abrir Command Palette (Cmd+K)"
          >
            <Command className="w-3.5 h-3.5" />
            <span className="font-mono text-[11px]">⌘K</span>
          </button>

          <button
            onClick={onNewSession}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white glow-btn-primary rounded-md whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Sessão</span>
          </button>
        </div>
      </div>
    </header>
  );
};
