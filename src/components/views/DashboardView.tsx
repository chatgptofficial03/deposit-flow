'use client';

import React from 'react';
import { useApp } from '@/lib/store';
import { formatINR, formatDate, getMaturityBadgeStyle, filterFdrsByPermission } from '@/lib/utils';
import { NavTab } from '@/components/Sidebar';
import { 
  FileCheck2, 
  IndianRupee, 
  ShieldAlert, 
  Clock, 
  AlertOctagon, 
  RefreshCcw, 
  CornerDownRight, 
  CheckCircle2,
  Building2,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  FileWarning,
  ExternalLink,
  Activity
} from 'lucide-react';

interface DashboardViewProps {
  onNavigate: (tab: NavTab) => void;
  onSelectFdr: (fdrId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate, onSelectFdr }) => {
  const { currentUser, fdrs, renewals, releases, institutions, auditLogs, simulatedDate } = useApp();

  const userFdrs = filterFdrsByPermission(fdrs, currentUser);

  // Exact calculated metrics from active state
  const totalActiveFdrs = userFdrs.filter(f => f.lifecycleStatus === 'ACTIVE' || f.lifecycleStatus === 'VERIFIED').length;
  const totalDepositValue = userFdrs.reduce((acc, curr) => acc + curr.principalAmount, 0);
  const pendingVerification = userFdrs.filter(f => f.verificationStatus === 'PENDING' || f.lifecycleStatus === 'UNDER_VERIFICATION').length;
  const expiring30Days = userFdrs.filter(f => f.daysUntilMaturity > 0 && f.daysUntilMaturity <= 30 && f.lifecycleStatus === 'ACTIVE').length;
  const maturedReview = userFdrs.filter(f => f.daysUntilMaturity <= 0 || f.lifecycleStatus === 'MATURED_NEEDS_REVIEW').length;
  const pendingRenewals = renewals.filter(r => r.status === 'SUBMITTED' || r.status === 'UNDER_REVIEW').length;
  const pendingReleases = releases.filter(r => r.status === 'AWAITING_DECISION' || r.status === 'UNDER_REVIEW').length;
  const openDiscrepancies = userFdrs.reduce((acc, curr) => acc + curr.discrepancies.filter(d => d.status === 'OPEN').length, 0);

  // Bank Distribution
  const bankDistribution: { [bank: string]: number } = {};
  userFdrs.forEach(f => {
    bankDistribution[f.issuingBank] = (bankDistribution[f.issuingBank] || 0) + f.principalAmount;
  });

  // Lifecycle breakdown
  const lifecycleCounts = {
    ACTIVE: userFdrs.filter(f => f.lifecycleStatus === 'ACTIVE').length,
    UNDER_VERIFICATION: userFdrs.filter(f => f.lifecycleStatus === 'UNDER_VERIFICATION').length,
    CORRECTION_REQUIRED: userFdrs.filter(f => f.lifecycleStatus === 'CORRECTION_REQUIRED').length,
    MATURED_NEEDS_REVIEW: userFdrs.filter(f => f.lifecycleStatus === 'MATURED_NEEDS_REVIEW').length,
    RENEWAL_IN_PROGRESS: userFdrs.filter(f => f.lifecycleStatus === 'RENEWAL_IN_PROGRESS').length,
    RELEASE_REQUESTED: userFdrs.filter(f => f.lifecycleStatus === 'RELEASE_REQUESTED').length
  };

  // Critical Action Items
  const criticalItems = userFdrs.filter(f => 
    (f.daysUntilMaturity <= 7 && f.lifecycleStatus === 'ACTIVE') ||
    f.lifecycleStatus === 'MATURED_NEEDS_REVIEW' ||
    f.lifecycleStatus === 'CORRECTION_REQUIRED'
  );

  return (
    <div className="space-y-6">
      {/* Welcome & Context Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">
              Regulatory Overview & Compliance Dashboard
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
              Live State
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time monitoring across {institutions.length} technical institutions & ₹{(totalDepositValue / 10000000).toFixed(2)} Cr in verified security deposits.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <span className="text-[11px] text-slate-400">Current System Date:</span>
            <p className="text-xs font-mono font-bold text-cyan-400">{formatDate(simulatedDate)}</p>
          </div>
          <button
            onClick={() => onNavigate('verification')}
            className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Open Verification Queue ({pendingVerification})</span>
          </button>
        </div>
      </div>

      {/* Top KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {/* Card 1: Total Active FDRs */}
        <div 
          onClick={() => onNavigate('fdr_registry')}
          className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 p-4 rounded-xl shadow-sm cursor-pointer transition-all hover:translate-y-[-1px] group"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Active Instruments</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-100 font-mono">{totalActiveFdrs}</span>
            <span className="text-[11px] text-emerald-400 font-medium">/ {userFdrs.length} Total</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Enforced with AICTE joint lien</p>
        </div>

        {/* Card 2: Total Recorded Value */}
        <div 
          onClick={() => onNavigate('fdr_registry')}
          className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 p-4 rounded-xl shadow-sm cursor-pointer transition-all hover:translate-y-[-1px] group"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Total Recorded Deposits</span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-100 font-mono">{formatINR(totalDepositValue, true)}</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">{formatINR(totalDepositValue)} aggregate</p>
        </div>

        {/* Card 3: Pending Verification */}
        <div 
          onClick={() => onNavigate('verification')}
          className="bg-slate-900/90 border border-slate-800 hover:border-blue-700/60 p-4 rounded-xl shadow-sm cursor-pointer transition-all hover:translate-y-[-1px] group"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Pending Verification</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-blue-400 font-mono">{pendingVerification}</span>
            {pendingVerification > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 font-bold border border-blue-800">
                Awaiting Scrutiny
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Requires officer sign-off</p>
        </div>

        {/* Card 4: Expiring in ≤30 Days */}
        <div 
          onClick={() => onNavigate('maturity')}
          className="bg-slate-900/90 border border-slate-800 hover:border-amber-700/60 p-4 rounded-xl shadow-sm cursor-pointer transition-all hover:translate-y-[-1px] group"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Expiring ≤ 30 Days</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-400 font-mono">{expiring30Days}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 font-bold border border-amber-800">
              Rollover Alert
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Renewal notices dispatched</p>
        </div>

        {/* Card 5: Matured Needs Review */}
        <div 
          onClick={() => onNavigate('maturity')}
          className="bg-slate-900/90 border border-slate-800 hover:border-rose-700/60 p-4 rounded-xl shadow-sm cursor-pointer transition-all hover:translate-y-[-1px] group"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Matured (Action Needed)</span>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 group-hover:scale-110 transition-transform">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-400 font-mono">{maturedReview}</span>
            {maturedReview > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 font-bold border border-rose-800">
                Action Overdue
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Exceeded maturity date</p>
        </div>

        {/* Card 6: Pending Renewals */}
        <div 
          onClick={() => onNavigate('renewals')}
          className="bg-slate-900/90 border border-slate-800 hover:border-indigo-700/60 p-4 rounded-xl shadow-sm cursor-pointer transition-all hover:translate-y-[-1px] group"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Pending Renewals</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform">
              <RefreshCcw className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-indigo-400 font-mono">{pendingRenewals}</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Proposed replacement FDRs</p>
        </div>

        {/* Card 7: Pending Releases */}
        <div 
          onClick={() => onNavigate('releases')}
          className="bg-slate-900/90 border border-slate-800 hover:border-purple-700/60 p-4 rounded-xl shadow-sm cursor-pointer transition-all hover:translate-y-[-1px] group"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Release / Refund Requests</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
              <CornerDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-purple-400 font-mono">{pendingReleases}</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">AICTE compliance verification</p>
        </div>

        {/* Card 8: Discrepancy & Missing Docs */}
        <div 
          onClick={() => onNavigate('verification')}
          className="bg-slate-900/90 border border-slate-800 hover:border-rose-700/60 p-4 rounded-xl shadow-sm cursor-pointer transition-all hover:translate-y-[-1px] group"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Open Discrepancies</span>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 group-hover:scale-110 transition-transform">
              <FileWarning className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-400 font-mono">{openDiscrepancies}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 font-bold border border-rose-800">
              Needs Correction
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Amount or lien mismatches</p>
        </div>
      </div>

      {/* Two-Column Analytics & Distribution Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3): Bank Distribution & Lifecycle Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bank Exposure Distribution */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-200">Issuing Bank Exposure Distribution</h3>
                <p className="text-xs text-slate-400">Total recorded deposit capital secured across scheduled banks</p>
              </div>
              <span className="text-[11px] font-mono text-cyan-400 font-semibold">
                {Object.keys(bankDistribution).length} Active Banks
              </span>
            </div>

            <div className="space-y-3">
              {Object.entries(bankDistribution).map(([bank, amount]) => {
                const percentage = totalDepositValue > 0 ? (amount / totalDepositValue) * 100 : 0;
                return (
                  <div key={bank} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-200">{bank}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-300 font-semibold">{formatINR(amount, true)}</span>
                        <span className="text-slate-400 text-[11px] w-12 text-right">{percentage.toFixed(1)}%</span>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(percentage, 3)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Lifecycle Stage Breakdown */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-200 mb-1">FDR Lifecycle Pipeline</h3>
            <p className="text-xs text-slate-400 mb-4">Current stage distribution of all recorded instruments</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-[11px] text-slate-400">Active & Verified</span>
                <p className="text-xl font-bold font-mono text-emerald-400 mt-1">{lifecycleCounts.ACTIVE}</p>
                <div className="h-1 bg-emerald-500/30 rounded mt-2">
                  <div className="h-1 bg-emerald-400 rounded" style={{ width: `${(lifecycleCounts.ACTIVE / userFdrs.length) * 100}%` }} />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-[11px] text-slate-400">Under Scrutiny</span>
                <p className="text-xl font-bold font-mono text-sky-400 mt-1">{lifecycleCounts.UNDER_VERIFICATION}</p>
                <div className="h-1 bg-sky-500/30 rounded mt-2">
                  <div className="h-1 bg-sky-400 rounded" style={{ width: `${(lifecycleCounts.UNDER_VERIFICATION / userFdrs.length) * 100}%` }} />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-[11px] text-slate-400">Correction Flagged</span>
                <p className="text-xl font-bold font-mono text-rose-400 mt-1">{lifecycleCounts.CORRECTION_REQUIRED}</p>
                <div className="h-1 bg-rose-500/30 rounded mt-2">
                  <div className="h-1 bg-rose-400 rounded" style={{ width: `${(lifecycleCounts.CORRECTION_REQUIRED / userFdrs.length) * 100}%` }} />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-[11px] text-slate-400">Matured (Action Due)</span>
                <p className="text-xl font-bold font-mono text-amber-400 mt-1">{lifecycleCounts.MATURED_NEEDS_REVIEW}</p>
                <div className="h-1 bg-amber-500/30 rounded mt-2">
                  <div className="h-1 bg-amber-400 rounded" style={{ width: `${(lifecycleCounts.MATURED_NEEDS_REVIEW / userFdrs.length) * 100}%` }} />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-[11px] text-slate-400">Renewal in Progress</span>
                <p className="text-xl font-bold font-mono text-indigo-400 mt-1">{lifecycleCounts.RENEWAL_IN_PROGRESS}</p>
                <div className="h-1 bg-indigo-500/30 rounded mt-2">
                  <div className="h-1 bg-indigo-400 rounded" style={{ width: `${(lifecycleCounts.RENEWAL_IN_PROGRESS / userFdrs.length) * 100}%` }} />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-[11px] text-slate-400">Release Requested</span>
                <p className="text-xl font-bold font-mono text-purple-400 mt-1">{lifecycleCounts.RELEASE_REQUESTED}</p>
                <div className="h-1 bg-purple-500/30 rounded mt-2">
                  <div className="h-1 bg-purple-400 rounded" style={{ width: `${(lifecycleCounts.RELEASE_REQUESTED / userFdrs.length) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1/3): Urgent Scrutiny Queue & Recent Audit Activity */}
        <div className="space-y-6">
          {/* Urgent Attention Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <h3 className="text-sm font-bold text-slate-200">Urgent Attention Queue</h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 font-bold border border-rose-800">
                {criticalItems.length} Urgent
              </span>
            </div>

            <div className="space-y-2.5">
              {criticalItems.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
                  All instruments are within healthy compliance parameters!
                </div>
              ) : (
                criticalItems.slice(0, 4).map(fdr => {
                  const badge = getMaturityBadgeStyle(fdr.maturityStatus);
                  return (
                    <div
                      key={fdr.id}
                      onClick={() => onSelectFdr(fdr.id)}
                      className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/70 hover:border-slate-600 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-slate-200 group-hover:text-cyan-400 transition-colors">
                          {fdr.fdrNumber}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium border ${badge.bg}`}>
                          {badge.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-1">{fdr.institutionName}</p>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-700/50 text-[10px] text-slate-500">
                        <span>Amount: <strong className="text-slate-300">{formatINR(fdr.principalAmount, true)}</strong></span>
                        <span className="text-cyan-400 flex items-center gap-1 group-hover:underline">
                          Inspect <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <button
              onClick={() => onNavigate('maturity')}
              className="w-full mt-3 py-2 text-center text-xs text-cyan-400 hover:text-cyan-300 font-semibold border-t border-slate-800 flex items-center justify-center gap-1"
            >
              <span>View Full Maturity Schedule</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Recent Audit Activity */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-slate-200">Append-Only Audit Stream</h3>
              </div>
              <button
                onClick={() => onNavigate('audit_trail')}
                className="text-[11px] text-cyan-400 hover:underline"
              >
                View all
              </button>
            </div>

            <div className="space-y-3">
              {auditLogs.slice(0, 4).map(log => (
                <div key={log.id} className="text-xs border-l-2 border-cyan-500/40 pl-3 py-0.5">
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span className="font-semibold text-slate-300">{log.actorName}</span>
                    <span className="font-mono">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-slate-300 text-[11px] mt-0.5 line-clamp-2">{log.summary}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
