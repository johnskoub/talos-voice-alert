import { useEffect, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useNavigate } from 'react-router';
import PageContainer from '../../components/PageContainer/PageContainer';
import './SettingsPage.css';

function SettingsPage() {
  const navigate = useNavigate();

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('talos-theme') === 'dark'
  );

  const {
    language,
    setLanguage,
    t,
  } = useLanguage();

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-theme');
      localStorage.setItem('talos-theme', 'dark');
    } else {
      document.body.classList.remove('dark-theme');
      localStorage.setItem('talos-theme', 'light');
    }
  }, [darkMode]);

  return (
    <PageContainer>
      <section className="settings-page">

        <div className="settings-heading">
          <div>
            <p className="settings-eyebrow">
              SETTINGS
            </p>

            <h2>Ρυθμίσεις</h2>

            <p>
              Προσαρμόστε την εμφάνιση και τη γλώσσα
              της εφαρμογής.
            </p>
          </div>

          <button
            type="button"
            className="settings-back-button"
            onClick={() => navigate('/dashboard')}
          >
            ← Πίσω στο Dashboard
          </button>
        </div>

        <section className="settings-card">

          <div className="settings-section">
            <div className="settings-section-title">
              <div>
                <h3>Εμφάνιση</h3>

                <p>
                  Επιλέξτε το θέμα εμφάνισης της
                  εφαρμογής.
                </p>
              </div>
            </div>

            <div className="settings-row">
              <div className="settings-row-info">
                <strong>Σκούρο θέμα</strong>

                <span>
                  Αλλαγή από λευκό σε σκούρο θέμα.
                </span>
              </div>

              <label className="settings-switch">
                <input
                  type="checkbox"
                  checked={darkMode}
                  onChange={(event) =>
                    setDarkMode(event.target.checked)
                  }
                />

                <span className="settings-slider" />
              </label>
            </div>
          </div>

          <div className="settings-divider" />

          <div className="settings-section">
            <div className="settings-section-title">
              <div>
                <h3>Γλώσσα</h3>

                <p>
                  Επιλέξτε τη γλώσσα της εφαρμογής.
                </p>
              </div>
            </div>

            <div className="settings-row">
              <div className="settings-row-info">
                <strong>Γλώσσα εφαρμογής</strong>

                <span>
                  Επιλέξτε Ελληνικά ή English.
                </span>
              </div>

              <select
                className="settings-language-select"
                value={language}
                onChange={(event) =>
                    setLanguage(event.target.value)
                }
                >
                <option value="el">
                    {t('settings', 'greek')}
                </option>

                <option value="en">
                    {t('settings', 'english')}
                </option>
              </select>
            </div>
          </div>

        </section>
      </section>
    </PageContainer>
  );
}

export default SettingsPage;