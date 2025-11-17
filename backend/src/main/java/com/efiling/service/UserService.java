package com.efiling.service;

import com.efiling.domain.entity.Institution;
import com.efiling.domain.entity.Role;
import com.efiling.domain.entity.User;
import com.efiling.dto.auth.SignupRequest;
import com.efiling.repository.InstitutionRepository;
import com.efiling.repository.RoleRepository;
import com.efiling.repository.UserRepository;
import com.efiling.util.PasswordGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final InstitutionRepository institutionRepository;
    private final PasswordEncoder passwordEncoder;
    private final NotificationService notificationService;

    @Transactional
    public User createUser(SignupRequest signupRequest) {
        if (userRepository.existsByUsername(signupRequest.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        if (userRepository.existsByEmail(signupRequest.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        // Generate random password
        String generatedPassword = PasswordGenerator.generatePassword();

        // Create user
        User user = User.builder()
                .username(signupRequest.getUsername())
                .email(signupRequest.getEmail())
                .password(passwordEncoder.encode(generatedPassword))
                .firstName(signupRequest.getFirstName())
                .lastName(signupRequest.getLastName())
                .phoneNumber(signupRequest.getPhoneNumber())
                .institutionName(signupRequest.getInstitutionName())
                .institutionType(signupRequest.getInstitutionType())
                .userType(signupRequest.getUserType() != null ? signupRequest.getUserType() : User.UserType.EXTERNAL_INSTITUTIONAL)
                .isActive(true)
                .emailVerified(false)
                .mustChangePassword(true) // Force password change on first login
                .build();

        // Link to institution if provided
        if (signupRequest.getInstitutionId() != null) {
            Institution institution = institutionRepository.findById(signupRequest.getInstitutionId())
                    .orElseThrow(() -> new RuntimeException("Institution not found"));
            user.setInstitution(institution);
        }

        // Assign default role
        Set<Role> roles = new HashSet<>();
        String roleName = switch (user.getUserType()) {
            case BACK_OFFICE -> "BACK_OFFICE_USER";
            case ADMINISTRATOR -> "ADMINISTRATOR";
            default -> "EXTERNAL_USER";
        };

        roleRepository.findByName(roleName).ifPresent(roles::add);
        user.setRoles(roles);

        User savedUser = userRepository.save(user);

        // Send welcome email with password
        sendWelcomeEmail(savedUser, generatedPassword);

        log.info("User created successfully: {}", savedUser.getUsername());
        return savedUser;
    }

    private void sendWelcomeEmail(User user, String password) {
        try {
            String subject = "Welcome to E-Filing System - Your Account Details";
            String body = String.format(
                "Dear %s %s,\n\n" +
                "Welcome to the E-Filing System!\n\n" +
                "Your account has been created successfully. Below are your login credentials:\n\n" +
                "Username: %s\n" +
                "Temporary Password: %s\n\n" +
                "For security reasons, you will be required to change your password upon first login.\n\n" +
                "Please login at your earliest convenience and change your password to something secure and memorable.\n\n" +
                "Security Tips:\n" +
                "- Use a strong password with at least 8 characters\n" +
                "- Include uppercase and lowercase letters, numbers, and special characters\n" +
                "- Do not share your password with anyone\n" +
                "- Change your password regularly\n\n" +
                "If you did not request this account or have any questions, please contact our support team immediately.\n\n" +
                "Best regards,\n" +
                "E-Filing System Team",
                user.getFirstName(),
                user.getLastName(),
                user.getUsername(),
                password
            );

            notificationService.sendEmailNotification(
                user.getEmail(),
                subject,
                body
            );

            log.info("Welcome email sent to: {}", user.getEmail());
        } catch (Exception e) {
            log.error("Failed to send welcome email to: {}", user.getEmail(), e);
            // Don't fail user creation if email fails
        }
    }

    @Transactional
    public void changePassword(User user, String newPassword) {
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setMustChangePassword(false);
        userRepository.save(user);
        log.info("Password changed for user: {}", user.getUsername());
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
