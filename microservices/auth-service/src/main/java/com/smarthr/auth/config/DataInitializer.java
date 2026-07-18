package com.smarthr.auth.config;

import com.smarthr.auth.entity.Role;
import com.smarthr.auth.entity.User;
import com.smarthr.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        createUserIfMissing("admin", "admin@smarthr.com", "admin123", Role.ADMIN);
        createUserIfMissing("recruteur", "recruteur@smarthr.com", "recruteur123", Role.RECRUTEUR);
        createUserIfMissing("candidat", "candidat@smarthr.com", "candidat123", Role.CANDIDAT);
    }

    private void createUserIfMissing(String username, String email, String password, Role role) {
        if (userRepository.existsByUsername(username)) {
            return;
        }
        User user = User.builder()
                .username(username)
                .email(email)
                .password(passwordEncoder.encode(password))
                .role(role)
                .build();
        userRepository.save(user);
        log.info("Utilisateur initialisé : {} ({})", username, role);
    }
}
