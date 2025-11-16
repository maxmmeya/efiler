package com.efiling.repository;

import com.efiling.domain.entity.Notification;
import com.efiling.domain.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserAndIsRead(User user, Boolean isRead);
    List<Notification> findByUserOrderByCreatedAtDesc(User user);
    List<Notification> findByStatus(Notification.NotificationStatus status);
}
