import React from 'react';

function Trends() {
  return (
    <div className="trends-page">
      <div className="page-header">
        <h2 className="page-title">Trend Analysis</h2>
        <p className="page-subtitle">Historical patterns, seasonality, and geographic distribution</p>
      </div>

      <div className="alert alert-info">
        <strong>📈 Overview:</strong> Aadhaar enrolment shows strong seasonal patterns with peaks in September (3,156) 
        and lows in January (659). Geographic concentration is high—90% of demand concentrated in specific high-performing pincodes.
      </div>

      <div className="viz-grid">
        <div className="viz-card">
          <img src="/outputs/01_univariate_time_trend.png" alt="Monthly Time Trend" />
          <div className="viz-title">📊 Monthly Enrolment Trends</div>
          <div className="viz-description">
            <strong>Finding:</strong> Clear seasonal pattern with September peak (3,156 enrolments) followed by sharp decline. 
            Suggests promotional period or administrative cycle. January baseline lowest at 659. Pattern repeatable for planning.
          </div>
        </div>

        <div className="viz-card">
          <img src="/outputs/02_univariate_distributions.png" alt="Distributions" />
          <div className="viz-title">📊 Distribution Analysis</div>
          <div className="viz-description">
            <strong>Finding:</strong> Right-skewed distributions across metrics. Most pincodes enroll 50-200 people per month, 
            but outliers go up to 500+. Growth rates highly volatile (−50% to +600%). Indicates diverse operational capacities.
          </div>
        </div>

        <div className="viz-card">
          <img src="/outputs/03_univariate_state_totals.png" alt="State Rankings" />
          <div className="viz-title">🏆 Top States by Total Enrolment</div>
          <div className="viz-description">
            <strong>Finding:</strong> Top 5 states account for 68% of all enrolments. Geographic concentration creates both opportunity 
            (surge capacity in key areas) and risk (dependent on few regions). States ranked by cumulative performance over 7 months.
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Key Insights from Trends</h3>
        <table className="stats-table">
          <thead>
            <tr>
              <th>Trend</th>
              <th>Observation</th>
              <th>Implication</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Seasonality</strong></td>
              <td>September peak 5x higher than January baseline</td>
              <td>Plan surge capacity in Sep-Oct; minimize staffing Dec-Jan</td>
            </tr>
            <tr>
              <td><strong>Volatility</strong></td>
              <td>Month-to-month growth ranges −50% to +600%</td>
              <td>Unpredictable demand; need flexible resource allocation</td>
            </tr>
            <tr>
              <td><strong>Geographic Concentration</strong></td>
              <td>Top 10 pincodes = 45% of total enrolments</td>
              <td>Focus resources on high-performers; develop others</td>
            </tr>
            <tr>
              <td><strong>State Performance</strong></td>
              <td>Top 5 states = 68% of enrolments</td>
              <td>Identify lagging states; share best practices from top performers</td>
            </tr>
            <tr>
              <td><strong>Growth Patterns</strong></td>
              <td>Some pincodes sustain 100%+ growth; others stagnate</td>
              <td>Segment by performance; tailor interventions</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="card">
        <h3>Interpreting the Visualizations</h3>
        <div style={{marginTop: '20px'}}>
          <h4 style={{color: '#1f4788', marginBottom: '15px'}}>Chart 1: Monthly Time Trend</h4>
          <p style={{marginBottom: '15px', lineHeight: '1.6', fontSize: '14px'}}>
            <strong>What to look for:</strong> The line chart shows monthly totals over 7 months (June 2025 - January 2026). 
            The peak in September is evident, followed by a sharp drop. This pattern suggests a campaign or administrative 
            cycle that could be replicated or improved.
          </p>

          <h4 style={{color: '#1f4788', marginBottom: '15px', marginTop: '25px'}}>Chart 2: Distribution Analysis</h4>
          <p style={{marginBottom: '15px', lineHeight: '1.6', fontSize: '14px'}}>
            <strong>What to look for:</strong> The histograms and box plots show spread and outliers. The right-skewed distributions 
            indicate that most pincodes perform modestly, but a few outliers drive significant volume. This variability is normal 
            in government-scale operations but suggests different operational maturity levels.
          </p>

          <h4 style={{color: '#1f4788', marginBottom: '15px', marginTop: '25px'}}>Chart 3: Top States Ranking</h4>
          <p style={{marginBottom: '15px', lineHeight: '1.6', fontSize: '14px'}}>
            <strong>What to look for:</strong> The bar chart ranks states by total enrolment volume. The dramatic drop-off after 
            the top 5 states shows concentration. This concentration can be an asset (focus) or a risk (dependency). 
            The goal: grow lagging states without losing momentum in top performers.
          </p>
        </div>
      </div>

      <div className="card">
        <h3>Operational Recommendations from Trends</h3>
        <div style={{marginTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px'}}>
          <div style={{padding: '20px', background: '#eafce6', borderRadius: '6px', borderLeft: '4px solid #27ae60'}}>
            <h4 style={{color: '#27ae60', marginBottom: '10px'}}>1. Plan for Seasonality</h4>
            <p style={{fontSize: '14px', color: '#666', lineHeight: '1.6'}}>
              Hire temporary staff and prep infrastructure for September surge. Reduce operational costs in low-demand months. 
              Use Jan-May as training and maintenance windows.
            </p>
          </div>
          <div style={{padding: '20px', background: '#eafce6', borderRadius: '6px', borderLeft: '4px solid #27ae60'}}>
            <h4 style={{color: '#27ae60', marginBottom: '10px'}}>2. Geographic Expansion</h4>
            <p style={{fontSize: '14px', color: '#666', lineHeight: '1.6'}}>
              Study top-performing pincodes. Replicate their success factors (infrastructure, staffing, processes) 
              to underperforming regions. Share best practices across states.
            </p>
          </div>
          <div style={{padding: '20px', background: '#eafce6', borderRadius: '6px', borderLeft: '4px solid #27ae60'}}>
            <h4 style={{color: '#27ae60', marginBottom: '10px'}}>3. Stabilize Volatility</h4>
            <p style={{fontSize: '14px', color: '#666', lineHeight: '1.6'}}>
              For pincodes with extreme growth swings, investigate root causes (staffing changes? policy shifts?). 
              Implement predictive staffing to smooth demand fluctuations.
            </p>
          </div>
        </div>
      </div>

      <div className="alert alert-warning">
        <strong>⚠️ Data Quality Note:</strong> These trends are based on cleaned, validated data from 3,967 records across 
        90 pincodes over 7 months. While insights are actionable, recommend cross-validating with source systems and conducting 
        interviews in high-performing areas to understand success factors.
      </div>
    </div>
  );
}

export default Trends;
