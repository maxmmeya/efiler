package com.efiling.repository;

import com.efiling.domain.entity.DigitalSignature;
import com.efiling.domain.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DigitalSignatureRepository extends JpaRepository<DigitalSignature, Long> {
    List<DigitalSignature> findByDocument(Document document);
    List<DigitalSignature> findByDocumentId(Long documentId);
    List<DigitalSignature> findByStatus(DigitalSignature.SignatureStatus status);
}
