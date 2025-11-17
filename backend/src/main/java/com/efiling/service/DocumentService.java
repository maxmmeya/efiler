package com.efiling.service;

import com.efiling.domain.entity.Document;
import com.efiling.domain.entity.User;
import com.efiling.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final DocumentStorageService storageService;

    @Transactional
    public Document uploadDocument(MultipartFile file, String documentType, User uploadedBy) throws Exception {
        // Store file
        String filePath = storageService.storeFile(file, documentType);

        // Calculate checksum
        String checksum = storageService.calculateChecksum(file);

        // Generate document number
        String documentNumber = generateDocumentNumber();

        // Create document entity
        Document document = Document.builder()
                .filename(UUID.randomUUID().toString())
                .originalFilename(file.getOriginalFilename())
                .filePath(filePath)
                .fileSize(file.getSize())
                .mimeType(file.getContentType())
                .documentType(documentType)
                .documentNumber(documentNumber)
                .uploadedBy(uploadedBy)
                .status(Document.DocumentStatus.DRAFT)
                .checksum(checksum)
                .build();

        return documentRepository.save(document);
    }

    public Document getDocument(Long id) {
        return documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found"));
    }

    public List<Document> getUserDocuments(User user) {
        return documentRepository.findByUploadedBy(user);
    }

    public List<Document> getAllDocuments() {
        return documentRepository.findAll();
    }

    @Transactional
    public void deleteDocument(Long id, User user) throws Exception {
        Document document = getDocument(id);

        if (!document.getUploadedBy().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to delete this document");
        }

        if (document.getStatus() != Document.DocumentStatus.DRAFT) {
            throw new RuntimeException("Cannot delete submitted documents");
        }

        storageService.deleteFile(document.getFilePath());
        documentRepository.delete(document);
    }

    private String generateDocumentNumber() {
        return "DOC-" + LocalDateTime.now().getYear() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}
