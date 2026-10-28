package com.talos.backend.service;

import com.talos.backend.entity.FloorElement;
import com.talos.backend.repository.FloorElementRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FloorElementService {

    private final FloorElementRepository floorElementRepository;

    public FloorElementService(FloorElementRepository floorElementRepository) {
        this.floorElementRepository = floorElementRepository;
    }

    public List<FloorElement> getActiveElementsByFloorId(Long floorId) {
        return floorElementRepository.findByFloorIdAndActiveTrue(floorId);
    }

    public FloorElement getElementById(Long id) {
        return floorElementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(
                        "Floor element not found with id: " + id
                ));
    }

    public FloorElement createElement(
            Long floorId,
            FloorElement floorElement
    ) {
        floorElement.setFloorId(floorId);

        if ("WALL".equals(floorElement.getType())) {

            floorElement.setX(floorElement.getStartX());
            floorElement.setY(floorElement.getStartY());

        }

        return floorElementRepository.save(floorElement);
    }

    public FloorElement updateElement(
            Long id,
            FloorElement updatedElement
    ) {
        FloorElement existingElement = getElementById(id);

        existingElement.setType(updatedElement.getType());
        existingElement.setName(updatedElement.getName());
        existingElement.setCompanyUserId(updatedElement.getCompanyUserId());
        existingElement.setX(updatedElement.getX());
        existingElement.setY(updatedElement.getY());
        existingElement.setWidth(updatedElement.getWidth());
        existingElement.setHeight(updatedElement.getHeight());
        existingElement.setStartX(updatedElement.getStartX());
        existingElement.setStartY(updatedElement.getStartY());
        if ("WALL".equals(updatedElement.getType())) {
            existingElement.setX(updatedElement.getStartX());
            existingElement.setY(updatedElement.getStartY());
        }
        existingElement.setEndX(updatedElement.getEndX());
        existingElement.setEndY(updatedElement.getEndY());
        existingElement.setSide(updatedElement.getSide());
        existingElement.setStatus(updatedElement.getStatus());
        existingElement.setCategory(updatedElement.getCategory());
        existingElement.setSeverity(updatedElement.getSeverity());
        existingElement.setDisabled(updatedElement.getDisabled());
        existingElement.setSmokeDetected(updatedElement.getSmokeDetected());
        existingElement.setActive(updatedElement.getActive());

        return floorElementRepository.save(existingElement);
    }

    public void deleteElement(Long id) {
        FloorElement existingElement = getElementById(id);

        existingElement.setActive(false);

        floorElementRepository.save(existingElement);
    }
}
