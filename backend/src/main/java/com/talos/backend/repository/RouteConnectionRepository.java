package com.talos.backend.repository;

import com.talos.backend.entity.RouteConnection;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RouteConnectionRepository
        extends JpaRepository<RouteConnection, Long> {

    List<RouteConnection> findByFloorIdAndActiveTrue(Long floorId);

    Optional<RouteConnection> findByFloorIdAndFromNodeIdAndToNodeId(
            Long floorId,
            Long fromNodeId,
            Long toNodeId
    );
}