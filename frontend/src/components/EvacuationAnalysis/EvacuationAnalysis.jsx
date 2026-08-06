import './EvacuationAnalysis.css';

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
            Τοποθετήστε τουλάχιστον έναν παρευρισκόμενο,
            ένα Fire Point και δύο διαθέσιμες εξόδους.
          </p>
        </div>
      )}

      {analysis && !analysis.success && (
        <div className="evacuation-analysis-error" role="alert">
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
                {analysis.fireZone?.side ||
                  analysis.firePoint.side ||
                  'Δεν έχει οριστεί'}
              </strong>
            </div>

            <div>
              <span>Απενεργοποιημένοι ανελκυστήρες</span>

              <strong>
                {analysis.disabledElevators.length}
              </strong>
            </div>
          </div>

          <div className="evacuation-recommendations">
            {analysis.recommendations.map(
              (recommendation) => (
                <article
                  className="evacuation-recommendation"
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

                  <div className="recommended-exit">
                    <span>Προτεινόμενη έξοδος</span>

                    <strong>
                      {getElementName(
                        recommendation.recommendedExit,
                        'Έξοδος κινδύνου'
                      )}
                    </strong>

                    <small>
                      Απόσταση από παρευρισκόμενο:{' '}
                      {recommendation.occupantToExitDistance}
                    </small>

                    <small>
                      Απόσταση από φωτιά:{' '}
                      {recommendation.fireToExitDistance}
                    </small>
                  </div>
                </article>
              )
            )}
          </div>
        </>
      )}
    </section>
  );
}

export default EvacuationAnalysis;