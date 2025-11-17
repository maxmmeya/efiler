package com.efiling.repository;

import com.efiling.domain.entity.ChecklistItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChecklistItemRepository extends JpaRepository<ChecklistItem, Long> {

    List<ChecklistItem> findByDocumentTypeIdAndIsActiveTrue(Long documentTypeId);

    List<ChecklistItem> findByDocumentTypeIdOrderByDisplayOrderAsc(Long documentTypeId);

    List<ChecklistItem> findByDocumentTypeIdAndIsActiveTrueOrderByDisplayOrderAsc(Long documentTypeId);
}
