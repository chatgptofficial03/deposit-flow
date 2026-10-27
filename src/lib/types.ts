export type UserRole = 
  | 'REGULATORY_ADMIN'
  | 'REGULATORY_OFFICER'
  | 'INSTITUTION_ADMIN'
  | 'INSTITUTION_OPERATOR'
  | 'AUDITOR';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  designation: string;
  institutionId?: string;
  institutionName?: string;
  avatar?: string;
}

export type DepositCategory =
  | 'MANDATORY_ENDOWMENT'
  | 'LAND_AND_BUILDING'
  | 'NEW_PROGRAMME_APPROVAL'
  | 'DEFICIENCY_SECURITY'
  | 'GENERAL_AFFILIATION';

export type LifecycleStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_VERIFICATION'
  | 'CORRECTION_REQUIRED'
  | 'VERIFIED'
  | 'ACTIVE'
  | 'RENEWAL_IN_PROGRESS'
  | 'MATURED_NEEDS_REVIEW'
  | 'RELEASE_REQUESTED'
  | 'RELEASED'
  | 'REJECTED';

export type VerificationStatus =
  | 'NOT_REVIEWED'
  | 'PENDING'
  | 'DOC_REVIEWED'
  | 'DISCREPANCY_FLAGGED'
  | 'BANK_CONFIRMED'
  | 'VERIFIED_OFFICIAL'
  | 'REJECTED';

export type MaturityStatus =
  | 'HEALTHY'
  | 'EXPIRING_90'
  | 'EXPIRING_60'
  | 'EXPIRING_30'
  | 'EXPIRING_7'
  | 'MATURED';

export type ReleaseStatus =
  | 'NONE'
  | 'REQUESTED'
  | 'UNDER_REVIEW'
  | 'ADDITIONAL_INFO_REQUIRED'
  | 'AWAITING_DECISION'
  | 'APPROVED'
  | 'REJECTED'
  | 'RELEASED';

export interface Institution {
  id: string;
  code: string;
  name: string;
  type: 'ENGINEERING' | 'MANAGEMENT' | 'POLYTECHNIC' | 'ARCHITECTURE' | 'PHARMACY';
  state: string;
  city: string;
  address: string;
  contactPerson: string;
  email: string;
  phone: string;
  status: 'ACTIVE' | 'SCRUTINY_REQUIRED' | 'SUSPENDED';
  totalFdrCount: number;
  totalDepositValue: number;
}

export interface FdrDocument {
  id: string;
  name: string;
  category: 'FDR_RECEIPT' | 'JOINT_LIEN_LETTER' | 'BOARD_RESOLUTION' | 'AICTE_APPROVAL' | 'RENEWAL_ENDORSEMENT';
  fileType: string;
  fileSize: string;
  uploadDate: string;
  uploadedBy: string;
  fileUrl: string;
  checksum: string;
  isVerified: boolean;
  ocrExtractedData?: {
    fdrNumber?: string;
    bankName?: string;
    amount?: number;
    issueDate?: string;
    maturityDate?: string;
    jointHolder?: string;
  };
}

export interface DiscrepancyItem {
  id: string;
  field: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  status: 'OPEN' | 'RESOLVED';
  reportedBy: string;
  reportedAt: string;
  resolvedAt?: string;
  resolutionRemarks?: string;
}

export interface BankVerificationAdapter {
  isSimulated: boolean;
  adapterName: string; // e.g., "SFMS Bank Gateway / NEFT Lien Verification Adapter"
  referenceCode: string;
  verifiedAt: string;
  status: 'CONFIRMED' | 'UNCONFIRMED' | 'FAILED';
  issuingBankResponse: string;
  lienMarkedToAICTE: boolean;
}

export interface FdrRecord {
  id: string;
  fdrNumber: string;
  institutionId: string;
  institutionName: string;
  institutionCode: string;
  depositCategory: DepositCategory;
  issuingBank: string;
  branchName: string;
  ifscCode: string;
  accountNumberMasked: string;
  principalAmount: number;
  currency: 'INR';
  interestRate: number;
  issueDate: string; // YYYY-MM-DD
  maturityDate: string; // YYYY-MM-DD
  depositTermMonths: number;
  autoRenewal: boolean;
  jointHolderName: string; // e.g. "AICTE & Apex Institute of Technology"
  
  // Separate status concepts
  lifecycleStatus: LifecycleStatus;
  verificationStatus: VerificationStatus;
  maturityStatus: MaturityStatus;
  releaseStatus: ReleaseStatus;
  
  daysUntilMaturity: number;
  
  // Renewal tracking
  predecessorFdrId?: string;
  successorFdrId?: string;
  
  // Scrutiny & Verification
  documents: FdrDocument[];
  discrepancies: DiscrepancyItem[];
  scrutinyRemarks?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  bankVerification?: BankVerificationAdapter;
  
  // Metadata
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface RenewalRequest {
  id: string;
  originalFdrId: string;
  originalFdrNumber: string;
  institutionId: string;
  institutionName: string;
  proposedFdrNumber: string;
  proposedBank: string;
  proposedBranch: string;
  proposedAmount: number;
  proposedIssueDate: string;
  proposedMaturityDate: string;
  renewalReason: string;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'CORRECTION_REQUIRED' | 'APPROVED' | 'REJECTED';
  supportingDocs: FdrDocument[];
  submittedBy: string;
  submittedAt: string;
  reviewedBy?: string;
  reviewerRemarks?: string;
  reviewedAt?: string;
}

export interface ReleaseRequest {
  id: string;
  fdrId: string;
  fdrNumber: string;
  institutionId: string;
  institutionName: string;
  principalAmount: number;
  reason: 'COURSE_CLOSURE' | 'AFFILIATION_TERM_COMPLETED' | 'SURRENDERED_APPROVAL' | 'EXCESS_DEPOSIT_REFUND';
  justification: string;
  compliancePrerequisites: {
    nocObtained: boolean;
    noPendingStudentDues: boolean;
    statutoryAuditCleared: boolean;
    noCourtCasesPending: boolean;
  };
  supportingDocs: FdrDocument[];
  status: ReleaseStatus;
  submittedBy: string;
  submittedAt: string;
  reviewedBy?: string;
  reviewerRemarks?: string;
  decisionDate?: string;
}

export interface NotificationItem {
  id: string;
  recipientRoles: UserRole[];
  institutionId?: string;
  category: 'SUBMISSION' | 'VERIFICATION' | 'CORRECTION' | 'MATURITY_ALERT' | 'RENEWAL' | 'RELEASE' | 'AUDIT';
  title: string;
  message: string;
  priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
  relatedFdrId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  entityType: 'FDR' | 'RENEWAL' | 'RELEASE' | 'DOCUMENT' | 'VERIFICATION' | 'SYSTEM';
  entityId: string;
  summary: string;
  previousValue?: string;
  newValue?: string;
  remarks?: string;
  ipAddress: string;
}

export interface FilterOptions {
  searchQuery: string;
  status: string;
  bank: string;
  institutionId: string;
  dateRange: 'ALL' | 'NEXT_30_DAYS' | 'NEXT_60_DAYS' | 'NEXT_90_DAYS' | 'OVERDUE';
  category: string;
}
