package com.talos.backend.service;

import com.talos.backend.entity.Floor;
import com.talos.backend.repository.FloorRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FloorService {

    private final FloorRepository floorRepository;

    public FloorService(FloorRepository floorRepository) {
        this.floorRepository = floorRepository;
    }

    public List<Floor> getActiveFloorsByCompanyId(Long companyId) {
        return floorRepository.findByCompanyIdAndActiveTrue(companyId);
    }

    public Floor getFloorById(Long id) {
        return floorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Floor not found with id: " + id));
    }

    public Floor createFloor(Long companyId, Floor floor) {
        floor.setCompanyId(companyId);
        return floorRepository.save(floor);
    }

    public Floor updateFloor(Long id, Floor updatedFloor) {
        Floor existingFloor = getFloorById(id);

        existingFloor.setName(updatedFloor.getName());
        existingFloor.setFloorNumber(updatedFloor.getFloorNumber());
        existingFloor.setDescription(updatedFloor.getDescription());
        existingFloor.setFloorPlanImage(updatedFloor.getFloorPlanImage());
        existingFloor.setActive(updatedFloor.getActive());

        return floorRepository.save(existingFloor);
    }

    public void deleteFloor(Long id) {
        Floor existingFloor = getFloorById(id);

        existingFloor.setActive(false);

        floorRepository.save(existingFloor);
    }
}