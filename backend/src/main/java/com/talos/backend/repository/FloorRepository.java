package com.talos.backend.repository;

import com.talos.backend.entity.Floor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FloorRepository extends JpaRepository<Floor, Long> {

    List<Floor> findByCompanyIdAndActiveTrue(Long companyId);
}