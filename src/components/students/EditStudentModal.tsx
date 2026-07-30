import React, { useState, useEffect } from 'react';
import { Student, BeltType, AgeCategory, WeightCategory } from '../../types';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { DEFAULT_BLACK_GI_AVATAR, getStudentAvatar, getGiAvatarForBelt } from '../../constants/avatar';
import { BeltBadge } from '../belts/BeltBadge';
import {
  X,
  Save,
  User,
  Mail,
  Phone,
  Calendar,
  Award,
  DollarSign,
  ShieldAlert,
  Upload,
  CheckCircle2,
  FileText,
  Clock,
  Check,
  AlertCircle,
  Send,
  Building2
} from 'lucide-react';
import { getStoredAcademiesList } from '../academies/AcademyLinkView';

interface EditStudentModalProps {
  isOpen: boolean;
  student: Student | null;
  onClose: () => void;
}

export const EditStudentModal: React.FC<EditStudentModalProps> = ({
  isOpen,
  student,
  onClose,
}) => {
  const { currentUser } = useAuth();
  const { updateStudent, beltRequests, requestBeltChange, approveBeltChange, rejectBeltChange } = useData();
  const availableAcademies = getStoredAcademiesList();

  const [formData, setFormData] = useState<Partial<Student>>({});
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [linkedAcademyName, setLinkedAcademyName] = useState<string>(availableAcademies[0]?.name || '');

  // Student request belt change state
  const [reqBelt, setReqBelt] = useState<BeltType>('AZUL');
  const [reqStripes, setReqStripes] = useState<number>(0);
  const [reqNotes, setReqNotes] = useState<string>('');
  const [reqSuccess, setReqSuccess] = useState<string | null>(null);
  const [reqError, setReqError] = useState<string | null>(null);

  const isStudentUser = currentUser?.role === 'ALUNO';

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name,
        email: student.email,
        phone: student.phone,
        cpf: student.cpf || '',
        birthDate: student.birthDate || '',
        photoUrl: student.photoUrl || '',
        belt: student.belt,
        stripes: student.stripes,
        ageCategory: student.ageCategory,
        weightCategory: student.weightCategory,
        planName: student.planName,
        planPrice: student.planPrice,
        paymentDueDateDay: student.paymentDueDateDay,
        emergencyContact: student.emergencyContact || '',
        active: student.active,
        notes: student.notes || '',
      });
      setReqBelt(student.belt);
      setReqStripes(student.stripes < 4 ? student.stripes + 1 : 0);
      setReqSuccess(null);
      setReqError(null);
    }
  }, [student]);

  if (!isOpen || !student) return null;

  const pendingRequest = beltRequests.find(
    r => r.studentId === student.id && r.status === 'PENDING'
  );

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendBeltRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!student.id) return;

    const res = requestBeltChange(student.id, reqBelt, reqStripes, reqNotes);
    if (res.success) {
      setReqSuccess(res.message);
      setReqError(null);
      setReqNotes('');
    } else {
      setReqError(res.message);
      setReqSuccess(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!student.id) return;

    // If user is ALUNO, do not overwrite belt or stripes directly from profile edit
    const dataToSave = { ...formData };
    if (isStudentUser) {
      delete dataToSave.belt;
      delete dataToSave.stripes;
    }

    updateStudent(student.id, dataToSave);
    setSuccessMsg('Cadastro atualizado com sucesso!');
    setTimeout(() => {
      setSuccessMsg(null);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 text-white space-y-6 shadow-2xl relative my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-100">Atualizar Cadastro de Aluno</h3>
              <p className="text-xs text-slate-400">Matrícula: {student.registrationNumber}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Cadastro atualizado com sucesso!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Photo Preview & File Upload */}
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
            <img
              src={getStudentAvatar({ photoUrl: formData.photoUrl, belt: formData.belt, stripes: formData.stripes })}
              alt="Foto do Aluno"
              className="w-16 h-16 rounded-full object-cover border-2 border-amber-500/50 shadow-md bg-slate-900"
            />
            <div className="flex-1 space-y-2 text-center sm:text-left w-full">
              <div className="flex items-center justify-between gap-2">
                <label className="text-slate-300 font-bold block">Foto do Perfil / Atleta</label>
                {formData.photoUrl && !formData.photoUrl.startsWith('data:image/svg+xml') && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, photoUrl: '' })}
                    className="text-[11px] text-amber-400 hover:underline font-semibold"
                  >
                    Usar Avatar com Faixa ({formData.belt || 'Faixa'})
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <label className="cursor-pointer px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-bold flex items-center gap-1.5 transition-all text-xs">
                  <Upload className="w-3.5 h-3.5 text-amber-400" />
                  Enviar Foto Pessoal
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
                <input
                  type="url"
                  placeholder="Ou cole a URL da sua foto..."
                  value={formData.photoUrl && !formData.photoUrl.startsWith('data:image/svg+xml') ? formData.photoUrl : ''}
                  onChange={e => setFormData({ ...formData, photoUrl: e.target.value })}
                  className="flex-1 min-w-[200px] bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
              <p className="text-[10px] text-slate-400">
                Você pode enviar uma foto pessoal do seu computador/celular ou usar o boneco de kimono com a faixa oficial ({formData.belt || 'Branca'}).
              </p>
            </div>
          </div>

          {/* Personal Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-bold block mb-1">Nome Completo *</label>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">E-mail *</label>
              <input
                type="email"
                required
                value={formData.email || ''}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">Telefone / WhatsApp *</label>
              <input
                type="text"
                required
                value={formData.phone || ''}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">CPF</label>
              <input
                type="text"
                placeholder="000.000.000-00"
                value={formData.cpf || ''}
                onChange={e => setFormData({ ...formData, cpf: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">Data de Nascimento</label>
              <input
                type="date"
                value={formData.birthDate || ''}
                onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">Contato de Emergência</label>
              <input
                type="text"
                placeholder="Nome e telefone de familiar"
                value={formData.emergencyContact || ''}
                onChange={e => setFormData({ ...formData, emergencyContact: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>
          </div>

          {/* Vínculo à Academia / Equipe */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <label className="text-amber-400 font-extrabold block text-xs flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-amber-400" />
              Vincular-se à Academia / Equipe *
            </label>
            <select
              value={linkedAcademyName || availableAcademies[0]?.name}
              onChange={e => {
                const newName = e.target.value;
                setLinkedAcademyName(newName);
                if (student) {
                  localStorage.setItem(`bjjcron_student_academy_name_${student.id}`, newName);
                }
              }}
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
                a => a.name === (linkedAcademyName || availableAcademies[0]?.name)
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

          {/* Belt & Categories Section */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            {isStudentUser ? (
              /* STUDENT VIEW: Read-only current belt + Request Belt Change form */
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Sua Faixa Atual:</span>
                    <h4 className="font-extrabold text-sm text-slate-100">{formData.name}</h4>
                    <p className="text-[10px] text-amber-400 font-semibold mt-0.5">
                      Para mudar de faixa ou graus, envie uma solicitação para aprovação do Mestre.
                    </p>
                  </div>
                  <BeltBadge belt={student.belt} stripes={student.stripes} size="md" />
                </div>

                {pendingRequest ? (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-amber-400 flex items-center gap-1.5 text-xs">
                        <Clock className="w-4 h-4" />
                        Solicitação de Troca de Faixa em Análise
                      </span>
                      <span className="text-[10px] text-amber-300 font-semibold">Data: {pendingRequest.requestDate}</span>
                    </div>
                    <p className="text-xs text-slate-200">
                      Você solicitou a alteração para: <strong className="text-amber-300 font-black">{pendingRequest.requestedBelt} ({pendingRequest.requestedStripes}º Grau)</strong>.
                    </p>
                    {pendingRequest.notes && (
                      <p className="text-[11px] text-slate-300 italic bg-slate-950/80 p-2 rounded-xl border border-slate-800">
                        "{pendingRequest.notes}"
                      </p>
                    )}
                    <p className="text-[10px] text-slate-400">Aguardando avaliação e assinatura do Professor no tatame.</p>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <h4 className="font-extrabold text-xs text-amber-400 flex items-center gap-1.5">
                        <Award className="w-4 h-4" />
                        Solicitar Troca de Faixa / Graus ao Professor
                      </h4>
                      <span className="text-[10px] text-slate-400">Sua alteração requer aprovação do Mestre</span>
                    </div>

                    {reqSuccess && (
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        {reqSuccess}
                      </div>
                    )}
                    {reqError && (
                      <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-400" />
                        {reqError}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-slate-300 font-bold block mb-1">Nova Faixa Solicitada</label>
                        <select
                          value={reqBelt}
                          onChange={e => setReqBelt(e.target.value as BeltType)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-bold outline-none focus:ring-2 focus:ring-amber-500"
                        >
                          <option value="BRANCA">Faixa Branca</option>
                          <option value="CINZA">Faixa Cinza</option>
                          <option value="AMARELA">Faixa Amarela</option>
                          <option value="VERDE">Faixa Verde</option>
                          <option value="AZUL">Faixa Azul</option>
                          <option value="ROXA">Faixa Roxa</option>
                          <option value="MARROM">Faixa Marrom</option>
                          <option value="PRETA">Faixa Preta</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-slate-300 font-bold block mb-1">Novos Graus (0-4)</label>
                        <select
                          value={reqStripes}
                          onChange={e => setReqStripes(Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-bold outline-none focus:ring-2 focus:ring-amber-500"
                        >
                          <option value={0}>0 Graus</option>
                          <option value={1}>1 Grau</option>
                          <option value={2}>2 Graus</option>
                          <option value={3}>3 Graus</option>
                          <option value={4}>4 Graus</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-slate-300 font-bold block mb-1">Mensagem / Observação para o Professor</label>
                      <textarea
                        rows={2}
                        placeholder="Ex: Completei o tempo mínimo e quantidade de treinos exigidos para a graduação..."
                        value={reqNotes}
                        onChange={e => setReqNotes(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none focus:ring-2 focus:ring-amber-500 text-xs resize-none"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleSendBeltRequest}
                      className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold flex items-center justify-center gap-2 shadow-md transition-all text-xs"
                    >
                      <Send className="w-4 h-4" />
                      Enviar Solicitação de Troca ao Professor
                    </button>
                  </div>
                )}

                {/* Weight Category */}
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Categoria de Peso</label>
                  <select
                    value={formData.weightCategory || 'MÉDIO'}
                    onChange={e => setFormData({ ...formData, weightCategory: e.target.value as WeightCategory })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:ring-2 focus:ring-amber-500 outline-none"
                  >
                    <option value="GALO">Galo</option>
                    <option value="PLUMA">Pluma</option>
                    <option value="PENA">Pena</option>
                    <option value="LEVE">Leve</option>
                    <option value="MÉDIO">Médio</option>
                    <option value="MEIO-PESADO">Meio-Pesado</option>
                    <option value="PESADO">Pesado</option>
                    <option value="SUPER-PESADO">Super-Pesado</option>
                    <option value="PESADÍSSIMO">Pesadíssimo</option>
                    <option value="ABSOLUTO">Absoluto</option>
                  </select>
                </div>
              </div>
            ) : (
              /* PROFESSOR / ADMIN VIEW: Can review pending request + direct edit belt */
              <div className="space-y-4">
                {pendingRequest && (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border-2 border-amber-500/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-amber-400 flex items-center gap-1.5 text-xs">
                        <Award className="w-4 h-4" />
                        Solicitação de Troca de Faixa Pendente do Aluno
                      </span>
                      <span className="text-[10px] text-amber-300 font-bold">{pendingRequest.requestDate}</span>
                    </div>
                    <p className="text-xs text-slate-200">
                      O aluno solicitou alteração de faixa para: <strong className="text-amber-300 font-black">{pendingRequest.requestedBelt} ({pendingRequest.requestedStripes}º Grau)</strong>
                    </p>
                    {pendingRequest.notes && (
                      <p className="text-[11px] text-slate-300 italic bg-slate-950/90 p-2.5 rounded-xl border border-slate-800">
                        "{pendingRequest.notes}"
                      </p>
                    )}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => approveBeltChange(pendingRequest.id, currentUser?.name || 'Professor')}
                        className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all"
                      >
                        <Check className="w-4 h-4" />
                        Aprovar Troca de Faixa
                      </button>
                      <button
                        type="button"
                        onClick={() => rejectBeltChange(pendingRequest.id, currentUser?.name || 'Professor')}
                        className="py-2.5 px-4 rounded-xl bg-rose-600/80 hover:bg-rose-500 text-white font-extrabold text-xs transition-all"
                      >
                        Rejeitar
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-slate-300 font-bold block mb-1">Faixa Atual (Professor)</label>
                    <select
                      value={formData.belt || 'BRANCA'}
                      onChange={e => setFormData({ ...formData, belt: e.target.value as BeltType })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:ring-2 focus:ring-amber-500 outline-none font-bold"
                    >
                      <option value="BRANCA">Faixa Branca</option>
                      <option value="CINZA">Faixa Cinza</option>
                      <option value="AMARELA">Faixa Amarela</option>
                      <option value="VERDE">Faixa Verde</option>
                      <option value="AZUL">Faixa Azul</option>
                      <option value="ROXA">Faixa Roxa</option>
                      <option value="MARROM">Faixa Marrom</option>
                      <option value="PRETA">Faixa Preta</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-300 font-bold block mb-1">Graus na Faixa</label>
                    <select
                      value={formData.stripes ?? 0}
                      onChange={e => setFormData({ ...formData, stripes: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:ring-2 focus:ring-amber-500 outline-none font-bold"
                    >
                      <option value={0}>0 Graus</option>
                      <option value={1}>1 Grau</option>
                      <option value={2}>2 Graus</option>
                      <option value={3}>3 Graus</option>
                      <option value={4}>4 Graus</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-300 font-bold block mb-1">Categoria Peso</label>
                    <select
                      value={formData.weightCategory || 'MÉDIO'}
                      onChange={e => setFormData({ ...formData, weightCategory: e.target.value as WeightCategory })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:ring-2 focus:ring-amber-500 outline-none"
                    >
                      <option value="GALO">Galo</option>
                      <option value="PLUMA">Pluma</option>
                      <option value="PENA">Pena</option>
                      <option value="LEVE">Leve</option>
                      <option value="MÉDIO">Médio</option>
                      <option value="MEIO-PESADO">Meio-Pesado</option>
                      <option value="PESADO">Pesado</option>
                      <option value="SUPER-PESADO">Super-Pesado</option>
                      <option value="PESADÍSSIMO">Pesadíssimo</option>
                      <option value="ABSOLUTO">Absoluto</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Plan & Payment Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800">
            <div>
              <label className="text-slate-300 font-bold block mb-1">Plano da Academia</label>
              <input
                type="text"
                value={formData.planName || ''}
                onChange={e => setFormData({ ...formData, planName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">Valor da Mensalidade (R$)</label>
              <input
                type="number"
                value={formData.planPrice ?? 150}
                onChange={e => setFormData({ ...formData, planPrice: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">Dia do Vencimento</label>
              <input
                type="number"
                min={1}
                max={28}
                value={formData.paymentDueDateDay ?? 10}
                onChange={e => setFormData({ ...formData, paymentDueDateDay: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-300 font-bold block mb-1">Observações / Histórico de Saúde</label>
            <textarea
              rows={2}
              placeholder="Anotações internas do atleta..."
              value={formData.notes || ''}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:ring-2 focus:ring-amber-500 outline-none resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold shadow-lg flex items-center gap-2 transition-all"
            >
              <Save className="w-4 h-4" />
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
