import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import PageContainer from '../../components/PageContainer/PageContainer';
import FloorEditorToolbar from '../../components/FloorEditorToolbar/FloorEditorToolbar';
import FloorEditorCanvas from '../../components/FloorEditorCanvas/FloorEditorCanvas';
import FloorElementProperties from '../../components/FloorElementProperties/FloorElementProperties';
import EvacuationAnalysis from '../../components/EvacuationAnalysis/EvacuationAnalysis';
import EmergencyAlert from '../../components/EmergencyAlert/EmergencyAlert';

import companyMockData from '../../services/companyMockData';
import floorMockData from '../../services/floorMockData';

import {
  loadFloorElements,
  saveFloorElements,
} from '../../services/floorElementStorage';

import { loadFloorPlanFromSession } from '../../services/floorPlanStorage';
import { analyzeEvacuation } from '../../services/evacuationAnalysis';
import { generateEvacuationRoutes } from '../../services/evacuationRouteGenerator';
import { generateEmergencyAlert } from '../../services/emergencyAlertGenerator';

import { findContainingZone } from '../../utils/floorZoneUtils';
import {
  loadRouteConnections,
  saveRouteConnections,
} from '../../services/routeConnectionStorage';

import './FloorPlanEditorPage.css';

function FloorPlanEditorPage() {
  const { companyId, floorId } = useParams();
  const navigate = useNavigate();

  const numericCompanyId = Number(companyId);
  const numericFloorId = Number(floorId);

  const [activeTool, setActiveTool] = useState('SELECT');

  const [selectedElementId, setSelectedElementId] =
    useState(null);

  const [elements, setElements] = useState(() =>
    loadFloorElements(
      numericCompanyId,
      numericFloorId
    )
  );

  const [saveMessage, setSaveMessage] =
    useState('');

  const [evacuationAnalysis, setEvacuationAnalysis] =
    useState(null);

  const [evacuationRoutes, setEvacuationRoutes] =
    useState([]);

  const [emergencyAlert, setEmergencyAlert] =
    useState(null);

  const [routeConnections, setRouteConnections] =
    useState(() =>
      loadRouteConnections(
        numericCompanyId,
        numericFloorId
      )
    );

  const [pendingRouteNodeId, setPendingRouteNodeId] =
    useState(null);

  const company = companyMockData.find(
    (item) => item.id === numericCompanyId
  );

  const floor = floorMockData.find(
    (item) =>
      item.id === numericFloorId &&
      item.companyId === numericCompanyId
  );

  const storedFloorPlan = loadFloorPlanFromSession(
    numericCompanyId,
    numericFloorId
  );

  const selectedElement = elements.find(
    (element) => element.id === selectedElementId
  );

  const selectedElementZone = findContainingZone(
    selectedElement,
    elements
  );

  const clearEvacuationResults = () => {
    setEvacuationAnalysis(null);
    setEvacuationRoutes([]);
    setEmergencyAlert(null);
  };

const handleRunEvacuationAnalysis = () => {
  const result = analyzeEvacuation(elements);

  const generatedRoutes =
    generateEvacuationRoutes(
      result,
      elements,
      routeConnections
    );

  const routedOccupantIds = new Set(
    generatedRoutes.map(
      (route) => route.occupantId
    )
  );

  const updatedRecommendations =
    result.recommendations.map(
      (recommendation) => {
        if (
          recommendation.action !== 'EVACUATE'
        ) {
          return recommendation;
        }

        const hasSafeGraphRoute =
          routedOccupantIds.has(
            recommendation.occupant.id
          );

        if (hasSafeGraphRoute) {
          return recommendation;
        }

        return {
          ...recommendation,
          action: 'SHELTER_IN_PLACE',
          recommendedExit: null,
          reason: 'NO_SAFE_GRAPH_ROUTE',
        };
      }
    );

  const updatedResult = {
    ...result,
    recommendations:
      updatedRecommendations,
  };

  const generatedAlert =
    generateEmergencyAlert(updatedResult);

  setEvacuationAnalysis(updatedResult);
  setEvacuationRoutes(generatedRoutes);
  setEmergencyAlert(generatedAlert);
};

  const handleToolChange = (toolId) => {
    setActiveTool(toolId);

    if (toolId !== 'SELECT') {
      setSelectedElementId(null);
    }

    if (toolId !== 'CONNECT_NODES') {
      setPendingRouteNodeId(null);
    }
  };

  const handleElementPropertiesChange = (
    elementId,
    changedProperties
  ) => {
    setElements((currentElements) =>
      currentElements.map((element) =>
        element.id === elementId
          ? {
              ...element,
              ...changedProperties,
            }
          : element
      )
    );

    clearEvacuationResults();
  };

  const handleElementsChange = (updatedElements) => {
    setElements(updatedElements);

    /*
     * Οποιαδήποτε αλλαγή στη γεωμετρία ή στα Floor Elements
     * καθιστά την προηγούμενη evacuation analysis παλιά.
     */
    clearEvacuationResults();
  };

  const handleSaveChanges = () => {
    saveFloorElements(
      numericCompanyId,
      numericFloorId,
      elements
    );
    
    saveRouteConnections(
      numericCompanyId,
      numericFloorId,
      routeConnections
    );

    setSaveMessage(
      `Αποθηκεύτηκαν ${elements.length} Floor Elements.`
    );

    window.setTimeout(() => {
      setSaveMessage('');
    }, 2500);
  };

  const handleRouteNodeConnect = (nodeId) => {
    if (!pendingRouteNodeId) {
      setPendingRouteNodeId(nodeId);
      return;
    }

    if (pendingRouteNodeId === nodeId) {
      setPendingRouteNodeId(null);
      return;
    }

    const connectionAlreadyExists =
      routeConnections.some(
        (connection) =>
          (connection.fromNodeId ===
            pendingRouteNodeId &&
            connection.toNodeId === nodeId) ||
          (connection.fromNodeId === nodeId &&
            connection.toNodeId ===
              pendingRouteNodeId)
      );

    if (!connectionAlreadyExists) {
      const newConnection = {
        id: `connection-${pendingRouteNodeId}-${nodeId}`,
        fromNodeId: pendingRouteNodeId,
        toNodeId: nodeId,
        status: 'AVAILABLE',
      };

      setRouteConnections(
        (currentConnections) => [
          ...currentConnections,
          newConnection,
        ]
      );
    }

    setPendingRouteNodeId(null);
  };

  if (!company || !floor || !storedFloorPlan) {
    return (
      <PageContainer>
        <section className="floor-editor-unavailable">
          <h2>
            Ο Floor Plan Editor δεν είναι διαθέσιμος
          </h2>

          <p>
            Δεν βρέθηκε επιχείρηση, όροφος ή
            αποθηκευμένη εικόνα κάτοψης.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate(
                `/companies/${companyId}/floors/${floorId}`
              )
            }
          >
            Επιστροφή στη διαχείριση ορόφου
          </button>
        </section>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <section className="floor-editor-page-header">
        <div>
          <button
            className="floor-editor-back"
            type="button"
            onClick={() =>
              navigate(
                `/companies/${companyId}/floors/${floorId}`
              )
            }
          >
            ← Επιστροφή στη διαχείριση ορόφου
          </button>

          <p className="floor-editor-eyebrow">
            FLOOR PLAN EDITOR
          </p>

          <h2>{floor.name}</h2>

          <p>
            {company.name} · Τοποθέτηση περιοχών και
            Floor Elements
          </p>
        </div>

        <div className="floor-editor-save-area">
          {saveMessage && (
            <p
              className="floor-editor-save-message"
              role="status"
            >
              {saveMessage}
            </p>
          )}

          <button
            className="floor-editor-save-button"
            type="button"
            onClick={handleSaveChanges}
          >
            Αποθήκευση αλλαγών
          </button>
        </div>
      </section>

      <div className="floor-editor-layout">
        <FloorEditorToolbar
          activeTool={activeTool}
          onToolChange={handleToolChange}
        />

        <FloorEditorCanvas
          imageUrl={storedFloorPlan.imageDataUrl}
          imageName={storedFloorPlan.imageName}
          activeTool={activeTool}
          elements={elements}
          onElementsChange={handleElementsChange}
          selectedElementId={selectedElementId}
          onElementSelect={setSelectedElementId}
          evacuationRoutes={evacuationRoutes}
          routeConnections={routeConnections}
          pendingRouteNodeId={pendingRouteNodeId}
          onRouteNodeConnect={handleRouteNodeConnect}
        />

        <FloorElementProperties
          element={selectedElement}
          containingZone={selectedElementZone}
          onElementChange={
            handleElementPropertiesChange
          }
        />
      </div>

      <EvacuationAnalysis
        analysis={evacuationAnalysis}
        onRunAnalysis={
          handleRunEvacuationAnalysis
        }
      />

      <EmergencyAlert alert={emergencyAlert} />
    </PageContainer>
  );
}

export default FloorPlanEditorPage;