import React, { useEffect, useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import {
    CheckCircle, AlertTriangle, TrendingUp, MapPin, FileText, Activity,
    Shield, Award, AlertOctagon, Users
} from 'lucide-react';
import { motion } from 'framer-motion';
import Papa from 'papaparse';

// Types
interface PANRecord {
    'Sl. No.': string;
    'Residential Address State': string;
    'Pan Count': string;
}

interface ProcessedState {
    state: string;
    linkedPANs: number;
    rank: number;
    category: 'Very High' | 'High' | 'Medium' | 'Low';
}

const PANLinkageOverview: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [states, setStates] = useState<ProcessedState[]>([]);
    const [stats, setStats] = useState({
        totalStates: 0,
        totalLinkedPANs: 0,
        topState: '',
        topStateCount: 0,
        bottomState: '',
        bottomStateCount: 0,
        avgPerState: 0
    });
    const [categoryDistribution, setCategoryDistribution] = useState<{ name: string; value: number; color: string }[]>([]);

    const COLORS = {
        veryHigh: '#1a3672',
        high: '#48bb78',
        medium: '#f69320',
        low: '#f56565'
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/data/pan_aadhaar_linkage.csv');
                const text = await response.text();

                // Handle the unusual CSV format (carriage returns instead of newlines)
                const cleanedText = text.replace(/\r/g, '\n');

                Papa.parse(cleanedText, {
                    header: true,
                    complete: (results) => {
                        const data = results.data as PANRecord[];

                        // Filter valid data and exclude "Foreign"
                        const validData = data.filter(d =>
                            d['Residential Address State'] &&
                            d['Residential Address State'].trim() !== '' &&
                            d['Residential Address State'] !== 'Foreign'
                        );

                        // Process data
                        const processed: ProcessedState[] = validData.map(d => {
                            const linkedPANs = parseInt(d['Pan Count']?.replace(/,/g, '') || '0', 10);
                            return {
                                state: d['Residential Address State'],
                                linkedPANs,
                                rank: 0,
                                category: 'Medium' as 'Very High' | 'High' | 'Medium' | 'Low'
                            };
                        });

                        // Sort and rank
                        const sortedByCount = [...processed].sort((a, b) => b.linkedPANs - a.linkedPANs);
                        sortedByCount.forEach((s, i) => {
                            s.rank = i + 1;
                            // Categorize by quartiles
                            if (i < sortedByCount.length * 0.25) s.category = 'Very High';
                            else if (i < sortedByCount.length * 0.5) s.category = 'High';
                            else if (i < sortedByCount.length * 0.75) s.category = 'Medium';
                            else s.category = 'Low';
                        });

                        // Calculate stats
                        const totalLinkedPANs = processed.reduce((a, s) => a + s.linkedPANs, 0);
                        const avgPerState = totalLinkedPANs / processed.length;

                        // Category distribution
                        const catDist = [
                            { name: 'Very High Volume', value: processed.filter(s => s.category === 'Very High').length, color: COLORS.veryHigh },
                            { name: 'High Volume', value: processed.filter(s => s.category === 'High').length, color: COLORS.high },
                            { name: 'Medium Volume', value: processed.filter(s => s.category === 'Medium').length, color: COLORS.medium },
                            { name: 'Low Volume', value: processed.filter(s => s.category === 'Low').length, color: COLORS.low }
                        ];

                        setStates(processed);
                        setCategoryDistribution(catDist);
                        setStats({
                            totalStates: processed.length,
                            totalLinkedPANs,
                            topState: sortedByCount[0]?.state || 'N/A',
                            topStateCount: sortedByCount[0]?.linkedPANs || 0,
                            bottomState: sortedByCount[sortedByCount.length - 1]?.state || 'N/A',
                            bottomStateCount: sortedByCount[sortedByCount.length - 1]?.linkedPANs || 0,
                            avgPerState
                        });
                        setLoading(false);
                    }
                });
            } catch (error) {
                console.error('Error fetching PAN linkage data:', error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading PAN-Aadhaar Linkage Analytics...</p>
            </div>
        );
    }

    const formatNumber = (num: number) => num.toLocaleString('en-IN');
    const formatCrores = (num: number) => (num / 10000000).toFixed(2) + ' Cr';

    const sortedStates = [...states].sort((a, b) => b.linkedPANs - a.linkedPANs);

    const getBarColor = (category: string) => {
        switch (category) {
            case 'Very High': return COLORS.veryHigh;
            case 'High': return COLORS.high;
            case 'Medium': return COLORS.medium;
            case 'Low': return COLORS.low;
            default: return '#a0aec0';
        }
    };

    return (
        <div className="pan-linkage-overview">
            {/* Info Banner */}
            <div className="info-banner">
                <FileText size={24} />
                <div>
                    <strong>PAN-Aadhaar Linkage Status</strong>
                    <p>This dashboard analyzes the State/UT-wise distribution of PANs linked with Aadhaar as on 30-11-2023. PAN-Aadhaar linkage is mandated for income tax compliance and financial service access.</p>
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
                        <FileText size={24} color="white" />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Total Linked PANs</div>
                        <div className="stat-value">{formatCrores(stats.totalLinkedPANs)}</div>
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
                        <Award size={24} color="white" />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Highest Linkage</div>
                        <div className="stat-value">{stats.topState}</div>
                        <div className="stat-meta positive">
                            <TrendingUp size={14} /> {formatCrores(stats.topStateCount)} PANs
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
                        <Activity size={24} color="white" />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Average Per State</div>
                        <div className="stat-value">{formatCrores(stats.avgPerState)}</div>
                        <div className="stat-meta">
                            <Users size={14} /> National average
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
                        <div className="stat-label">Lowest Linkage</div>
                        <div className="stat-value">{stats.bottomState}</div>
                        <div className="stat-meta">
                            {formatNumber(stats.bottomStateCount)} PANs
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
                    <h3 className="chart-title">State/UT-wise PAN-Aadhaar Linkage Count</h3>
                    <ResponsiveContainer width="100%" height={450}>
                        <BarChart data={sortedStates.slice(0, 20)} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis
                                dataKey="state"
                                angle={-45}
                                textAnchor="end"
                                interval={0}
                                height={100}
                                tick={{ fontSize: 9 }}
                            />
                            <YAxis tickFormatter={(v) => `${(v / 10000000).toFixed(0)}Cr`} />
                            <Tooltip
                                contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                formatter={(value: number) => [formatNumber(value), 'Linked PANs']}
                            />
                            <Bar dataKey="linkedPANs" name="Linked PANs" radius={[4, 4, 0, 0]}>
                                {sortedStates.slice(0, 20).map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={getBarColor(entry.category)} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                    <div style={{ textAlign: 'center', fontSize: '0.85rem', color: '#666' }}>
                        Showing top 20 States/UTs by linkage volume
                    </div>
                </motion.div>

                <motion.div
                    className="chart-container small"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 }}
                >
                    <h3 className="chart-title">Volume Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={categoryDistribution}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={90}
                                paddingAngle={5}
                                dataKey="value"
                                label={({ name, value }) => `${value} states`}
                            >
                                {categoryDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="chart-legend" style={{ flexWrap: 'wrap', justifyContent: 'center' }}>
                        {categoryDistribution.map((cat, i) => (
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
                    <h3 className="chart-title" style={{ color: '#1a3672' }}>
                        <Award size={20} style={{ marginRight: 8 }} />
                        Top 10 States by Linkage Volume
                    </h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Rank</th>
                                <th>State/UT</th>
                                <th>Linked PANs</th>
                                <th>Share</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedStates.slice(0, 10).map((state, index) => (
                                <tr key={state.state}>
                                    <td>
                                        <span className={`rank-badge rank-${index + 1}`}>#{index + 1}</span>
                                    </td>
                                    <td><strong>{state.state}</strong></td>
                                    <td>{formatCrores(state.linkedPANs)}</td>
                                    <td>
                                        <span style={{ color: '#1a3672', fontWeight: 600 }}>
                                            {((state.linkedPANs / stats.totalLinkedPANs) * 100).toFixed(1)}%
                                        </span>
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
                        States with Lower Linkage Volume
                    </h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Rank</th>
                                <th>State/UT</th>
                                <th>Linked PANs</th>
                                <th>Category</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedStates.slice(-10).reverse().map((state) => (
                                <tr key={state.state}>
                                    <td>#{state.rank}</td>
                                    <td><strong>{state.state}</strong></td>
                                    <td>{formatNumber(state.linkedPANs)}</td>
                                    <td>
                                        <span className={`status-badge risk-${state.category === 'Low' ? 'high' : 'medium'}`}>
                                            {state.category}
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
                        <Shield size={20} />
                        <div>
                            <strong>Strong Linkage Base</strong>
                            <p>Over <strong>{formatCrores(stats.totalLinkedPANs)}</strong> PANs are linked with Aadhaar nationally, demonstrating significant compliance progress.</p>
                        </div>
                    </div>
                    <div className="insight-card info">
                        <Users size={20} />
                        <div>
                            <strong>Concentration Pattern</strong>
                            <p>Top 5 states ({sortedStates.slice(0, 5).map(s => s.state).join(', ')}) account for a significant portion of total linked PANs.</p>
                        </div>
                    </div>
                    <div className="insight-card warning">
                        <AlertOctagon size={20} />
                        <div>
                            <strong>Regional Variation</strong>
                            <p>Smaller states and UTs show lower absolute volumes, which may reflect population size rather than compliance gaps.</p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default PANLinkageOverview;
