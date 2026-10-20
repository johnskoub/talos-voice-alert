import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import PageContainer from '../../components/PageContainer/PageContainer';
import {
  getCompanies,
  getCompanyUsers,
  getUsers,
  createCompanyUser,
} from '../../services/api';
import './OccupantsPage.css';

function OccupantsPage() {
  const navigate = useNavigate();

  const [companies, setCompanies] = useState([]);
  const [companyUsers, setCompanyUsers] = useState([]);
  const [users, setUsers] = useState([]);

  const [selectedCompanyId, setSelectedCompanyId] =
    useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isAddModalOpen, setIsAddModalOpen] =
    useState(false);

  const [selectedUserId, setSelectedUserId] =
    useState('');

  const [selectedRole, setSelectedRole] =
    useState('EMPLOYEE');

  const [savingOccupant, setSavingOccupant] =
    useState(false);


  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError('');

        const [companiesData, usersData] =
          await Promise.all([
            getCompanies(),
            getUsers(),
          ]);

        setCompanies(companiesData);
        setUsers(usersData);

        if (companiesData.length > 0) {
          setSelectedCompanyId(
            String(companiesData[0].id)
          );
        }
      } catch (err) {
        console.error(err);
        setError(
          'Δεν ήταν δυνατή η φόρτωση των δεδομένων.'
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  useEffect(() => {
    async function loadCompanyUsers() {
      if (!selectedCompanyId) {
        setCompanyUsers([]);
        return;
      }

      try {
        const data = await getCompanyUsers(
          selectedCompanyId
        );

        setCompanyUsers(data);
      } catch (err) {
        console.error(err);
        setError(
          'Δεν ήταν δυνατή η φόρτωση των παρευρισκόμενων.'
        );
      }
    }

    loadCompanyUsers();
  }, [selectedCompanyId]);

  const selectedCompany = useMemo(
    () =>
      companies.find(
        (company) =>
          String(company.id) ===
          String(selectedCompanyId)
      ),
    [companies, selectedCompanyId]
  );

  const occupants = useMemo(() => {
    return companyUsers
      .map((companyUser) => {
        const user = users.find(
          (item) =>
            Number(item.id) ===
            Number(companyUser.userId)
        );

        if (!user) {
          return null;
        }

        return {
          ...companyUser,
          user,
        };
      })
      .filter(Boolean);
  }, [companyUsers, users]);

  const handleAddOccupant = async (event) => {
    event.preventDefault();

    if (!selectedCompanyId || !selectedUserId) {
        return;
    }

    try {
        setSavingOccupant(true);
        setError('');

        await createCompanyUser({
        companyId: Number(selectedCompanyId),
        userId: Number(selectedUserId),
        role: selectedRole,
        active: true,
        });

        const updatedCompanyUsers =
        await getCompanyUsers(selectedCompanyId);

        setCompanyUsers(updatedCompanyUsers);

        setSelectedUserId('');
        setSelectedRole('EMPLOYEE');
        setIsAddModalOpen(false);
    } catch (err) {
        console.error(err);

        setError(
        'Δεν ήταν δυνατή η προσθήκη του παρευρισκόμενου.'
        );
    } finally {
        setSavingOccupant(false);
    }
  };


  return (
    <PageContainer>
      <section className="occupants-page">
        <div className="occupants-heading">
          <div>
            <p className="occupants-eyebrow">
              OCCUPANT MANAGEMENT
            </p>

            <h2>Παρευρισκόμενοι</h2>

            <p>
              Διαχειριστείτε τους παρευρισκόμενους
              ανά επιχείρηση.
            </p>
          </div>

          <button
            type="button"
            className="back-dashboard-button"
            onClick={() => navigate('/dashboard')}
          >
            ← Πίσω στο Dashboard
          </button>
        </div>

        <section className="occupants-card">
          <div className="occupants-card-header">
            <div>
              <h3>Παρευρισκόμενοι επιχείρησης</h3>

              <p>
                Επιλέξτε επιχείρηση για να δείτε τους
                συνδεδεμένους χρήστες.
              </p>
            </div>

            <button
                type="button"
                className="add-occupant-button"
                disabled={!selectedCompanyId}
                onClick={() => setIsAddModalOpen(true)}
            >
                + Προσθήκη παρευρισκόμενου
            </button>
          </div>

          <div className="occupants-company-selector">
            <label htmlFor="company">
              Επιχείρηση
            </label>

            <select
              id="company"
              value={selectedCompanyId}
              onChange={(event) =>
                setSelectedCompanyId(
                  event.target.value
                )
              }
            >
              {companies.map((company) => (
                <option
                  key={company.id}
                  value={company.id}
                >
                  {company.name}
                </option>
              ))}
            </select>
          </div>

          {selectedCompany && (
            <>
                <div className="selected-company-info">
                <div>
                    <strong>
                    {selectedCompany.name}
                    </strong>

                    <span>
                    {occupants.length} παρευρισκόμενοι
                    </span>
                </div>
                </div>

                <div className="company-contact-grid">

                {/* Στοιχεία επιχείρησης */}
                <div className="company-info-box">
                    <h4>Στοιχεία επιχείρησης</h4>

                    <div className="company-info-row">
                    <span>Διεύθυνση</span>
                    <strong>
                        {selectedCompany.address || '—'}
                    </strong>
                    </div>

                    <div className="company-info-row">
                    <span>Τηλέφωνο</span>
                    <strong>
                        {selectedCompany.phone || '—'}
                    </strong>
                    </div>

                    <div className="company-info-row">
                    <span>Email</span>
                    <strong>
                        {selectedCompany.email || '—'}
                    </strong>
                    </div>

                    <div className="company-info-row">
                    <span>ΑΦΜ</span>
                    <strong>
                        {selectedCompany.taxId || '—'}
                    </strong>
                    </div>
                </div>

                {/* Πρόεδρος */}
                <div className="company-info-box">
                    <h4>Πρόεδρος</h4>

                    <div className="company-info-row">
                    <span>Ονοματεπώνυμο</span>
                    <strong>
                        {selectedCompany.presidentName || '—'}
                    </strong>
                    </div>

                    <div className="company-info-row">
                    <span>Τηλέφωνο</span>
                    <strong>
                        {selectedCompany.presidentPhone || '—'}
                    </strong>
                    </div>

                    <div className="company-info-row">
                    <span>Email</span>
                    <strong>
                        {selectedCompany.presidentEmail || '—'}
                    </strong>
                    </div>
                </div>

                {/* Αντιπρόεδρος */}
                <div className="company-info-box">
                    <h4>Αντιπρόεδρος</h4>

                    <div className="company-info-row">
                    <span>Ονοματεπώνυμο</span>
                    <strong>
                        {selectedCompany.vicePresidentName || '—'}
                    </strong>
                    </div>

                    <div className="company-info-row">
                    <span>Τηλέφωνο</span>
                    <strong>
                        {selectedCompany.vicePresidentPhone || '—'}
                    </strong>
                    </div>

                    <div className="company-info-row">
                    <span>Email</span>
                    <strong>
                        {selectedCompany.vicePresidentEmail || '—'}
                    </strong>
                    </div>
                </div>

                {/* Ομάδα ασφαλείας */}
                <div className="company-info-box">
                    <h4>Ομάδα ασφαλείας</h4>

                    <div className="company-info-row">
                    <span>Ομάδα</span>
                    <strong>
                        {selectedCompany.securityTeam || '—'}
                    </strong>
                    </div>

                    <div className="company-info-row">
                    <span>Τηλέφωνο ασφαλείας</span>
                    <strong>
                        {selectedCompany.securityPhone || '—'}
                    </strong>
                    </div>
                </div>

                </div>
            </>
            )}

          {loading && (
            <div className="occupants-empty">
              Φόρτωση δεδομένων...
            </div>
          )}

          {!loading && error && (
            <div
              className="occupants-error"
              role="alert"
            >
              {error}
            </div>
          )}

          {!loading &&
            !error &&
            occupants.length === 0 && (
              <div className="occupants-empty">
                <h4>
                  Δεν υπάρχουν παρευρισκόμενοι
                </h4>

                <p>
                  Η συγκεκριμένη επιχείρηση δεν έχει
                  ακόμη συνδεδεμένους χρήστες.
                </p>
              </div>
            )}

          {!loading &&
            !error &&
            occupants.length > 0 && (
              <div className="occupants-table-wrapper">
                <table className="occupants-table">
                  <thead>
                    <tr>
                      <th>Ονοματεπώνυμο</th>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Ρόλος</th>
                      <th>Κατάσταση</th>
                      <th>Ενέργειες</th>
                    </tr>
                  </thead>

                  <tbody>
                    {occupants.map((occupant) => (
                      <tr key={occupant.id}>
                        <td>
                          <strong>
                            {occupant.user.firstName ||
                              ''}{' '}
                            {occupant.user.lastName ||
                              ''}
                          </strong>
                        </td>

                        <td>
                          {occupant.user.username}
                        </td>

                        <td>
                          {occupant.user.email}
                        </td>

                        <td>
                          <span className="occupant-role">
                            {occupant.role}
                          </span>
                        </td>

                        <td>
                          <span className="occupant-status">
                            Ενεργός
                          </span>
                        </td>

                        <td>
                          <div className="occupant-actions">
                            <button
                              type="button"
                              className="edit-occupant-button"
                            >
                              Επεξεργασία
                            </button>

                            <button
                              type="button"
                              className="delete-occupant-button"
                            >
                              Αφαίρεση
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
        </section>
      </section>

      {isAddModalOpen && (
        <div
            className="occupant-modal-overlay"
            onClick={() => setIsAddModalOpen(false)}
        >
            <div
            className="occupant-modal"
            onClick={(event) => event.stopPropagation()}
            >
            <div className="occupant-modal-header">
                <div>
                <p className="occupants-eyebrow">
                    NEW OCCUPANT
                </p>

                <h3>Προσθήκη παρευρισκόμενου</h3>

                <p>
                    Προσθέστε έναν χρήστη στην επιλεγμένη
                    επιχείρηση.
                </p>
                </div>

                <button
                type="button"
                className="occupant-modal-close"
                onClick={() => setIsAddModalOpen(false)}
                >
                ×
                </button>
            </div>

            <form onSubmit={handleAddOccupant}>

                <div className="occupant-form-group">
                <label htmlFor="occupant-user">
                    Χρήστης
                </label>

                <select
                    id="occupant-user"
                    value={selectedUserId}
                    onChange={(event) =>
                    setSelectedUserId(event.target.value)
                    }
                    required
                >
                    <option value="">
                    Επιλέξτε χρήστη
                    </option>

                    {users
                    .filter(
                        (user) =>
                        !companyUsers.some(
                            (companyUser) =>
                            Number(companyUser.userId) ===
                            Number(user.id)
                        )
                    )
                    .map((user) => (
                        <option
                        key={user.id}
                        value={user.id}
                        >
                        {user.firstName || ''}{' '}
                        {user.lastName || ''} —{' '}
                        {user.username}
                        </option>
                    ))}
                </select>
                </div>

                <div className="occupant-form-group">
                <label htmlFor="occupant-role">
                    Ρόλος
                </label>

                <select
                    id="occupant-role"
                    value={selectedRole}
                    onChange={(event) =>
                    setSelectedRole(event.target.value)
                    }
                >
                    <option value="EMPLOYEE">
                    Employee
                    </option>

                    <option value="MANAGER">
                    Manager
                    </option>

                    <option value="SECURITY">
                    Security
                    </option>

                    <option value="ADMIN">
                    Administrator
                    </option>
                </select>
                </div>

                <div className="occupant-modal-actions">
                <button
                    type="button"
                    className="occupant-cancel-button"
                    onClick={() => setIsAddModalOpen(false)}
                >
                    Ακύρωση
                </button>

                <button
                    type="submit"
                    className="occupant-save-button"
                    disabled={
                    savingOccupant ||
                    !selectedUserId
                    }
                >
                    {savingOccupant
                    ? 'Αποθήκευση...'
                    : 'Προσθήκη'}
                </button>
                </div>

            </form>
            </div>
        </div>
        )}

    </PageContainer>
  );
}

export default OccupantsPage;