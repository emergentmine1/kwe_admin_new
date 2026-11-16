package com.kwe.quote.security;

import java.util.ArrayDeque;
import java.util.Comparator;
import java.util.Deque;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.TreeSet;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;

import com.kwe.quote.repository.AccessRepository;
import com.kwe.quote.repository.AccessRepository.MenuRow;

/**
 * Resolves a verified email to its effective permissions and visible menus. Fails closed: unknown or
 * inactive user, no permission, or a database error all give empty, and empty never grants access.
 */
@Service
public class AccessService {

    private static final Logger log = LoggerFactory.getLogger(AccessService.class);

    private final AccessRepository repository;

    public AccessService(AccessRepository repository) {
        this.repository = repository;
    }

    public static String normalise(String email) {
        if (email == null) {
            return null;
        }
        String trimmed = email.trim().toLowerCase(Locale.ROOT);
        return trimmed.isEmpty() ? null : trimmed;
    }

    public Optional<UserAccess> resolve(String rawEmail) {
        String email = normalise(rawEmail);
        if (email == null) {
            return Optional.empty();
        }
        try {
            return repository.findActiveUser(email).flatMap(user -> {
                Set<String> permissions = new TreeSet<>(repository.findPermissionCodes(user.accountId()));
                if (permissions.isEmpty()) {
                    return Optional.empty();
                }
                return Optional.of(new UserAccess(user.accountId(), email, user.name(), Set.copyOf(permissions),
                        visibleMenus(permissions)));
            });
        } catch (DataAccessException e) {
            log.error("Access lookup failed; denying access", e);
            return Optional.empty();
        }
    }

    /** Menus mapped to any held permission, plus their active parents so submenus stay reachable. */
    private List<UserAccess.MenuEntry> visibleMenus(Set<String> permissions) {
        Map<String, MenuRow> active = repository.findActiveMenus().stream()
                .collect(Collectors.toMap(MenuRow::code, m -> m));
        Map<String, Set<String>> menuPermissions = new HashMap<>();
        repository.findMenuPermissions().forEach(mp ->
                menuPermissions.computeIfAbsent(mp.menuCode(), k -> new LinkedHashSet<>()).add(mp.permissionCode()));

        Set<String> visible = new LinkedHashSet<>();
        Deque<String> pending = new ArrayDeque<>();
        menuPermissions.forEach((menu, codes) -> {
            if (active.containsKey(menu) && codes.stream().anyMatch(permissions::contains)) {
                pending.push(menu);
            }
        });
        while (!pending.isEmpty()) {
            MenuRow menu = active.get(pending.pop());
            if (menu != null && visible.add(menu.code()) && menu.parentCode() != null) {
                pending.push(menu.parentCode());
            }
        }
        return visible.stream()
                .map(active::get)
                .sorted(Comparator.comparingInt(MenuRow::displayOrder).thenComparing(MenuRow::name))
                .map(m -> new UserAccess.MenuEntry(m.code(), m.name(), m.parentCode(), m.routePath(), m.displayOrder()))
                .toList();
    }
}
