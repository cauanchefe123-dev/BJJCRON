import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { BookOpen, Plus, Flame, Sparkles, Star, Calendar, Check } from 'lucide-react';

export const StudentTrainingJournal: React.FC = () => {
  const { currentUser } = useAuth();
  const { students, trainingLogs, addTrainingLog } = useData();

  const student = students.find(s => s.id === currentUser?.studentId) || students[0];
  const myLogs = trainingLogs.filter(l => l.studentId === student?.id);

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [duration, setDuration] = useState(90);
  const [rounds, setRounds] = useState(5);
  const [techInput, setTechInput] = useState('');
  const [techniques, setTechniques] = useState<string[]>(['Passagem de Guarda Emborcando']);
  const [notes, setNotes] = useState('');
  const [rating, setRating] = useState(5);

  const handleAddTech = () => {
    if (techInput.trim()) {
      setTechniques([...techniques, techInput.trim()]);
      setTechInput('');
    }
  };

  const handleSaveLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;

    addTrainingLog({
      studentId: student.id,
      date,
      durationMinutes: duration,
      techniquesLearned: techniques,
      roundsCount: rounds,
      notes,
      moodRating: rating,
    });

    setNotes('');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white flex items-center justify-between shadow-xl">
        <div>
          <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            Diário de Treinos & Técnicas
          </h3>
          <p className="text-xs text-slate-400">
            Anotações de posições, raspagens, rolas e sensação pós-treino do atleta.
          </p>
        </div>
      </div>

      {/* New Log Form */}
      <form onSubmit={handleSaveLog} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white space-y-4 shadow-lg text-xs">
        <h4 className="font-bold text-sm text-amber-400 uppercase tracking-wider">
          Anotar Novo Treino no Tatame
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-slate-300 font-bold block mb-1">Data do Treino:</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>

          <div>
            <label className="text-slate-300 font-bold block mb-1">Duração (Minutos):</label>
            <input
              type="number"
              value={duration}
              onChange={e => setDuration(parseInt(e.target.value) || 0)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>

          <div>
            <label className="text-slate-300 font-bold block mb-1">Rolas / Sparring (Rounds):</label>
            <input
              type="number"
              value={rounds}
              onChange={e => setRounds(parseInt(e.target.value) || 0)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-slate-300 font-bold block mb-1">Técnicas Aprendidas Hoje:</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ex: Raspagem de Guarda De La Riva"
              value={techInput}
              onChange={e => setTechInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddTech())}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 outline-none"
            />
            <button
              type="button"
              onClick={handleAddTech}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold rounded-lg"
            >
              Adicionar
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mt-2">
            {techniques.map((t, i) => (
              <span key={i} className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold">
                {t}
              </span>
            ))}
          </div>
        </div>

        <div>
          <label className="text-slate-300 font-bold block mb-1">Observações e Sensação de Treino:</label>
          <textarea
            rows={2}
            placeholder="Como foi o rola, pontos a melhorar no ajuste da guarda..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:ring-2 focus:ring-amber-500 outline-none"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-1">
            <span className="text-slate-400 font-semibold mr-2">Desempenho:</span>
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`p-1 ${star <= rating ? 'text-amber-400' : 'text-slate-700'}`}
              >
                <Star className="w-4 h-4 fill-current" />
              </button>
            ))}
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md"
          >
            Salvar Registro de Treino
          </button>
        </div>
      </form>

      {/* History Log List */}
      <div className="space-y-4">
        <h4 className="font-bold text-sm text-slate-300 uppercase tracking-wider">
          Histórico do Seu Diário
        </h4>

        <div className="space-y-3">
          {myLogs.map(log => (
            <div key={log.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-white space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-amber-400">
                  {new Date(log.date).toLocaleDateString('pt-BR')} ({log.durationMinutes} min)
                </span>
                <span className="text-slate-400 font-semibold">
                  {log.roundsCount} rolas realizados
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {log.techniquesLearned.map((t, i) => (
                  <span key={i} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-950 text-slate-300 border border-slate-800">
                    {t}
                  </span>
                ))}
              </div>

              {log.notes && <p className="text-xs text-slate-400 pt-1 border-t border-slate-800/80">{log.notes}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
