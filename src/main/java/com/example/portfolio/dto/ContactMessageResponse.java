package com.example.portfolio.dto;

import com.example.portfolio.entity.ContactMessage;

import java.time.LocalDateTime;

public record ContactMessageResponse(Long id, String status, String detail, LocalDateTime sentAt) {

    public static ContactMessageResponse from(ContactMessage m) {
        return new ContactMessageResponse(m.getId(), "received",
                "Thanks for reaching out! I'll get back to you soon.", m.getSentAt());
    }
}
