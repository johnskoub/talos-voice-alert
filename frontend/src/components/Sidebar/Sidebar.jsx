import { NavLink } from 'react-router';
import { useLanguage } from '../../context/LanguageContext';
import './Sidebar.css';

function Sidebar({ isOpen }) {
  const { t } = useLanguage();

  const menuItems = [
    {
      to: '/dashboard',
      icon: '⌂',
      label: t('sidebar', 'dashboard'),
    },
    {
      to: '/companies',
      icon: '▦',
      label: t('sidebar', 'companies'),
    },
    {
      to: '/occupants',
      icon: '♙',
      label: t('sidebar', 'occupants'),
    },
    {
      to: '/settings',
      icon: '⚙',
      label: t('sidebar', 'settings'),
    },
  ];
  return (
    <aside
      className={`sidebar ${
        isOpen ? 'sidebar--open' : ''
      }`}
    >
      <div className="sidebar-header">
        <div className="sidebar-logo-mark">T</div>

        <div>
          <strong>TALOS</strong>
          <span>Evacuation Platform</span>
        </div>
      </div>

      <nav
        className="sidebar-navigation"
        aria-label="Κύρια πλοήγηση"
      >
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `sidebar-link ${
                isActive
                  ? 'sidebar-link--active'
                  : ''
              }`
            }
          >
            <span className="sidebar-link-icon">
              {item.icon}
            </span>

            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <span>
          {t('sidebar', 'systemStatus')}
        </span>

        <div className="system-status">
          <span className="system-status-indicator" />
          {t('sidebar', 'operational')}
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;