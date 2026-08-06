import React, { useState } from 'react';
import { Menu, Bell, ShieldCheck, QrCode, Search, LogIn, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { DEFAULT_BLACK_GI_AVATAR, getUserAvatar, resolveStudentForUser } from '../../constants/avatar';
import { NotificationCenter } from '../notifications/NotificationCenter';

interface NavbarProps {
  activeTab: string;
  onOpenSidebar: () => void;
  onOpenQuickScan?: () => void;
  onOpenAuthModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onOpenSidebar,
  onOpenQuickScan,
  onOpenAuthModal,
}) => {
  const { currentUser, logout } = useAuth();
  const { academyConfig, students, payments, notifications } = useData();

  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const currentStudent = resolveStudentForUser(currentUser, students);
  const userAvatar = getUserAvatar(currentUser, currentStudent);

  const userId = currentUser?.id || 'guest';
  const unreadNotifsCount = notifications.filter(n => !n.readBy.includes(userId)).length;

  const tabTitles: Record<string, string> = {
    dashboard: 'Painel Principal',
    attendance: 'Controle de Frequência & QR Code',
    students: 'Alunos & Graduações',
    classes: 'Turmas & Horários de Treino',
    card: 'Minha Carteirinha Digital',
    journal: 'Diário de Treinos & Técnicas',
    ranking: 'Ranking de Frequência',
    timer: 'Cronômetro de Rola do Tatame',
    reports: 'Relatórios & Desempenho',
    settings: 'Configurações da Academia',
  };

  return (
    <>
      <header className="sticky top-0 z-20 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white px-4 py-3 flex items-center justify-between print:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSidebar}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
            title="Abrir menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <img
              src={academyConfig.logoUrl || '/logo.svg'}
              alt="BJJCRON Logo"
              className="w-8 h-8 rounded-lg object-contain bg-slate-950 p-0.5 border border-slate-700/80 shadow-xs"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  {tabTitles[activeTab] || 'BJJCRON'}
                </h2>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                {academyConfig.fantasyName || academyConfig.name}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick QR Scan Button for Professor/Admin */}
          {(currentUser?.role === 'PROFESSOR' || currentUser?.role === 'ADMIN') && onOpenQuickScan && (
            <button
              onClick={onOpenQuickScan}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all"
            >
              <QrCode className="w-4 h-4" />
              Escanear QR Presença
            </button>
          )}

          {/* Central Notification Bell for Students, Professors, Admins */}
          <button
            onClick={() => setIsNotifOpen(true)}
            className="relative p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-amber-400 transition-all border border-slate-700/60"
            title="Notificações e Alertas em Tempo Real"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifsCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black flex items-center justify-center shadow-md animate-pulse">
                {unreadNotifsCount}
              </span>
            )}
          </button>

          {/* Account / Login Trigger */}
          <button
            onClick={onOpenAuthModal}
            className="flex items-center gap-2.5 pl-3 border-l border-slate-800 hover:opacity-80 transition-all text-left"
            title="Entrar ou alterar conta"
          >
            <div className="text-right hidden md:block">
              <span className="text-xs font-bold text-slate-200 block truncate max-w-[140px]">
                {currentUser?.name || 'Fazer Login'}
              </span>
              <span className="text-[10px] text-amber-400 flex items-center justify-end gap-1 font-medium">
                <LogIn className="w-3 h-3 text-amber-400" />
                Entrar / Trocar
              </span>
            </div>

            <img
              src={userAvatar}
              alt="Avatar"
              className="w-8 h-8 rounded-full object-cover ring-2 ring-amber-500/40 bg-slate-900"
            />
          </button>
        </div>
      </header>

      {/* Notification Center Popover / Modal */}
      <NotificationCenter isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
    </>
  );
};

