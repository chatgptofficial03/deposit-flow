import {
  UserSession,
  Institution,
  FdrRecord,
  RenewalRequest,
  ReleaseRequest,
  NotificationItem,
  AuditEvent
} from './types';

export const DEMO_USERS: UserSession[] = [
  {
    id: 'user-admin-1',
    name: 'Dr. Arvind K. Sharma',
    email: 'regulatory.director@aicte.gov.in.demo',
    role: 'REGULATORY_ADMIN',
    designation: 'Director (Approvals & Regulatory Compliance)',
    avatar: 'AS'
  },
  {
    id: 'user-officer-1',
    name: 'Er. Rajesh Verma',
    email: 'rajesh.verma@aicte.gov.in.demo',
    role: 'REGULATORY_OFFICER',
    designation: 'Senior Scrutiny & Verification Officer',
    avatar: 'RV'
  },
  {
    id: 'user-inst-admin-1',
    name: 'Prof. Sunita Deshmukh',
    email: 'principal@apextech.edu.in.demo',
    role: 'INSTITUTION_ADMIN',
    designation: 'Principal & Authorized Signatory',
    institutionId: 'inst-1',
    institutionName: 'Apex Institute of Technology & Science',
    avatar: 'SD'
  },
  {
    id: 'user-inst-operator-1',
    name: 'Vikram Malhotra',
    email: 'accounts@apextech.edu.in.demo',
    role: 'INSTITUTION_OPERATOR',
    designation: 'Finance & Compliance Officer',
    institutionId: 'inst-1',
    institutionName: 'Apex Institute of Technology & Science',
    avatar: 'VM'
  },
  {
    id: 'user-auditor-1',
    name: 'Meera Nambiar, FCA',
    email: 'statutory.audit@cag.gov.in.demo',
    role: 'AUDITOR',
    designation: 'Independent Regulatory Auditor',
    avatar: 'MN'
  }
];

export const DEMO_INSTITUTIONS: Institution[] = [
  {
    id: 'inst-1',
    code: '1-10293847',
    name: 'Apex Institute of Technology & Science',
    type: 'ENGINEERING',
    state: 'Maharashtra',
    city: 'Pune',
    address: 'Sector 24, Hinjawadi Phase III, Pune - 411057',
    contactPerson: 'Prof. Sunita Deshmukh',
    email: 'principal@apextech.edu.in.demo',
    phone: '+91 20 2293 8400',
    status: 'ACTIVE',
    totalFdrCount: 4,
    totalDepositValue: 12500000
  },
  {
    id: 'inst-2',
    code: '1-28491023',
    name: 'National Institute of Engineering & Technology',
    type: 'ENGINEERING',
    state: 'Karnataka',
    city: 'Bengaluru',
    address: 'Campus Road, Whitefield, Bengaluru - 560066',
    contactPerson: 'Dr. K. R. Ramanathan',
    email: 'director@niet-edu.in.demo',
    phone: '+91 80 4120 7700',
    status: 'ACTIVE',
    totalFdrCount: 3,
    totalDepositValue: 8500000
  },
  {
    id: 'inst-3',
    code: '1-39485721',
    name: 'Silicon Valley Polytechnic Institute',
    type: 'POLYTECHNIC',
    state: 'Telangana',
    city: 'Hyderabad',
    address: 'Gachibowli High-Tech Zone, Hyderabad - 500032',
    contactPerson: 'P. Venkat Rao',
    email: 'dean@svpolytech.ac.in.demo',
    phone: '+91 40 2311 9900',
    status: 'SCRUTINY_REQUIRED',
    totalFdrCount: 2,
    totalDepositValue: 4000000
  },
  {
    id: 'inst-4',
    code: '1-48291054',
    name: 'Saraswati College of Architecture & Design',
    type: 'ARCHITECTURE',
    state: 'Gujarat',
    city: 'Ahmedabad',
    address: 'Knowledge Corridor, Sarkhej-Gandhinagar Hwy, Ahmedabad - 382421',
    contactPerson: 'Ar. Malini Trivedi',
    email: 'registrar@scad.ac.in.demo',
    phone: '+91 79 2685 4100',
    status: 'ACTIVE',
    totalFdrCount: 2,
    totalDepositValue: 3500000
  },
  {
    id: 'inst-5',
    code: '1-59302918',
    name: 'Delhi Institute of Advanced Management Studies',
    type: 'MANAGEMENT',
    state: 'Delhi',
    city: 'New Delhi',
    address: 'Institutional Area, Lodhi Road, New Delhi - 110003',
    contactPerson: 'Dr. Sanjeev Kapoor',
    email: 'director@diams.edu.in.demo',
    phone: '+91 11 2461 8800',
    status: 'ACTIVE',
    totalFdrCount: 2,
    totalDepositValue: 5000000
  }
];

export const INITIAL_FDRS: FdrRecord[] = [
  {
    id: 'fdr-101',
    fdrNumber: 'FDR/SBI/2021/88921',
    institutionId: 'inst-1',
    institutionName: 'Apex Institute of Technology & Science',
    institutionCode: '1-10293847',
    depositCategory: 'MANDATORY_ENDOWMENT',
    issuingBank: 'State Bank of India',
    branchName: 'Hinjawadi Infotech Park Branch, Pune',
    ifscCode: 'SBIN0011032',
    accountNumberMasked: '•••• •••• 9012',
    principalAmount: 5000000,
    currency: 'INR',
    interestRate: 6.75,
    issueDate: '2021-11-04',
    maturityDate: '2026-11-04', // 8 days from demo date
    depositTermMonths: 60,
    autoRenewal: false,
    jointHolderName: 'Member Secretary AICTE & Apex Institute of Technology',
    lifecycleStatus: 'ACTIVE',
    verificationStatus: 'VERIFIED_OFFICIAL',
    maturityStatus: 'EXPIRING_7',
    releaseStatus: 'NONE',
    daysUntilMaturity: 8,
    documents: [
      {
        id: 'doc-101-1',
        name: 'Original_FDR_Receipt_88921.pdf',
        category: 'FDR_RECEIPT',
        fileType: 'application/pdf',
        fileSize: '1.4 MB',
        uploadDate: '2021-11-05',
        uploadedBy: 'Prof. Sunita Deshmukh',
        fileUrl: '/mock-documents/fdr-88921.pdf',
        checksum: 'sha256-a9f8e4b7c3d2e1f0',
        isVerified: true,
        ocrExtractedData: {
          fdrNumber: 'FDR/SBI/2021/88921',
          bankName: 'State Bank of India',
          amount: 5000000,
          issueDate: '2021-11-04',
          maturityDate: '2026-11-04',
          jointHolder: 'Member Secretary AICTE & Apex Institute'
        }
      },
      {
        id: 'doc-101-2',
        name: 'Bank_Lien_Confirmation_Letter.pdf',
        category: 'JOINT_LIEN_LETTER',
        fileType: 'application/pdf',
        fileSize: '820 KB',
        uploadDate: '2021-11-05',
        uploadedBy: 'Prof. Sunita Deshmukh',
        fileUrl: '/mock-documents/lien-88921.pdf',
        checksum: 'sha256-b8c7d6e5f4a3b2c1',
        isVerified: true
      }
    ],
    discrepancies: [],
    scrutinyRemarks: 'Verified against SBI SFMS confirmation message. Lien properly marked in favor of Member Secretary AICTE.',
    verifiedBy: 'Er. Rajesh Verma',
    verifiedAt: '2021-11-08',
    bankVerification: {
      isSimulated: true,
      adapterName: 'SFMS Interbank Lien Messaging Gateway (Simulated)',
      referenceCode: 'SFMS-SBI-20211108-98213',
      verifiedAt: '2021-11-08T14:32:00Z',
      status: 'CONFIRMED',
      issuingBankResponse: 'FDR Lien Registered Exclusively to Member Secretary AICTE under mandate code SEC-AICTE-09',
      lienMarkedToAICTE: true
    },
    createdBy: 'Prof. Sunita Deshmukh',
    createdAt: '2021-11-05T10:15:00Z',
    updatedAt: '2026-10-20T09:00:00Z'
  },
  {
    id: 'fdr-102',
    fdrNumber: 'FDR/HDFC/2023/44910',
    institutionId: 'inst-1',
    institutionName: 'Apex Institute of Technology & Science',
    institutionCode: '1-10293847',
    depositCategory: 'NEW_PROGRAMME_APPROVAL',
    issuingBank: 'HDFC Bank',
    branchName: 'Aundh Branch, Pune',
    ifscCode: 'HDFC0000052',
    accountNumberMasked: '•••• •••• 3418',
    principalAmount: 3500000,
    currency: 'INR',
    interestRate: 7.1,
    issueDate: '2023-11-18',
    maturityDate: '2026-11-18', // 22 days from demo date
    depositTermMonths: 36,
    autoRenewal: false,
    jointHolderName: 'Member Secretary AICTE & Apex Institute of Technology',
    lifecycleStatus: 'ACTIVE',
    verificationStatus: 'VERIFIED_OFFICIAL',
    maturityStatus: 'EXPIRING_30',
    releaseStatus: 'NONE',
    daysUntilMaturity: 22,
    documents: [
      {
        id: 'doc-102-1',
        name: 'HDFC_TermDeposit_44910.pdf',
        category: 'FDR_RECEIPT',
        fileType: 'application/pdf',
        fileSize: '1.1 MB',
        uploadDate: '2023-11-20',
        uploadedBy: 'Vikram Malhotra',
        fileUrl: '/mock-documents/fdr-44910.pdf',
        checksum: 'sha256-c3d4e5f6a1b2c3d4',
        isVerified: true
      }
    ],
    discrepancies: [],
    scrutinyRemarks: 'B.Tech AI & Data Science addition endowment security deposit verified.',
    verifiedBy: 'Er. Rajesh Verma',
    verifiedAt: '2023-11-22',
    bankVerification: {
      isSimulated: true,
      adapterName: 'HDFC Corporate API Verification (Simulated)',
      referenceCode: 'HDFC-API-99482-AICTE',
      verifiedAt: '2023-11-22T11:00:00Z',
      status: 'CONFIRMED',
      issuingBankResponse: 'Deposit Active. Lien recorded.',
      lienMarkedToAICTE: true
    },
    createdBy: 'Vikram Malhotra',
    createdAt: '2023-11-20T14:20:00Z',
    updatedAt: '2026-10-15T11:30:00Z'
  },
  {
    id: 'fdr-103',
    fdrNumber: 'FDR/PNB/2026/10294',
    institutionId: 'inst-1',
    institutionName: 'Apex Institute of Technology & Science',
    institutionCode: '1-10293847',
    depositCategory: 'LAND_AND_BUILDING',
    issuingBank: 'Punjab National Bank',
    branchName: 'Shivajinagar, Pune',
    ifscCode: 'PUNB0102900',
    accountNumberMasked: '•••• •••• 7721',
    principalAmount: 2500000,
    currency: 'INR',
    interestRate: 6.9,
    issueDate: '2026-10-10',
    maturityDate: '2031-10-10',
    depositTermMonths: 60,
    autoRenewal: true,
    jointHolderName: 'AICTE New Delhi & Apex Institute of Technology',
    lifecycleStatus: 'UNDER_VERIFICATION',
    verificationStatus: 'PENDING',
    maturityStatus: 'HEALTHY',
    releaseStatus: 'NONE',
    daysUntilMaturity: 1808,
    documents: [
      {
        id: 'doc-103-1',
        name: 'PNB_FDR_Receipt_Scan.pdf',
        category: 'FDR_RECEIPT',
        fileType: 'application/pdf',
        fileSize: '2.1 MB',
        uploadDate: '2026-10-12',
        uploadedBy: 'Vikram Malhotra',
        fileUrl: '/mock-documents/pnb-fdr-10294.pdf',
        checksum: 'sha256-e5f6a1b2c3d4e5f6',
        isVerified: false,
        ocrExtractedData: {
          fdrNumber: 'FDR/PNB/2026/10294',
          bankName: 'Punjab National Bank',
          amount: 2500000,
          issueDate: '2026-10-10',
          maturityDate: '2031-10-10',
          jointHolder: 'AICTE New Delhi & Apex Institute of Technology'
        }
      },
      {
        id: 'doc-103-2',
        name: 'PNB_Lien_Endorsement_Letter.pdf',
        category: 'JOINT_LIEN_LETTER',
        fileType: 'application/pdf',
        fileSize: '950 KB',
        uploadDate: '2026-10-12',
        uploadedBy: 'Vikram Malhotra',
        fileUrl: '/mock-documents/pnb-lien.pdf',
        checksum: 'sha256-f6a1b2c3d4e5f6a1',
        isVerified: false
      }
    ],
    discrepancies: [],
    createdBy: 'Vikram Malhotra',
    createdAt: '2026-10-12T16:00:00Z',
    updatedAt: '2026-10-12T16:00:00Z'
  },
  {
    id: 'fdr-104',
    fdrNumber: 'FDR/BOB/2021/33918',
    institutionId: 'inst-1',
    institutionName: 'Apex Institute of Technology & Science',
    institutionCode: '1-10293847',
    depositCategory: 'DEFICIENCY_SECURITY',
    issuingBank: 'Bank of Baroda',
    branchName: 'Kothrud Branch, Pune',
    ifscCode: 'BARB0KOTHRU',
    accountNumberMasked: '•••• •••• 5591',
    principalAmount: 1500000,
    currency: 'INR',
    interestRate: 6.5,
    issueDate: '2021-09-15',
    maturityDate: '2026-09-15', // Past maturity (Matured 42 days ago)
    depositTermMonths: 60,
    autoRenewal: false,
    jointHolderName: 'AICTE & Apex Institute of Technology',
    lifecycleStatus: 'MATURED_NEEDS_REVIEW',
    verificationStatus: 'VERIFIED_OFFICIAL',
    maturityStatus: 'MATURED',
    releaseStatus: 'NONE',
    daysUntilMaturity: -42,
    documents: [
      {
        id: 'doc-104-1',
        name: 'BOB_FixedDeposit_33918.pdf',
        category: 'FDR_RECEIPT',
        fileType: 'application/pdf',
        fileSize: '1.2 MB',
        uploadDate: '2021-09-16',
        uploadedBy: 'Prof. Sunita Deshmukh',
        fileUrl: '/mock-documents/bob-33918.pdf',
        checksum: 'sha256-d4e5f6a1b2c3d4e5',
        isVerified: true
      }
    ],
    discrepancies: [
      {
        id: 'disc-104-1',
        field: 'maturityDate',
        severity: 'HIGH',
        title: 'Instrument Past Maturity Without Renewal / Release Authorization',
        description: 'Instrument matured on 15-Sep-2026. Neither renewal nor release was concluded prior to maturity. Immediate action required under AICTE regulations.',
        status: 'OPEN',
        reportedBy: 'System Auto-Monitor',
        reportedAt: '2026-09-16T00:05:00Z'
      }
    ],
    scrutinyRemarks: 'Institution was alerted 30 days and 7 days prior to maturity. Renewal application is now overdue.',
    verifiedBy: 'Er. Rajesh Verma',
    verifiedAt: '2021-09-20',
    createdBy: 'Prof. Sunita Deshmukh',
    createdAt: '2021-09-16T11:00:00Z',
    updatedAt: '2026-09-16T00:05:00Z'
  },
  {
    id: 'fdr-201',
    fdrNumber: 'FDR/ICICI/2026/77812',
    institutionId: 'inst-3',
    institutionName: 'Silicon Valley Polytechnic Institute',
    institutionCode: '1-39485721',
    depositCategory: 'MANDATORY_ENDOWMENT',
    issuingBank: 'ICICI Bank',
    branchName: 'HITEC City, Hyderabad',
    ifscCode: 'ICIC0000048',
    accountNumberMasked: '•••• •••• 8812',
    principalAmount: 2500000,
    currency: 'INR',
    interestRate: 7.25,
    issueDate: '2026-08-15',
    maturityDate: '2031-08-15',
    depositTermMonths: 60,
    autoRenewal: false,
    jointHolderName: 'Silicon Valley Polytechnic Institute Only (Missing Joint Holder)',
    lifecycleStatus: 'CORRECTION_REQUIRED',
    verificationStatus: 'DISCREPANCY_FLAGGED',
    maturityStatus: 'HEALTHY',
    releaseStatus: 'NONE',
    daysUntilMaturity: 1752,
    documents: [
      {
        id: 'doc-201-1',
        name: 'ICICI_Receipt_77812.pdf',
        category: 'FDR_RECEIPT',
        fileType: 'application/pdf',
        fileSize: '1.5 MB',
        uploadDate: '2026-08-18',
        uploadedBy: 'P. Venkat Rao',
        fileUrl: '/mock-documents/icici-77812.pdf',
        checksum: 'sha256-a1b2c3d4e5f6a1b2',
        isVerified: false,
        ocrExtractedData: {
          fdrNumber: 'FDR/ICICI/2026/77812',
          bankName: 'ICICI Bank',
          amount: 2000000, // Discrepancy with entered 2,500,000!
          issueDate: '2026-08-15',
          maturityDate: '2031-08-15',
          jointHolder: 'Silicon Valley Polytechnic (Sole Name)'
        }
      }
    ],
    discrepancies: [
      {
        id: 'disc-201-1',
        field: 'principalAmount',
        severity: 'HIGH',
        title: 'Amount Discrepancy Between Form & Scanned Document',
        description: 'Institution entered ₹25,00,000, but scanned FDR receipt shows ₹20,00,000. Under-deposit by ₹5,00,000.',
        status: 'OPEN',
        reportedBy: 'Er. Rajesh Verma (Scrutiny Officer)',
        reportedAt: '2026-08-22T14:10:00Z'
      },
      {
        id: 'disc-201-2',
        field: 'jointHolderName',
        severity: 'HIGH',
        title: 'Mandatory AICTE Joint Lien Endorsement Missing',
        description: 'FDR is issued in sole institution name. AICTE mandate requires joint holding with Member Secretary, AICTE.',
        status: 'OPEN',
        reportedBy: 'Er. Rajesh Verma (Scrutiny Officer)',
        reportedAt: '2026-08-22T14:12:00Z'
      }
    ],
    scrutinyRemarks: 'Returned to institution for correction. Must resubmit corrected FDR with proper lien and matching ₹25L amount.',
    verifiedBy: 'Er. Rajesh Verma',
    verifiedAt: '2026-08-22T14:15:00Z',
    createdBy: 'P. Venkat Rao',
    createdAt: '2026-08-18T10:00:00Z',
    updatedAt: '2026-08-22T14:15:00Z'
  },
  {
    id: 'fdr-301',
    fdrNumber: 'FDR/CANARA/2021/55190',
    institutionId: 'inst-2',
    institutionName: 'National Institute of Engineering & Technology',
    institutionCode: '1-28491023',
    depositCategory: 'NEW_PROGRAMME_APPROVAL',
    issuingBank: 'Canara Bank',
    branchName: 'Whitefield Branch, Bengaluru',
    ifscCode: 'CNRB0001920',
    accountNumberMasked: '•••• •••• 4420',
    principalAmount: 3500000,
    currency: 'INR',
    interestRate: 6.8,
    issueDate: '2021-10-01',
    maturityDate: '2026-10-01', // Matured 26 days ago
    depositTermMonths: 60,
    autoRenewal: false,
    jointHolderName: 'Regional Officer AICTE & National Institute of Engineering',
    lifecycleStatus: 'RELEASE_REQUESTED',
    verificationStatus: 'VERIFIED_OFFICIAL',
    maturityStatus: 'MATURED',
    releaseStatus: 'AWAITING_DECISION',
    daysUntilMaturity: -26,
    documents: [
      {
        id: 'doc-301-1',
        name: 'Canara_FDR_55190.pdf',
        category: 'FDR_RECEIPT',
        fileType: 'application/pdf',
        fileSize: '1.3 MB',
        uploadDate: '2021-10-03',
        uploadedBy: 'Dr. K. R. Ramanathan',
        fileUrl: '/mock-documents/canara-55190.pdf',
        checksum: 'sha256-f1e2d3c4b5a6f7e8',
        isVerified: true
      },
      {
        id: 'doc-301-2',
        name: 'AICTE_Approval_Order_Completion.pdf',
        category: 'AICTE_APPROVAL',
        fileType: 'application/pdf',
        fileSize: '2.5 MB',
        uploadDate: '2026-10-05',
        uploadedBy: 'Dr. K. R. Ramanathan',
        fileUrl: '/mock-documents/aicte-order.pdf',
        checksum: 'sha256-a8b7c6d5e4f3a2b1',
        isVerified: true
      }
    ],
    discrepancies: [],
    scrutinyRemarks: 'Matured deposit. Institution has completed the statutory 5-year lock-in period for B.Arch addition and applied for release.',
    verifiedBy: 'Er. Rajesh Verma',
    verifiedAt: '2021-10-10',
    createdBy: 'Dr. K. R. Ramanathan',
    createdAt: '2021-10-03T11:00:00Z',
    updatedAt: '2026-10-05T15:30:00Z'
  },
  {
    id: 'fdr-401',
    fdrNumber: 'FDR/SBI/2026/90412',
    institutionId: 'inst-4',
    institutionName: 'Saraswati College of Architecture & Design',
    institutionCode: '1-48291054',
    depositCategory: 'MANDATORY_ENDOWMENT',
    issuingBank: 'State Bank of India',
    branchName: 'SG Highway Branch, Ahmedabad',
    ifscCode: 'SBIN0008420',
    accountNumberMasked: '•••• •••• 6192',
    principalAmount: 2000000,
    currency: 'INR',
    interestRate: 7.0,
    issueDate: '2026-05-10',
    maturityDate: '2031-05-10',
    depositTermMonths: 60,
    autoRenewal: true,
    jointHolderName: 'AICTE Western Region & Saraswati College of Architecture',
    lifecycleStatus: 'ACTIVE',
    verificationStatus: 'VERIFIED_OFFICIAL',
    maturityStatus: 'HEALTHY',
    releaseStatus: 'NONE',
    daysUntilMaturity: 1655,
    predecessorFdrId: 'fdr-old-400',
    documents: [
      {
        id: 'doc-401-1',
        name: 'Renewal_SBI_90412.pdf',
        category: 'RENEWAL_ENDORSEMENT',
        fileType: 'application/pdf',
        fileSize: '1.6 MB',
        uploadDate: '2026-05-12',
        uploadedBy: 'Ar. Malini Trivedi',
        fileUrl: '/mock-documents/renewal-sbi.pdf',
        checksum: 'sha256-1122334455667788',
        isVerified: true
      }
    ],
    discrepancies: [],
    scrutinyRemarks: 'Successor instrument replacing previous matured FDR/SBI/2021/11090. Valid through 2031.',
    verifiedBy: 'Dr. Arvind K. Sharma',
    verifiedAt: '2026-05-15',
    createdBy: 'Ar. Malini Trivedi',
    createdAt: '2026-05-12T09:30:00Z',
    updatedAt: '2026-05-15T16:00:00Z'
  },
  {
    id: 'fdr-501',
    fdrNumber: 'FDR/PNB/2024/66201',
    institutionId: 'inst-5',
    institutionName: 'Delhi Institute of Advanced Management Studies',
    institutionCode: '1-59302918',
    depositCategory: 'MANDATORY_ENDOWMENT',
    issuingBank: 'Punjab National Bank',
    branchName: 'Barakhamba Road, New Delhi',
    ifscCode: 'PUNB0014000',
    accountNumberMasked: '•••• •••• 1029',
    principalAmount: 3000000,
    currency: 'INR',
    interestRate: 7.15,
    issueDate: '2024-01-15',
    maturityDate: '2029-01-15',
    depositTermMonths: 60,
    autoRenewal: true,
    jointHolderName: 'Member Secretary AICTE & Delhi Institute of Advanced Management',
    lifecycleStatus: 'ACTIVE',
    verificationStatus: 'VERIFIED_OFFICIAL',
    maturityStatus: 'HEALTHY',
    releaseStatus: 'NONE',
    daysUntilMaturity: 810,
    documents: [],
    discrepancies: [],
    scrutinyRemarks: 'Verified against PNB official branch endorsement.',
    verifiedBy: 'Er. Rajesh Verma',
    verifiedAt: '2024-01-20',
    createdBy: 'Dr. Sanjeev Kapoor',
    createdAt: '2024-01-16T12:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z'
  }
];

export const INITIAL_RENEWALS: RenewalRequest[] = [
  {
    id: 'ren-001',
    originalFdrId: 'fdr-101',
    originalFdrNumber: 'FDR/SBI/2021/88921',
    institutionId: 'inst-1',
    institutionName: 'Apex Institute of Technology & Science',
    proposedFdrNumber: 'FDR/SBI/2026/99104',
    proposedBank: 'State Bank of India',
    proposedBranch: 'Hinjawadi Infotech Park Branch, Pune',
    proposedAmount: 5000000,
    proposedIssueDate: '2026-11-04',
    proposedMaturityDate: '2031-11-04',
    renewalReason: 'Endowment security deposit maturity approaching on 04-Nov-2026. Preemptive 5-year rollover proposed.',
    status: 'SUBMITTED',
    supportingDocs: [
      {
        id: 'ren-doc-1',
        name: 'Bank_Provisional_Renewal_Advice.pdf',
        category: 'RENEWAL_ENDORSEMENT',
        fileType: 'application/pdf',
        fileSize: '1.2 MB',
        uploadDate: '2026-10-25',
        uploadedBy: 'Prof. Sunita Deshmukh',
        fileUrl: '/mock-documents/renewal-advice.pdf',
        checksum: 'sha256-ren99104sbi',
        isVerified: false
      }
    ],
    submittedBy: 'Prof. Sunita Deshmukh',
    submittedAt: '2026-10-25T11:45:00Z'
  }
];

export const INITIAL_RELEASES: ReleaseRequest[] = [
  {
    id: 'rel-001',
    fdrId: 'fdr-301',
    fdrNumber: 'FDR/CANARA/2021/55190',
    institutionId: 'inst-2',
    institutionName: 'National Institute of Engineering & Technology',
    principalAmount: 3500000,
    reason: 'AFFILIATION_TERM_COMPLETED',
    justification: 'Statutory 5-year lock-in period for the additional 60-seat B.Arch intake completed with full AICTE compliance and no student grievances pending.',
    compliancePrerequisites: {
      nocObtained: true,
      noPendingStudentDues: true,
      statutoryAuditCleared: true,
      noCourtCasesPending: true
    },
    supportingDocs: [
      {
        id: 'rel-doc-1',
        name: 'Affiliation_Completion_NOC.pdf',
        category: 'AICTE_APPROVAL',
        fileType: 'application/pdf',
        fileSize: '1.8 MB',
        uploadDate: '2026-10-05',
        uploadedBy: 'Dr. K. R. Ramanathan',
        fileUrl: '/mock-documents/noc.pdf',
        checksum: 'sha256-rel-noc-canara',
        isVerified: true
      }
    ],
    status: 'AWAITING_DECISION',
    submittedBy: 'Dr. K. R. Ramanathan',
    submittedAt: '2026-10-05T15:30:00Z',
    reviewedBy: 'Er. Rajesh Verma',
    reviewerRemarks: 'Compliance prerequisites scrutinized and verified in order. Recommended to Director for final digital release authorization.',
    decisionDate: undefined
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    recipientRoles: ['REGULATORY_ADMIN', 'REGULATORY_OFFICER', 'INSTITUTION_ADMIN', 'INSTITUTION_OPERATOR'],
    institutionId: 'inst-1',
    category: 'MATURITY_ALERT',
    title: 'URGENT: FDR Expiring in 8 Days',
    message: 'FDR/SBI/2021/88921 (₹50,00,000) for Apex Institute of Technology matures on 04-Nov-2026. Renewal must be completed to prevent compliance breach.',
    priority: 'URGENT',
    relatedFdrId: 'fdr-101',
    isRead: false,
    createdAt: '2026-10-27T08:00:00Z'
  },
  {
    id: 'notif-2',
    recipientRoles: ['REGULATORY_OFFICER', 'REGULATORY_ADMIN'],
    category: 'VERIFICATION',
    title: 'New FDR Submission Awaiting Scrutiny',
    message: 'Punjab National Bank FDR/PNB/2026/10294 (₹25,00,000) submitted by Apex Institute of Technology requires officer scrutiny.',
    priority: 'HIGH',
    relatedFdrId: 'fdr-103',
    isRead: false,
    createdAt: '2026-10-12T16:05:00Z'
  },
  {
    id: 'notif-3',
    recipientRoles: ['INSTITUTION_ADMIN', 'INSTITUTION_OPERATOR'],
    institutionId: 'inst-3',
    category: 'CORRECTION',
    title: 'Action Required: Discrepancy Flagged on FDR/ICICI/2026/77812',
    message: 'Scrutiny Officer reported an amount mismatch and missing AICTE joint lien endorsement. Please review remarks and upload corrected instrument.',
    priority: 'URGENT',
    relatedFdrId: 'fdr-201',
    isRead: false,
    createdAt: '2026-08-22T14:16:00Z'
  },
  {
    id: 'notif-4',
    recipientRoles: ['REGULATORY_ADMIN'],
    category: 'RELEASE',
    title: 'Release Request Recommended for Approval',
    message: 'Release Request REL-001 (₹35,00,000) for National Institute of Engineering is awaiting final Director sign-off.',
    priority: 'HIGH',
    relatedFdrId: 'fdr-301',
    isRead: false,
    createdAt: '2026-10-26T10:00:00Z'
  }
];

export const INITIAL_AUDIT_LOG: AuditEvent[] = [
  {
    id: 'aud-001',
    timestamp: '2026-10-27T10:45:12Z',
    actorName: 'Dr. Arvind K. Sharma',
    actorRole: 'REGULATORY_ADMIN',
    action: 'SYSTEM_SETTINGS_UPDATE',
    entityType: 'SYSTEM',
    entityId: 'SYS_CONFIG',
    summary: 'Maturity warning thresholds verified [90, 60, 30, 15, 7, 0 days].',
    ipAddress: '10.14.20.105'
  },
  {
    id: 'aud-002',
    timestamp: '2026-10-25T11:45:00Z',
    actorName: 'Prof. Sunita Deshmukh',
    actorRole: 'INSTITUTION_ADMIN',
    action: 'RENEWAL_REQUEST_SUBMITTED',
    entityType: 'RENEWAL',
    entityId: 'ren-001',
    summary: 'Submitted renewal application for FDR/SBI/2021/88921 proposing successor instrument FDR/SBI/2026/99104.',
    newValue: 'Proposed Term: 60 Months, ₹50,00,000',
    remarks: 'Preemptive submission before 04-Nov-2026 maturity date.',
    ipAddress: '115.112.44.89'
  },
  {
    id: 'aud-003',
    timestamp: '2026-10-12T16:00:00Z',
    actorName: 'Vikram Malhotra',
    actorRole: 'INSTITUTION_OPERATOR',
    action: 'FDR_SUBMISSION_CREATED',
    entityType: 'FDR',
    entityId: 'fdr-103',
    summary: 'New Land & Building FDR/PNB/2026/10294 submitted with 2 supporting documents.',
    newValue: 'Status: UNDER_VERIFICATION, Principal: ₹25,00,000',
    ipAddress: '115.112.44.92'
  },
  {
    id: 'aud-004',
    timestamp: '2026-08-22T14:15:00Z',
    actorName: 'Er. Rajesh Verma',
    actorRole: 'REGULATORY_OFFICER',
    action: 'SCRUTINY_DISCREPANCY_FLAGGED',
    entityType: 'VERIFICATION',
    entityId: 'fdr-201',
    summary: 'Scrutiny Officer marked 2 discrepancies (Amount mismatch: ₹25L vs ₹20L, Missing Joint Lien). Returned for correction.',
    previousValue: 'UNDER_VERIFICATION',
    newValue: 'CORRECTION_REQUIRED',
    remarks: 'FDR scan shows ₹20L instead of entered ₹25L. AICTE lien missing in bank endorsement.',
    ipAddress: '10.14.20.118'
  }
];
