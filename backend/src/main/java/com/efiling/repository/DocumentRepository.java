package com.efiling.repository;

import com.efiling.domain.entity.Document;
import com.efiling.domain.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long>, JpaSpecificationExecutor<Document> {
    List<Document> findByUploadedBy(User user);
    Optional<Document> findByDocumentNumber(String documentNumber);
    List<Document> findByStatus(Document.DocumentStatus status);
}
