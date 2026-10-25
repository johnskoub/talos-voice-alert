import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import PageContainer from '../../components/PageContainer/PageContainer';
import FloorGrid from '../../components/FloorGrid/FloorGrid';
import {
getCompany,
getCompanyFloors,
getCompanyUsers,
} from '../../services/api';
import './CompanyDetailsPage.css';

function CompanyDetailsPage() {
  const { companyId } = useParams();
  const navigate = useNavigate();

  const [company, setCompany] = useState(null);
  const [companyFloors, setCompanyFloors] = useState([]);
  const [occupantCount, setOccupantCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const numericCompanyId = Number(companyId);

  useEffect(() => {
    const loadCompanyData = async () => {
      try {
        setLoading(true);
        setError('');

      const [companyData, floorsData, usersData] =
        await Promise.all([
          getCompany(numericCompanyId),
          getCompanyFloors(numericCompanyId),
          getCompanyUsers(numericCompanyId),
        ]);

      setCompany(companyData);
      setCompanyFloors(floorsData || []);
      setOccupantCount(
       Array.isArray(usersData)
          ? usersData.length
          : 0
        );
      } catch (err) {
        console.error(
          'Error loading company details:',
          err
        );

        setError(
          'Δεν ήταν δυνατή η φόρτωση των στοιχείων της επιχείρησης.'
        );
      } finally {
        setLoading(false);
      }
    };

    if (!Number.isNaN(numericCompanyId)) {
      loadCompanyData();
    }
  }, [numericCompanyId]);

  const handleFloorSelect = (floorId) => {
    navigate(
      `/companies/${numericCompanyId}/floors/${floorId}`
    );
  };

  if (loading) {
    return (
      <PageContainer>
        <section className="company-not-found">
        <h2>Φόρτωση επιχείρησης...</h2>
        </section>
      </PageContainer>
    );
  }

  if (error || !company) {
    return (
    <PageContainer>
    <section className="company-not-found">
    <h2>
    {error || 'Η επιχείρηση δεν βρέθηκε'}
    </h2>
    <button
            type="button"
            onClick={() => navigate('/dashboard')}
          >
            Επιστροφή στο Dashboard
          </button>
        </section>
      </PageContainer>
    );
  }

  const readyFloorCount = companyFloors.filter(
    (floor) =>
    floor.floorPlanImage &&
    floor.floorPlanImage.trim() !== ''
  ).length;

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
          <p className="company-details-eyebrow">
              COMPANY DETAILS
          </p>

          <h2>{company.name}</h2>

          <p className="company-details-address">
            {company.address}
          </p>
        </div>

        <button
          className="add-floor-button"
          type="button"
        >
          <span aria-hidden="true">+</span>
          Προσθήκη ορόφου
        </button>
      </section>

      <section className="company-summary">
        <div>
          <span>Κατάσταση</span>

          <strong>
            {company.active
              ? 'Ενεργή'
              : 'Ανενεργή'}
          </strong>
        </div>

        <div>
          <span>Όροφοι</span>

          <strong>
            {companyFloors.length}
          </strong>
        </div>

        <div>
          <span>Παρευρισκόμενοι</span>

          <strong>
            {occupantCount}
          </strong>
        </div>

        <div>
          <span>Έτοιμες κατόψεις</span>

          <strong>
            {readyFloorCount}
          </strong>
        </div>
      </section>

      <section className="floors-section">
        <div className="floors-section-header">
          <div>
            <h3>Όροφοι επιχείρησης</h3>

            <p>
              Επιλέξτε έναν όροφο για να ανοίξετε την
              κάτοψη και τα στοιχεία ασφαλείας του.
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