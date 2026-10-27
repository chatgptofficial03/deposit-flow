'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { formatINR, formatDate, filterFdrsByPermission } from '@/lib/utils';
import { 
  BarChart3, 
  Download, 
  Printer, 
  FileSpreadsheet, 
  CheckCircle, 
  AlertTriangle, 
  Landmark, 
  Building, 
  Calendar,
  Filter
} from 'lucide-react';
import { NetworkGraph3D } from '@/components/3d/NetworkGraph3D';

export const ReportsView: React.FC = () => {
  const { currentUser, fdrs, institutions, renewals, releases, auditLogs } = useApp();

  const userFdrs = filterFdrsByPermission(fdrs, currentUser);

  const [activeReport, setActiveReport] = useState<
    'MASTER_REGISTER' | 'BANK_EXPOSURE' | 'MATURITY_SCHEDULE' | 'DISCREPANCY_AUDIT' | 'RELEASE_REGISTER'
  >('MASTER_REGISTER');

  // Bank summary
  const bankSummary: { [bank: string]: { count: number; total: number } } = {};
  userFdrs.forEach(f => {
    if (!bankSummary[f.issuingBank]) {
      bankSummary[f.issuingBank] = { count: 0, total: 0 };
    }
    bankSummary[f.issuingBank].count += 1;
    bankSummary[f.issuingBank].total += f.principalAmount;
  });

  // Maturity summary
  const maturing30 = userFdrs.filter(f => f.daysUntilMaturity > 0 && f.daysUntilMaturity <= 30);
  const maturing60 = userFdrs.filter(f => f.daysUntilMaturity > 30 && f.daysUntilMaturity <= 60);
  const maturing90 = userFdrs.filter(f => f.daysUntilMaturity > 60 && f.daysUntilMaturity <= 90);
  const matured = userFdrs.filter(f => f.daysUntilMaturity <= 0);

  // Discrepancies
  const discrepancyList = userFdrs.filter(f => f.discrepancies.length > 0);

  // Export current active report as CSV
  const handleExportReportCSV = () => {
    const filename = `DepositFlow_${activeReport}_${new Date().toISOString().split('T')[0]}.csv`;
    let headers: string[] = [];
    let rows: (string | number)[][] = [];

    if (activeReport === 'MASTER_REGISTER') {
      headers = ['FDR Number', 'Institution', 'Bank', 'Branch', 'Amount (INR)', 'Maturity Date', 'Status', 'Lien Status'];
      rows = userFdrs.map(f => [
        `"${f.fdrNumber}"`,
        `"${f.institutionName}"`,
        `"${f.issuingBank}"`,
        `"${f.branchName}"`,
        f.principalAmount,
        f.maturityDate,
        f.lifecycleStatus,
        f.jointHolderName.includes('AICTE') ? 'VERIFIED_AICTE' : 'MISSING_LIEN'
      ]);
    } else if (activeReport === 'BANK_EXPOSURE') {
      headers = ['Bank Name', 'Active Instrument Count', 'Total Deposit Capital (INR)'];
      rows = Object.entries(bankSummary).map(([bank, data]) => [
        `"${bank}"`,
        data.count,
        data.total
      ]);
    } else if (activeReport === 'MATURITY_SCHEDULE') {
      headers = ['FDR Number', 'Institution', 'Bank', 'Principal (INR)', 'Maturity Date', 'Days Remaining', 'Urgency'];
      rows = [...maturing30, ...maturing60, ...maturing90, ...matured].map(f => [
        `"${f.fdrNumber}"`,
        `"${f.institutionName}"`,
        `"${f.issuingBank}"`,
        f.principalAmount,
        f.maturityDate,
        f.daysUntilMaturity,
        f.daysUntilMaturity <= 7 ? 'CRITICAL' : f.daysUntilMaturity <= 30 ? 'UPCOMING' : f.daysUntilMaturity <= 0 ? 'OVERDUE' : 'HORIZON'
      ]);
    } else if (activeReport === 'DISCREPANCY_AUDIT') {
      headers = ['FDR Number', 'Institution', 'Bank', 'Field', 'Severity', 'Discrepancy Details'];
      rows = discrepancyList.flatMap(f => f.discrepancies.map(d => [
        `"${f.fdrNumber}"`,
        `"${f.institutionName}"`,
        `"${f.issuingBank}"`,
        `"${d.field}"`,
        `"${d.severity}"`,
        `"${d.title}: ${d.description.replace(/"/g, '""')}"`
      ]));
    } else if (activeReport === 'RELEASE_REGISTER') {
      headers = ['Request ID', 'FDR Reference', 'Institution', 'Amount (INR)', 'Reason', 'Status', 'NOC Verified'];
      rows = releases.map(r => [
        `"${r.id}"`,
        `"${r.fdrNumber}"`,
        `"${r.institutionName}"`,
        r.principalAmount,
        `"${r.reason}"`,
        `"${r.status}"`,
        r.compliancePrerequisites.nocObtained ? 'YES' : 'NO'
      ]);
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* 3D Hero */}
      <NetworkGraph3D
        nodeCount={userFdrs.length || 15}
        label="Statutory Reports & Analytics Intelligence"
        sublabel="Comprehensive compliance reporting across all deposit instruments and institutions"
        accentColor={0x10b981}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-bold text-slate-100">Statutory Reports & Analytics Center</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Generate verifiable audit schedules, maturity exposure registers, and bank concentration reports for regulatory reviews.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-slate-400" />
            <span>Print Report</span>
          </button>
          <button
            onClick={handleExportReportCSV}
            className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download CSV Dossier</span>
          </button>
        </div>
      </div>

      {/* Report Selector Pills */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveReport('MASTER_REGISTER')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeReport === 'MASTER_REGISTER'
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
              : 'bg-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          Master FDR Register
        </button>

        <button
          onClick={() => setActiveReport('BANK_EXPOSURE')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeReport === 'BANK_EXPOSURE'
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
              : 'bg-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          Bank Exposure Schedule
        </button>

        <button
          onClick={() => setActiveReport('MATURITY_SCHEDULE')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeReport === 'MATURITY_SCHEDULE'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
              : 'bg-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          30-60-90 Day Maturity Horizon
        </button>

        <button
          onClick={() => setActiveReport('DISCREPANCY_AUDIT')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeReport === 'DISCREPANCY_AUDIT'
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
              : 'bg-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          Discrepancy & Non-Compliance Audit
        </button>

        <button
          onClick={() => setActiveReport('RELEASE_REGISTER')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeReport === 'RELEASE_REGISTER'
              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40'
              : 'bg-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          Release & Refund Execution Register
        </button>
      </div>

      {/* Render Active Report Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        {activeReport === 'MASTER_REGISTER' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 divide-y divide-slate-800">
              <thead className="bg-slate-950/70 text-slate-400 font-medium">
                <tr>
                  <th className="px-4 py-3">FDR Reference</th>
                  <th className="px-4 py-3">Institution</th>
                  <th className="px-4 py-3">Issuing Bank & Branch</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3">Issue Date</th>
                  <th className="px-4 py-3">Maturity Date</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {userFdrs.map(f => (
                  <tr key={f.id} className="hover:bg-slate-850/60">
                    <td className="px-4 py-3 font-mono font-bold text-slate-100">{f.fdrNumber}</td>
                    <td className="px-4 py-3 font-medium text-slate-200">{f.institutionName}</td>
                    <td className="px-4 py-3 text-slate-400">{f.issuingBank} ({f.branchName})</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-cyan-400">{formatINR(f.principalAmount)}</td>
                    <td className="px-4 py-3 font-mono">{formatDate(f.issueDate)}</td>
                    <td className="px-4 py-3 font-mono">{formatDate(f.maturityDate)}</td>
                    <td className="px-4 py-3 font-semibold text-[11px] text-slate-300">{f.lifecycleStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeReport === 'BANK_EXPOSURE' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 divide-y divide-slate-800">
              <thead className="bg-slate-950/70 text-slate-400 font-medium">
                <tr>
                  <th className="px-4 py-3">Scheduled Commercial Bank</th>
                  <th className="px-4 py-3 text-center">Active Instruments</th>
                  <th className="px-4 py-3 text-right">Secured Capital Value</th>
                  <th className="px-4 py-3 text-right">Percentage Exposure</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {Object.entries(bankSummary).map(([bank, data]) => {
                  const total = userFdrs.reduce((a, b) => a + b.principalAmount, 0);
                  const pct = total > 0 ? (data.total / total) * 100 : 0;
                  return (
                    <tr key={bank} className="hover:bg-slate-850/60">
                      <td className="px-4 py-3 font-bold text-slate-100">{bank}</td>
                      <td className="px-4 py-3 text-center font-mono font-semibold">{data.count}</td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-cyan-400">{formatINR(data.total)}</td>
                      <td className="px-4 py-3 text-right font-mono text-slate-400">{pct.toFixed(2)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {activeReport === 'MATURITY_SCHEDULE' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 divide-y divide-slate-800">
              <thead className="bg-slate-950/70 text-slate-400 font-medium">
                <tr>
                  <th className="px-4 py-3">FDR Reference</th>
                  <th className="px-4 py-3">Technical Institution</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3">Maturity Date</th>
                  <th className="px-4 py-3">Days Remaining</th>
                  <th className="px-4 py-3">Action Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {[...maturing30, ...maturing60, ...maturing90, ...matured].map(f => (
                  <tr key={f.id} className="hover:bg-slate-850/60">
                    <td className="px-4 py-3 font-mono font-bold text-slate-100">{f.fdrNumber}</td>
                    <td className="px-4 py-3 font-medium text-slate-200">{f.institutionName}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-100">{formatINR(f.principalAmount)}</td>
                    <td className="px-4 py-3 font-mono text-amber-400">{formatDate(f.maturityDate)}</td>
                    <td className="px-4 py-3 font-mono font-semibold">
                      {f.daysUntilMaturity > 0 ? `${f.daysUntilMaturity} Days` : `Matured (${Math.abs(f.daysUntilMaturity)}d ago)`}
                    </td>
                    <td className="px-4 py-3 font-semibold text-[11px] text-slate-300">{f.lifecycleStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeReport === 'DISCREPANCY_AUDIT' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 divide-y divide-slate-800">
              <thead className="bg-slate-950/70 text-slate-400 font-medium">
                <tr>
                  <th className="px-4 py-3">FDR Reference</th>
                  <th className="px-4 py-3">Institution</th>
                  <th className="px-4 py-3">Discrepancy Title</th>
                  <th className="px-4 py-3">Severity</th>
                  <th className="px-4 py-3">Scrutiny Observation Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {discrepancyList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">
                      No unresolved discrepancies found in active audit records.
                    </td>
                  </tr>
                ) : (
                  discrepancyList.flatMap(f => f.discrepancies.map(d => (
                    <tr key={d.id} className="hover:bg-slate-850/60">
                      <td className="px-4 py-3 font-mono font-bold text-slate-100">{f.fdrNumber}</td>
                      <td className="px-4 py-3 text-slate-300">{f.institutionName}</td>
                      <td className="px-4 py-3 font-semibold text-rose-400">{d.title}</td>
                      <td className="px-4 py-3 font-mono text-[10px] text-amber-400">{d.severity}</td>
                      <td className="px-4 py-3 text-slate-400">{d.description}</td>
                    </tr>
                  )))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeReport === 'RELEASE_REGISTER' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 divide-y divide-slate-800">
              <thead className="bg-slate-950/70 text-slate-400 font-medium">
                <tr>
                  <th className="px-4 py-3">Request ID</th>
                  <th className="px-4 py-3">FDR Reference</th>
                  <th className="px-4 py-3">Institution</th>
                  <th className="px-4 py-3 text-right">Sum (INR)</th>
                  <th className="px-4 py-3">Reason Category</th>
                  <th className="px-4 py-3">Statutory Clearance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {releases.map(r => (
                  <tr key={r.id} className="hover:bg-slate-850/60">
                    <td className="px-4 py-3 font-mono font-bold text-slate-300">{r.id}</td>
                    <td className="px-4 py-3 font-mono text-slate-100">{r.fdrNumber}</td>
                    <td className="px-4 py-3 text-slate-200">{r.institutionName}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-purple-400">{formatINR(r.principalAmount)}</td>
                    <td className="px-4 py-3 text-slate-300">{r.reason.replace(/_/g, ' ')}</td>
                    <td className="px-4 py-3 font-semibold text-emerald-400">{r.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
