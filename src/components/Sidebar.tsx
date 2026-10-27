'use client';

import React from 'react';
import { useApp } from '@/lib/store';
import { 
  LayoutDashboard, 
  FileText, 
  ShieldCheck, 
  Clock, 
  RefreshCw, 
  CornerDownRight, 
  Building2, 
  BarChart3, 
  History,
  Info,
  ExternalLink,
  PlusCircle,
  AlertCircle
} from 'lucide-react';

export type NavTab = 
  | 'dashboard'
  | 'fdr_registry'
  | 'verification'
  | 'maturity'
  | 'renewals'
  | 'releases'
  | 'institutions'
  | 'reports'
  | 'audit_trail'
  | 'hackathon_info';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenNewFdrModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  onTabChange,
  onOpenNewFdrModal 
}) => {
  const { currentUser, fdrs, renewals, releases } = useApp();

  const isInstitutionUser = currentUser.role === 'INSTITUTION_ADMIN' || currentUser.role === 'INSTITUTION_OPERATOR';
  const visibleFdrs = isInstitutionUser ? fdrs.filter(f => f.institutionId === currentUser.institutionId) : fdrs;

  // Real calculated badge numbers
  const pendingVerificationCount = visibleFdrs.filter(f => f.verificationStatus === 'PENDING' || f.lifecycleStatus === 'UNDER_VERIFICATION').length;
  const urgentMaturityCount = visibleFdrs.filter(f => f.daysUntilMaturity <= 7 && f.lifecycleStatus === 'ACTIVE').length;
  const pendingRenewalsCount = renewals.filter(r => r.status === 'SUBMITTED' || r.status === 'UNDER_REVIEW').length;
  const pendingReleasesCount = releases.filter(r => r.status === 'AWAITING_DECISION' || r.status === 'UNDER_REVIEW').length;

  const navItems = [
    {
      id: 'dashboard',
      label: 'Operational Dashboard',
      icon: LayoutDashboard,
      roles: ['REGULATORY_ADMIN', 'REGULATORY_OFFICER', 'INSTITUTION_ADMIN', 'INSTITUTION_OPERATOR', 'AUDITOR']
    },
    {
      id: 'fdr_registry',
      label: 'FDR & Deposit Registry',
      icon: FileText,
      badge: visibleFdrs.length.toString(),
      roles: ['REGULATORY_ADMIN', 'REGULATORY_OFFICER', 'INSTITUTION_ADMIN', 'INSTITUTION_OPERATOR', 'AUDITOR']
    },
    {
      id: 'verification',
      label: 'Verification & Scrutiny',
      icon: ShieldCheck,
      badge: pendingVerificationCount > 0 ? pendingVerificationCount.toString() : undefined,
      badgeColor: 'bg-blue-500 text-white',
      roles: ['REGULATORY_ADMIN', 'REGULATORY_OFFICER', 'AUDITOR']
    },
    {
      id: 'maturity',
      label: 'Maturity Monitoring',
      icon: Clock,
      badge: urgentMaturityCount > 0 ? `${urgentMaturityCount} Urgent` : undefined,
      badgeColor: 'bg-rose-500 text-white animate-pulse',
      roles: ['REGULATORY_ADMIN', 'REGULATORY_OFFICER', 'INSTITUTION_ADMIN', 'INSTITUTION_OPERATOR', 'AUDITOR']
    },
    {
      id: 'renewals',
      label: 'Renewals & Replacements',
      icon: RefreshCw,
      badge: pendingRenewalsCount > 0 ? pendingRenewalsCount.toString() : undefined,
      roles: ['REGULATORY_ADMIN', 'REGULATORY_OFFICER', 'INSTITUTION_ADMIN', 'INSTITUTION_OPERATOR', 'AUDITOR']
    },
    {
      id: 'releases',
      label: 'Release & Refund Portal',
      icon: CornerDownRight,
      badge: pendingReleasesCount > 0 ? pendingReleasesCount.toString() : undefined,
      roles: ['REGULATORY_ADMIN', 'REGULATORY_OFFICER', 'INSTITUTION_ADMIN', 'INSTITUTION_OPERATOR', 'AUDITOR']
    },
    {
      id: 'institutions',
      label: 'Technical Institutions',
      icon: Building2,
      roles: ['REGULATORY_ADMIN', 'REGULATORY_OFFICER', 'AUDITOR']
    },
    {
      id: 'reports',
      label: 'Reports & Analytics',
      icon: BarChart3,
      roles: ['REGULATORY_ADMIN', 'REGULATORY_OFFICER', 'INSTITUTION_ADMIN', 'INSTITUTION_OPERATOR', 'AUDITOR']
    },
    {
      id: 'audit_trail',
      label: 'Tamper-Evident Audit Trail',
      icon: History,
      roles: ['REGULATORY_ADMIN', 'REGULATORY_OFFICER', 'AUDITOR']
    },
    {
      id: 'hackathon_info',
      label: 'SIH26265 Architecture',
      icon: Info,
      roles: ['REGULATORY_ADMIN', 'REGULATORY_OFFICER', 'INSTITUTION_ADMIN', 'INSTITUTION_OPERATOR', 'AUDITOR']
    }
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col justify-between shrink-0 select-none">
      <div className="p-4 space-y-4">
        {/* Quick Submit Action Button for Institution Users or Admins */}
        <button
          onClick={onOpenNewFdrModal}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs shadow-md shadow-cyan-900/40 transition-all hover:scale-[1.01]"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Submit New FDR Record</span>
        </button>

        {/* Tenant Isolation Banner for Institution Role */}
        {isInstitutionUser && (
          <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-[11px]">
            <p className="text-slate-400 font-medium">Institution Workspace:</p>
            <p className="text-cyan-400 font-bold truncate mt-0.5">{currentUser.institutionName}</p>
            <p className="text-[10px] text-slate-500">Data isolated to your institute records</p>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="space-y-1">
          {navItems
            .filter(item => item.roles.includes(currentUser.role))
            .map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id as NavTab)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                      : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span 
                      className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                        item.badgeColor || 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
        </nav>
      </div>

      {/* Footer Info Box */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="font-semibold text-slate-300">DepositFlow v1.0</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
            System Live
          </span>
        </div>
        <p className="text-[10px] text-slate-500 mt-1">
          Smart India Hackathon 2026<br />Problem Statement SIH26265
        </p>
      </div>
    </aside>
  );
};
