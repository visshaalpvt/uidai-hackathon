import React, { useEffect, useState } from 'react';
import {
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    Area, BarChart, Bar, ComposedChart, Cell, Line
} from 'recharts';
import Papa from 'papaparse';
import { AlertOctagon, ShieldAlert, Activity, Info, Zap, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import ImpactModule from '../../components/ImpactModule';
import { calculateTrendProjection, getRiskLevel } from '../../utils/analytics';

interface BiometricRecord {
    date: string; state: string; district: string; pincode: string;
    bio_age_5_17: number; bio_age_17_: number;
}

interface AnomalyData {
    month: string; total: number; momChange: number; zScore: number;
    isAnomaly: boolean; rollingAvg: number;
}

interface RiskLocation {
    pincode: string; district: string; state: string; total: number;
    volatility: number; spikeCount: number; riskScore: number;
    riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
}

const AnomalyRisk: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [anomalyData, setAnomalyData] = useState<AnomalyData[]>([]);
    const [riskLocations, setRiskLocations] = useState<RiskLocation[]>([]);
    const [stats, setStats] = useState({
        totalAnomalies: 0, criticalRiskCount: 0, highRiskCount: 0,
        avgVolatility: 0, maxSpike: 0
    });
    const [impact, setImpact] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/data/biometric.csv');
                const text = await response.text();

                Papa.parse(text, {
                    header: true, dynamicTyping: true,
                    complete: (results) => {
                        const data = results.data as BiometricRecord[];
                        const validData = data.filter(d => d.date && d.pincode);

                        const monthlyAgg: { [key: string]: number } = {};
                        const pincodeMonthly: { [key: string]: { [month: string]: number } } = {};

                        validData.forEach(record => {
                            const dateParts = record.date.split('-');
                            const monthKey = `${dateParts[2]}-${dateParts[1].padStart(2, '0')}`;
                            const total = (record.bio_age_5_17 || 0) + (record.bio_age_17_ || 0);

                            if (!monthlyAgg[monthKey]) monthlyAgg[monthKey] = 0;
                            monthlyAgg[monthKey] += total;

                            if (!pincodeMonthly[record.pincode]) pincodeMonthly[record.pincode] = {};
                            if (!pincodeMonthly[record.pincode][monthKey]) pincodeMonthly[record.pincode][monthKey] = 0;
                            pincodeMonthly[record.pincode][monthKey] += total;
                        });

                        const sortedMonths = Object.keys(monthlyAgg).sort();
                        const monthlyTotals = sortedMonths.map(m => monthlyAgg[m]);

                        // Impact Module Calculation
                        const projection = calculateTrendProjection(monthlyTotals, 3);
                        const risk = getRiskLevel(projection.projectedValue, 30000); // 30k threshold
                        setImpact({
                            ...projection,
                            riskLevel: risk,
                            impactText: `If biometric authentication trends continue (${projection.trendDirection}), expect ${projection.projectedValue.toLocaleString()} attempts next quarter. High volume increases probability of Auth Failures, requiring redundant scanner deployment.`
                        });

                        const mean = monthlyTotals.reduce((a, b) => a + b, 0) / monthlyTotals.length;
                        const stdDev = Math.sqrt(monthlyTotals.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / monthlyTotals.length);

                        const processedAnomalies: AnomalyData[] = sortedMonths.map((month, idx) => {
                            const total = monthlyAgg[month];
                            const prevTotal = idx > 0 ? monthlyAgg[sortedMonths[idx - 1]] : total;
                            const momChange = prevTotal > 0 ? ((total - prevTotal) / prevTotal) * 100 : 0;
                            const zScore = stdDev > 0 ? (total - mean) / stdDev : 0;
                            const startIdx = Math.max(0, idx - 2);
                            const windowVals = sortedMonths.slice(startIdx, idx + 1).map(m => monthlyAgg[m]);
                            const rollingAvg = windowVals.reduce((a, b) => a + b, 0) / windowVals.length;
                            const isAnomaly = Math.abs(zScore) > 2 || Math.abs(momChange) > 50;
                            return { month, total, momChange, zScore, isAnomaly, rollingAvg };
                        });

                        const locationRisk: RiskLocation[] = [];
                        Object.entries(pincodeMonthly).forEach(([pincode, monthData]) => {
                            const values = Object.values(monthData);
                            // Relaxed constraint: Allow even single month records to be assessed for volume risk
                            if (values.length === 0) return;

                            const locMean = values.reduce((a, b) => a + b, 0) / values.length;
                            // Volatility requires at least 2 points; otherwise 0
                            const locStdDev = values.length > 1
                                ? Math.sqrt(values.reduce((sum, val) => sum + Math.pow(val - locMean, 2), 0) / values.length)
                                : 0;

                            const volatility = (locMean > 0 && values.length > 1) ? (locStdDev / locMean) * 100 : 0;

                            let spikeCount = 0;
                            if (values.length > 1) {
                                for (let i = 1; i < values.length; i++) {
                                    if (values[i - 1] > 0 && Math.abs((values[i] - values[i - 1]) / values[i - 1]) > 1) spikeCount++;
                                }
                            }

                            const record = validData.find(d => String(d.pincode) === String(pincode));
                            if (!record) return;

                            // Adjusted Risk Score logic for sparse data
                            // If only 1 month data, high risk if volume is suspiciously low (< 10) or extremely high (> 1000)
                            let riskScore = 0;

                            if (values.length === 1) {
                                // Sparse data risk heuristics
                                const singleMonthTotal = values[0];
                                if (singleMonthTotal < 10) riskScore = 80; // Critical: Very low volume in solitary month (Likely inactive)
                                else if (singleMonthTotal > 1000) riskScore = 60; // High: Sudden massive volume in one month (Camp/Anomaly)
                                else riskScore = 20; // Low risk otherwise
                            } else {
                                // Existing multi-month logic
                                riskScore = Math.min(100, (volatility * 0.4) + (spikeCount * 15) + (values.length < 3 ? 20 : 0));
                            }

                            let riskLevel: 'Low' | 'Medium' | 'High' | 'Critical' = 'Low';
                            if (riskScore >= 70) riskLevel = 'Critical';
                            else if (riskScore >= 50) riskLevel = 'High';
                            else if (riskScore >= 30) riskLevel = 'Medium';

                            locationRisk.push({ pincode, district: record.district, state: record.state, total: values.reduce((a, b) => a + b, 0), volatility, spikeCount, riskScore, riskLevel });
                        });

                        const sortedRisk = locationRisk.sort((a, b) => b.riskScore - a.riskScore).slice(0, 20);
                        setStats({
                            totalAnomalies: processedAnomalies.filter(a => a.isAnomaly).length,
                            criticalRiskCount: sortedRisk.filter(r => r.riskLevel === 'Critical').length,
                            highRiskCount: sortedRisk.filter(r => r.riskLevel === 'High').length,
                            avgVolatility: sortedRisk.length > 0 ? sortedRisk.reduce((sum, r) => sum + r.volatility, 0) / sortedRisk.length : 0,
                            maxSpike: Math.max(...processedAnomalies.map(a => Math.abs(a.momChange)))
                        });
                        setAnomalyData(processedAnomalies);
                        setRiskLocations(sortedRisk);
                        setLoading(false);
                    }
                });
            } catch (error) { console.error('Error:', error); setLoading(false); }
        };
        fetchData();
    }, []);

    const formatNumber = (num: number) => num.toLocaleString('en-IN');
    const getRiskColor = (level: string) => ({ Critical: '#c53030', High: '#f56565', Medium: '#ed8936', Low: '#48bb78' }[level] || '#48bb78');

    if (loading) return <div className="loading-container"><div className="loading-spinner"></div><p>Running Anomaly Detection...</p></div>;

    return (
        <div className="anomaly-risk-container">
            {impact && (
                <ImpactModule
                    title="Authentication Stress Projection"
                    datasetName="Biometric Activity"
                    trendDirection={impact.trendDirection}
                    projectionPeriod="3 Months"
                    projectedValue={impact.projectedValue}
                    impactMetricLabel="Projected Auth Attempts"
                    impactPredictionText={impact.impactText}
                    riskLevel={impact.riskLevel}
                />
            )}

            <motion.div className="methodology-banner" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <Info size={20} />
                <div><strong>Detection Methodology:</strong> Z-Score Analysis (flags &gt;2 std dev), MoM Spike Detection (&gt;50% changes), and Risk Scoring (volatility + spike frequency)</div>
            </motion.div>

            <div className="card-grid">
                <motion.div className="stat-card danger" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <div className="stat-icon danger"><AlertOctagon size={24} color="white" /></div>
                    <div className="stat-content"><div className="stat-label">Detected Anomalies</div><div className="stat-value">{stats.totalAnomalies}</div><div className="stat-meta">Months with unusual patterns</div></div>
                </motion.div>
                <motion.div className="stat-card critical" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <div className="stat-icon critical"><ShieldAlert size={24} color="white" /></div>
                    <div className="stat-content"><div className="stat-label">Critical Risk Locations</div><div className="stat-value">{stats.criticalRiskCount}</div><div className="stat-meta">Require immediate attention</div></div>
                </motion.div>
                <motion.div className="stat-card warning" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <div className="stat-icon warning"><Zap size={24} color="white" /></div>
                    <div className="stat-content"><div className="stat-label">Max Monthly Spike</div><div className="stat-value">{stats.maxSpike.toFixed(1)}%</div><div className="stat-meta">Largest MoM change</div></div>
                </motion.div>
                <motion.div className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <div className="stat-icon"><Activity size={24} color="white" /></div>
                    <div className="stat-content"><div className="stat-label">Avg Volatility</div><div className="stat-value">{stats.avgVolatility.toFixed(1)}%</div><div className="stat-meta">Top 20 risk locations</div></div>
                </motion.div>
            </div>

            <motion.div className="chart-container" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
                <h3 className="chart-title"><AlertOctagon size={20} style={{ marginRight: 8 }} />Anomaly Detection Timeline</h3>
                <ResponsiveContainer width="100%" height={350}>
                    <ComposedChart data={anomalyData}>
                        <defs><linearGradient id="colorAnomaly" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#1a3672" stopOpacity={0.8} /><stop offset="95%" stopColor="#1a3672" stopOpacity={0.1} /></linearGradient></defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.95)', border: 'none', borderRadius: 8 }} formatter={(value: number, name: string) => name === 'Z-Score' ? (value || 0).toFixed(2) : name === 'MoM Change' ? `${(value || 0).toFixed(1)}%` : formatNumber(value || 0)} />
                        <Legend />
                        <Area type="monotone" dataKey="total" name="Total Updates" fill="url(#colorAnomaly)" stroke="#1a3672" strokeWidth={2} />
                        <Line type="monotone" dataKey="rollingAvg" name="3-Month Rolling Avg" stroke="#48bb78" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                    </ComposedChart>
                </ResponsiveContainer>
            </motion.div>

            <div className="charts-row">
                <motion.div className="chart-container medium" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                    <h3 className="chart-title">Z-Score by Month</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={anomalyData}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="month" tick={{ fontSize: 10 }} /><YAxis domain={[-3, 3]} tick={{ fontSize: 11 }} /><Tooltip formatter={(value: number) => (value || 0).toFixed(2)} /><Bar dataKey="zScore" name="Z-Score">{anomalyData.map((entry, index) => <Cell key={`cell-${index}`} fill={Math.abs(entry.zScore) > 2 ? '#f56565' : '#1a3672'} />)}</Bar></BarChart>
                    </ResponsiveContainer>
                </motion.div>
                <motion.div className="chart-container medium" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                    <h3 className="chart-title">Month-over-Month Change (%)</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={anomalyData}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="month" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} /><Tooltip formatter={(value: number) => `${(value || 0).toFixed(1)}%`} /><Bar dataKey="momChange" name="MoM Change %">{anomalyData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.momChange > 0 ? '#48bb78' : '#ed8936'} opacity={Math.abs(entry.momChange) > 50 ? 1 : 0.6} />)}</Bar></BarChart>
                    </ResponsiveContainer>
                </motion.div>
            </div>

            <motion.div className="table-container" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                <h3 className="chart-title"><Target size={20} style={{ marginRight: 8 }} />Location Risk Assessment (Top 20)</h3>
                <table><thead><tr><th>Pincode</th><th>District</th><th>State</th><th>Total Updates</th><th>Volatility</th><th>Risk Score</th><th>Risk Level</th></tr></thead>
                    <tbody>{riskLocations.map((loc) => (
                        <tr key={loc.pincode}><td><strong>{loc.pincode}</strong></td><td>{loc.district}</td><td>{loc.state}</td><td>{formatNumber(loc.total)}</td><td>{loc.volatility.toFixed(1)}%</td>
                            <td><div className="risk-score-bar"><div className="risk-score-fill" style={{ width: `${loc.riskScore}%`, background: getRiskColor(loc.riskLevel) }}></div><span>{loc.riskScore.toFixed(0)}</span></div></td>
                            <td><span className="badge" style={{ background: `${getRiskColor(loc.riskLevel)}20`, color: getRiskColor(loc.riskLevel), border: `1px solid ${getRiskColor(loc.riskLevel)}` }}>{loc.riskLevel}</span></td></tr>
                    ))}</tbody></table>
            </motion.div>

            <motion.div className="explanation-section" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                <h3 className="chart-title">Understanding Risk Levels</h3>
                <div className="explanation-cards">
                    <div className="explanation-card critical"><strong>🔴 Critical</strong><p>Extreme volatility (score &gt;70). May indicate equipment or staffing issues.</p></div>
                    <div className="explanation-card high"><strong>🟠 High</strong><p>Significant fluctuations (score 50-70). Schedule maintenance checks.</p></div>
                    <div className="explanation-card medium"><strong>🟡 Medium</strong><p>Moderate variability (score 30-50). Worth monitoring.</p></div>
                    <div className="explanation-card low"><strong>🟢 Low</strong><p>Stable operations (score &lt;30). Healthy service delivery.</p></div>
                </div>
            </motion.div>
        </div>
    );
};

export default AnomalyRisk;
