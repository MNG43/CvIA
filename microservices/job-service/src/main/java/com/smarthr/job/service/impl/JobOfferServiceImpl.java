package com.smarthr.job.service.impl;

import com.smarthr.job.dto.JobOfferRequest;
import com.smarthr.job.dto.JobOfferResponse;
import com.smarthr.job.entity.JobOffer;
import com.smarthr.job.exception.ResourceNotFoundException;
import com.smarthr.job.repository.JobOfferRepository;
import com.smarthr.job.service.JobOfferService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class JobOfferServiceImpl implements JobOfferService {

    private final JobOfferRepository jobOfferRepository;

    @Override
    public JobOfferResponse create(JobOfferRequest request) {
        JobOffer jobOffer = JobOffer.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .requiredSkills(request.getRequiredSkills())
                .experienceLevel(request.getExperienceLevel())
                .salaryRange(request.getSalaryRange())
                .contractType(request.getContractType())
                .location(request.getLocation())
                .createdBy(request.getCreatedBy())
                .build();

        JobOffer saved = jobOfferRepository.save(jobOffer);
        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public JobOfferResponse getById(Long id) {
        JobOffer jobOffer = findEntityById(id);
        return toResponse(jobOffer);
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobOfferResponse> getAll() {
        return jobOfferRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobOfferResponse> getByRecruiter(Long createdBy) {
        return jobOfferRepository.findByCreatedBy(createdBy)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public JobOfferResponse update(Long id, JobOfferRequest request) {
        JobOffer jobOffer = findEntityById(id);

        jobOffer.setTitle(request.getTitle());
        jobOffer.setDescription(request.getDescription());
        jobOffer.setRequiredSkills(request.getRequiredSkills());
        jobOffer.setExperienceLevel(request.getExperienceLevel());
        jobOffer.setSalaryRange(request.getSalaryRange());
        jobOffer.setContractType(request.getContractType());
        jobOffer.setLocation(request.getLocation());

        JobOffer updated = jobOfferRepository.save(jobOffer);
        return toResponse(updated);
    }

    @Override
    public void delete(Long id) {
        JobOffer jobOffer = findEntityById(id);
        jobOfferRepository.delete(jobOffer);
    }

    private JobOffer findEntityById(Long id) {
        return jobOfferRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Offre d'emploi introuvable avec l'id : " + id));
    }

    private JobOfferResponse toResponse(JobOffer jobOffer) {
        return JobOfferResponse.builder()
                .id(jobOffer.getId())
                .title(jobOffer.getTitle())
                .description(jobOffer.getDescription())
                .requiredSkills(jobOffer.getRequiredSkills())
                .experienceLevel(jobOffer.getExperienceLevel())
                .salaryRange(jobOffer.getSalaryRange())
                .contractType(jobOffer.getContractType())
                .location(jobOffer.getLocation())
                .createdAt(jobOffer.getCreatedAt())
                .createdBy(jobOffer.getCreatedBy())
                .build();
    }
}
