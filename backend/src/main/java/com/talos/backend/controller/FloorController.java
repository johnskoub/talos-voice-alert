package com.talos.backend.controller;

import com.talos.backend.entity.Floor;
import com.talos.backend.service.FloorService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class FloorController {

    private final FloorService floorService;

    public FloorController(FloorService floorService) {
        this.floorService = floorService;
    }

    @GetMapping("/companies/{companyId}/floors")
    public List<Floor> getFloorsByCompanyId(@PathVariable Long companyId) {
        return floorService.getActiveFloorsByCompanyId(companyId);
    }

    @GetMapping("/floors/{id}")
    public Floor getFloorById(@PathVariable Long id) {
        return floorService.getFloorById(id);
    }

    @PostMapping("/companies/{companyId}/floors")
    @ResponseStatus(HttpStatus.CREATED)
    public Floor createFloor(
            @PathVariable Long companyId,
            @RequestBody Floor floor
    ) {
        return floorService.createFloor(companyId, floor);
    }

    @PutMapping("/floors/{id}")
    public Floor updateFloor(
            @PathVariable Long id,
            @RequestBody Floor floor
    ) {
        return floorService.updateFloor(id, floor);
    }

    @DeleteMapping("/floors/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteFloor(@PathVariable Long id) {
        floorService.deleteFloor(id);
    }
}