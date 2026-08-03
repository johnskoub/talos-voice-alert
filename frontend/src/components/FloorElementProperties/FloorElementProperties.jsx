import './FloorElementProperties.css';

const elementTypeLabels = {
  OCCUPANT: 'Παρευρισκόμενος',
  EXIT: 'Έξοδος κινδύνου',
  FIRE_POINT: 'Σημείο φωτιάς',
};

function FloorElementProperties({ element, onElementChange }) {
  if (!element) {
    return (
      <aside className="floor-element-properties">
        <div className="floor-element-properties-header">
          <p>PROPERTIES</p>
          <h3>Ιδιότητες στοιχείου</h3>
        </div>

        <div className="floor-element-properties-empty">
          <div aria-hidden="true">↖</div>

          <h4>Δεν έχει επιλεγεί στοιχείο</h4>

          <p>
            Επιλέξτε το εργαλείο Select και πατήστε πάνω σε ένα Floor
            Element.
          </p>
        </div>
      </aside>
    );
  }

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;

    onElementChange(element.id, {
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  return (
    <aside className="floor-element-properties">
      <div className="floor-element-properties-header">
        <p>PROPERTIES</p>
        <h3>Ιδιότητες στοιχείου</h3>
      </div>

      <div className="property-type">
        <span>Τύπος</span>
        <strong>{elementTypeLabels[element.type]}</strong>
      </div>

      {element.type === 'OCCUPANT' && (
        <div className="property-form">
          <label>
            <span>Όνομα παρευρισκόμενου</span>

            <input
              name="name"
              type="text"
              placeholder="π.χ. Γιώργος Παπαδόπουλος"
              value={element.name ?? ''}
              onChange={handleInputChange}
            />
          </label>

          <label>
            <span>Περιοχή</span>

            <input
              name="area"
              type="text"
              placeholder="π.χ. Reception"
              value={element.area ?? ''}
              onChange={handleInputChange}
            />
          </label>

          <label>
            <span>Κατάσταση</span>

            <select
              name="status"
              value={element.status ?? 'ACTIVE'}
              onChange={handleInputChange}
            >
              <option value="ACTIVE">Ενεργός</option>
              <option value="EVACUATED">Έχει εκκενώσει</option>
              <option value="ASSISTANCE_REQUIRED">
                Χρειάζεται βοήθεια
              </option>
            </select>
          </label>
        </div>
      )}

      {element.type === 'EXIT' && (
        <div className="property-form">
          <label>
            <span>Όνομα εξόδου</span>

            <input
              name="name"
              type="text"
              placeholder="π.χ. Ανατολική έξοδος"
              value={element.name ?? ''}
              onChange={handleInputChange}
            />
          </label>

          <label>
            <span>Πλευρά κτιρίου</span>

            <select
              name="side"
              value={element.side ?? 'EAST'}
              onChange={handleInputChange}
            >
              <option value="NORTH">Βόρεια</option>
              <option value="SOUTH">Νότια</option>
              <option value="EAST">Ανατολική</option>
              <option value="WEST">Δυτική</option>
            </select>
          </label>

          <label>
            <span>Κατάσταση εξόδου</span>

            <select
              name="status"
              value={element.status ?? 'AVAILABLE'}
              onChange={handleInputChange}
            >
              <option value="AVAILABLE">Διαθέσιμη</option>
              <option value="BLOCKED">Αποκλεισμένη</option>
              <option value="UNAVAILABLE">Μη διαθέσιμη</option>
            </select>
          </label>
        </div>
      )}

      {element.type === 'FIRE_POINT' && (
        <div className="property-form">
          <label>
            <span>Περιοχή φωτιάς</span>

            <input
              name="area"
              type="text"
              placeholder="π.χ. Server Room"
              value={element.area ?? ''}
              onChange={handleInputChange}
            />
          </label>

          <label>
            <span>Πλευρά κτιρίου</span>

            <select
              name="side"
              value={element.side ?? 'WEST'}
              onChange={handleInputChange}
            >
              <option value="NORTH">Βόρεια</option>
              <option value="SOUTH">Νότια</option>
              <option value="EAST">Ανατολική</option>
              <option value="WEST">Δυτική</option>
            </select>
          </label>

          <label>
            <span>Σοβαρότητα</span>

            <select
              name="severity"
              value={element.severity ?? 'MEDIUM'}
              onChange={handleInputChange}
            >
              <option value="LOW">Χαμηλή</option>
              <option value="MEDIUM">Μέτρια</option>
              <option value="HIGH">Υψηλή</option>
              <option value="CRITICAL">Κρίσιμη</option>
            </select>
          </label>

          <label className="property-checkbox">
            <input
              name="smoke"
              type="checkbox"
              checked={Boolean(element.smoke)}
              onChange={handleInputChange}
            />

            <span>Έχει εντοπιστεί καπνός</span>
          </label>
        </div>
      )}

      <div className="property-coordinates">
        <div>
          <span>Θέση X</span>
          <strong>{element.x}%</strong>
        </div>

        <div>
          <span>Θέση Y</span>
          <strong>{element.y}%</strong>
        </div>
      </div>

      <p className="property-save-information">
        Οι αλλαγές θα οριστικοποιηθούν όταν πατήσετε «Αποθήκευση
        αλλαγών».
      </p>
    </aside>
  );
}

export default FloorElementProperties;