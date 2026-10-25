import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import PageContainer from '../../components/PageContainer/PageContainer';
import FloorGrid from '../../components/FloorGrid/FloorGrid';
import {
getCompany,
getCompanyFloors,
getCompanyUsers,
createFloor,
} from '../../services/api';
import './CompanyDetailsPage.css';

function CompanyDetailsPage() {
  const { companyId } = useParams();
  const navigate = useNavigate();

  const [company, setCompany] = useState(null);
  const [companyFloors, setCompanyFloors] = useState([]);
  const [occupantCount, setOccupantCount] = useState(0);

  const [showAddFloorForm, setShowAddFloorForm] =
    useState(false);

  const [newFloorName, setNewFloorName] =
    useState('');

  const [newFloorNumber, setNewFloorNumber] =
    useState('');

  const [newFloorDescription, setNewFloorDescription] =
    useState('');

  const [creatingFloor, setCreatingFloor] =
    useState(false);

  const [createFloorError, setCreateFloorError] =
    useState('');

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

  const handleCreateFloor = async (event) => {
    event.preventDefault();

    try {
      setCreatingFloor(true);
      setCreateFloorError('');

      const createdFloor = await createFloor(
        numericCompanyId,
        {
          name: newFloorName.trim(),
          floorNumber: Number(newFloorNumber),
          description: newFloorDescription.trim(),
          floorPlanImage: null,
          active: true,
        }
      );

      setCompanyFloors((currentFloors) => [
        ...currentFloors,
        createdFloor,
      ]);

      setNewFloorName('');
      setNewFloorNumber('');
      setNewFloorDescription('');

      setShowAddFloorForm(false);

    } catch (err) {
      console.error(
        'Error creating floor:',
        err
      );

      setCreateFloorError(
        err.message ||
        'Αποτυχία δημιουργίας ορόφου.'
      );
    } finally {
      setCreatingFloor(false);
    }
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
          onClick={() => {
            setCreateFloorError('');
            setShowAddFloorForm(true);
          }}
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

      {showAddFloorForm && (
        <div className="add-floor-modal-overlay">
          <div
            className="add-floor-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-floor-modal-title"
          >

            <div className="add-floor-modal-header">
              <div>
                <p className="company-details-eyebrow">
                  ΝΕΟΣ ΟΡΟΦΟΣ
                </p>

                <h3 id="add-floor-modal-title">
                  Προσθήκη ορόφου
                </h3>
              </div>

              <button
                type="button"
                className="add-floor-modal-close"
                onClick={() => {
                  setShowAddFloorForm(false);
                  setCreateFloorError('');
                }}
                disabled={creatingFloor}
                aria-label="Κλείσιμο"
              >
                ×
              </button>
            </div>

            <p className="add-floor-modal-description">
              Συμπληρώστε τα στοιχεία του νέου ορόφου.
            </p>

            <form onSubmit={handleCreateFloor}>

              <div className="add-floor-form-grid">

                <div className="add-floor-field">
                  <label htmlFor="floor-name">
                    Όνομα ορόφου
                  </label>

                  <input
                    id="floor-name"
                    type="text"
                    value={newFloorName}
                    onChange={(event) =>
                      setNewFloorName(event.target.value)
                    }
                    placeholder="π.χ. Second Floor"
                    required
                  />
                </div>

                <div className="add-floor-field">
                  <label htmlFor="floor-number">
                    Αριθμός ορόφου
                  </label>

                  <input
                    id="floor-number"
                    type="number"
                    value={newFloorNumber}
                    onChange={(event) =>
                      setNewFloorNumber(event.target.value)
                    }
                    placeholder="π.χ. 2"
                    required
                  />
                </div>

                <div className="add-floor-field add-floor-field-full">
                  <label htmlFor="floor-description">
                    Περιγραφή
                  </label>

                  <textarea
                    id="floor-description"
                    value={newFloorDescription}
                    onChange={(event) =>
                      setNewFloorDescription(
                        event.target.value
                      )
                    }
                    placeholder="Προαιρετική περιγραφή..."
                    rows="3"
                  />
                </div>

              </div>

              {createFloorError && (
                <p className="add-floor-error">
                  {createFloorError}
                </p>
              )}

              <div className="add-floor-form-actions">

                <button
                  type="button"
                  className="add-floor-cancel-button"
                  onClick={() => {
                    setShowAddFloorForm(false);
                    setCreateFloorError('');
                  }}
                  disabled={creatingFloor}
                >
                  Ακύρωση
                </button>

                <button
                  type="submit"
                  className="add-floor-submit-button"
                  disabled={creatingFloor}
                >
                  {creatingFloor
                    ? 'Δημιουργία...'
                    : 'Δημιουργία ορόφου'}
                </button>

              </div>

            </form>
          </div>
        </div>
      )}

    </PageContainer>
  );
}

export default CompanyDetailsPage;