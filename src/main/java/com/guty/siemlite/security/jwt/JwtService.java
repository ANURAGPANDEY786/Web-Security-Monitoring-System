package com.guty.siemlite.security.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.function.Function;
import com.guty.siemlite.security.model.User;
import com.guty.siemlite.security.repository.UserRepository;

@Service
public class JwtService {

    private final UserRepository userRepository;

public JwtService(UserRepository userRepository) {
    this.userRepository = userRepository;
}

    // Development only - we'll externalize this later
    private static final String SECRET_KEY =
            "mySuperSecretJwtKeyForSiemLiteApplication2026SecureKey12345";

    private static final long JWT_EXPIRATION = 1000 * 60 * 60 * 24; // 24 hours

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(SECRET_KEY.getBytes(StandardCharsets.UTF_8));
    }

   public String generateToken(UserDetails userDetails) {

    User user = userRepository.findByUsername(userDetails.getUsername())
            .orElseThrow(() -> new RuntimeException("User not found"));

    return Jwts.builder()
            .subject(userDetails.getUsername())
            .claim("tokenVersion", user.getTokenVersion())
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + JWT_EXPIRATION))
            .signWith(getSigningKey())
            .compact();
}
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public <T> T extractClaim(String token, Function<Claims, T> resolver) {
        Claims claims = Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return resolver.apply(claims);
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {

    if (!extractUsername(token).equals(userDetails.getUsername())) {
        return false;
    }

    if (isTokenExpired(token)) {
        return false;
    }

    User user = userRepository.findByUsername(userDetails.getUsername())
            .orElseThrow(() -> new RuntimeException("User not found"));

    Integer tokenVersion = extractClaim(
            token,
            claims -> claims.get("tokenVersion", Integer.class)
    );

    return tokenVersion != null
            && tokenVersion.equals(user.getTokenVersion());
}

    private boolean isTokenExpired(String token) {
        return extractClaim(token, Claims::getExpiration)
                .before(new Date());
    }
}
