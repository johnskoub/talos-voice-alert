import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import PageContainer from '../../components/PageContainer/PageContainer';
import FloorEditorToolbar from '../../components/FloorEditorToolbar/FloorEditorToolbar';
import FloorEditorCanvas from '../../components/FloorEditorCanvas/FloorEditorCanvas';
import companyMockData from '../../services/companyMockData';
import floorMockData from '../../services/floorMockData';
import { loadFloorPlanFromSession } from '../../services/floorPlanStorage';
import './FloorPlanEditorPage.css';

function FloorPlanEditorPage() {
  const { companyId, floorId } = useParams();
  const navigate = useNavigate();

  const [activeTool, setActiveTool] = useState('SELECT');

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

        <button className="floor-editor-save-button" type="button">
          Αποθήκευση αλλαγών
        </button>
      </section>

      <div className="floor-editor-layout">
        <FloorEditorToolbar
          activeTool={activeTool}
          onToolChange={setActiveTool}
        />

        <FloorEditorCanvas
          imageUrl={storedFloorPlan.imageDataUrl}
          imageName={storedFloorPlan.imageName}
          activeTool={activeTool}
        />
      </div>
    </PageContainer>
  );
}

export default FloorPlanEditorPage;