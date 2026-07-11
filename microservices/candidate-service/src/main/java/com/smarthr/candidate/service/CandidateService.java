package com.smarthr.candidate.service;

import com.smarthr.candidate.entity.Candidate;
import com.smarthr.candidate.repository.CandidateRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
@RequiredArgsConstructor
@Slf4j
public class CandidateService {

    private final CandidateRepository candidateRepository;
    private final KafkaTemplate<String, String> kafkaTemplate;

    public Candidate uploadCv(MultipartFile file, String firstName, String lastName, String email, String phone)
            throws IOException {
        String extractedText;
        try (PDDocument document = PDDocument.load(file.getInputStream())) {
            PDFTextStripper stripper = new PDFTextStripper();
            extractedText = stripper.getText(document);
        }

        // 2. Sauvegarder le candidat en base
        Candidate candidate = new Candidate();
        candidate.setFirstName(firstName);
        candidate.setLastName(lastName);
        candidate.setEmail(email);
        candidate.setPhone(phone);
        candidate.setCvFileUrl(file.getOriginalFilename());
        candidate.setExtractedText(extractedText);
        candidate = candidateRepository.save(candidate);

        // 3. Publier l'événement dans Kafka pour l'AI Service
        String message = String.format(
                "{\"candidateId\": %d, \"cvText\": \"%s\"}",
                candidate.getId(),
                extractedText.replace("\"", "\\\"").replace("\n", " "));
        kafkaTemplate.send("cv-uploaded", message);
        log.info("Événement cv-uploaded publié pour le candidat ID: {}", candidate.getId());

        return candidate;
    }

    public Candidate getCandidate(Long id) {
        return candidateRepository.findById(id).orElse(null);
    }
}