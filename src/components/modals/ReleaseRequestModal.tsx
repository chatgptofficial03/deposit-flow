'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { FdrRecord } from '@/lib/types';
import { formatINR, formatDate } from '@/lib/utils';
import { 
  X, 
  CornerDownRight, 
  FileCheck, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck 
} from 'lucide-react';

interface ReleaseRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  fdr: FdrRecord | null;
}

export const ReleaseRequestModal: React.FC<ReleaseRequestModalProps> = ({
  isOpen,
  onClose,
  fdr
}) => {
  const { currentUser, createRelease } = useApp();

  const [reason, setReason] = useState<
    'COURSE_CLOSURE' | 'AFFILIATION_TERM_COMPLETED' | 'SURRENDERED_APPROVAL' | 'EXCESS_DEPOSIT_REFUND'
  >('AFFILIATION_TERM_COMPLETED');
  const [justification, setJustification] = useState(
    'Completion of mandatory 5-year lock-in period with no pending student grievances or regulatory deficiencies.'
  );

  const [nocObtained, setNocObtained] = useState(true);
  const [noPendingStudentDues, setNoPendingStudentDues] = useState(true);
  const [statutoryAuditCleared, setStatutoryAuditCleared] = useState(true);
  const [noCourtCasesPending, setNoCourtCasesPending] = useState(true);

  if (!isOpen || !fdr) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    createRelease({
      fdrId: fdr.id,
      fdrNumber: fdr.fdrNumber,
      institutionId: fdr.institutionId,
      institutionName: fdr.institutionName,
      principalAmount: fdr.principalAmount,
      reason,
      justification,
      compliancePrerequisites: {
        nocObtained,
        noPendingStudentDues,
        statutoryAuditCleared,
        noCourtCasesPending
      },
      supportingDocs: [
        {
          id: `rel-doc-${Date.now()}`,
          name: 'Regional_Office_NOC_Application.pdf',
          category: 'AICTE_APPROVAL',
          fileType: 'application/pdf',
          fileSize: '1.4 MB',
          uploadDate: new Date().toISOString().split('T')[0],
          uploadedBy: currentUser.name,
          fileUrl: '/mock-documents/noc.pdf',
          checksum: 'sha256-noc-cert',
          isVerified: false
        }
      ],
      submittedBy: currentUser.name
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CornerDownRight className="w-5 h-5 text-purple-400" />
            <h2 className="text-base font-bold text-slate-100">Apply for Security Deposit Release / Refund</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs overflow-y-auto max-h-[80vh]">
          {/* FDR Overview Card */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Deposit Under Release Claim</span>
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-slate-200 text-sm">{fdr.fdrNumber}</span>
              <span className="font-mono text-purple-400 font-bold text-sm">{formatINR(fdr.principalAmount)}</span>
            </div>
            <p className="text-slate-400 text-[11px]">{fdr.institutionName} • {fdr.issuingBank}</p>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Reason for Release Claim:</label>
            <select
              value={reason}
              onChange={e => setReason(e.target.value as 'COURSE_CLOSURE' | 'AFFILIATION_TERM_COMPLETED' | 'SURRENDERED_APPROVAL' | 'EXCESS_DEPOSIT_REFUND')}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500"
            >
              <option value="AFFILIATION_TERM_COMPLETED">Statutory Lock-in Period Completed (5-Year Term)</option>
              <option value="COURSE_CLOSURE">Authorized Course / Programme Closure</option>
              <option value="SURRENDERED_APPROVAL">Surrender of Institutional Approval</option>
              <option value="EXCESS_DEPOSIT_REFUND">Excess Deposit Realignment Refund</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Detailed Justification & Undertaking:</label>
            <textarea
              value={justification}
              onChange={e => setJustification(e.target.value)}
              rows={3}
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>

          {/* Statutory Checklist Checkboxes */}
          <div className="space-y-2 pt-1 border-t border-slate-800">
            <span className="font-semibold text-slate-300 block">Mandatory Statutory Self-Declarations:</span>
            
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={nocObtained}
                onChange={e => setNocObtained(e.target.checked)}
                className="rounded border-slate-700 text-purple-600 focus:ring-purple-500 w-4 h-4 bg-slate-800 mt-0.5"
              />
              <span className="text-slate-300 leading-tight">
                AICTE Regional Office No-Objection Certificate (NOC) has been procured or applied for.
              </span>
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={noPendingStudentDues}
                onChange={e => setNoPendingStudentDues(e.target.checked)}
                className="rounded border-slate-700 text-purple-600 focus:ring-purple-500 w-4 h-4 bg-slate-800 mt-0.5"
              />
              <span className="text-slate-300 leading-tight">
                No student grievance, fee refund disputes, or statutory employee dues are outstanding.
              </span>
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={statutoryAuditCleared}
                onChange={e => setStatutoryAuditCleared(e.target.checked)}
                className="rounded border-slate-700 text-purple-600 focus:ring-purple-500 w-4 h-4 bg-slate-800 mt-0.5"
              />
              <span className="text-slate-300 leading-tight">
                Statutory Financial Audit Committee clearance and Board Resolution are attached.
              </span>
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={noCourtCasesPending}
                onChange={e => setNoCourtCasesPending(e.target.checked)}
                className="rounded border-slate-700 text-purple-600 focus:ring-purple-500 w-4 h-4 bg-slate-800 mt-0.5"
              />
              <span className="text-slate-300 leading-tight">
                Institution certifies no High Court / Supreme Court stay order or injunction is active against this instrument.
              </span>
            </label>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-900/30"
            >
              Submit Release Claim
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
