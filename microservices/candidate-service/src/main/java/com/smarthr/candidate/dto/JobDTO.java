// Fichier: dto/JobDTO.java
package com.smarthr.candidate.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JobDTO {
    private Long id;
    private String title;
    private String description;
    private String requiredSkills;
    private String experienceLevel;
    private String salaryRange;
    private String contractType;
    private String location;
}