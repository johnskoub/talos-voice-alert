import './FloorPlanCanvas.css';

function FloorPlanCanvas({ imageUrl, imageName }) {
  if (!imageUrl) {
    return (
      <section className="floor-plan-canvas floor-plan-canvas--empty">
        <div className="floor-plan-empty-content">
          <div className="floor-plan-empty-icon">▧</div>

          <h3>Δεν έχει επιλεγεί κάτοψη</h3>

          <p>
            Ανεβάστε την εικόνα του ορόφου για να ξεκινήσετε την
            τοποθέτηση περιοχών και Floor Elements.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="floor-plan-canvas">
      <div className="floor-plan-canvas-header">
        <div>
          <p>FLOOR PLAN PREVIEW</p>
          <strong>{imageName}</strong>
        </div>

        <span>Preview mode</span>
      </div>

      <div className="floor-plan-image-wrapper">
        <img
          className="floor-plan-image"
          src={imageUrl}
          alt={`Κάτοψη ${imageName}`}
        />

        <div className="floor-plan-grid-overlay" aria-hidden="true" />
      </div>
    </section>
  );
}

export default FloorPlanCanvas;