-- KWE QuoteHub RBAC schema (from "KWE RBAC Revised DB Schema").
-- Agreed additions only: UUIDv7 default (PostgreSQL 18+ / Aurora PostgreSQL 18), unique rules on every
-- mapping table, case-insensitive unique email, UNIQUE(function, action) on md_permissions.
-- Run BEFORE `mvn compile`: jOOQ codegen reads these tables. Idempotent.

CREATE TABLE IF NOT EXISTS quoteownr.pf_users (
    accountid   UUID         NOT NULL DEFAULT uuidv7() PRIMARY KEY,
    emailid     VARCHAR(254) NOT NULL,
    name        VARCHAR(150),
    usertype    VARCHAR(20)  NOT NULL DEFAULT 'HUMAN',
    status      BOOLEAN      NOT NULL DEFAULT TRUE,
    rowversion  INTEGER      NOT NULL DEFAULT 1,
    cby         VARCHAR(100) NOT NULL,
    cdate       TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ctz         VARCHAR(5),
    ctzstd      VARCHAR(50),
    mby         VARCHAR(100),
    mdate       TIMESTAMPTZ,
    mtz         VARCHAR(5),
    mtzstd      VARCHAR(50)
);
-- One account per email regardless of case (John@kwe.com = john@kwe.com).
CREATE UNIQUE INDEX IF NOT EXISTS pf_users_emailid_uk ON quoteownr.pf_users (LOWER(emailid));

CREATE TABLE IF NOT EXISTS quoteownr.md_roles (
    code        VARCHAR(50)  NOT NULL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    status      BOOLEAN      NOT NULL DEFAULT TRUE,
    rowversion  INTEGER      NOT NULL DEFAULT 1,
    cby         VARCHAR(100) NOT NULL,
    cdate       TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ctz         VARCHAR(5),
    ctzstd      VARCHAR(50),
    mby         VARCHAR(100),
    mdate       TIMESTAMPTZ,
    mtz         VARCHAR(5),
    mtzstd      VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS quoteownr.pf_userroles (
    userroleid  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    accountid   UUID         NOT NULL REFERENCES quoteownr.pf_users (accountid),
    rolecode    VARCHAR(50)  NOT NULL REFERENCES quoteownr.md_roles (code),
    cby         VARCHAR(100) NOT NULL,
    cdate       TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ctz         VARCHAR(5),
    ctzstd      VARCHAR(50),
    mby         VARCHAR(100),
    mdate       TIMESTAMPTZ,
    mtz         VARCHAR(5),
    mtzstd      VARCHAR(50),
    CONSTRAINT pf_userroles_uk UNIQUE (accountid, rolecode)
);

CREATE TABLE IF NOT EXISTS quoteownr.md_permissions (
    code        VARCHAR(80)  NOT NULL PRIMARY KEY,
    description VARCHAR(500) NOT NULL,
    function    VARCHAR(80)  NOT NULL,
    action      VARCHAR(40)  NOT NULL,
    status      BOOLEAN      NOT NULL DEFAULT TRUE,
    rowversion  INTEGER      NOT NULL DEFAULT 1,
    cby         VARCHAR(100) NOT NULL,
    cdate       TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ctz         VARCHAR(5),
    ctzstd      VARCHAR(50),
    mby         VARCHAR(100),
    mdate       TIMESTAMPTZ,
    mtz         VARCHAR(5),
    mtzstd      VARCHAR(50),
    CONSTRAINT md_permissions_function_action_uk UNIQUE (function, action)
);

CREATE TABLE IF NOT EXISTS quoteownr.pf_rolepermissions (
    rolepermissionid BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    rolecode         VARCHAR(50)  NOT NULL REFERENCES quoteownr.md_roles (code),
    permissioncode   VARCHAR(80)  NOT NULL REFERENCES quoteownr.md_permissions (code),
    cby              VARCHAR(100) NOT NULL,
    cdate            TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ctz              VARCHAR(5),
    ctzstd           VARCHAR(50),
    mby              VARCHAR(100),
    mdate            TIMESTAMPTZ,
    mtz              VARCHAR(5),
    mtzstd           VARCHAR(50),
    CONSTRAINT pf_rolepermissions_uk UNIQUE (rolecode, permissioncode)
);

CREATE TABLE IF NOT EXISTS quoteownr.md_menus (
    code           VARCHAR(80)  NOT NULL PRIMARY KEY,
    name           VARCHAR(150) NOT NULL,
    parentmenucode VARCHAR(80)  REFERENCES quoteownr.md_menus (code),
    displayorder   INTEGER      NOT NULL DEFAULT 0,
    routepath      VARCHAR(300),
    status         BOOLEAN      NOT NULL DEFAULT TRUE,
    rowversion     INTEGER      NOT NULL DEFAULT 1,
    cby            VARCHAR(100) NOT NULL,
    cdate          TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ctz            VARCHAR(5),
    ctzstd         VARCHAR(50),
    mby            VARCHAR(100),
    mdate          TIMESTAMPTZ,
    mtz            VARCHAR(5),
    mtzstd         VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS quoteownr.pf_menupermissions (
    menupermissionsid BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    menucode          VARCHAR(80)  NOT NULL REFERENCES quoteownr.md_menus (code),
    permissioncode    VARCHAR(80)  NOT NULL REFERENCES quoteownr.md_permissions (code),
    cby               VARCHAR(100) NOT NULL,
    cdate             TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ctz               VARCHAR(5),
    ctzstd            VARCHAR(50),
    mby               VARCHAR(100),
    mdate             TIMESTAMPTZ,
    mtz               VARCHAR(5),
    mtzstd            VARCHAR(50),
    CONSTRAINT pf_menupermissions_uk UNIQUE (menucode, permissioncode)
);

CREATE TABLE IF NOT EXISTS quoteownr.pf_apipermissions (
    apipermissionid BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    httpmethod      VARCHAR(10)  NOT NULL,
    endpointpattern VARCHAR(255) NOT NULL,
    permissioncode  VARCHAR(80)  NOT NULL REFERENCES quoteownr.md_permissions (code),
    status          BOOLEAN      NOT NULL DEFAULT TRUE,
    cby             VARCHAR(100) NOT NULL,
    cdate           TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ctz             VARCHAR(5),
    ctzstd          VARCHAR(50),
    mby             VARCHAR(100),
    mdate           TIMESTAMPTZ,
    mtz             VARCHAR(5),
    mtzstd          VARCHAR(50),
    CONSTRAINT pf_apipermissions_uk UNIQUE (httpmethod, endpointpattern, permissioncode)
);
