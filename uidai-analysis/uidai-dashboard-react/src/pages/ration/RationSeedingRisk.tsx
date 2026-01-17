import React, { useEffect, useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { AlertTriangle, Shield, AlertOctagon, Target, Activity, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';
import Papa from 'papaparse';

interface ProcessedState {
    state: string;
    totalCards: number;
    seededCards: number;
    seedingRate: number;
    coverageGap: number;
    risk: 'Low' | 'Medium' | 'High' | 'Critical';
    riskScore: number;
    unseededCards: number;
}

const RationSeedingRisk: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [states, setStates] = useState<ProcessedState[]>([]);
    const [avgSeeding, setAvgSeeding] = useState(0);
    const [riskDistribution, setRiskDistribution] = useState({ low: 0, medium: 0, high: 0, critical: 0 });
    const [totalUnseeded, setTotalUnseeded] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/data/aadhar_ration_seeding.csv');
                const text = await response.text();

                Papa.parse(text, {
                    header: true,
                    complete: (results) => {
                        const data = results.data as any[];
                        const validData = data.filter(d =>
                            d['State/UTs'] &&
                            d['State/UTs'].trim() !== '' &&
                            d['State/UTs'] !== 'Total'
                        );

                        // Process states with risk scores
                        const processed: ProcessedState[] = validData.map(d => {
                            const totalCards = parseInt(d['Total Ration Cards']?.replace(/,/g, '') || '0', 10);
                            const seededCards = parseInt(d['No. of Ration Cards Seeded']?.replace(/,/g, '') || '0', 10);
                            const seedingRate = parseInt(d['Seeding@ (%)'] || '0', 10);
                            const coverageGap = 100 - seedingRate;
                            const unseededCards = totalCards - seededCards;

                            let risk: 'Low' | 'Medium' | 'High' | 'Critical' = 'Low';
                            let riskScore = 0;

                            if (seedingRate === 0) {
                                risk = 'Critical';
                                riskScore = 100;
                            } else if (seedingRate < 50) {
                                risk = 'High';
                                riskScore = 75 + (50 - seedingRate) * 0.5;
                            } else if (seedingRate < 90) {
                                risk = 'Medium';
                                riskScore = 25 + (90 - seedingRate) * 0.5;
                            } else {
                                risk = 'Low';
                                riskScore = Math.max(0, 25 - (seedingRate - 90) * 2.5);
                            }

                            return {
                                state: d['State/UTs'],
                                totalCards,
                                seededCards,
                                seedingRate,
                                coverageGap,
                                risk,
                                riskScore: Math.min(100, Math.round(riskScore)),
                                unseededCards
                            };
                        });

                        // Calculate stats
                        const avg = processed.reduce((a, s) => a + s.seedingRate, 0) / processed.length;
                        const unseeded = processed.reduce((a, s) => a + s.unseededCards, 0);

                        // Risk distribution
                        const dist = { low: 0, medium: 0, high: 0, critical: 0 };
                        processed.forEach(s => {
                            dist[s.risk.toLowerCase() as keyof typeof dist]++;
                        });

                        setStates(processed.sort((a, b) => b.riskScore - a.riskScore));
                        setAvgSeeding(avg);
                        setTotalUnseeded(unseeded);
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

    const formatNumber = (num: number) => num.toLocaleString('en-IN');

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
        <div className="ration-risk-assessment">
            {/* Methodology Banner */}
            <div className="methodology-banner">
                <Shield size={24} />
                <div>
                    <strong>Coverage Risk Assessment Methodology</strong>
                    <p>Risk scores are calculated based on Aadhaar seeding coverage. Lower seeding rates indicate higher service-readiness risk for Aadhaar-enabled PDS delivery.</p>
                    <ul>
                        <li><strong>Critical:</strong> 0% seeding - Major implementation barriers</li>
                        <li><strong>High:</strong> Below 50% - Significant coverage gaps</li>
                        <li><strong>Medium:</strong> 50-89% - Partial coverage, improvement needed</li>
                        <li><strong>Low:</strong> 90%+ - Strong coverage, service-ready</li>
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
                        <div className="stat-meta positive">Service-ready states</div>
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
                        <div className="stat-meta">Improvement needed</div>
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
                        <div className="stat-meta negative">Coverage gaps</div>
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
                        <div className="stat-meta negative">No seeding</div>
                    </div>
                </motion.div>
            </div>

            {/* Unseeded Cards Impact */}
            <motion.div
                className="info-banner"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                style={{ background: 'linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%)', borderLeftColor: '#c53030' }}
            >
                <CreditCard size={24} color="#c53030" />
                <div>
                    <strong>Service Delivery Impact</strong>
                    <p>Approximately <strong>{formatNumber(totalUnseeded)}</strong> ration cards remain unseeded nationally. Beneficiaries with unseeded cards may face challenges in Aadhaar-based verification at PDS outlets.</p>
                </div>
            </motion.div>

            {/* Risk Score Chart */}
            <motion.div
                className="chart-container"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
            >
                <h3 className="chart-title">
                    <Target size={20} style={{ marginRight: 8 }} />
                    Top 10 States by Coverage Risk Score
                </h3>
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={topRiskStates} layout="vertical" margin={{ top: 10, right: 30, left: 150, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                        <XAxis type="number" domain={[0, 100]} />
                        <YAxis type="category" dataKey="state" tick={{ fontSize: 11 }} width={140} />
                        <Tooltip
                            formatter={(value: number, name: string) => [
                                name === 'riskScore' ? `${value}/100` : `${value}%`,
                                name === 'riskScore' ? 'Risk Score' : 'Seeding Rate'
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
                            <th>Seeding Rate</th>
                            <th>Unseeded Cards</th>
                            <th>Risk Score</th>
                            <th>Risk Level</th>
                            <th>Service Readiness</th>
                        </tr>
                    </thead>
                    <tbody>
                        {highRiskStates.map((state) => (
                            <tr key={state.state}>
                                <td><strong>{state.state}</strong></td>
                                <td>{state.seedingRate}%</td>
                                <td style={{ color: '#f56565' }}>{formatNumber(state.unseededCards)}</td>
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
                                        ? 'Not ready for Aadhaar-based PDS'
                                        : 'Partial readiness - gaps remain'
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
                <h3 className="chart-title">Risk Interpretation &amp; Policy Guidance</h3>
                <div className="insights-grid">
                    <div className="insight-card" style={{ background: '#fff5f5', borderLeft: '4px solid #c53030' }}>
                        <AlertOctagon size={24} color="#c53030" />
                        <div>
                            <strong>Critical States</strong>
                            <p>States with 0% seeding (Assam, Meghalaya) may face significant challenges implementing Aadhaar-enabled PDS. Root cause analysis recommended.</p>
                        </div>
                    </div>
                    <div className="insight-card info">
                        <Shield size={24} />
                        <div>
                            <strong>Service Readiness</strong>
                            <p><strong>{riskDistribution.low} states</strong> are fully service-ready with &ge;90% Aadhaar seeding, enabling seamless digital PDS verification.</p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default RationSeedingRisk;
