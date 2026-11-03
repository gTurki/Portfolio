package com.example.portfolio.dto;

import com.example.portfolio.entity.Skill;

public record SkillDto(Long id, String name, String nameAr, String category, String categoryAr,
                       Integer proficiencyLevel) {

    public static SkillDto from(Skill s) {
        return new SkillDto(s.getId(), s.getName(), s.getNameAr(), s.getCategory(), s.getCategoryAr(),
                s.getProficiencyLevel());
    }
}
