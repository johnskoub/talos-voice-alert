package com.talos.backend.repository;

import com.talos.backend.entity.RouteConnection;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RouteConnectionRepository
        extends JpaRepository<RouteConnection, Long> {

    List<RouteConnection> findByFloorIdAndActiveTrue(Long floorId);
}