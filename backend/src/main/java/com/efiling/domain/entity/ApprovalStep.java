package com.efiling.domain.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "approval_steps")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApprovalStep {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workflow_id", nullable = false)
    @JsonBackReference
    private ApprovalWorkflow workflow;

    @Column(name = "step_name", nullable = false)
    private String stepName;

    @Column(name = "step_order", nullable = false)
    private Integer stepOrder;

    private String description;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "step_approver_roles",
        joinColumns = @JoinColumn(name = "step_id"),
        inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    @Builder.Default
    @JsonIgnoreProperties({"permissions", "hibernateLazyInitializer", "handler"})
    private Set<Role> approverRoles = new HashSet<>();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "step_approver_users",
        joinColumns = @JoinColumn(name = "step_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    @Builder.Default
    @JsonIgnoreProperties({"roles", "institution", "hibernateLazyInitializer", "handler"})
    private Set<User> approverUsers = new HashSet<>();

    @Column(name = "requires_all_approvers")
    @Builder.Default
    private Boolean requiresAllApprovers = false;

    @Column(name = "is_final_step")
    @Builder.Default
    private Boolean isFinalStep = false;

    @Column(name = "requires_signature")
    @Builder.Default
    private Boolean requiresSignature = false;

    @Column(name = "auto_approve_hours")
    private Integer autoApproveHours;
}
