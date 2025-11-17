package com.efiling.repository;

import com.efiling.domain.entity.DigitalSignature;
import com.efiling.domain.entity.SignatureVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SignatureVerificationRepository extends JpaRepository<SignatureVerification, Long> {
    List<SignatureVerification> findBySignatureOrderByVerifiedAtDesc(DigitalSignature signature);
    List<SignatureVerification> findBySignatureIdOrderByVerifiedAtDesc(Long signatureId);
}
