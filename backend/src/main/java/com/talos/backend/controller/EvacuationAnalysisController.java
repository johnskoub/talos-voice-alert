package com.talos.backend.controller;

import com.talos.backend.service.EvacuationAnalysisService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/evacuation")
public class EvacuationAnalysisController {

    private final EvacuationAnalysisService evacuationAnalysisService;

    public EvacuationAnalysisController(
            EvacuationAnalysisService evacuationAnalysisService
    ) {
        this.evacuationAnalysisService = evacuationAnalysisService;
    }

    @GetMapping("/floor/{floorId}")
    public Map<String, Object> analyzeFloor(
            @PathVariable Long floorId
    ) {
        return evacuationAnalysisService.analyzeFloor(floorId);
    }
}