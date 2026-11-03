package com.example.portfolio.ratelimit;

import jakarta.servlet.http.HttpServletRequest;

/**
 * Works out the visitor's IP for rate limiting.
 * <p>
 * On Railway the edge proxy sets {@code X-Real-IP} to the connecting client's address. We prefer it
 * over {@code X-Forwarded-For}, whose left-most entry (what {@code getRemoteAddr()} returns with
 * forward-headers-strategy=framework) can be supplied by the client and is therefore spoofable.
 * Locally there is no proxy, so the socket address is used.
 */
public final class ClientIpResolver {

    private ClientIpResolver() {
    }

    public static String resolve(HttpServletRequest request) {
        String realIp = request.getHeader("X-Real-IP");
        if (realIp != null && !realIp.isBlank()) {
            return realIp.trim();
        }
        return request.getRemoteAddr();
    }
}
