package com.talos.backend.service;

import com.talos.backend.entity.FloorElement;
import com.talos.backend.entity.RouteConnection;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;

@Service
public class PathfindingService {

    /**
     * Βρίσκει τη συντομότερη διαδρομή από ένα route node
     * προς ένα άλλο route node χρησιμοποιώντας Dijkstra.
     *
     * @param startNodeId αρχικός κόμβος
     * @param targetNodeId τελικός κόμβος
     * @param connections διαθέσιμες συνδέσεις
     * @param nodes route nodes με τις συντεταγμένες τους
     * @return λίστα με τα node IDs της συντομότερης διαδρομής
     */
    public List<Long> findShortestPath(
            Long startNodeId,
            Long targetNodeId,
            List<RouteConnection> connections,
            List<FloorElement> nodes
    ) {

        if (startNodeId == null || targetNodeId == null) {
            return Collections.emptyList();
        }

        if (startNodeId.equals(targetNodeId)) {
            return List.of(startNodeId);
        }

        /*
         * Αποθηκεύουμε τα route nodes με βάση το ID τους,
         * ώστε να μπορούμε γρήγορα να πάρουμε τις συντεταγμένες.
         */
        Map<Long, FloorElement> nodeMap = new HashMap<>();

        for (FloorElement node : nodes) {

            if (node.getId() == null) {
                continue;
            }

            if (node.getX() == null || node.getY() == null) {
                continue;
            }

            nodeMap.put(node.getId(), node);
        }

        if (!nodeMap.containsKey(startNodeId)
                || !nodeMap.containsKey(targetNodeId)) {

            return Collections.emptyList();
        }

        /*
         * Δημιουργία weighted graph.
         *
         * Κάθε connection αποτελεί ακμή.
         * Το βάρος της ακμής είναι η ευκλείδεια απόσταση
         * μεταξύ των δύο route nodes.
         */
        Map<Long, List<Edge>> graph = new HashMap<>();

        for (RouteConnection connection : connections) {

            Long from = connection.getFromNodeId();
            Long to = connection.getToNodeId();

            if (from == null || to == null) {
                continue;
            }

            if (!nodeMap.containsKey(from)
                    || !nodeMap.containsKey(to)) {
                continue;
            }

            double weight = calculateDistance(
                    nodeMap.get(from),
                    nodeMap.get(to)
            );

            graph.computeIfAbsent(from, key -> new ArrayList<>())
                    .add(new Edge(to, weight));

            /*
             * Οι διαδρομές στο TALOS θεωρούνται αμφίδρομες.
             */
            graph.computeIfAbsent(to, key -> new ArrayList<>())
                    .add(new Edge(from, weight));
        }

        /*
         * Dijkstra
         */

        Map<Long, Double> distances = new HashMap<>();
        Map<Long, Long> previous = new HashMap<>();

        for (Long nodeId : nodeMap.keySet()) {
            distances.put(nodeId, Double.POSITIVE_INFINITY);
        }

        distances.put(startNodeId, 0.0);

        /*
         * PriorityQueue:
         * Πάντα εξετάζουμε πρώτα τον κόμβο
         * με τη μικρότερη γνωστή απόσταση.
         */
        PriorityQueue<NodeDistance> queue =
                new PriorityQueue<>(
                        Comparator.comparingDouble(
                                NodeDistance::getDistance
                        )
                );

        queue.add(
                new NodeDistance(startNodeId, 0.0)
        );

        while (!queue.isEmpty()) {

            NodeDistance current = queue.poll();

            Long currentNode = current.getNodeId();
            double currentDistance = current.getDistance();

            /*
             * Αν έχουμε ήδη βρει μικρότερη απόσταση,
             * αγνοούμε αυτή την εγγραφή.
             */
            if (currentDistance > distances.get(currentNode)) {
                continue;
            }

            /*
             * Φτάσαμε στον προορισμό.
             */
            if (currentNode.equals(targetNodeId)) {
                break;
            }

            List<Edge> neighbors =
                    graph.getOrDefault(
                            currentNode,
                            Collections.emptyList()
                    );

            for (Edge edge : neighbors) {

                Long neighbor = edge.getTo();

                double newDistance =
                        currentDistance + edge.getWeight();

                if (newDistance < distances.getOrDefault(
                        neighbor,
                        Double.POSITIVE_INFINITY
                )) {

                    distances.put(
                            neighbor,
                            newDistance
                    );

                    previous.put(
                            neighbor,
                            currentNode
                    );

                    queue.add(
                            new NodeDistance(
                                    neighbor,
                                    newDistance
                            )
                    );
                }
            }
        }

        /*
         * Αν ο target παραμένει άπειρος,
         * δεν υπάρχει διαδρομή.
         */
        if (Double.isInfinite(
                distances.getOrDefault(
                        targetNodeId,
                        Double.POSITIVE_INFINITY
                )
        )) {

            return Collections.emptyList();
        }

        /*
         * Ανακατασκευή διαδρομής.
         *
         * target → previous → previous → start
         *
         * και στο τέλος αντιστροφή.
         */
        LinkedList<Long> path =
                new LinkedList<>();

        Long current = targetNodeId;

        while (current != null) {

            path.addFirst(current);

            if (current.equals(startNodeId)) {
                break;
            }

            current = previous.get(current);
        }

        /*
         * Ασφάλεια:
         * Αν για κάποιο λόγο δεν καταλήξαμε
         * στον αρχικό κόμβο, δεν υπάρχει έγκυρο path.
         */
        if (!path.isEmpty()
                && !path.getFirst().equals(startNodeId)) {

            return Collections.emptyList();
        }

        return path;
    }

    /**
     * Υπολογισμός ευκλείδειας απόστασης
     * μεταξύ δύο route nodes.
     */
    private double calculateDistance(
            FloorElement first,
            FloorElement second
    ) {

        BigDecimal x1 = first.getX();
        BigDecimal y1 = first.getY();

        BigDecimal x2 = second.getX();
        BigDecimal y2 = second.getY();

        double dx =
                x1.doubleValue() - x2.doubleValue();

        double dy =
                y1.doubleValue() - y2.doubleValue();

        return Math.sqrt(
                dx * dx + dy * dy
        );
    }

    /**
     * Μία ακμή του weighted graph.
     */
    private static class Edge {

        private final Long to;
        private final double weight;

        public Edge(Long to, double weight) {
            this.to = to;
            this.weight = weight;
        }

        public Long getTo() {
            return to;
        }

        public double getWeight() {
            return weight;
        }
    }

    /**
     * Αντικείμενο που χρησιμοποιεί το PriorityQueue.
     */
    private static class NodeDistance {

        private final Long nodeId;
        private final double distance;

        public NodeDistance(
                Long nodeId,
                double distance
        ) {
            this.nodeId = nodeId;
            this.distance = distance;
        }

        public Long getNodeId() {
            return nodeId;
        }

        public double getDistance() {
            return distance;
        }
    }
}