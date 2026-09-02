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
      if (
        !graph.has(connection.fromNodeId) ||
        !graph.has(connection.toNodeId)
      ) {
        return;
      }

      graph
        .get(connection.fromNodeId)
        .push(connection.toNodeId);

      graph
        .get(connection.toNodeId)
        .push(connection.fromNodeId);
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
    return [startNodeId];
  }

  const queue = [startNodeId];
  const visited = new Set([startNodeId]);
  const previousNode = new Map();

  while (queue.length > 0) {
    const currentNodeId = queue.shift();

    const neighbours =
      graph.get(currentNodeId) || [];

    for (const neighbourId of neighbours) {
      if (visited.has(neighbourId)) {
        continue;
      }

      visited.add(neighbourId);

      previousNode.set(
        neighbourId,
        currentNodeId
      );

      if (neighbourId === targetNodeId) {
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

        return path;
      }

      queue.push(neighbourId);
    }
  }

  return null;
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

  const nodePathIds = findGraphPath({
    startNodeId: occupantNode.id,
    targetNodeId: exitNode.id,
    graph,
  });

  if (!nodePathIds) {
    return null;
  }

  const nodePoints = nodePathIds
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

  return [
    {
      x: occupant.x,
      y: occupant.y,
    },
    ...nodePoints,
    {
      x: exit.x,
      y: exit.y,
    },
  ];
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

            routingMode: 'ROUTE_GRAPH',

            points: graphRoute,
          };
        }

        /*
        * Υπήρχαν ασφαλείς exits σύμφωνα
        * με την evacuation analysis,
        * αλλά καμία δεν είναι προσβάσιμη
        * μέσω του Route Graph.
        */
        return null;
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