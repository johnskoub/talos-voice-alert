import './FloorCard.css';

function FloorCard({ floor, onSelect }) {
  const handleOpenFloor = () => {
    onSelect(floor.id);
  };

  // =========================================
  // FLOOR PLAN STATUS
  // =========================================

  const hasFloorPlan =
    floor.floorPlanImage &&
    floor.floorPlanImage.trim() !== '';

  const floorPlanStatus = hasFloorPlan
    ? 'READY'
    : 'NOT_STARTED';

  const floorStatusLabels = {
    READY: 'Έτοιμη κάτοψη',
    NOT_STARTED: 'Χωρίς κάτοψη',
  };

  return (
    <article className="floor-card">
      <div className="floor-card-top">
        <div className="floor-number">
          {floor.floorNumber === 0
            ? 'G'
            : floor.floorNumber}
        </div>

        <span
          className={`floor-plan-status floor-plan-status--${floorPlanStatus.toLowerCase()}`}
        >
          {floorStatusLabels[floorPlanStatus]}
        </span>
      </div>

      <div className="floor-card-content">
        <h3>{floor.name}</h3>

        <div className="floor-statistics">
          <div>
            <span>Περιοχές</span>
            <strong>
              {floor.zoneCount ?? 0}
            </strong>
          </div>

          <div>
            <span>Έξοδοι</span>
            <strong>
              {floor.exitCount ?? 0}
            </strong>
          </div>

          <div>
            <span>Παρευρισκόμενοι</span>
            <strong>
              {floor.occupantCount ?? 0}
            </strong>
          </div>
        </div>
      </div>

      <button
        className="floor-open-button"
        type="button"
        onClick={handleOpenFloor}
      >
        Άνοιγμα ορόφου

        <span aria-hidden="true">
          →
        </span>
      </button>
    </article>
  );
}

export default FloorCard;