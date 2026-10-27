'use client';

import React from 'react';
import { useApp } from '@/lib/store';
import {
  LayoutDashboard,
  FileText,
  ShieldCheck,
  Clock,
  RefreshCcw,
  CornerDownRight,
  History,
  BarChart3,
  Building,
  FileSearch,
  ChevronRight,
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'fdr_registry'
  | 'verification'
  | 'maturity'
  | 'renewals'
  | 'releases'
  | 'audit_trail'
  | 'reports'
  | 'institutions';

interface SidebarProps {
  activeTab: NavTab;
  onNavigate: (tab: NavTab) => void;
}

interface NavItem {
  tab: NavTab;
  label: string;
  sublabel: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeVariant?: 'blue' | 'green' | 'amber' | 'red' | 'teal' | 'muted';
}

interface NavSection {
  heading: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onNavigate }) => {
  const { currentUser, fdrs, renewals, releases } = useApp();

  const pendingVerif  = fdrs.filter(f => f.lifecycleStatus === 'UNDER_VERIFICATION' || f.lifecycleStatus === 'CORRECTION_REQUIRED').length;
  const maturingSoon  = fdrs.filter(f => f.daysUntilMaturity >= 0 && f.daysUntilMaturity <= 30 && f.lifecycleStatus === 'ACTIVE').length;
  const pendingRenew  = renewals.filter(r => r.status === 'SUBMITTED' || r.status === 'UNDER_REVIEW').length;
  const pendingRel    = releases.filter(r => r.status === 'AWAITING_DECISION' || r.status === 'UNDER_REVIEW').length;

  const sections: NavSection[] = [
    {
      heading: 'Overview',
      items: [
        { tab: 'dashboard',   label: 'Dashboard',        sublabel: 'Summary & KPIs',     icon: LayoutDashboard },
        { tab: 'institutions',label: 'Institutions',     sublabel: 'Technical colleges',  icon: Building },
      ],
    },
    {
      heading: 'Instruments',
      items: [
        { tab: 'fdr_registry',  label: 'FDR Registry',    sublabel: 'All deposit records', icon: FileText,
          badge: fdrs.length, badgeVariant: 'muted' },
        { tab: 'verification',  label: 'Verification',    sublabel: 'Scrutiny queue',       icon: ShieldCheck,
          badge: pendingVerif || undefined, badgeVariant: 'red' },
        { tab: 'maturity',      label: 'Maturity Monitor',sublabel: 'Expiry tracking',      icon: Clock,
          badge: maturingSoon || undefined, badgeVariant: 'amber' },
      ],
    },
    {
      heading: 'Workflows',
      items: [
        { tab: 'renewals',  label: 'Renewals',         sublabel: 'Rollover requests',   icon: RefreshCcw,
          badge: pendingRenew || undefined, badgeVariant: 'blue' },
        { tab: 'releases',  label: 'Releases',         sublabel: 'Lien cancellations',  icon: CornerDownRight,
          badge: pendingRel || undefined, badgeVariant: 'blue' },
      ],
    },
    {
      heading: 'Intelligence',
      items: [
        { tab: 'reports',    label: 'Reports',       sublabel: 'Statutory analytics', icon: BarChart3 },
        { tab: 'audit_trail',label: 'Audit Trail',   sublabel: 'Tamper-evident log',  icon: History },
      ],
    },
  ];

  const isVisible = (tab: NavTab): boolean => {
    const role = currentUser.role;
    if (tab === 'verification' && role === 'INSTITUTION_OPERATOR') return false;
    if ((tab === 'reports' || tab === 'audit_trail') && role === 'INSTITUTION_OPERATOR') return false;
    return true;
  };

  const badgeClass: Record<string, string> = {
    blue: 'badge-blue', green: 'badge-green', amber: 'badge-amber',
    red: 'badge-red', teal: 'badge-teal', muted: 'badge-muted',
  };

  return (
    <aside className="sidebar-bg w-56 shrink-0 flex flex-col overflow-y-auto">
      <nav className="flex-1 py-3 px-2 space-y-4">
        {sections.map(section => {
          const visibleItems = section.items.filter(i => isVisible(i.tab));
          if (visibleItems.length === 0) return null;

          return (
            <div key={section.heading}>
              {/* Section heading */}
              <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider"
                style={{ color: '#484f58' }}>
                {section.heading}
              </p>

              {/* Items */}
              <div className="space-y-0.5">
                {visibleItems.map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.tab;

                  return (
                    <button
                      key={item.tab}
                      onClick={() => onNavigate(item.tab)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors group ${isActive ? 'nav-active' : ''}`}
                      style={{
                        background: isActive ? undefined : 'transparent',
                        color: isActive ? '#60a5fa' : '#8b949e',
                        borderLeft: isActive ? undefined : '2px solid transparent',
                      }}
                      onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = '#1c2128'; (e.currentTarget as HTMLElement).style.color = '#e6edf3'; }}
                      onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#8b949e'; } }}
                    >
                      {/* Icon */}
                      <Icon className="w-4 h-4 shrink-0 transition-colors" />

                      {/* Label */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium leading-none" style={{ color: isActive ? '#60a5fa' : 'inherit' }}>
                          {item.label}
                        </p>
                        <p className="text-[10px] leading-none mt-0.5" style={{ color: '#484f58' }}>
                          {item.sublabel}
                        </p>
                      </div>

                      {/* Badge */}
                      {item.badge !== undefined && (
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${badgeClass[item.badgeVariant || 'muted']}`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-3 pt-2" style={{ borderTop: '1px solid #21262d' }}>
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-md"
          style={{ background: '#1c2128', border: '1px solid #30363d' }}>
          <div className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold text-white shrink-0"
            style={{ background: '#1d4ed8' }}>
            {currentUser.avatar}
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold truncate" style={{ color: '#e6edf3' }}>{currentUser.name}</p>
            <p className="text-[9px] truncate" style={{ color: '#484f58' }}>{currentUser.designation}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
