package com.smarthr.candidate.client;

import com.smarthr.candidate.dto.JobDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.openfeign.FallbackFactory;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class JobServiceClientFallbackFactory implements FallbackFactory<JobServiceClient> {

    @Override
    public JobServiceClient create(Throwable cause) {
        return new JobServiceClient() {
            @Override
            public JobDTO getJobById(Long id) {
                log.error("Feign fallback: Impossible de récupérer le job ID: {}", id, cause);
                return new JobDTO(
                    id,
                    "Poste non disponible",
                    "Description du poste non disponible pour le job " + id,
                    java.util.Collections.emptyList(),
                    null, null, null, null
                );
            }
        };
    }
}
