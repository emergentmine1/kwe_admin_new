# KWE Instant Quote Admin

```
/app
├── admin-ui/        Next.js 16 (App Router, SSR) + React 19 + TypeScript + Tailwind 4 admin app
├── backend-java/    Spring Boot 3.5 + jOOQ + PostgreSQL 18 API (see backend-java/AUTH_SETUP.md)
├── deploy/env/      DEV / QA / UAT / PROD variable templates (frontend + backend)
└── docker-compose.yml
```

## Admin UI only, dummy data (no backend)

Needs Node.js 20.9+ (22 LTS recommended) and Yarn.

```bash
cd admin-ui
cp .env.example .env      # set AUTH_MODE=demo and SESSION_SECRET (32+ random characters)
yarn install
yarn dev                  # http://localhost:3000 with hot reload
# or: yarn build && yarn serve   (production server)
```

**Sign in with SSO** → email → **Next** → password `Demo@123`. Accounts: `write-user@kwe.com` (all access),
`read-user@kwe.com` (Leads + Quotes, view only), `inactive@kwe.com` and `outsider@kwe.com` (denied).

## With the Java backend

1. Database (PostgreSQL 18 / Aurora PostgreSQL 18): run `backend-java/db/002…`, `003…` and, on DEV only, `900…`.
2. Backend: set the variables from `backend-java/.env.example`, then
   `cd backend-java && ./mvnw clean package && java -jar target/kwe-quote-service-0.1.0-SNAPSHOT.jar`
3. UI `.env`: `AUTH_MODE=static` (dev) or `okta`, `BACKEND_URL=http://localhost:8080<SERVER_CONTEXT_PATH>`, then `yarn dev`.

The browser only talks to the Next.js server. It keeps the token in an encrypted http-only cookie and forwards
API calls (`/bff/api/v1/...`) to the backend with the bearer token.

## UI environment variables

| Variable | Notes |
|---|---|
| `AUTH_MODE` | `demo` (browser data, no backend), `static` (dummy backend login), `okta` (production) |
| `SESSION_SECRET` | 32+ chars, different per environment. Encrypts the session cookie. |
| `BASE_PATH` | Context path, e.g. `/rqms`. **Build time** — one image per environment. Empty = root. |
| `BACKEND_URL` | `static` / `okta`: backend base URL including its context path |
| `APP_PUBLIC_URL`, `OKTA_ISSUER`, `OKTA_CLIENT_ID`, `OKTA_CLIENT_SECRET`, `OKTA_IDP_ID`, `OKTA_SCOPES` | `okta` mode. Okta app type **Web**, redirect URI `<APP_PUBLIC_URL><BASE_PATH>/login/callback`. |

## Security

- Strict Content-Security-Policy on every page: per-request nonce, `'strict-dynamic'`, **no `'unsafe-inline'` and
  no `'unsafe-eval'`** (dev server only adds `'unsafe-eval'`). Plus HSTS, `X-Frame-Options: DENY`, `nosniff`,
  `Referrer-Policy`, `Permissions-Policy`.
- No inline styles or event handlers in the code. ESLint blocks `style=`, `dangerouslySetInnerHTML` and `next/image`
  (it emits inline styles).
- Role/permission checks run on the server for every page and API call; the UI re-checks every 5 minutes.

## Quality

```bash
cd admin-ui && yarn typecheck && yarn lint     # TypeScript strict + ESLint (Next + SonarJS rules), 0 warnings allowed
```

## Docker

```bash
docker build -t kwe-admin-ui --build-arg BASE_PATH=/rqms admin-ui
docker compose up --build frontend             # demo mode on http://localhost:3001 (needs SESSION_SECRET in .env)
```
