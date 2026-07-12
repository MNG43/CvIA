package com.smarthr.job.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "job_offers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobOffer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ElementCollection
    @CollectionTable(name = "job_offer_skills", joinColumns = @JoinColumn(name = "job_offer_id"))
    @Column(name = "skill")
    @Builder.Default
    private List<String> requiredSkills = new ArrayList<>();

    private String experienceLevel;

    private String salaryRange;

    private String contractType;

    private String location;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    // Référence simple vers User.id (auth_db) — pas de FK JPA inter-service
    private Long createdBy;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
