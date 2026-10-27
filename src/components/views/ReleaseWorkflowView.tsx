'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { ReleaseRequest, FdrRecord } from '@/lib/types';
import { formatINR, formatDate } from '@/lib/utils';
import { 
  CornerDownRight, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ShieldCheck, 
  Building, 
  FileCheck, 
  Plus, 
  AlertOctagon,
  FileText,
  Clock,
  Landmark
} from 'lucide-react';

interface ReleaseWorkflowViewProps {
  onOpenNewReleaseModal: () => void;
  onSelectFdr: (fdrId: string) => void;
}

export const ReleaseWorkflowView: React.FC<ReleaseWorkflowViewProps> = ({
  onOpenNewReleaseModal,
  onSelectFdr
}) => {
  const { currentUser, releases, fdrs, reviewRelease } = useApp();

  const [selectedRelease, setSelectedRelease] = useState<ReleaseRequest | null>(
    releases.length > 0 ? releases[0] : null
  );
  const [remarks, setRemarks] = useState('');

  const isOfficerOrAdmin = currentUser.role === 'REGULATORY_ADMIN' || currentUser.role === 'REGULATORY_OFFICER';

  const handleDecision = (decision: 'APPROVED' | 'REJECTED' | 'ADDITIONAL_INFO_REQUIRED') => {
    if (!selectedRelease) return;
    reviewRelease(
      selectedRelease.id,
      decision,
      remarks.trim() || `Release request recorded as ${decision.toLowerCase()} by regulatory authority.`
    );
    setSelectedRelease(null);
    setRemarks('');
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <CornerDownRight className="w-5 h-5 text-purple-400" />
            <h1 className="text-xl font-bold text-slate-100">Security Deposit Release & Refund Portal</h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800">
              Statutory Clearance
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Enforce mandatory compliance prerequisites, NOC verification, and dual-authorization before encashment release.
          </p>
        </div>

        <button
          onClick={onOpenNewReleaseModal}
          className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Submit Release / Refund Request</span>
        </button>
      </div>

      {/* Main Grid: Request List & Scrutiny Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5/12): Requests List */}
        <div className="lg:col-span-5 space-y-3">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Release Requests ({releases.length})
          </h2>

          <div className="space-y-3">
            {releases.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 bg-slate-900 border border-slate-800 rounded-xl">
                No active release or refund requests filed.
              </div>
            ) : (
              releases.map(req => {
                const isSelected = selectedRelease?.id === req.id;
                return (
                  <div
                    key={req.id}
                    onClick={() => setSelectedRelease(req)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-purple-950/30 border-purple-500/80 shadow-md'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-100 font-mono">
                        {req.fdrNumber}
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
                      <span>Release Sum: <strong className="text-slate-100">{formatINR(req.principalAmount)}</strong></span>
                      <span className="text-purple-400 font-medium">Inspect Clearance →</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column (7/12): Statutory Prerequisites Checklist & Decision */}
        <div className="lg:col-span-7">
          {selectedRelease ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Release Dossier & Regulatory Clearance</h3>
                  <p className="text-xs text-slate-400">{selectedRelease.institutionName}</p>
                </div>
                <span className="text-xs font-mono px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {selectedRelease.id}
                </span>
              </div>

              {/* Financial & Reason Details */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-500">DEPOSIT REF:</span>
                  <p className="font-mono font-bold text-slate-200">{selectedRelease.fdrNumber}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500">CLAIM AMOUNT:</span>
                  <p className="font-mono font-bold text-purple-400 text-sm">{formatINR(selectedRelease.principalAmount)}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] text-slate-500">CLAIM CATEGORY & JUSTIFICATION:</span>
                  <p className="text-slate-200 font-semibold">{selectedRelease.reason.replace(/_/g, ' ')}</p>
                  <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">&ldquo;{selectedRelease.justification}&rdquo;</p>
                </div>
              </div>

              {/* Statutory Compliance Checklist */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <FileCheck className="w-3.5 h-3.5 text-cyan-400" />
                  Mandatory Statutory Prerequisites
                </h4>

                <div className="space-y-2">
                  <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center justify-between text-xs">
                    <span className="text-slate-200">AICTE Regional Office No-Objection Certificate (NOC)</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                      selectedRelease.compliancePrerequisites.nocObtained
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-rose-950 text-rose-400 border border-rose-800'
                    }`}>
                      {selectedRelease.compliancePrerequisites.nocObtained ? 'VERIFIED' : 'PENDING'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center justify-between text-xs">
                    <span className="text-slate-200">Student Grievance & Fee Dues Clearance Declaration</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                      selectedRelease.compliancePrerequisites.noPendingStudentDues
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-rose-950 text-rose-400 border border-rose-800'
                    }`}>
                      {selectedRelease.compliancePrerequisites.noPendingStudentDues ? 'VERIFIED' : 'PENDING'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center justify-between text-xs">
                    <span className="text-slate-200">Statutory Audit Committee Clearance</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                      selectedRelease.compliancePrerequisites.statutoryAuditCleared
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-rose-950 text-rose-400 border border-rose-800'
                    }`}>
                      {selectedRelease.compliancePrerequisites.statutoryAuditCleared ? 'VERIFIED' : 'PENDING'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center justify-between text-xs">
                    <span className="text-slate-200">Affidavit of No Ongoing Legal / Court Injunctions</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                      selectedRelease.compliancePrerequisites.noCourtCasesPending
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-rose-950 text-rose-400 border border-rose-800'
                    }`}>
                      {selectedRelease.compliancePrerequisites.noCourtCasesPending ? 'VERIFIED' : 'PENDING'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Regulatory Decision Panel */}
              {isOfficerOrAdmin && (
                <div className="pt-3 border-t border-slate-800 space-y-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1 font-medium">
                      Release Scrutiny Observations & Authorization Order Notes:
                    </label>
                    <input
                      type="text"
                      value={remarks}
                      onChange={e => setRemarks(e.target.value)}
                      placeholder="Enter scrutiny order notes or clearance justification..."
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => handleDecision('APPROVED')}
                      className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Authorize Release of Deposit</span>
                    </button>
                    <button
                      onClick={() => handleDecision('ADDITIONAL_INFO_REQUIRED')}
                      className="py-2 px-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      <span>Request Additional NOC</span>
                    </button>
                    <button
                      onClick={() => handleDecision('REJECTED')}
                      className="py-2 px-3 rounded-lg bg-rose-700 hover:bg-rose-600 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject Request</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Important Legal Notice */}
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[10px] text-slate-500">
                <strong>Legal Notice:</strong> In compliance with AICTE Approval Process Handbook (APH), approval of release removes the regulatory lien but does not execute immediate electronic treasury transfer until verified by the designated bank branch.
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl">
              Select a release request from the left column to inspect compliance documents.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
