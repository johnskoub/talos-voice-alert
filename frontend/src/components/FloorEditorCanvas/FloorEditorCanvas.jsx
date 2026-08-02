import './FloorEditorCanvas.css';

function FloorEditorCanvas({
  imageUrl,
  imageName,
  activeTool,
}) {
  return (
    <section className="floor-editor-canvas">
      <div className="floor-editor-canvas-header">
        <div>
          <p>ACTIVE FLOOR PLAN</p>
          <strong>{imageName}</strong>
        </div>

        <span>Tool: {activeTool}</span>
      </div>

      <div className="floor-editor-workspace">
        <div className="floor-editor-image-stage">
          <img
            src={imageUrl}
            alt={`Κάτοψη ${imageName}`}
          />

          <div className="floor-editor-helper">
            Στο επόμενο βήμα θα τοποθετούμε εδώ Floor Elements.
          </div>
        </div>
      </div>
    </section>
  );
}

export default FloorEditorCanvas;