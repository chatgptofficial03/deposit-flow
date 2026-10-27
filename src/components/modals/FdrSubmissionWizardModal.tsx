'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { DepositCategory, FdrDocument } from '@/lib/types';
import { formatINR, formatDate } from '@/lib/utils';
import { 
  X, 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  Upload, 
  FileText, 
  ShieldCheck, 
  AlertTriangle, 
  Sparkles, 
  Building, 
  Landmark, 
  Calendar,
  CheckCircle2
} from 'lucide-react';

interface FdrSubmissionWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (fdrId: string) => void;
}

export const FdrSubmissionWizardModal: React.FC<FdrSubmissionWizardModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { currentUser, institutions, createFdr, fdrs } = useApp();

  const [step, setStep] = useState(1);

  // Form State
  const [institutionId, setInstitutionId] = useState(
    currentUser.institutionId || institutions[0].id
  );
  const [depositCategory, setDepositCategory] = useState<DepositCategory>('MANDATORY_ENDOWMENT');
  const [fdrNumber, setFdrNumber] = useState('');
  const [issuingBank, setIssuingBank] = useState('State Bank of India');
  const [branchName, setBranchName] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [principalAmount, setPrincipalAmount] = useState<number>(3500000);
  const [interestRate, setInterestRate] = useState<number>(7.1);
  const [issueDate, setIssueDate] = useState('2026-10-20');
  const [maturityDate, setMaturityDate] = useState('2031-10-20');
  const [depositTermMonths, setDepositTermMonths] = useState(60);
  const [autoRenewal, setAutoRenewal] = useState(true);
  const [jointHolderName, setJointHolderName] = useState(
    'Member Secretary, AICTE New Delhi & Institution Joint Account'
  );

  // Uploaded docs
  const [uploadedFiles, setUploadedFiles] = useState<FdrDocument[]>([
    {
      id: 'doc-sample-init-1',
      name: 'Scanned_FDR_Instrument_Copy.pdf',
      category: 'FDR_RECEIPT',
      fileType: 'application/pdf',
      fileSize: '1.8 MB',
      uploadDate: '2026-10-20',
      uploadedBy: currentUser.name,
      fileUrl: '/mock-documents/sample-fdr.pdf',
      checksum: 'sha256-f8a92b3c4d5e6f7a',
      isVerified: false,
      ocrExtractedData: {
        fdrNumber: fdrNumber || 'FDR/SBI/2026/PROV',
        bankName: issuingBank,
        amount: principalAmount,
        issueDate: issueDate,
        maturityDate: maturityDate,
        jointHolder: jointHolderName
      }
    }
  ]);

  if (!isOpen) return null;

  const currentInstitution = institutions.find(i => i.id === institutionId) || institutions[0];

  // Validation Checks
  const duplicateFdr = fdrs.find(f => f.fdrNumber.trim().toLowerCase() === fdrNumber.trim().toLowerCase());
  const isValidAmount = principalAmount > 0;
  const isValidDates = new Date(maturityDate) > new Date(issueDate);
  const hasLienMarked = jointHolderName.toLowerCase().includes('aicte');

  const handleNext = () => {
    if (step === 2) {
      if (!fdrNumber.trim()) {
        alert('Please enter a valid FDR reference number.');
        return;
      }
      if (duplicateFdr) {
        alert('An FDR with this reference number already exists in the registry.');
        return;
      }
    }
    if (step < 6) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleFinalSubmit = () => {
    const newFdrId = createFdr({
      fdrNumber: fdrNumber.trim() || `FDR/${issuingBank.slice(0, 3).toUpperCase()}/${Date.now().toString().slice(-5)}`,
      institutionId: currentInstitution.id,
      institutionName: currentInstitution.name,
      institutionCode: currentInstitution.code,
      depositCategory,
      issuingBank,
      branchName: branchName.trim() || 'Main City Commercial Branch',
      ifscCode: ifscCode.trim() || 'SBIN0001042',
      accountNumberMasked: accountNumber.trim() ? `•••• •••• ${accountNumber.slice(-4)}` : '•••• •••• 8841',
      principalAmount: Number(principalAmount),
      currency: 'INR',
      interestRate: Number(interestRate),
      issueDate,
      maturityDate,
      depositTermMonths: Number(depositTermMonths),
      autoRenewal,
      jointHolderName,
      lifecycleStatus: 'UNDER_VERIFICATION',
      verificationStatus: 'PENDING',
      maturityStatus: 'HEALTHY',
      releaseStatus: 'NONE',
      documents: uploadedFiles,
      discrepancies: [],
      createdBy: currentUser.name
    });

    onSuccess(newFdrId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                Step {step} of 6
              </span>
              <h2 className="text-base font-bold text-slate-100">Submit Security Deposit / FDR Record</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Multi-step structured submission with automated integrity validation</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Tracker */}
        <div className="px-6 py-2.5 bg-slate-900/60 border-b border-slate-800/80">
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-400">
            <span className={step >= 1 ? 'text-cyan-400 font-bold' : ''}>1. Institution</span>
            <ChevronRight className="w-3 h-3 text-slate-600" />
            <span className={step >= 2 ? 'text-cyan-400 font-bold' : ''}>2. Bank & Ref</span>
            <ChevronRight className="w-3 h-3 text-slate-600" />
            <span className={step >= 3 ? 'text-cyan-400 font-bold' : ''}>3. Financials</span>
            <ChevronRight className="w-3 h-3 text-slate-600" />
            <span className={step >= 4 ? 'text-cyan-400 font-bold' : ''}>4. Documents</span>
            <ChevronRight className="w-3 h-3 text-slate-600" />
            <span className={step >= 5 ? 'text-cyan-400 font-bold' : ''}>5. Rule Check</span>
            <ChevronRight className="w-3 h-3 text-slate-600" />
            <span className={step >= 6 ? 'text-cyan-400 font-bold' : ''}>6. Confirm</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
          {/* STEP 1: Institution & Deposit Category */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Select Technical Institution:</label>
                <select
                  value={institutionId}
                  onChange={e => setInstitutionId(e.target.value)}
                  disabled={Boolean(currentUser.institutionId)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                >
                  {institutions.map(inst => (
                    <option key={inst.id} value={inst.id}>
                      {inst.code} — {inst.name} ({inst.city}, {inst.state})
                    </option>
                  ))}
                </select>
                {currentUser.institutionId && (
                  <p className="text-[10px] text-slate-500 mt-1">Locked to authorized institutional session.</p>
                )}
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Deposit Category Mandate:</label>
                <select
                  value={depositCategory}
                  onChange={e => setDepositCategory(e.target.value as DepositCategory)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                >
                  <option value="MANDATORY_ENDOWMENT">Mandatory Institute Endowment Fund (AICTE APH Clause 4.1)</option>
                  <option value="NEW_PROGRAMME_APPROVAL">Security Deposit for New Programme / Intake Expansion</option>
                  <option value="LAND_AND_BUILDING">Security Deposit for Land & Building Norms Compliance</option>
                  <option value="DEFICIENCY_SECURITY">Deficiency Rectification Security Deposit</option>
                </select>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1.5 text-slate-300">
                <span className="font-semibold text-cyan-400 block">AICTE Regulation Mandate Note:</span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Fixed Deposit Receipts submitted toward statutory requirements must be held in scheduled commercial banks and strictly lien-marked jointly in favor of the Member Secretary / Regional Officer, AICTE.
                </p>
              </div>
            </div>
          )}

          {/* STEP 2: Bank & Instrument Info */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Issuing Scheduled Commercial Bank:</label>
                <select
                  value={issuingBank}
                  onChange={e => setIssuingBank(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                >
                  <option value="State Bank of India">State Bank of India (SBI)</option>
                  <option value="Punjab National Bank">Punjab National Bank (PNB)</option>
                  <option value="Bank of Baroda">Bank of Baroda (BOB)</option>
                  <option value="Canara Bank">Canara Bank</option>
                  <option value="HDFC Bank">HDFC Bank</option>
                  <option value="ICICI Bank">ICICI Bank</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">FDR / Certificate Number: *</label>
                  <input
                    type="text"
                    value={fdrNumber}
                    onChange={e => setFdrNumber(e.target.value)}
                    placeholder="e.g. FDR/SBI/2026/55490"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                  {duplicateFdr && (
                    <p className="text-[10px] text-rose-400 mt-1">Warning: Reference already exists in registry!</p>
                  )}
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Branch Name & City:</label>
                  <input
                    type="text"
                    value={branchName}
                    onChange={e => setBranchName(e.target.value)}
                    placeholder="e.g. Shivaji Nagar Branch, Pune"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Bank IFSC Code:</label>
                  <input
                    type="text"
                    value={ifscCode}
                    onChange={e => setIfscCode(e.target.value.toUpperCase())}
                    placeholder="e.g. SBIN0001042"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Bank Term Deposit Account No:</label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={e => setAccountNumber(e.target.value)}
                    placeholder="e.g. 39482910442"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Financial Details & Dates */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Principal Deposit Amount (INR): *</label>
                  <input
                    type="number"
                    value={principalAmount}
                    onChange={e => setPrincipalAmount(Number(e.target.value))}
                    step="50000"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                  <p className="text-[11px] text-cyan-400 font-mono mt-1 font-semibold">
                    Amount: {formatINR(principalAmount, true)} ({formatINR(principalAmount)})
                  </p>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Interest Rate (% per annum):</label>
                  <input
                    type="number"
                    value={interestRate}
                    onChange={e => setInterestRate(Number(e.target.value))}
                    step="0.05"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Date of Issue: *</label>
                  <input
                    type="date"
                    value={issueDate}
                    onChange={e => setIssueDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Maturity Date: *</label>
                  <input
                    type="date"
                    value={maturityDate}
                    onChange={e => setMaturityDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Joint Holder Declaration (Mandatory AICTE Lien):</label>
                <input
                  type="text"
                  value={jointHolderName}
                  onChange={e => setJointHolderName(e.target.value)}
                  placeholder="e.g. Member Secretary, AICTE New Delhi & Institution Name"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="autoRenew"
                  checked={autoRenewal}
                  onChange={e => setAutoRenewal(e.target.checked)}
                  className="rounded border-slate-700 text-cyan-600 focus:ring-cyan-500 w-4 h-4 bg-slate-800"
                />
                <label htmlFor="autoRenew" className="text-slate-300 text-xs">
                  Enable bank auto-renewal instructions upon maturity
                </label>
              </div>
            </div>
          )}

          {/* STEP 4: Document Upload & Simulated OCR */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-slate-700 hover:border-cyan-500/80 rounded-2xl p-6 text-center space-y-2 bg-slate-950/40 transition-colors">
                <Upload className="w-8 h-8 text-cyan-400 mx-auto" />
                <p className="text-xs font-semibold text-slate-200">
                  Drag and drop scanned original FDR certificate and Bank Joint Lien letter
                </p>
                <p className="text-[11px] text-slate-400">
                  Supported formats: PDF, scanned PNG/JPG up to 10MB
                </p>
                <div className="pt-2">
                  <span className="px-3 py-1 rounded bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700 cursor-pointer">
                    Browse File System
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Attached Instruments ({uploadedFiles.length})
                </h4>
                <div className="space-y-2">
                  {uploadedFiles.map(file => (
                    <div key={file.id} className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-4 h-4 text-cyan-400" />
                        <div>
                          <span className="font-semibold text-slate-200 text-xs">{file.name}</span>
                          <span className="text-[10px] text-slate-400 block">{file.fileSize} • {file.checksum}</span>
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold">
                        OCR Ready
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Automated Rule Validation Engine */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Automated Pre-Submission Rule Evaluation
                </h3>
              </div>

              <div className="space-y-2.5">
                <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-200">FDR Reference Uniqueness Check</span>
                    <p className="text-[11px] text-slate-400">Verifies against existing AICTE national records</p>
                  </div>
                  {!duplicateFdr ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                      <CheckCircle2 className="w-4 h-4" /> PASSED
                    </span>
                  ) : (
                    <span className="text-rose-400 font-bold flex items-center gap-1 text-[11px]">
                      <AlertTriangle className="w-4 h-4" /> DUPLICATE
                    </span>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-200">AICTE Mandatory Joint Lien Endorsement</span>
                    <p className="text-[11px] text-slate-400">FDR must be held jointly with Member Secretary AICTE</p>
                  </div>
                  {hasLienMarked ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                      <CheckCircle2 className="w-4 h-4" /> PASSED
                    </span>
                  ) : (
                    <span className="text-amber-400 font-bold flex items-center gap-1 text-[11px]">
                      <AlertTriangle className="w-4 h-4" /> MISSING
                    </span>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-200">Maturity Horizon & Validity Logic</span>
                    <p className="text-[11px] text-slate-400">Maturity date must strictly exceed issue date</p>
                  </div>
                  {isValidDates ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                      <CheckCircle2 className="w-4 h-4" /> PASSED
                    </span>
                  ) : (
                    <span className="text-rose-400 font-bold flex items-center gap-1 text-[11px]">
                      <AlertTriangle className="w-4 h-4" /> INVALID DATES
                    </span>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-200">Document Completeness</span>
                    <p className="text-[11px] text-slate-400">Original scanned receipt uploaded</p>
                  </div>
                  <span className="text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                    <CheckCircle2 className="w-4 h-4" /> 1 FILE ATTACHED
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: Review & Final Submission */}
          {step === 6 && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-slate-200 text-sm">{fdrNumber || 'FDR/PROVISIONAL/2026'}</span>
                  <span className="text-cyan-400 font-mono font-bold">{formatINR(principalAmount)}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                  <div>Institution: <strong className="text-slate-200">{currentInstitution.name}</strong></div>
                  <div>Bank: <strong className="text-slate-200">{issuingBank}</strong></div>
                  <div>Issue Date: <strong className="text-slate-200">{formatDate(issueDate)}</strong></div>
                  <div>Maturity Date: <strong className="text-slate-200">{formatDate(maturityDate)}</strong></div>
                  <div className="col-span-2">Joint Lien: <strong className="text-emerald-400">{jointHolderName}</strong></div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/50 flex items-start gap-2.5 text-xs text-emerald-300">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Ready for Official Digital Submission</span>
                  <p className="text-[11px] opacity-90 mt-0.5">
                    Upon submission, this instrument will enter the Regulatory Scrutiny Queue (UNDER_VERIFICATION). A tamper-evident audit record and officer notification will be generated immediately.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={step === 1}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
              step === 1 
                ? 'opacity-40 cursor-not-allowed text-slate-500' 
                : 'text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {step < 6 ? (
            <button
              onClick={handleNext}
              className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <span>Next Step</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinalSubmit}
              className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-900/40 transition-all hover:scale-[1.02]"
            >
              <Check className="w-4 h-4" />
              <span>Submit FDR Record</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
