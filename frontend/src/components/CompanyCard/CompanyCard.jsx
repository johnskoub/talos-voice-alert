import './CompanyCard.css';

function CompanyCard({ company, onSelect }) {
  const isActive = company.status === 'ACTIVE';

  const handleOpenCompany = () => {
    onSelect(company.id);
  };

  return (
    <article className="company-card">
      <div className="company-card-header">
        <div className="company-icon">
          {company.name.charAt(0)}
        </div>

        <span
          className={`company-status ${
            isActive
              ? 'company-status--active'
              : 'company-status--inactive'
          }`}
        >
          {isActive ? 'Ενεργή' : 'Ανενεργή'}
        </span>
      </div>

      <div className="company-card-content">
        <h3>{company.name}</h3>

        <p className="company-location">
          {company.address}, {company.city}
        </p>

        <div className="company-statistics">
          <div>
            <span>Όροφοι</span>
            <strong>{company.floorCount}</strong>
          </div>

          <div>
            <span>Παρευρισκόμενοι</span>
            <strong>{company.occupantCount}</strong>
          </div>
        </div>
      </div>

      <button
        className="company-open-button"
        type="button"
        onClick={handleOpenCompany}
      >
        Άνοιγμα επιχείρησης
        <span aria-hidden="true">→</span>
      </button>
    </article>
  );
}

export default CompanyCard;