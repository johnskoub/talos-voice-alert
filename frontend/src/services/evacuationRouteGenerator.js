function clampPercentage(value) {
  return Math.min(100, Math.max(0, value));
}

function calculateDistance(firstPoint, secondPoint) {
  const horizontalDifference =
    secondPoint.x - firstPoint.x;

  const verticalDifference =
    secondPoint.y - firstPoint.y;

  return Math.sqrt(
    horizontalDifference ** 2 +
      verticalDifference ** 2
  );
}

function calculatePointToSegmentDistance(
  point,
  segmentStart,
  segmentEnd
) {
  const segmentX =
    segmentEnd.x - segmentStart.x;

  const segmentY =
    segmentEnd.y - segmentStart.y;

  const segmentLengthSquared =
    segmentX ** 2 + segmentY ** 2;

  if (segmentLengthSquared === 0) {
    return calculateDistance(
      point,
      segmentStart
    );
  }

  const projection =
    (
      (point.x - segmentStart.x) * segmentX +
      (point.y - segmentStart.y) * segmentY
    ) / segmentLengthSquared;

  const clampedProjection =
    Math.max(0, Math.min(1, projection));

  const closestPoint = {
    x:
      segmentStart.x +
      clampedProjection * segmentX,
    y:
      segmentStart.y +
      clampedProjection * segmentY,
  };

  return calculateDistance(
    point,
    closestPoint
  );
}

const FIRE_BLOCKING_DISTANCE = 5;
function isRouteNodeBlockedByFire(
  routeNode,
  firePoint
) {
  if (!firePoint) {
    return false;
  }

  const distanceFromFire =
    calculateDistance(
      routeNode,
      firePoint
    );

  return (
    distanceFromFire <
    FIRE_BLOCKING_DISTANCE
  );
}

function isRouteConnectionBlockedByFire({
  connection,
  nodeById,
  firePoint,
}) {
  if (!firePoint) {
    return false;
  }

  const fromNode =
    nodeById.get(connection.fromNodeId);

  const toNode =
    nodeById.get(connection.toNodeId);

  if (!fromNode || !toNode) {
    return true;
  }

  const distanceFromFire =
    calculatePointToSegmentDistance(
      firePoint,
      fromNode,
      toNode
    );

  return (
    distanceFromFire <
    FIRE_BLOCKING_DISTANCE
  );
}

function createIntermediatePoint(occupant, exit) {
  const horizontalDistance = Math.abs(
    exit.x - occupant.x
  );

  const verticalDistance = Math.abs(
    exit.y - occupant.y
  );

  if (horizontalDistance >= verticalDistance) {
    return {
      x: clampPercentage(exit.x),
      y: clampPercentage(occupant.y),
    };
  }

  return {
    x: clampPercentage(occupant.x),
    y: clampPercentage(exit.y),
  };
}

function findNearestRouteNode(point, routeNodes) {
  if (!point || routeNodes.length === 0) {
    return null;
  }

  return routeNodes.reduce(
    (nearestNode, currentNode) => {
      if (!nearestNode) {
        return currentNode;
      }

      const currentDistance =
        calculateDistance(point, currentNode);

      const nearestDistance =
        calculateDistance(point, nearestNode);

      return currentDistance < nearestDistance
        ? currentNode
        : nearestNode;
    },
    null
  );
}

function buildRouteGraph(
  routeNodes,
  routeConnections,
  firePoint
) {
  const graph = new Map();

  const nodeById = new Map(
    routeNodes.map((node) => [
      node.id,
      node,
    ])
  );

  routeNodes.forEach((node) => {
    graph.set(node.id, []);
  });

  routeConnections
    .filter(
      (connection) =>
        connection.status !== 'BLOCKED'
    )
    .filter(
      (connection) =>
        !isRouteConnectionBlockedByFire({
          connection,
          nodeById,
          firePoint,
        })
    )
    .forEach((connection) => {
      const fromNode =
        nodeById.get(connection.fromNodeId);

      const toNode =
        nodeById.get(connection.toNodeId);

      if (!fromNode || !toNode) {
        return;
      }

      if (
        !graph.has(connection.fromNodeId) ||
        !graph.has(connection.toNodeId)
      ) {
        return;
      }

      const distance =
        calculateDistance(
          fromNode,
          toNode
        );

      graph
        .get(connection.fromNodeId)
        .push({
          nodeId: connection.toNodeId,
          weight: distance,
        });

      graph
        .get(connection.toNodeId)
        .push({
          nodeId: connection.fromNodeId,
          weight: distance,
        });
    });

  return graph;
}

function findGraphPath({
  startNodeId,
  targetNodeId,
  graph,
}) {
  if (!startNodeId || !targetNodeId) {
    return null;
  }

  if (startNodeId === targetNodeId) {
    return {
      nodeIds: [startNodeId],
      totalDistance: 0,
    };
  }

  const distances = new Map();
  const previousNode = new Map();
  const unvisited = new Set(
    graph.keys()
  );

  graph.forEach((_, nodeId) => {
    distances.set(
      nodeId,
      Number.POSITIVE_INFINITY
    );
  });

  distances.set(startNodeId, 0);

  while (unvisited.size > 0) {
    let currentNodeId = null;
    let currentDistance =
      Number.POSITIVE_INFINITY;

    for (const nodeId of unvisited) {
      const nodeDistance =
        distances.get(nodeId);

      if (nodeDistance < currentDistance) {
        currentDistance = nodeDistance;
        currentNodeId = nodeId;
      }
    }

    if (
      currentNodeId === null ||
      currentDistance ===
        Number.POSITIVE_INFINITY
    ) {
      break;
    }

    if (currentNodeId === targetNodeId) {
      break;
    }

    unvisited.delete(currentNodeId);

    const neighbours =
      graph.get(currentNodeId) || [];

    for (const neighbour of neighbours) {
      if (!unvisited.has(neighbour.nodeId)) {
        continue;
      }

      const alternativeDistance =
        currentDistance +
        neighbour.weight;

      if (
        alternativeDistance <
        distances.get(neighbour.nodeId)
      ) {
        distances.set(
          neighbour.nodeId,
          alternativeDistance
        );

        previousNode.set(
          neighbour.nodeId,
          currentNodeId
        );
      }
    }
  }

  const targetDistance =
    distances.get(targetNodeId);

  if (
    targetDistance ===
    Number.POSITIVE_INFINITY
  ) {
    return null;
  }

  const path = [targetNodeId];

  let currentPathNode =
    targetNodeId;

  while (
    previousNode.has(currentPathNode)
  ) {
    currentPathNode =
      previousNode.get(currentPathNode);

    path.unshift(currentPathNode);
  }

  if (path[0] !== startNodeId) {
    return null;
  }

  return {
    nodeIds: path,
    totalDistance: Number(
      targetDistance.toFixed(2)
    ),
  };
}

function createRouteUsingGraph({
  occupant,
  exit,
  routeNodes,
  routeConnections,
  firePoint,
}) {
  const availableRouteNodes =
    routeNodes.filter(
      (node) =>
        node.status !== 'BLOCKED' &&
        !isRouteNodeBlockedByFire(
          node,
          firePoint
        )
    );

  if (availableRouteNodes.length === 0) {
    return null;
  }

  const occupantNode =
    findNearestRouteNode(
      occupant,
      availableRouteNodes
    );

  const exitNode =
    findNearestRouteNode(
      exit,
      availableRouteNodes
    );

  if (!occupantNode || !exitNode) {
    return null;
  }

  const graph = buildRouteGraph(
    availableRouteNodes,
    routeConnections,
    firePoint
  );

  const graphPath = findGraphPath({
    startNodeId: occupantNode.id,
    targetNodeId: exitNode.id,
    graph,
  });

  if (!graphPath) {
    return null;
  }

  const nodePoints = graphPath.nodeIds
    .map((nodeId) =>
      availableRouteNodes.find(
        (node) => node.id === nodeId
      )
    )
    .filter(Boolean)
    .map((node) => ({
      x: node.x,
      y: node.y,
    }));

  const occupantToStartNodeDistance =
    calculateDistance(
      occupant,
      occupantNode
    );

  const exitNodeToExitDistance =
    calculateDistance(
      exitNode,
      exit
    );

  const totalDistance =
    occupantToStartNodeDistance +
    graphPath.totalDistance +
    exitNodeToExitDistance;

  return {
    points: [
      {
        x: occupant.x,
        y: occupant.y,
      },
      ...nodePoints,
      {
        x: exit.x,
        y: exit.y,
      },
    ],

    totalDistance: Number(
      totalDistance.toFixed(2)
    ),
  };
}

function createFallbackRoute(occupant, exit) {
  const intermediatePoint =
    createIntermediatePoint(occupant, exit);

  return [
    {
      x: occupant.x,
      y: occupant.y,
    },
    intermediatePoint,
    {
      x: exit.x,
      y: exit.y,
    },
  ];
}

export function generateEvacuationRoutes(
  analysis,
  elements = [],
  routeConnections = []
) {
  if (!analysis?.success) {
    return [];
  }

  const routeNodes = elements.filter(
    (element) =>
      element.type === 'ROUTE_NODE'
  );

  const hasConfiguredRouteGraph =
  routeNodes.length > 0 &&
  routeConnections.length > 0;

  return analysis.recommendations
    .filter(
      (recommendation) =>
        recommendation.action === 'EVACUATE' &&
        recommendation.recommendedExit
    )
    .map((recommendation) => {
      const occupant =
        recommendation.occupant;

      const candidateExits =
        recommendation.alternatives?.length > 0
          ? recommendation.alternatives
          : recommendation.recommendedExit
            ? [
                {
                  exit:
                    recommendation.recommendedExit,
                },
              ]
            : [];

      if (candidateExits.length === 0) {
        return null;
      }

      /*
      * Αν υπάρχει Route Graph, δοκιμάζουμε
      * κάθε ασφαλή έξοδο με σειρά score.
      *
      * Η πρώτη έξοδος που έχει πραγματικό
      * fire-safe graph path επιλέγεται.
      */
      if (hasConfiguredRouteGraph) {
        const graphCandidates = [];

        for (const candidate of candidateExits) {
          const exit = candidate.exit;

          if (!exit) {
            continue;
          }

          const graphRoute =
            createRouteUsingGraph({
              occupant,
              exit,
              routeNodes,
              routeConnections,
              firePoint: analysis.firePoint,
            });

          if (!graphRoute) {
            continue;
          }

          graphCandidates.push({
            exit,
            route: graphRoute,
          });
        }

        console.table(
          graphCandidates.map((candidate) => ({
            occupant:
              occupant.name?.trim() ||
              'Παρευρισκόμενος',

            exit:
              candidate.exit.name?.trim() ||
              'Έξοδος κινδύνου',

            totalDistance:
              candidate.route.totalDistance,
          }))
        );

        if (graphCandidates.length === 0) {
          return null;
        }

        graphCandidates.sort(
          (firstCandidate, secondCandidate) =>
            firstCandidate.route.totalDistance -
            secondCandidate.route.totalDistance
        );

        const bestCandidate =
          graphCandidates[0];

        return {
          id: `route-${occupant.id}-${bestCandidate.exit.id}`,
          occupantId: occupant.id,
          exitId: bestCandidate.exit.id,

          occupantName:
            occupant.name?.trim() ||
            'Παρευρισκόμενος',

          exitName:
            bestCandidate.exit.name?.trim() ||
            'Έξοδος κινδύνου',

          routingMode: 'ROUTE_GRAPH',

          totalDistance:
            bestCandidate.route.totalDistance,

          points:
            bestCandidate.route.points,
        };
      }

      /*
      * Fallback επιτρέπεται μόνο σε όροφο
      * χωρίς διαμορφωμένο Route Graph.
      */
      const exit =
        candidateExits[0].exit;

      if (!exit) {
        return null;
      }

      const routePoints =
        createFallbackRoute(
          occupant,
          exit
        );

      return {
        id: `route-${occupant.id}-${exit.id}`,
        occupantId: occupant.id,
        exitId: exit.id,

        occupantName:
          occupant.name?.trim() ||
          'Παρευρισκόμενος',

        exitName:
          exit.name?.trim() ||
          'Έξοδος κινδύνου',

        routingMode: 'FALLBACK',

        points: routePoints,
      };
    })
    .filter(Boolean);
    }