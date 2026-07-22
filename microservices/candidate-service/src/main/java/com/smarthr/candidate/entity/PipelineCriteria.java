package com.smarthr.candidate.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "pipeline_criteria")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PipelineCriteria {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long jobId;
    private ApplicationStatus stage;
    private Double minScore;
    private String criteriaDescription;
    private Integer priorityOrder;
}
