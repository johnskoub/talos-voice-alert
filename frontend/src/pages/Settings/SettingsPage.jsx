import { useLanguage } from '../../context/LanguageContext';
import { useNavigate } from 'react-router';
import PageContainer from '../../components/PageContainer/PageContainer';
import './SettingsPage.css';

function SettingsPage() {
  const navigate = useNavigate();

  const {
    language,
    setLanguage,
    t,
    darkMode,
    toggleTheme,
  } = useLanguage();

  return (
    <PageContainer>
      <section className="settings-page">

        <div className="settings-heading">
          <div>
            <p className="settings-eyebrow">
              {t('settings', 'eyebrow')}
            </p>

            <h2>
              {t('settings', 'title')}
            </h2>

            <p>
              {t('settings', 'description')}
            </p>
          </div>

          <button
            type="button"
            className="settings-back-button"
            onClick={() => navigate('/dashboard')}
          >
            {t('common', 'backDashboard')}
          </button>
        </div>

        <section className="settings-card">

          <div className="settings-section">
            <div className="settings-section-title">
              <div>
                <h3>
                  {t('settings', 'appearance')}
                </h3>

                <p>
                  {t(
                    'settings',
                    'appearanceDescription'
                  )}
                </p>
              </div>
            </div>

            <div className="settings-row">
              <div className="settings-row-info">
                <strong>
                  {t('settings', 'darkMode')}
                </strong>

                <span>
                  {t(
                    'settings',
                    'darkModeDescription'
                  )}
                </span>
              </div>

              <label className="settings-switch">
                <input
                  type="checkbox"
                  checked={darkMode}
                  onChange={toggleTheme}
                />

                <span className="settings-slider" />
              </label>
            </div>
          </div>

          <div className="settings-divider" />

          <div className="settings-section">
            <div className="settings-section-title">
              <div>
                <h3>
                  {t('settings', 'language')}
                </h3>

                <p>
                  {t(
                    'settings',
                    'languageDescription'
                  )}
                </p>
              </div>
            </div>

            <div className="settings-row">
              <div className="settings-row-info">
                <strong>
                  {t(
                    'settings',
                    'applicationLanguage'
                  )}
                </strong>

                <span>
                  {t(
                    'settings',
                    'languageDescriptionShort'
                  )}
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