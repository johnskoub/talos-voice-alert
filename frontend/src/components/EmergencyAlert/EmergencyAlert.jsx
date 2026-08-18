import { useState } from 'react';
import {
  speakEmergencyAlert,
  stopEmergencyAlert,
} from '../../services/voiceAlertService';

import './EmergencyAlert.css';

function EmergencyAlert({ alert }) {
  const [voiceError, setVoiceError] = useState(null);

  if (!alert) {
    return null;
  }

  const alertClassName =
    alert.type === 'SHELTER_IN_PLACE'
      ? 'emergency-alert emergency-alert--shelter'
      : alert.type === 'ERROR'
        ? 'emergency-alert emergency-alert--error'
        : 'emergency-alert emergency-alert--evacuation';

  const handleSpeak = () => {
    setVoiceError(null);

    const result = speakEmergencyAlert(alert.message);

    if (!result.success) {
      if (result.reason === 'NOT_SUPPORTED') {
        setVoiceError(
          'Η φωνητική αναπαραγωγή δεν υποστηρίζεται από αυτόν τον browser.'
        );
        return;
      }

      setVoiceError(
        'Δεν υπάρχει διαθέσιμο μήνυμα για αναπαραγωγή.'
      );
    }
  };

  const handleStop = () => {
    stopEmergencyAlert();
  };

  return (
    <section
      className={alertClassName}
      role="alert"
      aria-live="assertive"
    >
      <div
        className="emergency-alert-icon"
        aria-hidden="true"
      >
        {alert.type === 'SHELTER_IN_PLACE' ? '!' : '⚠'}
      </div>

      <div className="emergency-alert-content">
        <p>EMERGENCY ALERT</p>

        <h3>{alert.title}</h3>

        <span>{alert.message}</span>

        {alert.type !== 'ERROR' && (
          <div className="emergency-alert-actions">
            <button
              type="button"
              className="emergency-alert-voice-button"
              onClick={handleSpeak}
            >
              <span aria-hidden="true">🔊</span>
              Αναπαραγωγή φωνητικής ειδοποίησης
            </button>

            <button
              type="button"
              className="emergency-alert-stop-button"
              onClick={handleStop}
            >
              Διακοπή
            </button>
          </div>
        )}

        {voiceError && (
          <div className="emergency-alert-voice-error">
            {voiceError}
          </div>
        )}
      </div>
    </section>
  );
}

export default EmergencyAlert;