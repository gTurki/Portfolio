package com.example.portfolio.notification;

import com.example.portfolio.entity.ContactMessage;

import java.time.LocalDateTime;

/** Published after a contact message is saved; handled once the transaction commits. */
public record ContactMessageReceivedEvent(
        Long id,
        String senderName,
        String senderEmail,
        String subject,
        String message,
        LocalDateTime sentAt
) {
    public static ContactMessageReceivedEvent from(ContactMessage m) {
        return new ContactMessageReceivedEvent(m.getId(), m.getSenderName(), m.getSenderEmail(),
                m.getSubject(), m.getMessage(), m.getSentAt());
    }
}
