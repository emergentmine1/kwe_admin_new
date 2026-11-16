package com.kwe.quote.security;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.function.Supplier;

import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.http.server.PathContainer;
import org.springframework.security.authorization.AuthorizationDecision;
import org.springframework.security.authorization.AuthorizationManager;
import org.springframework.security.authorization.AuthorizationResult;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.web.access.intercept.RequestAuthorizationContext;
import org.springframework.stereotype.Component;
import org.springframework.web.util.pattern.PathPattern;
import org.springframework.web.util.pattern.PathPatternParser;

import com.kwe.quote.repository.AccessRepository;

/**
 * Endpoint authorization from quoteownr.pf_apipermissions. A request is allowed only when an active row
 * matches its method + path AND the caller holds that row's permission. No matching row = denied.
 * Rules are cached for {@link #CACHE_TTL} so table changes apply within a minute without a restart.
 */
@Component
public class ApiPermissionAuthorizationManager implements AuthorizationManager<RequestAuthorizationContext> {

    static final Duration CACHE_TTL = Duration.ofSeconds(60);
    private static final Logger log = LoggerFactory.getLogger(ApiPermissionAuthorizationManager.class);
    private static final AuthorizationDecision DENY = new AuthorizationDecision(false);
    private static final AuthorizationDecision ALLOW = new AuthorizationDecision(true);

    record Rule(String method, PathPattern pattern, String authority) {
    }

    private record Snapshot(List<Rule> rules, Instant loadedAt) {
    }

    private final AccessRepository repository;
    private final Clock clock;
    private volatile Snapshot snapshot;

    public ApiPermissionAuthorizationManager(AccessRepository repository, Clock clock) {
        this.repository = repository;
        this.clock = clock;
    }

    @Override
    public AuthorizationResult authorize(Supplier<Authentication> authentication, RequestAuthorizationContext context) {
        Authentication auth = authentication.get();
        if (auth == null || !auth.isAuthenticated()) {
            return DENY;
        }
        HttpServletRequest request = context.getRequest();
        String method = request.getMethod().toUpperCase(Locale.ROOT);
        PathContainer path = PathContainer.parsePath(request.getRequestURI().substring(request.getContextPath().length()));
        List<String> required = rules().stream()
                .filter(r -> r.method().equals(method) || "*".equals(r.method()))
                .filter(r -> r.pattern().matches(path))
                .map(Rule::authority)
                .toList();
        boolean granted = !required.isEmpty() && auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(required::contains);
        return granted ? ALLOW : DENY;
    }

    /** Spring Security 6 still requires this; it delegates to {@link #authorize}. */
    @Override
    @Deprecated(since = "6.4")
    public AuthorizationDecision check(Supplier<Authentication> authentication, RequestAuthorizationContext context) {
        return authorize(authentication, context) == ALLOW ? ALLOW : DENY;
    }

    private List<Rule> rules() {
        Snapshot current = snapshot;
        Instant now = Instant.now(clock);
        if (current != null && current.loadedAt().plus(CACHE_TTL).isAfter(now)) {
            return current.rules();
        }
        try {
            PathPatternParser parser = PathPatternParser.defaultInstance;
            List<Rule> loaded = repository.findActiveApiPermissions().stream()
                    .map(r -> new Rule(r.httpMethod().trim().toUpperCase(Locale.ROOT), parser.parse(r.endpointPattern().trim()),
                            UserAccess.AUTHORITY_PREFIX + r.permissionCode()))
                    .toList();
            snapshot = new Snapshot(loaded, now);
            return loaded;
        } catch (DataAccessException | IllegalArgumentException e) {
            log.error("Loading pf_apipermissions failed; keeping previous rules (deny if none)", e);
            return current == null ? List.of() : current.rules();
        }
    }
}
