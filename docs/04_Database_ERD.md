# TALOS Evacuation Platform — Database Design

## Main Entities

Administrator

↓

Company

↓

Floor

↓

FloorPlan

↓

Occupant

EmergencyExit

Hazard

EvacuationScenario

EvacuationInstruction

## Relationships

Administrator (1) ---- (N) Company

Company (1) ---- (N) Floor

Floor (1) ---- (1) FloorPlan

Floor (1) ---- (N) Occupant

Floor (1) ---- (N) EmergencyExit

Floor (1) ---- (N) Hazard

Floor (1) ---- (N) EvacuationScenario

EvacuationScenario (1) ---- (N) EvacuationInstruction