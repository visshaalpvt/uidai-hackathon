import React from 'react';

function Forecast() {
  return (
    <div className="forecast-page">
      <div className="page-header">
        <h2 className="page-title">Forecast & Risk Intelligence</h2>
        <p className="page-subtitle">Predictive analytics, risk classification, and anomaly detection</p>
      </div>

      <div className="alert alert-info">
        <strong>🔮 Forecasting Method:</strong> 3-month rolling average with Mean Absolute Error of 15.43 enrolments. 
        Use for baseline planning (1-3 month horizon). Not suitable for long-term strategic planning without seasonal adjustments.
      </div>

      <div className="card">
        <h3>Forecasting Methodology</h3>
        <div style={{marginTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px'}}>
          <div style={{padding: '20px', background: '#f9f9f9', borderRadius: '6px', borderLeft: '4px solid #1f4788'}}>
            <h4 style={{color: '#1f4788', marginBottom: '15px', fontSize: '16px'}}>📊 Method: Rolling Average</h4>
            <p style={{fontSize: '14px', color: '#666', lineHeight: '1.7', marginBottom: '10px'}}>
              We use a 3-month rolling average forecast: each month's prediction is the average of the previous 3 months.
            </p>
            <p style={{fontSize: '12px', color: '#999', fontFamily: 'monospace', background: 'white', padding: '10px', borderRadius: '4px'}}>
              Forecast(month) = Avg(month-1, month-2, month-3)
            </p>
          </div>

          <div style={{padding: '20px', background: '#f9f9f9', borderRadius: '6px', borderLeft: '4px solid #27ae60'}}>
            <h4 style={{color: '#27ae60', marginBottom: '15px', fontSize: '16px'}}>✅ Accuracy</h4>
            <p style={{fontSize: '14px', color: '#666', lineHeight: '1.7'}}>
              <strong>MAE (Mean Absolute Error):</strong> 15.43 enrolments<br/>
              <strong>MAPE (Mean Absolute % Error):</strong> 66.6%<br/>
              <strong>Accuracy Range:</strong> ±15 enrolments (±30-40% for areas with 40-50 baseline)
            </p>
          </div>

          <div style={{padding: '20px', background: '#f9f9f9', borderRadius: '6px', borderLeft: '4px solid #f39c12'}}>
            <h4 style={{color: '#f39c12', marginBottom: '15px', fontSize: '16px'}}>⏱️ Horizon & Limitations</h4>
            <p style={{fontSize: '14px', color: '#666', lineHeight: '1.7'}}>
              <strong>Best for:</strong> 1-3 month operational planning<br/>
              <strong>Not suitable for:</strong> Long-term strategy (6+ months)<br/>
              <strong>Weakness:</strong> Ignores seasonal patterns, policy changes, external shocks
            </p>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Risk Classification Matrix</h3>
        <p style={{marginTop: '15px', marginBottom: '20px', fontSize: '14px', color: '#666'}}>
          Areas are classified on two dimensions: <strong>Demand Level</strong> (volume) and <strong>Risk Level</strong> (stability).
        </p>
        <div className="risk-matrix">
          <table className="risk-table">
            <thead>
              <tr>
                <th style={{minWidth: '150px'}}>Demand \ Risk</th>
                <th style={{minWidth: '150px'}}>Low Risk</th>
                <th style={{minWidth: '150px'}}>Medium Risk</th>
                <th style={{minWidth: '150px'}}>High Risk</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{fontWeight: '600', background: '#f9f9f9'}}>Low Demand</td>
                <td className="risk-low">
                  <strong>Green ✅</strong><br/>
                  <small>Stable, low-volume areas</small><br/>
                  <small style={{color: '#666'}}>Action: Gradual development</small>
                </td>
                <td className="risk-medium">
                  <strong>Yellow ⚠️</strong><br/>
                  <small>Unpredictable, small scale</small><br/>
                  <small style={{color: '#666'}}>Action: Monitor + investigate</small>
                </td>
                <td className="risk-high">
                  <strong>Red 🔴</strong><br/>
                  <small>Volatile, struggling areas</small><br/>
                  <small style={{color: '#666'}}>Action: Emergency support</small>
                </td>
              </tr>
              <tr>
                <td style={{fontWeight: '600', background: '#f9f9f9'}}>Medium Demand</td>
                <td className="risk-low">
                  <strong>Green ✅</strong><br/>
                  <small>Ideal state: stable, growing</small><br/>
                  <small style={{color: '#666'}}>Action: Maintain, optimize</small>
                </td>
                <td className="risk-medium">
                  <strong>Yellow ⚠️</strong><br/>
                  <small>Growing but volatile</small><br/>
                  <small style={{color: '#666'}}>Action: Stabilize operations</small>
                </td>
                <td className="risk-high">
                  <strong>Red 🔴</strong><br/>
                  <small>High demand, unstable</small><br/>
                  <small style={{color: '#666'}}>Action: Capacity + stability</small>
                </td>
              </tr>
              <tr>
                <td style={{fontWeight: '600', background: '#f9f9f9'}}>High Demand</td>
                <td className="risk-low">
                  <strong>Green ✅</strong><br/>
                  <small>Star performers</small><br/>
                  <small style={{color: '#666'}}>Action: Maintain capacity</small>
                </td>
                <td className="risk-medium">
                  <strong>Yellow ⚠️</strong><br/>
                  <small>High volume, some volatility</small><br/>
                  <small style={{color: '#666'}}>Action: Surge capacity + stability</small>
                </td>
                <td className="risk-high">
                  <strong>Red 🔴</strong><br/>
                  <small>Critical: extreme demand+risk</small><br/>
                  <small style={{color: '#666'}}>Action: Emergency response</small>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h3>Anomaly Detection Methods</h3>
        <div style={{marginTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px'}}>
          <div style={{padding: '20px', background: '#ecf4ff', borderRadius: '6px', borderLeft: '4px solid #1f4788'}}>
            <h4 style={{color: '#1f4788', marginBottom: '10px'}}>1. Z-Score Method</h4>
            <p style={{fontSize: '13px', color: '#666', lineHeight: '1.7', marginBottom: '10px'}}>
              <strong>How it works:</strong> Identifies data points more than 2.5 standard deviations from the mean.
            </p>
            <p style={{fontSize: '12px', color: '#999', fontFamily: 'monospace', background: 'white', padding: '8px', borderRadius: '3px', marginBottom: '10px'}}>
              Z = (X - Mean) / StdDev
            </p>
            <p style={{fontSize: '13px', color: '#666'}}>
              <strong>Results:</strong> 0 outliers found at Z>2.5 threshold. Data is relatively clean.
            </p>
          </div>

          <div style={{padding: '20px', background: '#fff8e1', borderRadius: '6px', borderLeft: '4px solid #f39c12'}}>
            <h4 style={{color: '#f39c12', marginBottom: '10px'}}>2. Isolation Forest</h4>
            <p style={{fontSize: '13px', color: '#666', lineHeight: '1.7', marginBottom: '10px'}}>
              <strong>How it works:</strong> ML algorithm that isolates outliers by randomly splitting data. 
              Points requiring fewer splits are anomalies.
            </p>
            <p style={{fontSize: '13px', color: '#666', marginBottom: '10px'}}>
              <strong>Results:</strong> 24 anomalies detected (~5% of data). Typically spikes or drops unexplainable by normal variance.
            </p>
            <p style={{fontSize: '12px', background: 'white', padding: '8px', borderRadius: '3px', color: '#666'}}>
              ✓ More sensitive than Z-score <br/>
              ✓ Detects multivariate anomalies <br/>
              ✓ No assumptions about distribution
            </p>
          </div>

          <div style={{padding: '20px', background: '#faddd4', borderRadius: '6px', borderLeft: '4px solid #e74c3c'}}>
            <h4 style={{color: '#e74c3c', marginBottom: '10px'}}>3. Rule-Based Flagging</h4>
            <p style={{fontSize: '13px', color: '#666', lineHeight: '1.7', marginBottom: '10px'}}>
              <strong>How it works:</strong> Business rules based on domain knowledge:
            </p>
            <ul style={{fontSize: '12px', color: '#666', marginLeft: '15px', lineHeight: '1.8'}}>
              <li>Growth >300% in single month</li>
              <li>Volume drops >50% month-over-month</li>
              <li>Enrolment >500 (capacity stress)</li>
              <li>Negative or zero enrolments</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Anomalies Detected (24 records)</h3>
        <p style={{marginTop: '15px', marginBottom: '20px', fontSize: '14px', color: '#666'}}>
          The following types of anomalies were found and flagged:
        </p>
        <table className="stats-table">
          <thead>
            <tr>
              <th>Anomaly Type</th>
              <th>Count</th>
              <th>Example</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Extreme Growth Spikes</strong></td>
              <td>8</td>
              <td>Pincode X: 50 → 450 enrolments (+800%)</td>
              <td>Investigate root cause (campaign? error?)</td>
            </tr>
            <tr>
              <td><strong>Sharp Drops</strong></td>
              <td>7</td>
              <td>Pincode Y: 300 → 75 enrolments (-75%)</td>
              <td>Check if capacity reduction or reporting error</td>
            </tr>
            <tr>
              <td><strong>Sustained High Volume</strong></td>
              <td>6</td>
              <td>Pincode Z: 600+ consistently</td>
              <td>Validate capacity; check for data errors</td>
            </tr>
            <tr>
              <td><strong>Multivariate Outliers</strong></td>
              <td>3</td>
              <td>Unusual combination of growth + timing</td>
              <td>Manual review and investigation</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="card">
        <h3>Forecast Action Plan</h3>
        <div style={{marginTop: '20px'}}>
          <h4 style={{color: '#1f4788', marginBottom: '15px', fontSize: '16px'}}>✅ For Operations Planning</h4>
          <ol style={{fontSize: '14px', color: '#666', lineHeight: '2', marginLeft: '20px', marginBottom: '20px'}}>
            <li>Use rolling average forecasts to plan 1-3 month ahead capacity</li>
            <li>Check forecasted demand against current staffing capacity</li>
            <li>Flag areas where forecast > available capacity</li>
            <li>Plan hiring and training 4-6 weeks before peak season</li>
            <li>Adjust forecast quarterly based on actual performance</li>
          </ol>

          <h4 style={{color: '#1f4788', marginBottom: '15px', fontSize: '16px'}}>⚠️ For Risk Management</h4>
          <ol style={{fontSize: '14px', color: '#666', lineHeight: '2', marginLeft: '20px', marginBottom: '20px'}}>
            <li>Monitor anomalies monthly; investigate any new patterns</li>
            <li>Classify areas into risk matrix; prioritize Tier 1 (Red) areas</li>
            <li>Implement stability interventions in high-risk zones</li>
            <li>Track effectiveness of interventions month-over-month</li>
            <li>Escalate persistent anomalies to leadership for review</li>
          </ol>

          <h4 style={{color: '#1f4788', marginBottom: '15px', fontSize: '16px'}}>🎯 For Strategic Planning</h4>
          <ol style={{fontSize: '14px', color: '#666', lineHeight: '2', marginLeft: '20px'}}>
            <li>Use rolling 3-month averages (not raw forecasts) for strategic projections</li>
            <li>Account for seasonal patterns when planning annual budgets</li>
            <li>Identify structural growth trends vs. noise</li>
            <li>Use flagged areas as expansion targets (low-risk) or support cases (high-risk)</li>
            <li>Validate strategic assumptions quarterly</li>
          </ol>
        </div>
      </div>

      <div className="alert alert-warning">
        <strong>🎯 Key Reminder:</strong> Forecasts are not predictions of the future. They are statistical estimates based on historical patterns. 
        Use them to inform decisions, cross-validate with domain experts, and update regularly. One-size-fits-all forecasts don't account for 
        local factors, policy changes, or special events.
      </div>
    </div>
  );
}

export default Forecast;
