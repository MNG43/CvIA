package com.smarthr.notification.consumer;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class NotificationConsumer {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @KafkaListener(topics = "cv-uploaded")
    public void handleCvUploaded(String message) {
        try {
            JsonNode json = objectMapper.readTree(message);
            Long candidateId = json.get("candidateId").asLong();
            log.info("[SIMULATION] Email au recruteur : Un nouveau CV (ID: {}) a été déposé et l'analyse IA va commencer.", candidateId);
            log.info("   > Destinataire: recruteur@smart-hr.com");
            log.info("   > Sujet: Nouveau candidat en attente d'analyse");
        } catch (Exception e) {
            log.error("Erreur lors du parsing du message : {}", message);
        }
    }

    @KafkaListener(topics = "cv-analyzed")
    public void handleCvAnalyzed(String message) {
        try {
            JsonNode json = objectMapper.readTree(message);
            Long candidateId = json.get("candidateId").asLong();
            double score = json.get("score").asDouble();
            
            log.info("[SIMULATION] Email au recruteur : L'analyse du candidat (ID: {}) est terminée !", candidateId);
            log.info("   > Destinataire: recruteur@smart-hr.com");
            log.info("   > Sujet: Résultat de l'analyse IA");
            log.info("   > Message: Le candidat a obtenu un score de {}%. Consultez le dashboard pour plus de détails.", score);
        } catch (Exception e) {
            log.error("Erreur lors du parsing du message : {}", message);
        }
    }

    @KafkaListener(topics = "interview-scheduled")
    public void handleInterviewScheduled(String message) {
        try {
            JsonNode json = objectMapper.readTree(message);
            Long candidateId = json.get("candidateId").asLong();
            String status = json.get("status").asText();
            
            log.info("[SIMULATION] Email au candidat : Votre statut a changé !");
            log.info("   > Destinataire: candidat_{}@email.com", candidateId);
            log.info("   > Sujet: Mise à jour de votre candidature");
            log.info("   > Message: Votre statut est passé à '{}'. Nous vous contacterons bientôt.", status);
        } catch (Exception e) {
            log.error("Erreur lors du parsing du message : {}", message);
        }
    }
}