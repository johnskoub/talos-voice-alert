import { useNavigate } from 'react-router';
import PageContainer from '../../components/PageContainer/PageContainer';
import CompanyGrid from '../../components/CompanyGrid/CompanyGrid';
import companyMockData from '../../services/companyMockData';
import './DashboardPage.css';

function DashboardPage() {
  const navigate = useNavigate();

  const handleCompanySelect = (companyId) => {
    navigate(`/companies/${companyId}`);
  };

  return (
    <PageContainer>
      <section className="dashboard-heading">
        <div>
          <p className="dashboard-eyebrow">OVERVIEW</p>

          <h2>Πίνακας διαχείρισης</h2>

          <p>
            Διαχειριστείτε τις επιχειρήσεις, τους ορόφους και τις
            προσομοιώσεις εκκένωσης.
          </p>
        </div>

        <button className="add-company-button" type="button">
          <span aria-hidden="true">+</span>
          Νέα επιχείρηση
        </button>
      </section>

      <section className="companies-section">
        <div className="companies-section-header">
          <div>
            <h3>Επιχειρήσεις</h3>

            <p>
              {companyMockData.length} καταχωρημένες επιχειρήσεις
            </p>
          </div>
        </div>

        <CompanyGrid
          companies={companyMockData}
          onCompanySelect={handleCompanySelect}
        />
      </section>
    </PageContainer>
  );
}

export default DashboardPage;