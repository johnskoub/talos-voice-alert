import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import PageContainer from '../../components/PageContainer/PageContainer';
import FloorPlanUploader from '../../components/FloorPlanUploader/FloorPlanUploader';
import FloorPlanCanvas from '../../components/FloorPlanCanvas/FloorPlanCanvas';
import companyMockData from '../../services/companyMockData';
import floorMockData from '../../services/floorMockData';
import './FloorDetailsPage.css';

function FloorDetailsPage() {
  const { companyId, floorId } = useParams();
  const navigate = useNavigate();

  const [floorPlanImage, setFloorPlanImage] = useState(null);
  const [floorPlanImageName, setFloorPlanImageName] = useState('');

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

  useEffect(() => {
    return () => {
      if (floorPlanImage) {
        URL.revokeObjectURL(floorPlanImage);
      }
    };
  }, [floorPlanImage]);

  const handleImageSelect = (selectedFile) => {
    if (floorPlanImage) {
      URL.revokeObjectURL(floorPlanImage);
    }

    const temporaryImageUrl = URL.createObjectURL(selectedFile);

    setFloorPlanImage(temporaryImageUrl);
    setFloorPlanImageName(selectedFile.name);
  };

  if (!company || !floor) {
    return (
      <PageContainer>
        <section className="floor-not-found">
          <h2>Ο όροφος δεν βρέθηκε</h2>

          <button
            type="button"
            onClick={() => navigate(`/companies/${companyId}`)}
          >
            Επιστροφή στην επιχείρηση
          </button>
        </section>
      </PageContainer>
    );
  }

  const floorPlanStatusLabels = {
    READY: 'Έτοιμη',
    DRAFT: 'Σε επεξεργασία',
    NOT_STARTED: 'Δεν έχει ξεκινήσει',
  };

  return (
    <PageContainer>
      <section className="floor-details-header">
        <div>
          <button
            className="floor-details-back"
            type="button"
            onClick={() => navigate(`/companies/${companyId}`)}
          >
            ← Επιστροφή στην επιχείρηση
          </button>

          <p className="floor-details-eyebrow">FLOOR MANAGEMENT</p>

          <h2>{floor.name}</h2>

          <p className="floor-details-description">
            {company.name} · Διαχείριση κάτοψης και στοιχείων ασφαλείας
          </p>
        </div>

        <button
          className="open-editor-button"
          type="button"
          disabled={!floorPlanImage}
        >
          Άνοιγμα Floor Plan Editor
        </button>
      </section>

      <section className="floor-summary">
        <div>
          <span>Κατάσταση κάτοψης</span>
          <strong>
            {floorPlanStatusLabels[floor.floorPlanStatus]}
          </strong>
        </div>

        <div>
          <span>Περιοχές</span>
          <strong>{floor.zoneCount}</strong>
        </div>

        <div>
          <span>Έξοδοι κινδύνου</span>
          <strong>{floor.exitCount}</strong>
        </div>

        <div>
          <span>Παρευρισκόμενοι</span>
          <strong>{floor.occupantCount}</strong>
        </div>
      </section>

      <div className="floor-plan-management">
        <FloorPlanUploader
          onImageSelect={handleImageSelect}
          hasImage={Boolean(floorPlanImage)}
        />

        <FloorPlanCanvas
          imageUrl={floorPlanImage}
          imageName={floorPlanImageName}
        />
      </div>

      <section className="floor-elements-preview">
        <div className="floor-elements-preview-header">
          <div>
            <p>FLOOR ELEMENTS</p>
            <h3>Στοιχεία ασφαλείας ορόφου</h3>
          </div>

          <span>Editor required</span>
        </div>

        <div className="floor-elements-list">
          <div>
            <strong>Zones</strong>
            <span>Reception, Storage, Office, Server Room</span>
          </div>

          <div>
            <strong>Emergency Exits</strong>
            <span>Ανατολική και δυτική έξοδος</span>
          </div>

          <div>
            <strong>Safety Elements</strong>
            <span>Σκάλες, πυροσβεστήρες, ανελκυστήρες</span>
          </div>

          <div>
            <strong>Simulation Elements</strong>
            <span>Fire Points και παρευρισκόμενοι</span>
          </div>
        </div>
      </section>
    </PageContainer>
  );
}

export default FloorDetailsPage;