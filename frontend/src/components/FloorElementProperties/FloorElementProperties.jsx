import './FloorElementProperties.css';

const elementTypeLabels = {
  OCCUPANT: 'Παρευρισκόμενος',
  EXIT: 'Έξοδος κινδύνου',
  FIRE_POINT: 'Σημείο φωτιάς',
  ZONE: 'Περιοχή κάτοψης',
  STAIR: 'Σκάλα',
  ELEVATOR: 'Ανελκυστήρας',
  EXTINGUISHER: 'Πυροσβεστήρας',
  ASSEMBLY_POINT: 'Σημείο συγκέντρωσης',
  ROUTE_NODE: 'Κόμβος διαδρομής',
};

function FloorElementProperties({ element, containingZone, onElementChange,}) {
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

      {element.type === 'ROUTE_NODE' && (
        <div className="property-form">
          <label>
            <span>Όνομα κόμβου</span>

            <input
              name="name"
              type="text"
              placeholder="π.χ. Corridor Node 01"
              value={element.name ?? ''}
              onChange={handleInputChange}
            />
          </label>

          <label>
            <span>Κατάσταση</span>

            <select
              name="status"
              value={element.status ?? 'AVAILABLE'}
              onChange={handleInputChange}
            >
              <option value="AVAILABLE">
                Διαθέσιμος
              </option>

              <option value="BLOCKED">
                Αποκλεισμένος
              </option>
            </select>
          </label>
        </div>
      )}

      {element.type !== 'ZONE' && (
        <div className="property-detected-zone">
          <span>Αυτόματη περιοχή</span>

          <strong>
            {containingZone?.name || 'Εκτός ορισμένης Zone'}
          </strong>

          {containingZone && (
            <small>
              {containingZone.category} · {containingZone.side}
            </small>
          )}
        </div>
      )}

      {element.type === 'ZONE' && (
        <div className="property-form">
          <label>
            <span>Όνομα περιοχής</span>

            <input
              name="name"
              type="text"
              placeholder="π.χ. Server Room"
              value={element.name ?? ''}
              onChange={handleInputChange}
            />
          </label>

          <label>
            <span>Κατηγορία</span>

            <select
              name="category"
              value={element.category ?? 'GENERAL'}
              onChange={handleInputChange}
            >
              <option value="GENERAL">Γενική περιοχή</option>
              <option value="OFFICE">Γραφείο</option>
              <option value="RECEPTION">Reception</option>
              <option value="STORAGE">Storage</option>
              <option value="WAREHOUSE">Warehouse</option>
              <option value="SERVER_ROOM">Server Room</option>
              <option value="KITCHEN">Kitchen</option>
              <option value="CORRIDOR">Διάδρομος</option>
              <option value="MEETING_ROOM">
                Αίθουσα συσκέψεων
              </option>
              <option value="PRODUCTION">
                Χώρος παραγωγής
              </option>
            </select>
          </label>

          <label>
            <span>Πλευρά κτιρίου</span>

            <select
              name="side"
              value={element.side ?? 'CENTER'}
              onChange={handleInputChange}
            >
              <option value="NORTH">Βόρεια</option>
              <option value="SOUTH">Νότια</option>
              <option value="EAST">Ανατολική</option>
              <option value="WEST">Δυτική</option>
              <option value="CENTER">Κεντρική</option>
            </select>
          </label>
        </div>
      )}

      {element.type === 'STAIR' && (
        <div className="property-form">
          <label>
            <span>Όνομα σκάλας</span>

            <input
              name="name"
              type="text"
              placeholder="π.χ. Κεντρική σκάλα"
              value={element.name ?? ''}
              onChange={handleInputChange}
            />
          </label>

          <label>
            <span>Κατεύθυνση</span>

            <select
              name="direction"
              value={element.direction ?? 'UP_DOWN'}
              onChange={handleInputChange}
            >
              <option value="UP">Προς τα πάνω</option>
              <option value="DOWN">Προς τα κάτω</option>
              <option value="UP_DOWN">Και προς τις δύο κατευθύνσεις</option>
            </select>
          </label>

          <label>
            <span>Κατάσταση</span>

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

      {element.type === 'ELEVATOR' && (
        <div className="property-form">
          <label>
            <span>Όνομα ανελκυστήρα</span>

            <input
              name="name"
              type="text"
              placeholder="π.χ. Ανελκυστήρας Α"
              value={element.name ?? ''}
              onChange={handleInputChange}
            />
          </label>

          <label>
            <span>Κατάσταση</span>

            <select
              name="status"
              value={element.status ?? 'AVAILABLE'}
              onChange={handleInputChange}
            >
              <option value="AVAILABLE">Διαθέσιμος</option>
              <option value="MAINTENANCE">Σε συντήρηση</option>
              <option value="UNAVAILABLE">Μη διαθέσιμος</option>
            </select>
          </label>

          <label className="property-checkbox">
            <input
              name="disabledDuringFire"
              type="checkbox"
              checked={Boolean(element.disabledDuringFire)} // if disabledDuringFire = true, It will not be used as an evacuation route.
              onChange={handleInputChange}
            />

            <span>Απενεργοποίηση σε περίπτωση φωτιάς</span>
          </label>
        </div>
      )}

      {element.type === 'EXTINGUISHER' && (
        <div className="property-form">
          <label>
            <span>Όνομα πυροσβεστήρα</span>

            <input
              name="name"
              type="text"
              placeholder="π.χ. Πυροσβεστήρας SR-01"
              value={element.name ?? ''}
              onChange={handleInputChange}
            />
          </label>

          <label>
            <span>Τύπος πυροσβεστήρα</span>

            <select
              name="extinguisherType"
              value={element.extinguisherType ?? 'ABC'}
              onChange={handleInputChange}
            >
              <option value="ABC">Ξηράς κόνεως ABC</option>
              <option value="CO2">Διοξειδίου του άνθρακα CO₂</option>
              <option value="FOAM">Αφρού</option>
              <option value="WATER">Νερού</option>
            </select>
          </label>

          <label>
            <span>Κατάσταση</span>

            <select
              name="status"
              value={element.status ?? 'AVAILABLE'}
              onChange={handleInputChange}
            >
              <option value="AVAILABLE">Διαθέσιμος</option>
              <option value="USED">Χρησιμοποιημένος</option>
              <option value="MAINTENANCE">Χρειάζεται συντήρηση</option>
            </select>
          </label>
        </div>
      )}

      {element.type === 'ASSEMBLY_POINT' && (
        <div className="property-form">
          <label>
            <span>Όνομα σημείου</span>

            <input
              name="name"
              type="text"
              placeholder="π.χ. Σημείο συγκέντρωσης Α"
              value={element.name ?? ''}
              onChange={handleInputChange}
            />
          </label>

          <label>
            <span>Χωρητικότητα</span>

            <input
              name="capacity"
              type="number"
              min="1"
              value={element.capacity ?? 50}
              onChange={handleInputChange}
            />
          </label>

          <label>
            <span>Κατάσταση</span>

            <select
              name="status"
              value={element.status ?? 'AVAILABLE'}
              onChange={handleInputChange}
            >
              <option value="AVAILABLE">Διαθέσιμο</option>
              <option value="FULL">Πλήρες</option>
              <option value="UNAVAILABLE">Μη διαθέσιμο</option>
            </select>
          </label>
        </div>
      )}

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

        {element.type === 'ZONE' && (
          <>
            <div>
              <span>Πλάτος</span>
              <strong>{element.width}%</strong>
            </div>

            <div>
              <span>Ύψος</span>
              <strong>{element.height}%</strong>
            </div>
          </>
        )}

      </div>

      <p className="property-save-information">
        Οι αλλαγές θα οριστικοποιηθούν όταν πατήσετε «Αποθήκευση
        αλλαγών».
      </p>
    </aside>
  );
}

export default FloorElementProperties;