package com.example.portfolio.service;

import com.example.portfolio.dto.ProjectDto;
import com.example.portfolio.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProjectService {

    private final ProjectRepository projectRepository;

    public List<ProjectDto> findAll() {
        return projectRepository.findAllByOrderByCreatedAtDesc().stream().map(ProjectDto::from).toList();
    }

    public List<ProjectDto> findFeatured() {
        return projectRepository.findByFeaturedTrueOrderByCreatedAtDesc().stream().map(ProjectDto::from).toList();
    }
}
