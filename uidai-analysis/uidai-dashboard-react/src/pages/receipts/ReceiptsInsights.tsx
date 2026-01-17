import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
import { Lightbulb, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';

const ReceiptsInsights: React.FC = () => {
    const [stats, setStats] = useState({
        totalGenerated: 0,
        avgConversion: 0,
        topState: '',
        topStateVal: 0,
        lowConversionCount: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/data/state_wise_aadhaar_2023_24.csv');
                const csvText = await response.text();

                Papa.parse(csvText, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results: any) => {
                        const raw = results.data;
                        let totalGen = 0;
                        let totalEnr = 0;
                        let maxGen = 0;
                        let maxState = '';
                        let lowConv = 0;

                        raw.filter((r: any) => r["India/State/UT"] !== 'India' && r["India/State/UT"]).forEach((r: any) => {
                            const g = parseInt(String(r["Aadhaar Number Provided"]).replace(/,/g, ''), 10) || 0;
                            const e = parseInt(String(r["Total Enrolment"]).replace(/,/g, ''), 10) || 0;
                            totalGen += g;
                            totalEnr += e;

                            if (g > maxGen) {
                                maxGen = g;
                                maxState = r["India/State/UT"];
                            }

                            if (e > 1000 && (g / e) < 0.8) {
                                lowConv++;
                            }
                        });

                        setStats({
                            totalGenerated: totalGen,
                            avgConversion: totalEnr > 0 ? (totalGen / totalEnr) * 100 : 0,
                            topState: maxState,
                            topStateVal: maxGen,
                            lowConversionCount: lowConv
                        });

                        setLoading(false);
                    }
                });
            } catch (error) {
                console.error("Error", error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div>Generating Insights...</div>;

    return (
        <div className="overview-container">
            {/* Primary Insight Banner */}
            <div style={{
                background: 'linear-gradient(135deg, #1a3672 0%, #2d4a8c 100%)',
                color: 'white',
                padding: '1.5rem 2rem',
                borderRadius: '12px',
                marginBottom: '2rem',
                display: 'flex',
                gap: '1rem',
                alignItems: 'flex-start'
            }}>
                <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '8px' }}>
                    <Lightbulb size={28} color="white" />
                </div>
                <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '8px' }}>National Conversion Stability</h3>
                    <p style={{ color: 'rgba(255,255,255,0.9)', lineHeight: 1.6 }}>
                        India achieved a <strong>{stats.avgConversion.toFixed(1)}% conversion rate</strong> for the 2023-24 period, processing over
                        <strong> {(stats.totalGenerated / 1000000).toFixed(0)} Million</strong> successful Aadhaar generations.
                        This indicates a highly mature and stable enrolment ecosystem.
                    </p>
                </div>
            </div>

            {/* Insights Grid */}
            <div className="card-grid three-cols">
                <div className="stat-card success">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                        <CheckCircle size={24} color="#16a34a" />
                        <strong style={{ fontSize: '1rem' }}>Operational Efficiency</strong>
                    </div>
                    <p style={{ fontSize: '0.9rem', color: '#4a5568', lineHeight: 1.5 }}>
                        The gap between Enrolment and Generation is minimal across most high-volume states.
                        <strong> {stats.topState}</strong> led operations with <strong>{(stats.topStateVal / 1000000).toFixed(1)}M</strong> cards generated.
                    </p>
                </div>

                <div className="stat-card warning">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                        <AlertTriangle size={24} color="#ed8936" />
                        <strong style={{ fontSize: '1rem' }}>Optimization Targets</strong>
                    </div>
                    <p style={{ fontSize: '0.9rem', color: '#4a5568', lineHeight: 1.5 }}>
                        Despite overall health, <strong>{stats.lowConversionCount} regions</strong> showed conversion rates below 80%.
                        These are the primary targets for operational improvement campaigns.
                    </p>
                </div>

                <div className="stat-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                        <TrendingUp size={24} color="#6366f1" />
                        <strong style={{ fontSize: '1rem' }}>Growth Outlook</strong>
                    </div>
                    <p style={{ fontSize: '0.9rem', color: '#4a5568', lineHeight: 1.5 }}>
                        The system's ~200M request handling capacity suggests robustness for future population updates
                        without major architectural changes.
                    </p>
                </div>
            </div>

            {/* Recommendations */}
            <div className="chart-container" style={{ marginTop: '1rem' }}>
                <h3 className="chart-title">Recommendations</h3>
                <div className="recommendations-grid">
                    <div className="recommendation-card critical">
                        <div className="rec-header">
                            <AlertTriangle size={18} color="#c53030" />
                            <strong>Priority Action</strong>
                        </div>
                        <p>Focus resources on the bottom 10% conversion states for operational clean-up.</p>
                    </div>
                    <div className="recommendation-card important">
                        <div className="rec-header">
                            <CheckCircle size={18} color="#c05621" />
                            <strong>Infrastructure</strong>
                        </div>
                        <p>Maintain current infrastructure capacity for high-volume zones (UP, Maharashtra).</p>
                    </div>
                    <div className="recommendation-card info">
                        <div className="rec-header">
                            <Lightbulb size={18} color="#3182ce" />
                            <strong>Investigation</strong>
                        </div>
                        <p>Investigate rejected applications in '{stats.topState}' to reduce absolute fallout volume.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReceiptsInsights;
