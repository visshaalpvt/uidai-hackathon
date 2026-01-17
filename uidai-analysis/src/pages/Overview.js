import React from 'react';

function Overview() {
  return (
    <div className="overview-page">
      <div className="hero">
        <h1>🎯 UIDAI Aadhaar Enrolment Intelligence System</h1>
        <p>Real-time analytics and forecasting for government-scale identity enrollment operations</p>
        <div className="btn-group">
          <button className="btn btn-primary">View Full Pipeline</button>
          <button className="btn btn-secondary">Download Report</button>
        </div>
      </div>

      <div className="page-header">
        <h2 className="page-title">System Overview</h2>
        <p className="page-subtitle">Key Performance Indicators & Executive Summary</p>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Total Enrolments</div>
          <div className="kpi-value">3,967</div>
          <div className="kpi-label">Records Analyzed</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Time Period</div>
          <div className="kpi-value">7</div>
          <div className="kpi-label">Months (Jun 2025 - Jan 2026)</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Geographic Coverage</div>
          <div className="kpi-value">90</div>
          <div className="kpi-label">Unique Pincodes</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Flagged Areas</div>
          <div className="kpi-value">228</div>
          <div className="kpi-label">Requiring Intervention</div>
        </div>
      </div>

      <div className="card">
        <h3>What is this system?</h3>
        <p style={{marginTop: '15px', lineHeight: '1.8', fontSize: '15px'}}>
          The UIDAI Aadhaar Enrolment Intelligence System transforms raw enrolment data into actionable insights 
          for policy makers and operations teams. Our 5-step data pipeline processes over 3,900 records, identifies 
          geographic hotspots, forecasts demand, and detects operational anomalies—all with transparent, interpretable 
          methodology.
        </p>
      </div>

      <div className="card">
        <h3>Key Features</h3>
        <ul style={{marginTop: '15px', marginLeft: '20px', lineHeight: '2'}}>
          <li>📈 <strong>Trend Analysis:</strong> Monthly patterns, seasonal peaks, geographic distribution</li>
          <li>🔥 <strong>Hotspot Detection:</strong> Identify high-demand areas with growth volatility</li>
          <li>🔮 <strong>Demand Forecasting:</strong> 3-month rolling average predictions (MAE: 15.43)</li>
          <li>⚠️ <strong>Anomaly Detection:</strong> Z-score and Isolation Forest methods</li>
          <li>🎯 <strong>Risk Classification:</strong> 2D matrix (Demand × Risk) for operational prioritization</li>
          <li>📊 <strong>8 Publication-Quality Visualizations:</strong> Professional charts for presentations</li>
        </ul>
      </div>

      <div className="alert alert-info">
        <strong>💡 System Status:</strong> All data processed and validated. Ready for operational deployment.
      </div>

      <div className="card">
        <h3>Who is this for?</h3>
        <table className="stats-table">
          <thead>
            <tr>
              <th>User Role</th>
              <th>Key Focus Areas</th>
              <th>Time Investment</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Executives</strong></td>
              <td>Overview → Insights (KPIs, recommendations, strategic impact)</td>
              <td>10 mins</td>
            </tr>
            <tr>
              <td><strong>Operations Teams</strong></td>
              <td>Hotspots & Forecast & Risk (specific areas, intervention priorities)</td>
              <td>20 mins</td>
            </tr>
            <tr>
              <td><strong>Data Analysts</strong></td>
              <td>Pipeline + Trends (methodology, code, detailed analysis)</td>
              <td>45 mins</td>
            </tr>
            <tr>
              <td><strong>Policy Makers</strong></td>
              <td>Full Dashboard (all pages for comprehensive understanding)</td>
              <td>30 mins</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="card">
        <h3>Quick Stats</h3>
        <table className="stats-table">
          <thead>
            <tr>
              <th>Metric</th>
              <th>Value</th>
              <th>Insight</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Peak Month</td>
              <td>September</td>
              <td>3,156 enrolments (79% of average monthly)</td>
            </tr>
            <tr>
              <td>Lowest Month</td>
              <td>January</td>
              <td>659 enrolments (baseline period)</td>
            </tr>
            <tr>
              <td>Geographic Concentration</td>
              <td>High</td>
              <td>Top 10 pincodes account for 45% of demand</td>
            </tr>
            <tr>
              <td>Growth Volatility</td>
              <td>Extreme</td>
              <td>Some areas spike 1,100%, others drop 50%+</td>
            </tr>
            <tr>
              <td>High-Risk Areas</td>
              <td>58</td>
              <td>Volatile + high-demand (need stabilization)</td>
            </tr>
            <tr>
              <td>Forecast Accuracy</td>
              <td>MAE: 15.43</td>
              <td>±15 enrolments average prediction error</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="card">
        <h3>Next Steps</h3>
        <div style={{marginTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px'}}>
          <div style={{padding: '20px', background: '#f9f9f9', borderRadius: '6px'}}>
            <h4 style={{color: '#1f4788', marginBottom: '10px'}}>📊 Explore Data</h4>
            <p style={{fontSize: '14px', color: '#666', lineHeight: '1.6'}}>
              Navigate through Trends, Hotspots, and Forecast pages to understand patterns and operational insights.
            </p>
          </div>
          <div style={{padding: '20px', background: '#f9f9f9', borderRadius: '6px'}}>
            <h4 style={{color: '#1f4788', marginBottom: '10px'}}>🔍 Understand Methods</h4>
            <p style={{fontSize: '14px', color: '#666', lineHeight: '1.6'}}>
              Visit Data Pipeline page to see how raw data is cleaned, aggregated, and analyzed using transparent methods.
            </p>
          </div>
          <div style={{padding: '20px', background: '#f9f9f9', borderRadius: '6px'}}>
            <h4 style={{color: '#1f4788', marginBottom: '10px'}}>💡 Get Insights</h4>
            <p style={{fontSize: '14px', color: '#666', lineHeight: '1.6'}}>
              Read Insights page for key findings and 4 operational recommendations ready for immediate action.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Overview;
