package com.efiling.service;

import com.efiling.domain.entity.ChecklistItem;
import com.efiling.domain.entity.Document;
import com.efiling.domain.entity.DocumentChecklistResponse;
import com.efiling.domain.entity.DocumentType;
import com.efiling.domain.entity.User;
import com.efiling.repository.ChecklistItemRepository;
import com.efiling.repository.DocumentChecklistResponseRepository;
import com.efiling.repository.DocumentTypeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class DocumentTypeService {

    private final DocumentTypeRepository documentTypeRepository;
    private final ChecklistItemRepository checklistItemRepository;
    private final DocumentChecklistResponseRepository checklistResponseRepository;

    @Transactional
    public DocumentType createDocumentType(DocumentType documentType, Long createdBy) {
        if (documentTypeRepository.existsByCode(documentType.getCode())) {
            throw new RuntimeException("Document type with code " + documentType.getCode() + " already exists");
        }

        if (documentTypeRepository.existsByName(documentType.getName())) {
            throw new RuntimeException("Document type with name " + documentType.getName() + " already exists");
        }

        documentType.setCreatedBy(createdBy);
        DocumentType saved = documentTypeRepository.save(documentType);
        log.info("Document type created: {} by user {}", saved.getName(), createdBy);
        return saved;
    }

    @Transactional
    public DocumentType updateDocumentType(Long id, DocumentType updatedType) {
        DocumentType existingType = documentTypeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document type not found"));

        // Check if code is being changed and if new code already exists
        if (!existingType.getCode().equals(updatedType.getCode()) &&
            documentTypeRepository.existsByCode(updatedType.getCode())) {
            throw new RuntimeException("Document type with code " + updatedType.getCode() + " already exists");
        }

        // Check if name is being changed and if new name already exists
        if (!existingType.getName().equals(updatedType.getName()) &&
            documentTypeRepository.existsByName(updatedType.getName())) {
            throw new RuntimeException("Document type with name " + updatedType.getName() + " already exists");
        }

        existingType.setName(updatedType.getName());
        existingType.setDescription(updatedType.getDescription());
        existingType.setCode(updatedType.getCode());
        existingType.setIsActive(updatedType.getIsActive());
        existingType.setRequiresChecklist(updatedType.getRequiresChecklist());

        DocumentType saved = documentTypeRepository.save(existingType);
        log.info("Document type updated: {}", saved.getName());
        return saved;
    }

    @Transactional
    public void deleteDocumentType(Long id) {
        DocumentType documentType = documentTypeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document type not found"));

        // Soft delete by setting isActive to false
        documentType.setIsActive(false);
        documentTypeRepository.save(documentType);
        log.info("Document type deactivated: {}", documentType.getName());
    }

    public DocumentType getDocumentType(Long id) {
        return documentTypeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document type not found"));
    }

    public DocumentType getDocumentTypeWithChecklist(Long id) {
        return documentTypeRepository.findByIdWithChecklistItems(id)
                .orElseThrow(() -> new RuntimeException("Document type not found"));
    }

    public List<DocumentType> getAllDocumentTypes() {
        return documentTypeRepository.findAll();
    }

    public List<DocumentType> getActiveDocumentTypes() {
        return documentTypeRepository.findByIsActiveTrue();
    }

    @Transactional
    public ChecklistItem addChecklistItem(Long documentTypeId, ChecklistItem checklistItem) {
        DocumentType documentType = documentTypeRepository.findById(documentTypeId)
                .orElseThrow(() -> new RuntimeException("Document type not found"));

        checklistItem.setDocumentType(documentType);

        // Set display order if not provided
        if (checklistItem.getDisplayOrder() == null) {
            int maxOrder = checklistItemRepository.findByDocumentTypeIdOrderByDisplayOrderAsc(documentTypeId)
                    .stream()
                    .mapToInt(item -> item.getDisplayOrder() != null ? item.getDisplayOrder() : 0)
                    .max()
                    .orElse(0);
            checklistItem.setDisplayOrder(maxOrder + 1);
        }

        ChecklistItem saved = checklistItemRepository.save(checklistItem);
        log.info("Checklist item added to document type {}: {}", documentType.getName(), saved.getLabel());
        return saved;
    }

    @Transactional
    public ChecklistItem updateChecklistItem(Long itemId, ChecklistItem updatedItem) {
        ChecklistItem existingItem = checklistItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Checklist item not found"));

        existingItem.setLabel(updatedItem.getLabel());
        existingItem.setDescription(updatedItem.getDescription());
        existingItem.setDisplayOrder(updatedItem.getDisplayOrder());
        existingItem.setItemType(updatedItem.getItemType());
        existingItem.setIsRequired(updatedItem.getIsRequired());
        existingItem.setIsActive(updatedItem.getIsActive());
        existingItem.setOptions(updatedItem.getOptions());

        ChecklistItem saved = checklistItemRepository.save(existingItem);
        log.info("Checklist item updated: {}", saved.getLabel());
        return saved;
    }

    @Transactional
    public void deleteChecklistItem(Long itemId) {
        ChecklistItem item = checklistItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Checklist item not found"));

        // Soft delete by setting isActive to false
        item.setIsActive(false);
        checklistItemRepository.save(item);
        log.info("Checklist item deactivated: {}", item.getLabel());
    }

    public List<ChecklistItem> getChecklistItems(Long documentTypeId) {
        return checklistItemRepository.findByDocumentTypeIdOrderByDisplayOrderAsc(documentTypeId);
    }

    public List<ChecklistItem> getActiveChecklistItems(Long documentTypeId) {
        return checklistItemRepository.findByDocumentTypeIdAndIsActiveTrueOrderByDisplayOrderAsc(documentTypeId);
    }

    @Transactional
    public void saveChecklistResponses(Document document, List<Map<String, Object>> responses, User respondedBy) {
        // Delete existing responses for this document
        checklistResponseRepository.deleteByDocumentId(document.getId());

        // Save new responses
        for (Map<String, Object> responseData : responses) {
            Long checklistItemId = Long.valueOf(responseData.get("checklistItemId").toString());
            ChecklistItem checklistItem = checklistItemRepository.findById(checklistItemId)
                    .orElseThrow(() -> new RuntimeException("Checklist item not found"));

            DocumentChecklistResponse response = DocumentChecklistResponse.builder()
                    .document(document)
                    .checklistItem(checklistItem)
                    .respondedBy(respondedBy)
                    .build();

            // Set response value based on item type
            if (checklistItem.getItemType() == ChecklistItem.ItemType.CHECKBOX) {
                response.setIsChecked((Boolean) responseData.get("value"));
            } else {
                response.setResponseValue(responseData.get("value") != null ?
                        responseData.get("value").toString() : null);
            }

            checklistResponseRepository.save(response);
        }

        log.info("Checklist responses saved for document {}", document.getId());
    }

    public List<DocumentChecklistResponse> getChecklistResponses(Long documentId) {
        return checklistResponseRepository.findByDocumentIdWithChecklistItems(documentId);
    }
}
