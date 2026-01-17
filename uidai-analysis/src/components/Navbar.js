import React from 'react';

function Navbar({ currentPage, setCurrentPage }) {
  const pages = [
    { id: 'overview', label: 'Overview' },
    { id: 'pipeline', label: 'Data Pipeline' },
    { id: 'trends', label: 'Trends' },
    { id: 'hotspots', label: 'Hotspots' },
    { id: 'forecast', label: 'Forecast & Risk' },
    { id: 'insights', label: 'Insights' },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">📊 UIDAI Intelligence</div>
        <ul className="navbar-menu">
          {pages.map(page => (
            <li key={page.id} className="navbar-item">
              <button
                className={`navbar-link ${currentPage === page.id ? 'active' : ''}`}
                onClick={() => setCurrentPage(page.id)}
              >
                {page.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
