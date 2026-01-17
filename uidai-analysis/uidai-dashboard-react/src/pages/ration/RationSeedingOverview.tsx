import React, { useEffect, useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import {
    CheckCircle, AlertTriangle, TrendingUp, MapPin, CreditCard, Activity,
    Shield, Award, AlertOctagon, Users
} from 'lucide-react';
import { motion } from 'framer-motion';
import Papa from 'papaparse';

// Types
interface RationSeedingRecord {
    'Sl.No': string;
    'State/UTs': string;
    'Total Ration Cards': string;
    'No. of Ration Cards Seeded': string;
    'Seeding@ (%)': string;
}

interface ProcessedState {
    state: string;
    totalCards: number;
    seededCards: number;
    seedingRate: number;
    coverageGap: number;
    riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
    rank: number;
}

const RationSeedingOverview: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [states, setStates] = useState<ProcessedState[]>([]);
    const [stats, setStats] = useState({
        totalStates: 0,
        avgSeedingRate: 0,
        totalRationCards: 0,
        totalSeeded: 0,
        nationalSeedingRate: 0,
        fullSeeding: 0,
        zeroSeeding: 0,
        topState: '',
        bottomState: ''
    });
    const [riskDistribution, setRiskDistribution] = useState<{ name: string; value: number; color: string }[]>([]);

    const COLORS = {
        low: '#48bb78',
        medium: '#f69320',
        high: '#f56565',
        critical: '#c53030'
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/data/aadhar_ration_seeding.csv');
                const text = await response.text();

                Papa.parse(text, {
                    header: true,
                    complete: (results) => {
                        const data = results.data as RationSeedingRecord[];
                        // Filter out Total row and empty rows
                        const validData = data.filter(d =>
                            d['State/UTs'] &&
                            d['State/UTs'].trim() !== '' &&
                            d['State/UTs'] !== 'Total'
                        );

                        // Process data
                        const processed: ProcessedState[] = validData.map(d => {
                            const totalCards = parseInt(d['Total Ration Cards']?.replace(/,/g, '') || '0', 10);
                            const seededCards = parseInt(d['No. of Ration Cards Seeded']?.replace(/,/g, '') || '0', 10);
                            const seedingRate = parseInt(d['Seeding@ (%)'] || '0', 10);
                            const coverageGap = 100 - seedingRate;

                            let riskLevel: 'Low' | 'Medium' | 'High' | 'Critical' = 'Low';
                            if (seedingRate === 0) riskLevel = 'Critical';
                            else if (seedingRate < 50) riskLevel = 'High';
                            else if (seedingRate < 90) riskLevel = 'Medium';

                            return {
                                state: d['State/UTs'],
                                totalCards,
                                seededCards,
                                seedingRate,
                                coverageGap,
                                riskLevel,
                                rank: 0
                            };
                        });

                        // Sort for ranking
                        const sortedByRate = [...processed].sort((a, b) => b.seedingRate - a.seedingRate);
                        sortedByRate.forEach((s, i) => s.rank = i + 1);

                        // Calculate stats
                        const total = data.find(d => d['State/UTs'] === 'Total');
                        const totalCards = total ? parseInt(total['Total Ration Cards']?.replace(/,/g, '') || '0', 10) : 0;
                        const totalSeeded = total ? parseInt(total['No. of Ration Cards Seeded']?.replace(/,/g, '') || '0', 10) : 0;
                        const nationalRate = total ? parseInt(total['Seeding@ (%)'] || '0', 10) : 0;

                        const avgRate = processed.reduce((a, s) => a + s.seedingRate, 0) / processed.length;
                        const fullSeeding = processed.filter(s => s.seedingRate === 100).length;
                        const zeroSeeding = processed.filter(s => s.seedingRate === 0).length;

                        // Risk distribution
                        const riskDist = [
                            { name: 'Low Risk (≥90%)', value: processed.filter(s => s.riskLevel === 'Low').length, color: COLORS.low },
                            { name: 'Medium Risk (50-89%)', value: processed.filter(s => s.riskLevel === 'Medium').length, color: COLORS.medium },
                            { name: 'High Risk (1-49%)', value: processed.filter(s => s.riskLevel === 'High').length, color: COLORS.high },
                            { name: 'Critical (0%)', value: processed.filter(s => s.riskLevel === 'Critical').length, color: COLORS.critical }
                        ].filter(r => r.value > 0);

                        setStates(processed);
                        setRiskDistribution(riskDist);
                        setStats({
                            totalStates: processed.length,
                            avgSeedingRate: avgRate,
                            totalRationCards: totalCards,
                            totalSeeded: totalSeeded,
                            nationalSeedingRate: nationalRate,
                            fullSeeding,
                            zeroSeeding,
                            topState: sortedByRate[0]?.state || 'N/A',
                            bottomState: sortedByRate[sortedByRate.length - 1]?.state || 'N/A'
                        });
                        setLoading(false);
                    }
                });
            } catch (error) {
                console.error('Error fetching ration seeding data:', error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading Aadhaar-Ration Seeding Analytics...</p>
            </div>
        );
    }

    const formatNumber = (num: number) => num.toLocaleString('en-IN');

    const sortedStates = [...states].sort((a, b) => b.seedingRate - a.seedingRate);

    const getBarColor = (rate: number) => {
        if (rate >= 90) return COLORS.low;
        if (rate >= 50) return COLORS.medium;
        if (rate > 0) return COLORS.high;
        return COLORS.critical;
    };

    return (
        <div className="ration-seeding-overview">
            {/* Info Banner */}
            <div className="info-banner">
                <CreditCard size={24} />
                <div>
                    <strong>Aadhaar Seeding with Ration Cards</strong>
                    <p>This dashboard analyzes the coverage of Aadhaar linkage (seeding) with ration cards across Indian States and Union Territories. Aadhaar seeding enables digitized beneficiary verification for Public Distribution System (PDS) services.</p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="card-grid">
                <motion.div
                    className="stat-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #1a3672 0%, #2d4a8c 100%)' }}>
                        <CreditCard size={24} color="white" />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Total Ration Cards</div>
                        <div className="stat-value">{formatNumber(stats.totalRationCards)}</div>
                        <div className="stat-meta">
                            <MapPin size={14} /> {stats.totalStates} States/UTs
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    className="stat-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #48bb78 0%, #68d391 100%)' }}>
                        <Shield size={24} color="white" />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">National Seeding Rate</div>
                        <div className="stat-value">{stats.nationalSeedingRate}%</div>
                        <div className="stat-meta positive">
                            <TrendingUp size={14} /> {formatNumber(stats.totalSeeded)} cards seeded
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    className="stat-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f69320 0%, #ff9f43 100%)' }}>
                        <Award size={24} color="white" />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">100% Seeding</div>
                        <div className="stat-value">{stats.fullSeeding}</div>
                        <div className="stat-meta">
                            <CheckCircle size={14} /> States with full coverage
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    className="stat-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f56565 0%, #fc8181 100%)' }}>
                        <AlertTriangle size={24} color="white" />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Zero Seeding</div>
                        <div className="stat-value">{stats.zeroSeeding}</div>
                        <div className="stat-meta negative">
                            <AlertOctagon size={14} /> States needing attention
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Charts Section */}
            <div className="charts-row">
                <motion.div
                    className="chart-container large"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    <h3 className="chart-title">State/UT-wise Aadhaar Seeding Rate (%)</h3>
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={sortedStates} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis
                                dataKey="state"
                                angle={-45}
                                textAnchor="end"
                                interval={0}
                                height={100}
                                tick={{ fontSize: 9 }}
                            />
                            <YAxis domain={[0, 100]} unit="%" />
                            <Tooltip
                                contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                formatter={(value: number) => [`${value}%`, 'Seeding Rate']}
                            />
                            <Bar dataKey="seedingRate" name="Seeding Rate" radius={[4, 4, 0, 0]}>
                                {sortedStates.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={getBarColor(entry.seedingRate)} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>

                <motion.div
                    className="chart-container small"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 }}
                >
                    <h3 className="chart-title">Coverage Risk Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={riskDistribution}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={90}
                                paddingAngle={5}
                                dataKey="value"
                                label={({ name, value }) => `${value} states`}
                            >
                                {riskDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="chart-legend" style={{ flexWrap: 'wrap', justifyContent: 'center' }}>
                        {riskDistribution.map((cat, i) => (
                            <div key={i} className="legend-item" style={{ fontSize: '0.8rem' }}>
                                <span className="legend-color" style={{ background: cat.color }}></span>
                                {cat.name}
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Top & Bottom Performers */}
            <div className="tables-row">
                <motion.div
                    className="table-container"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 }}
                >
                    <h3 className="chart-title" style={{ color: '#48bb78' }}>
                        <CheckCircle size={20} style={{ marginRight: 8 }} />
                        Top Performers (100% Seeding)
                    </h3>
                    <table>
                        <thead>
                            <tr>
                                <th>State/UT</th>
                                <th>Total Cards</th>
                                <th>Seeded Cards</th>
                                <th>Rate</th>
                            </tr>
                        </thead>
                        <tbody>
                            {states.filter(s => s.seedingRate >= 100).slice(0, 8).map((state) => (
                                <tr key={state.state}>
                                    <td><strong>{state.state}</strong></td>
                                    <td>{formatNumber(state.totalCards)}</td>
                                    <td>{formatNumber(state.seededCards)}</td>
                                    <td>
                                        <span className="status-badge risk-low">100%</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </motion.div>

                <motion.div
                    className="table-container"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 }}
                >
                    <h3 className="chart-title" style={{ color: '#f56565' }}>
                        <AlertTriangle size={20} style={{ marginRight: 8 }} />
                        States with Coverage Gaps
                    </h3>
                    <table>
                        <thead>
                            <tr>
                                <th>State/UT</th>
                                <th>Seeding Rate</th>
                                <th>Gap</th>
                                <th>Risk</th>
                            </tr>
                        </thead>
                        <tbody>
                            {states.filter(s => s.seedingRate < 90).sort((a, b) => a.seedingRate - b.seedingRate).slice(0, 8).map((state) => (
                                <tr key={state.state}>
                                    <td><strong>{state.state}</strong></td>
                                    <td>{state.seedingRate}%</td>
                                    <td style={{ color: '#f56565' }}>{state.coverageGap}%</td>
                                    <td>
                                        <span className={`status-badge risk-${state.riskLevel.toLowerCase()}`}>
                                            {state.riskLevel}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </motion.div>
            </div>

            {/* Summary Insights */}
            <motion.div
                className="insights-summary"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
            >
                <h3 className="chart-title">Key Observations</h3>
                <div className="insights-grid">
                    <div className="insight-card success">
                        <Award size={20} />
                        <div>
                            <strong>Strong Progress</strong>
                            <p><strong>{stats.fullSeeding} states</strong> have achieved 100% Aadhaar seeding, enabling seamless digital verification for PDS services.</p>
                        </div>
                    </div>
                    <div className="insight-card info">
                        <Users size={20} />
                        <div>
                            <strong>National Coverage</strong>
                            <p>Out of <strong>{formatNumber(stats.totalRationCards)}</strong> ration cards, <strong>{formatNumber(stats.totalSeeded)}</strong> ({stats.nationalSeedingRate}%) are Aadhaar-seeded.</p>
                        </div>
                    </div>
                    <div className="insight-card warning">
                        <AlertOctagon size={20} />
                        <div>
                            <strong>Coverage Gaps</strong>
                            <p>Regions with lower seeding coverage may face challenges in implementing Aadhaar-enabled PDS services effectively.</p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default RationSeedingOverview;
