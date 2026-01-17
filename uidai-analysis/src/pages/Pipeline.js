import React from 'react';

function Pipeline() {
  const steps = [
    {
      number: 1,
      title: 'Load & Clean',
      file: '01_load_and_clean.py',
      input: 'enrolment.csv',
      output: 'enrolment_cleaned.csv',
      description: 'Load raw data, standardize columns, convert dates (DD-MM-YYYY format), calculate total enrolments from age groups, remove invalid records.',
      records: '3,967 valid records'
    },
    {
      number: 2,
      title: 'Aggregate',
      file: '02_merge_datasets.py',
      input: 'enrolment_cleaned.csv',
      output: 'enrolment_monthly.csv',
      description: 'Group by month-state-district-pincode, sum total enrolments, create monthly time series across 7 months.',
      records: '478 aggregated records'
    },
    {
      number: 3,
      title: 'Engineer Features',
      file: '03_feature_engineering.py',
      input: 'enrolment_monthly.csv',
      output: 'enrolment_features.csv',
      description: 'Calculate month-over-month growth (%), 3-month rolling average, enrolment share by district/state, create analysis-ready dataset.',
      records: '478 rows with 9 columns'
    },
    {
      number: 4,
      title: 'Analyze',
      file: '04_analysis.py',
      input: 'enrolment_features.csv',
      output: '8 PNG visualizations',
      description: 'Univariate (time trends, distributions), bivariate (correlations, heatmaps), trivariate (hotspots, growth patterns) analysis.',
      records: '8 publication-quality charts'
    },
    {
      number: 5,
      title: 'Predict & Detect',
      file: '05_ml_analysis.py',
      input: 'enrolment_features.csv',
      output: 'flagged_records.csv',
      description: 'Implement 3-month rolling average forecasting (MAE: 15.43), Z-score anomaly detection, Isolation Forest clustering, risk classification.',
      records: '228 flagged records'
    }
  ];

  return (
    <div className="pipeline-page">
      <div className="page-header">
        <h2 className="page-title">Data Pipeline Architecture</h2>
        <p className="page-subtitle">Transparent, reproducible, 5-step data transformation process</p>
      </div>

      <div className="alert alert-info">
        <strong>🔍 Transparency First:</strong> Every step is documented, reproducible, and uses interpretable methods. 
        No black-box ML—all algorithms are explained. All code is commented.
      </div>

      <div className="pipeline-steps">
        {steps.map(step => (
          <div key={step.number} className="step-card">
            <div className="step-number">{step.number}</div>
            <div className="step-title">{step.title}</div>
            <div style={{fontSize: '12px', color: '#999', marginBottom: '15px'}}>
              <code style={{background: '#f5f5f5', padding: '5px 10px', borderRadius: '3px'}}>{step.file}</code>
            </div>
            <div className="step-description">{step.description}</div>
            <div style={{marginTop: '15px', fontSize: '13px', color: '#1f4788', fontWeight: '600'}}>
              📦 {step.records}
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <h3>Step-by-Step Details</h3>
        <div style={{marginTop: '30px'}}>
          {steps.map(step => (
            <div key={step.number} style={{marginBottom: '35px', paddingBottom: '30px', borderBottom: '1px solid #eee'}}>
              <div style={{display: 'grid', gridTemplateColumns: '150px 1fr', gap: '30px'}}>
                <div>
                  <h4 style={{color: '#1f4788', fontSize: '16px', marginBottom: '10px'}}>Step {step.number}: {step.title}</h4>
                  <p style={{fontSize: '13px', color: '#666'}}><strong>Script:</strong> {step.file}</p>
                </div>
                <div>
                  <p style={{marginBottom: '15px', lineHeight: '1.7'}}>{step.description}</p>
                  <table style={{width: '100%', fontSize: '13px', borderCollapse: 'collapse'}}>
                    <tbody>
                      <tr style={{borderBottom: '1px solid #eee'}}>
                        <td style={{padding: '8px', fontWeight: '600', color: '#999'}}>Input</td>
                        <td style={{padding: '8px'}}><code>{step.input}</code></td>
                      </tr>
                      <tr style={{borderBottom: '1px solid #eee'}}>
                        <td style={{padding: '8px', fontWeight: '600', color: '#999'}}>Output</td>
                        <td style={{padding: '8px'}}><code>{step.output}</code></td>
                      </tr>
                      <tr>
                        <td style={{padding: '8px', fontWeight: '600', color: '#999'}}>Records</td>
                        <td style={{padding: '8px'}}>{step.records}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3>Data Flow Diagram</h3>
        <div style={{marginTop: '25px', textAlign: 'center', fontSize: '14px', fontFamily: 'monospace', lineHeight: '2.5', background: '#f5f5f5', padding: '20px', borderRadius: '6px'}}>
          <div>Raw Data (enrolment.csv - 3,967 records)</div>
          <div style={{color: '#999'}}>↓</div>
          <div style={{color: '#1f4788', fontWeight: '600'}}>1️⃣ CLEAN (01_load_and_clean.py)</div>
          <div style={{color: '#666'}}>↓ enrolment_cleaned.csv</div>
          <div style={{color: '#1f4788', fontWeight: '600'}}>2️⃣ AGGREGATE (02_merge_datasets.py)</div>
          <div style={{color: '#666'}}>↓ enrolment_monthly.csv (478 rows)</div>
          <div style={{color: '#1f4788', fontWeight: '600'}}>3️⃣ ENGINEER (03_feature_engineering.py)</div>
          <div style={{color: '#666'}}>↓ enrolment_features.csv (9 columns)</div>
          <div style={{color: '#1f4788', fontWeight: '600'}}>4️⃣ ANALYZE (04_analysis.py)</div>
          <div style={{color: '#666'}}>↓ 8 PNG visualizations</div>
          <div style={{color: '#1f4788', fontWeight: '600'}}>5️⃣ PREDICT & DETECT (05_ml_analysis.py)</div>
          <div style={{color: '#666'}}>↓ flagged_records.csv (228 records)</div>
          <div style={{color: '#27ae60', fontWeight: '600', fontSize: '15px'}}>✅ INSIGHTS & RECOMMENDATIONS</div>
        </div>
      </div>

      <div className="card">
        <h3>Analysis Methods</h3>
        <div style={{marginTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px'}}>
          <div style={{padding: '20px', background: '#ecf4ff', borderRadius: '6px', borderLeft: '4px solid #1f4788'}}>
            <h4 style={{color: '#1f4788', marginBottom: '10px'}}>📊 Visualization</h4>
            <ul style={{fontSize: '13px', color: '#666', lineHeight: '1.8', marginLeft: '20px'}}>
              <li>Univariate: Time series, histograms, rankings</li>
              <li>Bivariate: Scatter plots, heatmaps, trends</li>
              <li>Trivariate: Multi-dimensional hotspot analysis</li>
            </ul>
          </div>
          <div style={{padding: '20px', background: '#fff8e1', borderRadius: '6px', borderLeft: '4px solid #f39c12'}}>
            <h4 style={{color: '#f39c12', marginBottom: '10px'}}>🔮 Forecasting</h4>
            <ul style={{fontSize: '13px', color: '#666', lineHeight: '1.8', marginLeft: '20px'}}>
              <li>3-month rolling average</li>
              <li>Mean Absolute Error: 15.43</li>
              <li>MAPE: 66.6% (baseline)</li>
            </ul>
          </div>
          <div style={{padding: '20px', background: '#faddd4', borderRadius: '6px', borderLeft: '4px solid #e74c3c'}}>
            <h4 style={{color: '#e74c3c', marginBottom: '10px'}}>⚠️ Anomaly Detection</h4>
            <ul style={{fontSize: '13px', color: '#666', lineHeight: '1.8', marginLeft: '20px'}}>
              <li>Z-score (threshold: Z > 2.5)</li>
              <li>Isolation Forest clustering</li>
              <li>228 anomalies flagged (5.7%)</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="alert alert-success">
        <strong>✅ Reproducibility:</strong> All 5 scripts can be re-run monthly. New data → Run pipeline → Updated insights. 
        Code is modular, documented, and designed for production use.
      </div>
    </div>
  );
}

export default Pipeline;
