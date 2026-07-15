import CompanyCard from '../CompanyCard/CompanyCard';
import './CompanyGrid.css';

function CompanyGrid({ companies, onCompanySelect }) {
  if (companies.length === 0) {
    return (
      <div className="companies-empty-state">
        <h3>Δεν υπάρχουν επιχειρήσεις</h3>

        <p>
          Δημιουργήστε την πρώτη επιχείρηση για να ξεκινήσετε.
        </p>
      </div>
    );
  }

  return (
    <div className="company-grid">
      {companies.map((company) => (
        <CompanyCard
          key={company.id}
          company={company}
          onSelect={onCompanySelect}
        />
      ))}
    </div>
  );
}

export default CompanyGrid;