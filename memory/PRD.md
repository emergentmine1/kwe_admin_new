# KWE Instant Quote Admin — PRD
## Problem statement
"scan it" — user asked for an overview of the existing repo (emergentmine1/kwe_admin_new).
## Architecture
- admin-ui: React 19 + Vite + Tailwind/shadcn, Okta auth (okta/static/demo modes)
- backend-java: Spring Boot 3.5 + jOOQ + PostgreSQL (schema quoteownr), Spring Security JWT, role lookup in kwe_admin_users
- docker-compose runs both
## Implemented (as found, 2026-06)
- Login (SSO/Okta, static dummy, browser demo), role guards READ_ONLY / READ_WRITE, Access Denied
- Pricing Matrix: rate profiles (freight/origin), rate matrix editor, activate/deactivate, overlap rule
- Customer Leads page (601 lines, CSV/XLSX export), Quotes page file exists but route renders blank
## Gaps found
- /admin/quotes route renders empty div (Quotes.jsx not wired)
- Backend lacks masterdata/profiledata controllers and POST /quote-requests although security/UI reference them
- AUTH_SETUP lists tests but backend has no src/test folder
- Many placeholder pages (dashboard, shipments, invoices, provider mgmt, instant quote form)
## Backlog
P0 wire Quotes page; P1 add missing backend endpoints/tests; P2 implement placeholder pages
