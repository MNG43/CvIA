package com.smarthr.job.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobOfferRequest {

    @NotBlank(message = "Le titre est obligatoire")
    private String title;

    @NotBlank(message = "La description est obligatoire")
    private String description;

    @NotEmpty(message = "Au moins une compétence requise")
    private List<String> requiredSkills;

    private String experienceLevel;

    private String salaryRange;

    private String contractType;

    private String location;

    @NotNull(message = "createdBy est obligatoire (id du recruteur)")
    private Long createdBy;
}
