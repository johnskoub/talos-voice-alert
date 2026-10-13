package com.talos.backend.service;

import com.talos.backend.entity.FloorElement;
import com.talos.backend.entity.RouteConnection;
import com.talos.backend.repository.FloorElementRepository;
import com.talos.backend.repository.RouteConnectionRepository;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class EvacuationAnalysisService {

    private final FloorElementRepository floorElementRepository;
    private final RouteConnectionRepository routeConnectionRepository;

    public EvacuationAnalysisService(
            FloorElementRepository floorElementRepository,
            RouteConnectionRepository routeConnectionRepository
    ) {
        this.floorElementRepository = floorElementRepository;
        this.routeConnectionRepository = routeConnectionRepository;
    }

    public Map<String, Object> analyzeFloor(Long floorId) {

        List<FloorElement> elements =
                floorElementRepository.findByFloorIdAndActiveTrue(floorId);

        List<RouteConnection> connections =
                routeConnectionRepository.findByFloorIdAndActiveTrue(floorId);

        List<FloorElement> employees = new ArrayList<>();
        List<FloorElement> exits = new ArrayList<>();
        List<FloorElement> routeNodes = new ArrayList<>();
        List<FloorElement> firePoints = new ArrayList<>();

        for (FloorElement element : elements) {

            if (element.getType() == null) {
                continue;
            }

            switch (element.getType().toUpperCase()) {

                case "EMPLOYEE":
                    employees.add(element);
                    break;

                case "EXIT":
                    exits.add(element);
                    break;

                case "ROUTE_NODE":
                    routeNodes.add(element);
                    break;

                case "FIRE_POINT":
                    firePoints.add(element);
                    break;

                default:
                    break;
            }
        }

        List<FloorElement> availableExits = new ArrayList<>();

        for (FloorElement exit : exits) {

            boolean available =
                    exit.getActive() != null
                            && exit.getActive()
                            && !Boolean.TRUE.equals(exit.getDisabled())
                            && !"UNAVAILABLE".equalsIgnoreCase(exit.getStatus());

            if (available) {
                availableExits.add(exit);
            }
        }

        List<RouteConnection> availableConnections = new ArrayList<>();

        for (RouteConnection connection : connections) {

            boolean available =
                    connection.getActive() != null
                            && connection.getActive()
                            && !"UNAVAILABLE".equalsIgnoreCase(connection.getStatus());

            if (available) {
                availableConnections.add(connection);
            }
        }

        Map<Long, List<Long>> graph = buildGraph(availableConnections);

        Map<String, Object> result = new LinkedHashMap<>();

        result.put("floorId", floorId);
        result.put("employees", employees.size());
        result.put("exits", exits.size());
        result.put("availableExits", availableExits.size());
        result.put("routeNodes", routeNodes.size());
        result.put("firePoints", firePoints.size());
        result.put("availableConnections", availableConnections.size());

        if (firePoints.isEmpty()) {

            result.put("status", "NORMAL");
            result.put(
                    "message",
                    "Δεν έχει εντοπιστεί ενεργό σημείο κινδύνου."
            );

            return result;
        }

        if (availableExits.isEmpty()) {

            result.put("status", "NO_SAFE_EXIT");
            result.put(
                    "message",
                    "Δεν υπάρχει διαθέσιμη έξοδος εκκένωσης."
            );

            result.put(
                    "instruction",
                    "Παραμείνετε στον χώρο, κλείστε τις πόρτες και μην χρησιμοποιήσετε τους ανελκυστήρες."
            );

            return result;
        }

        if (availableConnections.isEmpty()) {

            result.put("status", "NO_ROUTE");
            result.put(
                    "message",
                    "Υπάρχει διαθέσιμη έξοδος, αλλά δεν υπάρχει διαθέσιμο route connection."
            );

            return result;
        }

        result.put("status", "EVACUATION_REQUIRED");

        result.put(
                "message",
                "Εντοπίστηκε κίνδυνος. Υπάρχει διαθέσιμη διαδρομή εκκένωσης."
        );

        result.put(
                "graphNodes",
                graph.size()
        );

        return result;
    }

    private Map<Long, List<Long>> buildGraph(
            List<RouteConnection> connections
    ) {

        Map<Long, List<Long>> graph = new HashMap<>();

        for (RouteConnection connection : connections) {

            Long from = connection.getFromNodeId();
            Long to = connection.getToNodeId();

            if (from == null || to == null) {
                continue;
            }

            graph.computeIfAbsent(from, key -> new ArrayList<>())
                    .add(to);

            graph.computeIfAbsent(to, key -> new ArrayList<>())
                    .add(from);
        }

        return graph;
    }
}