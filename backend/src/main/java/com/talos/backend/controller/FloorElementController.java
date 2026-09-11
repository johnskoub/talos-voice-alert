package com.talos.backend.controller;

import com.talos.backend.entity.FloorElement;
import com.talos.backend.service.FloorElementService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class FloorElementController {

    private final FloorElementService floorElementService;

    public FloorElementController(FloorElementService floorElementService) {
        this.floorElementService = floorElementService;
    }

    @GetMapping("/floors/{floorId}/elements")
    public List<FloorElement> getElementsByFloorId(
            @PathVariable Long floorId
    ) {
        return floorElementService.getActiveElementsByFloorId(floorId);
    }

    @GetMapping("/elements/{id}")
    public FloorElement getElementById(
            @PathVariable Long id
    ) {
        return floorElementService.getElementById(id);
    }

    @PostMapping("/floors/{floorId}/elements")
    @ResponseStatus(HttpStatus.CREATED)
    public FloorElement createElement(
            @PathVariable Long floorId,
            @RequestBody FloorElement floorElement
    ) {
        return floorElementService.createElement(floorId, floorElement);
    }

    @PutMapping("/elements/{id}")
    public FloorElement updateElement(
            @PathVariable Long id,
            @RequestBody FloorElement floorElement
    ) {
        return floorElementService.updateElement(id, floorElement);
    }

    @DeleteMapping("/elements/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteElement(
            @PathVariable Long id
    ) {
        floorElementService.deleteElement(id);
    }
}