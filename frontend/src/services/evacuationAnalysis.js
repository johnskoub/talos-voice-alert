import { findContainingZone } from '../utils/floorZoneUtils';

function calculateDistance(firstPoint, secondPoint) {
  const horizontalDifference = secondPoint.x - firstPoint.x;
  const verticalDifference = secondPoint.y - firstPoint.y;

  return Math.sqrt(
    horizontalDifference ** 2 + verticalDifference ** 2
  );
}

function isExitUsable(exit) {
  return exit.status === 'AVAILABLE';
}

function calculateExitScore({
  occupant,
  exit,
  firePoint,
  fireZone,
}) {
  const occupantToExitDistance = calculateDistance(
    occupant,
    exit
  );

  const fireToExitDistance = calculateDistance(
    firePoint,
    exit
  );

  let score =
    fireToExitDistance * 1.5 -
    occupantToExitDistance;

  const exitIsOnFireSide =
    firePoint.side &&
    exit.side &&
    firePoint.side === exit.side;

  if (exitIsOnFireSide) {
    score -= 100;
  }

  const exitIsInsideFireZone =
    fireZone &&
    exit.x >= fireZone.x &&
    exit.x <= fireZone.x + fireZone.width &&
    exit.y >= fireZone.y &&
    exit.y <= fireZone.y + fireZone.height;

  if (exitIsInsideFireZone) {
    score -= 200;
  }

  return {
    exit,
    score: Number(score.toFixed(2)),
    occupantToExitDistance: Number(
      occupantToExitDistance.toFixed(2)
    ),
    fireToExitDistance: Number(
      fireToExitDistance.toFixed(2)
    ),
    exitIsOnFireSide,
    exitIsInsideFireZone,
  };
}

export function analyzeEvacuation(elements) {
  const occupants = elements.filter(
    (element) =>
      element.type === 'OCCUPANT' &&
      element.status !== 'EVACUATED'
  );

  const exits = elements.filter(
    (element) =>
      element.type === 'EXIT' &&
      isExitUsable(element)
  );

  const firePoints = elements.filter(
    (element) => element.type === 'FIRE_POINT'
  );

  const disabledElevators = elements.filter(
    (element) =>
      element.type === 'ELEVATOR' &&
      element.disabledDuringFire
  );

  const firePoint = firePoints[0] ?? null;

  if (!firePoint) {
    return {
      success: false,
      message:
        'Δεν υπάρχει Fire Point στην κάτοψη.',
      recommendations: [],
    };
  }

  if (occupants.length === 0) {
    return {
      success: false,
      message:
        'Δεν υπάρχουν ενεργοί παρευρισκόμενοι στην κάτοψη.',
      recommendations: [],
    };
  }

  if (exits.length === 0) {
    return {
      success: false,
      message:
        'Δεν υπάρχει διαθέσιμη έξοδος κινδύνου.',
      recommendations: [],
    };
  }

  const fireZone = findContainingZone(
    firePoint,
    elements
  );

  const recommendations = occupants.map((occupant) => {
    const occupantZone = findContainingZone(
      occupant,
      elements
    );

    const exitEvaluations = exits
      .map((exit) =>
        calculateExitScore({
          occupant,
          exit,
          firePoint,
          fireZone,
        })
      )
      .sort((first, second) => second.score - first.score);

    const bestEvaluation = exitEvaluations[0];

    return {
      occupant,
      occupantZone,
      recommendedExit: bestEvaluation.exit,
      score: bestEvaluation.score,
      occupantToExitDistance:
        bestEvaluation.occupantToExitDistance,
      fireToExitDistance:
        bestEvaluation.fireToExitDistance,
      alternatives: exitEvaluations,
    };
  });

  return {
    success: true,
    firePoint,
    fireZone,
    disabledElevators,
    recommendations,
  };
}