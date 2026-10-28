import React, { useState } from 'react';
import { UserProfile } from '../../types/superapp';
import { X, Check, User, Shield, Globe, Lock, LogOut, Moon, Sun, Camera } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onLogout: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateProfile,
  onLogout,
  theme,
  onToggleTheme,
}) => {
  if (!isOpen || !currentUser) return null;

  const [name, setName] = useState(currentUser.name);
  const [username, setUsername] = useState(currentUser.username);
  const [bio, setBio] = useState(currentUser.bio);
  const [avatar, setAvatar] = useState(currentUser.avatar);
  const [language, setLanguage] = useState<'pt' | 'en'>('pt');
  const [isPrivateAccount, setIsPrivateAccount] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      name: name.trim(),
      username: username.trim(),
      bio: bio.trim(),
      avatar: avatar.trim(),
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl bg-[#081425] light:bg-white border border-[#2a3548] light:border-slate-200 p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 text-left">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#2a3548] light:border-slate-200">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-[#38bdf8]" />
            <h3 className="text-sm font-bold text-[#d8e3fb] light:text-slate-900">
              Perfil do Utilizador & Definições
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-[#909096] hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {savedSuccess && (
          <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>Perfil atualizado com sucesso!</span>
          </div>
        )}

        {/* Profile Card Header */}
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#111c2d] light:bg-slate-100 border border-[#2a3548] light:border-slate-300">
          <img
            src={avatar}
            alt={name}
            className="w-14 h-14 rounded-full object-cover border-2 border-[#3b82f6]"
          />
          <div>
            <div className="text-sm font-bold text-[#d8e3fb] light:text-slate-900">
              {currentUser.name}
            </div>
            <div className="text-xs text-[#909096]">@{currentUser.username}</div>
            <div className="flex items-center gap-3 text-xs text-[#adc6ff] mt-1 font-mono">
              <span>{currentUser.followersCount} seguidores</span>
              <span>·</span>
              <span>{currentUser.followingCount} seguindo</span>
            </div>
          </div>
        </div>

        {/* Edit Profile Form */}
        <form onSubmit={handleSave} className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#d8e3fb] light:text-slate-900 mb-1">
                Nome
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#111c2d] light:bg-slate-100 border border-[#2a3548] text-xs text-white light:text-slate-900 focus:outline-none focus:border-[#3b82f6]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#d8e3fb] light:text-slate-900 mb-1">
                Nome de Utilizador
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#111c2d] light:bg-slate-100 border border-[#2a3548] text-xs text-white light:text-slate-900 focus:outline-none focus:border-[#3b82f6]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#d8e3fb] light:text-slate-900 mb-1">
              Biografia
            </label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#111c2d] light:bg-slate-100 border border-[#2a3548] text-xs text-white light:text-slate-900 focus:outline-none focus:border-[#3b82f6] resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#d8e3fb] light:text-slate-900 mb-1">
              URL da Imagem de Avatar
            </label>
            <input
              type="url"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#111c2d] light:bg-slate-100 border border-[#2a3548] text-xs text-white light:text-slate-900 focus:outline-none focus:border-[#3b82f6]"
            />
          </div>

          {/* Preferences Section: Language, Theme, Privacy */}
          <div className="pt-2 border-t border-[#1f2a3c] light:border-slate-200 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#d8e3fb] light:text-slate-900 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-[#38bdf8]" />
                Idioma da Aplicação
              </span>
              <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[#111c2d] border border-[#2a3548]">
                <button
                  type="button"
                  onClick={() => setLanguage('pt')}
                  className={`px-2 py-1 rounded text-[11px] font-semibold ${
                    language === 'pt' ? 'bg-[#3b82f6] text-white' : 'text-[#909096]'
                  }`}
                >
                  PT
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`px-2 py-1 rounded text-[11px] font-semibold ${
                    language === 'en' ? 'bg-[#3b82f6] text-white' : 'text-[#909096]'
                  }`}
                >
                  EN
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#d8e3fb] light:text-slate-900 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-[#7c3aed]" />
                Perfil Privado (Ocultar da Comunidade)
              </span>
              <input
                type="checkbox"
                checked={isPrivateAccount}
                onChange={(e) => setIsPrivateAccount(e.target.checked)}
                className="w-4 h-4 accent-[#3b82f6] rounded cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-[#1f2a3c] light:border-slate-200">
            <button
              type="button"
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Terminar Sessão</span>
            </button>

            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-semibold text-white glow-btn-primary"
            >
              Guardar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
