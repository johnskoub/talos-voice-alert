import { NavLink } from 'react-router';
import './Sidebar.css';

function Sidebar({ isOpen }) {
  return (
    <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo-mark">T</div>

        <div>
          <strong>TALOS</strong>
          <span>Evacuation Platform</span>
        </div>
      </div>

      <nav className="sidebar-navigation" aria-label="Κύρια πλοήγηση">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? 'sidebar-link--active' : ''}`
          }
        >
          <span className="sidebar-link-icon">⌂</span>
          Dashboard
        </NavLink>

        <button className="sidebar-link" type="button">
          <span className="sidebar-link-icon">▦</span>
          Επιχειρήσεις
        </button>

        <button className="sidebar-link" type="button">
          <span className="sidebar-link-icon">♙</span>
          Παρευρισκόμενοι
        </button>

        <button className="sidebar-link" type="button">
          <span className="sidebar-link-icon">⚠</span>
          Προσομοιώσεις
        </button>

        <button className="sidebar-link" type="button">
          <span className="sidebar-link-icon">⚙</span>
          Ρυθμίσεις
        </button>
      </nav>

      <div className="sidebar-footer">
        <span>System status</span>

        <div className="system-status">
          <span className="system-status-indicator" />
          Operational
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;