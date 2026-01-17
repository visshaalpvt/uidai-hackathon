import React, { useEffect, useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import {
    CheckCircle, AlertTriangle, TrendingUp, MapPin, Users, Activity,
    Shield, Award, AlertOctagon
} from 'lucide-react';
import { motion } from 'framer-motion';
import Papa from 'papaparse';

// Types
interface PDSRecord {
    'Sl. No.': string;
    'State/UT': string;
    '% Aadhaar based PDS transactions in June 2021': string;
}

interface ProcessedState {
    state: string;
    adoption: number;
    category: 'High' | 'Medium' | 'Low' | 'Critical' | 'NA';
    rank: number;
}

const PDSOverview: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [states, setStates] = useState<ProcessedState[]>([]);
    const [stats, setStats] = useState({
        totalStates: 0,
        avgAdoption: 0,
        highAdoption: 0,
        lowAdoption: 0,
        fullAdoption: 0,
        zeroAdoption: 0,
        topState: '',
        bottomState: ''
    });
    const [categoryDistribution, setCategoryDistribution] = useState<{ name: string; value: number; color: string }[]>([]);

    const COLORS = {
        high: '#48bb78',
        medium: '#f69320',
        low: '#f56565',
        critical: '#c53030',
        na: '#a0aec0'
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/data/authenticated_pds_trans.csv');
                const text = await response.text();

                Papa.parse(text, {
                    header: true,
                    complete: (results) => {
                        const data = results.data as PDSRecord[];
                        const validData = data.filter(d => d['State/UT'] && d['State/UT'].trim() !== '');

                        // Process data
                        const processed: ProcessedState[] = validData.map(d => {
                            const adoptionValue = d['% Aadhaar based PDS transactions in June 2021'];
                            let adoption = 0;
                            let category: 'High' | 'Medium' | 'Low' | 'Critical' | 'NA' = 'NA';

                            if (adoptionValue && adoptionValue !== 'NA') {
                                adoption = parseInt(adoptionValue, 10);
                                if (adoption >= 90) category = 'High';
                                else if (adoption >= 50) category = 'Medium';
                                else if (adoption > 0) category = 'Low';
                                else category = 'Critical';
                            }

                            return {
                                state: d['State/UT'],
                                adoption,
                                category,
                                rank: 0
                            };
                        });

                        // Sort by adoption for ranking
                        const sortedByAdoption = [...processed]
                            .filter(s => s.category !== 'NA')
                            .sort((a, b) => b.adoption - a.adoption);

                        sortedByAdoption.forEach((s, i) => s.rank = i + 1);

                        // Calculate stats
                        const validAdoptions = processed.filter(s => s.category !== 'NA');
                        const avgAdoption = validAdoptions.reduce((acc, s) => acc + s.adoption, 0) / validAdoptions.length;
                        const highAdoption = processed.filter(s => s.category === 'High').length;
                        const lowAdoption = processed.filter(s => s.category === 'Low' || s.category === 'Critical').length;
                        const fullAdoption = processed.filter(s => s.adoption === 100).length;
                        const zeroAdoption = processed.filter(s => s.adoption === 0 && s.category !== 'NA').length;

                        const topState = sortedByAdoption[0]?.state || 'N/A';
                        const bottomState = sortedByAdoption[sortedByAdoption.length - 1]?.state || 'N/A';

                        // Category distribution for pie chart
                        const categoryDist = [
                            { name: 'High (≥90%)', value: processed.filter(s => s.category === 'High').length, color: COLORS.high },
                            { name: 'Medium (50-89%)', value: processed.filter(s => s.category === 'Medium').length, color: COLORS.medium },
                            { name: 'Low (1-49%)', value: processed.filter(s => s.category === 'Low').length, color: COLORS.low },
                            { name: 'Critical (0%)', value: processed.filter(s => s.category === 'Critical').length, color: COLORS.critical },
                            { name: 'NA', value: processed.filter(s => s.category === 'NA').length, color: COLORS.na }
                        ].filter(c => c.value > 0);

                        setStates(processed);
                        setCategoryDistribution(categoryDist);
                        setStats({
                            totalStates: processed.length,
                            avgAdoption,
                            highAdoption,
                            lowAdoption,
                            fullAdoption,
                            zeroAdoption,
                            topState,
                            bottomState
                        });
                        setLoading(false);
                    }
                });
            } catch (error) {
                console.error('Error fetching PDS data:', error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading PDS Authentication Analytics...</p>
            </div>
        );
    }

    // Sort states for the bar chart
    const sortedStates = [...states]
        .filter(s => s.category !== 'NA')
        .sort((a, b) => b.adoption - a.adoption);

    const getBarColor = (adoption: number) => {
        if (adoption >= 90) return COLORS.high;
        if (adoption >= 50) return COLORS.medium;
        if (adoption > 0) return COLORS.low;
        return COLORS.critical;
    };

    return (
        <div className="pds-overview">
            {/* Page Header */}
            <div className="info-banner">
                <Shield size={24} />
                <div>
                    <strong>Aadhaar-Based PDS Authentication</strong>
                    <p>This dashboard analyzes the adoption of Aadhaar-based authentication in Public Distribution System (PDS) transactions across Indian States and Union Territories. Data reflects the percentage of PDS transactions authenticated using Aadhaar as of June 2021.</p>
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
                        <MapPin size={24} color="white" />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">States/UTs Covered</div>
                        <div className="stat-value">{stats.totalStates}</div>
                        <div className="stat-meta">
                            <Activity size={14} /> Pan-India coverage
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
                        <TrendingUp size={24} color="white" />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Avg Adoption Rate</div>
                        <div className="stat-value">{stats.avgAdoption.toFixed(1)}%</div>
                        <div className="stat-meta positive">
                            National average
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
                        <CheckCircle size={24} color="white" />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">100% Adoption</div>
                        <div className="stat-value">{stats.fullAdoption}</div>
                        <div className="stat-meta">
                            <Award size={14} /> States with full coverage
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
                        <div className="stat-label">Zero Adoption</div>
                        <div className="stat-value">{stats.zeroAdoption}</div>
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
                    <h3 className="chart-title">State-wise Aadhaar PDS Adoption (%)</h3>
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
                                formatter={(value: number) => [`${value}%`, 'Adoption Rate']}
                            />
                            <Bar dataKey="adoption" name="Adoption Rate" radius={[4, 4, 0, 0]}>
                                {sortedStates.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={getBarColor(entry.adoption)} />
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
                    <h3 className="chart-title">Adoption Category Distribution</h3>
                    <ResponsiveContainer width="100%" height={350}>
                        <PieChart>
                            <Pie
                                data={categoryDistribution}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                labelLine={false}
                            >
                                {categoryDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="chart-legend">
                        {categoryDistribution.map((cat, i) => (
                            <div key={i} className="legend-item">
                                <span className="legend-color" style={{ background: cat.color }}></span>
                                {cat.name}: {cat.value}
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
                        Top Performing States (100% Adoption)
                    </h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Rank</th>
                                <th>State/UT</th>
                                <th>Adoption Rate</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {states.filter(s => s.adoption === 100).map((state, index) => (
                                <tr key={state.state}>
                                    <td>
                                        <span className={`rank-badge rank-${index + 1}`}>{index + 1}</span>
                                    </td>
                                    <td><strong>{state.state}</strong></td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div style={{ width: 60, height: 6, background: '#edf2f7', borderRadius: 3 }}>
                                                <div style={{ width: '100%', height: '100%', background: COLORS.high, borderRadius: 3 }}></div>
                                            </div>
                                            {state.adoption}%
                                        </div>
                                    </td>
                                    <td>
                                        <span className="status-badge risk-low">Full Coverage</span>
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
                        States Requiring Attention (0% Adoption)
                    </h3>
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>State/UT</th>
                                <th>Adoption Rate</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {states.filter(s => s.adoption === 0 && s.category !== 'NA').map((state, index) => (
                                <tr key={state.state}>
                                    <td>{index + 1}</td>
                                    <td><strong>{state.state}</strong></td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div style={{ width: 60, height: 6, background: '#edf2f7', borderRadius: 3 }}>
                                                <div style={{ width: '0%', height: '100%', background: COLORS.critical, borderRadius: 3 }}></div>
                                            </div>
                                            0%
                                        </div>
                                    </td>
                                    <td>
                                        <span className="status-badge risk-high">No Coverage</span>
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
                            <strong>High Adoption Leaders</strong>
                            <p><strong>{stats.fullAdoption} states</strong> have achieved 100% Aadhaar-based PDS transactions, demonstrating successful digital infrastructure implementation.</p>
                        </div>
                    </div>
                    <div className="insight-card info">
                        <Users size={20} />
                        <div>
                            <strong>Coverage Gap</strong>
                            <p><strong>{stats.zeroAdoption} states</strong> show 0% adoption, indicating potential challenges in infrastructure, connectivity, or implementation readiness.</p>
                        </div>
                    </div>
                    <div className="insight-card warning">
                        <AlertOctagon size={20} />
                        <div>
                            <strong>Regional Disparity</strong>
                            <p>There is a <strong>100%</strong> spread between top and bottom performers, highlighting significant regional disparities in digital PDS adoption.</p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default PDSOverview;
