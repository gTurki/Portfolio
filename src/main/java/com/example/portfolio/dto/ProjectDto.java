package com.example.portfolio.dto;

import com.example.portfolio.entity.Project;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

public record ProjectDto(
        Long id,
        String title,
        String description,
        List<String> techStack,
        String sourceCodeUrl,
        String liveDemoUrl,
        String imageUrl,
        boolean featured,
        LocalDateTime createdAt
) {
    public static ProjectDto from(Project p) {
        return new ProjectDto(
                p.getId(),
                p.getTitle(),
                p.getDescription(),
                splitTechStack(p.getTechStack()),
                p.getSourceCodeUrl(),
                p.getLiveDemoUrl(),
                p.getImageUrl(),
                p.isFeatured(),
                p.getCreatedAt()
        );
    }

    private static List<String> splitTechStack(String raw) {
        if (raw == null || raw.isBlank()) {
            return List.of();
        }
        return Arrays.stream(raw.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
    }
}
