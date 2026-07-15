import './Topbar.css';

function Topbar({ onMenuToggle, onSignOut }) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          className="menu-toggle"
          type="button"
          onClick={onMenuToggle}
          aria-label="Άνοιγμα ή κλείσιμο μενού"
        >
          ☰
        </button>

        <div>
          <p className="topbar-label">CONTROL CENTER</p>
          <h1>TALOS Evacuation Platform</h1>
        </div>
      </div>

      <div className="topbar-actions">
        <div className="administrator-info">
          <div className="administrator-avatar">A</div>

          <div>
            <strong>Administrator</strong>
            <span>System administrator</span>
          </div>
        </div>

        <button className="sign-out-button" type="button" onClick={onSignOut}>
          Sign out
        </button>
      </div>
    </header>
  );
}

export default Topbar;