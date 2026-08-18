function getElementName(element, fallback) {
  return element?.name?.trim() || fallback;
}

function getZoneName(zone, fallback = 'άγνωστη περιοχή') {
  return zone?.name?.trim() || fallback;
}

function getSideLabel(side) {
  const sideLabels = {
    NORTH: 'βόρεια',
    SOUTH: 'νότια',
    EAST: 'ανατολική',
    WEST: 'δυτική',
    CENTER: 'κεντρική',
  };

  return sideLabels[side] || null;
}

function buildEvacuationMessage(analysis) {
  const fireZoneName = getZoneName(
    analysis.fireZone,
    analysis.firePoint?.area || 'άγνωστη περιοχή'
  );

  const fireSide = getSideLabel(
    analysis.effectiveFireSide
  );

  const safeRecommendations =
    analysis.recommendations.filter(
      (recommendation) =>
        recommendation.action === 'EVACUATE' &&
        recommendation.recommendedExit
    );

  const recommendedExitNames = [
    ...new Set(
      safeRecommendations.map((recommendation) =>
        getElementName(
          recommendation.recommendedExit,
          'έξοδο κινδύνου'
        )
      )
    ),
  ];

  let message = `Προσοχή. Έχει εντοπιστεί πυρκαγιά στην περιοχή ${fireZoneName}.`;

  if (fireSide) {
    message += ` Η πυρκαγιά βρίσκεται στην ${fireSide} πλευρά του ορόφου.`;
  }

  if (analysis.disabledElevators?.length > 0) {
    message +=
      ' Οι ανελκυστήρες δεν πρέπει να χρησιμοποιηθούν κατά την εκκένωση.';
  }

  if (recommendedExitNames.length === 1) {
    message += ` Παρακαλώ ακολουθήστε τη σηματοδοτημένη διαδρομή προς την ${recommendedExitNames[0]}.`;
  } else if (recommendedExitNames.length > 1) {
    message += ` Παρακαλώ ακολουθήστε τη σηματοδοτημένη διαδρομή προς την ασφαλή έξοδο που έχει υπολογιστεί για την περιοχή σας.`;
  }

  if (analysis.rejectedExits?.length > 0) {
    const rejectedNames = analysis.rejectedExits.map(
      (evaluation) =>
        getElementName(
          evaluation.exit,
          'έξοδο κινδύνου'
        )
    );

    message += ` Μην χρησιμοποιείτε ${
      rejectedNames.length === 1
        ? `την ${rejectedNames[0]}`
        : `τις εξόδους ${rejectedNames.join(', ')}`
    }.`;
  }

  return message;
}

function buildShelterMessage(analysis) {
  const fireZoneName = getZoneName(
    analysis.fireZone,
    analysis.firePoint?.area || 'άγνωστη περιοχή'
  );

  const fireSide = getSideLabel(
    analysis.effectiveFireSide
  );

  let message = `Προσοχή. Έχει εντοπιστεί πυρκαγιά στην περιοχή ${fireZoneName}.`;

  if (fireSide) {
    message += ` Η πυρκαγιά βρίσκεται στην ${fireSide} πλευρά του ορόφου.`;
  }

  message +=
    ' Δεν υπάρχει διαθέσιμη ασφαλής διαδρομή εκκένωσης σύμφωνα με την τρέχουσα ανάλυση.';

  if (analysis.disabledElevators?.length > 0) {
    message +=
      ' Μην χρησιμοποιείτε τους ανελκυστήρες.';
  }

  message +=
    ' Παραμείνετε σε προστατευμένο χώρο, κλείστε τις πόρτες και περιμένετε οδηγίες από τους υπευθύνους ασφαλείας.';

  return message;
}

export function generateEmergencyAlert(analysis) {
  if (!analysis?.success) {
    return {
      type: 'ERROR',
      title: 'Δεν είναι δυνατή η δημιουργία ειδοποίησης',
      message:
        analysis?.message ||
        'Δεν υπάρχουν επαρκή δεδομένα για ανάλυση.',
    };
  }

  const hasEvacuationRoute =
    analysis.recommendations.some(
      (recommendation) =>
        recommendation.action === 'EVACUATE'
    );

  if (!hasEvacuationRoute) {
    return {
      type: 'SHELTER_IN_PLACE',
      title: 'Παραμονή σε προστατευμένο χώρο',
      message: buildShelterMessage(analysis),
    };
  }

  return {
    type: 'EVACUATION',
    title: 'Εντολή εκκένωσης',
    message: buildEvacuationMessage(analysis),
  };
}