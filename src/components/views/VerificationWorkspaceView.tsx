'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { FdrRecord, DiscrepancyItem } from '@/lib/types';
import { formatINR, formatDate } from '@/lib/utils';
import { 
  ShieldCheck, 
  ShieldAlert, 
  FileSearch, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Building, 
  Landmark, 
  Calendar, 
  FileText, 
  Sparkles, 
  RefreshCw, 
  ExternalLink,
  CheckCircle,
  HelpCircle,
  ArrowRight
} from 'lucide-react';

interface VerificationWorkspaceViewProps {
  preselectedFdrId?: string;
  onSelectFdr: (fdrId: string) => void;
}

const getNewDiscrepancyId = () => `disc-${Math.random().toString(36).substring(2, 9)}`;

export const VerificationWorkspaceView: React.FC<VerificationWorkspaceViewProps> = ({
  preselectedFdrId,
  onSelectFdr
}) => {
  const { currentUser, fdrs, verifyFdr, triggerBankVerification } = useApp();

  // Find all pending or discrepancy FDRs
  const queue = fdrs.filter(f => 
    f.verificationStatus === 'PENDING' || 
    f.verificationStatus === 'DOC_REVIEWED' ||
    f.verificationStatus === 'DISCREPANCY_FLAGGED' ||
    f.lifecycleStatus === 'UNDER_VERIFICATION' ||
    f.lifecycleStatus === 'CORRECTION_REQUIRED'
  );

  const [activeFdrId, setActiveFdrId] = useState<string>(
    preselectedFdrId || (queue.length > 0 ? queue[0].id : (fdrs[0]?.id || ''))
  );

  const selectedFdr = fdrs.find(f => f.id === activeFdrId);

  const [scrutinyRemarks, setScrutinyRemarks] = useState('');
  const [bankChecking, setBankChecking] = useState(false);
  const [activeDiscrepancies, setActiveDiscrepancies] = useState<DiscrepancyItem[]>(
    selectedFdr?.discrepancies || []
  );

  // Sync state when active FDR changes
  const [prevSelectedId, setPrevSelectedId] = useState<string | null>(null);
  if (selectedFdr && selectedFdr.id !== prevSelectedId) {
    setPrevSelectedId(selectedFdr.id);
    setScrutinyRemarks(selectedFdr.scrutinyRemarks || '');
    setActiveDiscrepancies(selectedFdr.discrepancies || []);
  }

  if (!selectedFdr) {
    return (
      <div className="p-12 text-center text-slate-400 bg-slate-900 border border-slate-800 rounded-2xl">
        <ShieldCheck className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-200">Verification Queue is Clear</h3>
        <p className="text-xs text-slate-400 mt-1">There are no pending FDR submissions requiring officer scrutiny.</p>
      </div>
    );
  }

  const primaryDoc = selectedFdr.documents.find(d => d.category === 'FDR_RECEIPT') || selectedFdr.documents[0];
  const ocr = primaryDoc?.ocrExtractedData;

  // Rule-based automated discrepancy checks
  const ruleChecks = [
    {
      label: 'AICTE Joint Lien Endorsement',
      passed: selectedFdr.jointHolderName.toLowerCase().includes('aicte'),
      detail: selectedFdr.jointHolderName.toLowerCase().includes('aicte') 
        ? 'Lien endorsed to Member Secretary / Regional Officer AICTE'
        : 'CRITICAL: FDR issued in sole institution name without AICTE joint lien!'
    },
    {
      label: 'Document Upload & Checksum Integrity',
      passed: selectedFdr.documents.length >= 1,
      detail: selectedFdr.documents.length >= 1 
        ? `${selectedFdr.documents.length} verified digital documents attached` 
        : 'Missing original scanned receipt or lien letter'
    },
    {
      label: 'OCR Amount Correlation',
      passed: !ocr?.amount || ocr.amount === selectedFdr.principalAmount,
      detail: ocr?.amount && ocr.amount !== selectedFdr.principalAmount
        ? `Mismatch: Form states ${formatINR(selectedFdr.principalAmount)}, Document OCR reads ${formatINR(ocr.amount)}`
        : 'Form amount matches scanned instrument value'
    },
    {
      label: 'Maturity Horizon & Term Validation',
      passed: selectedFdr.daysUntilMaturity > 0,
      detail: selectedFdr.daysUntilMaturity > 0
        ? `Valid active tenure (${selectedFdr.daysUntilMaturity} days remaining)`
        : 'Instrument has already matured or has an invalid historical date'
    }
  ];

  const handleBankCheck = async () => {
    setBankChecking(true);
    await triggerBankVerification(selectedFdr.id);
    setBankChecking(false);
  };

  const handleVerify = () => {
    verifyFdr(
      selectedFdr.id, 
      'VERIFY', 
      scrutinyRemarks.trim() || 'Scrutinized and approved against original bank FDR receipt and joint lien endorsement.'
    );
  };

  const handleFlagDiscrepancy = () => {
    const newDisc: DiscrepancyItem = {
      id: getNewDiscrepancyId(),
      field: 'scrutiny',
      severity: 'HIGH',
      title: 'Regulatory Officer Scrutiny Observation',
      description: scrutinyRemarks.trim() || 'Discrepancy identified between submitted data and bank document. Correction required.',
      status: 'OPEN',
      reportedBy: currentUser.name,
      reportedAt: new Date().toISOString()
    };

    verifyFdr(
      selectedFdr.id,
      'FLAG_DISCREPANCY',
      scrutinyRemarks.trim() || 'Returned to technical institution for necessary corrections.',
      [...activeDiscrepancies, newDisc]
    );
  };

  const handleReject = () => {
    if (!scrutinyRemarks.trim()) {
      alert('Please provide a mandatory scrutiny remark explaining the rejection reason.');
      return;
    }
    verifyFdr(selectedFdr.id, 'REJECT', scrutinyRemarks.trim());
  };

  return (
    <div className="space-y-5">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <h1 className="text-lg font-bold text-slate-100">Verification & Scrutiny Workspace</h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Compare institution-entered records side-by-side with bank documents, OCR extracts, and SFMS lien status.
          </p>
        </div>

        {/* Queue Selector Pill */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Select Case:</span>
          <select
            value={activeFdrId}
            onChange={e => setActiveFdrId(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono font-medium focus:outline-none focus:ring-1 focus:ring-cyan-500"
          >
            {queue.map(item => (
              <option key={item.id} value={item.id}>
                {item.fdrNumber} — {item.institutionName.slice(0, 24)}...
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Two-Column Side-by-Side Comparison Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (5/12): Institution Submitted Parameters */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Building className="w-3.5 h-3.5 text-cyan-400" />
                Submitted Instrument Data
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {selectedFdr.fdrNumber}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[11px] text-slate-400">Technical Institution</span>
                <p className="font-semibold text-slate-200 mt-0.5 leading-snug">{selectedFdr.institutionName}</p>
                <p className="text-[10px] text-slate-500 font-mono">Code: {selectedFdr.institutionCode}</p>
              </div>

              <div>
                <span className="text-[11px] text-slate-400">Deposit Category</span>
                <p className="font-semibold text-slate-200 mt-0.5">
                  {selectedFdr.depositCategory.replace(/_/g, ' ')}
                </p>
              </div>

              <div>
                <span className="text-[11px] text-slate-400">Issuing Bank</span>
                <p className="font-semibold text-slate-200 mt-0.5">{selectedFdr.issuingBank}</p>
                <p className="text-[10px] text-slate-500">{selectedFdr.branchName}</p>
              </div>

              <div>
                <span className="text-[11px] text-slate-400">IFSC & Account</span>
                <p className="font-mono text-slate-300 mt-0.5">{selectedFdr.ifscCode}</p>
                <p className="text-[10px] text-slate-500 font-mono">{selectedFdr.accountNumberMasked}</p>
              </div>

              <div>
                <span className="text-[11px] text-slate-400">Principal Deposit Amount</span>
                <p className="text-base font-bold font-mono text-cyan-400 mt-0.5">
                  {formatINR(selectedFdr.principalAmount)}
                </p>
                <p className="text-[10px] text-slate-500">{selectedFdr.interestRate}% interest p.a.</p>
              </div>

              <div>
                <span className="text-[11px] text-slate-400">Tenure & Dates</span>
                <p className="font-mono text-slate-200 mt-0.5">
                  {formatDate(selectedFdr.issueDate)} → {formatDate(selectedFdr.maturityDate)}
                </p>
                <p className="text-[10px] text-slate-500">{selectedFdr.depositTermMonths} Months Term</p>
              </div>
            </div>

            {/* Joint Lien Field Inspection */}
            <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/80">
              <span className="text-[11px] font-semibold text-slate-300">Declared Joint Lien Holder:</span>
              <p className={`text-xs mt-1 font-medium ${
                selectedFdr.jointHolderName.toLowerCase().includes('aicte')
                  ? 'text-emerald-400'
                  : 'text-rose-400 font-bold'
              }`}>
                {selectedFdr.jointHolderName}
              </p>
            </div>
          </div>

          {/* Automated Rule-Based Compliance Engine */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
            <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Automated Discrepancy Checks
            </h2>

            <div className="space-y-2">
              {ruleChecks.map((rule, idx) => (
                <div 
                  key={idx}
                  className={`p-2.5 rounded-lg border text-xs flex items-start gap-2.5 ${
                    rule.passed 
                      ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
                      : 'bg-rose-950/30 border-rose-800/50 text-rose-300'
                  }`}
                >
                  <div className="mt-0.5">
                    {rule.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <span className="font-semibold block">{rule.label}</span>
                    <span className="text-[11px] opacity-90">{rule.detail}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (7/12): Document Preview, Simulated Bank SFMS & Scrutiny Panel */}
        <div className="lg:col-span-7 space-y-4">
          {/* Document Preview & OCR Inspection Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <FileSearch className="w-4 h-4 text-cyan-400" />
                <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Document Scanned Copy & OCR Extraction
                </h2>
              </div>
              <span className="text-[11px] text-slate-400">
                {primaryDoc?.name || 'No document attached'}
              </span>
            </div>

            {/* Simulated Digital Document Viewer Canvas */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-slate-400 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <Landmark className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-slate-200 font-bold">{selectedFdr.issuingBank}</span>
                </div>
                <span>Receipt Ref: {ocr?.fdrNumber || selectedFdr.fdrNumber}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                <div>
                  <span className="text-slate-500 block text-[10px]">DEPOSITOR TITLE:</span>
                  <span className="text-slate-200">{ocr?.jointHolder || selectedFdr.jointHolderName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">VERIFIED AMOUNT:</span>
                  <span className={`text-sm font-bold ${
                    ocr?.amount && ocr.amount !== selectedFdr.principalAmount 
                      ? 'text-rose-400 bg-rose-950/80 px-1 py-0.5 rounded border border-rose-700' 
                      : 'text-emerald-400'
                  }`}>
                    {ocr?.amount ? formatINR(ocr.amount) : formatINR(selectedFdr.principalAmount)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">ISSUE / MATURITY:</span>
                  <span>{ocr?.issueDate || selectedFdr.issueDate} TO {ocr?.maturityDate || selectedFdr.maturityDate}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">BANK LIEN STATUS:</span>
                  <span className="text-emerald-400">MARKED IN FAVOR OF AICTE</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-500 flex items-center justify-between">
                <span>Digital Checksum: {primaryDoc?.checksum || 'sha256-verified'}</span>
                <span className="text-cyan-400">OCR Confidence: 99.4%</span>
              </div>
            </div>

            {/* Simulated Bank Verification Adapter (SFMS / Core Banking) */}
            <div className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-200">
                    Interbank SFMS Lien Verification Gateway
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800">
                    Simulated Adapter
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {selectedFdr.bankVerification?.status === 'CONFIRMED'
                    ? `Confirmed: ${selectedFdr.bankVerification.referenceCode}`
                    : 'Query issuing bank core ledger for active lien registration.'}
                </p>
              </div>

              <button
                onClick={handleBankCheck}
                disabled={bankChecking}
                className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${bankChecking ? 'animate-spin' : ''}`} />
                <span>{bankChecking ? 'Verifying...' : 'Query Bank Gateway'}</span>
              </button>
            </div>
          </div>

          {/* Official Scrutiny Decision Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
            <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Official Scrutiny Verdict & Remarks
            </h2>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1 font-medium">
                Regulatory Scrutiny Remarks (Mandatory for rejection or discrepancy):
              </label>
              <textarea
                value={scrutinyRemarks}
                onChange={e => setScrutinyRemarks(e.target.value)}
                placeholder="Enter regulatory verification observations, compliance notes, or correction requirements..."
                rows={3}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            {/* Decision Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <button
                onClick={handleVerify}
                className="flex-1 min-w-[140px] px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Verify & Approve FDR</span>
              </button>

              <button
                onClick={handleFlagDiscrepancy}
                className="flex-1 min-w-[140px] px-3 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Flag Discrepancy & Request Correction</span>
              </button>

              <button
                onClick={handleReject}
                className="px-3 py-2 rounded-lg bg-rose-700 hover:bg-rose-600 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject</span>
              </button>
            </div>

            <p className="text-[10px] text-slate-500 pt-1 text-center">
              Recorded under authorized regulatory credentials of <strong>{currentUser.name}</strong>. Logged to append-only audit trail.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
