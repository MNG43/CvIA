package com.smarthr.job.controller;

import com.smarthr.job.dto.JobOfferRequest;
import com.smarthr.job.dto.JobOfferResponse;
import com.smarthr.job.service.JobOfferService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
public class JobOfferController {

    private final JobOfferService jobOfferService;

    @PostMapping
    public ResponseEntity<JobOfferResponse> create(@Valid @RequestBody JobOfferRequest request) {
        JobOfferResponse response = jobOfferService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobOfferResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(jobOfferService.getById(id));
    }

    @GetMapping
    public ResponseEntity<List<JobOfferResponse>> getAll(
            @RequestParam(required = false) Long createdBy) {
        if (createdBy != null) {
            return ResponseEntity.ok(jobOfferService.getByRecruiter(createdBy));
        }
        return ResponseEntity.ok(jobOfferService.getAll());
    }

    @PutMapping("/{id}")
    public ResponseEntity<JobOfferResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody JobOfferRequest request) {
        return ResponseEntity.ok(jobOfferService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        jobOfferService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
