package com.smarthr.candidate.service;

import com.smarthr.candidate.entity.Application;
import com.smarthr.candidate.entity.ApplicationStatus;
import com.smarthr.candidate.entity.Candidate;
import com.smarthr.candidate.repository.ApplicationRepository;
import com.smarthr.candidate.repository.CandidateRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CandidateService {

    private final CandidateRepository candidateRepository;
    private final ApplicationRepository applicationRepository;
    private final KafkaTemplate<String, String> kafkaTemplate;

    /**
     * Upload d'un CV, extraction du texte, création du candidat et de l'application
     * associée.
     */
    public Candidate uploadCv(MultipartFile file, String firstName, String lastName,
            String email, String phone, Long jobId) throws IOException {
        // 1. Extraction du texte
        String extractedText;
        try (PDDocument document = PDDocument.load(file.getInputStream())) {
            PDFTextStripper stripper = new PDFTextStripper();
            extractedText = stripper.getText(document);
        }

        // 2. Sauvegarde du candidat
        Candidate candidate = new Candidate();
        candidate.setFirstName(firstName);
        candidate.setLastName(lastName);
        candidate.setEmail(email);
        candidate.setPhone(phone);
        candidate.setCvFileUrl(file.getOriginalFilename());
        candidate.setExtractedText(extractedText);
        candidate = candidateRepository.save(candidate);
        log.info("Candidat sauvegardé avec l'ID : {}", candidate.getId());

        // 3. Création automatique de l'Application (si jobId fourni)
        if (jobId != null) {
            Application application = new Application();
            application.setCandidateId(candidate.getId());
            application.setJobId(jobId);
            application.setMatchingScore(0.0);
            application.setStatus(ApplicationStatus.CV_RECUS);
            application = applicationRepository.save(application);
            log.info("Application créée avec l'ID : {}", application.getId());
        }

        // 4. Publication de l'événement Kafka
        String message = String.format(
                "{\"candidateId\": %d, \"cvText\": \"%s\", \"jobId\": %d}",
                candidate.getId(),
                extractedText.replace("\"", "\\\"").replace("\n", " "),
                jobId != null ? jobId : 0);
        kafkaTemplate.send("cv-uploaded", message);
        log.info("Événement cv-uploaded publié pour le candidat ID: {}", candidate.getId());

        return candidate;
    }

    public Candidate getCandidate(Long id) {
        return candidateRepository.findById(id).orElse(null);
    }

    public List<Candidate> getAllCandidates() {
        return candidateRepository.findAll();
    }

    public List<Application> getApplicationsByJob(Long jobId) {
        return applicationRepository.findByJobId(jobId);
    }

    public Application updateStatus(Long applicationId, ApplicationStatus status) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found with id: " + applicationId));
        application.setStatus(status);
        Application updated = applicationRepository.save(application);
        log.info("Statut de l'application {} mis à jour : {}", applicationId, status);

        // Publier un événement Kafka pour le Notification Service
        String message = String.format(
                "{\"candidateId\": %d, \"applicationId\": %d, \"status\": \"%s\"}",
                application.getCandidateId(), applicationId, status.name());
        kafkaTemplate.send("interview-scheduled", message);
        log.info("Événement interview-scheduled publié pour l'application {}", applicationId);

        return updated;
    }
}