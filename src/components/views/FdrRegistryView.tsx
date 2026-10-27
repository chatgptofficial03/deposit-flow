'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/lib/store';
import { FdrRecord } from '@/lib/types';
import { 
  formatINR, 
  formatDate, 
  getMaturityBadgeStyle, 
  getLifecycleBadgeStyle, 
  filterFdrsByPermission 
} from '@/lib/utils';
import { 
  Search, 
  Filter, 
  Download, 
  Plus, 
  Eye, 
  ShieldCheck, 
  RefreshCw, 
  CornerDownRight, 
  ChevronRight,
  Building,
  CheckCircle,
  FileText,
  AlertTriangle
} from 'lucide-react';

interface FdrRegistryViewProps {
  onSelectFdr: (fdrId: string) => void;
  onOpenNewFdrModal: () => void;
  onOpenRenewalModal?: (fdr: FdrRecord) => void;
  onOpenReleaseModal?: (fdr: FdrRecord) => void;
  onNavigateToVerification?: (fdrId: string) => void;
}

export const FdrRegistryView: React.FC<FdrRegistryViewProps> = ({
  onSelectFdr,
  onOpenNewFdrModal,
  onOpenRenewalModal,
  onOpenReleaseModal,
  onNavigateToVerification
}) => {
  const { currentUser, fdrs, institutions } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [bankFilter, setBankFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [institutionFilter, setInstitutionFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'maturityDate' | 'principalAmount' | 'issueDate'>('maturityDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Enforce institution tenant isolation
  const authorizedFdrs = useMemo(() => {
    return filterFdrsByPermission(fdrs, currentUser);
  }, [fdrs, currentUser]);

  // Unique banks list for filter
  const uniqueBanks = useMemo(() => {
    return Array.from(new Set(authorizedFdrs.map(f => f.issuingBank)));
  }, [authorizedFdrs]);

  // Filtered and sorted dataset
  const filteredFdrs = useMemo(() => {
    return authorizedFdrs
      .filter(fdr => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchFdr = fdr.fdrNumber.toLowerCase().includes(q);
          const matchInst = fdr.institutionName.toLowerCase().includes(q);
          const matchBank = fdr.issuingBank.toLowerCase().includes(q);
          const matchBranch = fdr.branchName.toLowerCase().includes(q);
          if (!matchFdr && !matchInst && !matchBank && !matchBranch) return false;
        }

        // Status Filter
        if (statusFilter !== 'ALL') {
          if (statusFilter === 'ACTIVE' && fdr.lifecycleStatus !== 'ACTIVE') return false;
          if (statusFilter === 'UNDER_VERIFICATION' && fdr.lifecycleStatus !== 'UNDER_VERIFICATION') return false;
          if (statusFilter === 'CORRECTION_REQUIRED' && fdr.lifecycleStatus !== 'CORRECTION_REQUIRED') return false;
          if (statusFilter === 'MATURED_NEEDS_REVIEW' && fdr.lifecycleStatus !== 'MATURED_NEEDS_REVIEW') return false;
          if (statusFilter === 'RENEWAL_IN_PROGRESS' && fdr.lifecycleStatus !== 'RENEWAL_IN_PROGRESS') return false;
          if (statusFilter === 'RELEASE_REQUESTED' && fdr.lifecycleStatus !== 'RELEASE_REQUESTED') return false;
        }

        // Bank Filter
        if (bankFilter !== 'ALL' && fdr.issuingBank !== bankFilter) return false;

        // Category Filter
        if (categoryFilter !== 'ALL' && fdr.depositCategory !== categoryFilter) return false;

        // Institution Filter
        if (institutionFilter !== 'ALL' && fdr.institutionId !== institutionFilter) return false;

        return true;
      })
      .sort((a, b) => {
        let comp = 0;
        if (sortBy === 'maturityDate') {
          comp = new Date(a.maturityDate).getTime() - new Date(b.maturityDate).getTime();
        } else if (sortBy === 'principalAmount') {
          comp = a.principalAmount - b.principalAmount;
        } else if (sortBy === 'issueDate') {
          comp = new Date(a.issueDate).getTime() - new Date(b.issueDate).getTime();
        }
        return sortOrder === 'asc' ? comp : -comp;
      });
  }, [authorizedFdrs, searchQuery, statusFilter, bankFilter, categoryFilter, institutionFilter, sortBy, sortOrder]);

  // CSV Export handler
  const handleExportCSV = () => {
    const headers = [
      'FDR Number',
      'Institution Code',
      'Institution Name',
      'Issuing Bank',
      'Branch',
      'Principal Amount (INR)',
      'Issue Date',
      'Maturity Date',
      'Days Until Maturity',
      'Lifecycle Status',
      'Verification Status',
      'Lien Marked to AICTE'
    ];

    const rows = filteredFdrs.map(f => [
      `"${f.fdrNumber}"`,
      `"${f.institutionCode}"`,
      `"${f.institutionName.replace(/"/g, '""')}"`,
      `"${f.issuingBank}"`,
      `"${f.branchName.replace(/"/g, '""')}"`,
      f.principalAmount,
      f.issueDate,
      f.maturityDate,
      f.daysUntilMaturity,
      f.lifecycleStatus,
      f.verificationStatus,
      f.jointHolderName.includes('AICTE') ? 'YES' : 'NO'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DepositFlow_FDR_Registry_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isOfficerOrAdmin = currentUser.role === 'REGULATORY_ADMIN' || currentUser.role === 'REGULATORY_OFFICER';

  return (
    <div className="space-y-5">
      {/* Page Title & Top Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-100">Fixed Deposit Receipt (FDR) Registry</h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono font-medium">
              {filteredFdrs.length} Records
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Central repository of institutional security deposits, bank endorsements, and lifecycle milestones.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onOpenNewFdrModal}
            className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Submit New FDR</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Filter by FDR #, institution, bank..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              <option value="ALL">All Lifecycle Statuses</option>
              <option value="ACTIVE">Active & Verified</option>
              <option value="UNDER_VERIFICATION">Under Verification</option>
              <option value="CORRECTION_REQUIRED">Correction Required</option>
              <option value="MATURED_NEEDS_REVIEW">Matured (Action Due)</option>
              <option value="RENEWAL_IN_PROGRESS">Renewal In Progress</option>
              <option value="RELEASE_REQUESTED">Release Requested</option>
            </select>
          </div>

          {/* Bank Filter */}
          <div>
            <select
              value={bankFilter}
              onChange={e => setBankFilter(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              <option value="ALL">All Issuing Banks</option>
              {uniqueBanks.map(bank => (
                <option key={bank} value={bank}>{bank}</option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              <option value="ALL">All Deposit Categories</option>
              <option value="MANDATORY_ENDOWMENT">Mandatory Endowment</option>
              <option value="NEW_PROGRAMME_APPROVAL">New Programme Approval</option>
              <option value="LAND_AND_BUILDING">Land & Building Security</option>
              <option value="DEFICIENCY_SECURITY">Deficiency Compliance</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300 divide-y divide-slate-800">
            <thead className="bg-slate-950/60 text-slate-400 font-medium">
              <tr>
                <th className="px-4 py-3">FDR Reference & Bank</th>
                <th className="px-4 py-3">Technical Institution</th>
                <th className="px-4 py-3 text-right">Principal Amount</th>
                <th className="px-4 py-3">Maturity Date</th>
                <th className="px-4 py-3">Lifecycle & Verification</th>
                <th className="px-4 py-3">Joint Lien</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-normal">
              {filteredFdrs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    <FileText className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="font-medium text-slate-300">No FDR records match the specified filters</p>
                    <p className="text-[11px] text-slate-500 mt-1">Try resetting search parameters or submit a new instrument.</p>
                  </td>
                </tr>
              ) : (
                filteredFdrs.map(fdr => {
                  const maturityBadge = getMaturityBadgeStyle(fdr.maturityStatus);
                  const lifecycleBadge = getLifecycleBadgeStyle(fdr.lifecycleStatus);

                  return (
                    <tr 
                      key={fdr.id} 
                      className="hover:bg-slate-850/60 transition-colors group cursor-pointer"
                      onClick={() => onSelectFdr(fdr.id)}
                    >
                      {/* FDR Number & Bank */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col">
                          <span className="font-mono font-bold text-slate-100 group-hover:text-cyan-400 transition-colors">
                            {fdr.fdrNumber}
                          </span>
                          <span className="text-[11px] text-slate-400 mt-0.5">
                            {fdr.issuingBank} • {fdr.branchName.split(',')[0]}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            IFSC: {fdr.ifscCode}
                          </span>
                        </div>
                      </td>

                      {/* Institution */}
                      <td className="px-4 py-3.5 max-w-[220px]">
                        <p className="font-medium text-slate-200 truncate">{fdr.institutionName}</p>
                        <p className="text-[10px] text-slate-500 font-mono">Code: {fdr.institutionCode}</p>
                        <span className="inline-block mt-0.5 text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                          {fdr.depositCategory.replace(/_/g, ' ')}
                        </span>
                      </td>

                      {/* Principal Amount */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <span className="font-mono font-bold text-slate-100 text-sm">
                          {formatINR(fdr.principalAmount)}
                        </span>
                        <div className="text-[10px] text-slate-500">
                          {fdr.interestRate}% p.a.
                        </div>
                      </td>

                      {/* Maturity Date */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <p className="font-mono text-slate-200 font-medium">{formatDate(fdr.maturityDate)}</p>
                        <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full border mt-1 font-medium ${maturityBadge.bg}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${maturityBadge.dot}`} />
                          {fdr.daysUntilMaturity > 0 
                            ? `${fdr.daysUntilMaturity} days left` 
                            : `Matured (${Math.abs(fdr.daysUntilMaturity)}d ago)`}
                        </span>
                      </td>

                      {/* Lifecycle & Verification */}
                      <td className="px-4 py-3.5">
                        <div className="space-y-1">
                          <span className={`inline-block text-[10px] px-2 py-0.5 rounded-md font-semibold border ${lifecycleBadge}`}>
                            {fdr.lifecycleStatus.replace(/_/g, ' ')}
                          </span>
                          <div>
                            <span className="text-[10px] text-slate-400">
                              Verif: <strong className="text-slate-300">{fdr.verificationStatus.replace(/_/g, ' ')}</strong>
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Joint Lien */}
                      <td className="px-4 py-3.5">
                        {fdr.jointHolderName.includes('AICTE') ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-medium bg-emerald-950/40 border border-emerald-800/60 px-2 py-0.5 rounded">
                            <CheckCircle className="w-3 h-3 text-emerald-400" />
                            AICTE Marked
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] text-rose-400 font-medium bg-rose-950/40 border border-rose-800/60 px-2 py-0.5 rounded">
                            <AlertTriangle className="w-3 h-3 text-rose-400" />
                            Missing Lien
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-center" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onSelectFdr(fdr.id)}
                            className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            title="Inspect Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {isOfficerOrAdmin && (fdr.verificationStatus === 'PENDING' || fdr.lifecycleStatus === 'UNDER_VERIFICATION') && (
                            <button
                              onClick={() => onNavigateToVerification ? onNavigateToVerification(fdr.id) : onSelectFdr(fdr.id)}
                              className="px-2 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-semibold flex items-center gap-1"
                              title="Conduct Scrutiny & Verification"
                            >
                              <ShieldCheck className="w-3 h-3" /> Scrutinize
                            </button>
                          )}

                          {fdr.lifecycleStatus === 'ACTIVE' && (
                            <>
                              <button
                                onClick={() => onOpenRenewalModal && onOpenRenewalModal(fdr)}
                                className="p-1.5 rounded-md bg-indigo-950 text-indigo-300 hover:bg-indigo-900 border border-indigo-800 transition-colors"
                                title="Initiate Renewal / Replacement"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onOpenReleaseModal && onOpenReleaseModal(fdr)}
                                className="p-1.5 rounded-md bg-purple-950 text-purple-300 hover:bg-purple-900 border border-purple-800 transition-colors"
                                title="Request Release / Refund"
                              >
                                <CornerDownRight className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
