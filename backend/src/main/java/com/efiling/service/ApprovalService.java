package com.efiling.service;

import com.efiling.domain.entity.*;
import com.efiling.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ApprovalService {

    private final ApprovalRepository approvalRepository;
    private final ApprovalWorkflowRepository workflowRepository;
    private final FormSubmissionRepository formSubmissionRepository;
    private final NotificationService notificationService;

    @Transactional
    public Approval initiateApproval(FormSubmission formSubmission, Long workflowId) {
        ApprovalWorkflow workflow = workflowRepository.findById(workflowId)
                .orElseThrow(() -> new RuntimeException("Workflow not found"));

        if (workflow.getSteps().isEmpty()) {
            throw new RuntimeException("Workflow has no steps configured");
        }

        Approval approval = Approval.builder()
                .formSubmission(formSubmission)
                .workflow(workflow)
                .status(Approval.ApprovalStatus.IN_PROGRESS)
                .currentStepOrder(1)
                .startedAt(LocalDateTime.now())
                .build();

        approval = approvalRepository.save(approval);

        // Update form submission status
        formSubmission.setStatus(FormSubmission.SubmissionStatus.UNDER_REVIEW);
        formSubmissionRepository.save(formSubmission);

        // Notify approvers for first step
        notifyStepApprovers(approval, workflow.getSteps().get(0));

        return approval;
    }

    @Transactional
    public void processApprovalAction(Long approvalId, Long userId, ApprovalAction.ActionType actionType,
                                       String comments, User actionedBy) {
        Approval approval = approvalRepository.findById(approvalId)
                .orElseThrow(() -> new RuntimeException("Approval not found"));

        if (approval.getStatus() != Approval.ApprovalStatus.IN_PROGRESS) {
            throw new RuntimeException("Approval is not in progress");
        }

        ApprovalStep currentStep = getCurrentStep(approval);

        // Verify user has permission to approve
        if (!canUserApprove(actionedBy, currentStep)) {
            throw new RuntimeException("User not authorized to approve this step");
        }

        // Record the action
        ApprovalAction action = ApprovalAction.builder()
                .approval(approval)
                .step(currentStep)
                .actionedBy(actionedBy)
                .action(actionType)
                .comments(comments)
                .actionedAt(LocalDateTime.now())
                .build();

        approval.getActions().add(action);

        // Process based on action type
        switch (actionType) {
            case APPROVE -> handleApprove(approval, currentStep);
            case REJECT -> handleReject(approval);
            case REQUEST_CHANGES -> handleRequestChanges(approval);
            case COMMENT -> {
                // Just save the comment, no status change
            }
        }

        approvalRepository.save(approval);
    }

    private void handleApprove(Approval approval, ApprovalStep currentStep) {
        if (currentStep.getIsFinalStep()) {
            // Final approval
            approval.setStatus(Approval.ApprovalStatus.APPROVED);
            approval.setCompletedAt(LocalDateTime.now());

            FormSubmission submission = approval.getFormSubmission();
            submission.setStatus(FormSubmission.SubmissionStatus.APPROVED);
            submission.setCompletedAt(LocalDateTime.now());
            formSubmissionRepository.save(submission);

            // Notify submitter
            notificationService.sendNotification(
                    submission.getSubmittedBy(),
                    Notification.NotificationType.APPROVED,
                    "Submission Approved",
                    "Your submission " + submission.getSubmissionNumber() + " has been approved.",
                    Notification.NotificationChannel.EMAIL,
                    "FormSubmission",
                    submission.getId()
            );
        } else {
            // Move to next step
            approval.setCurrentStepOrder(approval.getCurrentStepOrder() + 1);
            ApprovalStep nextStep = getStepByOrder(approval, approval.getCurrentStepOrder());

            if (nextStep != null) {
                notifyStepApprovers(approval, nextStep);
            }
        }
    }

    private void handleReject(Approval approval) {
        approval.setStatus(Approval.ApprovalStatus.REJECTED);
        approval.setCompletedAt(LocalDateTime.now());

        FormSubmission submission = approval.getFormSubmission();
        submission.setStatus(FormSubmission.SubmissionStatus.REJECTED);
        submission.setCompletedAt(LocalDateTime.now());
        formSubmissionRepository.save(submission);

        // Notify submitter
        notificationService.sendNotification(
                submission.getSubmittedBy(),
                Notification.NotificationType.REJECTED,
                "Submission Rejected",
                "Your submission " + submission.getSubmissionNumber() + " has been rejected.",
                Notification.NotificationChannel.EMAIL,
                "FormSubmission",
                submission.getId()
        );
    }

    private void handleRequestChanges(Approval approval) {
        FormSubmission submission = approval.getFormSubmission();
        submission.setStatus(FormSubmission.SubmissionStatus.UNDER_REVIEW);
        formSubmissionRepository.save(submission);

        // Notify submitter
        notificationService.sendNotification(
                submission.getSubmittedBy(),
                Notification.NotificationType.CHANGES_REQUESTED,
                "Changes Requested",
                "Changes have been requested for your submission " + submission.getSubmissionNumber(),
                Notification.NotificationChannel.EMAIL,
                "FormSubmission",
                submission.getId()
        );
    }

    private void notifyStepApprovers(Approval approval, ApprovalStep step) {
        // Notify users assigned to this step
        step.getApproverUsers().forEach(user -> {
            notificationService.sendNotification(
                    user,
                    Notification.NotificationType.APPROVAL_REQUIRED,
                    "Approval Required",
                    "A submission requires your approval: " + approval.getFormSubmission().getSubmissionNumber(),
                    Notification.NotificationChannel.EMAIL,
                    "Approval",
                    approval.getId()
            );
        });

        // Notify users with roles assigned to this step
        step.getApproverRoles().forEach(role -> {
            // In a real implementation, you would query users with this role
            log.info("Notification would be sent to users with role: {}", role.getName());
        });
    }

    private ApprovalStep getCurrentStep(Approval approval) {
        return getStepByOrder(approval, approval.getCurrentStepOrder());
    }

    private ApprovalStep getStepByOrder(Approval approval, Integer order) {
        return approval.getWorkflow().getSteps().stream()
                .filter(step -> step.getStepOrder().equals(order))
                .findFirst()
                .orElse(null);
    }

    private boolean canUserApprove(User user, ApprovalStep step) {
        // Check if user is directly assigned
        if (step.getApproverUsers().contains(user)) {
            return true;
        }

        // Check if user has one of the required roles
        return user.getRoles().stream()
                .anyMatch(step.getApproverRoles()::contains);
    }

    public List<Approval> getPendingApprovalsForUser(Long userId) {
        return approvalRepository.findPendingApprovalsByUserId(userId);
    }
}
