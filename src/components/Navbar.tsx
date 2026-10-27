'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/lib/store';
import { DEMO_USERS } from '@/lib/mockData';
import { UserRole } from '@/lib/types';
import {
  Bell,
  Search,
  RotateCcw,
  FastForward,
  ShieldCheck,
  Calendar,
  ChevronDown,
  Building,
  AlertTriangle,
  Info,
  Clock,
  CheckCircle,
  ChevronRight,
  Timer,
} from 'lucide-react';

interface NavbarProps {
  onSearchChange?: (val: string) => void;
  onNavigateToFdr?: (fdrId: string) => void;
}

const ROLE_META: Record<UserRole, { label: string; color: string; bg: string }> = {
  REGULATORY_ADMIN:    { label: 'Regulatory Admin',     color: '#93c5fd', bg: 'rgba(59,130,246,0.1)' },
  REGULATORY_OFFICER:  { label: 'Scrutiny Officer',     color: '#5eead4', bg: 'rgba(20,184,166,0.1)' },
  INSTITUTION_ADMIN:   { label: 'Institution Admin',    color: '#86efac', bg: 'rgba(34,197,94,0.1)'  },
  INSTITUTION_OPERATOR:{ label: 'Institution Operator', color: '#86efac', bg: 'rgba(34,197,94,0.1)'  },
  AUDITOR:             { label: 'Statutory Auditor',    color: '#fcd34d', bg: 'rgba(245,158,11,0.1)' },
};

export const Navbar: React.FC<NavbarProps> = ({ onSearchChange, onNavigateToFdr }) => {
  const {
    currentUser,
    switchRole,
    simulatedDate,
    advanceSimulationDays,
    resetToDefaultData,
    notifications,
    markNotificationAsRead,
    markAllNotificationsRead,
  } = useApp();

  const [roleOpen, setRoleOpen]   = useState(false);
  const [timeOpen, setTimeOpen]   = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [search, setSearch]       = useState('');
  const [focused, setFocused]     = useState(false);
  const [liveTime, setLiveTime]   = useState('');

  const unread  = notifications.filter(n => !n.isRead).length;
  const roleMeta = ROLE_META[currentUser.role];

  useEffect(() => {
    const tick = () =>
      setLiveTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Close all dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!(e.target as Element).closest('[data-dd]')) {
        setRoleOpen(false);
        setTimeOpen(false);
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const closeAll = () => { setRoleOpen(false); setTimeOpen(false); setNotifOpen(false); };

  return (
    <header className="navbar-ambient sticky top-0 z-50 w-full">

      {/* ── Context strip ── */}
      <div style={{ background: '#161b22', borderBottom: '1px solid #21262d' }}
        className="px-4 py-1">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between" style={{ fontSize: '11px' }}>
          <div className="flex items-center gap-3">
            <span className="font-semibold badge-blue px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">
              SIH 26265
            </span>
            <span style={{ color: '#8b949e' }} className="hidden sm:inline">
              Smart India Hackathon 2026 · AICTE Security Deposit Management System
            </span>
          </div>
          <div className="flex items-center gap-4" style={{ color: '#8b949e' }}>
            <span className="hidden sm:flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 status-live" />
              <span className="data-mono">{liveTime} IST</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3 h-3" style={{ color: '#60a5fa' }} />
              Sim: <strong className="data-mono" style={{ color: '#e6edf3' }}>{simulatedDate}</strong>
            </span>
            <button
              onClick={resetToDefaultData}
              className="flex items-center gap-1 transition-colors hover:text-amber-400"
              title="Reset demo data to seed state"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>
        </div>
      </div>

      {/* ── Main bar ── */}
      <div className="max-w-screen-xl mx-auto px-4 h-14 flex items-center justify-between gap-4">

        {/* Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative float">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm"
              style={{ background: 'linear-gradient(135deg, #1d4ed8, #2563eb)', boxShadow: '0 2px 8px rgba(37,99,235,0.4)' }}>
              DF
              <span className="absolute w-2 h-2 rounded-full orbit"
                style={{ background: '#22c55e', boxShadow: '0 0 4px rgba(34,197,94,0.6)', top: 0, right: 0 }} />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold" style={{ color: '#e6edf3', letterSpacing: '-0.01em' }}>
                Deposit<span style={{ color: '#60a5fa' }}>Flow</span>
              </span>
              <span className="badge-blue text-[9px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wider">
                AICTE
              </span>
            </div>
            <p className="text-[10px] hidden sm:block leading-none mt-0.5" style={{ color: '#484f58' }}>
              Centralized FDR &amp; Compliance Portal
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-sm hidden md:block">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2"
              style={{ color: focused ? '#60a5fa' : '#484f58' }} />
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); onSearchChange?.(e.target.value); }}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Search FDR #, bank, institution..."
              className="input-base w-full pl-8 pr-3 py-1.5 text-xs"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5">

          {/* Time machine */}
          <div className="relative" data-dd>
            <button
              onClick={e => { e.stopPropagation(); closeAll(); setTimeOpen(v => !v); }}
              className="btn-secondary flex items-center gap-1.5 px-2.5 py-1.5 text-xs"
              title="Advance simulated date"
            >
              <Timer className="w-3.5 h-3.5" style={{ color: '#fbbf24' }} />
              <span className="hidden sm:inline">Simulate</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${timeOpen ? 'rotate-180' : ''}`}
                style={{ color: '#8b949e' }} />
            </button>

            {timeOpen && (
              <div className="dropdown absolute right-0 mt-1 w-52 p-1 z-50 slide-in" data-dd>
                <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider"
                  style={{ color: '#8b949e', borderBottom: '1px solid #30363d' }}>
                  Maturity Simulation
                </p>
                {[
                  { d: 7,  label: '+7 Days',  note: '7-day alert' },
                  { d: 15, label: '+15 Days', note: '15-day warning' },
                  { d: 30, label: '+30 Days', note: 'Mature FDRs' },
                  { d: 60, label: '+60 Days', note: 'Overdue threshold' },
                ].map(({ d, label, note }) => (
                  <button key={d}
                    onClick={() => { advanceSimulationDays(d); setTimeOpen(false); }}
                    className="w-full text-left px-3 py-1.5 rounded-md flex items-center justify-between text-xs transition-colors"
                    style={{ color: '#e6edf3' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#22272e')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <span className="font-medium">{label}</span>
                    <span style={{ color: '#fbbf24', fontSize: '10px' }}>{note}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="relative" data-dd>
            <button
              onClick={e => { e.stopPropagation(); closeAll(); setNotifOpen(v => !v); }}
              className="btn-secondary relative p-1.5 rounded-md"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" style={{ color: unread > 0 ? '#f87171' : '#8b949e' }} />
              {unread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center rounded-full text-white font-bold"
                  style={{ width: '16px', height: '16px', fontSize: '9px', background: '#dc2626', border: '1px solid #0d1117' }}>
                  {unread}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="dropdown absolute right-0 mt-1 w-80 z-50 overflow-hidden slide-in" data-dd>
                <div className="flex items-center justify-between px-4 py-2.5"
                  style={{ borderBottom: '1px solid #30363d', background: '#1c2128' }}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold" style={{ color: '#e6edf3' }}>Notifications</span>
                    {unread > 0 && (
                      <span className="badge-red text-[9px] font-bold px-1.5 py-0.5 rounded">{unread} new</span>
                    )}
                  </div>
                  {unread > 0 && (
                    <button onClick={markAllNotificationsRead}
                      className="text-[10px] transition-colors hover:text-blue-300"
                      style={{ color: '#60a5fa' }}>
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center">
                      <CheckCircle className="w-7 h-7 mx-auto mb-2" style={{ color: '#22c55e', opacity: 0.5 }} />
                      <p className="text-xs" style={{ color: '#8b949e' }}>No notifications</p>
                    </div>
                  ) : notifications.slice(0, 6).map((n, i) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markNotificationAsRead(n.id);
                        if (n.relatedFdrId && onNavigateToFdr) {
                          onNavigateToFdr(n.relatedFdrId);
                          setNotifOpen(false);
                        }
                      }}
                      className="flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors"
                      style={{
                        borderBottom: i < 5 ? '1px solid #21262d' : 'none',
                        background: !n.isRead ? 'rgba(59,130,246,0.04)' : 'transparent',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#22272e')}
                      onMouseLeave={e => (e.currentTarget.style.background = !n.isRead ? 'rgba(59,130,246,0.04)' : 'transparent')}
                    >
                      <div className="mt-0.5 shrink-0">
                        {n.priority === 'URGENT'
                          ? <AlertTriangle className="w-3.5 h-3.5" style={{ color: '#f87171' }} />
                          : n.category === 'VERIFICATION'
                          ? <ShieldCheck className="w-3.5 h-3.5" style={{ color: '#60a5fa' }} />
                          : <Info className="w-3.5 h-3.5" style={{ color: '#8b949e' }} />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold leading-snug" style={{ color: '#e6edf3' }}>{n.title}</p>
                        <p className="text-[10px] mt-0.5 line-clamp-2" style={{ color: '#8b949e' }}>{n.message}</p>
                        <div className="flex items-center gap-2 mt-1 text-[10px]" style={{ color: '#484f58' }}>
                          <Clock className="w-3 h-3" />
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          <span style={{ color: '#60a5fa' }}>· View →</span>
                        </div>
                      </div>
                      {!n.isRead && (
                        <div className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5" style={{ background: '#3b82f6' }} />
                      )}
                    </div>
                  ))}
                </div>

                <div className="px-4 py-2 text-center text-[10px]"
                  style={{ borderTop: '1px solid #21262d', background: '#1c2128', color: '#484f58' }}>
                  System Notification Queue
                </div>
              </div>
            )}
          </div>

          {/* Role switcher */}
          <div className="relative" data-dd>
            <button
              onClick={e => { e.stopPropagation(); closeAll(); setRoleOpen(v => !v); }}
              className="btn-secondary flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-md"
            >
              <div className="w-7 h-7 rounded-md flex items-center justify-center font-bold text-xs text-white shrink-0"
                style={{ background: '#1d4ed8' }}>
                {currentUser.avatar}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-medium leading-tight" style={{ color: '#e6edf3' }}>{currentUser.name}</p>
                <p className="text-[10px] leading-none mt-0.5" style={{ color: '#8b949e' }}>{roleMeta.label}</p>
              </div>
              <ChevronDown className={`w-3 h-3 transition-transform ${roleOpen ? 'rotate-180' : ''}`}
                style={{ color: '#8b949e' }} />
            </button>

            {roleOpen && (
              <div className="dropdown absolute right-0 mt-1 w-64 p-1 z-50 slide-in" data-dd>
                <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider"
                  style={{ color: '#8b949e', borderBottom: '1px solid #30363d' }}>
                  Switch Role
                </p>
                {DEMO_USERS.map(user => {
                  const meta = ROLE_META[user.role];
                  const isActive = currentUser.role === user.role;
                  return (
                    <button
                      key={user.id}
                      onClick={() => { switchRole(user.role, user.institutionId); setRoleOpen(false); }}
                      className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-md transition-colors"
                      style={{ background: isActive ? 'rgba(59,130,246,0.08)' : 'transparent' }}
                      onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = '#22272e'; }}
                      onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                    >
                      <div className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold text-white shrink-0"
                        style={{ background: '#1e3a8a' }}>
                        {user.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium" style={{ color: '#e6edf3' }}>{user.name}</span>
                          {isActive && <CheckCircle className="w-3 h-3" style={{ color: '#22c55e' }} />}
                        </div>
                        <p className="text-[10px] truncate" style={{ color: '#8b949e' }}>{user.designation}</p>
                        {user.institutionName && (
                          <p className="text-[9px] flex items-center gap-1 mt-0.5" style={{ color: '#60a5fa' }}>
                            <Building className="w-2.5 h-2.5 shrink-0" /> {user.institutionName}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
