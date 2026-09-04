import './EvacuationAnalysis.css';

const rejectionReasonLabels = {
  EXIT_NOT_AVAILABLE: 'Η έξοδος δεν είναι διαθέσιμη',
  EXIT_INSIDE_FIRE_ZONE:
    'Η έξοδος βρίσκεται μέσα στη Zone της φωτιάς',
  EXIT_ON_FIRE_SIDE:
    'Η έξοδος βρίσκεται στην πλευρά της φωτιάς',
  EXIT_TOO_CLOSE_TO_FIRE:
    'Η έξοδος βρίσκεται πολύ κοντά στη φωτιά',
};

function getElementName(element, fallback) {
  return element?.name?.trim() || fallback;
}

function EvacuationAnalysis({
  analysis,
  onRunAnalysis,
}) {
  return (
    <section className="evacuation-analysis">
      <div className="evacuation-analysis-header">
        <div>
          <p>EVACUATION ANALYSIS</p>
          <h3>Ανάλυση ασφαλούς εξόδου</h3>
        </div>

        <button type="button" onClick={onRunAnalysis}>
          Εκτέλεση ανάλυσης
        </button>
      </div>

      {!analysis && (
        <div className="evacuation-analysis-empty">
          <h4>Δεν έχει εκτελεστεί ανάλυση</h4>

          <p>
            Τοποθετήστε παρευρισκόμενους, Fire Point και
            εξόδους κινδύνου.
          </p>
        </div>
      )}

      {analysis && !analysis.success && (
        <div
          className="evacuation-analysis-error"
          role="alert"
        >
          {analysis.message}
        </div>
      )}

      {analysis?.success && (
        <>
          <div className="evacuation-incident-summary">
            <div>
              <span>Περιοχή φωτιάς</span>

              <strong>
                {analysis.fireZone?.name ||
                  analysis.firePoint.area ||
                  'Εκτός ορισμένης Zone'}
              </strong>
            </div>

            <div>
              <span>Πλευρά φωτιάς</span>

              <strong>
                {analysis.effectiveFireSide || 'Δεν έχει οριστεί'}
              </strong>
            </div>

            <div>
              <span>Ασφαλείς έξοδοι</span>
              <strong>{analysis.safeExits.length}</strong>
            </div>

            <div>
              <span>Απορριφθείσες έξοδοι</span>
              <strong>{analysis.rejectedExits.length}</strong>
            </div>
          </div>

          {analysis.rejectedExits.length > 0 && (
            <section className="rejected-exits">
              <h4>Έξοδοι που αποκλείστηκαν</h4>

              <div className="rejected-exits-list">
                {analysis.rejectedExits.map(
                  (evaluation) => (
                    <article key={evaluation.exit.id}>
                      <strong>
                        {getElementName(
                          evaluation.exit,
                          'Έξοδος κινδύνου'
                        )}
                      </strong>

                      <ul>
                        {evaluation.rejectionReasons.map(
                          (reason) => (
                            <li key={reason}>
                              {rejectionReasonLabels[reason]}
                            </li>
                          )
                        )}
                      </ul>
                    </article>
                  )
                )}
              </div>
            </section>
          )}

          <div className="evacuation-recommendations">
            {analysis.recommendations.map(
              (recommendation) => {
                const shelterInPlace =
                  recommendation.action ===
                  'SHELTER_IN_PLACE';

                return (
                  <article
                    className={`evacuation-recommendation ${
                      shelterInPlace
                        ? 'evacuation-recommendation--shelter'
                        : ''
                    }`}
                    key={recommendation.occupant.id}
                  >
                    <div>
                      <span>Παρευρισκόμενος</span>

                      <h4>
                        {getElementName(
                          recommendation.occupant,
                          'Χωρίς όνομα'
                        )}
                      </h4>

                      <p>
                        Περιοχή:{' '}
                        {recommendation.occupantZone?.name ||
                          recommendation.occupant.area ||
                          'Εκτός Zone'}
                      </p>
                    </div>

                    {shelterInPlace ? (
                      <div className="shelter-in-place">
                        <span>
                          Δεν υπάρχει ασφαλής έξοδος
                        </span>

                        <strong>
                          SHELTER IN PLACE
                        </strong>

                        <p>
                          Παραμείνετε σε προστατευμένο χώρο,
                          κλείστε τις πόρτες και περιμένετε
                          οδηγίες από τους υπευθύνους
                          ασφαλείας.
                        </p>
                      </div>
                    ) : (
                      <div className="recommended-exit">
                        <span>
                          Προτεινόμενη έξοδος
                        </span>

                        <strong>
                          {getElementName(
                            recommendation.recommendedExit,
                            'Έξοδος κινδύνου'
                          )}
                        </strong>

                        <small>
                          Απόσταση από παρευρισκόμενο:{' '}
                          {
                            recommendation.occupantToExitDistance
                          }
                        </small>

                        <small>
                          Απόσταση από φωτιά:{' '}
                          {recommendation.fireToExitDistance}
                        </small>

                        {recommendation.routeDistance != null && (
                          <p>
                            Συνολικό μήκος διαδρομής:{' '}
                            <strong>
                              {recommendation.routeDistance}
                            </strong>
                          </p>
                        )}
                      </div>
                    )}
                  </article>
                );
              }
            )}
          </div>
        </>
      )}
    </section>
  );
}

export default EvacuationAnalysis;