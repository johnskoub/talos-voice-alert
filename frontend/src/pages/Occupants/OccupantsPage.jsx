import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useNavigate } from 'react-router';
import PageContainer from '../../components/PageContainer/PageContainer';
import {
  getCompanies,
  getCompanyUsers,
  getUsers,
  createCompanyUser,
  updateCompanyUser,
  deleteCompanyUser,
} from '../../services/api';
import './OccupantsPage.css';

function OccupantsPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();

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

  const [isEditModalOpen, setIsEditModalOpen] =
    useState(false);

  const [editingOccupant, setEditingOccupant] =
    useState(null);

  const [editRole, setEditRole] =
    useState('EMPLOYEE');

  const [savingEdit, setSavingEdit] =
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
          t('occupants', 'errorLoadingData')
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
          t('occupants', 'errorLoadingOccupants')
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
          t('occupants', 'errorAddingOccupant')
        );
    } finally {
        setSavingOccupant(false);
    }
  };

  const handleEditOccupant = async (event) => {
    event.preventDefault();

    if (!editingOccupant) {
      return;
    }

    try {
      setSavingEdit(true);
      setError('');

      await updateCompanyUser(
        editingOccupant.id,
        {
          companyId: Number(
            editingOccupant.companyId
          ),
          userId: Number(
            editingOccupant.userId
          ),
          role: editRole,
          active: true,
        }
      );

      const updatedCompanyUsers =
        await getCompanyUsers(selectedCompanyId);

      setCompanyUsers(updatedCompanyUsers);

      setIsEditModalOpen(false);
      setEditingOccupant(null);
      setEditRole('EMPLOYEE');

    } catch (err) {
      console.error(err);

      setError(
        t('occupants', 'errorUpdatingOccupant')
      );
    } finally {
      setSavingEdit(false);
    }
  };


  return (
    <PageContainer>
      <section className="occupants-page">
        <div className="occupants-heading">
          <div>
            <p className="occupants-eyebrow">
              {t('occupants', 'eyebrow')}
            </p>

            <h2>{t('occupants', 'title')}</h2>

            <p>
              {t('occupants', 'description')}
            </p>
          </div>

          <button
            type="button"
            className="back-dashboard-button"
            onClick={() => navigate('/dashboard')}
          >
            {t('common', 'backDashboard')}
          </button>
        </div>

        <section className="occupants-card">
          <div className="occupants-card-header">
            <div>
              <h3>
                {t('occupants', 'companyOccupants')}
              </h3>

              <p>
                {t('occupants', 'companyDescription')}
              </p>
            </div>

            <button
                type="button"
                className="add-occupant-button"
                disabled={!selectedCompanyId}
                onClick={() => setIsAddModalOpen(true)}
            >
                {t('occupants', 'addOccupant')}
            </button>
          </div>

          <div className="occupants-company-selector">
            <label htmlFor="company">
              {t('occupants', 'company')}
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
                      {occupants.length} {t('occupants', 'occupantsCount')}
                    </span>
                </div>
                </div>

                <div className="company-contact-grid">

                {/* Στοιχεία επιχείρησης */}
                <div className="company-info-box">
                    <h4>{t('occupants', 'companyDetails')}</h4>

                    <div className="company-info-row">
                    <span>{t('occupants', 'address')}</span>
                    <strong>
                        {selectedCompany.address || '—'}
                    </strong>
                    </div>

                    <div className="company-info-row">
                    <span>{t('occupants', 'phone')}</span>
                    <strong>
                        {selectedCompany.phone || '—'}
                    </strong>
                    </div>

                    <div className="company-info-row">
                    <span>{t('occupants', 'email')}</span>
                    <strong>
                        {selectedCompany.email || '—'}
                    </strong>
                    </div>

                    <div className="company-info-row">
                    <span>{t('occupants', 'taxId')}</span>
                    <strong>
                        {selectedCompany.taxId || '—'}
                    </strong>
                    </div>
                </div>

                {/* Πρόεδρος */}
                <div className="company-info-box">
                    <h4>{t('occupants', 'president')}</h4>

                    <div className="company-info-row">
                      <span>{t('occupants', 'fullName')}</span>
                      <strong>
                        {selectedCompany.presidentName || '—'}
                      </strong>
                    </div>

                    <div className="company-info-row">
                      <span>{t('occupants', 'phone')}</span>
                      <strong>
                        {selectedCompany.presidentPhone || '—'}
                      </strong>
                    </div>

                    <div className="company-info-row">
                      <span>{t('occupants', 'email')}</span>
                      <strong>
                        {selectedCompany.presidentEmail || '—'}
                      </strong>
                    </div>
                </div>

                {/* Αντιπρόεδρος */}
                <div className="company-info-box">
                    <h4>{t('occupants', 'vicePresident')}</h4>

                    <div className="company-info-row">
                      <span>{t('occupants', 'fullName')}</span>
                      <strong>
                        {selectedCompany.vicePresidentName || '—'}
                      </strong>
                    </div>

                    <div className="company-info-row">
                      <span>{t('occupants', 'phone')}</span>
                      <strong>
                        {selectedCompany.vicePresidentPhone || '—'}
                      </strong>
                    </div>

                    <div className="company-info-row">
                      <span>{t('occupants', 'email')}</span>
                      <strong>
                        {selectedCompany.vicePresidentEmail || '—'}
                      </strong>
                    </div>
                </div>

                {/* Ομάδα ασφαλείας */}
                <div className="company-info-box">
                    <h4>{t('occupants', 'securityTeam')}</h4>

                    <div className="company-info-row">
                      <span>{t('occupants', 'team')}</span>
                      <strong>
                        {selectedCompany.securityTeam || '—'}
                      </strong>
                    </div>

                    <div className="company-info-row">
                      <span>{t('occupants', 'securityPhone')}</span>
                      <strong>
                        {selectedCompany.securityPhone || '—'}
                      </strong>
                    </div>
                </div>

                </div>
            </>
            )}

          <div className="occupants-empty">
            {t('occupants', 'loading')}
          </div>

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
                  {t('occupants', 'noOccupants')}
                </h4>

                <p>
                  {t('occupants', 'noOccupantsDescription')}
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
                      <th>{t('occupants', 'fullName')}</th>
                        <th>{t('occupants', 'username')}</th>
                        <th>{t('occupants', 'email')}</th>
                        <th>{t('occupants', 'role')}</th>
                        <th>{t('occupants', 'status')}</th>
                        <th>{t('occupants', 'actions')}</th>
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
                            {t('occupants', 'activeStatus')}
                          </span>
                        </td>

                        <td>
                          <div className="occupant-actions">
                            <button
                              type="button"
                              className="edit-occupant-button"
                              onClick={() => {
                                setEditingOccupant(occupant);
                                setEditRole(occupant.role);
                                setIsEditModalOpen(true);
                              }}
                            >
                              {t('common', 'edit')}
                            </button>

                            <button
                              type="button"
                              className="delete-occupant-button"
                              onClick={async () => {
                                const confirmed = window.confirm(
                                  `${t('occupants', 'removeConfirmation')} ${
                                    occupant.user.firstName
                                  } ${occupant.user.lastName} ${
                                    t('occupants', 'removeConfirmationEnd')
                                  }`
                                );

                                if (!confirmed) {
                                  return;
                                }

                                try {
                                  await deleteCompanyUser(occupant.id);

                                  setCompanyUsers((current) =>
                                    current.filter(
                                      (item) => item.id !== occupant.id
                                    )
                                  );
                                } catch (err) {
                                  console.error(err);
                                  setError(
                                    t('occupants', 'errorRemovingOccupant')
                                  );
                                }
                              }}
                            >
                              {t('common', 'remove')}
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
                  {t('occupants', 'newOccupant')}
                </p>

                <h3>
                  {t('occupants', 'addOccupantTitle')}
                </h3>

                <p>
                  {t('occupants', 'addOccupantDescription')}
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
                <option value="">
                  {t('occupants', 'selectUser')}
                </option>

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
                    {t('occupants', 'cancel')}
                </label>

                <select
                    id="occupant-role"
                    value={selectedRole}
                    onChange={(event) =>
                    setSelectedRole(event.target.value)
                    }
                >
                    <option value="EMPLOYEE">
                      {t('occupants', 'employee')}
                    </option>

                    <option value="MANAGER">
                      {t('occupants', 'manager')}
                    </option>

                    <option value="SECURITY">
                      {t('occupants', 'security')}
                    </option>

                    <option value="ADMIN">
                      {t('occupants', 'administrator')}
                    </option>
                </select>
                </div>

                <div className="occupant-modal-actions">
                <button
                    type="button"
                    className="occupant-cancel-button"
                    onClick={() => setIsAddModalOpen(false)}
                >
                    {t('common', 'cancel')}
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
                    ? t('occupants', 'saving')
                    : t('occupants', 'addButton')}
                </button>
                </div>

            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && editingOccupant && (
        <div
          className="occupant-modal-overlay"
          onClick={() => {
            setIsEditModalOpen(false);
            setEditingOccupant(null);
          }}
        >
          <div
            className="occupant-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="occupant-modal-header">
              <div>
                <p className="occupants-eyebrow">
                  {t('occupants', 'editOccupant')}
                </p>

                <h3>
                  {t('occupants', 'editOccupantTitle')}
                </h3>

                <p>
                  {t('occupants', 'editOccupantDescription')}
                </p>
              </div>

              <button
                type="button"
                className="occupant-modal-close"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingOccupant(null);
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleEditOccupant}>

              <div className="occupant-form-group">
                <label>
                  Χρήστης
                </label>

                <input
                  type="text"
                  value={
                    editingOccupant.user
                      ? `${editingOccupant.user.firstName || ''} ${editingOccupant.user.lastName || ''} — ${editingOccupant.user.username}`
                      : ''
                  }
                  disabled
                />
              </div>

              <div className="occupant-form-group">
                <label htmlFor="edit-occupant-role">
                  Ρόλος
                </label>

                <select
                  id="edit-occupant-role"
                  value={editRole}
                  onChange={(event) =>
                    setEditRole(event.target.value)
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
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingOccupant(null);
                  }}
                >
                  Ακύρωση
                </button>

                <button
                  type="submit"
                  className="occupant-save-button"
                  disabled={savingEdit}
                >
                  {savingEdit
                    ? t('occupants', 'saving')
                    : t('occupants', 'saveButton')}
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