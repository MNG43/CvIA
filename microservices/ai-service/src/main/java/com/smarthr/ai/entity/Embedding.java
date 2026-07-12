package com.smarthr.ai.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "embeddings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Embedding {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "candidate_id", nullable = false)
    private Long candidateId;

    @Column(name = "job_id", nullable = false)
    private Long jobId;

    @Column(name = "vector", columnDefinition = "vector(1536)")
    private String vector;

    @Column(name = "score", nullable = false)
    private Double score;

    @Column(name = "created_at", updatable = false)
    private java.time.Instant createdAt = java.time.Instant.now();
}
