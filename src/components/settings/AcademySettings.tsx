import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { BeltType } from '../../types';
import { Settings, Save, RefreshCw, Database, Shield, CheckCircle2, AlertCircle, Upload, Image as ImageIcon, Sparkles } from 'lucide-react';

const LOGO_PRESETS = [
  {
    name: 'BJJ Shield Gold',
    url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=300',
  },
  {
    name: 'Jiu-Jitsu Crest',
    url: 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?auto=format&fit=crop&q=80&w=300',
  },
  {
    name: 'Black Belt Team',
    url: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&q=80&w=300',
  },
  {
    name: 'Tatame Lion',
    url: 'https://images.unsplash.com/photo-1564410267841-915d8e4d71ea?auto=format&fit=crop&q=80&w=300',
  },
];

export const AcademySettings: React.FC = () => {
  const { academyConfig, updateAcademyConfig, resetToDefaultData } = useData();

  const [formData, setFormData] = useState({
    name: academyConfig.name,
    fantasyName: academyConfig.fantasyName,
    cnpj: academyConfig.cnpj,
    headCoachName: academyConfig.headCoachName,
    phone: academyConfig.phone,
    email: academyConfig.email,
    address: academyConfig.address,
    pixKey: academyConfig.pixKey,
    logoUrl: academyConfig.logoUrl || '',
    supabaseUrl: academyConfig.supabaseConfig?.url || '',
    supabaseAnonKey: academyConfig.supabaseConfig?.anonKey || '',
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, logoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateAcademyConfig({
      name: formData.name,
      fantasyName: formData.fantasyName,
      cnpj: formData.cnpj,
      headCoachName: formData.headCoachName,
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
      pixKey: formData.pixKey,
      logoUrl: formData.logoUrl,
      supabaseConfig: {
        url: formData.supabaseUrl,
        anonKey: formData.supabaseAnonKey,
        connected: Boolean(formData.supabaseUrl && formData.supabaseAnonKey),
      },
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white flex items-center justify-between shadow-xl">
        <div>
          <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-400" />
            Configurações do BJJCRON & Supabase
          </h3>
          <p className="text-xs text-slate-400">
            Dados da academia, chave PIX, critérios de graduação e banco de dados.
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          Configurações salvas com sucesso!
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSave} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white space-y-6 text-xs shadow-lg">
        {/* Academy Logo Section */}
        <div className="space-y-4 border-b border-slate-800 pb-6">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-amber-400 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-amber-400" />
              Logo Oficial da Academia / Equipe
            </h4>
            <span className="text-[10px] text-slate-400">
              Exibido na barra lateral, carteirinhas e comprovantes
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
            {/* Logo Preview Box */}
            <div className="relative group shrink-0">
              <div className="w-24 h-24 rounded-2xl bg-slate-900 border-2 border-amber-500/60 p-1 flex items-center justify-center overflow-hidden shadow-xl">
                {formData.logoUrl ? (
                  <img
                    src={formData.logoUrl}
                    alt="Logo da Academia"
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <div className="text-center p-2">
                    <Shield className="w-8 h-8 text-amber-400 mx-auto mb-1" />
                    <span className="text-[9px] font-bold text-slate-400 block">Sem Logo</span>
                  </div>
                )}
              </div>
              {formData.logoUrl && (
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, logoUrl: '' })}
                  className="absolute -top-2 -right-2 p-1 rounded-full bg-rose-600 text-white text-[10px] shadow-md hover:bg-rose-500 transition-all"
                  title="Remover Logo"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Upload Options */}
            <div className="flex-1 space-y-3 w-full">
              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">
                  1. Enviar arquivo do computador ou celular:
                </label>
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-md transition-all">
                  <Upload className="w-4 h-4" />
                  Upload da Logomarca (PNG / JPG / WebP)
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">
                  2. Ou insira a URL da Imagem da Logo:
                </label>
                <input
                  type="url"
                  placeholder="https://sua-academia.com/logo.png"
                  value={formData.logoUrl}
                  onChange={e => setFormData({ ...formData, logoUrl: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              {/* Logo Presets */}
              <div className="space-y-1">
                <label className="text-slate-400 text-[11px] font-semibold block flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  Modelos de Escudos Pré-definidos:
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {LOGO_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFormData({ ...formData, logoUrl: preset.url })}
                      className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 rounded-lg text-[10px] text-slate-300 transition-all"
                    >
                      <img src={preset.url} alt="" className="w-3.5 h-3.5 rounded object-cover" />
                      <span>{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Academy Info */}
        <div className="space-y-4">
          <h4 className="font-bold text-sm text-amber-400 border-b border-slate-800 pb-2">
            Dados Gerais da Academia
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-300 font-bold block mb-1">Razão Social / Nome Oficial</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">Nome Fantasia do Tatame</label>
              <input
                type="text"
                value={formData.fantasyName}
                onChange={e => setFormData({ ...formData, fantasyName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">Mestre / Head Coach Responsável</label>
              <input
                type="text"
                value={formData.headCoachName}
                onChange={e => setFormData({ ...formData, headCoachName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">Chave PIX Oficial para Mensalidades</label>
              <input
                type="text"
                value={formData.pixKey}
                onChange={e => setFormData({ ...formData, pixKey: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">Telefone / WhatsApp Contato</label>
              <input
                type="text"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">Endereço da Academia</label>
              <input
                type="text"
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Supabase Integration Box */}
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" />
            <h4 className="font-bold text-sm text-emerald-400">
              Conexão Supabase DB (Opcional)
            </h4>
          </div>
          <p className="text-slate-400 text-[11px]">
            O BJJCRON utiliza armazenamento persistente local (`localStorage`). Se desejar conectar a um projeto Supabase real, insira suas credenciais abaixo:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-300 font-bold block mb-1">Supabase Project URL</label>
              <input
                type="text"
                placeholder="https://xyzcompany.supabase.co"
                value={formData.supabaseUrl}
                onChange={e => setFormData({ ...formData, supabaseUrl: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
              />
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">Supabase Anon Key</label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                value={formData.supabaseAnonKey}
                onChange={e => setFormData({ ...formData, supabaseAnonKey: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={() => {
              if (confirm('Deseja restaurar todos os dados iniciais do sistema BJJCRON?')) {
                resetToDefaultData();
                alert('Dados restaurados com sucesso!');
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/40 text-xs font-bold"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Restaurar Dados Padrão de Teste
          </button>

          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md"
          >
            <Save className="w-4 h-4" />
            Salvar Configurações
          </button>
        </div>
      </form>
    </div>
  );
};
