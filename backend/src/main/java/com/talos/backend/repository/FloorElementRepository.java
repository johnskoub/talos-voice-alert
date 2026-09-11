package com.talos.backend.repository;

import com.talos.backend.entity.FloorElement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FloorElementRepository extends JpaRepository<FloorElement, Long> {

    List<FloorElement> findByFloorIdAndActiveTrue(Long floorId);
}