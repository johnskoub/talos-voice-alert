package com.talos.backend.controller;

import com.talos.backend.entity.CompanyUser;
import com.talos.backend.service.CompanyUserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/company-users")
public class CompanyUserController {

    private final CompanyUserService companyUserService;

    public CompanyUserController(CompanyUserService companyUserService) {
        this.companyUserService = companyUserService;
    }

    // CREATE
    @PostMapping
    public ResponseEntity<CompanyUser> create(
            @RequestBody CompanyUser companyUser
    ) {
        CompanyUser created = companyUserService.create(companyUser);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(created);
    }

    // GET ALL ACTIVE
    @GetMapping
    public ResponseEntity<List<CompanyUser>> findAll() {
        return ResponseEntity.ok(
                companyUserService.findAllActive()
        );
    }

    // GET BY ID
    @GetMapping("/{id}")
    public ResponseEntity<CompanyUser> findById(
            @PathVariable Long id
    ) {
        return companyUserService.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() ->
                        ResponseEntity.notFound().build()
                );
    }

    // GET BY COMPANY
    @GetMapping("/company/{companyId}")
    public ResponseEntity<List<CompanyUser>> findByCompany(
            @PathVariable Long companyId
    ) {
        return ResponseEntity.ok(
                companyUserService.findByCompanyId(companyId)
        );
    }

    // GET BY USER
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<CompanyUser>> findByUser(
            @PathVariable Long userId
    ) {
        return ResponseEntity.ok(
                companyUserService.findByUserId(userId)
        );
    }

    // GET BY COMPANY + USER
    @GetMapping("/company/{companyId}/user/{userId}")
    public ResponseEntity<CompanyUser> findByCompanyAndUser(
            @PathVariable Long companyId,
            @PathVariable Long userId
    ) {
        return companyUserService
                .findByCompanyAndUser(companyId, userId)
                .map(ResponseEntity::ok)
                .orElseGet(() ->
                        ResponseEntity.notFound().build()
                );
    }

    // UPDATE
    @PutMapping("/{id}")
    public ResponseEntity<CompanyUser> update(
            @PathVariable Long id,
            @RequestBody CompanyUser companyUser
    ) {
        return companyUserService.update(id, companyUser)
                .map(ResponseEntity::ok)
                .orElseGet(() ->
                        ResponseEntity.notFound().build()
                );
    }

    // DELETE / SOFT DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id
    ) {
        boolean deleted = companyUserService.delete(id);

        if (!deleted) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.noContent().build();
    }
}