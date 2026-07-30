import React from 'react';
import { useData } from '../../context/DataContext';
import { FileBarChart2, Users, CreditCard, Award, TrendingUp, Calendar, Download } from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { students, payments, attendances, graduations } = useData();

  const totalRevenue = payments.filter(p => p.status === 'PAGO').reduce((acc, p) => acc + p.amount, 0);
  const totalAtt = attendances.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl">
        <div>
          <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <FileBarChart2 className="w-5 h-5 text-amber-400" />
            Relatórios & Desempenho da Academia
          </h3>
          <p className="text-xs text-slate-400">
            Relatório impresso de retenção, receita, graduação e assiduidade.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700"
        >
          <Download className="w-4 h-4 text-amber-400" />
          Exportar Relatório PDF
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Attendance Summary */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white space-y-4">
          <h4 className="font-bold text-sm text-slate-200 border-b border-slate-800 pb-2">
            Relatório de Assiduidade e Treinos
          </h4>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Total de Presenças Registradas:</span>
              <span className="font-bold text-amber-400">{totalAtt} treinos</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Média de Alunos por Aula:</span>
              <span className="font-bold text-slate-200">18 atletas</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Turma Mais Movimentada:</span>
              <span className="font-bold text-emerald-400">Jiu-Jitsu Avançado 12:00</span>
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white space-y-4">
          <h4 className="font-bold text-sm text-slate-200 border-b border-slate-800 pb-2">
            Relatório de Faturamento das Mensalidades
          </h4>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Total Arrecadado:</span>
              <span className="font-bold text-emerald-400">R$ {totalRevenue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Taxa de Adimplência:</span>
              <span className="font-bold text-blue-400">88%</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Método de Pagamento Preferido:</span>
              <span className="font-bold text-slate-200">PIX (72%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
