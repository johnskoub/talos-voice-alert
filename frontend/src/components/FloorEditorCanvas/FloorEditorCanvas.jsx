import { useRef, useState } from 'react';
import './FloorEditorCanvas.css';

const placeableTools = ['OCCUPANT', 'EXIT', 'FIRE_POINT'];

const elementInformation = {
  OCCUPANT: {
    symbol: '●',
    label: 'Παρευρισκόμενος',
  },
  EXIT: {
    symbol: '⇥',
    label: 'Έξοδος κινδύνου',
  },
  FIRE_POINT: {
    symbol: '▲',
    label: 'Σημείο φωτιάς',
  },
};

function createElementId() {
  if (crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()}`;
}

function clampPercentage(value) {
  return Math.min(100, Math.max(0, value));
}

function FloorEditorCanvas({
  imageUrl,
  imageName,
  activeTool,
  elements,
  onElementsChange,
  selectedElementId,
  onElementSelect,
}) {
  const imageRef = useRef(null);

  const [draggingElementId, setDraggingElementId] = useState(null);

  const selectedElement = elements.find(
    (element) => element.id === selectedElementId
  );

  const calculatePointerPosition = (event) => {
    const image = imageRef.current;

    if (!image) {
      return null;
    }

    const imageRectangle = image.getBoundingClientRect();

    const positionX =
      ((event.clientX - imageRectangle.left) / imageRectangle.width) *
      100;

    const positionY =
      ((event.clientY - imageRectangle.top) / imageRectangle.height) *
      100;

    return {
      x: Number(clampPercentage(positionX).toFixed(2)),
      y: Number(clampPercentage(positionY).toFixed(2)),
    };
  };

  const handleCanvasClick = (event) => {
    if (activeTool === 'SELECT') {
      onElementSelect(null);
      return;
    }

    if (!placeableTools.includes(activeTool)) {
      return;
    }

    const image = imageRef.current;

    if (!image) {
      return;
    }

    const imageRectangle = image.getBoundingClientRect();

    const clickedInsideImage =
      event.clientX >= imageRectangle.left &&
      event.clientX <= imageRectangle.right &&
      event.clientY >= imageRectangle.top &&
      event.clientY <= imageRectangle.bottom;

    if (!clickedInsideImage) {
      return;
    }

    const position = calculatePointerPosition(event);

    if (!position) {
      return;
    }

    const defaultProperties = {
      OCCUPANT: {
        name: '',
        area: '',
        status: 'ACTIVE',
      },

      EXIT: {
        name: '',
        side: 'EAST',
        status: 'AVAILABLE',
      },

      FIRE_POINT: {
        area: '',
        side: 'WEST',
        severity: 'MEDIUM',
        smoke: false,
      },
    };

    const newElement = {
      id: createElementId(),
      type: activeTool,
      x: position.x,
      y: position.y,
      ...defaultProperties[activeTool],
    };

    onElementsChange([...elements, newElement]);
  };

  const handleElementClick = (event, elementId) => {
    event.stopPropagation();

    if (activeTool === 'DELETE') {
      const updatedElements = elements.filter(
        (element) => element.id !== elementId
      );

      onElementsChange(updatedElements);

      if (selectedElementId === elementId) {
        onElementSelect(null);
      }

      return;
    }

    if (activeTool === 'SELECT') {
      onElementSelect(elementId);
    }
  };

  const handleMarkerPointerDown = (event, elementId) => {
    if (activeTool !== 'SELECT') {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    onElementSelect(elementId);
    setDraggingElementId(elementId);

    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleMarkerPointerMove = (event, elementId) => {
    if (
      activeTool !== 'SELECT' ||
      draggingElementId !== elementId
    ) {
      return;
    }

    event.preventDefault();

    const position = calculatePointerPosition(event);

    if (!position) {
      return;
    }

    const updatedElements = elements.map((element) =>
      element.id === elementId
        ? {
            ...element,
            x: position.x,
            y: position.y,
          }
        : element
    );

    onElementsChange(updatedElements);
  };

  const handleMarkerPointerUp = (event, elementId) => {
    if (draggingElementId !== elementId) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    setDraggingElementId(null);

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <section className="floor-editor-canvas">
      <div className="floor-editor-canvas-header">
        <div>
          <p>ACTIVE FLOOR PLAN</p>
          <strong>{imageName}</strong>
        </div>

        <div className="floor-editor-canvas-status">
          <span>Tool: {activeTool}</span>

          <span>{elements.length} στοιχεία</span>

          {selectedElement && (
            <span>
              x: {selectedElement.x}% · y: {selectedElement.y}%
            </span>
          )}
        </div>
      </div>

      <div className="floor-editor-workspace">
        <div
          className={`floor-editor-image-stage ${
            placeableTools.includes(activeTool)
              ? 'floor-editor-image-stage--placement'
              : ''
          } ${
            activeTool === 'SELECT'
              ? 'floor-editor-image-stage--selection'
              : ''
          }`}
          onClick={handleCanvasClick}
          role="presentation"
        >
          <img
            ref={imageRef}
            src={imageUrl}
            alt={`Κάτοψη ${imageName}`}
            draggable="false"
          />

          <div className="floor-elements-layer">
            {elements.map((element) => {
              const information = elementInformation[element.type];

              if (!information) {
                return null;
              }

              const isSelected = selectedElementId === element.id;
              const isDragging = draggingElementId === element.id;

              let markerLabel = information.label;

              if (element.type === 'OCCUPANT' && element.name) {
                markerLabel = element.name;
              }

              if (element.type === 'EXIT' && element.name) {
                markerLabel = element.name;
              }

              if (element.type === 'FIRE_POINT' && element.area) {
                markerLabel = `Φωτιά: ${element.area}`;
              }

              return (
                <button
                  key={element.id}
                  className={`floor-element-marker floor-element-marker--${element.type.toLowerCase()} ${
                    activeTool === 'DELETE'
                      ? 'floor-element-marker--deletable'
                      : ''
                  } ${
                    isSelected
                      ? 'floor-element-marker--selected'
                      : ''
                  } ${
                    isDragging
                      ? 'floor-element-marker--dragging'
                      : ''
                  }`}
                  type="button"
                  style={{
                    left: `${element.x}%`,
                    top: `${element.y}%`,
                  }}
                  title={`${information.label} — x: ${element.x}%, y: ${element.y}%`}
                  onClick={(event) =>
                    handleElementClick(event, element.id)
                  }
                  onPointerDown={(event) =>
                    handleMarkerPointerDown(event, element.id)
                  }
                  onPointerMove={(event) =>
                    handleMarkerPointerMove(event, element.id)
                  }
                  onPointerUp={(event) =>
                    handleMarkerPointerUp(event, element.id)
                  }
                  onPointerCancel={(event) =>
                    handleMarkerPointerUp(event, element.id)
                  }
                >
                  <span aria-hidden="true">{information.symbol}</span>

                  <span className="floor-element-marker-label">
                    {markerLabel}
                  </span>
                </button>
              );
            })}
          </div>

          {elements.length === 0 && (
            <div className="floor-editor-helper">
              Επιλέξτε Occupant, Exit ή Fire Point και κάντε κλικ στην
              κάτοψη.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default FloorEditorCanvas;