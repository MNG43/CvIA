package com.smarthr.ai.service;

import com.smarthr.ai.entity.Embedding;
import com.smarthr.ai.repository.EmbeddingRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.chat.prompt.PromptTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
public class EmbeddingService {

    private static final Logger logger = LoggerFactory.getLogger(EmbeddingService.class);

    @Autowired
    private OllamaEmbeddingService ollamaEmbeddingService;

    @Autowired(required = false)
    private ChatClient chatClient;

    @Autowired
    private EmbeddingRepository embeddingRepository;

    public float[] generateEmbedding(String text) {
        try {
            float[] embeddingArray = ollamaEmbeddingService.generateEmbedding(text);
            logger.info("Embedding généré avec succès via Ollama (dimension: {})", embeddingArray.length);
            return embeddingArray;
        } catch (Exception e) {
            logger.error("Erreur lors de la génération de l'embedding", e);
            // Fallback sur le mock si Ollama échoue
            logger.warn("Fallback sur le mock embedding");
            float[] mockEmbedding = new float[768];
            java.util.Random random = new java.util.Random(text.hashCode());
            for (int i = 0; i < 768; i++) {
                mockEmbedding[i] = random.nextFloat() * 2 - 1;
            }
            return mockEmbedding;
        }
    }

    public double calculateCosineSimilarity(float[] vectorA, float[] vectorB) {
        if (vectorA.length != vectorB.length) {
            throw new IllegalArgumentException("Les vecteurs doivent avoir la même dimension");
        }

        double dotProduct = 0.0;
        double normA = 0.0;
        double normB = 0.0;

        for (int i = 0; i < vectorA.length; i++) {
            dotProduct += vectorA[i] * vectorB[i];
            normA += Math.pow(vectorA[i], 2);
            normB += Math.pow(vectorB[i], 2);
        }

        if (normA == 0 || normB == 0) {
            return 0.0;
        }

        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    @Transactional
    public void saveEmbedding(Long candidateId, Long jobId, float[] vectorArray, double score) {
        try {
            Embedding embedding = new Embedding();
            embedding.setCandidateId(candidateId);
            embedding.setJobId(jobId);
            embedding.setScore(score);
            embedding.setVector(vectorArrayToString(vectorArray));
            embeddingRepository.save(embedding);
            logger.info("Embedding sauvegardé pour candidateId={}, jobId={}, score={}", candidateId, jobId, score);
        } catch (Exception e) {
            logger.error("Erreur lors de la sauvegarde de l'embedding", e);
            throw new RuntimeException("Impossible de sauvegarder l'embedding", e);
        }
    }

    private String vectorArrayToString(float[] vector) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < vector.length; i++) {
            sb.append(vector[i]);
            if (i < vector.length - 1) {
                sb.append(",");
            }
        }
        sb.append("]");
        return sb.toString();
    }

    public String generateSummary(String cvText, String jobDescription, String jobTitle) {
        if (chatClient == null) {
            logger.warn("ChatClient non disponible - retour d'un résumé par défaut");
            return "Service d'analyse IA non configuré. Veuillez configurer Ollama et les propriétés Spring AI.";
        }

        try {
            String template = """
                Analyse le CV suivant par rapport à l'offre d'emploi "{jobTitle}".

                Description de l'offre :
                {jobDescription}

                Contenu du CV :
                {cvText}

                Fournis une analyse structurée avec :
                1. Un résumé bref du profil
                2. Les points forts du candidat pour ce poste
                3. Les points faibles ou manques éventuels

                Sois concis et professionnel.
                """;

            PromptTemplate promptTemplate = new PromptTemplate(template);
            Prompt prompt = promptTemplate.create(Map.of(
                "jobTitle", jobTitle,
                "jobDescription", jobDescription,
                "cvText", cvText
            ));

            String response = chatClient.prompt()
                .user(prompt.getContents())
                .call()
                .content();

            logger.info("Résumé IA généré avec succès");
            return response;
        } catch (Exception e) {
            logger.error("Erreur lors de la génération du résumé IA", e);
            return "Erreur lors de l'analyse IA : " + e.getMessage();
        }
    }

    public String extractStrengths(String summary) {
        if (summary == null || summary.isEmpty()) {
            return "";
        }
        
        String[] sections = summary.split("Points forts[:\\s]*", 2);
        if (sections.length > 1) {
            String[] parts = sections[1].split("Points faibles[:\\s]*|Manques[:\\s]*", 2);
            return parts[0].trim();
        }
        return "";
    }

    public String extractWeaknesses(String summary) {
        if (summary == null || summary.isEmpty()) {
            return "";
        }
        
        String[] sections = summary.split("Points faibles[:\\s]*|Manques[:\\s]*", 2);
        if (sections.length > 1) {
            return sections[1].trim();
        }
        return "";
    }
}
