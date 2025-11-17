package com.efiling.service;

import com.efiling.domain.entity.Notification;
import com.efiling.domain.entity.User;
import com.efiling.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final JavaMailSender mailSender;

    @Value("${app.notification.email.from}")
    private String emailFrom;

    @Value("${app.notification.email.enabled}")
    private boolean emailEnabled;

    @Value("${app.notification.sms.enabled}")
    private boolean smsEnabled;

    @Async
    @Transactional
    public void sendNotification(User user, Notification.NotificationType type, String subject,
                                   String message, Notification.NotificationChannel channel,
                                   String referenceType, Long referenceId) {
        Notification notification = Notification.builder()
                .user(user)
                .type(type)
                .subject(subject)
                .message(message)
                .channel(channel)
                .referenceType(referenceType)
                .referenceId(referenceId)
                .status(Notification.NotificationStatus.PENDING)
                .build();

        notificationRepository.save(notification);

        try {
            switch (channel) {
                case EMAIL -> sendEmail(notification);
                case SMS -> sendSms(notification);
                case PUSH -> sendPushNotification(notification);
                case IN_APP -> {
                    // In-app notifications are just stored in DB
                    notification.setStatus(Notification.NotificationStatus.SENT);
                }
            }
            notification.setSentAt(LocalDateTime.now());
            notification.setStatus(Notification.NotificationStatus.SENT);
        } catch (Exception e) {
            log.error("Failed to send notification", e);
            notification.setStatus(Notification.NotificationStatus.FAILED);
            notification.setErrorMessage(e.getMessage());
            notification.setRetryCount(notification.getRetryCount() + 1);
        }

        notificationRepository.save(notification);
    }

    private void sendEmail(Notification notification) {
        if (!emailEnabled) {
            log.info("Email notifications disabled");
            return;
        }

        try {
            SimpleMailMessage mailMessage = new SimpleMailMessage();
            mailMessage.setFrom(emailFrom);
            mailMessage.setTo(notification.getUser().getEmail());
            mailMessage.setSubject(notification.getSubject());
            mailMessage.setText(notification.getMessage());

            mailSender.send(mailMessage);
            log.info("Email sent to {}", notification.getUser().getEmail());
        } catch (Exception e) {
            log.error("Failed to send email", e);
            throw new RuntimeException("Failed to send email", e);
        }
    }

    private void sendSms(Notification notification) {
        if (!smsEnabled) {
            log.info("SMS notifications disabled");
            return;
        }
        // Twilio SMS implementation would go here
        log.info("SMS would be sent to {}", notification.getUser().getPhoneNumber());
    }

    private void sendPushNotification(Notification notification) {
        // Push notification implementation would go here
        log.info("Push notification would be sent to user {}", notification.getUser().getId());
    }

    @Transactional
    public void markAsRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!notification.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        notification.setIsRead(true);
        notification.setReadAt(LocalDateTime.now());
        notificationRepository.save(notification);
    }

    public List<Notification> getUserNotifications(User user) {
        return notificationRepository.findByUserOrderByCreatedAtDesc(user);
    }

    public List<Notification> getUnreadNotifications(User user) {
        return notificationRepository.findByUserAndIsRead(user, false);
    }
}
