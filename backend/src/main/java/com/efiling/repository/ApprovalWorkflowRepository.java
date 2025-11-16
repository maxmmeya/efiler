package com.efiling.repository;

import com.efiling.domain.entity.ApprovalWorkflow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApprovalWorkflowRepository extends JpaRepository<ApprovalWorkflow, Long> {
    Optional<ApprovalWorkflow> findByWorkflowCode(String workflowCode);
    List<ApprovalWorkflow> findByIsActive(Boolean isActive);
}
