package com.cinepass.config;

import com.cinepass.entity.Provider;
import com.cinepass.entity.Role;
import com.cinepass.entity.User;
import com.cinepass.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class AdminSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        String adminEmail = "admin@cinepass.com";
        Optional<User> existingAdmin = userRepository.findByEmail(adminEmail);
        
        if (existingAdmin.isEmpty()) {
            User admin = User.builder()
                    .name("Super Admin")
                    .email(adminEmail)
                    .password(passwordEncoder.encode("admin123"))
                    .role(Role.ADMIN)
                    .provider(Provider.LOCAL)
                    .build();
            userRepository.save(admin);
            log.info("Default Admin User seeded successfully. Email: {}, Password: admin123", adminEmail);
        } else {
            log.info("Admin user already exists. Skipping seeder.");
        }
    }
}
