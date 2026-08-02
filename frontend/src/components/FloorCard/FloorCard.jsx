import './FloorCard.css';

const floorStatusLabels = {
  READY: 'Έτοιμη κάτοψη',
  DRAFT: 'Σε επεξεργασία',
  NOT_STARTED: 'Χωρίς κάτοψη',
};

function FloorCard({ floor, onSelect }) {
  const handleOpenFloor = () => {
    onSelect(floor.id);
  };

  return (
    <article className="floor-card">
      <div className="floor-card-top">
        <div className="floor-number">
          {floor.floorNumber === 0 ? 'G' : floor.floorNumber}
        </div>

        <span
          className={`floor-plan-status floor-plan-status--${floor.floorPlanStatus.toLowerCase()}`}
        >
          {floorStatusLabels[floor.floorPlanStatus]}
        </span>
      </div>

      <div className="floor-card-content">
        <h3>{floor.name}</h3>

        <div className="floor-statistics">
          <div>
            <span>Περιοχές</span>
            <strong>{floor.zoneCount}</strong>
          </div>

          <div>
            <span>Έξοδοι</span>
            <strong>{floor.exitCount}</strong>
          </div>

          <div>
            <span>Παρευρισκόμενοι</span>
            <strong>{floor.occupantCount}</strong>
          </div>
        </div>
      </div>

      <button
        className="floor-open-button"
        type="button"
        onClick={handleOpenFloor}
      >
        Άνοιγμα ορόφου
        <span aria-hidden="true">→</span>
      </button>
    </article>
  );
}

export default FloorCard;