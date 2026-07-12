package com.smarthr.ai.service;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;

@Service
public class PDFParserService {

    private static final Logger logger = LoggerFactory.getLogger(PDFParserService.class);

    public String extractTextFromPDF(InputStream inputStream) {
        try (PDDocument document = PDDocument.load(inputStream)) {
            PDFTextStripper textStripper = new PDFTextStripper();
            String text = textStripper.getText(document);
            logger.info("Texte extrait du PDF avec succès ({} caractères)", text.length());
            return text;
        } catch (IOException e) {
            logger.error("Erreur lors de l'extraction du texte du PDF", e);
            throw new RuntimeException("Impossible d'extraire le texte du PDF", e);
        }
    }

    public String cleanText(String text) {
        if (text == null || text.isEmpty()) {
            return "";
        }
        return text
                .replaceAll("\\s+", " ")
                .trim();
    }
}
