# TALOS Evacuation Platform — System Design

## 1. Purpose

The TALOS Evacuation Platform is a web-based educational evacuation
management and simulation platform.

It allows an administrator to manage multiple companies, buildings,
floors, floor plans, occupants, emergency exits and fire hazards.

The platform calculates evacuation recommendations and produces simulated
voice guidance.

## 2. Architecture

The first version follows a modular monolith architecture.

- React frontend
- Java Spring Boot backend
- MySQL database
- REST API communication
- Browser Speech Synthesis for voice output

## 3. Main Modules

- Authentication
- Companies
- Floors
- Floor Plans
- Occupants
- Emergency Exits
- Hazards
- Evacuation Scenarios
- Voice Announcements
- Audit Logs

## 4. Main User Flow

1. Administrator signs in.
2. Administrator views the companies dashboard.
3. Administrator selects a company.
4. Administrator selects a floor.
5. The floor plan editor opens.
6. Occupants, exits, hazards, walls and obstacles are positioned.
7. An evacuation simulation is started.
8. The system calculates recommended exits and routes.
9. Visual and voice instructions are produced.

## 5. Floor Plan Representation

The system combines:

- A floor plan background image
- Structured objects with coordinates
- Walls and obstacles
- Occupants
- Emergency exits
- Hazards
- Calculated evacuation routes

Coordinates are stored as percentages so that the floor plan remains
responsive on different screen sizes.

## 6. Floor Plan Tools

- Select
- Occupant
- Emergency Exit
- Fire
- Wall
- Obstacle
- Delete

## 7. Safety Scope

The first version is an educational evacuation simulation platform.

It is not a certified fire-safety system and must not replace official
evacuation procedures, emergency services or legally approved fire-safety
plans.

## 8. Planned Future Extensions

- A* pathfinding
- Firebase notifications
- Mobile application
- IoT sensor integration
- Real-time occupant positioning
- Microservice architecture