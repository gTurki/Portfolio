package com.example.portfolio.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "skills")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Skill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    /** Free-form grouping such as "Backend", "Database", "Tools". */
    @Column(nullable = false, length = 50)
    private String category;

    /** Optional Arabic display name; falls back to {@link #name} (most tech names stay in English). */
    @Column(name = "name_ar", length = 100)
    private String nameAr;

    /** Optional Arabic category label; falls back to {@link #category}. */
    @Column(name = "category_ar", length = 80)
    private String categoryAr;

    /** 0 - 100 */
    @Column(name = "proficiency_level", nullable = false)
    private Integer proficiencyLevel;
}
