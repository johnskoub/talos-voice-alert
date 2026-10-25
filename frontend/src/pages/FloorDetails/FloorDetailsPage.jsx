import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import PageContainer from '../../components/PageContainer/PageContainer';
import FloorPlanUploader from '../../components/FloorPlanUploader/FloorPlanUploader';
import FloorPlanCanvas from '../../components/FloorPlanCanvas/FloorPlanCanvas';

import {
  getCompany,
  getFloor,
} from '../../services/api';

import {
  loadFloorPlanFromSession,
  readImageFileAsDataUrl,
  saveFloorPlanToSession,
} from '../../services/floorPlanStorage';

import './FloorDetailsPage.css';

function FloorDetailsPage() {
  const { companyId, floorId } = useParams();
  const navigate = useNavigate();

  const numericCompanyId = Number(companyId);
  const numericFloorId = Number(floorId);

  const [company, setCompany] = useState(null);
  const [floor, setFloor] = useState(null);

  const [floorPlanImage, setFloorPlanImage] = useState(null);
  const [floorPlanImageName, setFloorPlanImageName] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError('');

        const [companyData, floorData] = await Promise.all([
          getCompany(numericCompanyId),
          getFloor(numericFloorId),
        ]);

        /*
         * Έλεγχος ότι ο όροφος ανήκει πράγματι
         * στην επιχείρηση που βρίσκεται στο URL.
         */
        if (
          floorData &&
          floorData.companyId !== undefined &&
          Number(floorData.companyId) !== numericCompanyId
        ) {
          throw new Error(
            'Ο όροφος δεν ανήκει στην συγκεκριμένη επιχείρηση.'
          );
        }

        setCompany(companyData);
        setFloor(floorData);

        /*
         * Η κάτοψη έρχεται πλέον από το backend.
         */
        if (floorData?.floorPlanImage) {
          setFloorPlanImage(floorData.floorPlanImage);

          setFloorPlanImageName(
            floorData.floorPlanImage
              .split('/')
              .pop() || 'floor-plan'
          );
        } else {
          /*
           * Backup: παλιά κάτοψη από session.
           */
          const storedFloorPlan =
            loadFloorPlanFromSession(
              numericCompanyId,
              numericFloorId
            );

          if (storedFloorPlan?.imageDataUrl) {
            setFloorPlanImage(
              storedFloorPlan.imageDataUrl
            );

            setFloorPlanImageName(
              storedFloorPlan.imageName || ''
            );
          }
        }
      } catch (err) {
        console.error(
          'Failed to load company/floor:',
          err
        );

        setError(
          err.message ||
            'Δεν ήταν δυνατή η φόρτωση των στοιχείων του ορόφου.'
        );
      } finally {
        setLoading(false);
      }
    };

    if (
      Number.isFinite(numericCompanyId) &&
      Number.isFinite(numericFloorId)
    ) {
      loadData();
    } else {
      setLoading(false);
      setError('Μη έγκυρο ID επιχείρησης ή ορόφου.');
    }
  }, [numericCompanyId, numericFloorId]);

  const handleImageSelect = async (selectedFile) => {
    try {
      setUploadError('');

      const imageDataUrl =
        await readImageFileAsDataUrl(selectedFile);

      saveFloorPlanToSession({
        companyId: numericCompanyId,
        floorId: numericFloorId,
        imageDataUrl,
        imageName: selectedFile.name,
      });

      setFloorPlanImage(imageDataUrl);
      setFloorPlanImageName(selectedFile.name);
    } catch (err) {
      setUploadError(
        err.message || 'Αποτυχία φόρτωσης εικόνας.'
      );
    }
  };

  const handleOpenEditor = () => {
    console.log('OPEN EDITOR CLICKED');
    console.log(
      `/companies/${numericCompanyId}/floors/${numericFloorId}/editor`
    );

    navigate(
      `/companies/${numericCompanyId}/floors/${numericFloorId}/editor`
    );
  };

  if (loading) {
    return (
      <PageContainer>
        <section className="floor-not-found">
          <h2>Φόρτωση ορόφου...</h2>
        </section>
      </PageContainer>
    );
  }

  if (error || !company || !floor) {
    return (
      <PageContainer>
        <section className="floor-not-found">
          <h2>
            {error || 'Ο όροφος δεν βρέθηκε'}
          </h2>

          <button
            type="button"
            onClick={() =>
              navigate(`/companies/${companyId}`)
            }
          >
            Επιστροφή στην επιχείρηση
          </button>
        </section>
      </PageContainer>
    );
  }

  const floorPlanStatus = floorPlanImage
    ? 'Έτοιμη'
    : 'Δεν έχει ξεκινήσει';

  return (
    <PageContainer>
      <section className="floor-details-header">
        <div>
          <button
            className="floor-details-back"
            type="button"
            onClick={() =>
              navigate(`/companies/${companyId}`)
            }
          >
            ← Επιστροφή στην επιχείρηση
          </button>

          <p className="floor-details-eyebrow">
            FLOOR MANAGEMENT
          </p>

          <h2>{floor.name}</h2>

          <p className="floor-details-description">
            {company.name} · Διαχείριση κάτοψης και
            στοιχείων ασφαλείας
          </p>
        </div>

        <button
          className="open-editor-button"
          type="button"
          disabled={!floorPlanImage}
          onClick={handleOpenEditor}
        >
          Άνοιγμα Floor Plan Editor
        </button>
      </section>

      <section className="floor-summary">
        <div>
          <span>Κατάσταση κάτοψης</span>
          <strong>{floorPlanStatus}</strong>
        </div>

        <div>
          <span>Περιοχές</span>
          <strong>{floor.zoneCount ?? 0}</strong>
        </div>

        <div>
          <span>Έξοδοι κινδύνου</span>
          <strong>{floor.exitCount ?? 0}</strong>
        </div>

        <div>
          <span>Παρευρισκόμενοι</span>
          <strong>{floor.occupantCount ?? 0}</strong>
        </div>
      </section>

      <div className="floor-plan-management">
        <FloorPlanUploader
          onImageSelect={handleImageSelect}
          hasImage={Boolean(floorPlanImage)}
        />

        {uploadError && (
          <p
            className="floor-plan-upload-error"
            role="alert"
          >
            {uploadError}
          </p>
        )}

        <FloorPlanCanvas
          imageUrl={floorPlanImage}
          imageName={floorPlanImageName}
        />
      </div>

      <section className="floor-elements-preview">
        <div className="floor-elements-preview-header">
          <div>
            <p>FLOOR ELEMENTS</p>

            <h3>
              Στοιχεία ασφαλείας ορόφου
            </h3>
          </div>

          <span>Editor required</span>
        </div>

        <div className="floor-elements-list">
          <div>
            <strong>Zones</strong>
            <span>
              Οι ζώνες θα φορτωθούν από τα
              Floor Elements.
            </span>
          </div>

          <div>
            <strong>Emergency Exits</strong>
            <span>
              Οι έξοδοι θα φορτωθούν από τα
              Floor Elements.
            </span>
          </div>

          <div>
            <strong>Safety Elements</strong>
            <span>
              Σκάλες, πυροσβεστήρες,
              ανελκυστήρες κ.λπ.
            </span>
          </div>

          <div>
            <strong>Simulation Elements</strong>
            <span>
              Fire Points και παρευρισκόμενοι.
            </span>
          </div>
        </div>
      </section>
    </PageContainer>
  );
}

export default FloorDetailsPage;