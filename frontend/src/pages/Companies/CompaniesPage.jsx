import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import PageContainer from '../../components/PageContainer/PageContainer';
import {
  getCompanies,
  getCompanyFloors,
  createCompany,
  updateCompany,
  deleteCompany,
} from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import './CompaniesPage.css';

function CompaniesPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [editingCompanyId, setEditingCompanyId] =
    useState(null);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    floors: '',
    presidentName: '',
    presidentPhone: '',
    presidentEmail: '',
    vicePresidentName: '',
    vicePresidentPhone: '',
    vicePresidentEmail: '',
    securityTeam: '',
    securityPhone: '',
    logo: '',
  });

  useEffect(() => {
    loadCompanies();
  }, []);

  async function loadCompanies() {
    try {
      setLoading(true);
      setError('');

      const data = await getCompanies();

      if (!Array.isArray(data)) {
        setCompanies([]);
        return;
      }

      const companiesWithFloorCount = await Promise.all(
        data.map(async (company) => {
          try {
            const floors = await getCompanyFloors(company.id);

            return {
              ...company,
              floorCount: Array.isArray(floors)
                ? floors.length
                : 0,
            };
          } catch (error) {
            console.error(
              `Failed to load floors for company ${company.id}:`,
              error
            );

            return {
              ...company,
              floorCount: 0,
            };
          }
        })
      );

      setCompanies(companiesWithFloorCount);
    } catch (error) {
      console.error(
        'Failed to load companies:',
        error
      );

      setError(
        t('companyManagement', 'loadError')
      );
    } finally {
      setLoading(false);
    }
  }

  const resetForm = () => {
    setEditingCompanyId(null);

    setFormData({
      name: '',
      address: '',
      floors: '',
      presidentName: '',
      presidentPhone: '',
      presidentEmail: '',
      vicePresidentName: '',
      vicePresidentPhone: '',
      vicePresidentEmail: '',
      securityTeam: '',
      securityPhone: '',
      logo: '',
    });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleEdit = (company) => {
    setEditingCompanyId(company.id);

    setFormData({
      name: company.name || '',
      address: company.address || '',
      floors: company.floors || '',
      presidentName: company.presidentName || '',
      presidentPhone: company.presidentPhone || '',
      presidentEmail: company.presidentEmail || '',
      vicePresidentName:
        company.vicePresidentName || '',
      vicePresidentPhone:
        company.vicePresidentPhone || '',
      vicePresidentEmail:
        company.vicePresidentEmail || '',
      securityTeam: company.securityTeam || '',
      securityPhone: company.securityPhone || '',
      logo: company.logo || '',
    });
  };

  const handleDelete = async (companyId) => {
    const confirmed = window.confirm(
      t(
        'companyManagement',
        'deleteConfirmation'
      )
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteCompany(companyId);

      setCompanies((current) =>
        current.filter(
          (company) => company.id !== companyId
        )
      );

      if (editingCompanyId === companyId) {
        resetForm();
      }
    } catch (error) {
      console.error(
        'Failed to delete company:',
        error
      );

      setError(
        t('companyManagement', 'deleteError')
      );
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      return;
    }

    try {
      if (editingCompanyId !== null) {
        const updatedCompany =
          await updateCompany(
            editingCompanyId,
            {
              ...formData,
              floors:
                Number(formData.floors) || 0,
            }
          );

        setCompanies((current) =>
          current.map((company) =>
            company.id === editingCompanyId
              ? updatedCompany || {
                  ...company,
                  ...formData,
                  floors:
                    Number(formData.floors) || 0,
                }
              : company
          )
        );
      } else {
        const newCompany =
          await createCompany({
            ...formData,
            floors:
              Number(formData.floors) || 0,
          });

        setCompanies((current) => [
          ...current,
          newCompany,
        ]);
      }

      resetForm();
    } catch (error) {
      console.error(
        'Failed to save company:',
        error
      );

      setError(
        t('companyManagement', 'saveError')
      );
    }
  };

  return (
    <PageContainer>
      <section className="companies-page">
        <div className="companies-page-header">
          <div>
            <p className="companies-page-eyebrow">
              {t(
                'companyManagement',
                'eyebrow'
              )}
            </p>

            <h2>
              {t(
                'companyManagement',
                'title'
              )}
            </h2>

            <p>
              {t(
                'companyManagement',
                'description'
              )}
            </p>
          </div>

          <button
            type="button"
            className="companies-back-button"
            onClick={() =>
              navigate('/dashboard')
            }
          >
            {t(
              'common',
              'backDashboard'
            )}
          </button>
        </div>

        <div className="companies-page-grid">
          <section className="companies-list-card">
            <div className="companies-card-header">
              <div>
                <h3>
                  {t(
                    'companyManagement',
                    'registeredCompanies'
                  )}
                </h3>

                <p>
                  {companies.length}{' '}
                  {t(
                    'companyManagement',
                    'companiesCount'
                  )}
                </p>
              </div>

              <button
                type="button"
                onClick={resetForm}
              >
                +{' '}
                {t(
                  'companyManagement',
                  'newCompany'
                )}
              </button>
            </div>

            {loading ? (
              <p>
                {t('common', 'loading')}
              </p>
            ) : (
              <div className="companies-list">
                {companies.map((company) => (
                  <article
                    key={company.id}
                    className="company-management-card"
                  >
                    <div className="company-management-logo">
                      {company.logo ? (
                        <img
                          src={company.logo}
                          alt={company.name}
                        />
                      ) : (
                        <span>
                          {company.name
                            ?.charAt(0)
                            ?.toUpperCase() || 'T'}
                        </span>
                      )}
                    </div>

                    <div className="company-management-info">
                      <h4>{company.name}</h4>

                      <p>
                        {company.address ||
                          t(
                            'companyManagement',
                            'noAddress'
                          )}
                      </p>

                      <div>
                        <span>
                          {t(
                            'companyManagement',
                            'floors'
                          )}
                          :{' '}
                          {company.floorCount ?? 0}
                        </span>

                        <span>
                          {t(
                            'companyManagement',
                            'occupants'
                          )}
                          :{' '}
                          {company.occupants ?? 0}
                        </span>
                      </div>
                    </div>

                    <div className="company-management-actions">
                      <button
                        type="button"
                        onClick={() =>
                          handleEdit(company)
                        }
                      >
                        {t(
                          'companyManagement',
                          'edit'
                        )}
                      </button>

                      <button
                        type="button"
                        className="company-delete-button"
                        onClick={() =>
                          handleDelete(
                            company.id
                          )
                        }
                      >
                        {t(
                          'companyManagement',
                          'delete'
                        )}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {error && (
              <div className="companies-error">
                {error}
              </div>
            )}
          </section>

          <section className="company-form-card">
            <div className="companies-card-header">
              <div>
                <p className="companies-page-eyebrow">
                  {editingCompanyId !== null
                    ? t(
                        'companyManagement',
                        'editCompanyEyebrow'
                      )
                    : t(
                        'companyManagement',
                        'newCompanyEyebrow'
                      )}
                </p>

                <h3>
                  {editingCompanyId !== null
                    ? t(
                        'companyManagement',
                        'editCompany'
                      )
                    : t(
                        'companyManagement',
                        'newCompany'
                      )}
                </h3>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="company-form-section">
                <h4>
                  {t(
                    'companyManagement',
                    'basicInformation'
                  )}
                </h4>

                <label>
                  {t(
                    'companyManagement',
                    'companyName'
                  )}

                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={t(
                      'companyManagement',
                      'placeholderCompanyName'
                    )}
                    required
                  />
                </label>

                <label>
                  {t(
                    'companyManagement',
                    'address'
                  )}

                  <input
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder={t(
                      'companyManagement',
                      'placeholderAddress'
                    )}
                  />
                </label>

                <label>
                  {t(
                    'companyManagement',
                    'floorCount'
                  )}

                  <input
                    type="number"
                    min="0"
                    name="floors"
                    value={formData.floors}
                    onChange={handleChange}
                  />
                </label>

                <label>
                  {t(
                    'companyManagement',
                    'logoUrl'
                  )}

                  <input
                    name="logo"
                    value={formData.logo}
                    onChange={handleChange}
                    placeholder={t(
                      'companyManagement',
                      'optional'
                    )}
                  />
                </label>
              </div>

              <div className="company-form-section">
                <h4>
                  {t(
                    'companyManagement',
                    'president'
                  )}
                </h4>

                <label>
                  {t(
                    'companyManagement',
                    'fullName'
                  )}

                  <input
                    name="presidentName"
                    value={
                      formData.presidentName
                    }
                    onChange={handleChange}
                  />
                </label>

                <label>
                  {t(
                    'companyManagement',
                    'phone'
                  )}

                  <input
                    name="presidentPhone"
                    value={
                      formData.presidentPhone
                    }
                    onChange={handleChange}
                  />
                </label>

                <label>
                  {t(
                    'companyManagement',
                    'email'
                  )}

                  <input
                    type="email"
                    name="presidentEmail"
                    value={
                      formData.presidentEmail
                    }
                    onChange={handleChange}
                  />
                </label>
              </div>

              <div className="company-form-section">
                <h4>
                  {t(
                    'companyManagement',
                    'vicePresident'
                  )}
                </h4>

                <label>
                  {t(
                    'companyManagement',
                    'fullName'
                  )}

                  <input
                    name="vicePresidentName"
                    value={
                      formData.vicePresidentName
                    }
                    onChange={handleChange}
                  />
                </label>

                <label>
                  {t(
                    'companyManagement',
                    'phone'
                  )}

                  <input
                    name="vicePresidentPhone"
                    value={
                      formData.vicePresidentPhone
                    }
                    onChange={handleChange}
                  />
                </label>

                <label>
                  {t(
                    'companyManagement',
                    'email'
                  )}

                  <input
                    type="email"
                    name="vicePresidentEmail"
                    value={
                      formData.vicePresidentEmail
                    }
                    onChange={handleChange}
                  />
                </label>
              </div>

              <div className="company-form-section">
                <h4>
                  {t(
                    'companyManagement',
                    'securityTeam'
                  )}
                </h4>

                <label>
                  {t(
                    'companyManagement',
                    'securityTeam'
                  )}

                  <input
                    name="securityTeam"
                    value={
                      formData.securityTeam
                    }
                    onChange={handleChange}
                    placeholder={t(
                      'companyManagement',
                      'placeholderSecurityTeam'
                    )}
                  />
                </label>

                <label>
                  {t(
                    'companyManagement',
                    'securityTeamPhone'
                  )}

                  <input
                    name="securityPhone"
                    value={
                      formData.securityPhone
                    }
                    onChange={handleChange}
                  />
                </label>
              </div>

              <div className="company-form-actions">
                <button
                  type="submit"
                  className="company-save-button"
                >
                  {editingCompanyId !== null
                    ? t(
                        'companyManagement',
                        'saveChanges'
                      )
                    : t(
                        'companyManagement',
                        'createCompany'
                      )}
                </button>

                {editingCompanyId !== null && (
                  <button
                    type="button"
                    onClick={resetForm}
                  >
                    {t(
                      'companyManagement',
                      'cancel'
                    )}
                  </button>
                )}
              </div>
            </form>
          </section>
        </div>
      </section>
    </PageContainer>
  );
}

export default CompaniesPage;