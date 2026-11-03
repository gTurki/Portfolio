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

    /** 0 - 100 */
    @Column(name = "proficiency_level", nullable = false)
    private Integer proficiencyLevel;
}
