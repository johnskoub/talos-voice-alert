package com.talos.backend.service;

import com.talos.backend.entity.Company;
import com.talos.backend.repository.CompanyRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CompanyService {

    private final CompanyRepository companyRepository;

    public CompanyService(CompanyRepository companyRepository) {
        this.companyRepository = companyRepository;
    }

    // ================================
    // GET ALL
    // ================================

    public List<Company> getAllCompanies() {
        return companyRepository.findByActiveTrue();
    }

    // ================================
    // GET BY ID
    // ================================

    public Company getCompanyById(Long id) {
        return companyRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Company not found with id: " + id
                        )
                );
    }

    // ================================
    // CREATE
    // ================================

    public Company createCompany(Company company) {
        return companyRepository.save(company);
    }

    // ================================
    // UPDATE
    // ================================

    public Company updateCompany(
            Long id,
            Company updatedCompany
    ) {
        Company existingCompany =
                getCompanyById(id);

        // Basic information
        existingCompany.setName(
                updatedCompany.getName()
        );

        existingCompany.setLegalName(
                updatedCompany.getLegalName()
        );

        existingCompany.setTaxId(
                updatedCompany.getTaxId()
        );

        existingCompany.setEmail(
                updatedCompany.getEmail()
        );

        existingCompany.setPhone(
                updatedCompany.getPhone()
        );

        existingCompany.setAddress(
                updatedCompany.getAddress()
        );

        // Dashboard information
        existingCompany.setLogoUrl(
                updatedCompany.getLogoUrl()
        );

        existingCompany.setFloors(
                updatedCompany.getFloors()
        );

        // President
        existingCompany.setPresidentName(
                updatedCompany.getPresidentName()
        );

        existingCompany.setPresidentPhone(
                updatedCompany.getPresidentPhone()
        );

        existingCompany.setPresidentEmail(
                updatedCompany.getPresidentEmail()
        );

        // Vice President
        existingCompany.setVicePresidentName(
                updatedCompany.getVicePresidentName()
        );

        existingCompany.setVicePresidentPhone(
                updatedCompany.getVicePresidentPhone()
        );

        existingCompany.setVicePresidentEmail(
                updatedCompany.getVicePresidentEmail()
        );

        // Security team
        existingCompany.setSecurityTeam(
                updatedCompany.getSecurityTeam()
        );

        existingCompany.setSecurityPhone(
                updatedCompany.getSecurityPhone()
        );

        // Active status
        existingCompany.setActive(
                updatedCompany.getActive()
        );

        return companyRepository.save(existingCompany);
    }

    // ================================
    // DELETE
    // ================================

    public void deleteCompany(Long id) {
        Company existingCompany =
                getCompanyById(id);

        // Soft delete
        existingCompany.setActive(false);

        companyRepository.save(existingCompany);
    }
}