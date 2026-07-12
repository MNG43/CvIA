package com.smarthr.ai.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI aiServiceOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("AI/Matching Service API")
                        .description("Microservice d'analyse IA et de matching CV - Offre d'emploi")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Smart HR Team")
                                .email("contact@smarthr.com")));
    }
}
