import { useParams } from 'react-router';
import PageContainer from '../../components/PageContainer/PageContainer';
import './CompanyDetailsPage.css';

function CompanyDetailsPage() {
  const { companyId } = useParams();

  return (
    <PageContainer>
      <p className="company-details-eyebrow">COMPANY DETAILS</p>

      <h2 className="company-details-title">
        Επιχείρηση #{companyId}
      </h2>

      <p className="company-details-description">
        Στο επόμενο στάδιο θα εμφανίζονται εδώ τα στοιχεία και οι
        όροφοι της επιχείρησης.
      </p>
    </PageContainer>
  );
}

export default CompanyDetailsPage;