import React, { useEffect, useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { AlertTriangle, Shield, AlertOctagon, Target, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import Papa from 'papaparse';

interface ProcessedState {
    state: string;
    adoption: number;
    risk: 'Low' | 'Medium' | 'High' | 'Critical';
    riskScore: number;
    deviation: number;
}

const PDSAnomalyRisk: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [states, setStates] = useState<ProcessedState[]>([]);
    const [avgAdoption, setAvgAdoption] = useState(0);
    const [riskDistribution, setRiskDistribution] = useState({ low: 0, medium: 0, high: 0, critical: 0 });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/data/authenticated_pds_trans.csv');
                const text = await response.text();

                Papa.parse(text, {
                    header: true,
                    complete: (results) => {
                        const data = results.data as any[];
                        const validData = data.filter(d => d['State/UT'] && d['State/UT'].trim() !== '');

                        // First pass to calculate average
                        const adoptions: number[] = [];
                        validData.forEach(d => {
                            const val = d['% Aadhaar based PDS transactions in June 2021'];
                            if (val && val !== 'NA') {
                                adoptions.push(parseInt(val, 10));
                            }
                        });

                        const avg = adoptions.reduce((a, b) => a + b, 0) / adoptions.length;
                        setAvgAdoption(avg);

                        // Calculate standard deviation
                        const variance = adoptions.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / adoptions.length;
                        const stdDev = Math.sqrt(variance);

                        // Process states with risk scores
                        const processed: ProcessedState[] = validData
                            .filter(d => d['% Aadhaar based PDS transactions in June 2021'] !== 'NA')
                            .map(d => {
                                const adoption = parseInt(d['% Aadhaar based PDS transactions in June 2021'], 10);
                                const deviation = avg - adoption; // Positive means below average
                                const zScore = stdDev > 0 ? deviation / stdDev : 0;

                                // Risk calculation based on deviation from mean and absolute value
                                let risk: 'Low' | 'Medium' | 'High' | 'Critical' = 'Low';
                                let riskScore = 0;

                                if (adoption === 0) {
                                    risk = 'Critical';
                                    riskScore = 100;
                                } else if (adoption < 50) {
                                    risk = 'High';
                                    riskScore = 75 + (50 - adoption) * 0.5;
                                } else if (adoption < 90) {
                                    risk = 'Medium';
                                    riskScore = 25 + (90 - adoption) * 0.5;
                                } else {
                                    risk = 'Low';
                                    riskScore = Math.max(0, 25 - (adoption - 90));
                                }

                                return {
                                    state: d['State/UT'],
                                    adoption,
                                    risk,
                                    riskScore: Math.min(100, Math.round(riskScore)),
                                    deviation: Math.round(deviation)
                                };
                            });

                        // Count risk distribution
                        const dist = { low: 0, medium: 0, high: 0, critical: 0 };
                        processed.forEach(s => {
                            dist[s.risk.toLowerCase() as keyof typeof dist]++;
                        });

                        setStates(processed.sort((a, b) => b.riskScore - a.riskScore));
                        setRiskDistribution(dist);
                        setLoading(false);
                    }
                });
            } catch (error) {
                console.error('Error:', error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading Risk Assessment...</p>
            </div>
        );
    }

    const getRiskColor = (risk: string) => {
        switch (risk) {
            case 'Critical': return '#c53030';
            case 'High': return '#f56565';
            case 'Medium': return '#f69320';
            case 'Low': return '#48bb78';
            default: return '#a0aec0';
        }
    };

    const highRiskStates = states.filter(s => s.risk === 'High' || s.risk === 'Critical');
    const topRiskStates = states.slice(0, 10);

    return (
        <div className="pds-anomaly-risk">
            {/* Methodology Banner */}
            <div className="methodology-banner">
                <Shield size={24} />
                <div>
                    <strong>Risk Assessment Methodology</strong>
                    <p>Risk scores are calculated based on deviation from national average adoption ({avgAdoption.toFixed(1)}%) and absolute adoption levels. This analysis identifies states requiring focused intervention.</p>
                    <ul>
                        <li><strong>Critical:</strong> 0% adoption - Immediate attention required</li>
                        <li><strong>High:</strong> Below 50% - Significant implementation gaps</li>
                        <li><strong>Medium:</strong> 50-89% - Room for improvement</li>
                        <li><strong>Low:</strong> 90%+ - Strong performance</li>
                    </ul>
                </div>
            </div>

            {/* Risk Distribution KPIs */}
            <div className="card-grid">
                <motion.div
                    className="stat-card success"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="stat-icon success">
                        <Shield size={24} color="white" />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Low Risk</div>
                        <div className="stat-value">{riskDistribution.low}</div>
                        <div className="stat-meta positive">Stable performance</div>
                    </div>
                </motion.div>

                <motion.div
                    className="stat-card warning"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="stat-icon warning">
                        <Activity size={24} color="white" />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Medium Risk</div>
                        <div className="stat-value">{riskDistribution.medium}</div>
                        <div className="stat-meta">Monitoring required</div>
                    </div>
                </motion.div>

                <motion.div
                    className="stat-card danger"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="stat-icon danger">
                        <AlertTriangle size={24} color="white" />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">High Risk</div>
                        <div className="stat-value">{riskDistribution.high}</div>
                        <div className="stat-meta negative">Intervention needed</div>
                    </div>
                </motion.div>

                <motion.div
                    className="stat-card critical"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <div className="stat-icon critical">
                        <AlertOctagon size={24} color="white" />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Critical Risk</div>
                        <div className="stat-value">{riskDistribution.critical}</div>
                        <div className="stat-meta negative">Immediate action</div>
                    </div>
                </motion.div>
            </div>

            {/* Risk Score Chart */}
            <motion.div
                className="chart-container"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
            >
                <h3 className="chart-title">
                    <Target size={20} style={{ marginRight: 8 }} />
                    Top 10 States by Operational Risk Score
                </h3>
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={topRiskStates} layout="vertical" margin={{ top: 10, right: 30, left: 150, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                        <XAxis type="number" domain={[0, 100]} />
                        <YAxis type="category" dataKey="state" tick={{ fontSize: 11 }} width={140} />
                        <Tooltip
                            formatter={(value: number, name: string) => [
                                name === 'riskScore' ? `${value}/100` : `${value}%`,
                                name === 'riskScore' ? 'Risk Score' : 'Adoption'
                            ]}
                        />
                        <Bar dataKey="riskScore" name="Risk Score" radius={[0, 4, 4, 0]}>
                            {topRiskStates.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={getRiskColor(entry.risk)} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </motion.div>

            {/* Risk Impact Table */}
            <motion.div
                className="table-container"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
            >
                <h3 className="chart-title">
                    <AlertOctagon size={20} style={{ marginRight: 8 }} />
                    States Flagged for Intervention
                </h3>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>State/UT</th>
                            <th>Adoption Rate</th>
                            <th>Deviation from Avg</th>
                            <th>Risk Score</th>
                            <th>Risk Level</th>
                            <th>Recommended Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {highRiskStates.map((state) => (
                            <tr key={state.state}>
                                <td><strong>{state.state}</strong></td>
                                <td>{state.adoption}%</td>
                                <td style={{ color: state.deviation > 0 ? '#f56565' : '#48bb78' }}>
                                    {state.deviation > 0 ? '-' : '+'}{Math.abs(state.deviation)}%
                                </td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <div style={{ width: 60, height: 8, background: '#edf2f7', borderRadius: 4, overflow: 'hidden' }}>
                                            <div style={{
                                                width: `${state.riskScore}%`,
                                                height: '100%',
                                                background: getRiskColor(state.risk),
                                                borderRadius: 4
                                            }}></div>
                                        </div>
                                        {state.riskScore}/100
                                    </div>
                                </td>
                                <td>
                                    <span className={`status-badge risk-${state.risk.toLowerCase()}`}>
                                        {state.risk}
                                    </span>
                                </td>
                                <td style={{ fontSize: '0.85rem', color: '#4a5568' }}>
                                    {state.risk === 'Critical'
                                        ? 'Infrastructure assessment & policy review'
                                        : 'Capacity building & awareness campaigns'
                                    }
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </motion.div>

            {/* Risk Interpretation */}
            <motion.div
                className="insights-summary"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
            >
                <h3 className="chart-title">Risk Interpretation & Operational Guidance</h3>
                <div className="insights-grid">
                    <div className="insight-card" style={{ background: '#fff5f5', borderLeft: '4px solid #c53030' }}>
                        <AlertOctagon size={24} color="#c53030" />
                        <div>
                            <strong>Critical States Warning</strong>
                            <p>States with 0% adoption may indicate systemic barriers such as lack of biometric infrastructure, connectivity issues, or policy gaps. If current patterns persist, these states will continue to rely on non-digital PDS processes.</p>
                        </div>
                    </div>
                    <div className="insight-card info">
                        <Shield size={24} />
                        <div>
                            <strong>Positive Indicators</strong>
                            <p><strong>{riskDistribution.low} states</strong> demonstrate stable, high-performing adoption rates (&ge;90%), indicating mature digital infrastructure for PDS authentication.</p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default PDSAnomalyRisk;
