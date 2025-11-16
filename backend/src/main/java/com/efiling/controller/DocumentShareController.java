package com.efiling.controller;

import com.efiling.domain.entity.Document;
import com.efiling.domain.entity.DocumentShare;
import com.efiling.security.UserPrincipal;
import com.efiling.service.DocumentShareService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/document-shares")
@RequiredArgsConstructor
public class DocumentShareController {

    private final DocumentShareService documentShareService;

    @PostMapping("/share-with-user")
    @PreAuthorize("hasAnyRole('BACK_OFFICE', 'ADMINISTRATOR')")
    public ResponseEntity<?> shareWithUser(
            @RequestBody Map<String, Object> shareData,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            Long documentId = Long.valueOf(shareData.get("documentId").toString());
            Long sharedWithUserId = Long.valueOf(shareData.get("sharedWithUserId").toString());
            String message = (String) shareData.get("message");

            DocumentShare share = documentShareService.shareWithUser(
                    documentId,
                    userPrincipal.getId(),
                    sharedWithUserId,
                    message
            );

            return ResponseEntity.ok(share);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/share-with-institution")
    @PreAuthorize("hasAnyRole('BACK_OFFICE', 'ADMINISTRATOR')")
    public ResponseEntity<?> shareWithInstitution(
            @RequestBody Map<String, Object> shareData,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            Long documentId = Long.valueOf(shareData.get("documentId").toString());
            Long institutionId = Long.valueOf(shareData.get("institutionId").toString());
            String message = (String) shareData.get("message");

            DocumentShare share = documentShareService.shareWithInstitution(
                    documentId,
                    userPrincipal.getId(),
                    institutionId,
                    message
            );

            return ResponseEntity.ok(share);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/share-with-all")
    @PreAuthorize("hasAnyRole('BACK_OFFICE', 'ADMINISTRATOR')")
    public ResponseEntity<?> shareWithAllUsers(
            @RequestBody Map<String, Object> shareData,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            Long documentId = Long.valueOf(shareData.get("documentId").toString());
            String message = (String) shareData.get("message");

            DocumentShare share = documentShareService.shareWithAllUsers(
                    documentId,
                    userPrincipal.getId(),
                    message
            );

            return ResponseEntity.ok(share);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/shared-with-me")
    public ResponseEntity<List<Document>> getSharedDocuments(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<Document> documents = documentShareService.getSharedDocuments(userPrincipal.getId());
        return ResponseEntity.ok(documents);
    }

    @GetMapping("/institutional")
    public ResponseEntity<List<Document>> getInstitutionalDocuments(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<Document> documents = documentShareService.getInstitutionalDocuments(userPrincipal.getId());
        return ResponseEntity.ok(documents);
    }

    @GetMapping("/document/{documentId}/shares")
    @PreAuthorize("hasAnyRole('BACK_OFFICE', 'ADMINISTRATOR')")
    public ResponseEntity<List<DocumentShare>> getDocumentShares(@PathVariable Long documentId) {
        List<DocumentShare> shares = documentShareService.getDocumentShares(documentId);
        return ResponseEntity.ok(shares);
    }

    @DeleteMapping("/{shareId}")
    @PreAuthorize("hasAnyRole('BACK_OFFICE', 'ADMINISTRATOR')")
    public ResponseEntity<?> revokeShare(
            @PathVariable Long shareId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            documentShareService.revokeShare(shareId, userPrincipal.getId());
            return ResponseEntity.ok("Share revoked successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/document/{documentId}/has-access")
    public ResponseEntity<Boolean> hasAccessToDocument(
            @PathVariable Long documentId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        boolean hasAccess = documentShareService.hasAccessToDocument(documentId, userPrincipal.getId());
        return ResponseEntity.ok(hasAccess);
    }
}
