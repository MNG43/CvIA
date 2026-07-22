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

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;

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
                .filter(app -> app.getMatchingScore() >= threshold)
                .sorted(Comparator.comparing(Application::getMatchingScore).reversed())
                .toList();
    }

    public List<Application> analyzePositionWithAI(Long jobId, Double threshold) {
        List<Application> applications = applicationRepository.findByJobId(jobId);
        
        for (Application application : applications) {
            if (application.getMatchingScore() == null || application.getMatchingScore() == 0.0) {
                try {
                    Candidate candidate = candidateRepository.findById(application.getCandidateId())
                            .orElseThrow(() -> new RuntimeException("Candidate not found"));
                    
                    String cvText = candidate.getExtractedText();
                    if (cvText == null || cvText.isEmpty()) {
                        log.warn("No CV text found for candidate {}", candidate.getId());
                        continue;
                    }
                    
                    // Get job description via JobServiceClient
                    String jobDescription = "Description non disponible";
                    String jobTitle = "Poste " + jobId;
                    try {
                        JobDTO job = jobServiceClient.getJobById(jobId);
                        if (job != null) {
                            jobTitle = job.getTitle() != null ? job.getTitle() : jobTitle;
                            jobDescription = job.getDescription() != null ? job.getDescription() : jobDescription;
                        }
                    } catch (Exception e) {
                        log.warn("Could not fetch job details: {}", e.getMessage());
                    }
                    
                    // Call AI service to analyze CV
                    Map<String, String> request = Map.of(
                            "cvText", cvText,
                            "jobDescription", jobDescription,
                            "jobTitle", jobTitle
                    );
                    
                    Map<String, Object> aiResponse = aiServiceClient.analyzeCV(request);
                    
                    // Calculate matching score using embeddings
                    Map<String, String> cvEmbedRequest = Map.of("text", cvText);
                    Map<String, Object> cvEmbedResponse = aiServiceClient.generateEmbedding(cvEmbedRequest);
                    float[] cvEmbedding = (float[]) cvEmbedResponse.get("embedding");
                    
                    Map<String, String> jobEmbedRequest = Map.of("text", jobDescription);
                    Map<String, Object> jobEmbedResponse = aiServiceClient.generateEmbedding(jobEmbedRequest);
                    float[] jobEmbedding = (float[]) jobEmbedResponse.get("embedding");
                    
                    Map<String, float[]> similarityRequest = Map.of(
                            "vectorA", cvEmbedding,
                            "vectorB", jobEmbedding
                    );
                    Map<String, Object> similarityResponse = aiServiceClient.calculateSimilarity(similarityRequest);
                    double similarity = (Double) similarityResponse.get("similarity");
                    int score = (int) Math.round(similarity * 100);
                    
                    application.setMatchingScore((double) score);
                    application = applicationRepository.save(application);
                    log.info("AI analysis completed for application {} - Score: {}", application.getId(), score);
                    
                } catch (Exception e) {
                    log.error("Error analyzing application {} with AI: {}", application.getId(), e.getMessage());
                }
            }
        }
        
        // Return applications above threshold
        return getApplicationsAboveThreshold(jobId, threshold);
    }

    public void deleteCriteria(Long id) {
        pipelineCriteriaRepository.deleteById(id);
    }
}
