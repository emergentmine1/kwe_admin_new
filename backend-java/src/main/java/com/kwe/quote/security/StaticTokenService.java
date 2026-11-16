package com.kwe.quote.security;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Clock;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;

import com.nimbusds.jose.jwk.source.ImmutableSecret;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.stereotype.Service;

/**
 * TEMPORARY dummy-login token issuer, active only when KWE_AUTH_MODE=static. Checks one shared
 * password from STATIC_LOGIN_PASSWORD (nothing is stored in the database) and still requires an
 * active pf_users row with at least one permission. Remove once Okta is configured.
 */
@Service
public class StaticTokenService {

    public record IssuedToken(String accessToken, long expiresIn, String email) {
    }

    private final AuthProperties props;
    private final AccessService accessService;
    private final Clock clock;

    public StaticTokenService(AuthProperties props, AccessService accessService, Clock clock) {
        this.props = props;
        this.accessService = accessService;
        this.clock = clock;
    }

    /** Empty when the mode is not static, the password is wrong, or the user has no permission. */
    public Optional<IssuedToken> login(String rawEmail, String password) {
        if (!props.isStatic()) {
            return Optional.empty();
        }
        String expected = props.staticLogin().password();
        if (expected == null || expected.isEmpty() || password == null
                || !MessageDigest.isEqual(expected.getBytes(StandardCharsets.UTF_8),
                        password.getBytes(StandardCharsets.UTF_8))) {
            return Optional.empty();
        }
        String email = AccessService.normalise(rawEmail);
        return accessService.resolve(email).map(access -> issue(access.email()));
    }

    private IssuedToken issue(String email) {
        Instant now = Instant.now(clock);
        long ttlSeconds = Math.max(1, props.staticLogin().ttlMinutes()) * 60L;
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(JwtDecoderConfig.STATIC_ISSUER)
                .subject(email)
                .claim("email", email)
                .issuedAt(now)
                .expiresAt(now.plus(ttlSeconds, ChronoUnit.SECONDS))
                .build();
        NimbusJwtEncoder encoder = new NimbusJwtEncoder(new ImmutableSecret<>(JwtDecoderConfig.staticKey(props)));
        String token = encoder.encode(JwtEncoderParameters.from(JwsHeader.with(MacAlgorithm.HS256).build(), claims))
                .getTokenValue();
        return new IssuedToken(token, ttlSeconds, email);
    }
}
