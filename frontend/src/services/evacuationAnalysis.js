import { findContainingZone } from '../utils/floorZoneUtils';

const MINIMUM_SAFE_FIRE_DISTANCE = 18;

function calculateDistance(firstPoint, secondPoint) {
  const horizontalDifference = secondPoint.x - firstPoint.x;
  const verticalDifference = secondPoint.y - firstPoint.y;

  return Math.sqrt(
    horizontalDifference ** 2 + verticalDifference ** 2
  );
}

function isExitOperational(exit) {
  return exit.status === 'AVAILABLE';
}

function isPointInsideZone(point, zone) {
  if (!point || !zone) {
    return false;
  }

  const zoneRight = zone.x + zone.width;
  const zoneBottom = zone.y + zone.height;

  return (
    point.x >= zone.x &&
    point.x <= zoneRight &&
    point.y >= zone.y &&
    point.y <= zoneBottom
  );
}

function evaluateExitSafety({
  exit,
  firePoint,
  fireZone,
  effectiveFireSide,
}) {
  const fireToExitDistance = calculateDistance(
    firePoint,
    exit
  );

  const exitIsOperational = isExitOperational(exit);

  const exitIsInsideFireZone = isPointInsideZone(
    exit,
    fireZone
  );

  const exitIsOnFireSide =
    Boolean(effectiveFireSide) &&
    Boolean(exit.side) &&
    effectiveFireSide === exit.side;

  const exitIsTooCloseToFire =
    fireToExitDistance < MINIMUM_SAFE_FIRE_DISTANCE;

  const rejectionReasons = [];

  if (!exitIsOperational) {
    rejectionReasons.push('EXIT_NOT_AVAILABLE');
  }

  if (exitIsInsideFireZone) {
    rejectionReasons.push('EXIT_INSIDE_FIRE_ZONE');
  }

  if (exitIsTooCloseToFire) {
    rejectionReasons.push('EXIT_TOO_CLOSE_TO_FIRE');
  }

  return {
    exit,
    safe: rejectionReasons.length === 0,
    fireToExitDistance: Number(
      fireToExitDistance.toFixed(2)
    ),
    exitIsOnFireSide,
    rejectionReasons,
  };
}

function calculateSafeExitScore({
  occupant,
  exitEvaluation,
}) {
  const occupantToExitDistance = calculateDistance(
    occupant,
    exitEvaluation.exit
  );

  /*
   * Όσο μικρότερη είναι η απόσταση του παρευρισκόμενου
   * από την ασφαλή έξοδο, τόσο μεγαλύτερο είναι το score.
   *
   * Η απόσταση της εξόδου από τη φωτιά λειτουργεί ως
   * πρόσθετο θετικό κριτήριο.
   */
  let score =
    exitEvaluation.fireToExitDistance * 1.5 -
    occupantToExitDistance;

  if (exitEvaluation.exitIsOnFireSide) {
    score -= 15;
  }

  return {
    exit: exitEvaluation.exit,
    score: Number(score.toFixed(2)),
    occupantToExitDistance: Number(
      occupantToExitDistance.toFixed(2)
    ),
    fireToExitDistance:
      exitEvaluation.fireToExitDistance,
  };
}

function createShelterRecommendation({
  occupant,
  occupantZone,
}) {
  return {
    action: 'SHELTER_IN_PLACE',
    occupant,
    occupantZone,
    recommendedExit: null,
    score: null,
    occupantToExitDistance: null,
    fireToExitDistance: null,
    alternatives: [],
    instruction:
      'Δεν υπάρχει ασφαλής έξοδος σύμφωνα με τους κανόνες της προσομοίωσης.',
  };
}

export function analyzeEvacuation(elements) {
  const occupants = elements.filter(
    (element) =>
      element.type === 'OCCUPANT' &&
      element.status !== 'EVACUATED'
  );

  const exits = elements.filter(
    (element) => element.type === 'EXIT'
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
      message: 'Δεν υπάρχει Fire Point στην κάτοψη.',
      recommendations: [],
      rejectedExits: [],
      safeExits: [],
    };
  }

  if (occupants.length === 0) {
    return {
      success: false,
      message:
        'Δεν υπάρχουν ενεργοί παρευρισκόμενοι στην κάτοψη.',
      recommendations: [],
      rejectedExits: [],
      safeExits: [],
    };
  }

  if (exits.length === 0) {
    return {
      success: false,
      message:
        'Δεν υπάρχει καταχωρισμένη έξοδος κινδύνου.',
      recommendations: [],
      rejectedExits: [],
      safeExits: [],
    };
  }

  const fireZone = findContainingZone(
    firePoint,
    elements
  );

  //Fire Point μέσα σε Server Room -> χρησιμοποιούμε την πλευρά της Server Room
  //Fire Point εκτός όλων των Zones -> δεν κάνουμε hard rejection βάσει EAST/WEST
  const effectiveFireSide =  
    fireZone?.side ?? null; 

  const exitSafetyEvaluations = exits.map((exit) =>
    evaluateExitSafety({
      exit,
      firePoint,
      fireZone,
      effectiveFireSide,
    })
  );

  const safeExitEvaluations =
    exitSafetyEvaluations.filter(
      (evaluation) => evaluation.safe
    );

  const rejectedExits =
    exitSafetyEvaluations.filter(
      (evaluation) => !evaluation.safe
    );

  const recommendations = occupants.map((occupant) => {
    const occupantZone = findContainingZone(
      occupant,
      elements
    );

    if (safeExitEvaluations.length === 0) {
      return createShelterRecommendation({
        occupant,
        occupantZone,
      });
    }

    const exitEvaluations = safeExitEvaluations
      .map((exitEvaluation) =>
        calculateSafeExitScore({
          occupant,
          exitEvaluation,
        })
      )
      .sort(
        (firstEvaluation, secondEvaluation) =>
          secondEvaluation.score - firstEvaluation.score
      );

    const bestEvaluation = exitEvaluations[0];

    return {
      action: 'EVACUATE',
      occupant,
      occupantZone,
      recommendedExit: bestEvaluation.exit,
      score: bestEvaluation.score,
      occupantToExitDistance:
        bestEvaluation.occupantToExitDistance,
      fireToExitDistance:
        bestEvaluation.fireToExitDistance,
      alternatives: exitEvaluations,
      instruction:
        'Κατευθυνθείτε προς την προτεινόμενη ασφαλή έξοδο.',
    };
  });

  return {
    success: true,
    firePoint,
    fireZone,
    effectiveFireSide,
    disabledElevators,
    safeExits: safeExitEvaluations,
    rejectedExits,
    recommendations,
  };
}