import React from 'react';

function Hotspots() {
  return (
    <div className="hotspots-page">
      <div className="page-header">
        <h2 className="page-title">Hotspots & Anomalies</h2>
        <p className="page-subtitle">Geographic clusters, growth volatility, and areas requiring operational focus</p>
      </div>

      <div className="alert alert-danger">
        <strong>🔥 Critical Finding:</strong> 228 records (47.7% of data) flagged for operational attention due to high demand, 
        volatility, or anomalies. These areas need surge capacity, stabilization, or investigation.
      </div>

      <div className="viz-grid">
        <div className="viz-card">
          <img src="/outputs/05_bivariate_state_heatmap.png" alt="State-Month Heatmap" />
          <div className="viz-title">🗺️ State × Month Heatmap</div>
          <div className="viz-description">
            <strong>Finding:</strong> Clear geographic and temporal clusters. Darker colors = higher enrolment volume. 
            September surge is visible across all states. Some states peak earlier/later (state-specific seasonality). 
            Shows opportunity for synchronized planning across states.
          </div>
        </div>

        <div className="viz-card">
          <img src="/outputs/06_bivariate_top_states_trend.png" alt="Top 5 States Trend" />
          <div className="viz-title">📈 Top 5 States Trend Lines</div>
          <div className="viz-description">
            <strong>Finding:</strong> Top performers follow similar seasonal patterns but at different scales. 
            Some states sustain growth across months; others dip in Dec-Jan. Cross-state comparison shows lagging 
            vs. leading performers—valuable for peer learning and intervention planning.
          </div>
        </div>

        <div className="viz-card">
          <img src="/outputs/07_trivariate_district_hotspots.png" alt="District Hotspots" />
          <div className="viz-title">🎯 District-Level Hotspots</div>
          <div className="viz-description">
            <strong>Finding:</strong> Heatmap shows enrolment intensity by district and month. Hotspots (red/orange) 
            represent areas where surge capacity is critical. Coolspots (blue) represent under-performing regions where 
            growth interventions could have high impact. Use for targeted resource allocation.
          </div>
        </div>

        <div className="viz-card">
          <img src="/outputs/08_trivariate_growth_by_state.png" alt="Growth by State" />
          <div className="viz-title">📊 Month-over-Month Growth by State</div>
          <div className="viz-description">
            <strong>Finding:</strong> Growth volatility varies dramatically by state. Some states show stable 10-20% month-over-month 
            growth; others spike 100%+ or drop 50%+. Volatility = high operational risk. Target high-volatility states for 
            stability interventions and process improvements.
          </div>
        </div>
      </div>

      <div className="card">
        <h3>What Are "Hotspots"?</h3>
        <p style={{marginTop: '15px', lineHeight: '1.7', marginBottom: '15px'}}>
          A hotspot is a geographic location (pincode or district) with high enrolment volume or significant growth volatility. 
          Hotspots need attention because they are either:
        </p>
        <ol style={{marginLeft: '20px', lineHeight: '2'}}>
          <li><strong>High-Demand Hotspots:</strong> Consistently high enrolment (500+ per month). Need surge capacity and staffing.</li>
          <li><strong>Volatile Hotspots:</strong> Extreme month-to-month swings (growth >100% or drops >50%). Need stabilization strategies.</li>
          <li><strong>Anomaly Hotspots:</strong> Unusual patterns detected by algorithms (statistical outliers). Need investigation.</li>
          <li><strong>Growth Hotspots:</strong> Rapidly expanding areas (300%+ YoY). Need infrastructure investment.</li>
        </ol>
      </div>

      <div className="card">
        <h3>Flagged Records Summary (228 Areas)</h3>
        <table className="stats-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Count</th>
              <th>% of Data</th>
              <th>Action Required</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>High-Demand Areas</strong></td>
              <td>176</td>
              <td>36.8%</td>
              <td>Plan surge capacity; hire seasonal staff</td>
            </tr>
            <tr>
              <td><strong>High-Risk Areas</strong></td>
              <td>58</td>
              <td>12.1%</td>
              <td>Investigate volatility; stabilize processes</td>
            </tr>
            <tr>
              <td><strong>Anomaly-Flagged</strong></td>
              <td>24</td>
              <td>5.0%</td>
              <td>Review data quality; check for errors/unusual events</td>
            </tr>
            <tr>
              <td><strong>Combined (Multiple Flags)</strong></td>
              <td>228</td>
              <td>47.7%</td>
              <td>Tiered response based on flags</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="card">
        <h3>Understanding Hotspot Visualizations</h3>
        <div style={{marginTop: '20px'}}>
          <h4 style={{color: '#1f4788', marginBottom: '15px'}}>Heatmap Color Legend</h4>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '25px'}}>
            <div style={{padding: '15px', background: '#8b0000', color: 'white', borderRadius: '4px', textAlign: 'center'}}>
              <strong>Dark Red</strong><br />Extreme (1000+)
            </div>
            <div style={{padding: '15px', background: '#ff6b35', color: 'white', borderRadius: '4px', textAlign: 'center'}}>
              <strong>Orange</strong><br />High (500-1000)
            </div>
            <div style={{padding: '15px', background: '#ffd700', color: '#333', borderRadius: '4px', textAlign: 'center'}}>
              <strong>Yellow</strong><br />Medium (200-500)
            </div>
            <div style={{padding: '15px', background: '#90ee90', color: '#333', borderRadius: '4px', textAlign: 'center'}}>
              <strong>Light Green</strong><br />Low (50-200)
            </div>
            <div style={{padding: '15px', background: '#1f4788', color: 'white', borderRadius: '4px', textAlign: 'center'}}>
              <strong>Dark Blue</strong><br />Minimal (<50)
            </div>
          </div>

          <h4 style={{color: '#1f4788', marginBottom: '15px'}}>How to Read Trend Lines</h4>
          <p style={{lineHeight: '1.7', marginBottom: '15px', fontSize: '14px'}}>
            In the "Top 5 States Trend" and "Growth by State" charts, each line represents a state. Steep lines = rapid growth or decline. 
            Flat lines = stable operations. Crossing lines = one state overtaking another. Use these to identify states that need 
            intervention or deserve recognition.
          </p>
        </div>
      </div>

      <div className="card">
        <h3>Operational Priorities</h3>
        <div style={{marginTop: '20px'}}>
          <h4 style={{color: '#1f4788', marginBottom: '15px'}}>Tier 1 - Immediate Action (High-Demand + High-Risk)</h4>
          <p style={{marginBottom: '15px', fontSize: '14px', lineHeight: '1.6'}}>
            <strong>Areas:</strong> ~15-20 pincodes with both high enrolment AND volatility.<br/>
            <strong>Action:</strong> Emergency staffing, capacity planning, process audit. These areas are straining resources 
            and may be near breaking point.<br/>
            <strong>Timeline:</strong> 1-2 weeks
          </p>

          <h4 style={{color: '#1f4788', marginBottom: '15px'}}>Tier 2 - Medium Priority (High-Demand Only)</h4>
          <p style={{marginBottom: '15px', fontSize: '14px', lineHeight: '1.6'}}>
            <strong>Areas:</strong> ~160 pincodes with high demand but stable operations.<br/>
            <strong>Action:</strong> Seasonal surge planning, technology upgrades, infrastructure expansion.<br/>
            <strong>Timeline:</strong> 1-3 months
          </p>

          <h4 style={{color: '#1f4788', marginBottom: '15px'}}>Tier 3 - Investigation (Anomalies)</h4>
          <p style={{marginBottom: '15px', fontSize: '14px', lineHeight: '1.6'}}>
            <strong>Areas:</strong> ~24 pincodes flagged as anomalies by statistical algorithms.<br/>
            <strong>Action:</strong> Data quality review, interview operators, investigate root causes.<br/>
            <strong>Timeline:</strong> 2-4 weeks
          </p>

          <h4 style={{color: '#1f4788', marginBottom: '15px'}}>Tier 4 - Growth Opportunity (Low-Performing)</h4>
          <p style={{marginBottom: '15px', fontSize: '14px', lineHeight: '1.6'}}>
            <strong>Areas:</strong> ~250 pincodes (52.3%) not in hotspot category but room to grow.<br/>
            <strong>Action:</strong> Copy success factors from high performers, capacity building, awareness campaigns.<br/>
            <strong>Timeline:</strong> Ongoing
          </p>
        </div>
      </div>

      <div className="alert alert-warning">
        <strong>📌 Important:</strong> "Hotspot" does not mean "problem." High-demand hotspots are success stories that need 
        resources. Volatile hotspots need stability. Use data to inform decisions, not to judge areas negatively. 
        The goal is to support all areas in growing sustainably.
      </div>
    </div>
  );
}

export default Hotspots;
