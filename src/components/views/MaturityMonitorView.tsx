'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { FdrRecord } from '@/lib/types';
import { formatINR, formatDate, getMaturityBadgeStyle, filterFdrsByPermission } from '@/lib/utils';
import { 
  Clock, 
  AlertTriangle, 
  FastForward, 
  CheckCircle2, 
  Calendar, 
  RefreshCw, 
  CornerDownRight, 
  Building, 
  ShieldAlert,
  ArrowRight,
  TrendingDown
} from 'lucide-react';
import { MaturityTimeline3D } from '@/components/3d/MaturityTimeline3D';

interface MaturityMonitorViewProps {
  onSelectFdr: (fdrId: string) => void;
  onOpenRenewalModal: (fdr: FdrRecord) => void;
  onOpenReleaseModal: (fdr: FdrRecord) => void;
}

export const MaturityMonitorView: React.FC<MaturityMonitorViewProps> = ({
  onSelectFdr,
  onOpenRenewalModal,
  onOpenReleaseModal
}) => {
  const { currentUser, fdrs, simulatedDate, advanceSimulationDays } = useApp();

  const [activeBand, setActiveBand] = useState<'ALL' | '7_DAYS' | '30_DAYS' | '60_90_DAYS' | 'MATURED'>('ALL');

  const userFdrs = filterFdrsByPermission(fdrs, currentUser);

  // Categorize FDRs into maturity buckets
  const maturedList = userFdrs.filter(f => f.daysUntilMaturity <= 0 || f.lifecycleStatus === 'MATURED_NEEDS_REVIEW');
  const urgent7Days = userFdrs.filter(f => f.daysUntilMaturity > 0 && f.daysUntilMaturity <= 7 && f.lifecycleStatus === 'ACTIVE');
  const upcoming30Days = userFdrs.filter(f => f.daysUntilMaturity > 7 && f.daysUntilMaturity <= 30 && f.lifecycleStatus === 'ACTIVE');
  const horizon6090Days = userFdrs.filter(f => f.daysUntilMaturity > 30 && f.daysUntilMaturity <= 90 && f.lifecycleStatus === 'ACTIVE');
  const safeFuture = userFdrs.filter(f => f.daysUntilMaturity > 90);

  // Filtered view based on selected band
  const displayedList = activeBand === '7_DAYS' 
    ? urgent7Days 
    : activeBand === '30_DAYS' 
    ? upcoming30Days 
    : activeBand === '60_90_DAYS' 
    ? horizon6090Days 
    : activeBand === 'MATURED' 
    ? maturedList 
    : [...urgent7Days, ...upcoming30Days, ...maturedList, ...horizon6090Days, ...safeFuture];

  // Total capital maturing within 30 days
  const capitalIn30Days = [...urgent7Days, ...upcoming30Days].reduce((a, b) => a + b.principalAmount, 0);
  const capitalMatured = maturedList.reduce((a, b) => a + b.principalAmount, 0);

  return (
    <div className="space-y-6">
      {/* 3D Maturity Timeline Hero */}
      <MaturityTimeline3D
        urgentCount={urgent7Days.length}
        expiring30={upcoming30Days.length}
        activeCount={userFdrs.filter(f => f.lifecycleStatus === 'ACTIVE').length}
      />

      {/* Title & Interactive Simulation Time Machine */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              <h1 className="text-xl font-bold text-slate-100">Automated Maturity Monitoring Engine</h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800">
                Rule Engine Active
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Deterministic date-based tracking with automated notifications configured at 30, 15, 7, and 0 days prior to maturity.
            </p>
          </div>

          {/* Time Machine Quick Controller for Demonstrations */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-700/80 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-300">
              <FastForward className="w-4 h-4 text-amber-400" />
              <span>Simulated Clock:</span>
              <span className="font-mono font-bold text-cyan-400 bg-slate-800 px-2 py-0.5 rounded">
                {simulatedDate}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => advanceSimulationDays(7)}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 hover:text-white transition-all"
                title="Fast forward simulated time by 7 days"
              >
                +7 Days
              </button>
              <button
                onClick={() => advanceSimulationDays(15)}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 hover:text-white transition-all"
                title="Fast forward simulated time by 15 days"
              >
                +15 Days
              </button>
              <button
                onClick={() => advanceSimulationDays(30)}
                className="px-2.5 py-1 rounded bg-amber-900/40 hover:bg-amber-900/60 text-amber-300 text-xs font-medium border border-amber-800 transition-all"
                title="Advance by 30 days to trigger maturity events"
              >
                +30 Days
              </button>
            </div>
          </div>
        </div>

        {/* Aggregate Maturity Capital Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2 border-t border-slate-800">
          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <span className="text-[11px] text-slate-400">Capital Maturing ≤ 30 Days</span>
            <p className="text-xl font-bold font-mono text-amber-400 mt-1">{formatINR(capitalIn30Days)}</p>
            <span className="text-[10px] text-slate-500">{urgent7Days.length + upcoming30Days.length} active instruments</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <span className="text-[11px] text-slate-400">Matured Capital Requiring Action</span>
            <p className="text-xl font-bold font-mono text-rose-400 mt-1">{formatINR(capitalMatured)}</p>
            <span className="text-[10px] text-slate-500">{maturedList.length} matured instruments</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <span className="text-[11px] text-slate-400">Configured Escalation Rules</span>
            <p className="text-sm font-semibold text-slate-200 mt-1">30d → 15d → 7d → Day 0</p>
            <span className="text-[10px] text-emerald-400">Auto-dispatches alerts to institutions</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs by Maturity Band */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveBand('ALL')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeBand === 'ALL'
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
              : 'bg-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          All Instruments ({userFdrs.length})
        </button>

        <button
          onClick={() => setActiveBand('7_DAYS')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            activeBand === '7_DAYS'
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
              : 'bg-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          <span>Critical: ≤ 7 Days ({urgent7Days.length})</span>
        </button>

        <button
          onClick={() => setActiveBand('30_DAYS')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            activeBand === '30_DAYS'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
              : 'bg-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>Upcoming: ≤ 30 Days ({upcoming30Days.length})</span>
        </button>

        <button
          onClick={() => setActiveBand('MATURED')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            activeBand === 'MATURED'
              ? 'bg-red-500/20 text-red-400 border border-red-500/40'
              : 'bg-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>Matured & Overdue ({maturedList.length})</span>
        </button>

        <button
          onClick={() => setActiveBand('60_90_DAYS')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeBand === '60_90_DAYS'
              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
              : 'bg-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          60–90 Day Horizon ({horizon6090Days.length})
        </button>
      </div>

      {/* Maturity Schedule Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedList.length === 0 ? (
          <div className="col-span-full p-8 text-center text-slate-400 bg-slate-900 border border-slate-800 rounded-xl">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <p className="font-semibold text-slate-200 text-xs">No instruments in this maturity band</p>
          </div>
        ) : (
          displayedList.map(fdr => {
            const badge = getMaturityBadgeStyle(fdr.maturityStatus);
            const isCritical = fdr.daysUntilMaturity <= 7 && fdr.lifecycleStatus === 'ACTIVE';
            const isMatured = fdr.daysUntilMaturity <= 0;

            return (
              <div 
                key={fdr.id}
                className={`bg-slate-900 border rounded-xl p-4 shadow-sm flex flex-col justify-between transition-all hover:border-slate-600 ${
                  isCritical 
                    ? 'border-rose-700/80 bg-rose-950/10' 
                    : isMatured 
                    ? 'border-red-800/80 bg-red-950/20' 
                    : 'border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-100">{fdr.fdrNumber}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${badge.bg}`}>
                      {badge.label}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-300 mt-2 line-clamp-1">{fdr.institutionName}</p>
                  <p className="text-[11px] text-slate-400">{fdr.issuingBank} • {fdr.branchName.split(',')[0]}</p>

                  <div className="mt-3 p-2.5 rounded-lg bg-slate-800/70 border border-slate-700/70 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Principal Deposit:</span>
                      <span className="font-mono font-bold text-slate-100">{formatINR(fdr.principalAmount)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Maturity Date:</span>
                      <span className="font-mono text-cyan-400 font-semibold">{formatDate(fdr.maturityDate)}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-700/60">
                      <span className="text-slate-400">Days Remaining:</span>
                      <span className={`font-mono font-bold ${
                        fdr.daysUntilMaturity <= 7 ? 'text-rose-400' : 'text-slate-200'
                      }`}>
                        {fdr.daysUntilMaturity > 0 
                          ? `${fdr.daysUntilMaturity} Days` 
                          : `${Math.abs(fdr.daysUntilMaturity)} Days Overdue`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Workflow Actions */}
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onSelectFdr(fdr.id)}
                    className="text-xs text-slate-400 hover:text-white font-medium"
                  >
                    View Details
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onOpenRenewalModal(fdr)}
                      className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold flex items-center gap-1 transition-colors"
                    >
                      <RefreshCw className="w-3 h-3" /> Renew
                    </button>
                    <button
                      onClick={() => onOpenReleaseModal(fdr)}
                      className="px-2.5 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-semibold flex items-center gap-1 transition-colors"
                    >
                      <CornerDownRight className="w-3 h-3" /> Release
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
