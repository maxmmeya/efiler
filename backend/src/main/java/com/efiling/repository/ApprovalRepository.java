package com.efiling.repository;

import com.efiling.domain.entity.Approval;
import com.efiling.domain.entity.FormSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApprovalRepository extends JpaRepository<Approval, Long> {
    Optional<Approval> findByFormSubmission(FormSubmission formSubmission);
    List<Approval> findByStatus(Approval.ApprovalStatus status);

    @Query("SELECT a FROM Approval a JOIN a.workflow w JOIN w.steps s " +
           "WHERE a.currentStepOrder = s.stepOrder " +
           "AND (s.approverUsers IN (SELECT u FROM User u WHERE u.id = :userId) " +
           "OR s.approverRoles IN (SELECT r FROM User u JOIN u.roles r WHERE u.id = :userId)) " +
           "AND a.status = 'IN_PROGRESS'")
    List<Approval> findPendingApprovalsByUserId(@Param("userId") Long userId);
}
