package com.efiling.repository;

import com.efiling.domain.entity.Document;
import com.efiling.domain.entity.Institution;
import com.efiling.domain.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long>, JpaSpecificationExecutor<Document> {
    List<Document> findByUploadedBy(User user);
    Optional<Document> findByDocumentNumber(String documentNumber);
    List<Document> findByStatus(Document.DocumentStatus status);

    @Query("SELECT d FROM Document d WHERE d.uploadedBy.institution = :institution " +
           "AND d.visibleToInstitution = true")
    List<Document> findInstitutionalDocuments(@Param("institution") Institution institution);

    @Query("SELECT d FROM Document d WHERE " +
           "(d.uploadedBy = :user) OR " +
           "(d.uploadedBy.institution = :institution AND d.visibleToInstitution = true)")
    List<Document> findAccessibleDocumentsByUser(@Param("user") User user, @Param("institution") Institution institution);
}
