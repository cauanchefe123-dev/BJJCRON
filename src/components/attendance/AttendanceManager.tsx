import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { QrCode, Calendar, CheckCircle2, Trash2, Search, Filter, Sparkles, UserCheck } from 'lucide-react';

interface AttendanceManagerProps {
  onOpenCheckin: () => void;
}

export const AttendanceManager: React.FC<AttendanceManagerProps> = ({ onOpenCheckin }) => {
  const { attendances, students, classes, removeAttendance } = useData();
  const { currentUser } = useAuth();

  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('ALL');

  const currentStudent = students.find(s => s.id === currentUser?.studentId || s.email.toLowerCase() === currentUser?.email.toLowerCase());

  const filteredAttendances = attendances.filter(a => {
    // Student view isolation
    if (currentUser?.role === 'ALUNO') {
      if (a.studentId !== currentStudent?.id) return false;
    }

    const matchesSearch = a.studentName.toLowerCase().includes(search.toLowerCase()) ||
                          a.className.toLowerCase().includes(search.toLowerCase());
    const matchesClass = selectedClass === 'ALL' || a.classId === selectedClass;
    return matchesSearch && matchesClass;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <QrCode className="w-5 h-5 text-amber-400" />
            Controle de Frequência & Presenças
          </h3>
          <p className="text-xs text-slate-400">
            Registro em tempo real de presença dos atletas via QR Code e chamadas.
          </p>
        </div>

        <button
          onClick={onOpenCheckin}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg transition-all"
        >
          <QrCode className="w-4 h-4" />
          Registrar Presença / QR Code
        </button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome do aluno..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-amber-500 outline-none"
          />
        </div>

        <div>
          <select
            value={selectedClass}
            onChange={e => setSelectedClass(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-slate-100 focus:ring-2 focus:ring-amber-500 outline-none"
          >
            <option value="ALL">Todas as Turmas</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Attendance Log List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Atleta</th>
                <th className="py-3.5 px-4">Turma / Aula</th>
                <th className="py-3.5 px-4">Data & Horário</th>
                <th className="py-3.5 px-4">Método</th>
                <th className="py-3.5 px-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredAttendances.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    Nenhum registro de presença localizado.
                  </td>
                </tr>
              ) : (
                filteredAttendances.map(a => {
                  const student = students.find(s => s.id === a.studentId);
                  return (
                    <tr key={a.id} className="hover:bg-slate-800/40 transition-all">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img src={student?.photoUrl} alt={a.studentName} className="w-8 h-8 rounded-full object-cover" />
                          <div>
                            <p className="font-bold text-slate-100">{a.studentName}</p>
                            <span className="text-[10px] text-amber-400 font-mono">{student?.registrationNumber}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-200">
                        {a.className}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-200 block">{new Date(a.date).toLocaleDateString('pt-BR')}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(a.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                          {a.method === 'QR_CODE_STUDENT' ? 'QR Code Aluno' : a.method === 'QR_CODE_TEACHER' ? 'QR Leitor Tatame' : 'Chamada Manual'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => removeAttendance(a.id)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 border border-slate-700"
                          title="Excluir Presença"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
