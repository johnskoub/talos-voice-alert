import FloorCard from '../FloorCard/FloorCard';
import './FloorGrid.css';

function FloorGrid({ floors, onFloorSelect }) {
  if (floors.length === 0) {
    return (
      <div className="floors-empty-state">
        <h3>Δεν υπάρχουν όροφοι</h3>
        <p>Προσθέστε τον πρώτο όροφο της επιχείρησης.</p>
      </div>
    );
  }

  return (
    <div className="floor-grid">
      {floors.map((floor) => (
        <FloorCard
          key={floor.id}
          floor={floor}
          onSelect={onFloorSelect}
        />
      ))}
    </div>
  );
}

export default FloorGrid;