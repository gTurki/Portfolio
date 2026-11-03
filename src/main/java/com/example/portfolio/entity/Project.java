package com.example.portfolio.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "projects")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    /** Comma-separated list, e.g. "Java, Spring Boot, MySQL". Exposed as a list in the DTO. */
    @Column(name = "tech_stack", length = 500)
    private String techStack;

    @Column(name = "source_code_url", length = 500)
    private String sourceCodeUrl;

    @Column(name = "live_demo_url", length = 500)
    private String liveDemoUrl;

    /** Optional cover image, e.g. "files/projects/rifd.png" (relative to static/) or an absolute URL. */
    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(nullable = false)
    @Builder.Default
    private boolean featured = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
