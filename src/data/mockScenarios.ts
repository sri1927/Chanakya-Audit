import { StagingTarget, Finding, AttackTreeNode } from '../types/audit';

export const STAGING_TARGETS: StagingTarget[] = [
  {
    id: 'bharatpay',
    name: 'BharatPay UPI & Payment Switch',
    domain: 'staging-api.bharatpay.in',
    sector: 'Fintech & UPI Infrastructure',
    architecture: 'Node.js Express / PostgreSQL / Redis / Razorpay-Cashfree Gateway',
    description: 'High-volume payment aggregation platform for Indian MSMEs handling UPI intents, merchant settlements, and wallet balances.',
    endpointsCount: 18,
    modules: [
      'Authentication & Gatekeeping',
      'Account Dashboard & Identity',
      'Administrative Controls',
      'Transactional & Financial',
      'Documents & File Actions',
      'API Gateways & Ingestion',
      'Regulatory & Privacy',
    ],
  },
  {
    id: 'kiranamart',
    name: 'KiranaMart B2B Supply Portal',
    domain: 'portal.kiranamart.co.in',
    sector: 'MSME E-Commerce & Logistics',
    architecture: 'Python FastAPI / Mongo / AWS S3 / Elasticsearch',
    description: 'Wholesale B2B supply ordering platform connecting 12,000+ local retail stores in tier-2/tier-3 cities with inventory lines.',
    endpointsCount: 14,
    modules: [
      'Authentication & Gatekeeping',
      'Account Dashboard & Identity',
      'Administrative Controls',
      'Transactional & Financial',
      'Documents & File Actions',
      'API Gateways & Ingestion',
      'Regulatory & Privacy',
    ],
  },
  {
    id: 'swasthyaplus',
    name: 'SwasthyaPlus Telehealth & EHR Records',
    domain: 'app.swasthyaplus.health',
    sector: 'HealthTech & Ayushman Bharat Digital Mission (ABDM)',
    architecture: 'Next.js App Router / Go Microservices / PostgreSQL / S3',
    description: 'ABDM-integrated digital health locker managing ABHA IDs, patient diagnostic reports, doctor consultations, and medical prescriptions.',
    endpointsCount: 22,
    modules: [
      'Authentication & Gatekeeping',
      'Account Dashboard & Identity',
      'Administrative Controls',
      'Transactional & Financial',
      'Documents & File Actions',
      'API Gateways & Ingestion',
      'Regulatory & Privacy',
    ],
  },
  {
    id: 'vidyasetu',
    name: 'VidyaSetu EdTech SaaS Platform',
    domain: 'learn.vidyasetu.edu.in',
    sector: 'EdTech & Higher Education',
    architecture: 'Spring Boot / React SPA / MySQL / CloudFront',
    description: 'Competitive exam prep and video lecture delivery serving 85,000+ students across Indian states with parent consent workflows.',
    endpointsCount: 16,
    modules: [
      'Authentication & Gatekeeping',
      'Account Dashboard & Identity',
      'Administrative Controls',
      'Transactional & Financial',
      'Documents & File Actions',
      'API Gateways & Ingestion',
      'Regulatory & Privacy',
    ],
  },
];

export const MOCK_FINDINGS: Record<string, Finding[]> = {
  bharatpay: [
    {
      id: 'FINDING-BP-01',
      name: 'Unrestricted Parameter Tampering on Transaction Amount & Currency Sign',
      targetPath: '/checkout/payment',
      severity: 'Critical',
      moduleCategory: 'Transactional & Financial',
      explanation: 'The payment reconciliation endpoint trusts the client-provided `order_amount` JSON key without cryptographically signing the order payload against server-side merchant state. Modifying the payload allows sub-rupee transaction verification.',
      pocStep: {
        method: 'POST',
        endpoint: '/api/v1/orders/create-session',
        payloadType: 'Price Parameter Tampering (Safe Canary Verification)',
        safeCanaryPayload: '{"order_id":"ORD_CANARY_984","amount":1.00,"canary_probe":"CHANAKYA_AMT_VERIFY","currency":"INR"}',
        expectedResponse: 'HTTP 200 OK returned with checksum validated against 1.00 INR instead of 4,999.00 INR catalog price.',
      },
      remediation: {
        overview: 'Derive transaction pricing strictly from immutable server-side database records. Sign all outbound payment payloads using HMAC-SHA256 with the merchant gateway secret before invoking Razorpay/Cashfree APIs.',
        codeLanguages: [
          {
            language: 'Node.js (Express)',
            fileLocation: 'src/controllers/paymentController.js',
            vulnerableSnippet: `// ❌ Vulnerable: trusting client-supplied amount
app.post('/api/v1/orders/create-session', async (req, res) => {
  const { order_id, amount, currency } = req.body;
  const paymentIntent = await gateway.orders.create({
    amount: amount * 100, // Client controls amount!
    currency,
    receipt: order_id
  });
  res.json({ session_id: paymentIntent.id });
});`,
            secureSnippet: `// ✅ Fixed: server-authoritative pricing and HMAC verification
app.post('/api/v1/orders/create-session', authenticateUser, async (req, res) => {
  const { order_id } = req.body;
  const dbOrder = await db.orders.findById(order_id);
  if (!dbOrder || dbOrder.userId !== req.user.id) {
    return res.status(404).json({ error: 'Order not found' });
  }

  // Derive exact amount from database only
  const exactAmountPaise = Math.round(dbOrder.finalAmountRupees * 100);
  const paymentIntent = await gateway.orders.create({
    amount: exactAmountPaise,
    currency: 'INR',
    receipt: \`ORD_\${dbOrder.id}\`,
    notes: { merchantId: req.user.merchantId }
  });
  res.json({ session_id: paymentIntent.id, order_id: dbOrder.id });
});`,
          },
        ],
      },
      complianceDeficit: {
        owasp: 'A04:2021 - Insecure Design & A01:2021 - Broken Access Control',
        dpdp2023: 'Section 8(5) - Inadequate security safeguards to protect financial personal records',
        certIn: 'Mandatory 6-Hour Reporting required if financial logic exploited in production',
        penaltyRisk: 'High (Under DPDP Section 33(1) up to ₹250 Cr for systemic financial data breach)',
      },
    },
    {
      id: 'FINDING-BP-02',
      name: 'Insecure Direct Object Reference (IDOR) on Merchant Settlement Bank Records',
      targetPath: '/account/settings',
      severity: 'High',
      moduleCategory: 'Account Dashboard & Identity',
      explanation: 'The settlement accounts endpoint accepts an unvalidated `merchant_id` path parameter. A low-privileged merchant account can view IFSC, masked account numbers, and GSTIN of other merchants.',
      pocStep: {
        method: 'GET',
        endpoint: '/api/v1/merchants/MERC_49012/settlement-profile',
        payloadType: 'IDOR Parameter Traversal',
        safeCanaryPayload: 'GET /api/v1/merchants/MERC_CANARY_TEST/settlement-profile HTTP/1.1 (Token: MERC_USER_204)',
        expectedResponse: 'HTTP 200 OK returning banking details of MERC_CANARY_TEST without matching session identity.',
      },
      remediation: {
        overview: 'Enforce strict session-bound tenancy checks at the middleware layer. Extract merchant ID exclusively from verified JWT session claims, ignoring URL query/path identifiers.',
        codeLanguages: [
          {
            language: 'Node.js (Express)',
            fileLocation: 'src/middleware/authorizeTenant.js',
            vulnerableSnippet: `// ❌ Vulnerable: Reads merchant ID from path parameter
router.get('/merchants/:merchantId/settlement-profile', async (req, res) => {
  const profile = await db.settlements.findOne({ merchantId: req.params.merchantId });
  res.json(profile);
});`,
            secureSnippet: `// ✅ Fixed: Reads merchant ID strictly from validated session
router.get('/merchants/me/settlement-profile', verifyAuthToken, async (req, res) => {
  const activeMerchantId = req.user.merchantId;
  const profile = await db.settlements.findOne({ merchantId: activeMerchantId });
  if (!profile) return res.status(404).json({ error: 'Profile not found' });
  res.json(profile);
});`,
          },
        ],
      },
      complianceDeficit: {
        owasp: 'A01:2021 - Broken Access Control',
        dpdp2023: 'Section 8(1) - Failure of Data Fiduciary to maintain personal data confidentiality',
        certIn: 'Unauthorized access to customer bank metadata qualifies under CERT-In incident checklist',
      },
    },
    {
      id: 'FINDING-BP-03',
      name: 'Missing DPDP Act 2023 Purpose Specification & Notice on PAN/Aadhaar Collection',
      targetPath: '/signup',
      severity: 'Medium',
      moduleCategory: 'Regulatory & Privacy',
      explanation: 'Merchant onboarding form requests PAN and GSTIN numbers without presenting an unambiguous DPDP Notice specifying purpose of processing, grievance officer details, and withdrawal mechanisms in plain English/scheduled Indian languages.',
      pocStep: {
        method: 'GET',
        endpoint: '/signup/merchant-kyc',
        payloadType: 'DPDP Act Section 5 Compliance Verification',
        safeCanaryPayload: 'CheckComplianceBaselines(dom_content: "#kyc-form")',
        expectedResponse: 'No Consent Manager registration or DPDP Section 5 Notice artifact rendered in DOM.',
      },
      remediation: {
        overview: 'Implement a DPDP-compliant Notice modal prior to KYC document ingestion. Include Data Protection Officer (DPO) contact, purpose limitation (PMLA & RBI compliance), and explicit consent toggle.',
        codeLanguages: [
          {
            language: 'React / TypeScript',
            fileLocation: 'src/components/DPDPNoticeModal.tsx',
            vulnerableSnippet: `// ❌ Non-Compliant: Silent collection of personal KYC identifiers
<form onSubmit={handleKYC}>
  <input name="panNumber" placeholder="Enter PAN Number" />
  <button type="submit">Submit KYC</button>
</form>`,
            secureSnippet: `// ✅ DPDP Act 2023 Section 5 Compliant Notice
<form onSubmit={handleKYC}>
  <input name="panNumber" placeholder="Enter PAN Number" />
  <div className="dpdp-consent-box p-3 border rounded text-xs text-neutral-300">
    <p><strong>Notice under DPDP Act 2023:</strong> Your PAN is collected exclusively for RBI Merchant Settlement compliance. 
    Data Fiduciary: BharatPay India Ltd. Grievance Officer: grievance@bharatpay.in.</p>
    <label className="flex items-center gap-2 mt-2">
      <input type="checkbox" required name="dpdpConsent" />
      <span>I give explicit, informed consent for this processing.</span>
    </label>
  </div>
  <button type="submit">Submit KYC</button>
</form>`,
          },
        ],
      },
      complianceDeficit: {
        owasp: 'A04:2021 - Insecure Design',
        dpdp2023: 'Section 5(1) & 5(2) - Notice and Consent prerequisites violated',
        certIn: 'CERT-In guidelines mandate verifiable KYC compliance logs',
        penaltyRisk: 'Medium (Section 33(1) penalty for failing to provide DPDP Notice up to ₹50 Cr)',
      },
    },
    {
      id: 'FINDING-BP-04',
      name: 'Unrestricted File Upload on Merchant Invoice & Cheque Upload Form',
      targetPath: '/upload',
      severity: 'High',
      moduleCategory: 'Documents & File Actions',
      explanation: 'The cancelled cheque verification form checks file extension via client-side regex only. Disguised SVG or HTML files with embedded scripts can be uploaded and rendered under target domain.',
      pocStep: {
        method: 'POST',
        endpoint: '/api/v1/documents/upload',
        payloadType: 'MIME Verification & Path Sanitization',
        safeCanaryPayload: 'POST multipart/form-data [filename="canary_audit.pdf.html", Content-Type="text/html", Content="<!-- Chanakya-Audit-Safe-Probe -->"]',
        expectedResponse: 'HTTP 201 Created with public S3 URL executing rendered HTML context.',
      },
      remediation: {
        overview: 'Validate file headers (magic bytes) on the server, reject executable MIME types, randomize uploaded filenames to UUIDv4, and serve uploads strictly with Content-Disposition: attachment and sandboxed domains.',
        codeLanguages: [
          {
            language: 'Node.js (Express)',
            fileLocation: 'src/routes/upload.js',
            vulnerableSnippet: `// ❌ Vulnerable: trusting client file extension
const upload = multer({ dest: 'uploads/' });
app.post('/api/v1/documents/upload', upload.single('doc'), (req, res) => {
  res.json({ url: '/uploads/' + req.file.originalname });
});`,
            secureSnippet: `// ✅ Fixed: Magic number verification + safe MIME allowlist + UUID
import fileType from 'file-type';
import crypto from 'node:crypto';

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'application/pdf']);

app.post('/api/v1/documents/upload', upload.single('doc'), async (req, res) => {
  const type = await fileType.fromBuffer(req.file.buffer);
  if (!type || !ALLOWED_MIME.has(type.mime)) {
    return res.status(400).json({ error: 'Invalid document type. Allowed: PDF, JPEG, PNG only.' });
  }

  const safeFilename = \`\${crypto.randomUUID()}.\${type.ext}\`;
  await s3.putObject({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: \`kyc-docs/\${safeFilename}\`,
    Body: req.file.buffer,
    ContentType: type.mime,
    ContentDisposition: 'attachment' // Prevents browser execution
  });

  res.json({ fileId: safeFilename });
});`,
          },
        ],
      },
      complianceDeficit: {
        owasp: 'A08:2021 - Software and Data Integrity Failures',
        dpdp2023: 'Section 8(5) - Inadequate technical safeguards against unauthorized server tampering',
      },
    },
    {
      id: 'FINDING-BP-05',
      name: 'Missing CERT-In 180-Day System Logging & Missing NTP Synchronization Header',
      targetPath: '/sys-mgmt',
      severity: 'Medium',
      moduleCategory: 'Administrative Controls',
      explanation: 'Application audit logs in API gateway do not capture IPv6 client addresses, UTC/IST timestamp synchronization source (NTP), or mandatory 180-day secure retention flags required by CERT-In Directive April 2022.',
      pocStep: {
        method: 'GET',
        endpoint: '/api/v1/admin/audit-logs/health',
        payloadType: 'CERT-In Baseline Log Audit',
        safeCanaryPayload: 'VerifySessionLogic(token="ADMIN_TEST_TOKEN", test_type="certin_log_retention")',
        expectedResponse: 'Logs rotated every 7 days; NTP synchronization status: Unconfigured.',
      },
      remediation: {
        overview: 'Configure enterprise log shipping to immutable S3/Glacier storage retained for 180 days with SHA-256 integrity hashes, synchronizing system clocks with National Physical Laboratory (NPL) / National Informatics Centre (NIC) NTP servers.',
        codeLanguages: [
          {
            language: 'Node.js (Winston Logger)',
            fileLocation: 'src/utils/certInLogger.js',
            vulnerableSnippet: `// ❌ Vulnerable: ephemeral console logging with no retention
console.log(\`User logged in: \${req.user.id}\`);`,
            secureSnippet: `// ✅ CERT-In Compliant Logger (180 days retention + NTP timestamp)
import winston from 'winston';

export const certInAuditLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'bharatpay-api',
    ntpSynced: true,
    certInRetentionDays: 180
  },
  transports: [
    new winston.transports.File({ filename: 'logs/certin-audit.log' }),
    // Stream to immutable AWS S3 Glacier Vault with 180-day retention lock
  ],
});`,
          },
        ],
      },
      complianceDeficit: {
        certIn: 'CERT-In Directive No. 20(3)/2022-CERT-In: Mandatory 180-day log maintenance in Indian jurisdiction',
        owasp: 'A09:2021 - Security Logging and Monitoring Failures',
      },
    },
  ],
  kiranamart: [
    {
      id: 'FINDING-KM-01',
      name: 'Broken Function Level Authorization on Wholesale Admin Dashboard',
      targetPath: '/admin/dashboard',
      severity: 'Critical',
      moduleCategory: 'Administrative Controls',
      explanation: 'The wholesale administrative dashboard routes at `/admin/*` rely solely on client-side React router guards. Unauthenticated HTTP requests directly to `/api/v1/admin/retailers/bulk-export` return raw retailer GSTINs and turnover numbers.',
      pocStep: {
        method: 'GET',
        endpoint: '/api/v1/admin/retailers/bulk-export',
        payloadType: 'BFLA Access Verification',
        safeCanaryPayload: 'GET /api/v1/admin/retailers/bulk-export HTTP/1.1 (No Authorization Header)',
        expectedResponse: 'HTTP 200 OK returning 1,400 retailer records with contact and GST numbers.',
      },
      remediation: {
        overview: 'Enforce server-side role-based access control (RBAC) middleware on all administrative endpoints. Verify `SUPER_ADMIN` scope on each request before accessing data.',
        codeLanguages: [
          {
            language: 'Python (FastAPI)',
            fileLocation: 'app/routers/admin.py',
            vulnerableSnippet: `# ❌ Vulnerable: No server-side permission check
@router.get('/api/v1/admin/retailers/bulk-export')
async def export_retailers():
    return db.retailers.find({})`,
            secureSnippet: `# ✅ Fixed: Require Admin role dependency
from fastapi import Depends, HTTPException, status
from app.auth import get_current_admin_user

@router.get('/api/v1/admin/retailers/bulk-export')
async def export_retailers(current_user = Depends(get_current_admin_user)):
    if current_user.role != 'SUPER_ADMIN':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: Super Admin privileges required."
        )
    return db.retailers.find({}, {"gstin": 0, "bankAccount": 0})`,
          },
        ],
      },
      complianceDeficit: {
        owasp: 'A01:2021 - Broken Access Control',
        dpdp2023: 'Section 8(5) - Neglect in safeguarding merchant commercial data',
        certIn: 'Mandatory breach notification required if accessed by external actors',
        penaltyRisk: 'Critical (Up to ₹250 Cr under DPDP 2023)',
      },
    },
    {
      id: 'FINDING-KM-02',
      name: 'SQL/NoSQL Query Injection in Inventory Catalog Filter Hub',
      targetPath: '/search',
      severity: 'High',
      moduleCategory: 'API Gateways & Ingestion',
      explanation: 'Search filter endpoint accepts unescaped MongoDB query operators inside the `category` query parameter, enabling query manipulation to expose private supplier procurement pricing.',
      pocStep: {
        method: 'GET',
        endpoint: '/api/v1/inventory/search?category[$ne]=null',
        payloadType: 'NoSQL Operator Injection (Safe Canary Verification)',
        safeCanaryPayload: 'GET /api/v1/inventory/search?sku=CANARY_PROBE_101&category[$ne]=null',
        expectedResponse: 'HTTP 200 OK returning unpublished draft inventory items and internal supplier cost price keys.',
      },
      remediation: {
        overview: 'Enforce strict schema validation using Pydantic or Joi. Disallow raw object keys in query parameters and sanitize inputs against MongoDB operators (`$gt`, `$ne`, `$where`).',
        codeLanguages: [
          {
            language: 'Python (FastAPI)',
            fileLocation: 'app/schemas/search.py',
            vulnerableSnippet: `# ❌ Vulnerable: Passing raw dictionary to MongoDB
@router.get('/api/v1/inventory/search')
async def search_inventory(query_params: dict = Depends(get_query_params)):
    return await db.items.find(query_params).to_list(100)`,
            secureSnippet: `# ✅ Fixed: Strict Pydantic model preventing operator injection
from pydantic import BaseModel, constr

class InventoryFilter(BaseModel):
    category: constr(strip_whitespace=True, regex=r'^[a-zA-Z0-9_\-]+$') | None = None
    query: constr(strip_whitespace=True, max_length=50) | None = None

@router.get('/api/v1/inventory/search')
async def search_inventory(filters: InventoryFilter = Depends()):
    mongo_filter = {"is_published": True}
    if filters.category:
        mongo_filter["category_slug"] = filters.category
    return await db.items.find(mongo_filter, {"supplier_cost_paise": 0}).to_list(100)`,
          },
        ],
      },
      complianceDeficit: {
        owasp: 'A03:2021 - Injection',
        dpdp2023: 'Section 8(5) - Data Fiduciary security deficit',
      },
    },
  ],
  swasthyaplus: [
    {
      id: 'FINDING-SP-01',
      name: 'IDOR on Patient Ayushman Bharat ABHA Health Records & Diagnostic Reports',
      targetPath: '/download',
      severity: 'Critical',
      moduleCategory: 'Documents & File Actions',
      explanation: 'The diagnostic report export endpoint `/api/v1/ehr/reports/export?report_id=EHR-10928` takes a sequential report ID without verifying if the authenticated session owns the ABHA ID associated with that medical record.',
      pocStep: {
        method: 'GET',
        endpoint: '/api/v1/ehr/reports/export?report_id=EHR-10929',
        payloadType: 'Direct Object Reference Parameter Traversal',
        safeCanaryPayload: 'GET /api/v1/ehr/reports/export?report_id=CANARY_SAFE_EHR_001 HTTP/1.1',
        expectedResponse: 'HTTP 200 OK streaming medical diagnostic lab PDF with patient Aadhaar-linked name and diagnoses.',
      },
      remediation: {
        overview: 'Implement cryptographic bearer tokens or UUIDv4 identifiers mapped directly to the patient session context. Verify ABHA consent manager consent artifact prior to streaming health files.',
        codeLanguages: [
          {
            language: 'Go (Gin/Fiber)',
            fileLocation: 'services/ehr/handlers.go',
            vulnerableSnippet: `// ❌ Vulnerable: No ownership verification
func DownloadReport(c *gin.Context) {
    reportID := c.Query("report_id")
    report := db.GetReport(reportID)
    c.File(report.FilePath)
}`,
            secureSnippet: `// ✅ Fixed: Enforce ABHA Patient Session Ownership
func DownloadReport(c *gin.Context) {
    userClaims := c.MustGet("user").(*Claims)
    reportUUID := c.Query("report_id")

    report, err := db.GetReportByUUID(c.Request.Context(), reportUUID)
    if err != nil || report.PatientABHAID != userClaims.ABHAID {
        c.JSON(http.StatusForbidden, gin.H{"error": "Access denied to requested medical record"})
        return
    }

    c.Header("Content-Disposition", "attachment; filename=DiagnosticReport.pdf")
    c.File(report.EncryptedStoragePath)
}`,
          },
        ],
      },
      complianceDeficit: {
        owasp: 'A01:2021 - Broken Access Control',
        dpdp2023: 'Section 8(1) & 8(5) - Severe failure to safeguard Sensitive Personal Data (Health records)',
        certIn: 'Mandatory 6-Hour reporting to CERT-In (breach of critical digital health infrastructure)',
        penaltyRisk: 'Critical (Max penalty of ₹250 Crores under DPDP Act 2023)',
      },
    },
    {
      id: 'FINDING-SP-02',
      name: 'Missing Right to Erasure / Data Principal Withdrawal Workflow',
      targetPath: '/privacy-policy',
      severity: 'High',
      moduleCategory: 'Regulatory & Privacy',
      explanation: 'Under DPDP Act 2023 Section 11, Data Principals have the explicit legal right to withdraw consent and mandate deletion of personal health records. The application contains no programmatic or self-serve erasure endpoint.',
      pocStep: {
        method: 'GET',
        endpoint: '/user/settings/privacy',
        payloadType: 'DPDP Section 11 & 12 Verification',
        safeCanaryPayload: 'CheckComplianceBaselines(dom_content: "#privacy-settings")',
        expectedResponse: 'Zero mechanisms for consent withdrawal or data erasure request tracking.',
      },
      remediation: {
        overview: 'Build an authenticated consent withdrawal and personal data erasure request pipeline with 72-hour fulfillment tracking and automated logging of erasure certificates.',
        codeLanguages: [
          {
            language: 'Go (Gin)',
            fileLocation: 'services/privacy/erasure.go',
            vulnerableSnippet: `// ❌ No erasure API endpoint exists in current codebase`,
            secureSnippet: `// ✅ DPDP Act 2023 Section 11 Compliant Erasure API
func RequestDataErasure(c *gin.Context) {
    claims := c.MustGet("user").(*Claims)
    
    ticket := db.CreateErasureTicket(claims.UserID, "DPDP_SEC_11_WITHDRAWAL")
    // Notify connected Data Processors & Health Information Providers (HIPs)
    eventBus.Publish("dpdp.erasure.requested", ticket)

    c.JSON(http.StatusAccepted, gin.H{
        "status": "Erasure request initiated",
        "ticket_id": ticket.ID,
        "resolution_sla": "72 hours under DPDP Rule 6",
        "dpo_contact": "dpo@swasthyaplus.health",
    })
}`,
          },
        ],
      },
      complianceDeficit: {
        dpdp2023: 'Section 11(2) & 12 - Rights and Grievance Redressal of Data Principal',
        owasp: 'A04:2021 - Insecure Design',
        penaltyRisk: 'High (DPDP Section 33(1) penalty up to ₹200 Cr for denying Data Principal rights)',
      },
    },
  ],
  vidyasetu: [
    {
      id: 'FINDING-VS-01',
      name: 'Unverifiable Parental Consent for Child Personal Data Processing',
      targetPath: '/register',
      severity: 'Critical',
      moduleCategory: 'Regulatory & Privacy',
      explanation: 'Under Section 9 of the DPDP Act 2023, processing personal data of individuals under 18 years requires verifiable parental consent. The student registration form asks for date of birth but allows self-certification with zero parental OTP/identity verification.',
      pocStep: {
        method: 'POST',
        endpoint: '/api/v1/auth/student-register',
        payloadType: 'DPDP Section 9 Child Data Audit',
        safeCanaryPayload: '{"name":"Rohan Kumar","dob":"2012-05-14","parent_consent":true,"canary":"TEST_CHILD"}',
        expectedResponse: 'HTTP 201 Created with session token issued for 14-year-old student without parent verification.',
      },
      remediation: {
        overview: 'Implement verifiable parental consent verification via DigiLocker / Aadhaar OTP or parent email/SMS token before activating accounts for users below 18 years of age.',
        codeLanguages: [
          {
            language: 'Java (Spring Boot)',
            fileLocation: 'src/main/java/com/vidyasetu/auth/StudentRegistrationService.java',
            vulnerableSnippet: `// ❌ Vulnerable: Accepts unverified parent consent boolean
public User registerStudent(StudentRegistrationDto dto) {
    User student = new User(dto.getName(), dto.getDob());
    return userRepository.save(student); // Child data stored without parental proof
}`,
            secureSnippet: `// ✅ DPDP Section 9 Compliant: Enforces Parent OTP Verification
public RegistrationResponse registerStudent(StudentRegistrationDto dto) {
    int age = Period.between(dto.getDob(), LocalDate.now()).getYears();
    if (age < 18) {
        if (!parentOtpService.isParentVerified(dto.getParentMobile(), dto.getParentOtp())) {
            throw new SecurityComplianceException(
                "DPDP Act Section 9 Violation: Verifiable parental consent required for child accounts."
            );
        }
    }
    User student = new User(dto.getName(), dto.getDob(), dto.getParentMobile(), true);
    return userRepository.save(student);
}`,
          },
        ],
      },
      complianceDeficit: {
        dpdp2023: 'Section 9(1) - Processing of personal data of children without verifiable consent',
        owasp: 'A04:2021 - Insecure Design',
        penaltyRisk: 'Highest (DPDP Act Section 33 Schedule 1 imposes maximum penalty of ₹200 Crores)',
      },
    },
  ],
};

export const INITIAL_ATTACK_TREE: AttackTreeNode = {
  id: 'root-target',
  title: 'Target Root Domain',
  path: '/',
  status: 'scanning',
  testedCount: 7,
  children: [
    {
      id: 'auth-gate',
      title: 'Authentication & Gatekeeping',
      path: '/auth/*',
      status: 'vulnerable',
      testedCount: 5,
      children: [
        { id: 'auth-login', title: 'Login & Rate Limiting', path: '/login', status: 'secure', testedCount: 3 },
        { id: 'auth-signup', title: 'Signup & Password Policies', path: '/signup', status: 'vulnerable', testedCount: 4, findingId: 'FINDING-BP-03' },
        { id: 'auth-reset', title: 'Password Reset & OTP Token', path: '/forgot-password', status: 'secure', testedCount: 2 },
      ],
    },
    {
      id: 'account-mgmt',
      title: 'Account & Identity Management',
      path: '/account/*',
      status: 'vulnerable',
      testedCount: 4,
      children: [
        { id: 'acc-profile', title: 'Profile & Settings (IDOR)', path: '/user/profile', status: 'vulnerable', testedCount: 3, findingId: 'FINDING-BP-02' },
        { id: 'acc-session', title: 'Session Cookie Flags', path: '/settings/sessions', status: 'secure', testedCount: 2 },
      ],
    },
    {
      id: 'admin-ctrl',
      title: 'Administrative Controls & RBAC',
      path: '/admin/*',
      status: 'vulnerable',
      testedCount: 3,
      children: [
        { id: 'admin-dash', title: 'Admin Dashboard (BFLA)', path: '/admin/dashboard', status: 'vulnerable', testedCount: 2, findingId: 'FINDING-KM-01' },
        { id: 'admin-logs', title: 'CERT-In System Logs & NTP', path: '/sys-mgmt', status: 'vulnerable', testedCount: 2, findingId: 'FINDING-BP-05' },
      ],
    },
    {
      id: 'transact-fin',
      title: 'Transactional & Financial Portals',
      path: '/checkout/*',
      status: 'vulnerable',
      testedCount: 4,
      children: [
        { id: 'trans-payment', title: 'Payment Parameter Tampering', path: '/checkout/payment', status: 'vulnerable', testedCount: 4, findingId: 'FINDING-BP-01' },
        { id: 'trans-orders', title: 'UPI Intent Callback Verification', path: '/orders/callback', status: 'secure', testedCount: 2 },
      ],
    },
    {
      id: 'docs-upload',
      title: 'Documents & File Actions',
      path: '/documents/*',
      status: 'vulnerable',
      testedCount: 3,
      children: [
        { id: 'doc-upload', title: 'KYC File Upload (MIME Bypass)', path: '/upload', status: 'vulnerable', testedCount: 3, findingId: 'FINDING-BP-04' },
        { id: 'doc-download', title: 'Health & Invoice LFI/IDOR', path: '/download', status: 'vulnerable', testedCount: 2, findingId: 'FINDING-SP-01' },
      ],
    },
    {
      id: 'api-gateway',
      title: 'API Gateway & Ingestion Hubs',
      path: '/api/v1/*',
      status: 'vulnerable',
      testedCount: 6,
      children: [
        { id: 'api-search', title: 'Search Parameter Injection', path: '/search', status: 'vulnerable', testedCount: 3, findingId: 'FINDING-KM-02' },
        { id: 'api-stacktrace', title: 'Error Leakage & Schema Exposures', path: '/api/v1/query', status: 'secure', testedCount: 2 },
      ],
    },
    {
      id: 'privacy-dpdp',
      title: 'Regulatory & Privacy Touchpoints',
      path: '/privacy-policy',
      status: 'vulnerable',
      testedCount: 4,
      children: [
        { id: 'priv-notice', title: 'DPDP Act Notice Specification', path: '/privacy-policy', status: 'vulnerable', testedCount: 2, findingId: 'FINDING-SP-02' },
        { id: 'priv-child', title: 'DPDP Child Consent Verifier', path: '/register', status: 'vulnerable', testedCount: 2, findingId: 'FINDING-VS-01' },
      ],
    },
  ],
};
