import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import PageContainer from '../../components/PageContainer/PageContainer';
import {
  getCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
} from '../../services/api';
import './CompaniesPage.css';

function CompaniesPage() {
  const navigate = useNavigate();

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

        setCompanies(Array.isArray(data) ? data : []);
    } catch (error) {
        console.error('Failed to load companies:', error);
        setError('Αδυναμία φόρτωσης των επιχειρήσεων.');
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

  const handleDelete = (companyId) => {
    const confirmed = window.confirm(
      'Θέλετε σίγουρα να διαγράψετε αυτή την επιχείρηση;'
    );

    if (!confirmed) {
      return;
    }

    setCompanies((current) =>
      current.filter(
        (company) => company.id !== companyId
      )
    );

    if (editingCompanyId === companyId) {
      resetForm();
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      return;
    }

    if (editingCompanyId !== null) {
      setCompanies((current) =>
        current.map((company) =>
          company.id === editingCompanyId
            ? {
                ...company,
                ...formData,
                floors: Number(formData.floors) || 0,
              }
            : company
        )
      );
    } else {
      const newCompany = {
        id: Date.now(),
        ...formData,
        floors: Number(formData.floors) || 0,
      };

      setCompanies((current) => [
        ...current,
        newCompany,
      ]);
    }

    resetForm();
  };

  return (
    <PageContainer>
      <section className="companies-page">
        <div className="companies-page-header">
          <div>
            <p className="companies-page-eyebrow">
              COMPANY MANAGEMENT
            </p>

            <h2>Επιχειρήσεις</h2>

            <p>
              Διαχειριστείτε τα στοιχεία των επιχειρήσεων
              που εμφανίζονται στον πίνακα διαχείρισης.
            </p>
          </div>

          <button
            type="button"
            className="companies-back-button"
            onClick={() => navigate('/dashboard')}
          >
            ← Πίσω στο Dashboard
          </button>
        </div>

        <div className="companies-page-grid">
          <section className="companies-list-card">
            <div className="companies-card-header">
              <div>
                <h3>Καταχωρημένες επιχειρήσεις</h3>

                <p>
                  {companies.length} επιχειρήσεις
                </p>
              </div>

              <button
                type="button"
                onClick={resetForm}
              >
                + Νέα επιχείρηση
              </button>
            </div>

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
                        'Δεν έχει οριστεί διεύθυνση'}
                    </p>

                    <div>
                      <span>
                        Όροφοι:{' '}
                        {company.floors || 0}
                      </span>

                      <span>
                        Παρευρισκόμενοι:{' '}
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
                      Επεξεργασία
                    </button>

                    <button
                      type="button"
                      className="company-delete-button"
                      onClick={() =>
                        handleDelete(company.id)
                      }
                    >
                      Διαγραφή
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="company-form-card">
            <div className="companies-card-header">
              <div>
                <p className="companies-page-eyebrow">
                  {editingCompanyId !== null
                    ? 'EDIT COMPANY'
                    : 'NEW COMPANY'}
                </p>

                <h3>
                  {editingCompanyId !== null
                    ? 'Επεξεργασία επιχείρησης'
                    : 'Νέα επιχείρηση'}
                </h3>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="company-form-section">
                <h4>Βασικά στοιχεία</h4>

                <label>
                  Όνομα επιχείρησης
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="π.χ. TALOS Industries"
                    required
                  />
                </label>

                <label>
                  Διεύθυνση
                  <input
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="π.χ. Λεωφόρος Κηφισίας 120, Αθήνα"
                  />
                </label>

                <label>
                  Αριθμός ορόφων
                  <input
                    type="number"
                    min="0"
                    name="floors"
                    value={formData.floors}
                    onChange={handleChange}
                  />
                </label>

                <label>
                  Logo URL
                  <input
                    name="logo"
                    value={formData.logo}
                    onChange={handleChange}
                    placeholder="Προαιρετικό"
                  />
                </label>
              </div>

              <div className="company-form-section">
                <h4>Πρόεδρος</h4>

                <label>
                  Ονοματεπώνυμο
                  <input
                    name="presidentName"
                    value={formData.presidentName}
                    onChange={handleChange}
                  />
                </label>

                <label>
                  Τηλέφωνο
                  <input
                    name="presidentPhone"
                    value={formData.presidentPhone}
                    onChange={handleChange}
                  />
                </label>

                <label>
                  Email
                  <input
                    type="email"
                    name="presidentEmail"
                    value={formData.presidentEmail}
                    onChange={handleChange}
                  />
                </label>
              </div>

              <div className="company-form-section">
                <h4>Αντιπρόεδρος</h4>

                <label>
                  Ονοματεπώνυμο
                  <input
                    name="vicePresidentName"
                    value={formData.vicePresidentName}
                    onChange={handleChange}
                  />
                </label>

                <label>
                  Τηλέφωνο
                  <input
                    name="vicePresidentPhone"
                    value={formData.vicePresidentPhone}
                    onChange={handleChange}
                  />
                </label>

                <label>
                  Email
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
                <h4>Ομάδα ασφαλείας</h4>

                <label>
                  Ομάδα ασφαλείας
                  <input
                    name="securityTeam"
                    value={formData.securityTeam}
                    onChange={handleChange}
                    placeholder="π.χ. 5 άτομα"
                  />
                </label>

                <label>
                  Τηλέφωνο ομάδας ασφαλείας
                  <input
                    name="securityPhone"
                    value={formData.securityPhone}
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
                    ? 'Αποθήκευση αλλαγών'
                    : 'Δημιουργία επιχείρησης'}
                </button>

                {editingCompanyId !== null && (
                  <button
                    type="button"
                    onClick={resetForm}
                  >
                    Ακύρωση
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