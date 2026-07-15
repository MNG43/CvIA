// Fichier: src/main/java/com/smarthr/candidate/client/JobServiceClient.java
package com.smarthr.candidate.client;

import com.smarthr.candidate.dto.JobDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(
    name = "JOB-SERVICE",
    url = "${job.service.url:http://localhost:8081}"
)
public interface JobServiceClient {

    @GetMapping("/api/jobs/{id}")
    JobDTO getJobById(@PathVariable("id") Long id);
}