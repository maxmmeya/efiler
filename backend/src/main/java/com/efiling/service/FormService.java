package com.efiling.service;

import com.efiling.domain.entity.Form;
import com.efiling.domain.entity.FormSubmission;
import com.efiling.domain.entity.User;
import com.efiling.repository.FormRepository;
import com.efiling.repository.FormSubmissionRepository;
import com.efiling.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class FormService {

    private final FormRepository formRepository;
    private final FormSubmissionRepository formSubmissionRepository;
    private final UserRepository userRepository;
    private final ApprovalService approvalService;
    private final NotificationService notificationService;

    public Form getForm(Long id) {
        return formRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Form not found"));
    }

    public List<Form> getActiveForms() {
        return formRepository.findByIsActive(true);
    }

    @Transactional
    public Form createForm(String name, String description, String formCode, String schema,
                            String uiSchema, String validationRules, Long approvalWorkflowId, User createdBy) {
        if (formRepository.findByFormCode(formCode).isPresent()) {
            throw new RuntimeException("Form with this code already exists");
        }

        Form form = Form.builder()
                .name(name)
                .description(description)
                .formCode(formCode)
                .schema(schema)
                .uiSchema(uiSchema)
                .validationRules(validationRules)
                .approvalWorkflowId(approvalWorkflowId)
                .isActive(true)
                .version(1)
                .createdBy(createdBy)
                .build();

        return formRepository.save(form);
    }

    @Transactional
    public FormSubmission submitForm(Long formId, String formData, User submittedBy) {
        Form form = getForm(formId);

        if (!form.getIsActive()) {
            throw new RuntimeException("Form is not active");
        }

        // Generate submission number
        String submissionNumber = generateSubmissionNumber();

        FormSubmission submission = FormSubmission.builder()
                .submissionNumber(submissionNumber)
                .form(form)
                .submittedBy(submittedBy)
                .data(formData)
                .status(FormSubmission.SubmissionStatus.SUBMITTED)
                .submittedAt(LocalDateTime.now())
                .build();

        submission = formSubmissionRepository.save(submission);

        // Initiate approval workflow if configured
        if (form.getApprovalWorkflowId() != null) {
            approvalService.initiateApproval(submission, form.getApprovalWorkflowId());
        }

        // Send notification
        notificationService.sendNotification(
                submittedBy,
                com.efiling.domain.entity.Notification.NotificationType.SUBMISSION_RECEIVED,
                "Submission Received",
                "Your submission " + submissionNumber + " has been received and is being processed.",
                com.efiling.domain.entity.Notification.NotificationChannel.EMAIL,
                "FormSubmission",
                submission.getId()
        );

        return submission;
    }

    public FormSubmission getSubmission(Long id) {
        return formSubmissionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Submission not found"));
    }

    public List<FormSubmission> getUserSubmissions(User user) {
        return formSubmissionRepository.findBySubmittedBy(user);
    }

    public List<FormSubmission> getInstitutionalSubmissions(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getInstitution() == null) {
            return List.of();
        }

        return formSubmissionRepository.findAccessibleSubmissionsByUser(user, user.getInstitution());
    }

    private String generateSubmissionNumber() {
        return "SUB-" + LocalDateTime.now().getYear() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}
