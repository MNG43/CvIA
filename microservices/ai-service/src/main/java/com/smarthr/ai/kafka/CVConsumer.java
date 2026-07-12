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

import java.util.Arrays;

@Service
public class CVConsumer {

    private static final Logger logger = LoggerFactory.getLogger(CVConsumer.class);

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private EmbeddingService embeddingService;

    @Autowired
    private KafkaTemplate<String, String> kafkaTemplate;

    @KafkaListener(topics = "cv.uploaded", groupId = "ai-group")
    public void handleCVUploaded(String message) {
        try {
            logger.info("Message reçu sur le topic cv.uploaded : {}", message);
            
            CVUploadedEvent event = objectMapper.readValue(message, CVUploadedEvent.class);
            logger.info("Traitement du CV pour candidateId={}, jobId={}", event.getCandidateId(), event.getJobId());

            // Générer les embeddings pour le CV et l'offre
            float[] cvEmbedding = embeddingService.generateEmbedding(event.getCvText());
            float[] jobEmbedding = embeddingService.generateEmbedding(event.getJobDescription());

            // Calculer le score de similarité (matching)
            double similarityScore = embeddingService.calculateCosineSimilarity(cvEmbedding, jobEmbedding);
            double matchingScore = similarityScore * 100; // Convertir en pourcentage

            logger.info("Score de matching calculé : {}%", matchingScore);

            // Générer le résumé IA
            String summary = embeddingService.generateSummary(
                event.getCvText(),
                event.getJobDescription(),
                event.getJobTitle()
            );

            // Extraire les points forts et faibles
            String strengths = embeddingService.extractStrengths(summary);
            String weaknesses = embeddingService.extractWeaknesses(summary);

            // Sauvegarder l'embedding dans la base vectorielle
            String vectorString = Arrays.toString(cvEmbedding);
            embeddingService.saveEmbedding(event.getCandidateId(), event.getJobId(), vectorString, matchingScore);

            // Créer et publier l'événement cv.analyzed
            CVAnalyzedEvent analyzedEvent = new CVAnalyzedEvent(
                event.getCandidateId(),
                event.getJobId(),
                matchingScore,
                summary,
                strengths,
                weaknesses
            );

            String analyzedMessage = objectMapper.writeValueAsString(analyzedEvent);
            kafkaTemplate.send("cv.analyzed", analyzedMessage);

            logger.info("Événement cv.analyzed envoyé pour candidateId={}, jobId={}, score={}%", 
                event.getCandidateId(), event.getJobId(), matchingScore);

        } catch (Exception e) {
            logger.error("Erreur lors du traitement du message cv.uploaded", e);
        }
    }
}
