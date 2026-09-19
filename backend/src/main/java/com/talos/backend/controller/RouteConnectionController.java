package com.talos.backend.controller;

import com.talos.backend.entity.RouteConnection;
import com.talos.backend.service.RouteConnectionService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class RouteConnectionController {

    private final RouteConnectionService routeConnectionService;

    public RouteConnectionController(
            RouteConnectionService routeConnectionService
    ) {
        this.routeConnectionService = routeConnectionService;
    }

    @GetMapping("/floors/{floorId}/route-connections")
    public List<RouteConnection> getConnectionsByFloorId(
            @PathVariable Long floorId
    ) {
        return routeConnectionService.getActiveConnectionsByFloorId(floorId);
    }

    @GetMapping("/route-connections/{id}")
    public RouteConnection getConnectionById(
            @PathVariable Long id
    ) {
        return routeConnectionService.getConnectionById(id);
    }

    @PostMapping("/floors/{floorId}/route-connections")
    @ResponseStatus(HttpStatus.CREATED)
    public RouteConnection createConnection(
            @PathVariable Long floorId,
            @RequestBody RouteConnection routeConnection
    ) {
        return routeConnectionService.createConnection(
                floorId,
                routeConnection
        );
    }

    @PutMapping("/route-connections/{id}")
    public RouteConnection updateConnection(
            @PathVariable Long id,
            @RequestBody RouteConnection routeConnection
    ) {
        return routeConnectionService.updateConnection(
                id,
                routeConnection
        );
    }

    @DeleteMapping("/route-connections/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteConnection(
            @PathVariable Long id
    ) {
        routeConnectionService.deleteConnection(id);
    }
}