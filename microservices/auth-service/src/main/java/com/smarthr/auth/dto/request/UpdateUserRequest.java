package com.smarthr.auth.dto.request;

import com.smarthr.auth.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateUserRequest {
    @NotBlank
    private String username;
    @NotBlank
    @Email
    private String email;
    @NotNull
    private Role role;
    private Boolean enabled;
}
