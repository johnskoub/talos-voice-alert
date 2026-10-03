package com.talos.backend.service;

import com.talos.backend.entity.CompanyUser;
import com.talos.backend.repository.CompanyUserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CompanyUserService {

    private final CompanyUserRepository companyUserRepository;

    public CompanyUserService(CompanyUserRepository companyUserRepository) {
        this.companyUserRepository = companyUserRepository;
    }

    public CompanyUser create(CompanyUser companyUser) {
        companyUser.setId(null);
        companyUser.setActive(true);

        return companyUserRepository.save(companyUser);
    }

    public List<CompanyUser> findAllActive() {
        return companyUserRepository.findByActiveTrue();
    }

    public Optional<CompanyUser> findById(Long id) {
        return companyUserRepository.findById(id);
    }

    public List<CompanyUser> findByCompanyId(Long companyId) {
        return companyUserRepository.findByCompanyIdAndActiveTrue(companyId);
    }

    public List<CompanyUser> findByUserId(Long userId) {
        return companyUserRepository.findByUserIdAndActiveTrue(userId);
    }

    public Optional<CompanyUser> findByCompanyAndUser(
            Long companyId,
            Long userId
    ) {
        return companyUserRepository
                .findByCompanyIdAndUserId(companyId, userId)
                .stream()
                .findFirst();
    }

    public Optional<CompanyUser> update(
            Long id,
            CompanyUser updatedCompanyUser
    ) {
        return companyUserRepository.findById(id)
                .map(existing -> {

                    existing.setCompanyId(updatedCompanyUser.getCompanyId());
                    existing.setUserId(updatedCompanyUser.getUserId());
                    existing.setRole(updatedCompanyUser.getRole());
                    existing.setActive(updatedCompanyUser.getActive());

                    return companyUserRepository.save(existing);
                });
    }

    public boolean delete(Long id) {
        return companyUserRepository.findById(id)
                .map(existing -> {
                    existing.setActive(false);
                    companyUserRepository.save(existing);
                    return true;
                })
                .orElse(false);
    }
}