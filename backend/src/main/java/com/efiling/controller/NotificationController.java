package com.efiling.controller;

import com.efiling.domain.entity.Notification;
import com.efiling.repository.UserRepository;
import com.efiling.security.UserPrincipal;
import com.efiling.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    @GetMapping("/my-notifications")
    public ResponseEntity<List<Notification>> getMyNotifications(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        var user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Notification> notifications = notificationService.getUserNotifications(user);
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/unread")
    public ResponseEntity<List<Notification>> getUnreadNotifications(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        var user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Notification> notifications = notificationService.getUnreadNotifications(user);
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        var user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        long count = notificationService.getUnreadNotifications(user).size();
        return ResponseEntity.ok(count);
    }

    @PutMapping("/{id}/mark-read")
    public ResponseEntity<?> markAsRead(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            notificationService.markAsRead(id, userPrincipal.getId());
            return ResponseEntity.ok("Notification marked as read");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/mark-all-read")
    public ResponseEntity<?> markAllAsRead(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            var user = userRepository.findById(userPrincipal.getId())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            List<Notification> unreadNotifications = notificationService.getUnreadNotifications(user);
            unreadNotifications.forEach(notification ->
                notificationService.markAsRead(notification.getId(), userPrincipal.getId())
            );

            return ResponseEntity.ok("All notifications marked as read");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
