'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { FdrRecord } from '@/lib/types';
import { 
  formatINR, 
  formatDate, 
  getMaturityBadgeStyle, 
  getLifecycleBadgeStyle 
} from '@/lib/utils';
import { 
  X, 
  Building, 
  Landmark, 
  FileText, 
  Calendar, 
  ShieldCheck, 
  AlertTriangle, 
  RefreshCw, 
  CornerDownRight, 
  Clock, 
  CheckCircle2, 
  History,
  FileCheck,
  ExternalLink,
  Lock
} from 'lucide-react';

interface RecordDetailDrawerProps {
  fdrId: string | null;
  onClose: () => void;
  onOpenRenewalModal: (fdr: FdrRecord) => void;
  onOpenReleaseModal: (fdr: FdrRecord) => void;
  onNavigateToVerification?: (fdrId: string) => void;
}

export const RecordDetailDrawer: React.FC<RecordDetailDrawerProps> = ({
  fdrId,
  onClose,
  onOpenRenewalModal,
  onOpenReleaseModal,
  onNavigateToVerification
}) => {
  const { currentUser, fdrs, auditLogs } = useApp();

  const [activeTab, setActiveTab] = useState<'DETAILS' | 'DOCUMENTS' | 'DISCREPANCIES' | 'AUDIT'>('DETAILS');

  if (!fdrId) return null;

  const fdr = fdrs.find(f => f.id === fdrId);
  if (!fdr) return null;

  const maturityBadge = getMaturityBadgeStyle(fdr.maturityStatus);
  const lifecycleBadge = getLifecycleBadgeStyle(fdr.lifecycleStatus);

  // Filter audit logs specifically for this FDR
  const fdrAuditEvents = auditLogs.filter(a => a.entityId === fdr.id || a.summary.includes(fdr.fdrNumber));

  const predecessorFdr = fdr.predecessorFdrId ? fdrs.find(f => f.id === fdr.predecessorFdrId) : null;
  const successorFdr = fdr.successorFdrId ? fdrs.find(f => f.id === fdr.successorFdrId) : null;

  const isOfficerOrAdmin = currentUser.role === 'REGULATORY_ADMIN' || currentUser.role === 'REGULATORY_OFFICER';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-slate-900 border-l border-slate-800 text-slate-100 flex flex-col h-full shadow-2xl animate-in slide-in-from-right duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-base font-bold text-slate-100">{fdr.fdrNumber}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold border ${lifecycleBadge}`}>
                {fdr.lifecycleStatus.replace(/_/g, ' ')}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${maturityBadge.bg}`}>
                {maturityBadge.label}
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-300 mt-1">{fdr.institutionName}</p>
            <p className="text-[11px] text-slate-400 font-mono">AICTE Permanent Code: {fdr.institutionCode}</p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 px-5 border-b border-slate-800 bg-slate-900/60 text-xs">
          <button
            onClick={() => setActiveTab('DETAILS')}
            className={`py-2.5 px-3 font-semibold border-b-2 transition-all ${
              activeTab === 'DETAILS'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Instrument Details
          </button>
          <button
            onClick={() => setActiveTab('DOCUMENTS')}
            className={`py-2.5 px-3 font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'DOCUMENTS'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Attached Documents</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">
              {fdr.documents.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('DISCREPANCIES')}
            className={`py-2.5 px-3 font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'DISCREPANCIES'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Discrepancies</span>
            {fdr.discrepancies.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-900 text-rose-300 font-bold">
                {fdr.discrepancies.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('AUDIT')}
            className={`py-2.5 px-3 font-semibold border-b-2 transition-all ${
              activeTab === 'AUDIT'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Audit Trail
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 text-xs">
          {activeTab === 'DETAILS' && (
            <div className="space-y-4">
              {/* Financial Highlight Card */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Principal Deposit Amount:</span>
                  <p className="text-xl font-bold font-mono text-cyan-400 mt-0.5">{formatINR(fdr.principalAmount)}</p>
                  <p className="text-[10px] text-slate-400">{fdr.interestRate}% Interest p.a. • {fdr.depositTermMonths} Months Term</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Maturity Status:</span>
                  <p className="font-mono text-slate-200 mt-0.5 text-sm font-bold">{formatDate(fdr.maturityDate)}</p>
                  <p className={`text-[11px] font-semibold ${
                    fdr.daysUntilMaturity <= 7 ? 'text-rose-400' : 'text-slate-400'
                  }`}>
                    {fdr.daysUntilMaturity > 0 ? `${fdr.daysUntilMaturity} days until maturity` : `Matured (${Math.abs(fdr.daysUntilMaturity)}d ago)`}
                  </p>
                </div>
              </div>

              {/* Bank & Branch Specs */}
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
                <span className="font-semibold text-slate-200 block text-xs">Banking & Account Details</span>
                <div className="grid grid-cols-2 gap-3 text-[11px]">
                  <div>
                    <span className="text-slate-400">Issuing Bank:</span>
                    <p className="font-semibold text-slate-200">{fdr.issuingBank}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Branch Name:</span>
                    <p className="text-slate-200">{fdr.branchName}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Bank IFSC:</span>
                    <p className="font-mono text-slate-200">{fdr.ifscCode}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Account (Masked):</span>
                    <p className="font-mono text-slate-200">{fdr.accountNumberMasked}</p>
                  </div>
                </div>
              </div>

              {/* Joint Lien Holding */}
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1.5">
                <span className="font-semibold text-slate-200 block text-xs">AICTE Joint Lien Endorsement</span>
                <p className={`font-medium ${
                  fdr.jointHolderName.toLowerCase().includes('aicte')
                    ? 'text-emerald-400'
                    : 'text-rose-400 font-bold'
                }`}>
                  {fdr.jointHolderName}
                </p>
                <p className="text-[10px] text-slate-500">
                  Lien registration ensures encashment requires prior regulatory order.
                </p>
              </div>

              {/* SFMS Bank Gateway Status */}
              {fdr.bankVerification && (
                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200">Interbank SFMS Lien Gateway Confirmation</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold">
                      CONFIRMED
                    </span>
                  </div>
                  <p className="font-mono text-slate-400">Gateway Ref: {fdr.bankVerification.referenceCode}</p>
                  <p className="text-slate-300 italic">{fdr.bankVerification.issuingBankResponse}</p>
                </div>
              )}

              {/* Lineage Tree (Predecessor / Successor) */}
              {(predecessorFdr || successorFdr) && (
                <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-800/40 space-y-2">
                  <span className="font-semibold text-indigo-300 block text-xs">Rollover Lineage Tree</span>
                  {predecessorFdr && (
                    <div className="text-[11px] text-slate-300">
                      <span className="text-slate-500">Predecessor Instrument:</span>{' '}
                      <strong className="font-mono text-slate-200">{predecessorFdr.fdrNumber}</strong> (Archived upon renewal)
                    </div>
                  )}
                  {successorFdr && (
                    <div className="text-[11px] text-slate-300">
                      <span className="text-slate-500">Successor Instrument:</span>{' '}
                      <strong className="font-mono text-indigo-300">{successorFdr.fdrNumber}</strong> (Active successor)
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'DOCUMENTS' && (
            <div className="space-y-3">
              {fdr.documents.length === 0 ? (
                <div className="p-8 text-center text-slate-500 bg-slate-950 rounded-xl">
                  No documents attached to this record.
                </div>
              ) : (
                fdr.documents.map(doc => (
                  <div key={doc.id} className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-cyan-400" />
                        <span className="font-semibold text-slate-200 text-xs">{doc.name}</span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700">
                        {doc.fileSize}
                      </span>
                    </div>

                    <div className="text-[10px] text-slate-400 flex items-center justify-between">
                      <span>Uploaded by {doc.uploadedBy} on {doc.uploadDate}</span>
                      <span className="font-mono">Checksum: {doc.checksum.slice(0, 16)}...</span>
                    </div>

                    {doc.ocrExtractedData && (
                      <div className="p-2.5 rounded-lg bg-slate-950 font-mono text-[10px] text-slate-300 space-y-0.5">
                        <span className="text-cyan-400 font-bold block">OCR Extracted Metadata:</span>
                        <div>FDR Ref: {doc.ocrExtractedData.fdrNumber}</div>
                        <div>Bank: {doc.ocrExtractedData.bankName}</div>
                        <div>Amount: {formatINR(doc.ocrExtractedData.amount || 0)}</div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'DISCREPANCIES' && (
            <div className="space-y-3">
              {fdr.discrepancies.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-slate-950 rounded-xl">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  No discrepancies flagged against this instrument.
                </div>
              ) : (
                fdr.discrepancies.map(d => (
                  <div key={d.id} className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-800/40 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-rose-300 text-xs">{d.title}</span>
                      <span className="text-[10px] px-2 py-0.2 rounded bg-rose-900 text-rose-200 font-semibold font-mono">
                        {d.severity}
                      </span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">{d.description}</p>
                    <div className="text-[10px] text-slate-500 pt-1 border-t border-rose-900/40">
                      Reported by {d.reportedBy} on {formatDate(d.reportedAt)}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'AUDIT' && (
            <div className="space-y-3">
              {fdrAuditEvents.length === 0 ? (
                <div className="p-8 text-center text-slate-500 bg-slate-950 rounded-xl">
                  No historical audit entries for this specific instrument.
                </div>
              ) : (
                fdrAuditEvents.map(a => (
                  <div key={a.id} className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-slate-200">{a.action}</span>
                      <span className="font-mono text-slate-500 text-[10px]">
                        {new Date(a.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-slate-300">{a.summary}</p>
                    <div className="text-[10px] text-slate-500">
                      Actor: {a.actorName} ({a.actorRole})
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Drawer Action Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            {isOfficerOrAdmin && (fdr.verificationStatus === 'PENDING' || fdr.lifecycleStatus === 'UNDER_VERIFICATION') && (
              <button
                onClick={() => {
                  onClose();
                  if (onNavigateToVerification) onNavigateToVerification(fdr.id);
                }}
                className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Conduct Scrutiny</span>
              </button>
            )}

            {fdr.lifecycleStatus === 'ACTIVE' && (
              <>
                <button
                  onClick={() => {
                    onClose();
                    onOpenRenewalModal(fdr);
                  }}
                  className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Renew Instrument</span>
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onOpenReleaseModal(fdr);
                  }}
                  className="px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <CornerDownRight className="w-3.5 h-3.5" />
                  <span>Request Release</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
