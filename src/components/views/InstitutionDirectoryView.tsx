'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { Institution } from '@/lib/types';
import { formatINR } from '@/lib/utils';
import { 
  Building2, 
  Search, 
  MapPin, 
  Mail, 
  Phone, 
  ShieldCheck, 
  FileText, 
  ExternalLink,
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface InstitutionDirectoryViewProps {
  onSelectInstitutionFdrs: (instId: string) => void;
}

export const InstitutionDirectoryView: React.FC<InstitutionDirectoryViewProps> = ({
  onSelectInstitutionFdrs
}) => {
  const { institutions, fdrs } = useApp();

  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');

  const filtered = institutions.filter(inst => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = inst.name.toLowerCase().includes(q);
      const matchCode = inst.code.toLowerCase().includes(q);
      const matchCity = inst.city.toLowerCase().includes(q);
      if (!matchName && !matchCode && !matchCity) return false;
    }
    if (selectedType !== 'ALL' && inst.type !== selectedType) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-bold text-slate-100">Technical Institutions Directory</h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
              {filtered.length} Approved Institutes
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Browse institutional profiles, regional distribution, and associated security deposit portfolios.
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search institute name, code, or city..."
              className="bg-slate-800 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-500 w-56 sm:w-64"
            />
          </div>

          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          >
            <option value="ALL">All Disciplines</option>
            <option value="ENGINEERING">Engineering</option>
            <option value="MANAGEMENT">Management</option>
            <option value="POLYTECHNIC">Polytechnic</option>
            <option value="ARCHITECTURE">Architecture</option>
          </select>
        </div>
      </div>

      {/* Institution Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(inst => {
          const instFdrs = fdrs.filter(f => f.institutionId === inst.id);
          const totalVal = instFdrs.reduce((a, b) => a + b.principalAmount, 0);

          return (
            <div 
              key={inst.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-sm transition-all hover:translate-y-[-2px] flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                    AICTE: {inst.code}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                    inst.status === 'ACTIVE' 
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-800' 
                      : 'bg-amber-950 text-amber-300 border-amber-800'
                  }`}>
                    {inst.status === 'ACTIVE' ? 'Compliant' : 'Scrutiny Required'}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-100 mt-2.5 group-hover:text-cyan-400 transition-colors leading-snug">
                  {inst.name}
                </h3>

                <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>{inst.city}, {inst.state}</span>
                </div>

                <div className="mt-3.5 p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Secured Deposit Capital:</span>
                    <span className="font-mono font-bold text-cyan-400">{formatINR(totalVal, true)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Active Instruments:</span>
                    <span className="font-mono text-slate-300 font-semibold">{instFdrs.length} FDRs</span>
                  </div>
                </div>

                <div className="mt-3 space-y-1 text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3 h-3 text-slate-500" />
                    <span className="truncate">{inst.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-slate-500" />
                    <span>{inst.phone}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800">
                <button
                  onClick={() => onSelectInstitutionFdrs(inst.id)}
                  className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-cyan-400" />
                  <span>View Institutional FDR Portfolio ({instFdrs.length})</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
