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

    public List<Company> getAllCompanies() {
        return companyRepository.findByActiveTrue();
    }

    public Company getCompanyById(Long id) {
        return companyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Company not found with id: " + id));
    }

    public Company createCompany(Company company) {
        return companyRepository.save(company);
    }

    public Company updateCompany(Long id, Company updatedCompany) {
        Company existingCompany = getCompanyById(id);

        existingCompany.setName(updatedCompany.getName());
        existingCompany.setLegalName(updatedCompany.getLegalName());
        existingCompany.setTaxId(updatedCompany.getTaxId());
        existingCompany.setEmail(updatedCompany.getEmail());
        existingCompany.setPhone(updatedCompany.getPhone());
        existingCompany.setAddress(updatedCompany.getAddress());
        existingCompany.setActive(updatedCompany.getActive());

        return companyRepository.save(existingCompany);
    }

    public void deleteCompany(Long id) {
        Company existingCompany = getCompanyById(id);

        existingCompany.setActive(false);

        companyRepository.save(existingCompany);
    }
}