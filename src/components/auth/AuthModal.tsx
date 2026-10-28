import React, { useState } from 'react';
import { X, Lock, Mail, User, Eye, EyeOff, ShieldCheck, CheckCircle2, AlertCircle, KeyRound, Sparkles, UserCheck } from 'lucide-react';
import { UserProfile } from '../../types/superapp';
import { api } from '../../services/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'verify'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationToken, setVerificationToken] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Quick Test Account Handler (For Requirement 7 validation)
  const handleQuickTestAccount = async (accountType: 'alice' | 'bruno') => {
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    const testUsers = {
      alice: {
        name: 'Alice Santos (Teste A)',
        email: 'alice.teste@nexo.ai',
        password: 'Password123!',
      },
      bruno: {
        name: 'Bruno Costa (Teste B)',
        email: 'bruno.teste@nexo.ai',
        password: 'Password123!',
      },
    };

    const target = testUsers[accountType];

    try {
      // First try to login
      try {
        const res = await api.auth.login(target.email, target.password);
        setSuccessMessage(`Sessão iniciada como ${target.name}!`);
        setTimeout(() => {
          onLoginSuccess(res.user);
          onClose();
        }, 300);
        return;
      } catch (loginErr) {
        // If user doesn't exist, register them
        const regRes = await api.auth.register(target.name, target.email, target.password);
        // Automatically verify email for quick test account
        if (regRes.verificationToken) {
          await api.auth.verifyEmail(target.email, regRes.verificationToken);
        }
        setSuccessMessage(`Conta de teste ${target.name} registada e pronta!`);
        setTimeout(() => {
          onLoginSuccess(regRes.user);
          onClose();
        }, 300);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao processar conta de teste.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (mode === 'verify') {
      if (!verificationToken.trim()) {
        setErrorMessage('Por favor insira o token de verificação.');
        return;
      }
      setIsLoading(true);
      try {
        const res = await api.auth.verifyEmail(email.trim() || undefined, verificationToken.trim());
        setSuccessMessage(res.message || 'E-mail confirmado com sucesso! Pode agora iniciar sessão.');
        setMode('login');
      } catch (err: any) {
        setErrorMessage(err.message || 'Código de verificação inválido.');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (!email || !email.includes('@')) {
      setErrorMessage('Por favor insira um e-mail válido.');
      return;
    }

    if (mode === 'forgot') {
      setIsLoading(true);
      try {
        const res = await api.auth.recoverPassword(email.trim());
        setSuccessMessage(
          res.message +
            (res.resetToken
              ? ` [Simulação de Envio: Token de redefinição criado no servidor: ${res.resetToken}]`
              : '')
        );
      } catch (err: any) {
        setErrorMessage(err.message || 'Falha ao solicitar recuperação.');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (password.length < 6) {
      setErrorMessage('A palavra-passe deve conter pelo menos 6 caracteres.');
      return;
    }

    setIsLoading(true);
    try {
      if (mode === 'register') {
        if (!name.trim()) {
          setErrorMessage('Por favor insira o seu nome.');
          setIsLoading(false);
          return;
        }

        const res = await api.auth.register(name.trim(), email.trim(), password);
        setSuccessMessage(
          `Conta criada com sucesso na base de dados! Token de ativação: ${res.verificationToken}`
        );
        setTimeout(() => {
          onLoginSuccess(res.user);
          onClose();
        }, 800);
      } else {
        // Login
        const res = await api.auth.login(email.trim(), password);
        setSuccessMessage('Sessão iniciada com sucesso!');
        setTimeout(() => {
          onLoginSuccess(res.user);
          onClose();
        }, 400);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Ocorreu um erro na autenticação.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-[#081425] light:bg-white border border-[#2a3548] light:border-slate-200 p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-[#2a3548] light:border-slate-200">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#38bdf8]" />
            <h3 className="text-sm font-bold text-[#d8e3fb] light:text-slate-900">
              {mode === 'login' && 'Iniciar Sessão Real'}
              {mode === 'register' && 'Registo de Nova Conta Real'}
              {mode === 'forgot' && 'Recuperação de Palavra-passe'}
              {mode === 'verify' && 'Confirmar E-mail Real'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-[#909096] hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Testing Accounts for Requirement 7 verification */}
        <div className="p-3 rounded-2xl bg-[#0b172a] light:bg-slate-50 border border-[#2a3548] light:border-slate-300 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-[#adc6ff]">
            <span className="font-semibold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#38bdf8]" />
              Contas de Teste Controladas (Requisito 7)
            </span>
            <span className="text-[10px] text-[#909096]">Alternância Rápida</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleQuickTestAccount('alice')}
              className="px-2.5 py-1.5 rounded-xl bg-[#111c2d] hover:bg-[#1a2942] border border-[#3b82f6]/40 text-[11px] text-white flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <UserCheck className="w-3.5 h-3.5 text-[#38bdf8]" />
              <span>Conta A (Alice)</span>
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleQuickTestAccount('bruno')}
              className="px-2.5 py-1.5 rounded-xl bg-[#111c2d] hover:bg-[#1a2942] border border-[#7c3aed]/40 text-[11px] text-white flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <UserCheck className="w-3.5 h-3.5 text-[#a855f7]" />
              <span>Conta B (Bruno)</span>
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-xs text-red-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-xs text-emerald-300 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-[#d8e3fb] light:text-slate-900 mb-1">
                Nome Completo
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3 text-[#909096]" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome real..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#111c2d] light:bg-slate-100 border border-[#2a3548] text-xs text-white light:text-slate-900 focus:outline-none focus:border-[#3b82f6]"
                />
              </div>
            </div>
          )}

          {mode !== 'verify' && (
            <div>
              <label className="block text-xs font-semibold text-[#d8e3fb] light:text-slate-900 mb-1">
                Endereço de E-mail
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-[#909096]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@email.com"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#111c2d] light:bg-slate-100 border border-[#2a3548] text-xs text-white light:text-slate-900 focus:outline-none focus:border-[#3b82f6]"
                />
              </div>
            </div>
          )}

          {mode === 'verify' && (
            <div>
              <label className="block text-xs font-semibold text-[#d8e3fb] light:text-slate-900 mb-1">
                Código ou Token de Verificação
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3 top-3 text-[#909096]" />
                <input
                  type="text"
                  required
                  value={verificationToken}
                  onChange={(e) => setVerificationToken(e.target.value)}
                  placeholder="Insira o token recebido no registo..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#111c2d] light:bg-slate-100 border border-[#2a3548] text-xs text-white light:text-slate-900 focus:outline-none focus:border-[#3b82f6]"
                />
              </div>
            </div>
          )}

          {(mode === 'login' || mode === 'register') && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-[#d8e3fb] light:text-slate-900">
                  Palavra-passe
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setErrorMessage('');
                      setSuccessMessage('');
                    }}
                    className="text-[11px] text-[#38bdf8] hover:underline"
                  >
                    Esqueceu-se?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-[#909096]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres..."
                  className="w-full pl-9 pr-9 py-2 rounded-xl bg-[#111c2d] light:bg-slate-100 border border-[#2a3548] text-xs text-white light:text-slate-900 focus:outline-none focus:border-[#3b82f6]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-[#909096] hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-xl text-xs font-semibold text-white glow-btn-primary mt-2 disabled:opacity-50"
          >
            {isLoading
              ? 'A comunicar com o servidor...'
              : mode === 'login'
              ? 'Iniciar Sessão'
              : mode === 'register'
              ? 'Criar Conta Real'
              : mode === 'verify'
              ? 'Validar Token'
              : 'Enviar Instruções de Recuperação'}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-[#1f2a3c] light:border-slate-200 text-xs text-[#909096] space-y-1.5">
          {mode === 'login' && (
            <>
              <p>
                Ainda não tem conta?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setErrorMessage('');
                    setSuccessMessage('');
                  }}
                  className="text-[#38bdf8] font-semibold hover:underline"
                >
                  Registe-se agora
                </button>
              </p>
              <p>
                Precisa de confirmar e-mail?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('verify');
                    setErrorMessage('');
                    setSuccessMessage('');
                  }}
                  className="text-[#a855f7] font-semibold hover:underline"
                >
                  Introduzir token de confirmação
                </button>
              </p>
            </>
          )}

          {mode === 'register' && (
            <p>
              Já possui conta registada?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className="text-[#38bdf8] font-semibold hover:underline"
              >
                Iniciar sessão
              </button>
            </p>
          )}

          {(mode === 'forgot' || mode === 'verify') && (
            <p>
              Voltar ao{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className="text-[#38bdf8] font-semibold hover:underline"
              >
                Início de sessão
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
