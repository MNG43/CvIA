package com.smarthr.job.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobOfferResponse {

    private Long id;
    private String title;
    private String description;
    private List<String> requiredSkills;
    private String experienceLevel;
    private String salaryRange;
    private String contractType;
    private String location;
    private LocalDateTime createdAt;
    private Long createdBy;
}
