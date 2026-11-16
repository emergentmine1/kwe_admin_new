package com.kwe.quote.security;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter.ReferrerPolicy;

/**
 * Stateless bearer-token API. Public quote-form endpoints stay open; every other /api endpoint needs a
 * validated token AND a permission granted by a matching quoteownr.pf_apipermissions row.
 * 401 = no/invalid token, 403 = no permission. CSRF is off because no cookie carries the credential.
 * Paths are relative to the servlet context path (SERVER_CONTEXT_PATH).
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@EnableConfigurationProperties(AuthProperties.class)
public class SecurityConfig {

    /** JSON API: nothing may execute, embed or be framed. */
    static final String API_CSP = "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'";

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, DbRoleJwtConverter converter,
            ProblemAuthHandlers handlers, ApiPermissionAuthorizationManager apiPermissions) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(Customizer.withDefaults())
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .headers(h -> h
                        .contentSecurityPolicy(csp -> csp.policyDirectives(API_CSP))
                        .referrerPolicy(r -> r.policy(ReferrerPolicy.NO_REFERRER))
                        .permissionsPolicyHeader(p -> p.policy("camera=(), microphone=(), geolocation=(), payment=()"))
                        .httpStrictTransportSecurity(hsts -> hsts.includeSubDomains(true).maxAgeInSeconds(63_072_000)))
                .exceptionHandling(e -> e.authenticationEntryPoint(handlers).accessDeniedHandler(handlers))
                .authorizeHttpRequests(a -> a
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        // Public quote form
                        .requestMatchers(HttpMethod.GET, "/api/v1/masterdata/**", "/api/v1/profiledata/**",
                                "/ping").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/quote-requests").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/auth/static-login").permitAll()
                        .requestMatchers("/actuator/health", "/actuator/info").permitAll()
                        // Admin
                        .requestMatchers(HttpMethod.GET, "/api/v1/auth/me", "/api/v1/admin/me").authenticated()
                        .requestMatchers("/api/**").access(apiPermissions)
                        .anyRequest().denyAll())
                .oauth2ResourceServer(o -> o
                        .jwt(j -> j.jwtAuthenticationConverter(converter))
                        .authenticationEntryPoint(handlers)
                        .accessDeniedHandler(handlers));
        return http.build();
    }
}
