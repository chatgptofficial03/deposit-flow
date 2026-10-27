'use client';

import React, { useState } from 'react';
import { AppProvider, useApp } from '@/lib/store';
import { Navbar } from '@/components/Navbar';
import { Sidebar, NavTab } from '@/components/Sidebar';
import { DashboardView } from '@/components/views/DashboardView';
import { FdrRegistryView } from '@/components/views/FdrRegistryView';
import { VerificationWorkspaceView } from '@/components/views/VerificationWorkspaceView';
import { MaturityMonitorView } from '@/components/views/MaturityMonitorView';
import { RenewalWorkflowView } from '@/components/views/RenewalWorkflowView';
import { ReleaseWorkflowView } from '@/components/views/ReleaseWorkflowView';
import { InstitutionDirectoryView } from '@/components/views/InstitutionDirectoryView';
import { ReportsView } from '@/components/views/ReportsView';
import { AuditTrailView } from '@/components/views/AuditTrailView';
import { HackathonInfoView } from '@/components/views/HackathonInfoView';
import { FdrSubmissionWizardModal } from '@/components/modals/FdrSubmissionWizardModal';
import { RenewalInitiationModal } from '@/components/modals/RenewalInitiationModal';
import { ReleaseRequestModal } from '@/components/modals/ReleaseRequestModal';
import { RecordDetailDrawer } from '@/components/modals/RecordDetailDrawer';
import { FdrRecord } from '@/lib/types';

function MainApp() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  
  // Modals state
  const [submissionModalOpen, setSubmissionModalOpen] = useState(false);
  const [renewalModalOpen, setRenewalModalOpen] = useState(false);
  const [releaseModalOpen, setReleaseModalOpen] = useState(false);
  const [targetFdrForAction, setTargetFdrForAction] = useState<FdrRecord | null>(null);
  
  // Drawer state
  const [selectedFdrId, setSelectedFdrId] = useState<string | null>(null);
  const [verificationFdrId, setVerificationFdrId] = useState<string | undefined>(undefined);

  const handleOpenRenewal = (fdr: FdrRecord) => {
    setTargetFdrForAction(fdr);
    setRenewalModalOpen(true);
  };

  const handleOpenRelease = (fdr: FdrRecord) => {
    setTargetFdrForAction(fdr);
    setReleaseModalOpen(true);
  };

  const handleNavigateToVerification = (fdrId: string) => {
    setVerificationFdrId(fdrId);
    setActiveTab('verification');
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#0d1117', color: '#e6edf3' }}>
      {/* Top Navbar */}
      <Navbar 
        onNavigateToFdr={id => setSelectedFdrId(id)}
      />

      {/* Main Content Area with Sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Responsive Left Navigation */}
        <Sidebar
          activeTab={activeTab}
          onNavigate={tab => setActiveTab(tab)}
        />

        {/* Dynamic Center Work Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6 max-w-screen-xl mx-auto w-full">
          {activeTab === 'dashboard' && (
            <DashboardView
              onNavigate={tab => setActiveTab(tab)}
              onSelectFdr={id => setSelectedFdrId(id)}
            />
          )}

          {activeTab === 'fdr_registry' && (
            <FdrRegistryView
              onSelectFdr={id => setSelectedFdrId(id)}
              onOpenNewFdrModal={() => setSubmissionModalOpen(true)}
              onOpenRenewalModal={handleOpenRenewal}
              onOpenReleaseModal={handleOpenRelease}
              onNavigateToVerification={handleNavigateToVerification}
            />
          )}

          {activeTab === 'verification' && (
            <VerificationWorkspaceView
              preselectedFdrId={verificationFdrId}
              onSelectFdr={id => setSelectedFdrId(id)}
            />
          )}

          {activeTab === 'maturity' && (
            <MaturityMonitorView
              onSelectFdr={id => setSelectedFdrId(id)}
              onOpenRenewalModal={handleOpenRenewal}
              onOpenReleaseModal={handleOpenRelease}
            />
          )}

          {activeTab === 'renewals' && (
            <RenewalWorkflowView
              onOpenNewRenewalModal={() => {
                // Pick first active FDR if none selected
                setRenewalModalOpen(true);
              }}
              onSelectFdr={id => setSelectedFdrId(id)}
            />
          )}

          {activeTab === 'releases' && (
            <ReleaseWorkflowView
              onOpenNewReleaseModal={() => {
                setReleaseModalOpen(true);
              }}
              onSelectFdr={id => setSelectedFdrId(id)}
            />
          )}

          {activeTab === 'institutions' && (
            <InstitutionDirectoryView
              onSelectInstitutionFdrs={instId => {
                setActiveTab('fdr_registry');
              }}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView />
          )}

          {activeTab === 'audit_trail' && (
            <AuditTrailView />
          )}

          {/* hackathon_info tab removed — not in NavTab type */}
        </main>
      </div>

      {/* Global Modals & Slide-Overs */}
      <FdrSubmissionWizardModal
        isOpen={submissionModalOpen}
        onClose={() => setSubmissionModalOpen(false)}
        onSuccess={fdrId => {
          setSelectedFdrId(fdrId);
        }}
      />

      <RenewalInitiationModal
        isOpen={renewalModalOpen}
        onClose={() => {
          setRenewalModalOpen(false);
          setTargetFdrForAction(null);
        }}
        fdr={targetFdrForAction}
      />

      <ReleaseRequestModal
        isOpen={releaseModalOpen}
        onClose={() => {
          setReleaseModalOpen(false);
          setTargetFdrForAction(null);
        }}
        fdr={targetFdrForAction}
      />

      <RecordDetailDrawer
        fdrId={selectedFdrId}
        onClose={() => setSelectedFdrId(null)}
        onOpenRenewalModal={handleOpenRenewal}
        onOpenReleaseModal={handleOpenRelease}
        onNavigateToVerification={handleNavigateToVerification}
      />
    </div>
  );
}

export default function Page() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
