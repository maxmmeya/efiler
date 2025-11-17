package com.efiling.controller;

import com.efiling.domain.entity.DigitalSignature;
import com.efiling.domain.entity.Document;
import com.efiling.domain.entity.SignatureVerification;
import com.efiling.domain.entity.User;
import com.efiling.repository.DocumentRepository;
import com.efiling.repository.UserRepository;
import com.efiling.security.UserPrincipal;
import com.efiling.service.DigitalSignatureService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/signatures")
@RequiredArgsConstructor
public class SignatureController {

    private final DigitalSignatureService signatureService;
    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;

    @PostMapping("/sign/{documentId}")
    @PreAuthorize("hasAnyRole('BACK_OFFICE', 'ADMINISTRATOR')")
    public ResponseEntity<?> signDocument(
            @PathVariable Long documentId,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            HttpServletRequest request) {
        try {
            Document document = documentRepository.findById(documentId)
                    .orElseThrow(() -> new RuntimeException("Document not found"));

            String ipAddress = request.getRemoteAddr();
            User user = userRepository.findById(userPrincipal.getId())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            DigitalSignature signature = signatureService.signDocument(document, user, ipAddress);

            return ResponseEntity.ok(signature);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to sign document: " + e.getMessage());
        }
    }

    @PostMapping("/verify/{signatureId}")
    public ResponseEntity<?> verifySignature(
            @PathVariable Long signatureId,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            HttpServletRequest request) {
        try {
            String ipAddress = request.getRemoteAddr();
            User user = userRepository.findById(userPrincipal.getId())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            SignatureVerification verification = signatureService.verifySignature(signatureId, user, ipAddress);

            return ResponseEntity.ok(verification);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to verify signature: " + e.getMessage());
        }
    }

    @GetMapping("/{signatureId}")
    public ResponseEntity<DigitalSignature> getSignature(@PathVariable Long signatureId) {
        try {
            DigitalSignature signature = signatureService.getSignature(signatureId);
            return ResponseEntity.ok(signature);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/document/{documentId}")
    public ResponseEntity<List<DigitalSignature>> getDocumentSignatures(@PathVariable Long documentId) {
        List<DigitalSignature> signatures = signatureService.getDocumentSignatures(documentId);
        return ResponseEntity.ok(signatures);
    }

    @GetMapping("/{signatureId}/verification-history")
    public ResponseEntity<List<SignatureVerification>> getVerificationHistory(@PathVariable Long signatureId) {
        List<SignatureVerification> history = signatureService.getVerificationHistory(signatureId);
        return ResponseEntity.ok(history);
    }
}
