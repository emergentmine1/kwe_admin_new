package com.kwe.quote.security;

import java.util.List;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

/**
 * Runs after the token signature, issuer, audience and expiry are validated. Permissions come from the
 * RBAC tables on every request, so a role change or deactivation applies immediately. A user without
 * any permission is authenticated but has no authority, so every protected API gives 403.
 */
@Component
public class DbRoleJwtConverter implements Converter<Jwt, AbstractAuthenticationToken> {

    private final AccessService accessService;
    private final AuthProperties authProperties;

    public DbRoleJwtConverter(AccessService accessService, AuthProperties authProperties) {
        this.accessService = accessService;
        this.authProperties = authProperties;
    }

    @Override
    public AbstractAuthenticationToken convert(Jwt jwt) {
        String email = AccessService.normalise(emailOf(jwt));
        var access = accessService.resolve(email);
        List<GrantedAuthority> authorities = access
                .map(a -> a.permissions().stream()
                        .<GrantedAuthority>map(p -> new SimpleGrantedAuthority(UserAccess.AUTHORITY_PREFIX + p))
                        .toList())
                .orElse(List.of());
        JwtAuthenticationToken token = new JwtAuthenticationToken(jwt, authorities, email == null ? jwt.getSubject() : email);
        access.ifPresent(token::setDetails);
        return token;
    }

    private String emailOf(Jwt jwt) {
        for (String claim : authProperties.emailClaims()) {
            String value = jwt.getClaimAsString(claim.trim());
            if (value != null && value.contains("@")) {
                return value;
            }
        }
        return null;
    }
}
