import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { BJJClass } from '../../types';
import { CalendarDays, Clock, Plus, Users, Trash2, Edit3, CheckCircle, X } from 'lucide-react';

export const ClassManager: React.FC = () => {
  const { classes, teachers, addClass, deleteClass } = useData();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    professorName: teachers[0]?.name || 'Prof. Gabriel "Fera" Santos',
    professorId: teachers[0]?.id || 'prof-1',
    daysOfWeek: [1, 3, 5], // Seg, Qua, Sex
    time: '19:00',
    durationMinutes: 90,
    category: 'FUNDAMENTAL' as const,
    maxCapacity: 30,
    active: true,
    description: '',
  });

  const daysLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    addClass(formData);
    setIsAddOpen(false);
    setFormData({
      title: '',
      professorName: 'Prof. Gabriel "Fera"',
      professorId: 'user-prof-1',
      daysOfWeek: [1, 3, 5],
      time: '19:00',
      durationMinutes: 90,
      category: 'FUNDAMENTAL',
      maxCapacity: 30,
      active: true,
      description: '',
    });
  };

  const toggleDay = (dayIndex: number) => {
    setFormData(prev => {
      const exists = prev.daysOfWeek.includes(dayIndex);
      return {
        ...prev,
        daysOfWeek: exists
          ? prev.daysOfWeek.filter(d => d !== dayIndex)
          : [...prev.daysOfWeek, dayIndex].sort(),
      };
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl">
        <div>
          <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-amber-400" />
            Turmas e Grade de Aulas
          </h3>
          <p className="text-xs text-slate-400">
            Horários de kimono, No-Gi, Kids e Open Mat da academia.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          Nova Turma
        </button>
      </div>

      {/* Class Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map(c => (
          <div key={c.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white space-y-4 shadow-lg flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {c.time} ({c.durationMinutes} min)
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  {c.category}
                </span>
              </div>

              <div>
                <h4 className="font-extrabold text-base text-slate-100">{c.title}</h4>
                <p className="text-xs text-slate-400">Instrutor: {c.professorName}</p>
              </div>

              <p className="text-xs text-slate-400 line-clamp-2">{c.description}</p>

              {/* Days badging */}
              <div className="flex items-center gap-1 pt-1">
                {daysLabels.map((label, idx) => {
                  const isDay = c.daysOfWeek.includes(idx);
                  return (
                    <span
                      key={idx}
                      className={`text-[9px] font-bold px-2 py-1 rounded-md border ${
                        isDay
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                          : 'bg-slate-950/60 text-slate-600 border-slate-800'
                      }`}
                    >
                      {label}
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                Limite: {c.maxCapacity} alunos
              </span>

              <button
                onClick={() => {
                  if (confirm(`Excluir a turma ${c.title}?`)) {
                    deleteClass(c.id);
                  }
                }}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 border border-slate-700"
                title="Excluir Turma"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Class Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-white space-y-6 shadow-2xl relative">
            <button
              onClick={() => setIsAddOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-lg text-slate-100">Criar Nova Turma de Jiu-Jitsu</h3>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Nome / Título da Turma *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:ring-2 focus:ring-amber-500 outline-none"
                  placeholder="Ex: Jiu-Jitsu Avançado & Competição"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Professor Responsável *</label>
                <select
                  value={formData.professorId}
                  onChange={e => {
                    const selectedProf = teachers.find(t => t.id === e.target.value);
                    setFormData({
                      ...formData,
                      professorId: e.target.value,
                      professorName: selectedProf ? selectedProf.name : e.target.value
                    });
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:ring-2 focus:ring-amber-500 outline-none"
                >
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.belt})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Horário (HH:MM)</label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={e => setFormData({ ...formData, time: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Duração (Minutos)</label>
                  <input
                    type="number"
                    value={formData.durationMinutes}
                    onChange={e => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) || 60 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Dias de Treino da Semana:</label>
                <div className="flex gap-1">
                  {daysLabels.map((label, idx) => {
                    const selected = formData.daysOfWeek.includes(idx);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => toggleDay(idx)}
                        className={`flex-1 py-2 rounded-lg font-bold text-xs border transition-all ${
                          selected
                            ? 'bg-amber-500 text-slate-950 border-amber-400'
                            : 'bg-slate-950 text-slate-400 border-slate-800'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Categoria:</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:ring-2 focus:ring-amber-500 outline-none"
                >
                  <option value="FUNDAMENTAL">Fundamental</option>
                  <option value="INTERMEDIÁRIO">Intermediário</option>
                  <option value="AVANÇADO">Avançado</option>
                  <option value="NO_GI">No-Gi / Submission</option>
                  <option value="KIDS">Kids</option>
                  <option value="OPEN_MAT">Open Mat / Treino Livre</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Descrição do Foco do Treino</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md"
                >
                  Salvar Turma
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
