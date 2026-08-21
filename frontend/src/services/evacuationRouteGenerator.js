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

function createRouteUsingNodes({
  occupant,
  exit,
  routeNodes,
}) {
  const availableRouteNodes = routeNodes.filter(
    (node) => node.status !== 'BLOCKED'
  );

  if (availableRouteNodes.length === 0) {
    return null;
  }

  const occupantNode = findNearestRouteNode(
    occupant,
    availableRouteNodes
  );

  const exitNode = findNearestRouteNode(
    exit,
    availableRouteNodes
  );

  if (!occupantNode || !exitNode) {
    return null;
  }

  /*
   * Πρώτη έκδοση Route Node routing.
   *
   * Προς το παρόν:
   * Occupant
   * → nearest occupant Route Node
   * → nearest exit Route Node
   * → Exit
   *
   * Στο επόμενο στάδιο θα προσθέσουμε πραγματικές
   * συνδέσεις μεταξύ των Route Nodes.
   */
  return [
    {
      x: occupant.x,
      y: occupant.y,
    },
    {
      x: occupantNode.x,
      y: occupantNode.y,
    },
    {
      x: exitNode.x,
      y: exitNode.y,
    },
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
  elements = []
) {
  if (!analysis?.success) {
    return [];
  }

  const routeNodes = elements.filter(
    (element) =>
      element.type === 'ROUTE_NODE'
  );

  return analysis.recommendations
    .filter(
      (recommendation) =>
        recommendation.action === 'EVACUATE' &&
        recommendation.recommendedExit
    )
    .map((recommendation) => {
      const occupant = recommendation.occupant;
      const exit = recommendation.recommendedExit;

      const nodeRoute = createRouteUsingNodes({
        occupant,
        exit,
        routeNodes,
      });

      const routePoints =
        nodeRoute ||
        createFallbackRoute(occupant, exit);

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

        routingMode: nodeRoute
          ? 'ROUTE_NODES'
          : 'FALLBACK',

        points: routePoints,
      };
    });
}