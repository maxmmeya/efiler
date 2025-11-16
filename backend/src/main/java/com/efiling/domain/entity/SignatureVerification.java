package com.efiling.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "signature_verifications")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SignatureVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "signature_id", nullable = false)
    private DigitalSignature signature;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "verified_by")
    private User verifiedBy;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VerificationResult result;

    @Column(name = "verification_method")
    private String verificationMethod;

    @Column(columnDefinition = "TEXT")
    private String details;

    @Column(name = "certificate_valid")
    private Boolean certificateValid;

    @Column(name = "signature_intact")
    private Boolean signatureIntact;

    @Column(name = "document_unmodified")
    private Boolean documentUnmodified;

    @Column(name = "trust_chain_valid")
    private Boolean trustChainValid;

    @Column(name = "ip_address")
    private String ipAddress;

    @CreatedDate
    @Column(name = "verified_at", nullable = false, updatable = false)
    private LocalDateTime verifiedAt;

    public enum VerificationResult {
        VALID,
        INVALID,
        CERTIFICATE_EXPIRED,
        CERTIFICATE_REVOKED,
        DOCUMENT_MODIFIED,
        TRUST_CHAIN_BROKEN,
        VERIFICATION_FAILED
    }
}
