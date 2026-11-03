package com.example.portfolio.dto;

import com.example.portfolio.entity.Skill;

public record SkillDto(Long id, String name, String category, Integer proficiencyLevel) {

    public static SkillDto from(Skill s) {
        return new SkillDto(s.getId(), s.getName(), s.getCategory(), s.getProficiencyLevel());
    }
}
