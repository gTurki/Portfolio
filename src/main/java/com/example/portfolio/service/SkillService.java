package com.example.portfolio.service;

import com.example.portfolio.dto.SkillDto;
import com.example.portfolio.repository.SkillRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SkillService {

    private final SkillRepository skillRepository;

    public List<SkillDto> findAll() {
        return skillRepository.findAllByOrderByIdAsc().stream().map(SkillDto::from).toList();
    }
}
