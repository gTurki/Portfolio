package com.example.portfolio.controller;

import com.example.portfolio.dto.ContactMessageRequest;
import com.example.portfolio.dto.ContactMessageResponse;
import com.example.portfolio.ratelimit.ClientIpResolver;
import com.example.portfolio.ratelimit.ContactRateLimiter;
import com.example.portfolio.ratelimit.RateLimitExceededException;
import com.example.portfolio.service.ContactService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/contact")
@CrossOrigin(origins = "${app.cors.allowed-origin}")
@RequiredArgsConstructor
public class ContactController {

    private final ContactService contactService;
    private final ContactRateLimiter rateLimiter;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ContactMessageResponse submit(@Valid @RequestBody ContactMessageRequest request,
                                         HttpServletRequest httpRequest) {
        // Only valid submissions count, so a visitor fixing typos isn't penalised.
        // Honeypot (bot) submissions count too, so bots get throttled as well.
        rateLimiter.tryAcquire(ClientIpResolver.resolve(httpRequest)).ifPresent(wait -> {
            throw new RateLimitExceededException(wait);
        });
        return contactService.save(request);
    }
}
