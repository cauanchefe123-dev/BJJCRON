import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { BeltBadge } from '../belts/BeltBadge';
import { getStudentAvatar, resolveStudentForUser } from '../../constants/avatar';
import { DigitalMembershipCard } from '../card/DigitalMembershipCard';
import { getTrainingTimeText } from '../../utils/trainingTime';
import { Award, QrCode, CreditCard, BookOpen, Clock, Calendar, CheckCircle, AlertTriangle, ArrowRight, Flame, Sparkles, Edit3, Shield, Target, Video, Play } from 'lucide-react';
import { TechniqueVideoModal } from '../common/TechniqueVideoModal';
import { BJJClass } from '../../types';

interface StudentDashboardProps {
  onNavigate: (tab: string) => void;
  onOpenPixModal?: (paymentId: string) => void;
  onOpenEditModal?: (student: any) => void;
  selectedStudentId?: string;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigate, onOpenPixModal, onOpenEditModal, selectedStudentId }) => {
  const { currentUser } = useAuth();
  const { students, payments, attendances, academyConfig, classes } = useData();

  const [selectedVideoClass, setSelectedVideoClass] = useState<BJJClass | null>(null);

  const resolved = resolveStudentForUser(currentUser, students);
  const currentStudent = selectedStudentId
    ? (students.find(s => s.id === selectedStudentId) || resolved)
    : resolved;
  const myPayments = payments.filter(p => p.studentId === currentStudent?.id);
  const myAttendances = attendances.filter(a => a.studentId === currentStudent?.id);

  const pendingPayment = myPayments.find(p => p.status === 'PENDENTE' || p.status === 'ATRASADO');

  // Calculate belt progress
  const reqClassesPerStripe = academyConfig?.graduationCriteria?.[currentStudent.belt]?.classesPerStripe || 30;
  const progressPercent = Math.min(100, Math.round((currentStudent.classesSinceLastGraduation / reqClassesPerStripe) * 100));

  return (
    <div className="space-y-6">
      {currentStudent.approvalStatus === 'PENDING' && (
        <div className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 border-2 border-amber-500/60 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-black text-lg shrink-0">
              ⏳
            </div>
            <div>
              <p className="font-extrabold text-amber-300 text-sm">Vínculo Pendente — Aguardando Aprovação na Equipe</p>
              <p className="text-slate-300 text-xs mt-0.5 max-w-xl leading-relaxed">
                Você solicitou vínculo com a equipe <strong>{academyConfig.name}</strong>. Sua solicitação está na fila do Professor ou Administrador da academia para ser aprovada.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('academies')}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shrink-0 transition-all shadow-md"
          >
            Gerenciar Vínculo →
          </button>
        </div>
      )}

      {/* Student Profile Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-neutral-900 border border-slate-800 rounded-2xl p-6 text-white space-y-6 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={getStudentAvatar(currentStudent)}
              alt={currentStudent.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400 shadow-md bg-slate-900"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-100">{currentStudent.name}</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Matrícula {currentStudent.registrationNumber}
                </span>
              </div>
              <p className="text-xs text-slate-400">Atleta da {academyConfig.name}</p>
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <BeltBadge belt={currentStudent.belt} stripes={currentStudent.stripes} size="md" />
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  {getTrainingTimeText(currentStudent.startDate, currentStudent.initialMonthsTrained)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap w-full md:w-auto">
            {onOpenEditModal && currentStudent && (
              <button
                onClick={() => onOpenEditModal(currentStudent)}
                className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-lg transition-all"
              >
                <Edit3 className="w-4 h-4" />
                Editar Meu Cadastro
              </button>
            )}
            {currentUser?.role !== 'ADMIN' && !selectedStudentId && (
              <button
                onClick={() => onNavigate('academies')}
                className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg transition-all"
              >
                <Shield className="w-4 h-4 text-amber-300" />
                Vincular à Academia
              </button>
            )}
            <button
              onClick={() => onNavigate('card')}
              className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-lg transition-all"
            >
              <QrCode className="w-4 h-4" />
              Carteirinha Digital
            </button>
            <button
              onClick={() => onNavigate('journal')}
              className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-all"
            >
              <BookOpen className="w-4 h-4 text-amber-400" />
              Diário
            </button>
            <button
              onClick={() => onNavigate('observations')}
              className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-purple-900/60 hover:bg-purple-800/60 text-purple-200 font-bold text-xs border border-purple-700/50 transition-all"
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              Observações
            </button>
          </div>
        </div>

        {/* Linked Academy Quick Banner */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-amber-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={academyConfig.logoUrl || 'https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&q=80&w=300'}
              alt={academyConfig.name}
              className="w-12 h-12 rounded-xl object-cover border border-amber-500/60 shadow-md bg-slate-900"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase text-amber-400">
                  Sua Academia Vinculada:
                </span>
                {currentStudent.approvalStatus === 'PENDING' ? (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse">
                    ⏳ VÍNCULO PENDENTE
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    ATLETA ATIVO
                  </span>
                )}
              </div>
              <h4 className="text-sm font-extrabold text-slate-100 mt-0.5">
                {academyConfig.name} — Prof. {academyConfig.headCoachName || 'Gabriel "Fera" Santos'}
              </h4>
            </div>
          </div>
          {currentUser?.role !== 'ADMIN' && !selectedStudentId && (
            <button
              onClick={() => onNavigate('academies')}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0"
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              Mudar / Vincular a Outra Academia →
            </button>
          )}
        </div>

        {/* Belt Progress Gauge */}
        <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-slate-300 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              Evolução para o Próximo Grau / Faixa:
            </span>
            <span className="text-amber-400 font-mono">
              {currentStudent.classesSinceLastGraduation} / {reqClassesPerStripe} treinos ({progressPercent}%)
            </span>
          </div>

          <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 transition-all duration-700 rounded-full shadow-inner"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <p className="text-[11px] text-slate-400">
            {progressPercent >= 100
              ? '🎉 Parabéns! Você cumpriu a contagem de treinos mínima para avaliação do professor.'
              : `Faltam apenas ${reqClassesPerStripe - currentStudent.classesSinceLastGraduation} treinos para completar seu próximo objetivo.`}
          </p>
        </div>
      </div>

      {/* Foco Técnico da Semana por Turma */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base text-slate-100 flex items-center gap-2">
              <Target className="w-5 h-5 text-amber-400" />
              Foco Técnico da Semana nas Turmas
            </h3>
            <p className="text-xs text-slate-400">
              Acompanhe as posições e técnicas que seu professor definiu para o treino desta semana.
            </p>
          </div>
          <button
            onClick={() => onNavigate('classes')}
            className="text-xs text-amber-400 font-bold hover:underline"
          >
            Ver Grade Completa →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map(c => (
            <div
              key={c.id}
              className="bg-slate-950 border border-slate-800 hover:border-amber-500/50 rounded-xl p-4 space-y-3 transition-all"
            >
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
                <h4 className="font-extrabold text-sm text-slate-100">{c.title}</h4>
                <p className="text-xs text-slate-400">Prof. {c.professorName}</p>
              </div>

              {/* Focus Badge */}
              <div className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/60 border border-amber-500/40 rounded-lg p-2.5 space-y-2">
                <span className="text-[10px] font-black uppercase text-amber-400 block mb-0.5">
                  🎯 Foco da Semana:
                </span>
                <p className="text-xs font-bold text-amber-100">
                  {c.weeklyFocus ? c.weeklyFocus : 'Treino geral e aperfeiçoamento de posições.'}
                </p>

                {c.weeklyFocusVideoUrl && (
                  <button
                    onClick={() => setSelectedVideoClass(c)}
                    className="w-full py-1.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md transition-all"
                  >
                    <Video className="w-4 h-4" />
                    <span>Assistir Vídeo da Posição</span>
                    <Play className="w-3 h-3 fill-slate-950 text-slate-950 ml-0.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white space-y-1">
          <span className="text-xs font-bold text-slate-400">Total de Treinos</span>
          <p className="text-3xl font-black text-amber-400">{currentStudent.totalClassesAttended}</p>
          <p className="text-[11px] text-slate-400">Presenças computadas no tatame</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white space-y-1">
          <span className="text-xs font-bold text-slate-400">Tempo Total de Treino</span>
          <p className="text-xl font-black text-amber-300">
            {getTrainingTimeText(currentStudent.startDate, currentStudent.initialMonthsTrained)}
          </p>
          <p className="text-[11px] text-slate-400">Jornada acumulada (meses/anos)</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white space-y-1">
          <span className="text-xs font-bold text-slate-400">Horas de Tatame</span>
          <p className="text-3xl font-black text-blue-400">
            {Math.round((currentStudent.totalClassesAttended * 75) / 60)}h
          </p>
          <p className="text-[11px] text-slate-400">Horas acumuladas em aula</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white space-y-1">
          <span className="text-xs font-bold text-slate-400">Status da Matrícula</span>
          <p className="text-2xl font-black text-emerald-400">
            ATIVO
          </p>
          <p className="text-[11px] text-slate-400">Atleta regularizado na academia</p>
        </div>
      </div>

      {/* Digital Card Preview Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <DigitalMembershipCard student={currentStudent} />
      </div>

      {/* Technique Video Modal */}
      <TechniqueVideoModal
        isOpen={!!selectedVideoClass}
        onClose={() => setSelectedVideoClass(null)}
        title={selectedVideoClass?.title || 'Vídeo da Posição'}
        focusText={selectedVideoClass?.weeklyFocus}
        videoUrl={selectedVideoClass?.weeklyFocusVideoUrl}
      />
    </div>
  );
};
