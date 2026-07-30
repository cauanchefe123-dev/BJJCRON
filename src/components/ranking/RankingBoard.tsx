import React from 'react';
import { useData } from '../../context/DataContext';
import { BeltBadge } from '../belts/BeltBadge';
import { getStudentAvatar } from '../../constants/avatar';
import { Trophy, Award, Flame, Medal, Sparkles, Star } from 'lucide-react';

export const RankingBoard: React.FC = () => {
  const { students, attendances } = useData();

  // Calculate attendances count per student for current month
  const studentRanking = students
    .map(s => {
      const count = attendances.filter(a => a.studentId === s.id).length;
      return {
        student: s,
        count,
      };
    })
    .sort((a, b) => b.count - a.count || b.student.totalClassesAttended - a.student.totalClassesAttended);

  const topThree = studentRanking.slice(0, 3);
  const remaining = studentRanking.slice(3);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-neutral-900 border border-amber-500/40 rounded-2xl p-6 text-white text-center space-y-2 shadow-xl">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mx-auto">
          <Trophy className="w-6 h-6 animate-pulse" />
        </div>
        <h3 className="text-2xl font-black text-slate-100">
          Hall da Fama & Ranking de Frequência
        </h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Reconhecimento aos atletas que mais suaram o kimono no tatame este mês.
        </p>
      </div>

      {/* Podium Top 3 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
        {/* 2nd Place */}
        {topThree[1] && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white flex flex-col items-center text-center space-y-3 relative order-2 sm:order-1">
            <span className="w-8 h-8 rounded-full bg-slate-300 text-slate-950 font-black text-xs flex items-center justify-center border-2 border-slate-400 shadow-md">
              2º
            </span>
            <img src={getStudentAvatar(topThree[1].student)} alt={topThree[1].student.name} className="w-16 h-16 rounded-full object-cover border-2 border-slate-400 bg-slate-900" />
            <div>
              <h4 className="font-bold text-sm text-slate-100">{topThree[1].student.name}</h4>
              <p className="text-[10px] text-slate-400 font-mono">{topThree[1].student.registrationNumber}</p>
            </div>
            <BeltBadge belt={topThree[1].student.belt} stripes={topThree[1].student.stripes} size="sm" showLabel={false} />
            <div className="pt-2 border-t border-slate-800 w-full">
              <span className="text-lg font-black text-amber-400">{topThree[1].count} treinos</span>
            </div>
          </div>
        )}

        {/* 1st Place (Champion) */}
        {topThree[0] && (
          <div className="bg-gradient-to-b from-amber-950/80 via-slate-900 to-slate-950 border-2 border-amber-500 rounded-2xl p-6 text-white flex flex-col items-center text-center space-y-3 relative order-1 sm:order-2 shadow-2xl transform sm:-translate-y-2">
            <span className="w-10 h-10 rounded-full bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center border-2 border-amber-300 shadow-lg animate-bounce">
              👑 1º
            </span>
            <img src={getStudentAvatar(topThree[0].student)} alt={topThree[0].student.name} className="w-20 h-20 rounded-full object-cover border-2 border-amber-400 shadow-lg bg-slate-900" />
            <div>
              <h4 className="font-black text-base text-amber-300">{topThree[0].student.name}</h4>
              <p className="text-[10px] text-amber-400/80 font-mono">Guerreiro do Mês</p>
            </div>
            <BeltBadge belt={topThree[0].student.belt} stripes={topThree[0].student.stripes} size="md" showLabel={false} />
            <div className="pt-2 border-t border-amber-500/30 w-full">
              <span className="text-2xl font-black text-amber-400">{topThree[0].count} treinos</span>
            </div>
          </div>
        )}

        {/* 3rd Place */}
        {topThree[2] && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white flex flex-col items-center text-center space-y-3 relative order-3">
            <span className="w-8 h-8 rounded-full bg-amber-700 text-amber-100 font-black text-xs flex items-center justify-center border-2 border-amber-800 shadow-md">
              3º
            </span>
            <img src={getStudentAvatar(topThree[2].student)} alt={topThree[2].student.name} className="w-16 h-16 rounded-full object-cover border-2 border-amber-700 bg-slate-900" />
            <div>
              <h4 className="font-bold text-sm text-slate-100">{topThree[2].student.name}</h4>
              <p className="text-[10px] text-slate-400 font-mono">{topThree[2].student.registrationNumber}</p>
            </div>
            <BeltBadge belt={topThree[2].student.belt} stripes={topThree[2].student.stripes} size="sm" showLabel={false} />
            <div className="pt-2 border-t border-slate-800 w-full">
              <span className="text-lg font-black text-amber-400">{topThree[2].count} treinos</span>
            </div>
          </div>
        )}
      </div>

      {/* Remaining Leaderboard */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white space-y-4 shadow-xl">
        <h4 className="font-bold text-sm text-slate-300 uppercase tracking-wider">
          Classificação Geral
        </h4>

        <div className="space-y-2">
          {remaining.map((item, index) => (
            <div
              key={item.student.id}
              className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-500 w-6 text-center">
                  #{index + 4}
                </span>
                <img src={getStudentAvatar(item.student)} alt={item.student.name} className="w-8 h-8 rounded-full object-cover bg-slate-900" />
                <div>
                  <p className="font-bold text-slate-200">{item.student.name}</p>
                  <BeltBadge belt={item.student.belt} stripes={item.student.stripes} size="sm" showLabel={false} />
                </div>
              </div>

              <div className="text-right">
                <span className="font-bold text-amber-400 block">{item.count} treinos</span>
                <span className="text-[10px] text-slate-500">{item.student.totalClassesAttended} total</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
