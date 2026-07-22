package com.smarthr.candidate.controller;

import com.smarthr.candidate.entity.Application;
import com.smarthr.candidate.entity.ApplicationStatus;
import com.smarthr.candidate.entity.PipelineCriteria;
import com.smarthr.candidate.service.PipelineService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/candidates/pipeline")
@RequiredArgsConstructor
public class PipelineController {

    private final PipelineService pipelineService;

    @PostMapping("/criteria")
    public ResponseEntity<PipelineCriteria> createCriteria(
            @RequestParam Long jobId,
            @RequestParam ApplicationStatus stage,
            @RequestParam Double minScore,
            @RequestParam String criteriaDescription,
            @RequestParam Integer priorityOrder) {
        PipelineCriteria criteria = pipelineService.createCriteria(
                jobId, stage, minScore, criteriaDescription, priorityOrder);
        return ResponseEntity.ok(criteria);
    }

    @GetMapping("/criteria/{jobId}")
    public ResponseEntity<List<PipelineCriteria>> getCriteriaByJob(@PathVariable Long jobId) {
        return ResponseEntity.ok(pipelineService.getCriteriaByJob(jobId));
    }

    @DeleteMapping("/criteria/{id}")
    public ResponseEntity<Void> deleteCriteria(@PathVariable Long id) {
        pipelineService.deleteCriteria(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/applications/{jobId}/{stage}")
    public ResponseEntity<List<Application>> getOrderedApplicationsForStage(
            @PathVariable Long jobId,
            @PathVariable ApplicationStatus stage) {
        return ResponseEntity.ok(pipelineService.getOrderedApplicationsForStage(jobId, stage));
    }

    @PostMapping("/applications/{applicationId}/advance")
    public ResponseEntity<Application> autoAdvanceToNextStage(@PathVariable Long applicationId) {
        return ResponseEntity.ok(pipelineService.autoAdvanceToNextStage(applicationId));
    }

    @GetMapping("/applications/{jobId}/above-threshold")
    public ResponseEntity<List<Application>> getApplicationsAboveThreshold(
            @PathVariable Long jobId,
            @RequestParam(defaultValue = "65.0") Double threshold) {
        return ResponseEntity.ok(pipelineService.getApplicationsAboveThreshold(jobId, threshold));
    }

    @PostMapping("/analyze-position/{jobId}")
    public ResponseEntity<List<Application>> analyzePosition(
            @PathVariable Long jobId,
            @RequestParam(defaultValue = "65.0") Double threshold) {
        // Run full AI analysis (embeddings + similarity) for applications without scores,
        // then return applications above threshold and auto-advance them to PRE_SELECTION.
        List<Application> qualifiedApplications = pipelineService.analyzePositionWithAI(jobId, threshold);

        for (Application app : qualifiedApplications) {
            if (app.getStatus() == ApplicationStatus.CV_RECUS) {
                pipelineService.autoAdvanceToNextStage(app.getId());
            }
        }

        return ResponseEntity.ok(qualifiedApplications);
    }
}
