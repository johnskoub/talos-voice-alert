function clampPercentage(value) {
  return Math.min(100, Math.max(0, value));
}

function createIntermediatePoint(occupant, exit) {
  const horizontalDistance = Math.abs(exit.x - occupant.x);
  const verticalDistance = Math.abs(exit.y - occupant.y);

  /*
   * Δημιουργούμε μια απλή ορθογώνια διαδρομή.
   *
   * Αν η οριζόντια απόσταση είναι μεγαλύτερη:
   * πρώτα κινούμαστε οριζόντια και μετά κατακόρυφα.
   *
   * Διαφορετικά:
   * πρώτα κινούμαστε κατακόρυφα και μετά οριζόντια.
   */
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

export function generateEvacuationRoutes(analysis) {
  if (!analysis?.success) {
    return [];
  }

  return analysis.recommendations.map((recommendation) => {
    const occupant = recommendation.occupant;
    const exit = recommendation.recommendedExit;

    const intermediatePoint = createIntermediatePoint(
      occupant,
      exit
    );

    return {
      id: `route-${occupant.id}-${exit.id}`,
      occupantId: occupant.id,
      exitId: exit.id,
      occupantName:
        occupant.name?.trim() || 'Παρευρισκόμενος',
      exitName:
        exit.name?.trim() || 'Έξοδος κινδύνου',

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
    };
  });
}