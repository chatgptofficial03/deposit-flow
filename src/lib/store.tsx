'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserSession,
  UserRole,
  Institution,
  FdrRecord,
  RenewalRequest,
  ReleaseRequest,
  NotificationItem,
  AuditEvent,
  DiscrepancyItem,
  MaturityStatus,
  LifecycleStatus
} from './types';
import {
  DEMO_USERS,
  DEMO_INSTITUTIONS,
  INITIAL_FDRS,
  INITIAL_RENEWALS,
  INITIAL_RELEASES,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOG
} from './mockData';

interface AppContextType {
  currentUser: UserSession;
  simulatedDate: string;
  institutions: Institution[];
  fdrs: FdrRecord[];
  renewals: RenewalRequest[];
  releases: ReleaseRequest[];
  notifications: NotificationItem[];
  auditLogs: AuditEvent[];
  
  // Actions
  setCurrentUser: (user: UserSession) => void;
  switchRole: (role: UserRole, institutionId?: string) => void;
  advanceSimulationDays: (days: number) => void;
  resetToDefaultData: () => void;
  
  // FDR Actions
  createFdr: (fdr: Omit<FdrRecord, 'id' | 'createdAt' | 'updatedAt' | 'daysUntilMaturity'>) => string;
  updateFdr: (id: string, updates: Partial<FdrRecord>) => void;
  verifyFdr: (id: string, decision: 'VERIFY' | 'FLAG_DISCREPANCY' | 'REJECT', remarks: string, discrepancies?: DiscrepancyItem[]) => void;
  triggerBankVerification: (id: string) => Promise<boolean>;
  
  // Renewal & Release
  createRenewal: (renewal: Omit<RenewalRequest, 'id' | 'submittedAt' | 'status'>) => string;
  reviewRenewal: (id: string, decision: 'APPROVED' | 'REJECTED' | 'CORRECTION_REQUIRED', remarks: string) => void;
  createRelease: (release: Omit<ReleaseRequest, 'id' | 'submittedAt' | 'status'>) => string;
  reviewRelease: (id: string, decision: 'APPROVED' | 'REJECTED' | 'ADDITIONAL_INFO_REQUIRED', remarks: string) => void;
  
  // Notification & Audit
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addAuditLog: (event: Omit<AuditEvent, 'id' | 'timestamp' | 'actorName' | 'actorRole' | 'ipAddress'>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'DEPOSIT_FLOW_STATE_V1';

export function calculateDaysRemaining(maturityDateStr: string, currentDateStr: string): number {
  const current = new Date(currentDateStr);
  const maturity = new Date(maturityDateStr);
  const diffTime = maturity.getTime() - current.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function determineMaturityStatus(days: number): MaturityStatus {
  if (days <= 0) return 'MATURED';
  if (days <= 7) return 'EXPIRING_7';
  if (days <= 30) return 'EXPIRING_30';
  if (days <= 60) return 'EXPIRING_60';
  if (days <= 90) return 'EXPIRING_90';
  return 'HEALTHY';
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserSession>(DEMO_USERS[0]);
  const [simulatedDate, setSimulatedDate] = useState<string>('2026-10-27');
  const [institutions, setInstitutions] = useState<Institution[]>(DEMO_INSTITUTIONS);
  const [fdrs, setFdrs] = useState<FdrRecord[]>(INITIAL_FDRS);
  const [renewals, setRenewals] = useState<RenewalRequest[]>(INITIAL_RENEWALS);
  const [releases, setReleases] = useState<ReleaseRequest[]>(INITIAL_RELEASES);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>(INITIAL_AUDIT_LOG);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from local storage if available
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.fdrs) setFdrs(parsed.fdrs);
          if (parsed.institutions) setInstitutions(parsed.institutions);
          if (parsed.renewals) setRenewals(parsed.renewals);
          if (parsed.releases) setReleases(parsed.releases);
          if (parsed.notifications) setNotifications(parsed.notifications);
          if (parsed.auditLogs) setAuditLogs(parsed.auditLogs);
          if (parsed.simulatedDate) setSimulatedDate(parsed.simulatedDate);
          if (parsed.currentUser) setCurrentUser(parsed.currentUser);
        }
      } catch {
        console.warn('Could not parse localStorage, starting fresh');
      }
      setIsInitialized(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Save to local storage on changes
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        fdrs,
        institutions,
        renewals,
        releases,
        notifications,
        auditLogs,
        simulatedDate,
        currentUser
      }));
    } catch {
      console.warn('Failed to persist state to localStorage');
    }
  }, [fdrs, institutions, renewals, releases, notifications, auditLogs, simulatedDate, currentUser, isInitialized]);

  const addAuditLog = (event: Omit<AuditEvent, 'id' | 'timestamp' | 'actorName' | 'actorRole' | 'ipAddress'>) => {
    const newLog: AuditEvent = {
      ...event,
      id: `aud-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString(),
      actorName: currentUser.name,
      actorRole: currentUser.role,
      ipAddress: '10.14.20.108'
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const switchRole = (role: UserRole, instId?: string) => {
    let target = DEMO_USERS.find(u => u.role === role);
    if (role === 'INSTITUTION_ADMIN' || role === 'INSTITUTION_OPERATOR') {
      const targetInstId = instId || 'inst-1';
      const inst = institutions.find(i => i.id === targetInstId) || institutions[0];
      if (target) {
        target = {
          ...target,
          institutionId: inst.id,
          institutionName: inst.name
        };
      }
    }
    if (target) {
      setCurrentUser(target);
      addAuditLog({
        action: 'ROLE_SWITCH',
        entityType: 'SYSTEM',
        entityId: target.id,
        summary: `Session switched to role: ${role} (${target.name})`
      });
    }
  };

  const advanceSimulationDays = (days: number) => {
    const current = new Date(simulatedDate);
    current.setDate(current.getDate() + days);
    const newSimulatedDate = current.toISOString().split('T')[0];
    setSimulatedDate(newSimulatedDate);

    // Recalculate FDR maturity statuses
    const updatedFdrs = fdrs.map(fdr => {
      const daysRemaining = calculateDaysRemaining(fdr.maturityDate, newSimulatedDate);
      const maturityStatus = determineMaturityStatus(daysRemaining);
      let lifecycleStatus = fdr.lifecycleStatus;
      
      if (daysRemaining <= 0 && lifecycleStatus === 'ACTIVE') {
        lifecycleStatus = 'MATURED_NEEDS_REVIEW';
      }

      return {
        ...fdr,
        daysUntilMaturity: daysRemaining,
        maturityStatus,
        lifecycleStatus
      };
    });

    setFdrs(updatedFdrs);

    // Generate alerts for instruments that have entered warning bands
    const newAlerts: NotificationItem[] = [];
    updatedFdrs.forEach(f => {
      if (f.daysUntilMaturity <= 7 && f.daysUntilMaturity > 0 && f.lifecycleStatus === 'ACTIVE') {
        newAlerts.push({
          id: `notif-${Date.now()}-${f.id}`,
          recipientRoles: ['REGULATORY_ADMIN', 'REGULATORY_OFFICER', 'INSTITUTION_ADMIN'],
          institutionId: f.institutionId,
          category: 'MATURITY_ALERT',
          title: `CRITICAL MATURITY: ${f.fdrNumber} matures in ${f.daysUntilMaturity} days`,
          message: `Deposit of ₹${(f.principalAmount / 100000).toFixed(1)} Lakhs for ${f.institutionName} reaches maturity on ${f.maturityDate}.`,
          priority: 'URGENT',
          relatedFdrId: f.id,
          isRead: false,
          createdAt: new Date().toISOString()
        });
      } else if (f.daysUntilMaturity <= 0 && f.lifecycleStatus === 'MATURED_NEEDS_REVIEW') {
        newAlerts.push({
          id: `notif-${Date.now()}-${f.id}`,
          recipientRoles: ['REGULATORY_ADMIN', 'REGULATORY_OFFICER', 'INSTITUTION_ADMIN'],
          institutionId: f.institutionId,
          category: 'MATURITY_ALERT',
          title: `MATURED: ${f.fdrNumber} has reached maturity date`,
          message: `Immediate regulatory action required: renewal or authorized release review for ${f.institutionName}.`,
          priority: 'URGENT',
          relatedFdrId: f.id,
          isRead: false,
          createdAt: new Date().toISOString()
        });
      }
    });

    if (newAlerts.length > 0) {
      setNotifications(prev => [...newAlerts, ...prev]);
    }

    addAuditLog({
      action: 'SIMULATION_TIME_ADVANCED',
      entityType: 'SYSTEM',
      entityId: 'TIME_ENGINE',
      summary: `Simulation calendar advanced by ${days} days to ${newSimulatedDate}. Recalculated ${updatedFdrs.length} FDR maturity statuses.`,
      previousValue: simulatedDate,
      newValue: newSimulatedDate
    });
  };

  const resetToDefaultData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setInstitutions(DEMO_INSTITUTIONS);
    setFdrs(INITIAL_FDRS);
    setRenewals(INITIAL_RENEWALS);
    setReleases(INITIAL_RELEASES);
    setNotifications(INITIAL_NOTIFICATIONS);
    setAuditLogs(INITIAL_AUDIT_LOG);
    setSimulatedDate('2026-10-27');
    setCurrentUser(DEMO_USERS[0]);
  };

  const createFdr = (fdrData: Omit<FdrRecord, 'id' | 'createdAt' | 'updatedAt' | 'daysUntilMaturity'>): string => {
    const newId = `fdr-${Date.now().toString().slice(-5)}`;
    const daysRemaining = calculateDaysRemaining(fdrData.maturityDate, simulatedDate);
    const maturityStatus = determineMaturityStatus(daysRemaining);

    const newRecord: FdrRecord = {
      ...fdrData,
      id: newId,
      daysUntilMaturity: daysRemaining,
      maturityStatus,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setFdrs(prev => [newRecord, ...prev]);

    // Update institution deposit counters
    setInstitutions(prev => prev.map(inst => {
      if (inst.id === newRecord.institutionId) {
        return {
          ...inst,
          totalFdrCount: inst.totalFdrCount + 1,
          totalDepositValue: inst.totalDepositValue + newRecord.principalAmount
        };
      }
      return inst;
    }));

    // Trigger notification for regulatory officer
    const newNotification: NotificationItem = {
      id: `notif-${Date.now()}`,
      recipientRoles: ['REGULATORY_OFFICER', 'REGULATORY_ADMIN'],
      category: 'SUBMISSION',
      title: `New FDR Record Submitted: ${newRecord.fdrNumber}`,
      message: `${newRecord.institutionName} submitted an FDR for ₹${(newRecord.principalAmount / 100000).toFixed(1)} Lakhs with ${newRecord.issuingBank}.`,
      priority: 'HIGH',
      relatedFdrId: newId,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [newNotification, ...prev]);

    addAuditLog({
      action: 'FDR_SUBMISSION_CREATED',
      entityType: 'FDR',
      entityId: newId,
      summary: `FDR ${newRecord.fdrNumber} created and submitted for verification by ${currentUser.name}.`,
      newValue: `Principal: ₹${newRecord.principalAmount}, Bank: ${newRecord.issuingBank}`
    });

    return newId;
  };

  const updateFdr = (id: string, updates: Partial<FdrRecord>) => {
    setFdrs(prev => prev.map(f => {
      if (f.id === id) {
        return { ...f, ...updates, updatedAt: new Date().toISOString() };
      }
      return f;
    }));

    addAuditLog({
      action: 'FDR_RECORD_UPDATED',
      entityType: 'FDR',
      entityId: id,
      summary: `FDR record ${id} updated by ${currentUser.name}.`
    });
  };

  const verifyFdr = (
    id: string,
    decision: 'VERIFY' | 'FLAG_DISCREPANCY' | 'REJECT',
    remarks: string,
    discrepancies?: DiscrepancyItem[]
  ) => {
    let lifecycleStatus: LifecycleStatus = 'UNDER_VERIFICATION';
    let verificationStatus = fdrs.find(f => f.id === id)?.verificationStatus || 'PENDING';

    if (decision === 'VERIFY') {
      lifecycleStatus = 'ACTIVE';
      verificationStatus = 'VERIFIED_OFFICIAL';
    } else if (decision === 'FLAG_DISCREPANCY') {
      lifecycleStatus = 'CORRECTION_REQUIRED';
      verificationStatus = 'DISCREPANCY_FLAGGED';
    } else if (decision === 'REJECT') {
      lifecycleStatus = 'REJECTED';
      verificationStatus = 'REJECTED';
    }

    setFdrs(prev => prev.map(f => {
      if (f.id === id) {
        return {
          ...f,
          lifecycleStatus,
          verificationStatus,
          scrutinyRemarks: remarks,
          verifiedBy: currentUser.name,
          verifiedAt: new Date().toISOString().split('T')[0],
          discrepancies: discrepancies || f.discrepancies,
          updatedAt: new Date().toISOString()
        };
      }
      return f;
    }));

    const targetFdr = fdrs.find(f => f.id === id);

    // Notify institution
    if (targetFdr) {
      const notifTitle = decision === 'VERIFY' 
        ? `FDR Verified & Approved: ${targetFdr.fdrNumber}`
        : decision === 'FLAG_DISCREPANCY'
        ? `Correction Required on FDR: ${targetFdr.fdrNumber}`
        : `FDR Submission Rejected: ${targetFdr.fdrNumber}`;

      setNotifications(prev => [
        {
          id: `notif-${Date.now()}`,
          recipientRoles: ['INSTITUTION_ADMIN', 'INSTITUTION_OPERATOR'],
          institutionId: targetFdr.institutionId,
          category: decision === 'VERIFY' ? 'VERIFICATION' : 'CORRECTION',
          title: notifTitle,
          message: `Official scrutiny verdict by ${currentUser.name}: "${remarks}"`,
          priority: decision === 'VERIFY' ? 'MEDIUM' : 'URGENT',
          relatedFdrId: id,
          isRead: false,
          createdAt: new Date().toISOString()
        },
        ...prev
      ]);
    }

    addAuditLog({
      action: `VERIFICATION_${decision}`,
      entityType: 'VERIFICATION',
      entityId: id,
      summary: `Officer ${currentUser.name} recorded decision: ${decision}. Remarks: ${remarks}`,
      remarks
    });
  };

  const triggerBankVerification = async (id: string): Promise<boolean> => {
    // Simulated SFMS/Interbank gateway adapter
    const targetFdr = fdrs.find(f => f.id === id);
    if (!targetFdr) return false;

    // Simulate 750ms network delay for realistic experience
    await new Promise(res => setTimeout(res, 750));

    const ref = `SFMS-${targetFdr.issuingBank.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-6)}`;
    
    setFdrs(prev => prev.map(f => {
      if (f.id === id) {
        return {
          ...f,
          bankVerification: {
            isSimulated: true,
            adapterName: 'SFMS Interbank Lien Messaging Gateway (Simulated)',
            referenceCode: ref,
            verifiedAt: new Date().toISOString(),
            status: 'CONFIRMED',
            issuingBankResponse: `Lien Confirmation Confirmed by ${f.issuingBank}. Active deposit locked in favor of Member Secretary AICTE.`,
            lienMarkedToAICTE: true
          },
          verificationStatus: f.verificationStatus === 'NOT_REVIEWED' ? 'BANK_CONFIRMED' : f.verificationStatus,
          updatedAt: new Date().toISOString()
        };
      }
      return f;
    }));

    addAuditLog({
      action: 'BANK_ADAPTER_VERIFICATION_SUCCESS',
      entityType: 'VERIFICATION',
      entityId: id,
      summary: `Automated SFMS Gateway confirmation received for FDR ${targetFdr.fdrNumber}. Ref: ${ref}`
    });

    return true;
  };

  const createRenewal = (renewal: Omit<RenewalRequest, 'id' | 'submittedAt' | 'status'>): string => {
    const newId = `ren-${Date.now().toString().slice(-4)}`;
    const newRecord: RenewalRequest = {
      ...renewal,
      id: newId,
      status: 'SUBMITTED',
      submittedAt: new Date().toISOString()
    };

    setRenewals(prev => [newRecord, ...prev]);

    // Update original FDR lifecycle status
    setFdrs(prev => prev.map(f => {
      if (f.id === renewal.originalFdrId) {
        return {
          ...f,
          lifecycleStatus: 'RENEWAL_IN_PROGRESS',
          updatedAt: new Date().toISOString()
        };
      }
      return f;
    }));

    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        recipientRoles: ['REGULATORY_OFFICER', 'REGULATORY_ADMIN'],
        category: 'RENEWAL',
        title: `Renewal Request Submitted: ${renewal.originalFdrNumber}`,
        message: `${renewal.institutionName} proposed replacement FDR ${renewal.proposedFdrNumber} for ₹${(renewal.proposedAmount / 100000).toFixed(1)} Lakhs.`,
        priority: 'HIGH',
        relatedFdrId: renewal.originalFdrId,
        isRead: false,
        createdAt: new Date().toISOString()
      },
      ...prev
    ]);

    addAuditLog({
      action: 'RENEWAL_REQUEST_SUBMITTED',
      entityType: 'RENEWAL',
      entityId: newId,
      summary: `Renewal application submitted for ${renewal.originalFdrNumber} by ${currentUser.name}. Proposed replacement: ${renewal.proposedFdrNumber}`
    });

    return newId;
  };

  const reviewRenewal = (id: string, decision: 'APPROVED' | 'REJECTED' | 'CORRECTION_REQUIRED', remarks: string) => {
    const targetRen = renewals.find(r => r.id === id);
    if (!targetRen) return;

    setRenewals(prev => prev.map(r => {
      if (r.id === id) {
        return {
          ...r,
          status: decision,
          reviewedBy: currentUser.name,
          reviewerRemarks: remarks,
          reviewedAt: new Date().toISOString()
        };
      }
      return r;
    }));

    if (decision === 'APPROVED') {
      // Create new successor FDR and link predecessor
      const successorId = `fdr-${Date.now().toString().slice(-5)}`;
      const daysRemaining = calculateDaysRemaining(targetRen.proposedMaturityDate, simulatedDate);
      
      const newSuccessorFdr: FdrRecord = {
        id: successorId,
        fdrNumber: targetRen.proposedFdrNumber,
        institutionId: targetRen.institutionId,
        institutionName: targetRen.institutionName,
        institutionCode: '1-10293847',
        depositCategory: 'MANDATORY_ENDOWMENT',
        issuingBank: targetRen.proposedBank,
        branchName: targetRen.proposedBranch,
        ifscCode: 'SBIN0011032',
        accountNumberMasked: '•••• •••• 9921',
        principalAmount: targetRen.proposedAmount,
        currency: 'INR',
        interestRate: 7.1,
        issueDate: targetRen.proposedIssueDate,
        maturityDate: targetRen.proposedMaturityDate,
        depositTermMonths: 60,
        autoRenewal: true,
        jointHolderName: `AICTE & ${targetRen.institutionName}`,
        lifecycleStatus: 'ACTIVE',
        verificationStatus: 'VERIFIED_OFFICIAL',
        maturityStatus: determineMaturityStatus(daysRemaining),
        releaseStatus: 'NONE',
        daysUntilMaturity: daysRemaining,
        predecessorFdrId: targetRen.originalFdrId,
        documents: targetRen.supportingDocs,
        discrepancies: [],
        scrutinyRemarks: `Approved successor instrument replacing ${targetRen.originalFdrNumber}.`,
        verifiedBy: currentUser.name,
        verifiedAt: new Date().toISOString().split('T')[0],
        createdBy: targetRen.submittedBy,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Mark old FDR as renewed and link successor
      setFdrs(prev => [
        newSuccessorFdr,
        ...prev.map(f => {
          if (f.id === targetRen.originalFdrId) {
            return {
              ...f,
              lifecycleStatus: 'VERIFIED' as LifecycleStatus, // replaced
              successorFdrId: successorId,
              updatedAt: new Date().toISOString()
            };
          }
          return f;
        })
      ]);
    } else {
      // Revert or adjust old FDR status
      setFdrs(prev => prev.map(f => {
        if (f.id === targetRen.originalFdrId) {
          return {
            ...f,
            lifecycleStatus: decision === 'CORRECTION_REQUIRED' ? 'CORRECTION_REQUIRED' : 'MATURED_NEEDS_REVIEW',
            updatedAt: new Date().toISOString()
          };
        }
        return f;
      }));
    }

    addAuditLog({
      action: `RENEWAL_${decision}`,
      entityType: 'RENEWAL',
      entityId: id,
      summary: `Renewal application ${id} marked as ${decision} by ${currentUser.name}. Remarks: ${remarks}`
    });
  };

  const createRelease = (release: Omit<ReleaseRequest, 'id' | 'submittedAt' | 'status'>): string => {
    const newId = `rel-${Date.now().toString().slice(-4)}`;
    const newRecord: ReleaseRequest = {
      ...release,
      id: newId,
      status: 'AWAITING_DECISION',
      submittedAt: new Date().toISOString()
    };

    setReleases(prev => [newRecord, ...prev]);

    setFdrs(prev => prev.map(f => {
      if (f.id === release.fdrId) {
        return {
          ...f,
          lifecycleStatus: 'RELEASE_REQUESTED',
          releaseStatus: 'AWAITING_DECISION',
          updatedAt: new Date().toISOString()
        };
      }
      return f;
    }));

    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        recipientRoles: ['REGULATORY_ADMIN', 'REGULATORY_OFFICER'],
        category: 'RELEASE',
        title: `Security Deposit Release Requested: ${release.fdrNumber}`,
        message: `${release.institutionName} requested release of ₹${(release.principalAmount / 100000).toFixed(1)} Lakhs. Reason: ${release.reason}.`,
        priority: 'HIGH',
        relatedFdrId: release.fdrId,
        isRead: false,
        createdAt: new Date().toISOString()
      },
      ...prev
    ]);

    addAuditLog({
      action: 'RELEASE_REQUEST_SUBMITTED',
      entityType: 'RELEASE',
      entityId: newId,
      summary: `Release request filed for ${release.fdrNumber} (₹${release.principalAmount}) by ${currentUser.name}.`
    });

    return newId;
  };

  const reviewRelease = (id: string, decision: 'APPROVED' | 'REJECTED' | 'ADDITIONAL_INFO_REQUIRED', remarks: string) => {
    const targetRel = releases.find(r => r.id === id);
    if (!targetRel) return;

    const newReleaseStatus = decision === 'APPROVED' ? 'APPROVED' : decision === 'REJECTED' ? 'REJECTED' : 'ADDITIONAL_INFO_REQUIRED';

    setReleases(prev => prev.map(r => {
      if (r.id === id) {
        return {
          ...r,
          status: newReleaseStatus,
          reviewedBy: currentUser.name,
          reviewerRemarks: remarks,
          decisionDate: new Date().toISOString()
        };
      }
      return r;
    }));

    // Update parent FDR
    setFdrs(prev => prev.map(f => {
      if (f.id === targetRel.fdrId) {
        return {
          ...f,
          releaseStatus: newReleaseStatus,
          lifecycleStatus: decision === 'APPROVED' ? 'RELEASED' : f.lifecycleStatus,
          updatedAt: new Date().toISOString()
        };
      }
      return f;
    }));

    // Notify institution
    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        recipientRoles: ['INSTITUTION_ADMIN', 'INSTITUTION_OPERATOR'],
        institutionId: targetRel.institutionId,
        category: 'RELEASE',
        title: `Release Request ${decision}: ${targetRel.fdrNumber}`,
        message: `Decision recorded by ${currentUser.name}: "${remarks}"`,
        priority: decision === 'APPROVED' ? 'MEDIUM' : 'URGENT',
        relatedFdrId: targetRel.fdrId,
        isRead: false,
        createdAt: new Date().toISOString()
      },
      ...prev
    ]);

    addAuditLog({
      action: `RELEASE_${decision}`,
      entityType: 'RELEASE',
      entityId: id,
      summary: `Release application ${id} for ₹${targetRel.principalAmount} recorded as ${decision} by ${currentUser.name}.`
    });
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        simulatedDate,
        institutions,
        fdrs,
        renewals,
        releases,
        notifications,
        auditLogs,
        setCurrentUser,
        switchRole,
        advanceSimulationDays,
        resetToDefaultData,
        createFdr,
        updateFdr,
        verifyFdr,
        triggerBankVerification,
        createRenewal,
        reviewRenewal,
        createRelease,
        reviewRelease,
        markNotificationAsRead,
        markAllNotificationsRead,
        addAuditLog
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
