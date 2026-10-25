package com.talos.backend.service;

import com.talos.backend.entity.FloorElement;
import com.talos.backend.entity.RouteConnection;
import com.talos.backend.repository.FloorElementRepository;
import com.talos.backend.repository.RouteConnectionRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;

@Service
public class EvacuationAnalysisService {

    private final FloorElementRepository floorElementRepository;
    private final RouteConnectionRepository routeConnectionRepository;
    private final PathfindingService pathfindingService;

    public EvacuationAnalysisService(
            FloorElementRepository floorElementRepository,
            RouteConnectionRepository routeConnectionRepository,
            PathfindingService pathfindingService
    ) {
        this.floorElementRepository = floorElementRepository;
        this.routeConnectionRepository = routeConnectionRepository;
        this.pathfindingService = pathfindingService;
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

        // ==========================================
        // ΚΑΤΗΓΟΡΙΟΠΟΙΗΣΗ FLOOR ELEMENTS
        // ==========================================

        for (FloorElement element : elements) {

            if (element.getType() == null) {
                continue;
            }

            switch (element.getType().toUpperCase()) {

                case "EMPLOYEE":
                case "OCCUPANT":
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

        // ==========================================
        // ΔΙΑΘΕΣΙΜΕΣ ΕΞΟΔΟΙ
        // ==========================================

        List<FloorElement> availableExits = new ArrayList<>();

        for (FloorElement exit : exits) {

            boolean available =
                    Boolean.TRUE.equals(exit.getActive())
                            && !Boolean.TRUE.equals(exit.getDisabled())
                            && !"UNAVAILABLE".equalsIgnoreCase(
                                    exit.getStatus()
                            );

            if (available) {
                availableExits.add(exit);
            }
        }

        // ==========================================
        // ΔΙΑΘΕΣΙΜΕΣ ΣΥΝΔΕΣΕΙΣ
        // ==========================================

        List<RouteConnection> availableConnections =
                new ArrayList<>();

        for (RouteConnection connection : connections) {

            boolean available =
                    Boolean.TRUE.equals(connection.getActive())
                            && !"UNAVAILABLE".equalsIgnoreCase(
                                    connection.getStatus()
                            );

            if (available) {
                availableConnections.add(connection);
            }
        }

        // ==========================================
        // GRAPH
        // ==========================================

        Map<Long, List<Long>> graph =
                buildGraph(availableConnections);

        // ==========================================
        // ΒΑΣΙΚΑ ΑΠΟΤΕΛΕΣΜΑΤΑ
        // ==========================================

        Map<String, Object> result =
                new LinkedHashMap<>();

        result.put("floorId", floorId);
        result.put("employees", employees.size());
        result.put("exits", exits.size());
        result.put("availableExits", availableExits.size());
        result.put("routeNodes", routeNodes.size());
        result.put("firePoints", firePoints.size());
        result.put(
                "availableConnections",
                availableConnections.size()
        );

        // ==========================================
        // NORMAL
        // ==========================================

        if (firePoints.isEmpty()) {

            result.put("status", "NORMAL");

            result.put(
                    "message",
                    "Δεν έχει εντοπιστεί ενεργός κίνδυνος."
            );

            return result;
        }

        // ==========================================
        // NO SAFE EXIT
        // ==========================================

        if (availableExits.isEmpty()) {

            result.put(
                    "status",
                    "NO_SAFE_EXIT"
            );

            result.put(
                    "message",
                    "Δεν υπάρχει διαθέσιμη ασφαλής έξοδος."
            );

            result.put(
                    "instruction",
                    "Παραμείνετε στον χώρο, ακολουθήστε τις οδηγίες ασφαλείας και μην χρησιμοποιήσετε μη διαθέσιμες εξόδους."
            );

            return result;
        }

        // ==========================================
        // NO ROUTE
        // ==========================================

        if (availableConnections.isEmpty()) {

            result.put(
                    "status",
                    "NO_ROUTE"
            );

            result.put(
                    "message",
                    "Υπάρχει κίνδυνος, αλλά δεν υπάρχει διαθέσιμη διαδρομή εκκένωσης."
            );

            return result;
        }

        // ==========================================
        // EVACUATION REQUIRED
        // ==========================================

        result.put(
                "status",
                "EVACUATION_REQUIRED"
        );

        result.put(
                "message",
                "Εντοπίστηκε κίνδυνος. Υπολογίζεται η βέλτιστη διαδρομή εκκένωσης."
        );

        result.put(
                "graphNodes",
                graph.size()
        );

        // ==========================================
        // DIJKSTRA ΓΙΑ ΚΑΘΕ ΕΡΓΑΖΟΜΕΝΟ
        // ==========================================

        List<Map<String, Object>> evacuationRoutes =
                new ArrayList<>();

        for (FloorElement employee : employees) {

            FloorElement nearestEmployeeNode =
                    findNearestRouteNode(
                            employee,
                            routeNodes
                    );

            if (nearestEmployeeNode == null) {
                continue;
            }

            Map<String, Object> bestRoute =
                    findBestExit(
                            employee,
                            nearestEmployeeNode,
                            availableExits,
                            routeNodes,
                            availableConnections
                    );

            if (bestRoute != null) {
                evacuationRoutes.add(bestRoute);
            }
        }

        result.put(
                "evacuationRoutes",
                evacuationRoutes
        );

        return result;
    }

    // =====================================================
    // ΒΡΙΣΚΕΙ ΤΟ ΚΟΝΤΙΝΟΤΕΡΟ ROUTE NODE
    // =====================================================

    private FloorElement findNearestRouteNode(
            FloorElement element,
            List<FloorElement> routeNodes
    ) {

        FloorElement nearest = null;
        double minimumDistance =
                Double.POSITIVE_INFINITY;

        for (FloorElement node : routeNodes) {

            double distance =
                    calculateDistance(
                            element,
                            node
                    );

            if (distance < minimumDistance) {

                minimumDistance = distance;
                nearest = node;
            }
        }

        return nearest;
    }

    // =====================================================
    // ΒΡΙΣΚΕΙ ΤΗΝ ΚΑΛΥΤΕΡΗ ΕΞΟΔΟ ΜΕ DIJKSTRA
    // =====================================================

    private Map<String, Object> findBestExit(
            FloorElement employee,
            FloorElement employeeNode,
            List<FloorElement> exits,
            List<FloorElement> routeNodes,
            List<RouteConnection> connections
    ) {

        Map<String, Object> bestRoute = null;

        double bestDistance =
                Double.POSITIVE_INFINITY;

        for (FloorElement exit : exits) {

            FloorElement exitNode =
                    findNearestRouteNode(
                            exit,
                            routeNodes
                    );

            if (exitNode == null) {
                continue;
            }

            List<Long> path =
                    pathfindingService.findShortestPath(
                            employeeNode.getId(),
                            exitNode.getId(),
                            connections,
                            routeNodes
                    );

            if (path.isEmpty()) {
                continue;
            }

            double routeDistance =
                    calculatePathDistance(
                            path,
                            routeNodes
                    );

            /*
             * Προσθέτουμε και την απόσταση:
             *
             * Employee → πρώτο Route Node
             *
             * και
             *
             * τελευταίο Route Node → Exit
             */

            double employeeToNode =
                    calculateDistance(
                            employee,
                            employeeNode
                    );

            double nodeToExit =
                    calculateDistance(
                            exitNode,
                            exit
                    );

            double totalDistance =
                    employeeToNode
                            + routeDistance
                            + nodeToExit;

            if (totalDistance < bestDistance) {

                bestDistance = totalDistance;

                bestRoute =
                        new LinkedHashMap<>();

                bestRoute.put(
                        "employeeId",
                        employee.getId()
                );

                bestRoute.put(
                        "employeeName",
                        employee.getName()
                );

                bestRoute.put(
                        "startNodeId",
                        employeeNode.getId()
                );

                bestRoute.put(
                        "exitId",
                        exit.getId()
                );

                bestRoute.put(
                        "exitName",
                        exit.getName()
                );

                bestRoute.put(
                        "distance",
                        totalDistance
                );

                bestRoute.put(
                        "path",
                        path
                );
            }
        }

        return bestRoute;
    }

    // =====================================================
    // ΣΥΝΟΛΙΚΗ ΑΠΟΣΤΑΣΗ ROUTE
    // =====================================================

    private double calculatePathDistance(
            List<Long> path,
            List<FloorElement> routeNodes
    ) {

        double total = 0.0;

        Map<Long, FloorElement> nodeMap =
                new HashMap<>();

        for (FloorElement node : routeNodes) {

            if (node.getId() != null) {
                nodeMap.put(
                        node.getId(),
                        node
                );
            }
        }

        for (int i = 0; i < path.size() - 1; i++) {

            FloorElement first =
                    nodeMap.get(path.get(i));

            FloorElement second =
                    nodeMap.get(path.get(i + 1));

            if (first == null || second == null) {
                continue;
            }

            total += calculateDistance(
                    first,
                    second
            );
        }

        return total;
    }

    // =====================================================
    // ΕΥΚΛΕΙΔΕΙΑ ΑΠΟΣΤΑΣΗ
    // =====================================================

    private double calculateDistance(
            FloorElement first,
            FloorElement second
    ) {

        BigDecimal x1 = first.getX();
        BigDecimal y1 = first.getY();

        BigDecimal x2 = second.getX();
        BigDecimal y2 = second.getY();

        if (x1 == null
                || y1 == null
                || x2 == null
                || y2 == null) {

            return Double.POSITIVE_INFINITY;
        }

        double dx =
                x1.doubleValue()
                        - x2.doubleValue();

        double dy =
                y1.doubleValue()
                        - y2.doubleValue();

        return Math.sqrt(
                dx * dx + dy * dy
        );
    }

    // =====================================================
    // BUILD GRAPH
    // =====================================================

    private Map<Long, List<Long>> buildGraph(
            List<RouteConnection> connections
    ) {

        Map<Long, List<Long>> graph =
                new HashMap<>();

        for (RouteConnection connection : connections) {

            Long from =
                    connection.getFromNodeId();

            Long to =
                    connection.getToNodeId();

            if (from == null || to == null) {
                continue;
            }

            graph.computeIfAbsent(
                    from,
                    key -> new ArrayList<>()
            ).add(to);

            graph.computeIfAbsent(
                    to,
                    key -> new ArrayList<>()
            ).add(from);
        }

        return graph;
    }
}