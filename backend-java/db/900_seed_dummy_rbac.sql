-- DEV / LOCAL ONLY dummy RBAC data so the app can be signed into before the real catalogue arrives.
-- Do NOT run in QA / UAT / PROD — load the approved roles, permissions and menus there instead.
-- Idempotent. Mirrors the browser demo mode (admin-ui/src/lib/server/demo-users.ts).

INSERT INTO quoteownr.md_permissions (code, description, function, action, cby) VALUES
    ('RATE_VIEW',   'View rate profiles',     'rate',  'view',   'seed'),
    ('RATE_CREATE', 'Create rate profiles',   'rate',  'create', 'seed'),
    ('RATE_EDIT',   'Edit rate profiles',     'rate',  'edit',   'seed'),
    ('RATE_DELETE', 'Delete rate profiles',   'rate',  'delete', 'seed'),
    ('LEAD_VIEW',   'View customer leads',    'lead',  'view',   'seed'),
    ('LEAD_EDIT',   'Edit customer leads',    'lead',  'edit',   'seed'),
    ('LEAD_DELETE', 'Delete customer leads',  'lead',  'delete', 'seed'),
    ('QUOTE_VIEW',  'View quote requests',    'quote', 'view',   'seed'),
    ('QUOTE_EDIT',  'Update quote requests',  'quote', 'edit',   'seed')
ON CONFLICT (code) DO NOTHING;

INSERT INTO quoteownr.md_roles (code, name, description, cby) VALUES
    ('RATE_ADMIN',   'Rate Administrator', 'Full pricing, leads and quotes access', 'seed'),
    ('SALES_VIEWER', 'Sales Viewer',       'Read-only leads and quotes',            'seed')
ON CONFLICT (code) DO NOTHING;

INSERT INTO quoteownr.pf_rolepermissions (rolecode, permissioncode, cby)
SELECT 'RATE_ADMIN', code, 'seed' FROM quoteownr.md_permissions
UNION ALL SELECT 'SALES_VIEWER', 'LEAD_VIEW', 'seed'
UNION ALL SELECT 'SALES_VIEWER', 'QUOTE_VIEW', 'seed'
ON CONFLICT (rolecode, permissioncode) DO NOTHING;

INSERT INTO quoteownr.md_menus (code, name, parentmenucode, displayorder, routepath, cby) VALUES
    ('PRICING', 'Pricing Matrix', NULL, 10, '/admin/pricing', 'seed'),
    ('LEADS',   'Customer Leads', NULL, 20, '/admin/leads',   'seed'),
    ('QUOTES',  'Quotes',         NULL, 30, '/admin/quotes',  'seed')
ON CONFLICT (code) DO NOTHING;

INSERT INTO quoteownr.pf_menupermissions (menucode, permissioncode, cby) VALUES
    ('PRICING', 'RATE_VIEW', 'seed'),
    ('LEADS',   'LEAD_VIEW', 'seed'),
    ('QUOTES',  'QUOTE_VIEW', 'seed')
ON CONFLICT (menucode, permissioncode) DO NOTHING;

-- Endpoint patterns use Spring PathPattern syntax, relative to the servlet context path.
INSERT INTO quoteownr.pf_apipermissions (httpmethod, endpointpattern, permissioncode, cby) VALUES
    ('GET',    '/api/v1/rate-profiles',             'RATE_VIEW',   'seed'),
    ('GET',    '/api/v1/rate-profiles/{id}',        'RATE_VIEW',   'seed'),
    ('POST',   '/api/v1/rate-profiles',             'RATE_CREATE', 'seed'),
    ('PUT',    '/api/v1/rate-profiles/{id}',        'RATE_EDIT',   'seed'),
    ('PATCH',  '/api/v1/rate-profiles/{id}/status', 'RATE_EDIT',   'seed'),
    ('DELETE', '/api/v1/rate-profiles/{id}',        'RATE_DELETE', 'seed'),
    ('GET',    '/api/v1/quote-requests',            'QUOTE_VIEW',  'seed'),
    ('PATCH',  '/api/v1/quote-requests/{id}/status','QUOTE_EDIT',  'seed')
ON CONFLICT (httpmethod, endpointpattern, permissioncode) DO NOTHING;

INSERT INTO quoteownr.pf_users (emailid, name, status, cby) VALUES
    ('write-user@kwe.com', 'Write User',    TRUE,  'seed'),
    ('read-user@kwe.com',  'Read User',     TRUE,  'seed'),
    ('inactive@kwe.com',   'Inactive User', FALSE, 'seed'),
    ('norole@kwe.com',     'No Role',       TRUE,  'seed')
ON CONFLICT ((LOWER(emailid))) DO NOTHING;

INSERT INTO quoteownr.pf_userroles (accountid, rolecode, cby)
SELECT u.accountid, r.rolecode, 'seed'
FROM quoteownr.pf_users u
JOIN (VALUES ('write-user@kwe.com', 'RATE_ADMIN'), ('read-user@kwe.com', 'SALES_VIEWER'), ('inactive@kwe.com', 'RATE_ADMIN'))
     AS r (email, rolecode) ON LOWER(u.emailid) = r.email
ON CONFLICT (accountid, rolecode) DO NOTHING;
