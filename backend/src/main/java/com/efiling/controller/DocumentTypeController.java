package com.efiling.controller;

import com.efiling.domain.entity.ChecklistItem;
import com.efiling.domain.entity.DocumentType;
import com.efiling.dto.documenttype.ChecklistItemRequest;
import com.efiling.dto.documenttype.DocumentTypeRequest;
import com.efiling.security.UserPrincipal;
import com.efiling.service.DocumentTypeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/document-types")
@RequiredArgsConstructor
public class DocumentTypeController {

    private final DocumentTypeService documentTypeService;

    @GetMapping
    public ResponseEntity<List<DocumentType>> getAllDocumentTypes() {
        return ResponseEntity.ok(documentTypeService.getAllDocumentTypes());
    }

    @GetMapping("/active")
    public ResponseEntity<List<DocumentType>> getActiveDocumentTypes() {
        return ResponseEntity.ok(documentTypeService.getActiveDocumentTypes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DocumentType> getDocumentType(@PathVariable Long id) {
        return ResponseEntity.ok(documentTypeService.getDocumentType(id));
    }

    @GetMapping("/{id}/with-checklist")
    public ResponseEntity<DocumentType> getDocumentTypeWithChecklist(@PathVariable Long id) {
        return ResponseEntity.ok(documentTypeService.getDocumentTypeWithChecklist(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'BACK_OFFICE')")
    public ResponseEntity<?> createDocumentType(
            @Valid @RequestBody DocumentTypeRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            DocumentType documentType = DocumentType.builder()
                    .name(request.getName())
                    .description(request.getDescription())
                    .code(request.getCode())
                    .isActive(request.getIsActive())
                    .requiresChecklist(request.getRequiresChecklist())
                    .build();

            DocumentType created = documentTypeService.createDocumentType(documentType, userPrincipal.getId());
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'BACK_OFFICE')")
    public ResponseEntity<?> updateDocumentType(
            @PathVariable Long id,
            @Valid @RequestBody DocumentTypeRequest request) {
        try {
            DocumentType documentType = DocumentType.builder()
                    .name(request.getName())
                    .description(request.getDescription())
                    .code(request.getCode())
                    .isActive(request.getIsActive())
                    .requiresChecklist(request.getRequiresChecklist())
                    .build();

            DocumentType updated = documentTypeService.updateDocumentType(id, documentType);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'BACK_OFFICE')")
    public ResponseEntity<?> deleteDocumentType(@PathVariable Long id) {
        try {
            documentTypeService.deleteDocumentType(id);
            return ResponseEntity.ok("Document type deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Checklist Item Endpoints

    @GetMapping("/{documentTypeId}/checklist-items")
    public ResponseEntity<List<ChecklistItem>> getChecklistItems(@PathVariable Long documentTypeId) {
        return ResponseEntity.ok(documentTypeService.getChecklistItems(documentTypeId));
    }

    @GetMapping("/{documentTypeId}/checklist-items/active")
    public ResponseEntity<List<ChecklistItem>> getActiveChecklistItems(@PathVariable Long documentTypeId) {
        return ResponseEntity.ok(documentTypeService.getActiveChecklistItems(documentTypeId));
    }

    @PostMapping("/{documentTypeId}/checklist-items")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'BACK_OFFICE')")
    public ResponseEntity<?> addChecklistItem(
            @PathVariable Long documentTypeId,
            @Valid @RequestBody ChecklistItemRequest request) {
        try {
            ChecklistItem checklistItem = ChecklistItem.builder()
                    .label(request.getLabel())
                    .description(request.getDescription())
                    .displayOrder(request.getDisplayOrder())
                    .itemType(request.getItemType())
                    .isRequired(request.getIsRequired())
                    .isActive(request.getIsActive())
                    .options(request.getOptions())
                    .build();

            ChecklistItem created = documentTypeService.addChecklistItem(documentTypeId, checklistItem);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/checklist-items/{itemId}")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'BACK_OFFICE')")
    public ResponseEntity<?> updateChecklistItem(
            @PathVariable Long itemId,
            @Valid @RequestBody ChecklistItemRequest request) {
        try {
            ChecklistItem checklistItem = ChecklistItem.builder()
                    .label(request.getLabel())
                    .description(request.getDescription())
                    .displayOrder(request.getDisplayOrder())
                    .itemType(request.getItemType())
                    .isRequired(request.getIsRequired())
                    .isActive(request.getIsActive())
                    .options(request.getOptions())
                    .build();

            ChecklistItem updated = documentTypeService.updateChecklistItem(itemId, checklistItem);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/checklist-items/{itemId}")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'BACK_OFFICE')")
    public ResponseEntity<?> deleteChecklistItem(@PathVariable Long itemId) {
        try {
            documentTypeService.deleteChecklistItem(itemId);
            return ResponseEntity.ok("Checklist item deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
