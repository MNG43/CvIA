package com.smarthr.auth.mapper;

import com.smarthr.auth.dto.response.RoleResponse;
import com.smarthr.auth.entity.Role;
import com.smarthr.auth.entity.enums.RoleName;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface RoleMapper {
    RoleResponse toResponse(Role role);
    
    default String mapRoleNameToString(RoleName roleName) {
        return roleName != null ? roleName.name() : null;
    }
}
