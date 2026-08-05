import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { DEFAULT_BLACK_GI_AVATAR, getUserAvatar, resolveStudentForUser } from '../../constants/avatar';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  QrCode,
  CalendarDays,
  CreditCard,
  IdCard,
  Trophy,
  Timer,
  BookOpen,
  FileBarChart2,
  Settings,
  LogOut,
  Award,
  MessageSquareQuote,
  Shield,
  GraduationCap
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  setIsOpen,
}) => {
  const { currentUser, logout } = useAuth();
  const { academyConfig, students } = useData();

  if (!currentUser) return null;

  const currentStudent = resolveStudentForUser(currentUser, students);
  const userAvatar = getUserAvatar(currentUser, currentStudent);

  const role = currentUser.role;

  const navItems = [
    { id: 'dashboard', label: 'Painel Geral', icon: LayoutDashboard, roles: ['ADMIN', 'PROFESSOR', 'ALUNO'] },
    { id: 'students-dashboard', label: 'Dashboard dos Alunos', icon: GraduationCap, roles: ['ADMIN'] },
    { id: 'attendance', label: 'Frequência & QR Code', icon: QrCode, roles: ['ADMIN', 'PROFESSOR', 'ALUNO'] },
    { id: 'academies', label: 'Vincular à Academia', icon: Shield, roles: ['PROFESSOR', 'ALUNO'] },
    { id: 'students', label: 'Alunos & Graduações', icon: Users, roles: ['ADMIN', 'PROFESSOR'] },
    { id: 'teachers', label: 'Professores & Staff', icon: UserCheck, roles: ['ADMIN', 'PROFESSOR'] },
    { id: 'classes', label: 'Turmas & Aulas', icon: CalendarDays, roles: ['ADMIN', 'PROFESSOR'] },
    { id: 'card', label: 'Carteirinha Digital', icon: IdCard, roles: ['ALUNO'] },
    { id: 'journal', label: 'Diário de Treinos', icon: BookOpen, roles: ['ALUNO'] },
    { id: 'observations', label: 'Observações do Professor', icon: MessageSquareQuote, roles: ['ADMIN', 'PROFESSOR', 'ALUNO'] },
    { id: 'ranking', label: 'Ranking da Academia', icon: Trophy, roles: ['ADMIN', 'PROFESSOR', 'ALUNO'] },
    { id: 'timer', label: 'Cronômetro de Rola', icon: Timer, roles: ['ADMIN', 'PROFESSOR'] },
    { id: 'reports', label: 'Relatórios & Métricas', icon: FileBarChart2, roles: ['ADMIN', 'PROFESSOR'] },
    { id: 'settings', label: 'Configurações', icon: Settings, roles: ['ADMIN'] },
  ];

  const filteredItems = navItems.filter(item => item.roles.includes(role));

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-30 lg:hidden print:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800 text-slate-200 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 print:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 flex-1 overflow-y-auto">
          {/* Logo Brand */}
          <div className="flex items-center gap-3 px-2 py-3 mb-6 border-b border-slate-800">
            <img
              src={academyConfig.logoUrl || '/logo.svg'}
              alt={academyConfig.fantasyName || academyConfig.name || 'BJJCRON'}
              className="w-10 h-10 rounded-xl object-contain border border-amber-500/50 shadow-md bg-slate-950 p-0.5"
            />
            <div className="min-w-0 flex-1">
              <h1 className="font-black text-sm tracking-wider text-white truncate">
                {academyConfig.fantasyName || 'BJJCRON'}
              </h1>
              <p className="text-[10px] text-amber-400 tracking-tight font-bold uppercase truncate">
                {academyConfig.name || 'Jiu-Jitsu Academy'}
              </p>
            </div>
          </div>

          {/* User Badge Info */}
          <div className="mb-6 p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center gap-3">
            <img
              src={userAvatar}
              alt={currentUser.name}
              className="w-10 h-10 rounded-full object-cover border border-amber-400/50 bg-slate-900"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-100 truncate">{currentUser.name}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-xs uppercase ${
                  currentUser.role === 'ADMIN' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                  currentUser.role === 'PROFESSOR' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                  'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {currentUser.role === 'ADMIN' ? 'Administrador' : currentUser.role === 'PROFESSOR' ? 'Professor' : 'Aluno'}
                </span>
              </div>
            </div>
          </div>

          {/* Nav List */}
          <nav className="space-y-1">
            <p className="px-3 text-[10px] font-bold uppercase text-slate-500 tracking-wider mb-2">
              Navegação
            </p>
            {filteredItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/10'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-rose-900/30 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sair do Sistema
          </button>
        </div>
      </aside>
    </>
  );
};
