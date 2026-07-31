import React from 'react';
import { useData } from '../../context/DataContext';
import { BeltBadge } from '../belts/BeltBadge';
import { PendingStudentApprovals } from '../students/PendingStudentApprovals';
import { QrCode, CalendarDays, Award, Users, CheckCircle, Flame, Clock } from 'lucide-react';

interface TeacherDashboardProps {
  onNavigate: (tab: string) => void;
  onOpenCheckin: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onNavigate, onOpenCheckin }) => {
  const { students, classes, attendances } = useData();

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAttendances = attendances.filter(a => a.date === todayStr);

  return (
    <div className="space-y-6">
      {/* Teacher Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border border-blue-900/50 rounded-2xl p-6 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
            Painel do Professor / Mestre
          </span>
          <h2 className="text-2xl font-black text-slate-100">
            Controle de Tatame e Aulas
          </h2>
          <p className="text-xs text-slate-300">
            Realize chamadas por QR Code, acompanhe a evolução técnica e agende exames de faixa.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenCheckin}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg transition-all"
          >
            <QrCode className="w-4 h-4" />
            Escanear Presença de Aluno
          </button>
          <button
            onClick={() => onNavigate('timer')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg transition-all"
          >
            <Flame className="w-4 h-4 text-amber-400" />
            Cronômetro de Rola
          </button>
        </div>
      </div>

      {/* Student Approvals Interface */}
      <PendingStudentApprovals />

      {/* Classes Schedule Today */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-amber-400" />
              Turmas Cadastradas
            </h3>
            <p className="text-xs text-slate-400">Horários e categorias de aula na academia</p>
          </div>
          <button
            onClick={() => onNavigate('classes')}
            className="text-xs text-amber-400 font-semibold hover:underline"
          >
            Gerenciar Turmas
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map(c => (
            <div key={c.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
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
                <h4 className="font-bold text-sm text-slate-100">{c.title}</h4>
                <p className="text-xs text-slate-400">{c.professorName}</p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span>Capacidade: {c.maxCapacity} atletas</span>
                <button
                  onClick={onOpenCheckin}
                  className="text-amber-400 font-bold hover:underline"
                >
                  Fazer Chamada →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Presences Today */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white space-y-4">
        <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          Presenças Registradas Hoje ({todayAttendances.length})
        </h3>

        {todayAttendances.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">Nenhum check-in de atleta realizado hoje até o momento.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {todayAttendances.map(a => {
              const student = students.find(s => s.id === a.studentId);
              return (
                <div key={a.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img src={student?.photoUrl} alt={a.studentName} className="w-8 h-8 rounded-full object-cover" />
                    <div>
                      <p className="text-xs font-bold text-slate-200">{a.studentName}</p>
                      <p className="text-[10px] text-slate-400">{a.className}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800/40">
                    {new Date(a.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
