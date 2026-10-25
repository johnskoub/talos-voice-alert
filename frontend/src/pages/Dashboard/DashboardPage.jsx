import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import PageContainer from '../../components/PageContainer/PageContainer';
import CompanyGrid from '../../components/CompanyGrid/CompanyGrid';

import {
  getCompanies,
  getCompanyFloors,
  getCompanyUsers,
} from '../../services/api';

import { useLanguage } from '../../context/LanguageContext';

import './DashboardPage.css';

function DashboardPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const handleCompanySelect = (companyId) => {
    navigate(`/companies/${companyId}`);
  };

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        setError('');

        const companiesData = await getCompanies();

        const companiesWithData =
          await Promise.all(
            companiesData.map(async (company) => {
              const [floors, occupants] =
                await Promise.all([
                  getCompanyFloors(company.id),
                  getCompanyUsers(company.id),
                ]);

              /*
               * Η κατάσταση Active / Inactive
               * υπολογίζεται από την πληρότητα
               * των βασικών στοιχείων της εταιρίας.
               */

              const hasBasicCompanyInfo =
                Boolean(company.name) &&
                Boolean(company.legalName) &&
                Boolean(company.taxId) &&
                Boolean(company.email) &&
                Boolean(company.phone) &&
                Boolean(company.address);

              const hasPresidentInfo =
                Boolean(company.presidentName) &&
                Boolean(company.presidentPhone) &&
                Boolean(company.presidentEmail);

              const hasVicePresidentInfo =
                Boolean(company.vicePresidentName) &&
                Boolean(company.vicePresidentPhone) &&
                Boolean(company.vicePresidentEmail);

              const hasSecurityInfo =
                Boolean(company.securityTeam) &&
                Boolean(company.securityPhone);

              const hasFloors = floors.length > 0;

              const isComplete =
                hasBasicCompanyInfo &&
                hasPresidentInfo &&
                hasVicePresidentInfo &&
                hasSecurityInfo &&
                hasFloors;

              return {
                ...company,

                /*
                 * Τα παρακάτω είναι πλέον πραγματικά
                 * δεδομένα από τη βάση.
                 */
                floorCount: floors.length,
                occupantCount: occupants.length,

                /*
                 * Το status του Dashboard δεν
                 * βασίζεται στο company.active,
                 * γιατί αυτό χρησιμοποιείται
                 * για soft delete.
                 */
                status: isComplete
                  ? 'ACTIVE'
                  : 'INACTIVE',
              };
            })
          );

        setCompanies(companiesWithData);
      } catch (err) {
        console.error(
          'Dashboard loading error:',
          err
        );

        setError(
          err.message ||
            'Unable to load dashboard data.'
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

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
          onClick={() => navigate('/companies')}
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
              {companies.length}{' '}
              {t(
                'dashboard',
                'registeredCompanies'
              )}
            </p>
          </div>
        </div>

        {loading && (
          <p>
            {t('common', 'loading')}
          </p>
        )}

        {!loading && error && (
          <p className="dashboard-error">
            {error}
          </p>
        )}

        {!loading && !error && (
          <CompanyGrid
            companies={companies}
            onCompanySelect={handleCompanySelect}
          />
        )}
      </section>
    </PageContainer>
  );
}

export default DashboardPage;
