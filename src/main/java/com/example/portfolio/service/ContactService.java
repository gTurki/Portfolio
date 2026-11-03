package com.example.portfolio.service;

import com.example.portfolio.dto.ContactMessageRequest;
import com.example.portfolio.dto.ContactMessageResponse;
import com.example.portfolio.entity.ContactMessage;
import com.example.portfolio.repository.ContactMessageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ContactService {

    private final ContactMessageRepository contactMessageRepository;

    @Transactional
    public ContactMessageResponse save(ContactMessageRequest request) {
        if (request.isLikelyBot()) {
            // Pretend success so bots don't retry, but don't store anything.
            log.warn("Dropped contact message caught by honeypot from {}", request.senderEmail());
            return new ContactMessageResponse(null, "received",
                    "Thanks for reaching out! I'll get back to you soon.", java.time.LocalDateTime.now());
        }
        ContactMessage saved = contactMessageRepository.save(ContactMessage.builder()
                .senderName(request.senderName().trim())
                .senderEmail(request.senderEmail().trim())
                .subject(request.subject() == null || request.subject().isBlank() ? null : request.subject().trim())
                .message(request.message().trim())
                .build());
        log.info("New contact message #{} from {}", saved.getId(), saved.getSenderEmail());
        return ContactMessageResponse.from(saved);
    }
}
