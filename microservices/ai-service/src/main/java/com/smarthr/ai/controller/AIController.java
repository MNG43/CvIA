package com.smarthr.ai.controller;

import com.smarthr.ai.service.EmbeddingService;
import com.smarthr.ai.service.OllamaEmbeddingService;
import com.smarthr.ai.service.PDFParserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@Tag(name = "AI Service", description = "API pour l'analyse IA et le matching CV")
public class AIController {

    private static final Logger logger = LoggerFactory.getLogger(AIController.class);

    @Autowired
    private EmbeddingService embeddingService;

    @Autowired
    private PDFParserService pdfParserService;

    @Autowired
    private OllamaEmbeddingService ollamaEmbeddingService;

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

    @PostMapping(value = "/analyze-cvs", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Analyser des CVs PDF", description = "Extrait le texte des PDFs et génère une analyse IA")
    public ResponseEntity<Map<String, Object>> analyzeCVs(
            @RequestParam("cv1") MultipartFile cv1,
            @RequestParam(value = "cv2", required = false) MultipartFile cv2,
            @RequestParam(value = "jobDescription", required = false) String jobDescription) {
        try {
            List<MultipartFile> files = new ArrayList<>();
            files.add(cv1);
            if (cv2 != null && !cv2.isEmpty()) {
                files.add(cv2);
            }

            String jobDesc = jobDescription != null ? jobDescription : "Poste non spécifié";
            String jobTitle = "Candidat";
            List<Map<String, Object>> analyses = new ArrayList<>();

            for (MultipartFile file : files) {
                if (file == null || file.isEmpty()) {
                    continue;
                }

                String cvText = pdfParserService.cleanText(
                        pdfParserService.extractTextFromPDF(file.getInputStream()));

                String summary = embeddingService.generateSummary(cvText, jobDesc, jobTitle);
                float[] cvEmbedding = embeddingService.generateEmbedding(cvText);
                float[] jobEmbedding = embeddingService.generateEmbedding(jobDesc);
                double similarity = embeddingService.calculateCosineSimilarity(cvEmbedding, jobEmbedding);
                int score = (int) Math.round(similarity * 100);

                Map<String, Object> analysis = new HashMap<>();
                analysis.put("fileName", file.getOriginalFilename());
                analysis.put("summary", summary);
                analysis.put("score", score);
                analysis.put("skills", embeddingService.extractStrengths(summary));
                analysis.put("experience", embeddingService.extractWeaknesses(summary));
                analyses.add(analysis);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("analyses", analyses);
            response.put("success", true);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Erreur lors de l'analyse des CVs", e);
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
    @Operation(summary = "Vérifier la santé du service", description = "Retourne le statut du service AI et d'Ollama")
    public ResponseEntity<Map<String, Object>> health() {
        boolean ollamaUp = ollamaEmbeddingService.isAvailable();

        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "AI Service");
        response.put("ollama", ollamaUp ? "UP" : "DOWN");
        response.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/embeddings/batch")
    @Operation(summary = "Générer plusieurs embeddings", description = "Génère des vecteurs d'embedding pour plusieurs textes en une seule requête")
    public ResponseEntity<Map<String, Object>> generateEmbeddingsBatch(
            @RequestBody Map<String, List<String>> request) {
        try {
            List<String> texts = request.get("texts");
            if (texts == null || texts.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Le champ 'texts' est requis et ne doit pas être vide"
                ));
            }

            List<float[]> embeddings = new ArrayList<>();
            for (String text : texts) {
                float[] emb = embeddingService.generateEmbedding(text);
                embeddings.add(emb);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("embeddings", embeddings);
            response.put("count", embeddings.size());
            response.put("dimension", embeddings.isEmpty() ? 0 : embeddings.get(0).length);
            response.put("success", true);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Erreur lors de la génération des embeddings batch", e);
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Erreur lors de la génération: " + e.getMessage(),
                "success", false
            ));
        }
    }
}
