# DepositFlow — Security Deposit & FDR Management System
### Smart India Hackathon 2026 — Problem Statement SIH26265: "Streamline of Security Deposit / FDR Portal"
**Subtitle:** Centralized FDR Lifecycle Management, Verification & Compliance Monitoring

---

## 🏆 Project Executive Summary
**DepositFlow** is an enterprise-grade digital portal engineered to solve Smart India Hackathon Problem Statement **SIH26265**. It transitions the technical education regulatory ecosystem (AICTE, State Technical Boards, Affiliating Universities) from manual, fragmented paper-and-spreadsheet Fixed Deposit Receipt (FDR) tracking into a unified, secure, and auditable digital lifecycle workflow.

The core design principle is:
> **"One institution. One verified record. One traceable lifecycle."**

---

## 🚀 Key Modules & Capabilities

### 1. Multi-Persona Authentication & Server-Enforced RBAC
Supports 5 distinct personas with server-level access isolation:
- **Regulatory Administrator (AICTE Director)**: System-wide aggregate analytics, reminder threshold settings, audit review, and release authorization.
- **Regulatory Scrutiny Officer (Verifier)**: Scrutiny workspace, side-by-side OCR review, discrepancy flagging, SFMS gateway queries, and approval decisions.
- **Institution Administrator (Principal / Director)**: Institution profile management, authorized user provisioning, FDR submission, and renewal/release requests.
- **Institution FDR Operator (Finance Officer)**: Instrument creation, document uploads, and deadline response.
- **Statutory Auditor (CAG / Read-Only)**: Verifiable inspection drawers and non-repudiable audit trails.
*Includes an instant persona switcher in the top navigation bar for seamless live Hackathon judging evaluations.*

### 2. Live Operational Dashboard with Persistent Calculations
- **KPI Cards**: Real-time calculation of active instruments, total secured deposit capital in Indian currency (₹ Crores & Lakhs), pending verifications, instruments expiring in ≤30 days, matured overdue cases, and active release claims.
- **Exposure Analytics**: Issuing bank concentration breakdown (State Bank of India, Punjab National Bank, HDFC, Canara Bank, ICICI Bank, Bank of Baroda).
- **Lifecycle Pipeline**: Real-time tracking across `ACTIVE`, `UNDER_VERIFICATION`, `CORRECTION_REQUIRED`, `MATURED_NEEDS_REVIEW`, `RENEWAL_IN_PROGRESS`, and `RELEASE_REQUESTED`.

### 3. 6-Stage Structured FDR Submission Wizard
- **Step 1**: Institution profile & regulatory deposit mandate (Endowment Fund / New Programme Expansion / Land & Building / Deficiency Compliance).
- **Step 2**: Issuing scheduled bank, branch details, IFSC, masked account numbers, and certificate reference numbers.
- **Step 3**: Principal deposit capital, interest rate, issue and maturity dates, and mandatory joint lien declaration to Member Secretary AICTE.
- **Step 4**: Secure document upload with file checksum integrity and mock OCR extraction.
- **Step 5**: Automated pre-submission rule validation (uniqueness check, date logic, minimum deposit thresholds, and mandatory joint lien verification).
- **Step 6**: Final confirmation and instant append-only audit event logging.

### 4. Dedicated Verification & Scrutiny Workspace
- **Side-by-Side Comparison**: Side-by-side inspection of institution-entered metadata vs. scanned physical FDR certificates and OCR text extracts.
- **Simulated SFMS Bank Verification Adapter**: Live query trigger simulating Structured Financial Messaging System (SFMS) interbank lien registration messages.
- **Scrutiny Verdict Panel**: One-click actions to *Approve & Mark Verified*, *Flag Discrepancies & Request Corrections*, or *Reject Submission* with mandatory scrutiny remarks.

### 5. Automated Maturity Monitoring Engine with Time Machine
- **Urgency Buckets**: Automatic categorization into `Critical (≤7 Days)`, `Upcoming (≤30 Days)`, `Horizon (≤60-90 Days)`, and `Matured (Action Overdue)`.
- **Interactive Time Machine**: Allows judges to advance simulated system dates by +7, +15, or +30 days to watch active instruments transition into alert bands and automatically dispatch notifications.

### 6. Renewal & Replacement Rollover Module
- Preserves complete historical records of maturing predecessor FDRs.
- Links successor instruments without overwriting historical compliance records.
- Provides side-by-side predecessor vs. successor comparison for regulatory officers.

### 7. Statutory Release & Refund Workflow
- Strict prerequisite verification: AICTE Regional Office NOC, student fee/dues clearance, statutory audit clearance, and court affidavit.
- Transparent status tracking from `Submitted` to `Under Review` to `Authorized Release`.

### 8. Compliance Reporting & Append-Only Audit Trail
- 6 pre-built exportable reports: Master FDR Register, Bank Exposure Schedule, Maturity Schedule, Discrepancy Audit, Release Execution Register, and Tamper-Evident Audit Trail.
- One-click CSV dossier export and print-ready stylesheets.
- Append-only event logging with actor attribution, timestamp, and IP address logging.

---

## 🛠️ Technology Stack
- **Framework**: Next.js 16 with React 19 and TypeScript
- **Styling**: Tailwind CSS with custom government-enterprise financial operations palette
- **Icons**: Lucide React
- **Typography**: Inter (Google Fonts)
- **State & Storage**: React Context + LocalStorage persistence with seed dataset reset capability

---

## 💻 Running the Application Locally

### Prerequisites
- Node.js (v18 or higher; tested on Node v24)
- npm (v9 or higher)

### Installation & Execution
```bash
# Navigate to the project directory
cd deposit-flow

# Install dependencies (if not already installed)
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 🧑‍⚖️ Demonstration Guide for Hackathon Judges
1. **Persona Switching**: Use the top-right persona switcher to experience the platform as different stakeholders (Regulatory Admin, Scrutiny Officer, Institution Admin, Auditor).
2. **Submit a New FDR**: Click "+ Submit New FDR Record", progress through the 6-stage wizard, and observe the automated rule check engine.
3. **Conduct Scrutiny**: Switch to *Er. Rajesh Verma (Scrutiny Officer)*, open the *Verification & Scrutiny* tab, test the "Query Bank Gateway" adapter, and verify the record.
4. **Trigger Time Machine**: Use the "Time Machine" button in the top navigation to advance time by +15 or +30 days, and observe maturity alerts updating in the notification center.
5. **Inspect Rollovers & Releases**: Check *Renewals & Replacements* and *Release & Refund Portal* to inspect compliance prerequisites and rollover lineage.
6. **Export Dossier**: Navigate to *Reports & Analytics* and download an official CSV dossier.

---
*Developed for Smart India Hackathon 2026 • Problem Statement SIH26265.*
