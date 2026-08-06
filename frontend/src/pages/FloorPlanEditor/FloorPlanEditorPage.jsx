import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import PageContainer from '../../components/PageContainer/PageContainer';
import FloorEditorToolbar from '../../components/FloorEditorToolbar/FloorEditorToolbar';
import FloorEditorCanvas from '../../components/FloorEditorCanvas/FloorEditorCanvas';
import companyMockData from '../../services/companyMockData';
import floorMockData from '../../services/floorMockData';
import { loadFloorPlanFromSession } from '../../services/floorPlanStorage';
import { loadFloorElements, saveFloorElements, } from '../../services/floorElementStorage';
import FloorElementProperties from '../../components/FloorElementProperties/FloorElementProperties';
import { findContainingZone } from '../../utils/floorZoneUtils';
import EvacuationAnalysis from '../../components/EvacuationAnalysis/EvacuationAnalysis';
import { analyzeEvacuation } from '../../services/evacuationAnalysis';
import { generateEvacuationRoutes } from '../../services/evacuationRouteGenerator';
import './FloorPlanEditorPage.css';

function FloorPlanEditorPage() {
  const { companyId, floorId } = useParams();
  const navigate = useNavigate();

  const [activeTool, setActiveTool] = useState('SELECT');
  const [selectedElementId, setSelectedElementId] = useState(null);
  const [elements, setElements] = useState(() =>
    loadFloorElements(Number(companyId), Number(floorId))
  );
  const [saveMessage, setSaveMessage] = useState('');
  const [evacuationAnalysis, setEvacuationAnalysis] =
  useState(null);

  const [evacuationRoutes, setEvacuationRoutes] = useState([]);

  const handleRunEvacuationAnalysis = () => {
    const result = analyzeEvacuation(elements);
    const generatedRoutes = generateEvacuationRoutes(result);

    setEvacuationAnalysis(result);
    setEvacuationRoutes(generatedRoutes);
  };

  const handleToolChange = (toolId) => {
    setActiveTool(toolId);

    if (toolId !== 'SELECT') {
        setSelectedElementId(null);
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

    setEvacuationAnalysis(null);
    setEvacuationRoutes([]);
  };

  const numericCompanyId = Number(companyId);
  const numericFloorId = Number(floorId);

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

  const handleElementsChange = (updatedElements) => {
    setElements(updatedElements);

    /*
    * Η υπάρχουσα ανάλυση θεωρείται παλιά μετά από οποιαδήποτε
    * μετακίνηση, προσθήκη, διαγραφή ή αλλαγή ιδιοτήτων.
    */
    setEvacuationAnalysis(null);
    setEvacuationRoutes([]);
  };

  const handleSaveChanges = () => {
  saveFloorElements(
    numericCompanyId,
    numericFloorId,
    elements
  );

  setSaveMessage(
    `Αποθηκεύτηκαν ${elements.length} Floor Elements.`
  );

  window.setTimeout(() => {
    setSaveMessage('');
  }, 2500);
};
    
  if (!company || !floor || !storedFloorPlan) {
    return (
      <PageContainer>
        <section className="floor-editor-unavailable">
          <h2>Ο Floor Plan Editor δεν είναι διαθέσιμος</h2>

          <p>
            Δεν βρέθηκε επιχείρηση, όροφος ή αποθηκευμένη εικόνα
            κάτοψης.
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
            {company.name} · Τοποθέτηση περιοχών και Floor Elements
          </p>
        </div>

        <div className="floor-editor-save-area">
            {saveMessage && (
                <p className="floor-editor-save-message" role="status">
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
        />

        <FloorElementProperties
          element={selectedElement}
          containingZone={selectedElementZone}
          onElementChange={handleElementPropertiesChange}
        />
      </div>

      <EvacuationAnalysis
        analysis={evacuationAnalysis}
        onRunAnalysis={handleRunEvacuationAnalysis}
      />

    </PageContainer>
  );
}

export default FloorPlanEditorPage;