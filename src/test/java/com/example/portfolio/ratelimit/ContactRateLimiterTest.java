package com.example.portfolio.ratelimit;

import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZoneOffset;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ContactRateLimiterTest {

    /** A clock the test can move forward. */
    static final class MutableClock extends Clock {
        private Instant now = Instant.parse("2026-11-03T12:00:00Z");

        void advance(Duration d) { now = now.plus(d); }

        @Override public ZoneId getZone() { return ZoneOffset.UTC; }
        @Override public Clock withZone(ZoneId zone) { return this; }
        @Override public Instant instant() { return now; }
    }

    private final MutableClock clock = new MutableClock();
    private final ContactRateLimiter limiter = new ContactRateLimiter(3, Duration.ofMinutes(10), clock);

    @Test
    void allowsUpToLimitThenBlocks() {
        assertTrue(limiter.tryAcquire("1.1.1.1").isEmpty());
        assertTrue(limiter.tryAcquire("1.1.1.1").isEmpty());
        assertTrue(limiter.tryAcquire("1.1.1.1").isEmpty());
        assertTrue(limiter.tryAcquire("1.1.1.1").isPresent());
    }

    @Test
    void limitsEachClientSeparately() {
        for (int i = 0; i < 3; i++) limiter.tryAcquire("1.1.1.1");
        assertTrue(limiter.tryAcquire("1.1.1.1").isPresent());
        assertTrue(limiter.tryAcquire("2.2.2.2").isEmpty());
    }

    @Test
    void reportsWaitUntilOldestAttemptLeavesWindow() {
        limiter.tryAcquire("ip");
        clock.advance(Duration.ofMinutes(4));
        limiter.tryAcquire("ip");
        limiter.tryAcquire("ip");

        assertEquals(Duration.ofMinutes(6), limiter.tryAcquire("ip").orElseThrow());
    }

    @Test
    void allowsAgainOnceWindowSlides() {
        limiter.tryAcquire("ip");
        clock.advance(Duration.ofMinutes(5));
        limiter.tryAcquire("ip");
        limiter.tryAcquire("ip");
        assertTrue(limiter.tryAcquire("ip").isPresent());

        clock.advance(Duration.ofMinutes(5)); // first attempt is now exactly 10 min old
        assertTrue(limiter.tryAcquire("ip").isEmpty());
        assertTrue(limiter.tryAcquire("ip").isPresent());
    }

    @Test
    void blockedAttemptsDoNotExtendTheWait() {
        for (int i = 0; i < 3; i++) limiter.tryAcquire("ip");
        for (int i = 0; i < 10; i++) limiter.tryAcquire("ip"); // hammering while blocked

        clock.advance(Duration.ofMinutes(10));
        assertTrue(limiter.tryAcquire("ip").isEmpty());
    }
}
