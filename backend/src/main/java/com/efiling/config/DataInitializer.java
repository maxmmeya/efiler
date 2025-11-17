package com.efiling.config;

import com.efiling.domain.entity.Role;
import com.efiling.domain.entity.User;
import com.efiling.repository.RoleRepository;
import com.efiling.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.username}")
    private String adminUsername;

    @Value("${app.admin.email}")
    private String adminEmail;

    @Value("${app.admin.password}")
    private String adminPassword;

    @Value("${app.admin.first-name}")
    private String adminFirstName;

    @Value("${app.admin.last-name}")
    private String adminLastName;

    @Override
    public void run(String... args) {
        log.info("Initializing application data...");

        // Create default roles
        Role adminRole = createRoleIfNotExists("ROLE_ADMINISTRATOR", "System Administrator with full access");
        Role backOfficeRole = createRoleIfNotExists("ROLE_BACK_OFFICE", "Back office staff for processing applications");
        Role externalUserRole = createRoleIfNotExists("ROLE_EXTERNAL_USER", "External institutional users");

        // Create default admin user if not exists
        if (!userRepository.existsByUsername(adminUsername)) {
            Set<Role> roles = new HashSet<>();
            roles.add(adminRole);

            User admin = User.builder()
                    .username(adminUsername)
                    .email(adminEmail)
                    .password(passwordEncoder.encode(adminPassword))
                    .firstName(adminFirstName)
                    .lastName(adminLastName)
                    .userType(User.UserType.ADMINISTRATOR)
                    .roles(roles)
                    .isActive(true)
                    .emailVerified(true)
                    .mustChangePassword(false)
                    .build();

            userRepository.save(admin);
            log.info("Default admin user created: {}", adminUsername);
            log.info("Default admin password: {}", adminPassword);
            log.warn("IMPORTANT: Please change the default admin password after first login!");
        } else {
            log.info("Admin user already exists: {}", adminUsername);
        }

        log.info("Data initialization completed successfully");
    }

    private Role createRoleIfNotExists(String roleName, String description) {
        return roleRepository.findByName(roleName)
                .orElseGet(() -> {
                    Role role = Role.builder()
                            .name(roleName)
                            .description(description)
                            .build();
                    Role savedRole = roleRepository.save(role);
                    log.info("Created role: {}", roleName);
                    return savedRole;
                });
    }
}
