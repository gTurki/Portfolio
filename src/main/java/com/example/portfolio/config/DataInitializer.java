package com.example.portfolio.config;

import com.example.portfolio.entity.Project;
import com.example.portfolio.entity.Skill;
import com.example.portfolio.repository.ProjectRepository;
import com.example.portfolio.repository.SkillRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Seeds the portfolio with projects and skills from the CV on first run.
 * Only inserts when the tables are empty; after that, manage the data in DataGrip.
 * Disable with app.seed-sample-data=false.
 */
@Slf4j
@Component
@Order(1)
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.seed-sample-data", havingValue = "true", matchIfMissing = true)
public class DataInitializer implements CommandLineRunner {

    private static final String GITHUB = "https://github.com/gTurki/";

    private final ProjectRepository projectRepository;
    private final SkillRepository skillRepository;

    @Override
    @Transactional
    public void run(String... args) {
        if (projectRepository.count() == 0) {
            projectRepository.saveAll(List.of(
                    Project.builder()
                            .title("Atahad: AI Commitment & Accountability App")
                            .description("Commitment-contract app that uses loss aversion to build habits: users stake money on weekly "
                                    + "goals, and every missed commitment becomes a donation to Ehsan. Accountability is enforced with "
                                    + "AI-verified proofs (photo challenge, focus timer, quiz, GPS geofence, step count), an app lock "
                                    + "until owed donations are proven, and group commitments with shared penalties. "
                                    + "Built by a 4-person team (193 endpoints).")
                            .techStack("Java, Spring Boot, Spring Security, JPA/Hibernate, MySQL, Flutter/Dart, Gemini API, "
                                    + "OpenRouter API, Google Calendar API, Google Places API, n8n, WhatsApp")
                            .sourceCodeUrl(GITHUB + "Atahad")
                            .imageUrl("files/projects/atahad.png")
                            .featured(true)
                            .createdAt(LocalDateTime.of(2026, 11, 1, 0, 0))
                            .build(),
                    Project.builder()
                            .title("Rifd: AI Operations Center for Expo 2030")
                            .description("3rd place at the Expo 2030 Riyadh Hackathon as team leader of 5. An operations center that "
                                    + "unifies alerts from 7 sources into a live dashboard, consolidating a 40-alert burst into 3 "
                                    + "actionable incidents. AI classifies severity, merges duplicates and detects fire/smoke in photos; "
                                    + "playbook suggestions, nearest-staff assignment and escalation are automated. "
                                    + "Complete backend: 18 entities, 70 endpoints.")
                            .techStack("Java, Spring Boot, JPA, MySQL, Spring Security (JWT), WebSocket (STOMP), Telegram Bot API, "
                                    + "Hugging Face, Gemini API, Google Maps API, Docker, Railway")
                            .sourceCodeUrl(GITHUB + "Rifd")
                            .imageUrl("files/projects/rifd.png")
                            .liveDemoUrl("https://rifd-frontend.vercel.app")
                            .featured(true)
                            .createdAt(LocalDateTime.of(2026, 10, 1, 0, 0))
                            .build(),
                    Project.builder()
                            .title("Ejad: AI Lost & Found Platform")
                            .description("Backend with an AI matching engine that scores similarity between lost and found reports and "
                                    + "auto-notifies owners of matches above 70% via in-app, email and WhatsApp. Image-based reporting "
                                    + "lets AI extract title, color, brand and category from a photo, plus geocoded radius search. "
                                    + "8 entities, 103 endpoints; team leader.")
                            .techStack("Java, Spring Boot, Spring Data JPA, MySQL, React, OpenAI API, Gemini API, "
                                    + "Google Maps API, Gmail SMTP, WhatsApp")
                            .sourceCodeUrl(GITHUB + "Ejad")
                            .imageUrl("files/projects/ejad.png")
                            .featured(true)
                            .createdAt(LocalDateTime.of(2026, 9, 1, 0, 0))
                            .build(),
                    Project.builder()
                            .title("Personal Portfolio")
                            .description("This site: a Spring Boot REST API backed by MySQL, serving a responsive vanilla JS "
                                    + "single-page frontend with a validated contact form.")
                            .techStack("Java 21, Spring Boot, Spring Data JPA, MySQL, JavaScript")
                            .sourceCodeUrl(GITHUB + "Portfolio")
                            .featured(false)
                            .createdAt(LocalDateTime.of(2026, 11, 3, 0, 0))
                            .build()
            ));
            log.info("Seeded projects");
        }

        if (skillRepository.count() == 0) {
            // Categories are shown in insertion (id) order. Proficiency levels are estimates
            // (not shown in the current UI); adjust them in DataGrip.
            skillRepository.saveAll(List.of(
                    skill("Java", "Languages", 90),
                    skill("Python", "Languages", 65),
                    skill("C++", "Languages", 60),
                    skill("Dart", "Languages", 60),
                    skill("JavaScript", "Languages", 65),
                    skill("SQL", "Languages", 80),

                    skill("Spring Boot", "Frameworks & Libraries", 90),
                    skill("Spring Security", "Frameworks & Libraries", 85),
                    skill("Spring Data JPA", "Frameworks & Libraries", 85),
                    skill("Hibernate", "Frameworks & Libraries", 80),
                    skill("Flask", "Frameworks & Libraries", 60),
                    skill("React", "Frameworks & Libraries", 65),
                    skill("Flutter", "Frameworks & Libraries", 60),

                    skill("OpenAI API", "AI Integration", 85),
                    skill("Google Gemini", "AI Integration", 85),
                    skill("OpenRouter", "AI Integration", 75),
                    skill("Hugging Face", "AI Integration", 70),

                    skill("Google Maps API", "APIs & Automation", 80),
                    skill("Telegram Bot API", "APIs & Automation", 80),
                    skill("WhatsApp", "APIs & Automation", 75),
                    skill("Gmail SMTP / IMAP", "APIs & Automation", 80),
                    skill("n8n", "APIs & Automation", 70),

                    skill("MySQL", "Databases", 85),
                    skill("Relational Database Design", "Databases", 80),

                    skill("Docker", "DevOps & Tooling", 75),
                    skill("Railway", "DevOps & Tooling", 70),
                    skill("Git", "DevOps & Tooling", 85),
                    skill("GitHub", "DevOps & Tooling", 85),
                    skill("Postman", "DevOps & Tooling", 85),
                    skill("JUnit", "DevOps & Tooling", 70),
                    skill("IntelliJ IDEA", "DevOps & Tooling", 85),

                    skill("REST APIs", "Concepts", 90),
                    skill("JWT", "Concepts", 85),
                    skill("WebSocket (STOMP)", "Concepts", 75),
                    skill("OOP", "Concepts", 85),
                    skill("Agile / Scrum", "Concepts", 85),
                    skill("SDLC", "Concepts", 80),
                    skill("Project Management (CBP-PM)", "Concepts", 80)
            ));
            log.info("Seeded skills");
        }
    }

    private static Skill skill(String name, String category, int level) {
        return Skill.builder().name(name).category(category).proficiencyLevel(level).build();
    }
}
