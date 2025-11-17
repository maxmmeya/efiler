package com.efiling.controller;

import com.efiling.domain.entity.Document;
import com.efiling.domain.entity.DocumentChecklistResponse;
import com.efiling.security.UserPrincipal;
import com.efiling.service.DocumentService;
import com.efiling.service.DocumentStorageService;
import com.efiling.service.DocumentTypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.util.List;

@RestController
@RequestMapping("/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;
    private final DocumentStorageService storageService;
    private final DocumentTypeService documentTypeService;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("documentType") String documentType,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            Document document = documentService.uploadDocument(
                    file,
                    documentType,
                    com.efiling.domain.entity.User.builder().id(userPrincipal.getId()).build()
            );

            return ResponseEntity.ok(document);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to upload document: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Document> getDocument(@PathVariable Long id) {
        Document document = documentService.getDocument(id);
        return ResponseEntity.ok(document);
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> downloadDocument(@PathVariable Long id) {
        try {
            Document document = documentService.getDocument(id);
            File file = storageService.getFile(document.getFilePath());

            Resource resource = new FileSystemResource(file);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + document.getOriginalFilename() + "\"")
                    .contentType(MediaType.parseMediaType(document.getMimeType()))
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping
    public ResponseEntity<List<Document>> getAllDocuments() {
        List<Document> documents = documentService.getAllDocuments();
        return ResponseEntity.ok(documents);
    }

    @GetMapping("/my-documents")
    public ResponseEntity<List<Document>> getMyDocuments(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<Document> documents = documentService.getUserDocuments(
                com.efiling.domain.entity.User.builder().id(userPrincipal.getId()).build()
        );
        return ResponseEntity.ok(documents);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDocument(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            documentService.deleteDocument(
                    id,
                    com.efiling.domain.entity.User.builder().id(userPrincipal.getId()).build()
            );
            return ResponseEntity.ok("Document deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{id}/checklist-responses")
    public ResponseEntity<List<DocumentChecklistResponse>> getChecklistResponses(@PathVariable Long id) {
        try {
            List<DocumentChecklistResponse> responses = documentTypeService.getChecklistResponses(id);
            return ResponseEntity.ok(responses);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
