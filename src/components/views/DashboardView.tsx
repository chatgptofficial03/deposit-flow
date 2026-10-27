'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/lib/store';
import { formatINR, formatDate, getMaturityBadgeStyle, filterFdrsByPermission } from '@/lib/utils';
import { NavTab } from '@/components/Sidebar';
import { VaultCanvas3D } from '@/components/3d/VaultCanvas3D';
import { AmbientOrb3D } from '@/components/3d/AmbientOrb3D';
import {
  FileText,
  IndianRupee,
  ShieldAlert,
  Clock,
  AlertOctagon,
  RefreshCcw,
  CornerDownRight,
  FileWarning,
  Activity,
  TrendingUp,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Dot,
  ArrowUpRight,
} from 'lucide-react';

interface DashboardViewProps {
  onNavigate: (tab: NavTab) => void;
  onSelectFdr: (fdrId: string) => void;
}

interface KpiCard {
  label: string;
  sublabel: string;
  value: number | string;
  icon: React.ElementType;
  accentColor: string;
  badgeText?: string;
  badgeClass?: string;
  tab: NavTab;
  isAlert?: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate, onSelectFdr }) => {
  const { currentUser, fdrs, renewals, releases, institutions, auditLogs, simulatedDate } = useApp();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 60); return () => clearTimeout(t); }, []);

  const userFdrs = filterFdrsByPermission(fdrs, currentUser);

  const totalActive        = userFdrs.filter(f => f.lifecycleStatus === 'ACTIVE' || f.lifecycleStatus === 'VERIFIED').length;
  const totalValue         = userFdrs.reduce((a, b) => a + b.principalAmount, 0);
  const pendingVerif       = userFdrs.filter(f => f.verificationStatus === 'PENDING' || f.lifecycleStatus === 'UNDER_VERIFICATION').length;
  const expiring30         = userFdrs.filter(f => f.daysUntilMaturity > 0 && f.daysUntilMaturity <= 30 && f.lifecycleStatus === 'ACTIVE').length;
  const maturedReview      = userFdrs.filter(f => f.daysUntilMaturity <= 0 || f.lifecycleStatus === 'MATURED_NEEDS_REVIEW').length;
  const pendingRenewals    = renewals.filter(r => r.status === 'SUBMITTED' || r.status === 'UNDER_REVIEW').length;
  const pendingReleases    = releases.filter(r => r.status === 'AWAITING_DECISION' || r.status === 'UNDER_REVIEW').length;
  const openDiscrepancies  = userFdrs.reduce((a, b) => a + b.discrepancies.filter(d => d.status === 'OPEN').length, 0);
  const depositValueCr     = (totalValue / 10_000_000).toFixed(2);

  const bankDistribution: Record<string, number> = {};
  userFdrs.forEach(f => { bankDistribution[f.issuingBank] = (bankDistribution[f.issuingBank] || 0) + f.principalAmount; });

  const lifecycle = {
    ACTIVE:              userFdrs.filter(f => f.lifecycleStatus === 'ACTIVE').length,
    UNDER_VERIFICATION:  userFdrs.filter(f => f.lifecycleStatus === 'UNDER_VERIFICATION').length,
    CORRECTION_REQUIRED: userFdrs.filter(f => f.lifecycleStatus === 'CORRECTION_REQUIRED').length,
    MATURED_NEEDS_REVIEW:userFdrs.filter(f => f.lifecycleStatus === 'MATURED_NEEDS_REVIEW').length,
    RENEWAL_IN_PROGRESS: userFdrs.filter(f => f.lifecycleStatus === 'RENEWAL_IN_PROGRESS').length,
    RELEASE_REQUESTED:   userFdrs.filter(f => f.lifecycleStatus === 'RELEASE_REQUESTED').length,
  };

  const criticalItems = userFdrs.filter(f =>
    (f.daysUntilMaturity <= 7 && f.lifecycleStatus === 'ACTIVE') ||
    f.lifecycleStatus === 'MATURED_NEEDS_REVIEW' ||
    f.lifecycleStatus === 'CORRECTION_REQUIRED'
  );

  const kpiCards: KpiCard[] = [
    { label: 'Active Instruments',   sublabel: 'AICTE lien enforced',        value: totalActive,       icon: FileText,       accentColor: '#22c55e', badgeText: `of ${userFdrs.length}`, badgeClass: 'badge-muted', tab: 'fdr_registry' },
    { label: 'Secured Capital',      sublabel: 'Aggregate principal on record', value: `₹${depositValueCr} Cr`, icon: IndianRupee, accentColor: '#60a5fa', tab: 'fdr_registry' },
    { label: 'Pending Verification', sublabel: 'Awaiting officer sign-off',   value: pendingVerif,      icon: ShieldAlert,    accentColor: '#60a5fa', badgeText: pendingVerif > 0 ? 'Review' : undefined, badgeClass: 'badge-blue', tab: 'verification', isAlert: pendingVerif > 0 },
    { label: 'Expiring ≤ 30 Days',   sublabel: 'Rollover notices due',        value: expiring30,        icon: Clock,          accentColor: '#fbbf24', badgeText: expiring30 > 0 ? 'Alert' : undefined, badgeClass: 'badge-amber', tab: 'maturity', isAlert: expiring30 > 0 },
    { label: 'Matured (Action Due)', sublabel: 'Past maturity date',          value: maturedReview,     icon: AlertOctagon,   accentColor: '#f87171', badgeText: maturedReview > 0 ? 'Overdue' : undefined, badgeClass: 'badge-red', tab: 'maturity', isAlert: maturedReview > 0 },
    { label: 'Pending Renewals',     sublabel: 'Under review by authority',   value: pendingRenewals,   icon: RefreshCcw,     accentColor: '#c084fc', tab: 'renewals' },
    { label: 'Release Requests',     sublabel: 'Awaiting compliance check',   value: pendingReleases,   icon: CornerDownRight,accentColor: '#2dd4bf', tab: 'releases' },
    { label: 'Open Discrepancies',   sublabel: 'Amount or lien mismatches',   value: openDiscrepancies, icon: FileWarning,    accentColor: '#f87171', badgeText: openDiscrepancies > 0 ? 'Correct' : undefined, badgeClass: 'badge-red', tab: 'verification', isAlert: openDiscrepancies > 0 },
  ];

  const bankColors = ['#3b82f6', '#22c55e', '#f59e0b', '#14b8a6', '#a855f7', '#ef4444'];

  return (
    <div className={`space-y-5 transition-opacity duration-300 ${mounted ? 'opacity-100' : 'opacity-0'}`}>

      {/* ── Hero ── */}
      <div className="relative rounded-lg overflow-hidden scene-container" style={{ minHeight: 180 }}>
        <div className="absolute inset-0"><AmbientOrb3D /></div>

        <div className="relative z-10 p-5 flex flex-col lg:flex-row gap-5">
          {/* Left */}
          <div className="flex-1 space-y-3">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="badge-blue text-[10px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider">
                  Regulatory Control Center
                </span>
                <span className="flex items-center gap-1 text-[10px]" style={{ color: '#22c55e' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 status-live" />
                  Live
                </span>
              </div>
              <h1 className="text-xl font-bold leading-snug" style={{ color: '#e6edf3', fontFamily: 'Inter, sans-serif' }}>
                Compliance &amp; Deposit Oversight Dashboard
              </h1>
              <p className="text-xs mt-1 max-w-xl" style={{ color: '#8b949e' }}>
                Real-time regulatory monitoring across{' '}
                <strong style={{ color: '#e6edf3' }}>{institutions.length} technical institutions</strong> with{' '}
                <strong style={{ color: '#e6edf3' }}>₹{depositValueCr} Cr</strong> in jointly-liened security deposits.
              </p>
            </div>

            {/* Stat pills */}
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Total Instruments', value: userFdrs.length },
                { label: 'Active Banks',       value: Object.keys(bankDistribution).length },
                { label: 'System Date',        value: formatDate(simulatedDate) },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px]"
                  style={{ background: '#1c2128', border: '1px solid #30363d' }}>
                  <Dot className="w-3 h-3 shrink-0" style={{ color: '#60a5fa' }} />
                  <span style={{ color: '#8b949e' }}>{s.label}:</span>
                  <span className="font-semibold data-mono" style={{ color: '#e6edf3' }}>{s.value}</span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 pt-1">
              <button onClick={() => onNavigate('verification')}
                className="btn-primary flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verification Queue
                {pendingVerif > 0 && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-white/20">{pendingVerif}</span>
                )}
              </button>
              <button onClick={() => onNavigate('maturity')}
                className="btn-secondary flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md">
                <Clock className="w-3.5 h-3.5" style={{ color: '#fbbf24' }} />
                Maturity Monitor
                {expiring30 > 0 && (
                  <span className="badge-amber text-[9px] font-bold px-1.5 py-0.5 rounded">{expiring30}</span>
                )}
              </button>
            </div>
          </div>

          {/* 3D Vault */}
          <div className="lg:w-72 xl:w-80 shrink-0">
            <VaultCanvas3D
              totalAmount={`₹${depositValueCr} Cr`}
              instrumentsCount={userFdrs.filter(f => f.lifecycleStatus === 'ACTIVE').length}
            />
          </div>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-xs font-semibold uppercase tracking-wider flex items-center gap-2" style={{ color: '#8b949e' }}>
            <TrendingUp className="w-3.5 h-3.5" style={{ color: '#60a5fa' }} />
            Key Metrics
          </h2>
          <span className="text-[10px]" style={{ color: '#484f58' }}>Click to drill down</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {kpiCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <div key={card.label} onClick={() => onNavigate(card.tab)}
                className={`kpi-card fade-in-up stagger-${i + 1} relative p-4 cursor-pointer group`}
                style={{ borderColor: card.isAlert ? `${card.accentColor}30` : undefined }}>

                <div className="flex items-start justify-between mb-3">
                  <div className="w-7 h-7 rounded-md flex items-center justify-center"
                    style={{ background: `${card.accentColor}15`, color: card.accentColor }}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: '#8b949e' }} />
                </div>

                <div className="flex items-end gap-1.5 mb-1">
                  <span className="text-2xl font-bold data-mono leading-none"
                    style={{ color: card.isAlert ? card.accentColor : '#e6edf3' }}>
                    {card.value}
                  </span>
                  {card.badgeText && (
                    <span className={`${card.badgeClass} text-[9px] font-semibold px-1.5 py-0.5 rounded mb-0.5`}>
                      {card.badgeText}
                    </span>
                  )}
                </div>

                <p className="text-[11px] font-medium leading-tight" style={{ color: '#e6edf3' }}>{card.label}</p>
                <p className="text-[10px] mt-0.5" style={{ color: '#484f58' }}>{card.sublabel}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Analytics + Queue ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Left 2-col: Bank exposure + lifecycle pipeline */}
        <div className="lg:col-span-2 space-y-4">

          {/* Bank Exposure */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: '#e6edf3' }}>
                  <span className="w-2 h-2 rounded-full bg-blue-500 status-live" />
                  Issuing Bank Exposure
                </h3>
                <p className="text-[10px] mt-0.5" style={{ color: '#484f58' }}>
                  Deposit capital secured across scheduled banks
                </p>
              </div>
              <span className="badge-blue text-[10px] font-semibold px-2 py-0.5 rounded">
                {Object.keys(bankDistribution).length} Banks
              </span>
            </div>

            <div className="space-y-3">
              {Object.entries(bankDistribution).map(([bank, amount], idx) => {
                const pct = totalValue > 0 ? (amount / totalValue) * 100 : 0;
                const col = bankColors[idx % bankColors.length];
                return (
                  <div key={bank}>
                    <div className="flex items-center justify-between mb-1 text-xs">
                      <span className="font-medium flex items-center gap-1.5" style={{ color: '#e6edf3' }}>
                        <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: col }} />
                        {bank}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="data-mono font-semibold" style={{ color: '#e6edf3' }}>{formatINR(amount, true)}</span>
                        <span className="data-mono text-[10px] w-10 text-right" style={{ color: '#484f58' }}>{pct.toFixed(1)}%</span>
                      </div>
                    </div>
                    <div className="progress-track h-1.5">
                      <div className="progress-fill h-1.5 transition-all duration-700"
                        style={{ width: `${Math.max(pct, 2)}%`, background: col }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Lifecycle Pipeline */}
          <div className="card p-5">
            <div className="mb-4">
              <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: '#e6edf3' }}>
                <Activity className="w-3.5 h-3.5" style={{ color: '#60a5fa' }} />
                FDR Lifecycle Pipeline
              </h3>
              <p className="text-[10px] mt-0.5" style={{ color: '#484f58' }}>
                Stage distribution across all recorded instruments
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {[
                { label: 'Active & Verified',     count: lifecycle.ACTIVE,              color: '#22c55e' },
                { label: 'Under Scrutiny',         count: lifecycle.UNDER_VERIFICATION,  color: '#60a5fa' },
                { label: 'Correction Flagged',     count: lifecycle.CORRECTION_REQUIRED, color: '#f87171' },
                { label: 'Matured (Action Due)',   count: lifecycle.MATURED_NEEDS_REVIEW,color: '#fbbf24' },
                { label: 'Renewal In Progress',    count: lifecycle.RENEWAL_IN_PROGRESS, color: '#c084fc' },
                { label: 'Release Requested',      count: lifecycle.RELEASE_REQUESTED,   color: '#2dd4bf' },
              ].map(item => (
                <div key={item.label} className="p-3 rounded-md"
                  style={{ background: '#1c2128', border: '1px solid #21262d' }}>
                  <p className="text-[9px] uppercase tracking-wider font-medium mb-1" style={{ color: '#484f58' }}>{item.label}</p>
                  <p className="text-xl font-bold data-mono" style={{ color: item.color }}>{item.count}</p>
                  <div className="progress-track h-0.5 mt-2">
                    <div className="progress-fill h-0.5"
                      style={{ width: `${userFdrs.length > 0 ? (item.count / userFdrs.length) * 100 : 0}%`, background: item.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right col: Critical Queue + Audit */}
        <div className="space-y-4">

          {/* Urgent Queue */}
          <div className="card p-4" style={{ borderColor: criticalItems.length > 0 ? 'rgba(239,68,68,0.2)' : undefined }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold flex items-center gap-1.5" style={{ color: '#e6edf3' }}>
                <ShieldAlert className="w-3.5 h-3.5" style={{ color: '#f87171' }} />
                Urgent Attention Queue
              </h3>
              <span className="badge-red text-[9px] font-bold px-1.5 py-0.5 rounded">{criticalItems.length}</span>
            </div>

            <div className="space-y-1.5">
              {criticalItems.length === 0 ? (
                <div className="py-6 text-center">
                  <CheckCircle2 className="w-7 h-7 mx-auto mb-2" style={{ color: '#22c55e', opacity: 0.5 }} />
                  <p className="text-xs" style={{ color: '#8b949e' }}>All instruments healthy</p>
                  <p className="text-[10px] mt-0.5" style={{ color: '#484f58' }}>No urgent actions required</p>
                </div>
              ) : criticalItems.slice(0, 4).map(fdr => {
                const badge = getMaturityBadgeStyle(fdr.maturityStatus);
                return (
                  <div key={fdr.id} onClick={() => onSelectFdr(fdr.id)}
                    className="flex items-start gap-2 p-2.5 rounded-md cursor-pointer transition-colors group"
                    style={{ background: '#1c2128', border: '1px solid #21262d' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(239,68,68,0.25)'; (e.currentTarget as HTMLElement).style.background = '#22272e'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#21262d'; (e.currentTarget as HTMLElement).style.background = '#1c2128'; }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="data-mono text-[11px] font-semibold group-hover:text-red-400 transition-colors"
                          style={{ color: '#e6edf3' }}>{fdr.fdrNumber}</span>
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border ${badge.bg}`}>
                          {badge.label}
                        </span>
                      </div>
                      <p className="text-[10px] truncate" style={{ color: '#484f58' }}>{fdr.institutionName}</p>
                      <div className="flex items-center justify-between mt-1 text-[10px]">
                        <span className="data-mono" style={{ color: '#8b949e' }}>{formatINR(fdr.principalAmount, true)}</span>
                        <span className="flex items-center gap-0.5" style={{ color: '#f87171' }}>
                          Inspect <ChevronRight className="w-2.5 h-2.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button onClick={() => onNavigate('maturity')}
              className="w-full mt-3 py-1.5 text-[10px] flex items-center justify-center gap-1 transition-colors"
              style={{ borderTop: '1px solid #21262d', color: '#60a5fa' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#93c5fd')}
              onMouseLeave={e => (e.currentTarget.style.color = '#60a5fa')}>
              Full Maturity Schedule <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* Audit Stream */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold flex items-center gap-1.5" style={{ color: '#e6edf3' }}>
                <Activity className="w-3.5 h-3.5" style={{ color: '#2dd4bf' }} />
                Audit Stream
              </h3>
              <button onClick={() => onNavigate('audit_trail')} className="text-[10px] transition-colors"
                style={{ color: '#60a5fa' }}>View all</button>
            </div>

            <div className="space-y-2.5">
              {auditLogs.slice(0, 4).map(log => (
                <div key={log.id} className="pl-3 py-0.5" style={{ borderLeft: '2px solid #30363d' }}>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium" style={{ color: '#e6edf3' }}>{log.actorName}</span>
                    <span className="data-mono text-[10px]" style={{ color: '#484f58' }}>
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[10px] mt-0.5 line-clamp-2" style={{ color: '#8b949e' }}>{log.summary}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
