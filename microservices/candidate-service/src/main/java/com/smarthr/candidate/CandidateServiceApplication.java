package com.smarthr.candidate;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients(basePackages = "com.smarthr.candidate.client")
public class CandidateServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(CandidateServiceApplication.class, args);
        System.out.println("Candidate Service lancé sur http://localhost:8083");
    }
}