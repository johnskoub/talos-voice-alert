import { useNavigate, useParams } from 'react-router';
import PageContainer from '../../components/PageContainer/PageContainer';
import './FloorDetailsPage.css';

function FloorDetailsPage() {
  const { companyId, floorId } = useParams();
  const navigate = useNavigate();

  return (
    <PageContainer>
      <button
        className="floor-details-back"
        type="button"
        onClick={() => navigate(`/companies/${companyId}`)}
      >
        ← Επιστροφή στην επιχείρηση
      </button>

      <p className="floor-details-eyebrow">FLOOR MANAGEMENT</p>

      <h2 className="floor-details-title">
        Όροφος #{floorId}
      </h2>

      <p className="floor-details-description">
        Εδώ θα δημιουργήσουμε την κάτοψη, τις περιοχές και τα Floor
        Elements του ορόφου.
      </p>
    </PageContainer>
  );
}

export default FloorDetailsPage;