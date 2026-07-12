package com.smarthr.job.repository;

import com.smarthr.job.entity.JobOffer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JobOfferRepository extends JpaRepository<JobOffer, Long> {

    List<JobOffer> findByCreatedBy(Long createdBy);

    List<JobOffer> findByTitleContainingIgnoreCase(String title);
}
