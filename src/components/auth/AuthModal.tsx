import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getStoredAcademiesList } from '../academies/AcademyLinkView';
import { BeltType, AgeCategory, WeightCategory } from '../../types';
import {
  ShieldCheck,
  UserCheck,
  Lock,
  Mail,
  UserPlus,
  KeyRound,
  Building2,
  CheckCircle2,
  AlertCircle,
  X,
  Phone,
  User,
  ArrowRight,
  GraduationCap,
  Crown
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const {
    loginWithPassword,
    firstAccessActivate,
    registerStudentSelfService,
    registerTeacherSelfService,
    registerAdminSelfService,
    deleteMyAccount,
    currentUser
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'REGISTER' | 'LOGIN' | 'FIRST_ACCESS'>('REGISTER');
  const [selectedRole, setSelectedRole] = useState<'ALUNO' | 'PROFESSOR' | 'ADMIN'>('ALUNO');
  const availableAcademies = getStoredAcademiesList();

  // Form States - All clean without pre-filled test data
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [firstAccessEmail, setFirstAccessEmail] = useState('');
  const [firstAccessPassword, setFirstAccessPassword] = useState('');

  // Register Aluno State
  const [studentReg, setStudentReg] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    belt: 'BRANCA' as BeltType,
    ageCategory: 'ADULTO' as AgeCategory,
    weightCategory: 'MÉDIO' as WeightCategory,
    academyName: '',
  });

  // Register Teacher State
  const [teacherReg, setTeacherReg] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    belt: 'PRETA' as BeltType,
    degrees: 1,
    specialty: '',
  });

  // Register Master / Admin State
  const [adminReg, setAdminReg] = useState({
    name: '',
    academyName: '',
    email: '',
    phone: '',
    password: '',
    belt: 'PRETA' as BeltType,
  });

  // Alert Feedback State
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | 'warning';
    message: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const res = loginWithPassword(loginEmail, loginPassword);
    if (res.success) {
      setFeedback({ type: 'success', message: res.message || 'Login realizado com sucesso!' });
      setTimeout(() => {
        onClose();
      }, 1000);
    } else {
      setFeedback({
        type: res.reason === 'PENDING' ? 'warning' : 'error',
        message: res.message || 'Falha na autenticação.'
      });
    }
  };

  const handleFirstAccessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!firstAccessEmail) return;

    const res = firstAccessActivate(firstAccessEmail, firstAccessPassword);
    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      setTimeout(() => {
        onClose();
      }, 1200);
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (selectedRole === 'ALUNO') {
      if (!studentReg.name.trim() || !studentReg.email.trim() || !studentReg.phone.trim() || !studentReg.password.trim()) {
        setFeedback({
          type: 'error',
          message: 'Por favor, preencha todos os campos obrigatórios (Nome, E-mail, Telefone e Senha).'
        });
        return;
      }
      const res = registerStudentSelfService(studentReg);
      if (res.success) {
        setFeedback({ type: 'success', message: res.message });
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setFeedback({ type: 'error', message: res.message });
      }
    } else if (selectedRole === 'PROFESSOR') {
      if (!teacherReg.name.trim() || !teacherReg.email.trim() || !teacherReg.phone.trim() || !teacherReg.password.trim()) {
        setFeedback({
          type: 'error',
          message: 'Por favor, preencha todos os campos obrigatórios (Nome, E-mail, Telefone e Senha).'
        });
        return;
      }
      const res = registerTeacherSelfService(teacherReg);
      if (res.success) {
        setFeedback({ type: 'success', message: res.message });
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setFeedback({ type: 'error', message: res.message });
      }
    } else if (selectedRole === 'ADMIN') {
      if (!adminReg.name.trim() || !adminReg.academyName.trim() || !adminReg.email.trim() || !adminReg.phone.trim() || !adminReg.password.trim()) {
        setFeedback({
          type: 'error',
          message: 'Por favor, preencha todos os campos obrigatórios (Nome da Academia, Nome, E-mail, Telefone e Senha).'
        });
        return;
      }
      const res = registerAdminSelfService(adminReg);
      if (res.success) {
        setFeedback({ type: 'success', message: res.message });
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setFeedback({ type: 'error', message: res.message });
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 text-white space-y-6 shadow-2xl relative my-8">
        {/* Close Button if user is logged in */}
        {currentUser && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-300 p-0.5 mx-auto shadow-xl shadow-amber-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-8 h-8" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-100 tracking-tight">
            Portal de Cadastro & Acesso BJJCRON
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            Cadastre-se para acessar como <span className="text-amber-400 font-bold">Mestre / Administrador</span>, <span className="text-blue-400 font-bold">Professor</span> ou <span className="text-emerald-400 font-bold">Aluno</span>.
          </p>
        </div>

        {/* Banner de Gerenciamento da Conta Atual */}
        {currentUser && (
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-amber-400 font-bold shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Logado atualmente como:</p>
                <p className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  {currentUser.name}
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    currentUser.role === 'ADMIN' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                    currentUser.role === 'PROFESSOR' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                    'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {currentUser.role}
                  </span>
                </p>
                <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                const res = deleteMyAccount();
                setFeedback({ type: res.success ? 'success' : 'error', message: res.message });
                setActiveTab('REGISTER');
              }}
              className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md"
              title="Excluir cadastro para recadastrar como outro perfil (Mestre, Professor ou Aluno)"
            >
              <X className="w-4 h-4 text-rose-400" />
              Excluir Conta & Recadastrar
            </button>
          </div>
        )}

        {/* Mode Navigation Tabs */}
        <div className="grid grid-cols-3 p-1 bg-slate-950 rounded-2xl border border-slate-800/80 text-xs font-bold">
          <button
            onClick={() => { setActiveTab('REGISTER'); setFeedback(null); }}
            className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'REGISTER'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            Cadastrar
          </button>

          <button
            onClick={() => { setActiveTab('LOGIN'); setFeedback(null); }}
            className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'LOGIN'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="w-4 h-4" />
            Entrar
          </button>

          <button
            onClick={() => { setActiveTab('FIRST_ACCESS'); setFeedback(null); }}
            className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'FIRST_ACCESS'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            1º Acesso
          </button>
        </div>

        {/* Feedback Alert Box */}
        {feedback && (
          <div
            className={`p-4 rounded-xl text-xs font-semibold flex items-start gap-3 border ${
              feedback.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                : feedback.type === 'warning'
                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <p className="font-bold">
                {feedback.type === 'success' ? 'Sucesso' : feedback.type === 'warning' ? 'Aguardando Liberação' : 'Atenção'}
              </p>
              <p className="text-slate-300 leading-relaxed">{feedback.message}</p>
            </div>
          </div>
        )}

        {/* TAB 1: REGISTRATION */}
        {activeTab === 'REGISTER' && (
          <div className="space-y-5">
            {/* Role Choice Pills */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                Selecione o perfil que deseja cadastrar:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRole('ALUNO')}
                  className={`p-3 rounded-2xl border text-left transition-all flex flex-col items-center justify-center gap-1 text-center ${
                    selectedRole === 'ALUNO'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-lg'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <User className="w-5 h-5 text-emerald-400" />
                  <span className="font-extrabold text-xs">Aluno</span>
                  <span className="text-[10px] opacity-75">Atleta da Equipe</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole('PROFESSOR')}
                  className={`p-3 rounded-2xl border text-left transition-all flex flex-col items-center justify-center gap-1 text-center ${
                    selectedRole === 'PROFESSOR'
                      ? 'bg-blue-500/20 border-blue-500 text-blue-300 shadow-lg'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <GraduationCap className="w-5 h-5 text-blue-400" />
                  <span className="font-extrabold text-xs">Professor</span>
                  <span className="text-[10px] opacity-75">Instrutor de Turma</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole('ADMIN')}
                  className={`p-3 rounded-2xl border text-left transition-all flex flex-col items-center justify-center gap-1 text-center ${
                    selectedRole === 'ADMIN'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-lg'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Crown className="w-5 h-5 text-amber-400" />
                  <span className="font-extrabold text-xs">Mestre / Admin</span>
                  <span className="text-[10px] opacity-75">Gestor / Dono</span>
                </button>
              </div>
            </div>

            {/* FORM FOR ALUNO */}
            {selectedRole === 'ALUNO' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-200">
                  <p className="font-bold flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-emerald-400" />
                    Cadastro de Novo Aluno / Atleta
                  </p>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Preencha seus dados para criar sua conta de aluno.
                  </p>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Digite seu nome completo"
                    value={studentReg.name}
                    onChange={e => setStudentReg({ ...studentReg, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 font-bold block mb-1">E-mail *</label>
                    <input
                      type="email"
                      required
                      placeholder="seu.email@exemplo.com"
                      value={studentReg.email}
                      onChange={e => setStudentReg({ ...studentReg, email: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 font-bold block mb-1">Telefone / WhatsApp *</label>
                    <input
                      type="text"
                      required
                      placeholder="(00) 00000-0000"
                      value={studentReg.phone}
                      onChange={e => setStudentReg({ ...studentReg, phone: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 font-bold block mb-1">Faixa Atual</label>
                    <select
                      value={studentReg.belt}
                      onChange={e => setStudentReg({ ...studentReg, belt: e.target.value as BeltType })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                      <option value="BRANCA">Faixa Branca</option>
                      <option value="AZUL">Faixa Azul</option>
                      <option value="ROXA">Faixa Roxa</option>
                      <option value="MARROM">Faixa Marrom</option>
                      <option value="PRETA">Faixa Preta</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-300 font-bold block mb-1">Crie sua Senha *</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={studentReg.password}
                      onChange={e => setStudentReg({ ...studentReg, password: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <label className="text-amber-400 font-extrabold block text-xs flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-amber-400" />
                    Vincular-se à Academia / Equipe *
                  </label>
                  <select
                    value={studentReg.academyName || availableAcademies[0]?.name}
                    onChange={e => setStudentReg({ ...studentReg, academyName: e.target.value })}
                    className="w-full bg-slate-950 border border-amber-500/50 rounded-xl p-2.5 text-slate-100 font-semibold focus:ring-2 focus:ring-amber-500 outline-none text-xs"
                  >
                    {availableAcademies.map(ac => (
                      <option key={ac.id} value={ac.name}>
                        {ac.name} — Prof. {ac.headCoachName} ({ac.city})
                      </option>
                    ))}
                  </select>

                  {/* Selected Academy Preview Card with Logo & Professor */}
                  {(() => {
                    const selectedAc = availableAcademies.find(
                      a => a.name === (studentReg.academyName || availableAcademies[0]?.name)
                    ) || availableAcademies[0];
                    if (!selectedAc) return null;
                    return (
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/90 border border-slate-800">
                        <img
                          src={selectedAc.logoUrl}
                          alt={selectedAc.name}
                          className="w-10 h-10 rounded-lg object-cover border border-amber-400/80 shrink-0 bg-slate-900"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-100 truncate">{selectedAc.name}</p>
                          <p className="text-[11px] text-amber-400 font-semibold truncate">
                            Mestre / Prof: {selectedAc.headCoachName}
                          </p>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  Cadastrar como Aluno
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* FORM FOR PROFESSOR */}
            {selectedRole === 'PROFESSOR' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-200">
                  <p className="font-bold flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-blue-400" />
                    Cadastro de Professor / Instrutor
                  </p>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Acesso para ministrar turmas, lançar presenças via QR Code e gerenciar alunos.
                  </p>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Nome Completo do Professor *</label>
                  <input
                    type="text"
                    required
                    placeholder="Digite seu nome completo"
                    value={teacherReg.name}
                    onChange={e => setTeacherReg({ ...teacherReg, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 font-bold block mb-1">E-mail *</label>
                    <input
                      type="email"
                      required
                      placeholder="seu.email@exemplo.com"
                      value={teacherReg.email}
                      onChange={e => setTeacherReg({ ...teacherReg, email: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 font-bold block mb-1">Telefone / WhatsApp *</label>
                    <input
                      type="text"
                      required
                      placeholder="(00) 00000-0000"
                      value={teacherReg.phone}
                      onChange={e => setTeacherReg({ ...teacherReg, phone: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 font-bold block mb-1">Graduação / Faixa</label>
                    <select
                      value={teacherReg.belt}
                      onChange={e => setTeacherReg({ ...teacherReg, belt: e.target.value as BeltType })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="PRETA">Faixa Preta</option>
                      <option value="MARROM">Faixa Marrom</option>
                      <option value="ROXA">Faixa Roxa</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-300 font-bold block mb-1">Crie sua Senha *</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={teacherReg.password}
                      onChange={e => setTeacherReg({ ...teacherReg, password: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Especialidade / Estilo (Opcional)</label>
                  <input
                    type="text"
                    placeholder="Ex: Jiu-Jitsu, Gi & No-Gi"
                    value={teacherReg.specialty}
                    onChange={e => setTeacherReg({ ...teacherReg, specialty: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-400 text-slate-950 font-extrabold text-xs shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  Cadastrar como Professor
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* FORM FOR ADMIN / MESTRE */}
            {selectedRole === 'ADMIN' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-200">
                  <p className="font-bold flex items-center gap-1.5">
                    <Crown className="w-4 h-4 text-amber-400" />
                    Cadastro de Mestre / Administrador de Academia
                  </p>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Acesso completo para gestão da sua academia, financeiro, turmas e graduações.
                  </p>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Nome da Sua Academia / Equipe *</label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="Nome da sua academia"
                      value={adminReg.academyName}
                      onChange={e => setAdminReg({ ...adminReg, academyName: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-slate-100 focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Nome do Mestre / Responsável *</label>
                  <input
                    type="text"
                    required
                    placeholder="Digite seu nome completo"
                    value={adminReg.name}
                    onChange={e => setAdminReg({ ...adminReg, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 font-bold block mb-1">E-mail *</label>
                    <input
                      type="email"
                      required
                      placeholder="seu.email@exemplo.com"
                      value={adminReg.email}
                      onChange={e => setAdminReg({ ...adminReg, email: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 font-bold block mb-1">Telefone / WhatsApp *</label>
                    <input
                      type="text"
                      required
                      placeholder="(00) 00000-0000"
                      value={adminReg.phone}
                      onChange={e => setAdminReg({ ...adminReg, phone: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Crie sua Senha de Acesso *</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={adminReg.password}
                    onChange={e => setAdminReg({ ...adminReg, password: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  Criar Conta de Mestre e Entrar
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        )}

        {/* TAB 2: LOGIN WITH PASSWORD */}
        {activeTab === 'LOGIN' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div>
              <label className="text-slate-300 font-bold block mb-1">E-mail Cadastrado</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="seu.email@exemplo.com"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-slate-100 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">Senha de Acesso</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-slate-100 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2"
            >
              Entrar na Plataforma
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* TAB 3: FIRST ACCESS */}
        {activeTab === 'FIRST_ACCESS' && (
          <form onSubmit={handleFirstAccessSubmit} className="space-y-4 text-xs">
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-200 space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-xs">
                Primeiro Acesso & Ativação de Conta
              </p>
              <p className="text-[11px] text-slate-300">
                Informe seu e-mail e crie sua senha de acesso. Sua conta será ativada instantaneamente para você entrar na plataforma!
              </p>
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">E-mail Cadastrado *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="seu.email@exemplo.com"
                  value={firstAccessEmail}
                  onChange={e => setFirstAccessEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-slate-100 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">Crie sua Senha *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="Digite sua senha"
                  value={firstAccessPassword}
                  onChange={e => setFirstAccessPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-slate-100 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2"
            >
              Ativar Minha Conta & Entrar
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
