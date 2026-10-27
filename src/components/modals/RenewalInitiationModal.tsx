'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { FdrRecord } from '@/lib/types';
import { formatINR, formatDate } from '@/lib/utils';
import { 
  X, 
  RefreshCw, 
  ArrowRight, 
  Building, 
  Landmark, 
  Calendar, 
  FileText,
  CheckCircle
} from 'lucide-react';

interface RenewalInitiationModalProps {
  isOpen: boolean;
  onClose: () => void;
  fdr: FdrRecord | null;
}

export const RenewalInitiationModal: React.FC<RenewalInitiationModalProps> = ({
  isOpen,
  onClose,
  fdr
}) => {
  const { currentUser, createRenewal } = useApp();

  const [proposedNumber, setProposedNumber] = useState('');
  const [proposedBank, setProposedBank] = useState('');
  const [proposedBranch, setProposedBranch] = useState('');
  const [proposedAmount, setProposedAmount] = useState<number>(0);
  const [proposedIssueDate, setProposedIssueDate] = useState('');
  const [proposedMaturityDate, setProposedMaturityDate] = useState('');
  const [reason, setReason] = useState('Approaching maturity date; continuous AICTE affiliation security rollover.');

  // Pre-fill when fdr changes
  const [prevFdrId, setPrevFdrId] = useState<string | null>(null);
  if (fdr && fdr.id !== prevFdrId) {
    setPrevFdrId(fdr.id);
    setProposedNumber(`${fdr.fdrNumber}-REN`);
    setProposedBank(fdr.issuingBank);
    setProposedBranch(fdr.branchName);
    setProposedAmount(fdr.principalAmount);
    setProposedIssueDate(fdr.maturityDate);
    
    // Maturity +5 years
    const mat = new Date(fdr.maturityDate);
    mat.setFullYear(mat.getFullYear() + 5);
    setProposedMaturityDate(mat.toISOString().split('T')[0]);
  }

  if (!isOpen || !fdr) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposedNumber.trim()) {
      alert('Please enter a proposed successor FDR reference number.');
      return;
    }

    createRenewal({
      originalFdrId: fdr.id,
      originalFdrNumber: fdr.fdrNumber,
      institutionId: fdr.institutionId,
      institutionName: fdr.institutionName,
      proposedFdrNumber: proposedNumber.trim(),
      proposedBank,
      proposedBranch,
      proposedAmount: Number(proposedAmount),
      proposedIssueDate,
      proposedMaturityDate,
      renewalReason: reason,
      supportingDocs: [
        {
          id: `ren-doc-${Date.now()}`,
          name: 'Provisional_Bank_Renewal_Advice.pdf',
          category: 'RENEWAL_ENDORSEMENT',
          fileType: 'application/pdf',
          fileSize: '1.2 MB',
          uploadDate: new Date().toISOString().split('T')[0],
          uploadedBy: currentUser.name,
          fileUrl: '/mock-documents/renewal-advice.pdf',
          checksum: 'sha256-ren-endorsement',
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
            <RefreshCw className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-slate-100">Initiate FDR Rollover / Renewal</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs overflow-y-auto max-h-[80vh]">
          {/* Predecessor Info Box */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Maturing Predecessor Instrument</span>
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-slate-200 text-sm">{fdr.fdrNumber}</span>
              <span className="font-mono text-cyan-400 font-bold">{formatINR(fdr.principalAmount)}</span>
            </div>
            <p className="text-slate-400 text-[11px]">{fdr.institutionName} • Matures {formatDate(fdr.maturityDate)}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Proposed Successor FDR Reference: *</label>
              <input
                type="text"
                value={proposedNumber}
                onChange={e => setProposedNumber(e.target.value)}
                placeholder="e.g. FDR/SBI/2026/99401"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Proposed Amount (INR):</label>
              <input
                type="number"
                value={proposedAmount}
                onChange={e => setProposedAmount(Number(e.target.value))}
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Issuing Bank:</label>
              <input
                type="text"
                value={proposedBank}
                onChange={e => setProposedBank(e.target.value)}
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Branch Name:</label>
              <input
                type="text"
                value={proposedBranch}
                onChange={e => setProposedBranch(e.target.value)}
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Rollover Issue Date:</label>
              <input
                type="date"
                value={proposedIssueDate}
                onChange={e => setProposedIssueDate(e.target.value)}
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Extended Maturity Date:</label>
              <input
                type="date"
                value={proposedMaturityDate}
                onChange={e => setProposedMaturityDate(e.target.value)}
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Justification for Rollover:</label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              rows={2}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-800/40 text-[11px] text-indigo-300">
            <strong>Unbroken History Guarantee:</strong> Submitting this renewal does not overwrite the predecessor instrument. A successor record will be linked upon regulatory officer verification.
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-900/30"
            >
              Submit Rollover Application
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
