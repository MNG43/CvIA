package com.smarthr.auth.mapper;

import com.smarthr.auth.dto.response.RoleResponse;
import com.smarthr.auth.entity.Role;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-07-12T00:32:00+0000",
    comments = "version: 1.6.3, compiler: javac, environment: Java 21.0.8 (Oracle Corporation)"
)
@Component
public class RoleMapperImpl implements RoleMapper {

    @Override
    public RoleResponse toResponse(Role role) {
        if ( role == null ) {
            return null;
        }

        RoleResponse.RoleResponseBuilder roleResponse = RoleResponse.builder();

        roleResponse.id( role.getId() );
        roleResponse.name( mapRoleNameToString( role.getName() ) );
        roleResponse.description( role.getDescription() );

        return roleResponse.build();
    }
}
