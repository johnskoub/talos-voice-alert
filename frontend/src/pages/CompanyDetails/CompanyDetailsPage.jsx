import { useNavigate, useParams } from 'react-router';
import PageContainer from '../../components/PageContainer/PageContainer';
import FloorGrid from '../../components/FloorGrid/FloorGrid';
import companyMockData from '../../services/companyMockData';
import floorMockData from '../../services/floorMockData';
import './CompanyDetailsPage.css';

function CompanyDetailsPage() {
  const { companyId } = useParams();
  const navigate = useNavigate();

  const numericCompanyId = Number(companyId);

  const company = companyMockData.find(
    (item) => item.id === numericCompanyId
  );

  const companyFloors = floorMockData.filter(
    (floor) => floor.companyId === numericCompanyId
  );

  const handleFloorSelect = (floorId) => {
    navigate(`/companies/${numericCompanyId}/floors/${floorId}`);
  };

  if (!company) {
    return (
      <PageContainer>
        <section className="company-not-found">
          <h2>Η επιχείρηση δεν βρέθηκε</h2>

          <button type="button" onClick={() => navigate('/dashboard')}>
            Επιστροφή στο Dashboard
          </button>
        </section>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <section className="company-details-header">
        <div>
          <button
            className="company-back-button"
            type="button"
            onClick={() => navigate('/dashboard')}
          >
            ← Επιστροφή στις επιχειρήσεις
          </button>

          <p className="company-details-eyebrow">COMPANY DETAILS</p>

          <h2>{company.name}</h2>

          <p className="company-details-address">
            {company.address}, {company.city}
          </p>
        </div>

        <button className="add-floor-button" type="button">
          <span aria-hidden="true">+</span>
          Προσθήκη ορόφου
        </button>
      </section>

      <section className="company-summary">
        <div>
          <span>Κατάσταση</span>
          <strong>
            {company.status === 'ACTIVE' ? 'Ενεργή' : 'Ανενεργή'}
          </strong>
        </div>

        <div>
          <span>Όροφοι</span>
          <strong>{companyFloors.length}</strong>
        </div>

        <div>
          <span>Παρευρισκόμενοι</span>
          <strong>{company.occupantCount}</strong>
        </div>

        <div>
          <span>Έτοιμες κατόψεις</span>
          <strong>
            {
              companyFloors.filter(
                (floor) => floor.floorPlanStatus === 'READY'
              ).length
            }
          </strong>
        </div>
      </section>

      <section className="floors-section">
        <div className="floors-section-header">
          <div>
            <h3>Όροφοι επιχείρησης</h3>
            <p>
              Επιλέξτε έναν όροφο για να ανοίξετε την κάτοψη και τα
              στοιχεία ασφαλείας του.
            </p>
          </div>
        </div>

        <FloorGrid
          floors={companyFloors}
          onFloorSelect={handleFloorSelect}
        />
      </section>
    </PageContainer>
  );
}

export default CompanyDetailsPage;