package com.talos.backend.repository;

import com.talos.backend.entity.CompanyUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CompanyUserRepository extends JpaRepository<CompanyUser, Long> {

    List<CompanyUser> findByActiveTrue();

    List<CompanyUser> findByCompanyIdAndActiveTrue(Long companyId);

    List<CompanyUser> findByUserIdAndActiveTrue(Long userId);

    List<CompanyUser> findByCompanyIdAndUserId(Long companyId, Long userId);
}