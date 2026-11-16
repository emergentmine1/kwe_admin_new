# Authentication, RBAC & security setup

## Model (quoteownr schema, `db/003_rbac_schema.sql`)

```
pf_users ── pf_userroles ── md_roles ── pf_rolepermissions ── md_permissions
md_menus ── pf_menupermissions ── md_permissions        (md_menus.parentmenucode → submenus)
pf_apipermissions (httpmethod + endpointpattern → permissioncode)
```

Additions agreed on top of the design document:
- `pf_users.accountid` defaults to `uuidv7()` (PostgreSQL 18+ / Aurora PostgreSQL 18).
- Unique: `LOWER(emailid)`, `(accountid, rolecode)`, `(rolecode, permissioncode)`, `(menucode, permissioncode)`,
  `(httpmethod, endpointpattern, permissioncode)`, `md_permissions (function, action)`.

## Database scripts (run in order, before `mvn compile` — jOOQ codegen reads the tables)

| Script | Where |
|---|---|
| `002_kwe_rate_profile.sql` | all environments (needs `btree_gist`) |
| `003_rbac_schema.sql` | all environments |
| `004_drop_legacy_kwe_admin_users.sql` | once, after moving users out of the old table |
| `900_seed_dummy_rbac.sql` | **DEV / local only** — dummy roles, permissions, menus, API rules, 4 users |

Load your approved roles / permissions / menus / API rules in QA, UAT and PROD (not the 900 seed).

## How a request is authorized

1. Okta (or static dev) token validated: signature, issuer, audience, expiry.
2. Email claim normalised (trim + lower-case) and matched to `LOWER(pf_users.emailid)` with `status = TRUE`.
3. Effective permissions = active roles → their active permissions. **Re-read on every request**, so changes apply
   immediately. No user / inactive / no permission / DB error ⇒ no authority ⇒ **403**. Fails closed.
4. Every `/api/**` call (except the public ones) must match an **active `pf_apipermissions` row** (method + Spring
   PathPattern relative to the context path, e.g. `/api/v1/rate-profiles/{id}`) **and** the caller must hold that
   row's permission. No matching row ⇒ **403**. Rules are cached for 60 seconds.
5. `GET /api/v1/auth/me` returns `{ email, name, permissions[], menus[] }`; menus come from `pf_menupermissions`
   (parents of visible submenus are included). The admin UI builds its navigation from this.

Public (no token): `GET /api/v1/masterdata/**`, `GET /api/v1/profiledata/**`, `POST /api/v1/quote-requests`,
`POST /api/v1/auth/static-login` (static mode only), `/ping`, `/actuator/health`, `/actuator/info`.

## Frontend permission codes

The UI checks these codes (`admin-ui/src/lib/auth/permissions.ts`): `RATE_VIEW`, `RATE_CREATE`, `RATE_EDIT`,
`RATE_DELETE`, `LEAD_VIEW`, `LEAD_EDIT`, `LEAD_DELETE`, `QUOTE_VIEW`, `ADMIN_VIEW`. If your catalogue uses other
codes, change that one file.

## Modes

| `KWE_AUTH_MODE` | Use |
|---|---|
| `okta` | QA / UAT / PROD. `OKTA_ISSUER`, `OKTA_AUDIENCE`. Okta app type **Web** (the Next.js server does the code exchange); redirect URI `<APP_PUBLIC_URL><BASE_PATH>/login/callback`. |
| `static` | Local/dev only. `STATIC_JWT_SECRET` (32+ chars), `STATIC_LOGIN_PASSWORD`. Still requires an active `pf_users` row with a permission. |

## Security headers

API responses: `Content-Security-Policy: default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'`,
HSTS, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`, `Permissions-Policy`, `X-Content-Type-Options`.
Swagger UI / API docs are off (`SWAGGER_ENABLED=false`) and not reachable through security.

## Context path

`SERVER_CONTEXT_PATH` (e.g. `/rqms-api`). Security rules and `pf_apipermissions` patterns are relative to it, so the
same data works in every environment. Point the UI's `BACKEND_URL` at `https://<host><context path>`.

## Dummy accounts (900 seed / UI demo mode) — password `Demo@123` (static mode: `STATIC_LOGIN_PASSWORD`)

| Email | Result |
|---|---|
| write-user@kwe.com | RATE_ADMIN — Pricing, Leads, Quotes (all actions) |
| read-user@kwe.com | SALES_VIEWER — Leads + Quotes, view only |
| inactive@kwe.com | inactive ⇒ denied |
| norole@kwe.com | no role ⇒ denied |
