package com.example.portfolio.ratelimit;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Sliding-window limit on contact messages per client (by IP): at most {@code maxRequests}
 * within {@code window}. In memory, so it resets on restart, which is fine for a single instance.
 */
@Component
public class ContactRateLimiter {

    private final int maxRequests;
    private final Duration window;
    private final Clock clock;
    private final Map<String, Deque<Instant>> hits = new ConcurrentHashMap<>();
    private final AtomicInteger callsSinceCleanup = new AtomicInteger();

    @Autowired
    public ContactRateLimiter(@Value("${app.contact.rate-limit.max-requests:3}") int maxRequests,
                              @Value("${app.contact.rate-limit.window:10m}") Duration window) {
        this(maxRequests, window, Clock.systemUTC());
    }

    ContactRateLimiter(int maxRequests, Duration window, Clock clock) {
        this.maxRequests = maxRequests;
        this.window = window;
        this.clock = clock;
    }

    /**
     * Records an attempt for {@code clientKey}.
     *
     * @return empty if allowed, or how long the client must wait before the next attempt is allowed
     */
    public Optional<Duration> tryAcquire(String clientKey) {
        Instant now = clock.instant();
        Instant cutoff = now.minus(window);
        Deque<Instant> deque = hits.computeIfAbsent(clientKey, k -> new ArrayDeque<>());

        Optional<Duration> result;
        synchronized (deque) {
            while (!deque.isEmpty() && !deque.peekFirst().isAfter(cutoff)) {
                deque.pollFirst();
            }
            if (deque.size() >= maxRequests) {
                Duration wait = Duration.between(now, deque.peekFirst().plus(window));
                result = Optional.of(wait.isNegative() ? Duration.ZERO : wait);
            } else {
                deque.addLast(now);
                result = Optional.empty();
            }
        }

        if (callsSinceCleanup.incrementAndGet() >= 500) {
            callsSinceCleanup.set(0);
            cleanup(cutoff);
        }
        return result;
    }

    /** Drop clients whose attempts are all outside the window, so the map can't grow forever. */
    private void cleanup(Instant cutoff) {
        hits.entrySet().removeIf(e -> {
            synchronized (e.getValue()) {
                Instant last = e.getValue().peekLast();
                return last == null || !last.isAfter(cutoff);
            }
        });
    }
}
