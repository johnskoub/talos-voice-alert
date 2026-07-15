import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router';
import Sidebar from '../../components/Sidebar/Sidebar';
import Topbar from '../../components/Topbar/Topbar';
import './DashboardLayout.css';

function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleMenuToggle = () => {
    setIsSidebarOpen((previousState) => !previousState);
  };

  const handleSignOut = () => {
    navigate('/sign-in');
  };

  return (
    <div className="dashboard-layout">
      <Sidebar isOpen={isSidebarOpen} />

      {isSidebarOpen && (
        <button
          className="sidebar-overlay"
          type="button"
          aria-label="Κλείσιμο μενού"
          onClick={handleMenuToggle}
        />
      )}

      <div className="dashboard-layout-main">
        <Topbar
          onMenuToggle={handleMenuToggle}
          onSignOut={handleSignOut}
        />

        <div className="dashboard-layout-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;