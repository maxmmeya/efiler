package com.efiling.repository;

import com.efiling.domain.entity.DocumentChecklistResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentChecklistResponseRepository extends JpaRepository<DocumentChecklistResponse, Long> {

    List<DocumentChecklistResponse> findByDocumentId(Long documentId);

    @Query("SELECT dcr FROM DocumentChecklistResponse dcr " +
           "LEFT JOIN FETCH dcr.checklistItem " +
           "WHERE dcr.document.id = :documentId " +
           "ORDER BY dcr.checklistItem.displayOrder ASC")
    List<DocumentChecklistResponse> findByDocumentIdWithChecklistItems(@Param("documentId") Long documentId);

    void deleteByDocumentId(Long documentId);
}
