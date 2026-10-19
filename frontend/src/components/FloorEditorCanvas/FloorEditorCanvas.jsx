import { useRef, useState } from 'react';
import './FloorEditorCanvas.css';

const placeableTools = [
  'OCCUPANT',
  'EXIT',
  'FIRE_POINT',
  'STAIR',
  'ELEVATOR',
  'EXTINGUISHER',
  'ASSEMBLY_POINT',
  'ROUTE_NODE',
];

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
  STAIR: {
    symbol: '≋',
    label: 'Σκάλα',
  },

  ELEVATOR: {
    symbol: '↕',
    label: 'Ανελκυστήρας',
  },

  EXTINGUISHER: {
    symbol: 'E',
    label: 'Πυροσβεστήρας',
  },

  ASSEMBLY_POINT: {
    symbol: '◎',
    label: 'Σημείο συγκέντρωσης',
  },

  ROUTE_NODE: {
    symbol: '◆',
    label: 'Route Node',
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

function clampValue(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

function FloorEditorCanvas({
  imageUrl,
  imageName,
  activeTool,
  elements,
  onElementsChange,
  selectedElementId,
  onElementSelect,
  evacuationRoutes,
  routeConnections,
  pendingRouteNodeId,
  onRouteNodeConnect,
  onCalibrationComplete,
  onImageDimensionsChange,
  fireBlockedRouteElements = {
    blockedNodeIds: [],
    blockedConnectionIds: [],
  },
  
}) {
  const imageRef = useRef(null);

  const [draggingElementId, setDraggingElementId] = useState(null);
  const [draftZone, setDraftZone] = useState(null);
  const [draftWall, setDraftWall] = useState(null);

  const [calibrationPoints, setCalibrationPoints] = useState([]);

  const [draggingZone, setDraggingZone] = useState(null);
  const [resizingZone, setResizingZone] = useState(null);

  const selectedElement = elements.find(
    (element) => element.id === selectedElementId
  );

  const blockedNodeIdSet = new Set(
    fireBlockedRouteElements.blockedNodeIds
  );

  const blockedConnectionIdSet = new Set(
    fireBlockedRouteElements.blockedConnectionIds
  );

  const calculatePointerPosition = (event) => {
    const image = imageRef.current;

    if (!image) {
      return null;
    }

    const imageRectangle = image.getBoundingClientRect();

    const positionX =
      ((event.clientX - imageRectangle.left) /
        imageRectangle.width) *
      100;

    const positionY =
      ((event.clientY - imageRectangle.top) /
        imageRectangle.height) *
      100;

    return {
      x: Number(clampPercentage(positionX).toFixed(2)),
      y: Number(clampPercentage(positionY).toFixed(2)),
    };
  };

  const calculatePointerPixelPosition = (event) => {
    const image = imageRef.current;

    if (!image) {
      return null;
    }

    const imageRectangle =
      image.getBoundingClientRect();

    if (
      imageRectangle.width <= 0 ||
      imageRectangle.height <= 0 ||
      image.naturalWidth <= 0 ||
      image.naturalHeight <= 0
    ) {
      return null;
    }

    const displayX =
      event.clientX - imageRectangle.left;

    const displayY =
      event.clientY - imageRectangle.top;

    const scaleX =
      image.naturalWidth / imageRectangle.width;

    const scaleY =
      image.naturalHeight / imageRectangle.height;

    return {
      x: displayX * scaleX,
      y: displayY * scaleY,
    };
  };

  const isPointerInsideImage = (event) => {
    const image = imageRef.current;

    if (!image) {
      return false;
    }

    const imageRectangle = image.getBoundingClientRect();

    return (
      event.clientX >= imageRectangle.left &&
      event.clientX <= imageRectangle.right &&
      event.clientY >= imageRectangle.top &&
      event.clientY <= imageRectangle.bottom
    );
  };

  const handleCanvasClick = (event) => {

    if (activeTool === 'CALIBRATION') {
      event.stopPropagation();

      if (!isPointerInsideImage(event)) {
        return;
      }

      const pixelPosition =
        calculatePointerPixelPosition(event);

      if (!pixelPosition) {
        return;
      }

      const newPoints = [
        ...calibrationPoints,
        pixelPosition,
      ];

      if (newPoints.length === 2) {
        const firstPoint = newPoints[0];
        const secondPoint = newPoints[1];

        const deltaX =
          secondPoint.x - firstPoint.x;

        const deltaY =
          secondPoint.y - firstPoint.y;

        const pixelDistance = Math.sqrt(
          deltaX * deltaX +
          deltaY * deltaY
        );

        const scaleInput = window.prompt(
          'Ποια είναι η κλίμακα της κάτοψης;\\n\\nΠαράδειγμα: για κλίμακα 1:100 γράψε 100.',
          '100'
        );

        if (scaleInput === null) {
          setCalibrationPoints([]);
          return;
        }

        const scaleRatio = Number(scaleInput);

        if (
          !Number.isFinite(scaleRatio) ||
          scaleRatio <= 0
        ) {
          window.alert(
            'Η κλίμακα πρέπει να είναι θετικός αριθμός.'
          );

          setCalibrationPoints([]);
          return;
        }

        const realDistanceInput = window.prompt(
          'Πόσα μέτρα είναι η πραγματική απόσταση μεταξύ των δύο σημείων;',
          '5'
        );

        if (realDistanceInput === null) {
          setCalibrationPoints([]);
          return;
        }

        const realDistance =
          Number(realDistanceInput);

        if (
          !Number.isFinite(realDistance) ||
          realDistance <= 0
        ) {
          window.alert(
            'Η πραγματική απόσταση πρέπει να είναι θετικός αριθμός.'
          );

          setCalibrationPoints([]);
          return;
        }

        const pixelsPerMeter =
          pixelDistance / realDistance;

        if (onCalibrationComplete) {
          onCalibrationComplete({
            scaleRatio,
            pixelsPerMeter,
            pixelDistance,
            realDistance,
          });
        }

        setCalibrationPoints([]);
        return;
      }

      setCalibrationPoints(newPoints);
      return;
    }
    
    if (activeTool === 'SELECT') {
      onElementSelect(null);
      return;
    }

    if (!placeableTools.includes(activeTool)) {
      return;
    }

    if (!isPointerInsideImage(event)) {
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

      STAIR: {
        name: '',
        direction: 'UP_DOWN',
        status: 'AVAILABLE',
      },

      ELEVATOR: {
        name: '',
        status: 'AVAILABLE',
        disabledDuringFire: true,
      },

      EXTINGUISHER: {
        name: '',
        extinguisherType: 'ABC',
        status: 'AVAILABLE',
      },

      ASSEMBLY_POINT: {
        name: '',
        capacity: 50,
        status: 'AVAILABLE',
      },

      ROUTE_NODE: {
        name: '',
        status: 'AVAILABLE',
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

  const handleWallPointerDown = (event) => {
    if (activeTool !== 'WALL') {
      return;
    }

    if (!isPointerInsideImage(event)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const position = calculatePointerPosition(event);

    if (!position) {
      return;
    }

    setDraftWall({
      startX: position.x,
      startY: position.y,
      endX: position.x,
      endY: position.y,
    });

    event.currentTarget.setPointerCapture(event.pointerId);
  };

  

  const handleWallPointerMove = (event) => {
    if (activeTool !== 'WALL' || !draftWall) {
      return;
    }

    if (!isPointerInsideImage(event)) {
    return;
  }

    event.preventDefault();
    event.stopPropagation();

    const position = calculatePointerPosition(event);

    if (!position) {
      return;
    }

    setDraftWall((currentWall) => ({
      ...currentWall,
      endX: position.x,
      endY: position.y,
    }));
  };

  const handleWallPointerUp = (event) => {
    if (activeTool !== 'WALL' || !draftWall) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    const deltaX = draftWall.endX - draftWall.startX;
    const deltaY = draftWall.endY - draftWall.startY;

    const wallLength = Math.sqrt(
      deltaX * deltaX + deltaY * deltaY
    );

    // Αποφεύγουμε τη δημιουργία τοίχου με ένα απλό click.
    if (wallLength >= 1) {
      const newWall = {
        id: createElementId(),
        type: 'WALL',
        startX: draftWall.startX,
        startY: draftWall.startY,
        endX: draftWall.endX,
        endY: draftWall.endY,
        status: 'ACTIVE',
      };

      onElementsChange([...elements, newWall]);
      onElementSelect(newWall.id);
    }

    setDraftWall(null);
  };

  const handleZonePointerDown = (event) => {
    if (activeTool !== 'ZONE') {
      return;
    }

    if (!isPointerInsideImage(event)) {
      return;
    }

    event.preventDefault();

    const position = calculatePointerPosition(event);

    if (!position) {
      return;
    }

    setDraftZone({
      startX: position.x,
      startY: position.y,
      x: position.x,
      y: position.y,
      width: 0,
      height: 0,
    });

    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleZonePointerMove = (event) => {
    if (activeTool !== 'ZONE' || !draftZone) {
      return;
    }

    event.preventDefault();

    const position = calculatePointerPosition(event);

    if (!position) {
      return;
    }

    const left = Math.min(draftZone.startX, position.x);
    const top = Math.min(draftZone.startY, position.y);
    const width = Math.abs(position.x - draftZone.startX);
    const height = Math.abs(position.y - draftZone.startY);

    setDraftZone((currentZone) => ({
      ...currentZone,
      x: Number(left.toFixed(2)),
      y: Number(top.toFixed(2)),
      width: Number(width.toFixed(2)),
      height: Number(height.toFixed(2)),
    }));
  };

  const handleZonePointerUp = (event) => {
    if (activeTool !== 'ZONE' || !draftZone) {
      return;
    }

    event.preventDefault();

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    const minimumZoneSize = 2;

    if (
      draftZone.width >= minimumZoneSize &&
      draftZone.height >= minimumZoneSize
    ) {
      const newZone = {
        id: createElementId(),
        type: 'ZONE',
        name: '',
        category: 'GENERAL',
        side: 'CENTER',
        x: draftZone.x,
        y: draftZone.y,
        width: draftZone.width,
        height: draftZone.height,
      };

      onElementsChange([...elements, newZone]);
      onElementSelect(newZone.id);
    }

    setDraftZone(null);
  };

  const handleZoneDragPointerDown = (event, zone) => {
  if (activeTool !== 'SELECT') {
    return;
  }

  event.preventDefault();
  event.stopPropagation();

  const position = calculatePointerPosition(event);

  if (!position) {
    return;
  }

  onElementSelect(zone.id);

  setDraggingZone({
    id: zone.id,
    offsetX: position.x - zone.x,
    offsetY: position.y - zone.y,
  });

  event.currentTarget.setPointerCapture(event.pointerId);
};

const handleZoneDragPointerMove = (event, zoneId) => {
  if (
    activeTool !== 'SELECT' ||
    draggingZone?.id !== zoneId
  ) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();

  const position = calculatePointerPosition(event);

  if (!position) {
    return;
  }

  const zone = elements.find(
    (element) =>
      element.id === zoneId &&
      element.type === 'ZONE'
  );

  if (!zone) {
    return;
  }

  const newX = clampValue(
    position.x - draggingZone.offsetX,
    0,
    100 - zone.width
  );

  const newY = clampValue(
    position.y - draggingZone.offsetY,
    0,
    100 - zone.height
  );

  const updatedElements = elements.map((element) =>
    element.id === zoneId
      ? {
          ...element,
          x: Number(newX.toFixed(2)),
          y: Number(newY.toFixed(2)),
        }
      : element
  );

  onElementsChange(updatedElements);
};

const handleZoneDragPointerUp = (event, zoneId) => {
  if (draggingZone?.id !== zoneId) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();

  setDraggingZone(null);

  if (event.currentTarget.hasPointerCapture(event.pointerId)) {
    event.currentTarget.releasePointerCapture(event.pointerId);
  }
};

  const handleElementClick = (event, elementId) => {
    if (activeTool === 'DELETE') {
      event.stopPropagation();

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
      event.stopPropagation();
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

  const handleZoneResizePointerDown = (event, zone) => {
  if (activeTool !== 'SELECT') {
    return;
  }

  event.preventDefault();
  event.stopPropagation();

  const position = calculatePointerPosition(event);

  if (!position) {
    return;
  }

  onElementSelect(zone.id);

  setResizingZone({
    id: zone.id,
    startX: position.x,
    startY: position.y,
    initialWidth: zone.width,
    initialHeight: zone.height,
  });

  event.currentTarget.setPointerCapture(event.pointerId);
};

const handleZoneResizePointerMove = (event, zoneId) => {
  if (
    activeTool !== 'SELECT' ||
    resizingZone?.id !== zoneId
  ) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();

  const position = calculatePointerPosition(event);

  if (!position) {
    return;
  }

  const zone = elements.find(
    (element) =>
      element.id === zoneId &&
      element.type === 'ZONE'
  );

  if (!zone) {
    return;
  }

  const widthDifference =
    position.x - resizingZone.startX;

  const heightDifference =
    position.y - resizingZone.startY;

  const minimumZoneSize = 2;

  const newWidth = clampValue(
    resizingZone.initialWidth + widthDifference,
    minimumZoneSize,
    100 - zone.x
  );

  const newHeight = clampValue(
    resizingZone.initialHeight + heightDifference,
    minimumZoneSize,
    100 - zone.y
  );

  const updatedElements = elements.map((element) =>
    element.id === zoneId
      ? {
          ...element,
          width: Number(newWidth.toFixed(2)),
          height: Number(newHeight.toFixed(2)),
        }
      : element
  );

  onElementsChange(updatedElements);
};

const handleZoneResizePointerUp = (event, zoneId) => {
  if (resizingZone?.id !== zoneId) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();

  setResizingZone(null);

  if (event.currentTarget.hasPointerCapture(event.pointerId)) {
    event.currentTarget.releasePointerCapture(event.pointerId);
  }
};


  const zones = elements.filter(
    (element) => element.type === 'ZONE'
  );

  const markers = elements.filter(
    (element) => element.type !== 'ZONE'
  );

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

          {evacuationRoutes.length > 0 && (
            <span className="floor-editor-route-status">
              {evacuationRoutes.length} διαδρομές
            </span>
          )}

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
          } ${
            activeTool === 'ZONE'
              ? 'floor-editor-image-stage--zone'
              : ''
          } ${
            activeTool === 'DELETE'
              ? 'floor-editor-image-stage--delete'
              : ''
          }`}
          onClick={handleCanvasClick}
          onPointerDown={(event) => {
            if (activeTool === 'WALL') {
              handleWallPointerDown(event);
              return;
            }

            handleZonePointerDown(event);
          }}
          onPointerMove={(event) => {
            if (activeTool === 'WALL') {
              handleWallPointerMove(event);
              return;
            }

            handleZonePointerMove(event);
          }}
          onPointerUp={(event) => {
            if (activeTool === 'WALL') {
              handleWallPointerUp(event);
              return;
            }

            handleZonePointerUp(event);
          }}
          onPointerCancel={(event) => {
            if (activeTool === 'WALL') {
              handleWallPointerUp(event);
              return;
            }

            handleZonePointerUp(event);
          }}
          role="presentation"
        >
          <img
            ref={imageRef}
            src={imageUrl}
            alt={`Κάτοψη ${imageName}`}
            draggable="false"
            onLoad={(event) => {
              const image = event.currentTarget;

              if (onImageDimensionsChange) {
                onImageDimensionsChange({
                  width: image.naturalWidth,
                  height: image.naturalHeight,
                });
              }
            }}
          />

          // Εμφάνιση προσωρινού τοίχου όταν σχεδιάζεται
          {draftWall && (
            <svg
              className="floor-walls-layer"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <line
                className="floor-wall floor-wall--draft"
                x1={draftWall.startX}
                y1={draftWall.startY}
                x2={draftWall.endX}
                y2={draftWall.endY}
              />
            </svg>
          )}

          {activeTool === 'CALIBRATION' &&
            calibrationPoints.map((point, index) => (
              <div
                key={`calibration-point-${index}`}
                className="floor-calibration-point"
                style={{
                  left: `${point.x}px`,
                  top: `${point.y}px`,
                }}
              >
                {index + 1}
              </div>
            ))}

          {activeTool === 'CALIBRATION' &&
            calibrationPoints.length === 2 && (
              <div
                className="floor-calibration-line"
                style={{
                  left: `${calibrationPoints[0].x}px`,
                  top: `${calibrationPoints[0].y}px`,
                  width: `${Math.sqrt(
                    Math.pow(
                      calibrationPoints[1].x -
                        calibrationPoints[0].x,
                      2
                    ) +
                    Math.pow(
                      calibrationPoints[1].y -
                        calibrationPoints[0].y,
                      2
                    )
                  )}px`,
                  transform: `rotate(${Math.atan2(
                    calibrationPoints[1].y -
                      calibrationPoints[0].y,
                    calibrationPoints[1].x -
                      calibrationPoints[0].x
                  )}rad)`,
                }}
              />
            )}

          <div className="floor-zones-layer">
            {zones.map((zone) => {
              const isSelected = selectedElementId === zone.id;

              const isDraggingZone = draggingZone?.id === zone.id;
              const isResizingZone = resizingZone?.id === zone.id;

              return (
                <button
                  key={zone.id}
                  className={`floor-zone ${
                    isSelected ? 'floor-zone--selected' : ''
                  } ${
                    activeTool === 'DELETE'
                      ? 'floor-zone--deletable'
                      : ''
                  } ${
                    isDraggingZone
                      ? 'floor-zone--dragging'
                      : ''
                  } ${
                    isResizingZone
                      ? 'floor-zone--resizing'
                      : ''
                  }`}
                  type="button"
                  style={{
                    left: `${zone.x}%`,
                    top: `${zone.y}%`,
                    width: `${zone.width}%`,
                    height: `${zone.height}%`,
                  }}
                  onClick={(event) =>
                    handleElementClick(event, zone.id)
                  }
                  onPointerDown={(event) => {
                    if (activeTool === 'SELECT') {
                      handleZoneDragPointerDown(event, zone);
                      return;
                    }

                    if (activeTool === 'DELETE') {
                      event.stopPropagation();
                    }
                  }}
                  onPointerMove={(event) =>
                    handleZoneDragPointerMove(event, zone.id)
                  }
                  onPointerUp={(event) =>
                    handleZoneDragPointerUp(event, zone.id)
                  }
                  onPointerCancel={(event) =>
                    handleZoneDragPointerUp(event, zone.id)
                  }
                  title={
                    zone.name
                      ? `Zone: ${zone.name}`
                      : 'Zone χωρίς όνομα'
                  }
                >
                  <span className="floor-zone-label">
                    {zone.name || 'Νέα Zone'}
                  </span>

                  {activeTool === 'SELECT' && isSelected && (
                    <span
                      className="floor-zone-resize-handle"
                      aria-hidden="true"
                      onPointerDown={(event) =>
                        handleZoneResizePointerDown(event, zone)
                      }
                      onPointerMove={(event) =>
                        handleZoneResizePointerMove(event, zone.id)
                      }
                      onPointerUp={(event) =>
                        handleZoneResizePointerUp(event, zone.id)
                      }
                      onPointerCancel={(event) =>
                        handleZoneResizePointerUp(event, zone.id)
                      }
                    />
                  )}
                </button>
              );
            })}

            {draftZone && (
              <div
                className="floor-zone floor-zone--draft"
                style={{
                  left: `${draftZone.x}%`,
                  top: `${draftZone.y}%`,
                  width: `${draftZone.width}%`,
                  height: `${draftZone.height}%`,
                }}
              >
                <span>Νέα Zone</span>
              </div>
            )}
          </div>

          <svg
            className="floor-walls-layer"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-label="Τοίχοι κάτοψης"
          >
            {elements
              .filter((element) => element.type === 'WALL')
              .map((wall) => {
                const isSelected =
                  selectedElementId === wall.id;

                return (
                  <line
                    key={wall.id}
                    x1={wall.startX}
                    y1={wall.startY}
                    x2={wall.endX}
                    y2={wall.endY}
                    className={`floor-wall ${
                      isSelected
                        ? 'floor-wall--selected'
                        : ''
                    }`}
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();

                      if (activeTool === 'DELETE') {
                        onElementsChange(
                          elements.filter(
                            (element) => element.id !== wall.id
                          )
                        );

                        onElementSelect(null);
                        return;
                      }

                      if (activeTool === 'SELECT') {
                        onElementSelect(wall.id);
                      }
                    }}
                  />
                );
              })}
          </svg>  

          <svg
            className="route-connections-layer"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-label="Συνδέσεις κόμβων διαδρομής"
          >
            {routeConnections.map((connection) => {
              const fromNode = elements.find(
                (element) =>
                  element.id === connection.fromNodeId
              );

              const toNode = elements.find(
                (element) =>
                  element.id === connection.toNodeId
              );

              const isBlockedByFire =
                blockedConnectionIdSet.has(
                  connection.id
                );

              if (!fromNode || !toNode) {
                return null;
              }

              return (
                <line
                  key={connection.id}
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  className={`route-connection-line ${
                    isBlockedByFire
                      ? 'route-connection--fire-blocked'
                      : ''
                  }`}                  
                  vectorEffect="non-scaling-stroke"
                />
              );
            })}
          </svg>

          <svg
            className="evacuation-routes-layer"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-label="Προτεινόμενες διαδρομές εκκένωσης"
          >
            <defs>
              <marker
                id="evacuation-arrow"
                markerWidth="5"
                markerHeight="5"
                refX="4"
                refY="2.5"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <path
                  d="M 0 0 L 5 2.5 L 0 5 z"
                  className="evacuation-route-arrow"
                />
              </marker>
            </defs>

            {evacuationRoutes.map((route) => {
              const polylinePoints = route.points
                .map((point) => `${point.x},${point.y}`)
                .join(' ');

              return (
                <g key={route.id}>
                  <polyline
                    className="evacuation-route-shadow"
                    points={polylinePoints}
                    vectorEffect="non-scaling-stroke"
                  />

                  <polyline
                    className="evacuation-route-line"
                    points={polylinePoints}
                    vectorEffect="non-scaling-stroke"
                    markerEnd="url(#evacuation-arrow)"
                  />

                  {route.points.slice(1, -1).map((point, index) => (
                    <circle
                      key={`${route.id}-point-${index}`}
                      className="evacuation-route-turn"
                      cx={point.x}
                      cy={point.y}
                      r="0.65"
                      vectorEffect="non-scaling-stroke"
                    />
                  ))}
                </g>
              );
            })}
          </svg>

          <div className="floor-elements-layer">
            {markers.map((element) => {
              const information = elementInformation[element.type];

              if (!information) {
                return null;
              }

              const isSelected =
                selectedElementId === element.id;

              const isDragging =
                draggingElementId === element.id;

              let markerLabel = information.label;

              if (
                element.type === 'OCCUPANT' &&
                element.name
              ) {
                markerLabel = element.name;
              }

              if (element.type === 'EXIT' && element.name) {
                markerLabel = element.name;
              }

              if (
                element.type === 'FIRE_POINT' &&
                element.area
              ) {
                markerLabel = `Φωτιά: ${element.area}`;
              }

              if (
                ['STAIR', 'ELEVATOR', 'EXTINGUISHER', 'ASSEMBLY_POINT'].includes(
                  element.type
                ) &&
                element.name
              ) {
                markerLabel = element.name;
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
                  } ${
                    element.type === 'ROUTE_NODE' &&
                    blockedNodeIdSet.has(element.id)
                      ? 'floor-element-marker--fire-blocked'
                      : ''
                  } ${
                    pendingRouteNodeId === element.id
                      ? 'floor-element-marker--connection-pending'
                      : ''
                  }`}
                  type="button"
                  style={{
                    left: `${element.x}%`,
                    top: `${element.y}%`,
                  }}
                  title={`${information.label} — x: ${element.x}%, y: ${element.y}%`}
                  onClick={(event) => {
                    if (
                      activeTool === 'CONNECT_NODES' &&
                      element.type === 'ROUTE_NODE'
                    ) {
                      event.stopPropagation();
                      onRouteNodeConnect(element.id);
                      return;
                    }

                    handleElementClick(event, element.id);
                  }}
                  onPointerDown={(event) =>
                    handleMarkerPointerDown(
                      event,
                      element.id
                    )
                  }
                  onPointerMove={(event) =>
                    handleMarkerPointerMove(
                      event,
                      element.id
                    )
                  }
                  onPointerUp={(event) =>
                    handleMarkerPointerUp(
                      event,
                      element.id
                    )
                  }
                  onPointerCancel={(event) =>
                    handleMarkerPointerUp(
                      event,
                      element.id
                    )
                  }
                >
                  <span aria-hidden="true">
                    {information.symbol}
                  </span>

                  <span className="floor-element-marker-label">
                    {markerLabel}
                  </span>
                </button>
              );
            })}
          </div>

          {elements.length === 0 && (
            <div className="floor-editor-helper">
              Επιλέξτε ένα εργαλείο και τοποθετήστε στοιχεία
              στην κάτοψη.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default FloorEditorCanvas;