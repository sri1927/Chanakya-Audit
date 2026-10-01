export interface InternalModuleAuditSpec {
  id: string;
  name: string;
  routes: string[];
  focusAreas: string[];
  safeCanaryStrategy: string;
  complianceRelevance: string;
}

export const INTERNAL_MODULES: InternalModuleAuditSpec[] = [
  {
    id: 'mod-1',
    name: '1. Authentication & Gatekeeping Endpoints',
    routes: ['/login', '/signup', '/register', '/forgot-password', '/reset'],
    focusAreas: [
      'Weak password complexity & lack of breach-hash checks',
      'Missing rate-limiting on credential verification and OTP requests',
      'Username enumeration via differential timing or error messages',
      'Cookie flag validation (HttpOnly, Secure, SameSite=Strict/Lax)',
      'JWT token expiration, signature algorithm check (none-alg ban)',
    ],
    safeCanaryStrategy: 'Send benign invalid credentials with random nonce; measure response timing and header flag attributes without triggering account lockouts.',
    complianceRelevance: 'OWASP A07:2021, DPDP Section 8(5) Technical Safeguards',
  },
  {
    id: 'mod-2',
    name: '2. Account Dashboard & Identity Management',
    routes: ['/dashboard', '/user/profile', '/settings', '/account'],
    focusAreas: [
      'Insecure Direct Object Reference (IDOR) on user UUID/numeric IDs',
      'Cross-tenant data leakage in multi-merchant environments',
      'Stored XSS via display name, bio, or business address inputs',
      'Session fixation after privilege or state alterations',
    ],
    safeCanaryStrategy: 'Inject harmless canary string `<!-- CHANAKYA_CANARY_IDOR -->` or query user’s own pre-allocated test tenant identifier.',
    complianceRelevance: 'OWASP A01:2021 Broken Access Control, DPDP Section 8 Confidentiality',
  },
  {
    id: 'mod-3',
    name: '3. Administrative Controls & Management Interfaces',
    routes: ['/admin', '/admin/dashboard', '/sys-mgmt', '/backend'],
    focusAreas: [
      'Broken Function-Level Authorization (BFLA)',
      'Direct API access without administrative RBAC verification',
      'Mass assignment parameter attacks (e.g. role: "superadmin" payload)',
      'Administrative audit logging and multi-factor enforcement',
    ],
    safeCanaryStrategy: 'Request admin route using standard unprivileged test session header; verify 401/403 barrier.',
    complianceRelevance: 'OWASP A01:2021 & A04:2021, CERT-In Administrative Access Controls',
  },
  {
    id: 'mod-4',
    name: '4. Transactional, E-Commerce & Financial Portals',
    routes: ['/cart', '/checkout', '/payment', '/billing', '/orders'],
    focusAreas: [
      'Parameter tampering on price, discounts, and item quantities',
      'Verification of Razorpay / Cashfree webhook signatures (HMAC-SHA256)',
      'UPI Intent callback replay protection',
      'Strict ban on raw card / Aadhaar / PAN exposure in client storage',
    ],
    safeCanaryStrategy: 'Submit test checkout request with test decimal value `1.00 INR`; verify server enforces server-side catalog price.',
    complianceRelevance: 'RBI Payment Aggregator Guidelines, OWASP A04:2021, DPDP Act 2023',
  },
  {
    id: 'mod-5',
    name: '5. Dynamic Reporting, Documents & File Actions',
    routes: ['/download', '/export', '/view-pdf', '/upload', '/media'],
    focusAreas: [
      'Unrestricted file upload & MIME bypass (double extensions)',
      'Local File Inclusion (LFI) & Path Traversal (`../../etc/passwd`)',
      'Server-Side Request Forgery via PDF generator engines',
      'Lack of Content-Disposition: attachment on uploaded blobs',
    ],
    safeCanaryStrategy: 'Upload dummy text file with MIME mismatch probe `text/plain` vs `.pdf`; verify server header validation and UUID renaming.',
    complianceRelevance: 'OWASP A08:2021 Software & Data Integrity Failures',
  },
  {
    id: 'mod-6',
    name: '6. Interactive API Gateways & Search Ingestion Hubs',
    routes: ['/api/v1/*', '/search', '/filter', '/query'],
    focusAreas: [
      'SQL / NoSQL operator injection in query params (`$ne`, `$gt`)',
      'Server error leakage (stack traces disclosing DB schema or ORM)',
      'GraphQL introspection enabled on production environments',
      'Rate-limiting and schema enforcement on search inputs',
    ],
    safeCanaryStrategy: 'Transmit benign syntax test string `CANARY_TEST_101` and check for unhandled SQL syntax error leakage in JSON body.',
    complianceRelevance: 'OWASP A03:2021 Injection & A05:2021 Security Misconfiguration',
  },
  {
    id: 'mod-7',
    name: '7. Regulatory, Privacy & Data Compliance Touchpoints',
    routes: ['/privacy-policy', '/terms', '/consent-mgr', '/dpo-contact'],
    focusAreas: [
      'DPDP Act 2023 Section 5 Notice compliance & language access',
      'Unbundled, granular consent without pre-checked boxes (Section 6)',
      'Verifiable parental consent for child users (Section 9)',
      'Data Principal Right to Erasure & Grievance Redressal (Section 11/12)',
      'CERT-In 6-Hour incident reporting readiness & 180-day log policy',
    ],
    safeCanaryStrategy: 'Automated DOM inspection for notice disclosure items, cookie consent trackers, and erasure ticket handlers.',
    complianceRelevance: 'DPDP Act 2023 (₹250 Cr Max Penalty), CERT-In 2022 Directives',
  },
];
