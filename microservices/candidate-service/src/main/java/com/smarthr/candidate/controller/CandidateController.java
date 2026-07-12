package com.smarthr.candidate.controller;

import com.smarthr.candidate.entity.Candidate;
import com.smarthr.candidate.service.CandidateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/candidates")
@RequiredArgsConstructor
public class CandidateController {

    private final CandidateService candidateService;

    @PostMapping("/upload")
    public ResponseEntity<Candidate> uploadCv(
            @RequestParam("file") MultipartFile file,
            @RequestParam("firstName") String firstName,
            @RequestParam("lastName") String lastName,
            @RequestParam("email") String email,
            @RequestParam(value = "phone", required = false) String phone) throws Exception {
        Candidate candidate = candidateService.uploadCv(file, firstName, lastName, email, phone);
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
}