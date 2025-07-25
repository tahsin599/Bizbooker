package com.tahsin.backend.Configuration;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import javax.annotation.PostConstruct;
import java.util.HashMap;
import java.util.Map;

@Configuration
public class DotenvConfig {

    private final ConfigurableEnvironment environment;

    public DotenvConfig(ConfigurableEnvironment environment) {
        this.environment = environment;
    }

    @PostConstruct
    public void loadDotenv() {
        try {
            Dotenv dotenv = Dotenv.configure()
                    .directory("./")  // Look for .env in the current directory
                    .ignoreIfMalformed()
                    .ignoreIfMissing()
                    .load();

            Map<String, Object> dotenvProperties = new HashMap<>();
            dotenv.entries().forEach(entry -> {
                dotenvProperties.put(entry.getKey(), entry.getValue());
                // Also set as system property for immediate access
                System.setProperty(entry.getKey(), entry.getValue());
            });

            // Add dotenv properties to Spring's environment
            environment.getPropertySources().addFirst(new MapPropertySource("dotenv", dotenvProperties));
            
            System.out.println("[DOTENV] Loaded " + dotenvProperties.size() + " environment variables from .env");
            
            // Verify Stripe key is loaded
            String stripeKey = dotenv.get("STRIPE_SECRET_KEY");
            if (stripeKey != null && !stripeKey.isEmpty()) {
                System.out.println("[DOTENV] Stripe secret key loaded successfully");
            } else {
                System.out.println("[DOTENV] WARNING: Stripe secret key not found in .env file");
            }
            
        } catch (Exception e) {
            System.err.println("[DOTENV] Error loading .env file: " + e.getMessage());
        }
    }

    @Bean
    public Dotenv dotenv() {
        return Dotenv.configure()
                .directory("./")
                .ignoreIfMalformed()
                .ignoreIfMissing()
                .load();
    }
}
