import { useNavigate } from 'react-router';
import PageContainer from '../../components/PageContainer/PageContainer';
import CompanyGrid from '../../components/CompanyGrid/CompanyGrid';
import companyMockData from '../../services/companyMockData';
import { useLanguage } from '../../context/LanguageContext';
import './DashboardPage.css';

function DashboardPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleCompanySelect = (companyId) => {
    navigate(`/companies/${companyId}`);
  };

  return (
    <PageContainer>
      <section className="dashboard-heading">
        <div>
          <p className="dashboard-eyebrow">
            {t('dashboard', 'eyebrow')}
          </p>

          <h2>
            {t('dashboard', 'title')}
          </h2>

          <p>
            {t('dashboard', 'description')}
          </p>
        </div>

        <button
          className="add-company-button"
          type="button"
        >
          <span aria-hidden="true">+</span>
          {t('companies', 'addCompany')}
        </button>
      </section>

      <section className="companies-section">
        <div className="companies-section-header">
          <div>
            <h3>
              {t('dashboard', 'companies')}
            </h3>

            <p>
              {companyMockData.length}{' '}
              {t('dashboard', 'registeredCompanies')}
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