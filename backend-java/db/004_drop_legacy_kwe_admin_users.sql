-- Retires the old single-table role model, replaced by 003_rbac_schema.sql.
-- Run only after users have been moved into pf_users / pf_userroles.
DROP TABLE IF EXISTS quoteownr.kwe_admin_users;
