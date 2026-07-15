package com.smarthr.ai.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.http.MediaType;

import java.util.List;
import java.util.Map;

@Service
public class OllamaEmbeddingService {

    private static final Logger logger = LoggerFactory.getLogger(OllamaEmbeddingService.class);
    private final RestClient restClient;
    private final String ollamaUrl;
    private final String modelName;

    public OllamaEmbeddingService(
            @Value("${ollama.base-url:http://192.168.1.167:11434}") String ollamaUrl,
            @Value("${ollama.model:nomic-embed-text}") String modelName) {
        this.ollamaUrl = ollamaUrl;
        this.modelName = modelName;
        this.restClient = RestClient.create();
    }

    public float[] generateEmbedding(String text) {
        try {
            // Tronquer le texte si trop long
            String truncatedText = text.length() > 8192 ? text.substring(0, 8192) : text;
            
            Map<String, Object> request = Map.of(
                "model", modelName,
                "prompt", truncatedText
            );

            @SuppressWarnings("unchecked")
            Map<String, Object> response = restClient.post()
                .uri(ollamaUrl + "/api/embeddings")
                .contentType(MediaType.APPLICATION_JSON)
                .body(request)
                .retrieve()
                .body(Map.class);

            if (response == null || !response.containsKey("embedding")) {
                throw new RuntimeException("Réponse Ollama invalide");
            }

            @SuppressWarnings("unchecked")
            List<Double> embeddingList = (List<Double>) response.get("embedding");
            float[] embeddingArray = new float[embeddingList.size()];
            for (int i = 0; i < embeddingList.size(); i++) {
                embeddingArray[i] = embeddingList.get(i).floatValue();
            }

            logger.info("Embedding généré avec succès via Ollama (dimension: {})", embeddingArray.length);
            return embeddingArray;
        } catch (Exception e) {
            logger.error("Erreur lors de la génération de l'embedding via Ollama", e);
            throw new RuntimeException("Impossible de générer l'embedding", e);
        }
    }
}
