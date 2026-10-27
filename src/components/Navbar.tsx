'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { DEMO_USERS } from '@/lib/mockData';
import { UserRole } from '@/lib/types';
import { 
  Bell, 
  Search, 
  RotateCcw, 
  FastForward, 
  ShieldCheck, 
  User, 
  Calendar, 
  ChevronDown,
  Building,
  CheckCircle,
  AlertTriangle,
  Info,
  Clock,
  Sparkles
} from 'lucide-react';

interface NavbarProps {
  onSearchChange?: (val: string) => void;
  onOpenNotifications?: () => void;
  onNavigateToFdr?: (fdrId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onSearchChange, 
  onOpenNotifications,
  onNavigateToFdr 
}) => {
  const { 
    currentUser, 
    switchRole, 
    simulatedDate, 
    advanceSimulationDays, 
    resetToDefaultData, 
    notifications,
    markNotificationAsRead,
    markAllNotificationsRead 
  } = useApp();

  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [timeDropdownOpen, setTimeDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchVal(e.target.value);
    if (onSearchChange) onSearchChange(e.target.value);
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'REGULATORY_ADMIN':
        return { label: 'Regulatory Admin', bg: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/70 dark:text-purple-300' };
      case 'REGULATORY_OFFICER':
        return { label: 'Scrutiny Officer', bg: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/70 dark:text-blue-300' };
      case 'INSTITUTION_ADMIN':
        return { label: 'Institution Admin', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300' };
      case 'INSTITUTION_OPERATOR':
        return { label: 'Institution Operator', bg: 'bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-950/70 dark:text-teal-300' };
      case 'AUDITOR':
        return { label: 'Statutory Auditor', bg: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/70 dark:text-amber-300' };
    }
  };

  const badge = getRoleBadge(currentUser.role);

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-900 border-b border-slate-800 text-slate-100 shadow-sm backdrop-blur-md">
      {/* SIH Hackathon Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 px-4 py-1.5 text-xs flex flex-wrap items-center justify-between border-b border-indigo-800/60">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded bg-indigo-500/20 px-2 py-0.5 font-semibold text-indigo-300 border border-indigo-500/40">
            <Sparkles className="w-3 h-3 text-indigo-300" /> SIH26265
          </span>
          <span className="text-slate-300 hidden sm:inline">
            Smart India Hackathon 2026 Prototype — Security Deposit / FDR Portal Streamlining
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-cyan-400" /> Sim Date: <strong className="text-cyan-300 font-mono">{simulatedDate}</strong>
          </span>
          <span className="hidden md:inline text-slate-500">|</span>
          <button 
            onClick={resetToDefaultData}
            title="Reset dataset to pristine seed state"
            className="flex items-center gap-1 text-slate-400 hover:text-amber-300 transition-colors"
          >
            <RotateCcw className="w-3 h-3" /> Reset Demo
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Product Brand */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white font-black text-xl tracking-tighter">
            DF
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-white font-sans">
                Deposit<span className="text-cyan-400">Flow</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                AICTE Pilot
              </span>
            </div>
            <p className="text-[11px] text-slate-400 -mt-0.5 hidden sm:block">
              Centralized FDR Lifecycle & Compliance Portal
            </p>
          </div>
        </div>

        {/* Center: Global Search */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchVal}
              onChange={handleSearch}
              placeholder="Search FDR #, bank, branch, or institute code..."
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
            />
          </div>
        </div>

        {/* Right: Actions, Simulation Time Machine, Notifications & Role Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Time Machine Button */}
          <div className="relative">
            <button
              onClick={() => setTimeDropdownOpen(!timeDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition-all"
              title="Fast forward simulated time to test maturity notifications"
            >
              <FastForward className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Time Machine</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {timeDropdownOpen && (
              <div 
                className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-800 border border-slate-700 shadow-2xl p-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-100"
                onClick={() => setTimeDropdownOpen(false)}
              >
                <div className="px-2 py-1.5 text-[11px] font-semibold text-slate-400 border-b border-slate-700 mb-1">
                  Maturity Engine Simulation
                </div>
                <button
                  onClick={() => advanceSimulationDays(7)}
                  className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-slate-700 flex items-center justify-between text-slate-200"
                >
                  <span>Advance +7 Days</span>
                  <span className="text-[10px] text-amber-400">Trigger 7-Day Alert</span>
                </button>
                <button
                  onClick={() => advanceSimulationDays(15)}
                  className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-slate-700 flex items-center justify-between text-slate-200"
                >
                  <span>Advance +15 Days</span>
                  <span className="text-[10px] text-amber-400">Trigger 15-Day Alert</span>
                </button>
                <button
                  onClick={() => advanceSimulationDays(30)}
                  className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-slate-700 flex items-center justify-between text-slate-200"
                >
                  <span>Advance +30 Days</span>
                  <span className="text-[10px] text-rose-400 font-semibold">Mature Active FDRs</span>
                </button>
                <button
                  onClick={() => advanceSimulationDays(60)}
                  className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-slate-700 flex items-center justify-between text-slate-200"
                >
                  <span>Advance +60 Days</span>
                  <span className="text-[10px] text-rose-500 font-semibold">Overdue Threshold</span>
                </button>
              </div>
            )}
          </div>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
              className="relative p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
              aria-label="View notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center border-2 border-slate-900 animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {notifDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-slate-800 border border-slate-700 shadow-2xl z-50 overflow-hidden text-xs">
                <div className="px-4 py-3 bg-slate-900/80 border-b border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-100">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-[10px] font-bold border border-rose-500/30">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-[11px] text-cyan-400 hover:underline"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-700/60">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-slate-400">
                      No notifications right now
                    </div>
                  ) : (
                    notifications.slice(0, 6).map(n => (
                      <div 
                        key={n.id}
                        onClick={() => {
                          markNotificationAsRead(n.id);
                          if (n.relatedFdrId && onNavigateToFdr) {
                            onNavigateToFdr(n.relatedFdrId);
                            setNotifDropdownOpen(false);
                          }
                        }}
                        className={`p-3.5 hover:bg-slate-750 transition-colors cursor-pointer ${
                          !n.isRead ? 'bg-slate-700/40' : ''
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <div className="mt-0.5">
                            {n.priority === 'URGENT' ? (
                              <AlertTriangle className="w-4 h-4 text-rose-400" />
                            ) : n.category === 'VERIFICATION' ? (
                              <ShieldCheck className="w-4 h-4 text-blue-400" />
                            ) : (
                              <Info className="w-4 h-4 text-cyan-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-slate-200 text-xs leading-snug">{n.title}</p>
                            <p className="text-slate-400 text-[11px] mt-0.5 line-clamp-2">{n.message}</p>
                            <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-500">
                              <Clock className="w-3 h-3" />
                              <span>{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              <span className="font-medium text-cyan-400/90 hover:underline">View Record →</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="px-4 py-2 bg-slate-900/60 border-t border-slate-700 text-center">
                  <span className="text-[11px] text-slate-400">
                    Live System Notification Queue
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Persona / Role Switcher for Hackathon Judges */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 hover:border-slate-600 transition-all"
            >
              <div className="w-7 h-7 rounded-full bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 flex items-center justify-center font-bold text-xs">
                {currentUser.avatar}
              </div>
              <div className="text-left hidden lg:block">
                <p className="text-xs font-semibold text-slate-200 leading-tight">{currentUser.name}</p>
                <p className="text-[10px] text-slate-400 leading-none">{badge.label}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {roleDropdownOpen && (
              <div 
                className="absolute right-0 mt-2 w-72 rounded-xl bg-slate-800 border border-slate-700 shadow-2xl p-2 z-50 text-xs"
                onClick={() => setRoleDropdownOpen(false)}
              >
                <div className="px-3 py-2 border-b border-slate-700 mb-1">
                  <p className="text-[11px] font-semibold text-slate-400">SIH Hackathon Role Switcher</p>
                  <p className="text-[10px] text-slate-500">Switch persona to test role-based permissions</p>
                </div>
                {DEMO_USERS.map(user => {
                  const uBadge = getRoleBadge(user.role);
                  const isSelected = currentUser.role === user.role;
                  return (
                    <button
                      key={user.id}
                      onClick={() => switchRole(user.role, user.institutionId)}
                      className={`w-full text-left p-2 rounded-lg flex items-start gap-2.5 transition-all ${
                        isSelected ? 'bg-cyan-950/60 border border-cyan-800/80' : 'hover:bg-slate-700/60'
                      }`}
                    >
                      <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-200 mt-0.5">
                        {user.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-200">{user.name}</span>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-medium ${uBadge.bg}`}>
                            {uBadge.label}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-tight mt-0.5">{user.designation}</p>
                        {user.institutionName && (
                          <p className="text-[9px] text-cyan-400/90 mt-0.5 flex items-center gap-1">
                            <Building className="w-2.5 h-2.5" /> {user.institutionName}
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
