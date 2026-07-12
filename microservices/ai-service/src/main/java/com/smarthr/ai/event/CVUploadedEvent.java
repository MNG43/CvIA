package com.smarthr.ai.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CVUploadedEvent {
    private Long candidateId;
    private Long jobId;
    private String cvText;
    private String jobDescription;
    private String jobTitle;
}
