package com.smarthr.auth.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePasswordRequest {
    @NotBlank(message = "{validation.currentPassword.required}")
    private String currentPassword;

    @NotBlank(message = "{validation.newPassword.required}")
    @Size(min = 8, max = 100, message = "{validation.password.size}")
    @Pattern(
        regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=]).*$",
        message = "{validation.password.pattern}"
    )
    private String newPassword;

    @NotBlank(message = "{validation.confirmPassword.required}")
    private String confirmPassword;
}
