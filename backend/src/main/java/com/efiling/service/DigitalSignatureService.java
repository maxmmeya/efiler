package com.efiling.service;

import com.efiling.domain.entity.DigitalSignature;
import com.efiling.domain.entity.Document;
import com.efiling.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.interactive.digitalsignature.PDSignature;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.security.*;
import java.security.cert.Certificate;
import java.time.LocalDateTime;
import java.util.Calendar;

@Service
@RequiredArgsConstructor
@Slf4j
public class DigitalSignatureService {

    private final DocumentStorageService storageService;

    @Value("${app.signature.keystore.path}")
    private String keystorePath;

    @Value("${app.signature.keystore.password}")
    private String keystorePassword;

    @Value("${app.signature.keystore.alias}")
    private String keystoreAlias;

    @Transactional
    public DigitalSignature signDocument(Document document, User signer, String ipAddress) throws Exception {
        File documentFile = storageService.getFile(document.getFilePath());

        if (!document.getMimeType().equals("application/pdf")) {
            throw new UnsupportedOperationException("Only PDF documents can be digitally signed");
        }

        // Load keystore
        KeyStore keystore = KeyStore.getInstance("PKCS12");
        try (FileInputStream fis = new FileInputStream(keystorePath)) {
            keystore.load(fis, keystorePassword.toCharArray());
        }

        PrivateKey privateKey = (PrivateKey) keystore.getKey(keystoreAlias, keystorePassword.toCharArray());
        Certificate[] certChain = keystore.getCertificateChain(keystoreAlias);

        // Sign the PDF
        String signedFilePath = signPdf(documentFile, privateKey, certChain, signer);

        // Create signature hash
        String signatureHash = generateSignatureHash(privateKey, document.getChecksum());

        // Create digital signature record
        DigitalSignature signature = DigitalSignature.builder()
                .document(document)
                .signedBy(signer)
                .signatureHash(signatureHash)
                .signatureAlgorithm("SHA256withRSA")
                .signedDocumentPath(signedFilePath)
                .status(DigitalSignature.SignatureStatus.VALID)
                .signedAt(LocalDateTime.now())
                .ipAddress(ipAddress)
                .build();

        // Update document status
        document.setIsSigned(true);
        document.setStatus(Document.DocumentStatus.SIGNED);

        return signature;
    }

    private String signPdf(File pdfFile, PrivateKey privateKey, Certificate[] certChain, User signer) throws Exception {
        try (PDDocument doc = PDDocument.load(pdfFile)) {
            // Create signature
            PDSignature signature = new PDSignature();
            signature.setFilter(PDSignature.FILTER_ADOBE_PPKLITE);
            signature.setSubFilter(PDSignature.SUBFILTER_ADBE_PKCS7_DETACHED);
            signature.setName(signer.getFirstName() + " " + signer.getLastName());
            signature.setLocation("E-Filing System");
            signature.setReason("Document Approval");
            signature.setSignDate(Calendar.getInstance());

            doc.addSignature(signature);

            // Create signed file
            String signedFilePath = pdfFile.getParent() + "/signed_" + pdfFile.getName();
            File signedFile = new File(signedFilePath);

            try (FileOutputStream fos = new FileOutputStream(signedFile)) {
                doc.saveIncremental(fos);
            }

            return signedFilePath;
        }
    }

    private String generateSignatureHash(PrivateKey privateKey, String documentChecksum) throws Exception {
        Signature signature = Signature.getInstance("SHA256withRSA");
        signature.initSign(privateKey);
        signature.update(documentChecksum.getBytes());
        byte[] signatureBytes = signature.sign();

        StringBuilder hexString = new StringBuilder();
        for (byte b : signatureBytes) {
            hexString.append(String.format("%02x", b));
        }
        return hexString.toString();
    }

    public boolean verifySignature(DigitalSignature digitalSignature) throws Exception {
        // Load the signed PDF and verify the signature
        File signedFile = storageService.getFile(digitalSignature.getSignedDocumentPath());

        try (PDDocument doc = PDDocument.load(signedFile)) {
            // Verification logic would go here
            // For now, return true if status is VALID
            return digitalSignature.getStatus() == DigitalSignature.SignatureStatus.VALID;
        }
    }
}
