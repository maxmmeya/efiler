package com.efiling.controller;

import com.efiling.domain.entity.DigitalSignature;
import com.efiling.domain.entity.Document;
import com.efiling.repository.DocumentRepository;
import com.efiling.security.UserPrincipal;
import com.efiling.service.DigitalSignatureService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/signatures")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('BACK_OFFICE', 'ADMINISTRATOR')")
public class SignatureController {

    private final DigitalSignatureService signatureService;
    private final DocumentRepository documentRepository;

    @PostMapping("/sign/{documentId}")
    public ResponseEntity<?> signDocument(
            @PathVariable Long documentId,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            HttpServletRequest request) {
        try {
            Document document = documentRepository.findById(documentId)
                    .orElseThrow(() -> new RuntimeException("Document not found"));

            String ipAddress = request.getRemoteAddr();

            DigitalSignature signature = signatureService.signDocument(
                    document,
                    com.efiling.domain.entity.User.builder().id(userPrincipal.getId()).build(),
                    ipAddress
            );

            return ResponseEntity.ok(signature);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to sign document: " + e.getMessage());
        }
    }

    @GetMapping("/verify/{signatureId}")
    public ResponseEntity<?> verifySignature(@PathVariable Long signatureId) {
        // Implementation would retrieve signature and verify
        return ResponseEntity.ok("Signature verification not yet implemented");
    }
}
