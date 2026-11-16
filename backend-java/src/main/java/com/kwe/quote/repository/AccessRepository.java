package com.kwe.quote.repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;

import static com.kwe.quote.jooq.tables.MdMenus.MD_MENUS;
import static com.kwe.quote.jooq.tables.MdPermissions.MD_PERMISSIONS;
import static com.kwe.quote.jooq.tables.MdRoles.MD_ROLES;
import static com.kwe.quote.jooq.tables.PfApipermissions.PF_APIPERMISSIONS;
import static com.kwe.quote.jooq.tables.PfMenupermissions.PF_MENUPERMISSIONS;
import static com.kwe.quote.jooq.tables.PfRolepermissions.PF_ROLEPERMISSIONS;
import static com.kwe.quote.jooq.tables.PfUserroles.PF_USERROLES;
import static com.kwe.quote.jooq.tables.PfUsers.PF_USERS;
import static org.jooq.impl.DSL.lower;

/** Read-only RBAC queries. All values are bound parameters (jOOQ), never concatenated into SQL. */
@Repository
public class AccessRepository {

    public record UserRow(UUID accountId, String email, String name) {
    }

    public record MenuRow(String code, String name, String parentCode, String routePath, int displayOrder) {
    }

    public record MenuPermissionRow(String menuCode, String permissionCode) {
    }

    public record ApiPermissionRow(String httpMethod, String endpointPattern, String permissionCode) {
    }

    private final DSLContext dsl;

    public AccessRepository(DSLContext dsl) {
        this.dsl = dsl;
    }

    /** Active user by email, case-insensitive (matches the LOWER(emailid) unique index). */
    public Optional<UserRow> findActiveUser(String normalisedEmail) {
        return dsl.select(PF_USERS.ACCOUNTID, PF_USERS.EMAILID, PF_USERS.NAME)
                .from(PF_USERS)
                .where(lower(PF_USERS.EMAILID).eq(normalisedEmail))
                .and(PF_USERS.STATUS.isTrue())
                .fetchOptional(r -> new UserRow(r.value1(), r.value2(), r.value3()));
    }

    /** pf_userroles → active md_roles → pf_rolepermissions → active md_permissions. */
    public Set<String> findPermissionCodes(UUID accountId) {
        return dsl.selectDistinct(MD_PERMISSIONS.CODE)
                .from(PF_USERROLES)
                .join(MD_ROLES).on(MD_ROLES.CODE.eq(PF_USERROLES.ROLECODE).and(MD_ROLES.STATUS.isTrue()))
                .join(PF_ROLEPERMISSIONS).on(PF_ROLEPERMISSIONS.ROLECODE.eq(MD_ROLES.CODE))
                .join(MD_PERMISSIONS).on(MD_PERMISSIONS.CODE.eq(PF_ROLEPERMISSIONS.PERMISSIONCODE)
                        .and(MD_PERMISSIONS.STATUS.isTrue()))
                .where(PF_USERROLES.ACCOUNTID.eq(accountId))
                .fetchSet(MD_PERMISSIONS.CODE);
    }

    public List<MenuRow> findActiveMenus() {
        return dsl.select(MD_MENUS.CODE, MD_MENUS.NAME, MD_MENUS.PARENTMENUCODE, MD_MENUS.ROUTEPATH, MD_MENUS.DISPLAYORDER)
                .from(MD_MENUS)
                .where(MD_MENUS.STATUS.isTrue())
                .fetch(r -> new MenuRow(r.value1(), r.value2(), r.value3(), r.value4(), r.value5()));
    }

    public List<MenuPermissionRow> findMenuPermissions() {
        return dsl.select(PF_MENUPERMISSIONS.MENUCODE, PF_MENUPERMISSIONS.PERMISSIONCODE)
                .from(PF_MENUPERMISSIONS)
                .fetch(r -> new MenuPermissionRow(r.value1(), r.value2()));
    }

    public List<ApiPermissionRow> findActiveApiPermissions() {
        return dsl.select(PF_APIPERMISSIONS.HTTPMETHOD, PF_APIPERMISSIONS.ENDPOINTPATTERN, PF_APIPERMISSIONS.PERMISSIONCODE)
                .from(PF_APIPERMISSIONS)
                .where(PF_APIPERMISSIONS.STATUS.isTrue())
                .fetch(r -> new ApiPermissionRow(r.value1(), r.value2(), r.value3()));
    }
}
