package com.smarthr.ai.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CVAnalyzedEvent {
    private Long candidateId;
    private Long jobId;
    private Double matchingScore;
    private String summary;
    private String strengths;
    private String weaknesses;
}
