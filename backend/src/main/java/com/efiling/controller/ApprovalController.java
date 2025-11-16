package com.efiling.controller;

import com.efiling.domain.entity.Approval;
import com.efiling.domain.entity.ApprovalAction;
import com.efiling.security.UserPrincipal;
import com.efiling.service.ApprovalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/approvals")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('BACK_OFFICE', 'ADMINISTRATOR')")
public class ApprovalController {

    private final ApprovalService approvalService;

    @GetMapping("/pending")
    public ResponseEntity<List<Approval>> getPendingApprovals(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<Approval> approvals = approvalService.getPendingApprovalsForUser(userPrincipal.getId());
        return ResponseEntity.ok(approvals);
    }

    @PostMapping("/{id}/action")
    public ResponseEntity<?> processApproval(
            @PathVariable Long id,
            @RequestBody Map<String, Object> actionData,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            ApprovalAction.ActionType actionType = ApprovalAction.ActionType.valueOf(
                    actionData.get("action").toString()
            );
            String comments = (String) actionData.get("comments");

            approvalService.processApprovalAction(
                    id,
                    userPrincipal.getId(),
                    actionType,
                    comments,
                    com.efiling.domain.entity.User.builder().id(userPrincipal.getId()).build()
            );

            return ResponseEntity.ok("Approval action processed successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
