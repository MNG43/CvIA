package com.smarthr.candidate.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;
import java.util.Map;

@FeignClient(name = "ai-service", url = "${ai.service.url:http://ai-service:8084}")
public interface AIServiceClient {

    @PostMapping("/api/ai/analyze")
    Map<String, Object> analyzeCV(@RequestBody Map<String, String> request);

    @PostMapping("/api/ai/embedding")
    Map<String, Object> generateEmbedding(@RequestBody Map<String, String> request);

    @PostMapping("/api/ai/similarity")
    Map<String, Object> calculateSimilarity(@RequestBody Map<String, List<Double>> request);
}
