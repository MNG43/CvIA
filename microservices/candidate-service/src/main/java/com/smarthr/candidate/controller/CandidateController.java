package com.smarthr.candidate.controller;

import com.smarthr.candidate.entity.Application;
import com.smarthr.candidate.entity.ApplicationStatus;
import com.smarthr.candidate.entity.Candidate;
import com.smarthr.candidate.service.CandidateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/candidates")
@RequiredArgsConstructor
public class CandidateController {

    private final CandidateService candidateService;

    /**
     * Upload d'un CV avec création automatique d'une Application.
     * @param file      Fichier PDF
     * @param firstName Prénom du candidat
     * @param lastName  Nom du candidat
     * @param email     Email
     * @param phone     Téléphone (optionnel)
     * @param jobId     ID de l'offre (optionnel, défaut = 1)
     */
    @PostMapping("/upload")
    public ResponseEntity<Candidate> uploadCv(
            @RequestParam("file") MultipartFile file,
            @RequestParam("firstName") String firstName,
            @RequestParam("lastName") String lastName,
            @RequestParam("email") String email,
            @RequestParam(value = "phone", required = false) String phone,
            @RequestParam(value = "jobId", required = false) Long jobId) throws Exception {

        Candidate candidate = candidateService.uploadCv(file, firstName, lastName, email, phone, jobId);
        return ResponseEntity.ok(candidate);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Candidate> getCandidate(@PathVariable Long id) {
        Candidate candidate = candidateService.getCandidate(id);
        if (candidate == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(candidate);
    }

    @GetMapping
    public ResponseEntity<List<Candidate>> getAllCandidates() {
        return ResponseEntity.ok(candidateService.getAllCandidates());
    }

    @GetMapping("/by-job/{jobId}")
    public ResponseEntity<List<Application>> getApplicationsByJob(@PathVariable Long jobId) {
        return ResponseEntity.ok(candidateService.getApplicationsByJob(jobId));
    }

    @PutMapping("/application/{applicationId}/status")
    public ResponseEntity<Application> updateApplicationStatus(
            @PathVariable Long applicationId,
            @RequestParam ApplicationStatus status) {
        return ResponseEntity.ok(candidateService.updateStatus(applicationId, status));
    }
}