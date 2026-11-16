package com.kwe.quote.security;

import java.util.List;
import java.util.Set;
import java.util.UUID;

/** Effective access of an active user, resolved from the RBAC tables on every request. */
public record UserAccess(UUID accountId, String email, String name, Set<String> permissions, List<MenuEntry> menus) {

    /** Authority prefix, so permission codes never collide with Spring's ROLE_ / SCOPE_ authorities. */
    public static final String AUTHORITY_PREFIX = "PERM_";

    public record MenuEntry(String code, String name, String parentCode, String routePath, int displayOrder) {
    }
}
