package com.talos.backend.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "companies")
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ================================
    // BASIC COMPANY INFORMATION
    // ================================

    @Column(nullable = false, length = 150)
    private String name;

    @Column(name = "legal_name", length = 255)
    private String legalName;

    @Column(name = "tax_id", length = 50, unique = true)
    private String taxId;

    @Column(length = 255)
    private String email;

    @Column(length = 50)
    private String phone;

    @Column(length = 255)
    private String address;

    @Column(name = "logo_url", length = 500)
    private String logoUrl;

    @Column(name = "floors")
    private Integer floors;

    // ================================
    // PRESIDENT
    // ================================

    @Column(name = "president_name", length = 150)
    private String presidentName;

    @Column(name = "president_phone", length = 50)
    private String presidentPhone;

    @Column(name = "president_email", length = 255)
    private String presidentEmail;

    // ================================
    // VICE PRESIDENT
    // ================================

    @Column(name = "vice_president_name", length = 150)
    private String vicePresidentName;

    @Column(name = "vice_president_phone", length = 50)
    private String vicePresidentPhone;

    @Column(name = "vice_president_email", length = 255)
    private String vicePresidentEmail;

    // ================================
    // SECURITY TEAM
    // ================================

    @Column(name = "security_team", length = 255)
    private String securityTeam;

    @Column(name = "security_phone", length = 50)
    private String securityPhone;

    // ================================
    // SYSTEM FIELDS
    // ================================

    @Column(name = "is_active", nullable = false)
    private Boolean active = true;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;

    public Company() {
    }

    // ================================
    // GETTERS / SETTERS
    // ================================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getLegalName() {
        return legalName;
    }

    public void setLegalName(String legalName) {
        this.legalName = legalName;
    }

    public String getTaxId() {
        return taxId;
    }

    public void setTaxId(String taxId) {
        this.taxId = taxId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getLogoUrl() {
        return logoUrl;
    }

    public void setLogoUrl(String logoUrl) {
        this.logoUrl = logoUrl;
    }

    public Integer getFloors() {
        return floors;
    }

    public void setFloors(Integer floors) {
        this.floors = floors;
    }

    public String getPresidentName() {
        return presidentName;
    }

    public void setPresidentName(String presidentName) {
        this.presidentName = presidentName;
    }

    public String getPresidentPhone() {
        return presidentPhone;
    }

    public void setPresidentPhone(String presidentPhone) {
        this.presidentPhone = presidentPhone;
    }

    public String getPresidentEmail() {
        return presidentEmail;
    }

    public void setPresidentEmail(String presidentEmail) {
        this.presidentEmail = presidentEmail;
    }

    public String getVicePresidentName() {
        return vicePresidentName;
    }

    public void setVicePresidentName(String vicePresidentName) {
        this.vicePresidentName = vicePresidentName;
    }

    public String getVicePresidentPhone() {
        return vicePresidentPhone;
    }

    public void setVicePresidentPhone(String vicePresidentPhone) {
        this.vicePresidentPhone = vicePresidentPhone;
    }

    public String getVicePresidentEmail() {
        return vicePresidentEmail;
    }

    public void setVicePresidentEmail(String vicePresidentEmail) {
        this.vicePresidentEmail = vicePresidentEmail;
    }

    public String getSecurityTeam() {
        return securityTeam;
    }

    public void setSecurityTeam(String securityTeam) {
        this.securityTeam = securityTeam;
    }

    public String getSecurityPhone() {
        return securityPhone;
    }

    public void setSecurityPhone(String securityPhone) {
        this.securityPhone = securityPhone;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}