'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { 
  History, 
  Search, 
  ShieldCheck, 
  Filter, 
  Lock, 
  FileText, 
  User, 
  Clock, 
  Terminal,
  CheckCircle2
} from 'lucide-react';
import { ShieldScan3D } from '@/components/3d/ShieldScan3D';

export const AuditTrailView: React.FC = () => {
  const { auditLogs } = useApp();

  const [search, setSearch] = useState('');
  const [entityFilter, setEntityFilter] = useState('ALL');

  const filteredLogs = auditLogs.filter(log => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchActor = log.actorName.toLowerCase().includes(q);
      const matchAction = log.action.toLowerCase().includes(q);
      const matchSummary = log.summary.toLowerCase().includes(q);
      const matchEntity = log.entityId.toLowerCase().includes(q);
      if (!matchActor && !matchAction && !matchSummary && !matchEntity) return false;
    }
    if (entityFilter !== 'ALL' && log.entityType !== entityFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* 3D Audit Shield Hero */}
      <ShieldScan3D
        verifiedCount={auditLogs.length}
        pendingCount={filteredLogs.length}
        scanProgress={100}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-bold text-slate-100">Tamper-Evident Audit & Accountability Trail</h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
              Append-Only Ledger
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Complete non-repudiable audit recording of all submissions, scrutiny outcomes, state changes, and administrative actions.
          </p>
        </div>

        {/* Security Integrity Badge */}
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2 text-xs text-slate-400">
          <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
          <div>
            <span className="text-slate-200 font-semibold block">Audit Log Integrity: SECURED</span>
            <span className="text-[10px] text-slate-500">Immutable ledger entries with actor IP attribution</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search audit trail by actor, action, or entity ID..."
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Entity Type:</span>
          <select
            value={entityFilter}
            onChange={e => setEntityFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          >
            <option value="ALL">All Entities</option>
            <option value="FDR">FDR Records</option>
            <option value="VERIFICATION">Verification Reviews</option>
            <option value="RENEWAL">Renewals</option>
            <option value="RELEASE">Releases</option>
            <option value="SYSTEM">System & Settings</option>
          </select>
        </div>
      </div>

      {/* Audit Log Stream */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="divide-y divide-slate-800/80">
          {filteredLogs.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">
              No audit events matched the filter.
            </div>
          ) : (
            filteredLogs.map(log => (
              <div key={log.id} className="p-4 hover:bg-slate-850/50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-slate-800 text-cyan-400 mt-0.5 shrink-0">
                      <Terminal className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-200">{log.action}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700 font-mono">
                          {log.entityType} • {log.entityId}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">{log.summary}</p>

                      {/* Before / After Diff details if present */}
                      {(log.previousValue || log.newValue) && (
                        <div className="mt-2 p-2.5 rounded bg-slate-950 border border-slate-800 font-mono text-[11px] space-y-1">
                          {log.previousValue && (
                            <div className="text-rose-400/90">
                              <span className="text-slate-500 select-none mr-2">- Previous:</span>
                              {log.previousValue}
                            </div>
                          )}
                          {log.newValue && (
                            <div className="text-emerald-400/90">
                              <span className="text-slate-500 select-none mr-2">+ New:</span>
                              {log.newValue}
                            </div>
                          )}
                        </div>
                      )}

                      {log.remarks && (
                        <p className="text-[11px] text-amber-300/80 mt-1 italic">
                          Observation: &ldquo;{log.remarks}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actor & Timestamp Metadata */}
                  <div className="text-right sm:shrink-0 text-xs text-slate-400">
                    <div className="font-semibold text-slate-200">{log.actorName}</div>
                    <div className="text-[11px] text-slate-400">{log.actorRole}</div>
                    <div className="font-mono text-[10px] text-slate-500 mt-0.5">
                      {new Date(log.timestamp).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </div>
                    <div className="font-mono text-[9px] text-slate-600 mt-0.5">IP: {log.ipAddress}</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
