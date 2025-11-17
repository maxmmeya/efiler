package com.efiling.service;

import com.efiling.domain.entity.*;
import com.efiling.repository.DocumentRepository;
import com.efiling.repository.DocumentShareRepository;
import com.efiling.repository.InstitutionRepository;
import com.efiling.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DocumentShareService {

    private final DocumentShareRepository documentShareRepository;
    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;
    private final InstitutionRepository institutionRepository;
    private final NotificationService notificationService;

    @Transactional
    public DocumentShare shareWithUser(Long documentId, Long sharedByUserId, Long sharedWithUserId, String message) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        User sharedBy = userRepository.findById(sharedByUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        User sharedWith = userRepository.findById(sharedWithUserId)
                .orElseThrow(() -> new RuntimeException("Shared with user not found"));

        DocumentShare share = DocumentShare.builder()
                .document(document)
                .sharedBy(sharedBy)
                .shareType(DocumentShare.ShareType.USER)
                .sharedWithUser(sharedWith)
                .message(message)
                .isActive(true)
                .build();

        share = documentShareRepository.save(share);

        // Send notification
        notificationService.sendNotification(
                sharedWith,
                Notification.NotificationType.GENERAL,
                "Document Shared",
                "A document has been shared with you: " + document.getDocumentNumber(),
                Notification.NotificationChannel.EMAIL,
                "DocumentShare",
                share.getId()
        );

        return share;
    }

    @Transactional
    public DocumentShare shareWithInstitution(Long documentId, Long sharedByUserId, Long institutionId, String message) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        User sharedBy = userRepository.findById(sharedByUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Institution institution = institutionRepository.findById(institutionId)
                .orElseThrow(() -> new RuntimeException("Institution not found"));

        DocumentShare share = DocumentShare.builder()
                .document(document)
                .sharedBy(sharedBy)
                .shareType(DocumentShare.ShareType.INSTITUTION)
                .sharedWithInstitution(institution)
                .message(message)
                .isActive(true)
                .build();

        share = documentShareRepository.save(share);

        // Notify all users in the institution
        institution.getUsers().forEach(user -> {
            notificationService.sendNotification(
                    user,
                    Notification.NotificationType.GENERAL,
                    "Document Shared with Institution",
                    "A document has been shared with your institution: " + document.getDocumentNumber(),
                    Notification.NotificationChannel.IN_APP,
                    "DocumentShare",
                    share.getId()
            );
        });

        return share;
    }

    @Transactional
    public DocumentShare shareWithAllUsers(Long documentId, Long sharedByUserId, String message) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        User sharedBy = userRepository.findById(sharedByUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        DocumentShare share = DocumentShare.builder()
                .document(document)
                .sharedBy(sharedBy)
                .shareType(DocumentShare.ShareType.ALL_USERS)
                .shareAllUsers(true)
                .message(message)
                .isActive(true)
                .build();

        return documentShareRepository.save(share);
    }

    public List<Document> getSharedDocuments(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<DocumentShare> shares = documentShareRepository.findSharedDocumentsForUser(user, user.getInstitution());

        return shares.stream()
                .map(DocumentShare::getDocument)
                .distinct()
                .collect(Collectors.toList());
    }

    public List<Document> getInstitutionalDocuments(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getInstitution() == null) {
            return List.of();
        }

        return documentRepository.findAccessibleDocumentsByUser(user, user.getInstitution());
    }

    @Transactional
    public void revokeShare(Long shareId, Long userId) {
        DocumentShare share = documentShareRepository.findById(shareId)
                .orElseThrow(() -> new RuntimeException("Share not found"));

        if (!share.getSharedBy().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized to revoke this share");
        }

        share.setIsActive(false);
        documentShareRepository.save(share);
    }

    public List<DocumentShare> getDocumentShares(Long documentId) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        return documentShareRepository.findByDocument(document);
    }

    public boolean hasAccessToDocument(Long documentId, Long userId) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if user uploaded the document
        if (document.getUploadedBy().getId().equals(userId)) {
            return true;
        }

        // Check if document is visible to institution
        if (document.getVisibleToInstitution() && user.getInstitution() != null &&
            document.getUploadedBy().getInstitution() != null &&
            document.getUploadedBy().getInstitution().getId().equals(user.getInstitution().getId())) {
            return true;
        }

        // Check if document is specifically shared with user
        if (documentShareRepository.existsByDocumentAndSharedWithUser(document, user)) {
            return true;
        }

        // Check if document is shared with all users
        if (documentShareRepository.existsByDocumentAndShareAllUsersTrue(document)) {
            return true;
        }

        return false;
    }
}
