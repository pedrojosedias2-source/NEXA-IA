import React, { useState } from 'react';
import { JournalEntry, HabitItem, TodoItem } from '../../types/superapp';
import {
  BookOpen,
  Calendar as CalendarIcon,
  Plus,
  Trash2,
  Edit3,
  Search,
  Download,
  CheckCircle2,
  Circle,
  Flame,
  Lock,
  Image as ImageIcon,
  Check,
  X,
  FileDown,
} from 'lucide-react';

interface JournalViewProps {
  entries: JournalEntry[];
  habits: HabitItem[];
  todos: TodoItem[];
  onSaveEntry: (entry: Omit<JournalEntry, 'id'>, existingId?: string) => void;
  onDeleteEntry: (id: string) => void;
  onToggleTodo: (id: string) => void;
  onAddTodo: (text: string, category: string) => void;
  onToggleHabitDay: (habitId: string, date: string) => void;
  onExportJournal: () => void;
}

export const JournalView: React.FC<JournalViewProps> = ({
  entries,
  habits,
  todos,
  onSaveEntry,
  onDeleteEntry,
  onToggleTodo,
  onAddTodo,
  onToggleHabitDay,
  onExportJournal,
}) => {
  const [activeTab, setActiveTab] = useState<'notes' | 'habits' | 'todos'>('notes');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCategory, setFormCategory] = useState<any>('Pessoal');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formMood, setFormMood] = useState<any>('produtivo');

  // New todo input
  const [newTodoText, setNewTodoText] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  const categories = ['all', 'Pessoal', 'Ideias', 'Trabalho', 'Saúde', 'Metas'];

  const filteredEntries = entries.filter((e) => {
    const matchesCat =
      selectedCategory === 'all' || e.category === selectedCategory;
    const matchesSearch =
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleStartCreate = () => {
    setEditingEntry(null);
    setFormTitle('');
    setFormContent('');
    setFormCategory('Pessoal');
    setFormImageUrl('');
    setFormMood('produtivo');
    setIsCreatingNew(true);
  };

  const handleStartEdit = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setFormTitle(entry.title);
    setFormContent(entry.content);
    setFormCategory(entry.category);
    setFormImageUrl(entry.imageUrl || '');
    setFormMood(entry.mood || 'produtivo');
    setIsCreatingNew(true);
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) return;

    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;

    onSaveEntry(
      {
        title: formTitle.trim(),
        content: formContent.trim(),
        category: formCategory,
        date: editingEntry ? editingEntry.date : todayStr,
        time: editingEntry ? editingEntry.time : time,
        imageUrl: formImageUrl.trim() || undefined,
        mood: formMood,
        isPrivate: true,
      },
      editingEntry?.id
    );

    setIsCreatingNew(false);
    setEditingEntry(null);
  };

  const handleAddTodoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoText.trim()) return;
    onAddTodo(newTodoText.trim(), 'Pessoal');
    setNewTodoText('');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Privacy Notice Banner */}
      <div className="p-3.5 rounded-2xl bg-[#0b172a] light:bg-slate-100 border border-[#2a3548] flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-emerald-400 font-semibold">
          <Lock className="w-4 h-4 shrink-0" />
          <span>Diário Pessoal Criptografado & Confidencial</span>
        </div>
        <button
          onClick={onExportJournal}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#152031] light:bg-slate-200 text-[#d8e3fb] light:text-slate-900 hover:bg-[#1f2a3c] transition-colors"
          title="Exportar todas as anotações em Markdown"
        >
          <FileDown className="w-3.5 h-3.5" />
          <span>Exportar Notas</span>
        </button>
      </div>

      {/* Header and View Selector (Tabs: Anotações, Hábitos, Tarefas) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2a3548] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#d8e3fb] light:text-slate-900 tracking-tight">
            Diário Pessoal Inteligente
          </h1>
          <p className="text-xs text-[#909096] mt-0.5">
            Organize reflexões diárias, acompanhe metas e construa consistência.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[#111c2d] light:bg-slate-100 border border-[#2a3548]">
          <button
            onClick={() => setActiveTab('notes')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'notes'
                ? 'bg-[#3b82f6] text-white shadow-sm'
                : 'text-[#909096] hover:text-[#d8e3fb]'
            }`}
          >
            Anotações ({entries.length})
          </button>
          <button
            onClick={() => setActiveTab('habits')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'habits'
                ? 'bg-[#3b82f6] text-white shadow-sm'
                : 'text-[#909096] hover:text-[#d8e3fb]'
            }`}
          >
            Hábitos & Streaks
          </button>
          <button
            onClick={() => setActiveTab('todos')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'todos'
                ? 'bg-[#3b82f6] text-white shadow-sm'
                : 'text-[#909096] hover:text-[#d8e3fb]'
            }`}
          >
            Tarefas ({todos.filter((t) => !t.isCompleted).length})
          </button>
        </div>
      </div>

      {/* TAB 1: NOTES */}
      {activeTab === 'notes' && (
        <div className="space-y-4">
          {/* Controls: Search, Category Filters, New Note Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? 'bg-[#152031] text-[#38bdf8] border border-[#3b82f6]/40'
                      : 'bg-[#0b172a] light:bg-slate-100 text-[#909096] hover:text-[#d8e3fb]'
                  }`}
                >
                  {cat === 'all' ? 'Todas as Categorias' : cat}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative w-40 sm:w-52">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#909096]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filtrar notas..."
                  className="w-full pl-8 pr-2.5 py-1.5 rounded-xl bg-[#111c2d] light:bg-slate-100 border border-[#2a3548] text-xs text-[#d8e3fb] placeholder-[#909096] focus:outline-none"
                />
              </div>

              <button
                onClick={handleStartCreate}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white glow-btn-primary whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>Nova Entrada</span>
              </button>
            </div>
          </div>

          {/* Grid of Notes */}
          {filteredEntries.length === 0 ? (
            <div className="p-12 text-center text-xs text-[#909096] rounded-2xl bg-[#0b172a] border border-[#2a3548]">
              Nenhuma entrada encontrada no diário.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="p-5 rounded-2xl bg-[#0b172a] light:bg-white border border-[#2a3548] light:border-slate-200 shadow-lg flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-emerald-400">
                          {entry.category}
                        </span>
                        {entry.mood && (
                          <span className="text-[#909096] bg-[#111c2d] px-2 py-0.5 rounded-full">
                            Humor: {entry.mood}
                          </span>
                        )}
                      </div>
                      <span className="text-[#909096] font-mono">
                        {entry.date} às {entry.time}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-[#d8e3fb] light:text-slate-900 leading-tight">
                      {entry.title}
                    </h3>

                    <p className="text-xs text-[#c6c6cc] light:text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {entry.content}
                    </p>

                    {entry.imageUrl && (
                      <div className="rounded-xl overflow-hidden max-h-48 border border-[#2a3548] bg-black/40">
                        <img
                          src={entry.imageUrl}
                          alt={entry.title}
                          className="w-full h-auto object-cover max-h-48"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1f2a3c] light:border-slate-200">
                    <button
                      onClick={() => handleStartEdit(entry)}
                      className="p-1.5 rounded-lg text-[#909096] hover:text-[#d8e3fb] hover:bg-[#152031] transition-colors"
                      title="Editar entrada"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteEntry(entry.id)}
                      className="p-1.5 rounded-lg text-[#909096] hover:text-red-400 hover:bg-[#152031] transition-colors"
                      title="Eliminar entrada"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: HABITS & STREAKS */}
      {activeTab === 'habits' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-[#0b172a] light:bg-white border border-[#2a3548] space-y-2">
            <h2 className="text-sm font-bold text-[#d8e3fb] light:text-slate-900">
              Rastreador de Hábitos Saudáveis
            </h2>
            <p className="text-xs text-[#909096]">
              Marque os hábitos realizados hoje ({todayStr}) para manter sua sequência ativa.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {habits.map((habit) => {
              const isDoneToday = habit.completedDates.includes(todayStr);

              return (
                <div
                  key={habit.id}
                  className="p-5 rounded-2xl bg-[#0b172a] light:bg-white border border-[#2a3548] shadow-lg space-y-4 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-[#909096] mb-1">
                      <span>{habit.category}</span>
                      <span className="flex items-center gap-1 font-mono text-amber-400 font-bold">
                        <Flame className="w-4 h-4 fill-amber-400" />
                        {habit.streakDays} dias
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-[#d8e3fb] light:text-slate-900">
                      {habit.name}
                    </h3>
                  </div>

                  <button
                    onClick={() => onToggleHabitDay(habit.id, todayStr)}
                    className={`w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      isDoneToday
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-[#111c2d] light:bg-slate-100 text-[#d8e3fb] light:text-slate-800 hover:bg-[#152031] border border-[#2a3548]'
                    }`}
                  >
                    {isDoneToday ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Completado Hoje!</span>
                      </>
                    ) : (
                      <>
                        <Circle className="w-4 h-4" />
                        <span>Marcar como Feito</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: TO-DOS */}
      {activeTab === 'todos' && (
        <div className="space-y-4">
          <form onSubmit={handleAddTodoSubmit} className="flex gap-2">
            <input
              type="text"
              value={newTodoText}
              onChange={(e) => setNewTodoText(e.target.value)}
              placeholder="Adicionar nova tarefa..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#0b172a] light:bg-slate-100 border border-[#2a3548] text-xs sm:text-sm text-[#d8e3fb] light:text-slate-900 focus:outline-none focus:border-[#3b82f6]"
            />
            <button
              type="submit"
              disabled={!newTodoText.trim()}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white glow-btn-primary disabled:opacity-40"
            >
              Adicionar
            </button>
          </form>

          <div className="space-y-2">
            {todos.map((todo) => (
              <div
                key={todo.id}
                onClick={() => onToggleTodo(todo.id)}
                className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-colors ${
                  todo.isCompleted
                    ? 'bg-[#081425] border-[#2a3548]/40 opacity-60'
                    : 'bg-[#0b172a] light:bg-white border-[#2a3548] light:border-slate-200 hover:border-[#3b82f6]/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  {todo.isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Circle className="w-5 h-5 text-[#909096]" />
                  )}
                  <span
                    className={`text-xs sm:text-sm font-medium ${
                      todo.isCompleted
                        ? 'line-through text-[#909096]'
                        : 'text-[#d8e3fb] light:text-slate-900'
                    }`}
                  >
                    {todo.text}
                  </span>
                </div>

                <div className="text-[11px] text-[#909096] font-mono">
                  {todo.dueDate || 'Sem prazo'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create / Edit Note Modal */}
      {isCreatingNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-[#081425] border border-[#2a3548] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#2a3548]">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-[#d8e3fb]">
                  {editingEntry ? 'Editar Entrada do Diário' : 'Nova Entrada no Diário'}
                </h3>
              </div>
              <button
                onClick={() => setIsCreatingNew(false)}
                className="p-1 text-[#909096] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#d8e3fb] mb-1">
                  Título da Nota
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Ex: Reflexões sobre o lançamento..."
                  className="w-full px-3 py-2 rounded-xl bg-[#111c2d] border border-[#2a3548] text-xs text-white focus:outline-none focus:border-[#3b82f6]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#d8e3fb] mb-1">
                    Categoria
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#111c2d] border border-[#2a3548] text-xs text-white focus:outline-none focus:border-[#3b82f6]"
                  >
                    <option value="Pessoal">Pessoal</option>
                    <option value="Ideias">Ideias</option>
                    <option value="Trabalho">Trabalho</option>
                    <option value="Saúde">Saúde</option>
                    <option value="Metas">Metas</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#d8e3fb] mb-1">
                    Humor
                  </label>
                  <select
                    value={formMood}
                    onChange={(e) => setFormMood(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#111c2d] border border-[#2a3548] text-xs text-white focus:outline-none focus:border-[#3b82f6]"
                  >
                    <option value="radiante">Radiante</option>
                    <option value="produtivo">Produtivo</option>
                    <option value="tranquilo">Tranquilo</option>
                    <option value="reflexivo">Reflexivo</option>
                    <option value="cansado">Cansado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#d8e3fb] mb-1">
                  Conteúdo da Reflexão
                </label>
                <textarea
                  rows={5}
                  required
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Escreva seus pensamentos, acontecimentos e aprendizados do dia..."
                  className="w-full px-3 py-2 rounded-xl bg-[#111c2d] border border-[#2a3548] text-xs text-white focus:outline-none focus:border-[#3b82f6] leading-relaxed resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#d8e3fb] mb-1">
                  URL da Fotografia (Opcional)
                </label>
                <input
                  type="url"
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  placeholder="https://exemplo.com/imagem.jpg"
                  className="w-full px-3 py-2 rounded-xl bg-[#111c2d] border border-[#2a3548] text-xs text-white focus:outline-none focus:border-[#3b82f6]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#909096] hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white glow-btn-primary"
                >
                  Guardar Nota
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
