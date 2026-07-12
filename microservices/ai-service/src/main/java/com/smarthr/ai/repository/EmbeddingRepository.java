package com.smarthr.ai.repository;

import com.smarthr.ai.entity.Embedding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmbeddingRepository extends JpaRepository<Embedding, Long> {

    Optional<Embedding> findByCandidateIdAndJobId(Long candidateId, Long jobId);

    List<Embedding> findByJobIdOrderByScoreDesc(Long jobId);

    void deleteByCandidateIdAndJobId(Long candidateId, Long jobId);
}
