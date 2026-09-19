package com.talos.backend.service;

import com.talos.backend.entity.RouteConnection;
import com.talos.backend.repository.RouteConnectionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RouteConnectionService {

    private final RouteConnectionRepository routeConnectionRepository;

    public RouteConnectionService(
            RouteConnectionRepository routeConnectionRepository
    ) {
        this.routeConnectionRepository = routeConnectionRepository;
    }

    public List<RouteConnection> getActiveConnectionsByFloorId(Long floorId) {
        return routeConnectionRepository.findByFloorIdAndActiveTrue(floorId);
    }

    public RouteConnection getConnectionById(Long id) {
        return routeConnectionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(
                        "Route connection not found with id: " + id
                ));
    }

    public RouteConnection createConnection(
            Long floorId,
            RouteConnection routeConnection
    ) {
        routeConnection.setFloorId(floorId);
        return routeConnectionRepository.save(routeConnection);
    }

    public RouteConnection updateConnection(
            Long id,
            RouteConnection updatedConnection
    ) {
        RouteConnection existingConnection = getConnectionById(id);

        existingConnection.setFromNodeId(updatedConnection.getFromNodeId());
        existingConnection.setToNodeId(updatedConnection.getToNodeId());
        existingConnection.setStatus(updatedConnection.getStatus());
        existingConnection.setActive(updatedConnection.getActive());

        return routeConnectionRepository.save(existingConnection);
    }

    public void deleteConnection(Long id) {
        RouteConnection existingConnection = getConnectionById(id);

        existingConnection.setActive(false);

        routeConnectionRepository.save(existingConnection);
    }
}