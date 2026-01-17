import React, { useState } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import Overview from './pages/Overview';
import Pipeline from './pages/Pipeline';
import Trends from './pages/Trends';
import Hotspots from './pages/Hotspots';
import Forecast from './pages/Forecast';
import Insights from './pages/Insights';

function App() {
  const [currentPage, setCurrentPage] = useState('overview');

  const renderPage = () => {
    switch(currentPage) {
      case 'overview':
        return <Overview />;
      case 'pipeline':
        return <Pipeline />;
      case 'trends':
        return <Trends />;
      case 'hotspots':
        return <Hotspots />;
      case 'forecast':
        return <Forecast />;
      case 'insights':
        return <Insights />;
      default:
        return <Overview />;
    }
  };

  return (
    <div className="App">
      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <main className="main-content">
        {renderPage()}
      </main>
      <footer className="footer">
        <p>&copy; 2026 UIDAI Aadhaar Enrolment Intelligence System. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
