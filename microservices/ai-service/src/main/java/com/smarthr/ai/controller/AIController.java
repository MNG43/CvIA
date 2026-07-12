package com.smarthr.ai.controller;

import com.smarthr.ai.service.EmbeddingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@Tag(name = "AI Service", description = "API pour l'analyse IA et le matching CV")
public class AIController {

    private static final Logger logger = LoggerFactory.getLogger(AIController.class);

    @Autowired
    private EmbeddingService embeddingService;

    @PostMapping("/analyze")
    @Operation(summary = "Analyser un CV par rapport à une offre d'emploi", description = "Génère une analyse IA du CV par rapport à l'offre")
    public ResponseEntity<Map<String, Object>> analyzeCV(
            @RequestBody Map<String, String> request) {
        try {
            String cvText = request.get("cvText");
            String jobDescription = request.get("jobDescription");
            String jobTitle = request.get("jobTitle");

            if (cvText == null || jobDescription == null || jobTitle == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "cvText, jobDescription et jobTitle sont requis"
                ));
            }

            String summary = embeddingService.generateSummary(cvText, jobDescription, jobTitle);
            String strengths = embeddingService.extractStrengths(summary);
            String weaknesses = embeddingService.extractWeaknesses(summary);

            Map<String, Object> response = new HashMap<>();
            response.put("summary", summary);
            response.put("strengths", strengths);
            response.put("weaknesses", weaknesses);
            response.put("success", true);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Erreur lors de l'analyse du CV", e);
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Erreur lors de l'analyse: " + e.getMessage(),
                "success", false
            ));
        }
    }

    @PostMapping("/embedding")
    @Operation(summary = "Générer un embedding", description = "Génère un vecteur d'embedding pour un texte")
    public ResponseEntity<Map<String, Object>> generateEmbedding(
            @RequestBody Map<String, String> request) {
        try {
            String text = request.get("text");
            if (text == null || text.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Le champ 'text' est requis"
                ));
            }

            float[] embedding = embeddingService.generateEmbedding(text);
            
            Map<String, Object> response = new HashMap<>();
            response.put("embedding", embedding);
            response.put("dimension", embedding.length);
            response.put("success", true);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Erreur lors de la génération de l'embedding", e);
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Erreur lors de la génération: " + e.getMessage(),
                "success", false
            ));
        }
    }

    @PostMapping("/similarity")
    @Operation(summary = "Calculer la similarité", description = "Calcule la similarité cosine entre deux vecteurs")
    public ResponseEntity<Map<String, Object>> calculateSimilarity(
            @RequestBody Map<String, float[]> request) {
        try {
            float[] vectorA = request.get("vectorA");
            float[] vectorB = request.get("vectorB");

            if (vectorA == null || vectorB == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "vectorA et vectorB sont requis"
                ));
            }

            double similarity = embeddingService.calculateCosineSimilarity(vectorA, vectorB);
            
            Map<String, Object> response = new HashMap<>();
            response.put("similarity", similarity);
            response.put("success", true);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Erreur lors du calcul de similarité", e);
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Erreur lors du calcul: " + e.getMessage(),
                "success", false
            ));
        }
    }

    @GetMapping("/health")
    @Operation(summary = "Vérifier la santé du service", description = "Retourne le statut du service AI")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "AI Service");
        response.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }
}
