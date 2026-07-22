package com.smarthr.candidate.client;

import com.smarthr.candidate.dto.JobDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(
    name = "job-service",
    url = "${job.service.url:http://job-service:8082}",
    fallbackFactory = JobServiceClientFallbackFactory.class
)
public interface JobServiceClient {

    @GetMapping("/api/jobs/{id}")
    JobDTO getJobById(@PathVariable("id") Long id);
}
