package com.efiling.controller;

import com.efiling.domain.entity.Form;
import com.efiling.domain.entity.FormSubmission;
import com.efiling.security.UserPrincipal;
import com.efiling.service.FormService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/forms")
@RequiredArgsConstructor
public class FormController {

    private final FormService formService;

    @GetMapping("/public/active")
    public ResponseEntity<List<Form>> getActiveForms() {
        return ResponseEntity.ok(formService.getActiveForms());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Form> getForm(@PathVariable Long id) {
        return ResponseEntity.ok(formService.getForm(id));
    }

    @PostMapping("/manage")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public ResponseEntity<?> createForm(
            @RequestBody Map<String, Object> formData,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            Form form = formService.createForm(
                    (String) formData.get("name"),
                    (String) formData.get("description"),
                    (String) formData.get("formCode"),
                    (String) formData.get("schema"),
                    (String) formData.get("uiSchema"),
                    (String) formData.get("validationRules"),
                    formData.get("approvalWorkflowId") != null ? Long.valueOf(formData.get("approvalWorkflowId").toString()) : null,
                    com.efiling.domain.entity.User.builder().id(userPrincipal.getId()).build()
            );

            return ResponseEntity.ok(form);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<?> submitForm(
            @PathVariable Long id,
            @RequestBody Map<String, Object> submissionData,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            FormSubmission submission = formService.submitForm(
                    id,
                    submissionData.get("data").toString(),
                    com.efiling.domain.entity.User.builder().id(userPrincipal.getId()).build()
            );

            return ResponseEntity.ok(submission);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/submissions/my-submissions")
    public ResponseEntity<List<FormSubmission>> getMySubmissions(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<FormSubmission> submissions = formService.getUserSubmissions(
                com.efiling.domain.entity.User.builder().id(userPrincipal.getId()).build()
        );
        return ResponseEntity.ok(submissions);
    }

    @GetMapping("/submissions/{id}")
    public ResponseEntity<FormSubmission> getSubmission(@PathVariable Long id) {
        return ResponseEntity.ok(formService.getSubmission(id));
    }

    @GetMapping("/submissions/institutional")
    public ResponseEntity<List<FormSubmission>> getInstitutionalSubmissions(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<FormSubmission> submissions = formService.getInstitutionalSubmissions(userPrincipal.getId());
        return ResponseEntity.ok(submissions);
    }
}
