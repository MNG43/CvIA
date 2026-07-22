package com.smarthr.candidate.service;

import com.smarthr.candidate.client.AIServiceClient;
import com.smarthr.candidate.client.JobServiceClient;
import com.smarthr.candidate.dto.JobDTO;
import com.smarthr.candidate.entity.Application;
import com.smarthr.candidate.entity.ApplicationStatus;
import com.smarthr.candidate.entity.Candidate;
import com.smarthr.candidate.entity.PipelineCriteria;
import com.smarthr.candidate.repository.ApplicationRepository;
import com.smarthr.candidate.repository.CandidateRepository;
import com.smarthr.candidate.repository.PipelineCriteriaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PipelineService {

    private final PipelineCriteriaRepository pipelineCriteriaRepository;
    private final ApplicationRepository applicationRepository;
    private final CandidateRepository candidateRepository;
    private final AIServiceClient aiServiceClient;
    private final JobServiceClient jobServiceClient;

    public PipelineCriteria createCriteria(Long jobId, ApplicationStatus stage,
                                           Double minScore, String criteriaDescription,
                                           Integer priorityOrder) {
        PipelineCriteria criteria = new PipelineCriteria();
        criteria.setJobId(jobId);
        criteria.setStage(stage);
        criteria.setMinScore(minScore);
        criteria.setCriteriaDescription(criteriaDescription);
        criteria.setPriorityOrder(priorityOrder);
        return pipelineCriteriaRepository.save(criteria);
    }

    public List<PipelineCriteria> getCriteriaByJob(Long jobId) {
        return pipelineCriteriaRepository.findByJobIdOrderByPriorityOrderAsc(jobId);
    }

    public List<Application> getOrderedApplicationsForStage(Long jobId, ApplicationStatus stage) {
        Optional<PipelineCriteria> criteria = pipelineCriteriaRepository.findByJobIdAndStage(jobId, stage);

        List<Application> applications = applicationRepository.findByJobIdAndStatus(jobId, stage);

        if (criteria.isPresent()) {
            PipelineCriteria crit = criteria.get();
            final boolean orderByScoreDesc = crit.getPriorityOrder() != null && crit.getPriorityOrder() > 0;

            applications.sort(Comparator.comparing(Application::getMatchingScore,
                    orderByScoreDesc ? Comparator.reverseOrder() : Comparator.naturalOrder()));
        }

        return applications;
    }

    public Application autoAdvanceToNextStage(Long applicationId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        Long jobId = application.getJobId();
        ApplicationStatus currentStatus = application.getStatus();

        List<PipelineCriteria> allCriteria = pipelineCriteriaRepository.findByJobIdOrderByPriorityOrderAsc(jobId);

        for (int i = 0; i < allCriteria.size(); i++) {
            if (allCriteria.get(i).getStage() == currentStatus && i < allCriteria.size() - 1) {
                PipelineCriteria nextCriteria = allCriteria.get(i + 1);

                if (application.getMatchingScore() >= nextCriteria.getMinScore()) {
                    application.setStatus(nextCriteria.getStage());
                    Application updated = applicationRepository.save(application);
                    log.info("Application {} auto-advanced to stage {}", applicationId, nextCriteria.getStage());
                    return updated;
                }
                break;
            }
        }

        return application;
    }

    public List<Application> getApplicationsAboveThreshold(Long jobId, Double threshold) {
        List<Application> allApplications = applicationRepository.findByJobId(jobId);
        return allApplications.stream()
                .filter(app -> app.getMatchingScore() != null && app.getMatchingScore() >= threshold)
                .sorted(Comparator.comparing(Application::getMatchingScore).reversed())
                .toList();
    }

    @SuppressWarnings("unchecked")
    public List<Application> analyzePositionWithAI(Long jobId, Double threshold) {
        List<Application> applications = applicationRepository.findByJobId(jobId);
        log.info("Starting AI analysis for job {} with {} applications", jobId, applications.size());

        if (applications.isEmpty()) {
            return Collections.emptyList();
        }

        // Fetch job details once
        String jobDescription = "Description non disponible";
        String jobTitle = "Poste " + jobId;
        try {
            JobDTO job = jobServiceClient.getJobById(jobId);
            if (job != null) {
                jobTitle = job.getTitle() != null ? job.getTitle() : jobTitle;
                jobDescription = job.getDescription() != null ? job.getDescription() : jobDescription;
            }
            log.info("Job details retrieved: {}", jobTitle);
        } catch (Exception e) {
            log.warn("Could not fetch job details: {}", e.getMessage());
        }

        // Generate job embedding once (reused for all candidates)
        List<Double> jobEmbedding = null;
        try {
            Map<String, Object> jobEmbedResponse = aiServiceClient.generateEmbedding(Map.of("text", jobDescription));
            jobEmbedding = extractEmbedding(jobEmbedResponse);
            log.info("Job embedding generated (dimension: {})", jobEmbedding.size());
        } catch (Exception e) {
            log.error("Failed to generate job embedding, cannot proceed with analysis", e);
            return getApplicationsAboveThreshold(jobId, threshold);
        }

        final List<Double> finalJobEmbedding = jobEmbedding;
        final String finalJobTitle = jobTitle;
        final String finalJobDescription = jobDescription;

        // Process candidates in parallel for speed
        ExecutorService executor = Executors.newFixedThreadPool(Math.min(applications.size(), 4));
        List<CompletableFuture<Void>> futures = applications.stream()
                .map(app -> CompletableFuture.runAsync(() -> {
                    if (app.getMatchingScore() != null && app.getMatchingScore() > 0.0) {
                        return; // already scored
                    }
                    try {
                        Candidate candidate = candidateRepository.findById(app.getCandidateId())
                                .orElse(null);
                        if (candidate == null) return;

                        String cvText = candidate.getExtractedText();
                        if (cvText == null || cvText.isEmpty()) {
                            log.warn("No CV text for candidate {}", candidate.getId());
                            return;
                        }

                        // Generate CV embedding
                        Map<String, Object> cvEmbedResponse = aiServiceClient.generateEmbedding(Map.of("text", cvText));
                        List<Double> cvEmbedding = extractEmbedding(cvEmbedResponse);

                        // Compute cosine similarity locally (avoids extra HTTP round-trip)
                        double similarity = cosineSimilarity(cvEmbedding, finalJobEmbedding);
                        int score = (int) Math.round(similarity * 100);

                        synchronized (this) {
                            app.setMatchingScore((double) score);
                            applicationRepository.save(app);
                        }
                        log.info("AI analysis completed for application {} - Score: {}", app.getId(), score);

                    } catch (Exception e) {
                        log.error("Error analyzing application {} with AI: {}", app.getId(), e.getMessage());
                    }
                }, executor))
                .collect(Collectors.toList());

        CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();
        executor.shutdown();

        return getApplicationsAboveThreshold(jobId, threshold);
    }

    @SuppressWarnings("unchecked")
    private List<Double> extractEmbedding(Map<String, Object> response) {
        Object emb = response.get("embedding");
        if (emb instanceof List) {
            return (List<Double>) emb;
        }
        throw new RuntimeException("Unexpected embedding format: " + (emb == null ? "null" : emb.getClass()));
    }

    private double cosineSimilarity(List<Double> a, List<Double> b) {
        if (a.size() != b.size()) {
            throw new IllegalArgumentException("Vector dimension mismatch: " + a.size() + " vs " + b.size());
        }
        double dot = 0, normA = 0, normB = 0;
        for (int i = 0; i < a.size(); i++) {
            dot += a.get(i) * b.get(i);
            normA += Math.pow(a.get(i), 2);
            normB += Math.pow(b.get(i), 2);
        }
        if (normA == 0 || normB == 0) return 0;
        return dot / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    public void deleteCriteria(Long id) {
        pipelineCriteriaRepository.deleteById(id);
    }
}
