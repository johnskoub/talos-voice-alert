function clampPercentage(value) {
  return Math.min(100, Math.max(0, value));
}

// ============================================================
// DISTANCE / CALIBRATION
// ============================================================

function calculateCoordinateDistance(
  firstPoint,
  secondPoint
) {
  const horizontalDifference =
    secondPoint.x - firstPoint.x;

  const verticalDifference =
    secondPoint.y - firstPoint.y;

  return Math.sqrt(
    horizontalDifference ** 2 +
      verticalDifference ** 2
  );
}

/*
 * Τα Floor Elements αποθηκεύονται με x/y σε ποσοστά 0-100
 * πάνω στην κάτοψη.
 *
 * Εδώ:
 *
 * percentage
 *     ↓
 * intrinsic image pixels
 *     ↓
 * pixelsPerMeter
 *     ↓
 * πραγματικά μέτρα
 */
function pointToImagePixels(
  point,
  imageWidth,
  imageHeight
) {
  if (
    !point ||
    !Number.isFinite(imageWidth) ||
    !Number.isFinite(imageHeight) ||
    imageWidth <= 0 ||
    imageHeight <= 0
  ) {
    return null;
  }

  return {
    x: (Number(point.x) / 100) * imageWidth,
    y: (Number(point.y) / 100) * imageHeight,
  };
}

function calculateDistanceMeters(
  firstPoint,
  secondPoint,
  imageWidth,
  imageHeight,
  pixelsPerMeter
) {
  if (
    !Number.isFinite(pixelsPerMeter) ||
    pixelsPerMeter <= 0
  ) {
    return null;
  }

  const firstPixelPoint =
    pointToImagePixels(
      firstPoint,
      imageWidth,
      imageHeight
    );

  const secondPixelPoint =
    pointToImagePixels(
      secondPoint,
      imageWidth,
      imageHeight
    );

  if (
    !firstPixelPoint ||
    !secondPixelPoint
  ) {
    return null;
  }

  const pixelDistance =
    calculateCoordinateDistance(
      firstPixelPoint,
      secondPixelPoint
    );

  return pixelDistance / pixelsPerMeter;
}

function calculatePointToSegmentDistanceMeters(
  point,
  segmentStart,
  segmentEnd,
  imageWidth,
  imageHeight,
  pixelsPerMeter
) {
  const pointPixels =
    pointToImagePixels(
      point,
      imageWidth,
      imageHeight
    );

  const segmentStartPixels =
    pointToImagePixels(
      segmentStart,
      imageWidth,
      imageHeight
    );

  const segmentEndPixels =
    pointToImagePixels(
      segmentEnd,
      imageWidth,
      imageHeight
    );

  if (
    !pointPixels ||
    !segmentStartPixels ||
    !segmentEndPixels ||
    !Number.isFinite(pixelsPerMeter) ||
    pixelsPerMeter <= 0
  ) {
    return null;
  }

  const segmentX =
    segmentEndPixels.x -
    segmentStartPixels.x;

  const segmentY =
    segmentEndPixels.y -
    segmentStartPixels.y;

  const segmentLengthSquared =
    segmentX ** 2 +
    segmentY ** 2;

  if (segmentLengthSquared === 0) {
    return (
      calculateCoordinateDistance(
        pointPixels,
        segmentStartPixels
      ) / pixelsPerMeter
    );
  }

  const projection =
    (
      (pointPixels.x - segmentStartPixels.x) *
        segmentX +
      (pointPixels.y - segmentStartPixels.y) *
        segmentY
    ) / segmentLengthSquared;

  const clampedProjection =
    Math.max(
      0,
      Math.min(1, projection)
    );

  const closestPoint = {
    x:
      segmentStartPixels.x +
      clampedProjection * segmentX,

    y:
      segmentStartPixels.y +
      clampedProjection * segmentY,
  };

  return (
    calculateCoordinateDistance(
      pointPixels,
      closestPoint
    ) / pixelsPerMeter
  );
}

// ============================================================
// WALL COLLISION
// ============================================================

const WALL_CLEARANCE_PERCENT = 0.35;

function orientation(firstPoint, secondPoint, thirdPoint) {
  const value =
    (secondPoint.y - firstPoint.y) *
      (thirdPoint.x - secondPoint.x) -
    (secondPoint.x - firstPoint.x) *
      (thirdPoint.y - secondPoint.y);

  if (Math.abs(value) < 0.000001) {
    return 0;
  }

  return value > 0 ? 1 : 2;
}

function onSegment(firstPoint, secondPoint, point) {
  return (
    point.x >=
      Math.min(firstPoint.x, secondPoint.x) -
        WALL_CLEARANCE_PERCENT &&
    point.x <=
      Math.max(firstPoint.x, secondPoint.x) +
        WALL_CLEARANCE_PERCENT &&
    point.y >=
      Math.min(firstPoint.y, secondPoint.y) -
        WALL_CLEARANCE_PERCENT &&
    point.y <=
      Math.max(firstPoint.y, secondPoint.y) +
        WALL_CLEARANCE_PERCENT
  );
}

function segmentsIntersect(
  firstStart,
  firstEnd,
  secondStart,
  secondEnd
) {
  const firstOrientation = orientation(
    firstStart,
    firstEnd,
    secondStart
  );

  const secondOrientation = orientation(
    firstStart,
    firstEnd,
    secondEnd
  );

  const thirdOrientation = orientation(
    secondStart,
    secondEnd,
    firstStart
  );

  const fourthOrientation = orientation(
    secondStart,
    secondEnd,
    firstEnd
  );

  if (
    firstOrientation !== secondOrientation &&
    thirdOrientation !== fourthOrientation
  ) {
    return true;
  }

  if (
    firstOrientation === 0 &&
    onSegment(firstStart, firstEnd, secondStart)
  ) {
    return true;
  }

  if (
    secondOrientation === 0 &&
    onSegment(firstStart, firstEnd, secondEnd)
  ) {
    return true;
  }

  if (
    thirdOrientation === 0 &&
    onSegment(secondStart, secondEnd, firstStart)
  ) {
    return true;
  }

  if (
    fourthOrientation === 0 &&
    onSegment(secondStart, secondEnd, firstEnd)
  ) {
    return true;
  }

  return false;
}

function isRouteSegmentBlockedByWall(
  firstPoint,
  secondPoint,
  walls
) {
  if (!firstPoint || !secondPoint || walls.length === 0) {
    return false;
  }

  return walls.some((wall) => {
    if (wall.type !== 'WALL') {
      return false;
    }

    const wallStart = {
      x: Number(wall.startX),
      y: Number(wall.startY),
    };

    const wallEnd = {
      x: Number(wall.endX),
      y: Number(wall.endY),
    };

    return segmentsIntersect(
      firstPoint,
      secondPoint,
      wallStart,
      wallEnd
    );
  });
}

// ============================================================
// FIRE DISTANCES — ALL IN METERS
// ============================================================

const FIRE_NODE_BLOCKING_DISTANCE_METERS = 5;

const FIRE_CONNECTION_BLOCKING_DISTANCE_METERS = 7;

const FIRE_EXIT_APPROACH_DISTANCE_METERS = 9;

// ============================================================
// FIRE BLOCKING
// ============================================================

function isRouteNodeBlockedByFire(
  routeNode,
  firePoint,
  calibration
) {
  if (!firePoint) {
    return false;
  }

  const distanceFromFire =
    calculateDistanceMeters(
      routeNode,
      firePoint,
      calibration.imageWidth,
      calibration.imageHeight,
      calibration.pixelsPerMeter
    );

  if (distanceFromFire === null) {
    return false;
  }

  return (
    distanceFromFire <
    FIRE_NODE_BLOCKING_DISTANCE_METERS
  );
}

function isRouteConnectionBlockedByFire({
  connection,
  nodeById,
  firePoint,
  calibration,
}) {
  if (!firePoint) {
    return false;
  }

  const fromNode =
    nodeById.get(
      connection.fromNodeId
    );

  const toNode =
    nodeById.get(
      connection.toNodeId
    );

  if (!fromNode || !toNode) {
    return true;
  }

  const distanceFromFire =
    calculatePointToSegmentDistanceMeters(
      firePoint,
      fromNode,
      toNode,
      calibration.imageWidth,
      calibration.imageHeight,
      calibration.pixelsPerMeter
    );

  if (distanceFromFire === null) {
    return false;
  }

  return (
    distanceFromFire <
    FIRE_CONNECTION_BLOCKING_DISTANCE_METERS
  );
}

export function getFireBlockedRouteElements(
  elements = [],
  routeConnections = [],
  firePoint = null,
  floor = null
) {
  if (!firePoint) {
    return {
      blockedNodeIds: [],
      blockedConnectionIds: [],
    };
  }

  const calibration = {
    imageWidth:
      Number(floor?.imageWidth),
    imageHeight:
      Number(floor?.imageHeight),
    pixelsPerMeter:
      Number(floor?.pixelsPerMeter),
  };

  const routeNodes =
    elements.filter(
      (element) =>
        element.type === 'ROUTE_NODE'
    );

  const blockedNodeIds =
    routeNodes
      .filter((node) =>
        isRouteNodeBlockedByFire(
          node,
          firePoint,
          calibration
        )
      )
      .map((node) => node.id);

  const blockedNodeIdSet =
    new Set(blockedNodeIds);

  const nodeById =
    new Map(
      routeNodes.map((node) => [
        node.id,
        node,
      ])
    );

  const blockedConnectionIds =
    routeConnections
      .filter((connection) => {
        const touchesBlockedNode =
          blockedNodeIdSet.has(
            connection.fromNodeId
          ) ||
          blockedNodeIdSet.has(
            connection.toNodeId
          );

        const blockedByFire =
          isRouteConnectionBlockedByFire({
            connection,
            nodeById,
            firePoint,
            calibration,
          });

        return (
          touchesBlockedNode ||
          blockedByFire
        );
      })
      .map(
        (connection) =>
          connection.id
      );

  return {
    blockedNodeIds,
    blockedConnectionIds,
  };
}

// ============================================================
// ROUTE GRAPH
// ============================================================

function buildRouteGraph(
  routeNodes,
  routeConnections,
  firePoint,
  calibration,
  walls = []
) {
  const graph = new Map();

  const nodeById =
    new Map(
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
          calibration
        })
    )
    .filter((connection) => {
      const fromNode = nodeById.get(
        connection.fromNodeId
      );

      const toNode = nodeById.get(
        connection.toNodeId
      );

      if (!fromNode || !toNode) {
        return false;
      }

      return !isRouteSegmentBlockedByWall(
        fromNode,
        toNode,
        walls
      );
    })
    .forEach((connection) => {
      const fromNode =
        nodeById.get(
          connection.fromNodeId
        );

      const toNode =
        nodeById.get(
          connection.toNodeId
        );

      if (!fromNode || !toNode) {
        return;
      }

      if (
        !graph.has(
          connection.fromNodeId
        ) ||
        !graph.has(
          connection.toNodeId
        )
      ) {
        return;
      }

      const distance =
        calculateDistanceMeters(
          fromNode,
          toNode,
          calibration.imageWidth,
          calibration.imageHeight,
          calibration.pixelsPerMeter
        );

      if (distance === null) {
        return;
      }

      graph
        .get(connection.fromNodeId)
        .push({
          nodeId:
            connection.toNodeId,
          weight: distance,
        });

      graph
        .get(connection.toNodeId)
        .push({
          nodeId:
            connection.fromNodeId,
          weight: distance,
        });
    });

  return graph;
}

// ============================================================
// DIJKSTRA
// ============================================================

function findGraphPath({
  startNodeId,
  targetNodeId,
  graph,
}) {
  if (
    !startNodeId ||
    !targetNodeId
  ) {
    return null;
  }

  if (
    startNodeId === targetNodeId
  ) {
    return {
      nodeIds: [startNodeId],
      totalDistance: 0,
    };
  }

  const distances = new Map();
  const previousNode = new Map();
  const unvisited =
    new Set(graph.keys());

  graph.forEach(
    (_, nodeId) => {
      distances.set(
        nodeId,
        Number.POSITIVE_INFINITY
      );
    }
  );

  distances.set(
    startNodeId,
    0
  );

  while (unvisited.size > 0) {
    let currentNodeId = null;

    let currentDistance =
      Number.POSITIVE_INFINITY;

    for (const nodeId of unvisited) {
      const nodeDistance =
        distances.get(nodeId);

      if (
        nodeDistance <
        currentDistance
      ) {
        currentDistance =
          nodeDistance;

        currentNodeId =
          nodeId;
      }
    }

    if (
      currentNodeId === null ||
      currentDistance ===
        Number.POSITIVE_INFINITY
    ) {
      break;
    }

    if (
      currentNodeId ===
      targetNodeId
    ) {
      break;
    }

    unvisited.delete(
      currentNodeId
    );

    const neighbours =
      graph.get(
        currentNodeId
      ) || [];

    for (const neighbour of neighbours) {
      if (
        !unvisited.has(
          neighbour.nodeId
        )
      ) {
        continue;
      }

      const alternativeDistance =
        currentDistance +
        neighbour.weight;

      if (
        alternativeDistance <
        distances.get(
          neighbour.nodeId
        )
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
    distances.get(
      targetNodeId
    );

  if (
    targetDistance ===
    Number.POSITIVE_INFINITY
  ) {
    return null;
  }

  const path = [
    targetNodeId,
  ];

  let currentPathNode =
    targetNodeId;

  while (
    previousNode.has(
      currentPathNode
    )
  ) {
    currentPathNode =
      previousNode.get(
        currentPathNode
      );

    path.unshift(
      currentPathNode
    );
  }

  if (
    path[0] !== startNodeId
  ) {
    return null;
  }

  return {
    nodeIds: path,

    totalDistance:
      Number(
        targetDistance.toFixed(2)
      ),
  };
}

// ============================================================
// BEST GRAPH ROUTE
// ============================================================

function createRouteUsingGraph({
  occupant,
  exit,
  routeNodes,
  routeConnections,
  firePoint,
  calibration,
  walls = [],
}) {
  const availableRouteNodes =
    routeNodes.filter(
      (node) =>
        node.status !== 'BLOCKED' &&
        !isRouteNodeBlockedByFire(
          node,
          firePoint,
          calibration
        )
    );

  if (
    availableRouteNodes.length === 0
  ) {
    return null;
  }

  /*
   * Δεν παίρνουμε πλέον απλώς
   * τον πλησιέστερο Route Node.
   *
   * Δοκιμάζουμε κάθε διαθέσιμο node
   * ως πιθανό start/end node.
   *
   * Έτσι αποφεύγουμε την περίπτωση:
   *
   * "πλησιέστερο node = απομονωμένο"
   *
   * ενώ ένα λίγο πιο μακρινό node
   * οδηγεί σε πολύ καλύτερη διαδρομή.
   */

  const graph =
    buildRouteGraph(
      availableRouteNodes,
      routeConnections,
      firePoint,
      calibration,
      walls
    );

  let bestRoute = null;

  for (
    const occupantNode
    of availableRouteNodes
  ) {
    const occupantConnectionDistance =
      calculateDistanceMeters(
        occupant,
        occupantNode,
        calibration.imageWidth,
        calibration.imageHeight,
        calibration.pixelsPerMeter
      );

    if (
      occupantConnectionDistance === null
    ) {
      continue;
    }

    const occupantConnectionBlockedByWall =
      isRouteSegmentBlockedByWall(
        occupant,
        occupantNode,
        walls
      );

    const occupantConnectionBlockedByFire =
      firePoint &&
      calculatePointToSegmentDistanceMeters(
        firePoint,
        occupant,
        occupantNode,
        calibration.imageWidth,
        calibration.imageHeight,
        calibration.pixelsPerMeter
      ) <
        FIRE_NODE_BLOCKING_DISTANCE_METERS;

    if (
      occupantConnectionBlockedByFire ||
      occupantConnectionBlockedByWall
    ) {
      continue;
    }

    for (
      const exitNode
      of availableRouteNodes
    ) {
      const exitConnectionDistance =
        calculateDistanceMeters(
          exitNode,
          exit,
          calibration.imageWidth,
          calibration.imageHeight,
          calibration.pixelsPerMeter
        );

      if (
        exitConnectionDistance === null
      ) {
        continue;
      }

      const exitConnectionBlockedByFire =
        firePoint &&
        calculatePointToSegmentDistanceMeters(
          firePoint,
          exitNode,
          exit,
          calibration.imageWidth,
          calibration.imageHeight,
          calibration.pixelsPerMeter
        ) <
          FIRE_EXIT_APPROACH_DISTANCE_METERS;

      const exitConnectionBlockedByWall =
        isRouteSegmentBlockedByWall(
          exitNode,
          exit,
          walls
        );

      if (
        exitConnectionBlockedByFire ||
        exitConnectionBlockedByWall
      ) {
        continue;
      }

      const graphPath =
        findGraphPath({
          startNodeId:
            occupantNode.id,

          targetNodeId:
            exitNode.id,

          graph,
        });

      if (!graphPath) {
        continue;
      }

      const totalDistance =
        occupantConnectionDistance +
        graphPath.totalDistance +
        exitConnectionDistance;

      if (
        !bestRoute ||
        totalDistance <
          bestRoute.totalDistance
      ) {
        bestRoute = {
          occupantNode,
          exitNode,
          graphPath,

          totalDistance:
            Number(
              totalDistance.toFixed(2)
            ),
        };
      }
    }
  }

  if (!bestRoute) {
    return null;
  }

  const nodePoints =
    bestRoute.graphPath.nodeIds
      .map((nodeId) =>
        availableRouteNodes.find(
          (node) =>
            node.id === nodeId
        )
      )
      .filter(Boolean)
      .map((node) => ({
        x: node.x,
        y: node.y,
      }));

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

    totalDistance:
      bestRoute.totalDistance,

    startRouteNodeId:
      bestRoute.occupantNode.id,

    endRouteNodeId:
      bestRoute.exitNode.id,
  };
}

// ============================================================
// FALLBACK
// ============================================================

function createIntermediatePoint(
  occupant,
  exit
) {
  const horizontalDistance =
    Math.abs(
      exit.x - occupant.x
    );

  const verticalDistance =
    Math.abs(
      exit.y - occupant.y
    );

  if (
    horizontalDistance >=
    verticalDistance
  ) {
    return {
      x: clampPercentage(exit.x),
      y: clampPercentage(
        occupant.y
      ),
    };
  }

  return {
    x: clampPercentage(
      occupant.x
    ),
    y: clampPercentage(exit.y),
  };
}

function createFallbackRoute(
  occupant,
  exit,
  calibration
) {
  const intermediatePoint =
    createIntermediatePoint(
      occupant,
      exit
    );

  const totalDistance =
    calculateDistanceMeters(
      occupant,
      intermediatePoint,
      calibration.imageWidth,
      calibration.imageHeight,
      calibration.pixelsPerMeter
    ) +
    calculateDistanceMeters(
      intermediatePoint,
      exit,
      calibration.imageWidth,
      calibration.imageHeight,
      calibration.pixelsPerMeter
    );

  return {
    points: [
      {
        x: occupant.x,
        y: occupant.y,
      },

      intermediatePoint,

      {
        x: exit.x,
        y: exit.y,
      },
    ],

    totalDistance:
      totalDistance === null
        ? null
        : Number(
            totalDistance.toFixed(2)
          ),
  };
}

// ============================================================
// MAIN
// ============================================================

export function generateEvacuationRoutes(
  analysis,
  elements = [],
  routeConnections = [],
  floor = null
) {
  if (!analysis?.success) {
    return [];
  }

  const imageWidth =
    Number(floor?.imageWidth);

  const imageHeight =
    Number(floor?.imageHeight);

  const pixelsPerMeter =
    Number(
      floor?.pixelsPerMeter
    );

  const calibration = {
    imageWidth,
    imageHeight,
    pixelsPerMeter,
  };

  /*
   * Χωρίς calibration δεν μπορούμε
   * να ισχυριστούμε ότι η απόσταση
   * είναι πραγματικά σε μέτρα.
   */
  const hasValidCalibration =
    Number.isFinite(imageWidth) &&
    imageWidth > 0 &&
    Number.isFinite(imageHeight) &&
    imageHeight > 0 &&
    Number.isFinite(pixelsPerMeter) &&
    pixelsPerMeter > 0;

  if (!hasValidCalibration) {
    console.warn(
      'TALOS: Evacuation routing skipped because floor calibration is incomplete.',
      {
        imageWidth,
        imageHeight,
        pixelsPerMeter,
      }
    );

    return [];
  }

  const routeNodes =
    elements.filter(
      (element) =>
        element.type === 'ROUTE_NODE'
    );
  
  const walls =
    elements.filter(
      (element) =>
        element.type === 'WALL' &&
        element.status !== 'BLOCKED'
    );

  const exits =
    elements.filter(
      (element) =>
        element.type === 'EXIT'
    );

  const hasConfiguredRouteGraph =
    routeNodes.length > 0 &&
    routeConnections.length > 0;

  if (exits.length === 0) {
    return [];
  }

  /*
   * Πολύ σημαντικό:
   *
   * Δεν χρησιμοποιούμε πλέον
   * recommendation.alternatives ως
   * μοναδική λίστα εξόδων.
   *
   * Εξετάζουμε ΟΛΕΣ τις EXIT της κάτοψης.
   */
  return analysis.recommendations
    .filter(
      (recommendation) =>
        recommendation.action ===
        'EVACUATE'
    )
    .map((recommendation) => {
      const occupant =
        recommendation.occupant;

      if (!occupant) {
        return null;
      }

      /*
       * ======================================================
       * ROUTE GRAPH
       * ======================================================
       */

      if (
        hasConfiguredRouteGraph
      ) {
        const graphCandidates = [];

        const rejectedRouteExits = [];

        for (
          const exit
          of exits
        ) {
          const graphRoute =
            createRouteUsingGraph({
              occupant,
              exit,
              routeNodes,
              routeConnections,
              firePoint:
                analysis.firePoint,
              calibration,
              walls,
            });

          if (!graphRoute) {
            rejectedRouteExits.push({
              exitId: exit.id,

              exitName:
                exit.name?.trim() ||
                'Έξοδος κινδύνου',

              reason:
                'NO_SAFE_GRAPH_PATH',
            });

            continue;
          }

          graphCandidates.push({
            exit,
            route:
              graphRoute,
          });
        }

        if (
          graphCandidates.length === 0
        ) {
          return {
            id:
              `route-${occupant.id}-no-safe-exit`,

            occupantId:
              occupant.id,

            exitId: null,

            occupantName:
              occupant.name?.trim() ||
              'Παρευρισκόμενος',

            exitName: null,

            routingMode:
              'NO_SAFE_GRAPH_ROUTE',

            totalDistance: null,

            originalExitId:
              recommendation
                .recommendedExit?.id ??
              null,

            originalExitName:
              recommendation
                .recommendedExit?.name
                ?.trim() || null,

            usedAlternativeExit:
              false,

            rejectedRouteExits,

            points: [],
          };
        }

        /*
         * Η μικρότερη πραγματική
         * ασφαλής διαδρομή κερδίζει.
         */
        graphCandidates.sort(
          (
            firstCandidate,
            secondCandidate
          ) =>
            firstCandidate.route
              .totalDistance -
            secondCandidate.route
              .totalDistance
        );

        const bestCandidate =
          graphCandidates[0];

        const originalExit =
          recommendation
            .recommendedExit ??
          null;

        const usedAlternativeExit =
          Boolean(
            originalExit &&
            bestCandidate.exit.id !==
              originalExit.id
          );

        /*
         * Οι υπόλοιπες ασφαλείς έξοδοι
         * κρατούνται ως πραγματικές
         * εναλλακτικές, ταξινομημένες
         * κατά απόσταση.
         */
        const alternativeExits =
          graphCandidates
            .slice(1)
            .map(
              (candidate) => ({
                exitId:
                  candidate.exit.id,

                exitName:
                  candidate.exit.name
                    ?.trim() ||
                  'Έξοδος κινδύνου',

                totalDistance:
                  candidate.route
                    .totalDistance,
              })
            );

        return {
          id:
            `route-${occupant.id}-${bestCandidate.exit.id}`,

          occupantId:
            occupant.id,

          exitId:
            bestCandidate.exit.id,

          occupantName:
            occupant.name?.trim() ||
            'Παρευρισκόμενος',

          exitName:
            bestCandidate.exit.name
              ?.trim() ||
            'Έξοδος κινδύνου',

          routingMode:
            'ROUTE_GRAPH',

          totalDistance:
            bestCandidate.route
              .totalDistance,

          originalExitId:
            originalExit?.id ??
            null,

          originalExitName:
            originalExit?.name?.trim() ||
            null,

          usedAlternativeExit,

          startRouteNodeId:
            bestCandidate.route
              .startRouteNodeId,

          endRouteNodeId:
            bestCandidate.route
              .endRouteNodeId,

          alternativeExits,

          rejectedRouteExits,

          points:
            bestCandidate.route
              .points,
        };
      }

      /*
       * ======================================================
       * FALLBACK
       * ======================================================
       *
       * Αν δεν υπάρχει Route Graph,
       * χρησιμοποιούμε όλες τις εξόδους
       * και επιλέγουμε την πλησιέστερη.
       */

      const fallbackCandidates =
        exits
          .map((exit) => {
            const route =
              createFallbackRoute(
                occupant,
                exit,
                calibration
              );

            if (
              route.totalDistance === null
            ) {
              return null;
            }

            return {
              exit,
              route,
            };
          })
          .filter(Boolean);

      if (
        fallbackCandidates.length === 0
      ) {
        return null;
      }

      fallbackCandidates.sort(
        (
          firstCandidate,
          secondCandidate
        ) =>
          firstCandidate.route
            .totalDistance -
          secondCandidate.route
            .totalDistance
      );

      const bestFallback =
        fallbackCandidates[0];

      const originalExit =
        recommendation
          .recommendedExit ??
        null;

      return {
        id:
          `route-${occupant.id}-${bestFallback.exit.id}`,

        occupantId:
          occupant.id,

        exitId:
          bestFallback.exit.id,

        occupantName:
          occupant.name?.trim() ||
          'Παρευρισκόμενος',

        exitName:
          bestFallback.exit.name?.trim() ||
          'Έξοδος κινδύνου',

        routingMode:
          'FALLBACK',

        totalDistance:
          bestFallback.route
            .totalDistance,

        originalExitId:
          originalExit?.id ??
          null,

        originalExitName:
          originalExit?.name?.trim() ||
          null,

        usedAlternativeExit:
          Boolean(
            originalExit &&
            bestFallback.exit.id !==
              originalExit.id
          ),

        alternativeExits:
          fallbackCandidates
            .slice(1)
            .map(
              (candidate) => ({
                exitId:
                  candidate.exit.id,

                exitName:
                  candidate.exit.name
                    ?.trim() ||
                  'Έξοδος κινδύνου',

                totalDistance:
                  candidate.route
                    .totalDistance,
              })
            ),

        rejectedRouteExits: [],

        points:
          bestFallback.route.points,
      };
    })
    .filter(Boolean);
}