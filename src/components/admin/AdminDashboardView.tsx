import React, { useState } from 'react';
import { UserProfile, SocialPost, ReportItem } from '../../types/superapp';
import {
  ShieldAlert,
  Users,
  Flag,
  Trash2,
  CheckCircle,
  FileText,
  Activity,
  Layers,
  Check,
} from 'lucide-react';

interface AdminDashboardViewProps {
  users: UserProfile[];
  posts: SocialPost[];
  reports: ReportItem[];
  onDeletePost: (postId: string) => void;
  onResolveReport: (reportId: string, status: 'resolved' | 'dismissed') => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  users,
  posts,
  reports,
  onDeletePost,
  onResolveReport,
}) => {
  const [activeAdminTab, setActiveAdminTab] = useState<'reports' | 'users' | 'posts' | 'audit'>('reports');
  const [feedback, setFeedback] = useState<string | null>(null);

  const [categories, setCategories] = useState([
    'Tecnologia',
    'Inteligência Artificial',
    'Tutoriais',
    'Criatividade',
    'Produtividade',
  ]);
  const [newCat, setNewCat] = useState('');

  const [auditLogs, setAuditLogs] = useState([
    { id: '1', action: 'Login do Administrador', user: 'Pedro Dias', time: 'Há 15 min' },
    { id: '2', action: 'Moderação de denúncia #rep-2 resolvida', user: 'Sistema', time: 'Ontem' },
  ]);

  const triggerFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCat.trim()) return;
    setCategories((prev) => [...prev, newCat.trim()]);
    setAuditLogs((prev) => [
      { id: String(Date.now()), action: `Nova categoria criada: ${newCat.trim()}`, user: 'Pedro Dias', time: 'Agora' },
      ...prev,
    ]);
    setNewCat('');
    triggerFeedback('Categoria adicionada com sucesso!');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Toast */}
      {feedback && (
        <div className="fixed top-20 right-4 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold shadow-xl">
          <Check className="w-4 h-4" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2a3548] pb-5">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-1">
            <ShieldAlert className="w-4 h-4" />
            <span>Área Restrita de Moderação</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#d8e3fb] light:text-slate-900 tracking-tight">
            Painel de Administração do Nexo AI
          </h1>
          <p className="text-xs text-[#909096] mt-0.5">
            Gestão de utilizadores, moderação de conteúdos, denúncias e categorias.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[#111c2d] light:bg-slate-100 border border-[#2a3548]">
          <button
            onClick={() => setActiveAdminTab('reports')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeAdminTab === 'reports' ? 'bg-[#3b82f6] text-white' : 'text-[#909096]'
            }`}
          >
            Denúncias ({reports.filter((r) => r.status === 'pending').length})
          </button>
          <button
            onClick={() => setActiveAdminTab('users')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeAdminTab === 'users' ? 'bg-[#3b82f6] text-white' : 'text-[#909096]'
            }`}
          >
            Utilizadores ({users.length})
          </button>
          <button
            onClick={() => setActiveAdminTab('posts')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeAdminTab === 'posts' ? 'bg-[#3b82f6] text-white' : 'text-[#909096]'
            }`}
          >
            Conteúdos ({posts.length})
          </button>
          <button
            onClick={() => setActiveAdminTab('audit')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeAdminTab === 'audit' ? 'bg-[#3b82f6] text-white' : 'text-[#909096]'
            }`}
          >
            Auditoria & Categorias
          </button>
        </div>
      </div>

      {/* TAB 1: REPORTS */}
      {activeAdminTab === 'reports' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-[#0b172a] light:bg-white border border-[#2a3548]">
            <h2 className="text-sm font-bold text-[#d8e3fb] light:text-slate-900 mb-1">
              Fila de Moderação de Denúncias
            </h2>
            <p className="text-xs text-[#909096]">
              Avalie conteúdos sinalizados pelos utilizadores e tome ações de remoção ou encerramento.
            </p>
          </div>

          <div className="rounded-2xl bg-[#0b172a] light:bg-white border border-[#2a3548] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#2a3548] bg-[#081425] text-[#909096]">
                    <th className="p-3.5">ID / Alvo</th>
                    <th className="p-3.5">Tipo</th>
                    <th className="p-3.5">Motivo</th>
                    <th className="p-3.5">Data</th>
                    <th className="p-3.5">Estado</th>
                    <th className="p-3.5 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((rep) => (
                    <tr key={rep.id} className="border-b border-[#1f2a3c] hover:bg-[#111c2d]/50">
                      <td className="p-3.5 font-mono text-[#d8e3fb] font-semibold">{rep.targetId}</td>
                      <td className="p-3.5 font-mono uppercase text-[10px] text-[#adc6ff]">{rep.targetType}</td>
                      <td className="p-3.5 text-[#c6c6cc]">{rep.reason}</td>
                      <td className="p-3.5 text-[#909096] font-mono">{rep.createdAt}</td>
                      <td className="p-3.5">
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                            rep.status === 'pending'
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-emerald-500/20 text-emerald-400'
                          }`}
                        >
                          {rep.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-1">
                        {rep.status === 'pending' && (
                          <>
                            <button
                              onClick={() => {
                                onResolveReport(rep.id, 'resolved');
                                triggerFeedback('Denúncia resolvida e ação aplicada.');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600/30 text-emerald-400 hover:bg-emerald-600/50"
                            >
                              Resolver
                            </button>
                            <button
                              onClick={() => {
                                onResolveReport(rep.id, 'dismissed');
                                triggerFeedback('Denúncia descartada.');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-[#152031] text-[#909096] hover:text-white"
                            >
                              Descartar
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USERS */}
      {activeAdminTab === 'users' && (
        <div className="rounded-2xl bg-[#0b172a] light:bg-white border border-[#2a3548] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#2a3548] bg-[#081425] text-[#909096]">
                  <th className="p-3.5">Utilizador</th>
                  <th className="p-3.5">E-mail</th>
                  <th className="p-3.5">Função</th>
                  <th className="p-3.5">Seguidores</th>
                  <th className="p-3.5">Membro Desde</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-[#1f2a3c] hover:bg-[#111c2d]/50">
                    <td className="p-3.5 flex items-center gap-2.5">
                      <img src={u.avatar} alt={u.name} className="w-7 h-7 rounded-full object-cover" />
                      <div>
                        <div className="font-semibold text-[#d8e3fb] light:text-slate-900">{u.name}</div>
                        <div className="text-[10px] text-[#909096]">@{u.username}</div>
                      </div>
                    </td>
                    <td className="p-3.5 font-mono text-[#adc6ff]">{u.email}</td>
                    <td className="p-3.5 font-mono uppercase text-[10px] text-[#38bdf8]">{u.role}</td>
                    <td className="p-3.5 font-mono">{u.followersCount}</td>
                    <td className="p-3.5 text-[#909096]">{u.joinedDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: POSTS MODERATION */}
      {activeAdminTab === 'posts' && (
        <div className="space-y-3">
          {posts.map((post) => (
            <div
              key={post.id}
              className="p-4 rounded-2xl bg-[#0b172a] light:bg-white border border-[#2a3548] flex items-start justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-bold text-[#d8e3fb]">{post.author.name}</span>
                  <span className="text-[#909096]">@{post.author.username}</span>
                  <span className="text-[#909096]">· {post.createdAt}</span>
                </div>
                <p className="text-xs text-[#c6c6cc]">{post.content}</p>
              </div>

              <button
                onClick={() => {
                  onDeletePost(post.id);
                  triggerFeedback('Publicação removida com sucesso!');
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 text-xs font-semibold shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remover</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: AUDIT LOGS & CATEGORIES */}
      {activeAdminTab === 'audit' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Categories Management */}
          <div className="p-5 rounded-2xl bg-[#0b172a] light:bg-white border border-[#2a3548] space-y-4">
            <h3 className="text-sm font-bold text-[#d8e3fb] light:text-slate-900">
              Gestão de Categorias da Plataforma
            </h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((c, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full bg-[#111c2d] light:bg-slate-100 border border-[#2a3548] text-xs text-[#d8e3fb]"
                >
                  {c}
                </span>
              ))}
            </div>

            <form onSubmit={handleAddCategory} className="flex gap-2 pt-2">
              <input
                type="text"
                value={newCat}
                onChange={(e) => setNewCat(e.target.value)}
                placeholder="Nova categoria..."
                className="flex-1 px-3 py-1.5 rounded-xl bg-[#111c2d] border border-[#2a3548] text-xs text-white focus:outline-none"
              />
              <button
                type="submit"
                disabled={!newCat.trim()}
                className="px-4 py-1.5 rounded-xl text-xs font-semibold text-white glow-btn-primary disabled:opacity-40"
              >
                Adicionar
              </button>
            </form>
          </div>

          {/* Audit Logs */}
          <div className="p-5 rounded-2xl bg-[#0b172a] light:bg-white border border-[#2a3548] space-y-4">
            <h3 className="text-sm font-bold text-[#d8e3fb] light:text-slate-900">
              Registo de Ações Administrativas (Audit Log)
            </h3>
            <div className="space-y-2">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 rounded-xl bg-[#111c2d] border border-[#2a3548] text-xs flex items-center justify-between"
                >
                  <span className="text-[#d8e3fb] font-medium">{log.action}</span>
                  <span className="text-[10px] text-[#909096] font-mono">{log.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
