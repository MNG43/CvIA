package com.smarthr.ai.kafka;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smarthr.ai.event.CVAnalyzedEvent;
import com.smarthr.ai.event.CVUploadedEvent;
import com.smarthr.ai.service.EmbeddingService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class CVConsumer {

    private static final Logger logger = LoggerFactory.getLogger(CVConsumer.class);

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private EmbeddingService embeddingService;

    @Autowired
    private KafkaTemplate<String, String> kafkaTemplate;

    @KafkaListener(topics = "cv-uploaded", groupId = "ai-group")
    public void handleCVUploaded(String message) {
        try {
            logger.info("=== Service IA : Réception d'un CV ===");
            
            CVUploadedEvent event = objectMapper.readValue(message, CVUploadedEvent.class);
            
            logger.info("Candidat ID: {}, Offre ID: {}", event.getCandidateId(), event.getJobId());

            if (event.getCvText() == null || event.getCvText().isEmpty()) {
                logger.error("Le texte du CV est vide pour le candidat {}", event.getCandidateId());
                return;
            }

            String jobDescription = event.getJobDescription();
            if (jobDescription == null || jobDescription.isEmpty()) {
                jobDescription = "Description du poste non disponible";
                logger.warn("Aucune description de poste fournie");
            }

            float[] cvEmbedding = embeddingService.generateEmbedding(event.getCvText());
            float[] jobEmbedding = embeddingService.generateEmbedding(jobDescription);

            double similarityScore = embeddingService.calculateCosineSimilarity(cvEmbedding, jobEmbedding);
            double matchingScore = Math.round(similarityScore * 1000.0) / 10.0;

            logger.info("Score de matching : {}%", matchingScore);

            String jobTitle = event.getJobTitle() != null ? event.getJobTitle() : "Offre " + event.getJobId();
            String summary = embeddingService.generateSummary(
                event.getCvText(),
                jobDescription,
                jobTitle
            );

            String strengths = embeddingService.extractStrengths(summary);
            String weaknesses = embeddingService.extractWeaknesses(summary);

            embeddingService.saveEmbedding(
                event.getCandidateId(), 
                event.getJobId(), 
                cvEmbedding,  
                matchingScore
            );

            CVAnalyzedEvent analyzedEvent = new CVAnalyzedEvent(
                event.getCandidateId(),
                event.getJobId(),
                matchingScore,
                summary,
                strengths,
                weaknesses
            );

            String analyzedMessage = objectMapper.writeValueAsString(analyzedEvent);
            kafkaTemplate.send("cv-analyzed", analyzedMessage);

            logger.info("Analyse terminée pour le candidat {} (Score: {}%)", 
                event.getCandidateId(), matchingScore);

        } catch (Exception e) {
            logger.error("Erreur lors du traitement du CV", e);
        }
    }
}
