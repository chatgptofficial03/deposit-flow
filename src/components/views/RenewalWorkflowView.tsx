'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { RenewalRequest, FdrRecord } from '@/lib/types';
import { formatINR, formatDate } from '@/lib/utils';
import { 
  RefreshCw, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Building, 
  FileText, 
  Plus, 
  Check, 
  History,
  ShieldCheck
} from 'lucide-react';

interface RenewalWorkflowViewProps {
  onOpenNewRenewalModal: () => void;
  onSelectFdr: (fdrId: string) => void;
}

export const RenewalWorkflowView: React.FC<RenewalWorkflowViewProps> = ({
  onOpenNewRenewalModal,
  onSelectFdr
}) => {
  const { currentUser, renewals, fdrs, reviewRenewal } = useApp();

  const [selectedRenewal, setSelectedRenewal] = useState<RenewalRequest | null>(
    renewals.length > 0 ? renewals[0] : null
  );
  const [officerRemarks, setOfficerRemarks] = useState('');

  const isOfficerOrAdmin = currentUser.role === 'REGULATORY_ADMIN' || currentUser.role === 'REGULATORY_OFFICER';

  const handleDecision = (decision: 'APPROVED' | 'REJECTED' | 'CORRECTION_REQUIRED') => {
    if (!selectedRenewal) return;
    reviewRenewal(
      selectedRenewal.id,
      decision,
      officerRemarks.trim() || `Renewal application ${decision.toLowerCase()} by regulatory scrutiny.`
    );
    setSelectedRenewal(null);
    setOfficerRemarks('');
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-indigo-400" />
            <h1 className="text-xl font-bold text-slate-100">Renewal & Replacement Workflow</h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800">
              Traceable Rollover
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Maintain unbroken audit lineage between maturing security deposits and authorized replacement instruments.
          </p>
        </div>

        <button
          onClick={onOpenNewRenewalModal}
          className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Initiate Renewal Request</span>
        </button>
      </div>

      {/* Main Grid: Renewal Applications List & Side-by-Side Reviewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5/12): Requests List */}
        <div className="lg:col-span-5 space-y-3">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Renewal Applications ({renewals.length})
          </h2>

          <div className="space-y-3">
            {renewals.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 bg-slate-900 border border-slate-800 rounded-xl">
                No active renewal or replacement applications.
              </div>
            ) : (
              renewals.map(req => {
                const isSelected = selectedRenewal?.id === req.id;
                const origFdr = fdrs.find(f => f.id === req.originalFdrId);

                return (
                  <div
                    key={req.id}
                    onClick={() => setSelectedRenewal(req)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-indigo-950/30 border-indigo-500/80 shadow-md'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-100 font-mono">
                        {req.originalFdrNumber}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-semibold border ${
                        req.status === 'APPROVED' 
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800' 
                          : req.status === 'REJECTED' 
                          ? 'bg-rose-950 text-rose-300 border-rose-800' 
                          : 'bg-amber-950 text-amber-300 border-amber-800'
                      }`}>
                        {req.status}
                      </span>
                    </div>

                    <p className="text-xs font-medium text-slate-300 mt-1 truncate">{req.institutionName}</p>

                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Amount: <strong className="text-slate-200">{formatINR(req.proposedAmount)}</strong></span>
                      <span className="text-indigo-400 flex items-center gap-1 font-medium">
                        Inspect <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column (7/12): Detailed Comparison & Scrutiny Card */}
        <div className="lg:col-span-7">
          {selectedRenewal ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-100">
                    Rollover Comparison: Predecessor vs Successor
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">{selectedRenewal.institutionName}</p>
                </div>
                <span className="text-xs font-mono px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  Ref: {selectedRenewal.id}
                </span>
              </div>

              {/* Comparison Table */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                {/* Old FDR Column */}
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-slate-400 font-semibold border-b border-slate-800 pb-1.5">
                    <span>Original Predecessor</span>
                    <History className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500">FDR Reference:</span>
                    <p className="font-mono font-bold text-slate-200">{selectedRenewal.originalFdrNumber}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500">Maturity Status:</span>
                    <p className="text-amber-400 font-medium">Reaching Term / Matured</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500">Action:</span>
                    <p className="text-slate-300">To be archived with full traceability</p>
                  </div>
                </div>

                {/* New FDR Column */}
                <div className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-800/40 space-y-2">
                  <div className="flex items-center justify-between text-indigo-300 font-semibold border-b border-indigo-800/40 pb-1.5">
                    <span>Proposed Successor</span>
                    <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500">Proposed Reference:</span>
                    <p className="font-mono font-bold text-indigo-300">{selectedRenewal.proposedFdrNumber}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500">Bank & Branch:</span>
                    <p className="text-slate-200">{selectedRenewal.proposedBank}</p>
                    <p className="text-[10px] text-slate-400">{selectedRenewal.proposedBranch}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500">Deposit Capital:</span>
                    <p className="font-mono font-bold text-slate-100">{formatINR(selectedRenewal.proposedAmount)}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500">Tenure:</span>
                    <p className="text-slate-200">{formatDate(selectedRenewal.proposedIssueDate)} → {formatDate(selectedRenewal.proposedMaturityDate)}</p>
                  </div>
                </div>
              </div>

              {/* Justification & Remarks */}
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs">
                <span className="text-slate-400 font-medium">Institution Justification:</span>
                <p className="text-slate-200 mt-1 italic leading-relaxed">
                  &ldquo;{selectedRenewal.renewalReason}&rdquo;
                </p>
              </div>

              {/* Reviewer Action Controls (for Regulatory Officers/Admins) */}
              {isOfficerOrAdmin && selectedRenewal.status !== 'APPROVED' && (
                <div className="pt-3 border-t border-slate-800 space-y-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1 font-medium">
                      Scrutiny Remarks:
                    </label>
                    <input
                      type="text"
                      value={officerRemarks}
                      onChange={e => setOfficerRemarks(e.target.value)}
                      placeholder="Enter verification notes or approval endorsement..."
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => handleDecision('APPROVED')}
                      className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve & Link Successor FDR</span>
                    </button>
                    <button
                      onClick={() => handleDecision('CORRECTION_REQUIRED')}
                      className="py-2 px-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      <span>Request Correction</span>
                    </button>
                    <button
                      onClick={() => handleDecision('REJECTED')}
                      className="py-2 px-3 rounded-lg bg-rose-700 hover:bg-rose-600 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl">
              Select a renewal request on the left to inspect rollover comparison.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
