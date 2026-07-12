package com.smarthr.job.service;

import com.smarthr.job.dto.JobOfferRequest;
import com.smarthr.job.dto.JobOfferResponse;

import java.util.List;

public interface JobOfferService {

    JobOfferResponse create(JobOfferRequest request);

    JobOfferResponse getById(Long id);

    List<JobOfferResponse> getAll();

    List<JobOfferResponse> getByRecruiter(Long createdBy);

    JobOfferResponse update(Long id, JobOfferRequest request);

    void delete(Long id);
}
