package com.smarthr.candidate.repository;

import com.smarthr.candidate.entity.PipelineCriteria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PipelineCriteriaRepository extends JpaRepository<PipelineCriteria, Long> {
    List<PipelineCriteria> findByJobIdOrderByPriorityOrderAsc(Long jobId);
    Optional<PipelineCriteria> findByJobIdAndStage(Long jobId, com.smarthr.candidate.entity.ApplicationStatus stage);
}
