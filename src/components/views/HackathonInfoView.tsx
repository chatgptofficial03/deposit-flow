'use client';

import React from 'react';
import { 
  Sparkles, 
  Lock, 
  Server, 
  FileCheck
} from 'lucide-react';

export const HackathonInfoView: React.FC = () => {
  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900/90 via-indigo-950 to-slate-900 border border-indigo-800/80 rounded-2xl p-6 shadow-md">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded bg-indigo-500/20 text-indigo-300 font-mono font-bold text-xs border border-indigo-500/40">
            SIH26265
          </span>
          <span className="text-xs text-indigo-300 font-semibold uppercase tracking-wider">
            Smart India Hackathon 2026 Prototype
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white mt-2">
          DepositFlow — Security Deposit & FDR Management System
        </h1>
        <p className="text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
          Centralized FDR Lifecycle Management, Verification & Compliance Monitoring for AICTE Technical Institutions and Regulatory Authorities.
        </p>
      </div>


      {/* System Architecture & Principles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-slate-200 font-bold">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span>Strict Tenant Isolation</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            Institution users can only access records belonging to their authorized institutional identifier. Cross-tenant leakage is strictly blocked.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-slate-200 font-bold">
            <Server className="w-4 h-4 text-blue-400" />
            <span>Separate Status Dimensions</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            Lifecycle status, verification status, maturity status, and release status are modeled as distinct, non-conflated state machines.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-slate-200 font-bold">
            <FileCheck className="w-4 h-4 text-purple-400" />
            <span>Tamper-Evident Ledger</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            Every creation, status update, scrutiny remark, and file inspection is written to an append-only audit log with actor name and IP attribution.
          </p>
        </div>
      </div>
    </div>
  );
};
