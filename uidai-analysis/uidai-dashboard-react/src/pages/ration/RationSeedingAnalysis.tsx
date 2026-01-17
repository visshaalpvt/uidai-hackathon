import React, { useEffect, useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
    ScatterChart, Scatter, ZAxis
} from 'recharts';
import { Map, Filter, BarChart3, TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';
import Papa from 'papaparse';

interface ProcessedState {
    state: string;
    totalCards: number;
    seededCards: number;
    seedingRate: number;
    coverageGap: number;
    region: string;
}

// Simple region classification
const getRegion = (state: string): string => {
    const northEast = ['Arunachal Pradesh', 'Assam', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Sikkim', 'Tripura'];
    const south = ['Andhra Pradesh', 'Karnataka', 'Kerala', 'Tamil Nadu', 'Telangana', 'Puducherry', 'Lakshadweep', 'Andaman & Nicobar Island'];
    const north = ['Delhi', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Punjab', 'Rajasthan', 'Uttarakhand', 'Uttar Pradesh', 'Chandigarh'];
    const east = ['Bihar', 'Jharkhand', 'Odisha', 'West Bengal'];
    const west = ['Goa', 'Gujarat', 'Maharashtra', 'Dadra & Nagar Haveli', 'Daman & Diu'];
    const central = ['Chhattisgarh', 'Madhya Pradesh'];

    if (northEast.includes(state)) return 'North-East';
    if (south.includes(state)) return 'South';
    if (north.includes(state)) return 'North';
    if (east.includes(state)) return 'East';
    if (west.includes(state)) return 'West';
    if (central.includes(state)) return 'Central';
    return 'Other';
};

const RationSeedingAnalysis: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [states, setStates] = useState<ProcessedState[]>([]);
    const [regionStats, setRegionStats] = useState<{ region: string; avgSeeding: number; totalCards: number; totalSeeded: number }[]>([]);
    const [selectedRegion, setSelectedRegion] = useState<string>('All');

    const COLORS = ['#1a3672', '#48bb78', '#f69320', '#f56565', '#667eea', '#ed8936'];

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

                        const processed: ProcessedState[] = validData.map(d => ({
                            state: d['State/UTs'],
                            totalCards: parseInt(d['Total Ration Cards']?.replace(/,/g, '') || '0', 10),
                            seededCards: parseInt(d['No. of Ration Cards Seeded']?.replace(/,/g, '') || '0', 10),
                            seedingRate: parseInt(d['Seeding@ (%)'] || '0', 10),
                            coverageGap: 100 - parseInt(d['Seeding@ (%)'] || '0', 10),
                            region: getRegion(d['State/UTs'])
                        }));

                        // Calculate regional stats
                        const regions = ['North', 'South', 'East', 'West', 'Central', 'North-East'];
                        const regStats = regions.map(region => {
                            const regionStates = processed.filter(s => s.region === region);
                            const totalCards = regionStates.reduce((a, s) => a + s.totalCards, 0);
                            const totalSeeded = regionStates.reduce((a, s) => a + s.seededCards, 0);
                            const avgSeeding = totalCards > 0 ? Math.round((totalSeeded / totalCards) * 100) : 0;
                            return { region, avgSeeding, totalCards, totalSeeded };
                        });

                        setStates(processed);
                        setRegionStats(regStats);
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
                <p>Loading State Analysis...</p>
            </div>
        );
    }

    const filteredStates = selectedRegion === 'All'
        ? states
        : states.filter(s => s.region === selectedRegion);

    const sortedBySeeding = [...filteredStates].sort((a, b) => b.seedingRate - a.seedingRate);

    const formatNumber = (num: number) => num.toLocaleString('en-IN');

    const getBarColor = (rate: number) => {
        if (rate >= 90) return '#48bb78';
        if (rate >= 50) return '#f69320';
        if (rate > 0) return '#f56565';
        return '#c53030';
    };

    return (
        <div className="ration-state-analysis">
            {/* Filter Bar */}
            <div className="filter-bar">
                <div className="filter-group">
                    <label><Filter size={14} /> Region Filter</label>
                    <select value={selectedRegion} onChange={(e) => setSelectedRegion(e.target.value)}>
                        <option value="All">All Regions</option>
                        <option value="North">North</option>
                        <option value="South">South</option>
                        <option value="East">East</option>
                        <option value="West">West</option>
                        <option value="Central">Central</option>
                        <option value="North-East">North-East</option>
                    </select>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <BarChart3 size={16} />
                    <span>Showing {filteredStates.length} States/UTs</span>
                </div>
            </div>

            {/* Regional Comparison */}
            <div className="charts-row">
                <motion.div
                    className="chart-container large"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <h3 className="chart-title">Regional Seeding Rate Comparison</h3>
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={regionStats} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="region" />
                            <YAxis domain={[0, 100]} unit="%" />
                            <Tooltip
                                formatter={(value: number, name: string) => [
                                    name === 'avgSeeding' ? `${value}%` : formatNumber(value),
                                    name === 'avgSeeding' ? 'Avg Seeding Rate' : 'Total Cards'
                                ]}
                            />
                            <Bar dataKey="avgSeeding" name="Avg Seeding Rate (%)" radius={[4, 4, 0, 0]}>
                                {regionStats.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>

                <motion.div
                    className="chart-container small"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <h3 className="chart-title">Volume vs Seeding Rate</h3>
                    <ResponsiveContainer width="100%" height={350}>
                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                            <CartesianGrid stroke="#e2e8f0" />
                            <XAxis type="number" dataKey="totalCards" name="Total Cards" tickFormatter={(v) => `${Math.round(v / 1000000)}M`} />
                            <YAxis type="number" dataKey="seedingRate" name="Seeding Rate" unit="%" domain={[0, 100]} />
                            <ZAxis type="number" dataKey="seededCards" range={[60, 400]} name="Seeded Cards" />
                            <Tooltip
                                formatter={(value: number, name: string) => [
                                    name === 'Seeding Rate' ? `${value}%` : formatNumber(value),
                                    name
                                ]}
                            />
                            <Scatter name="States" data={states} fill="#1a3672">
                                {states.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={getBarColor(entry.seedingRate)} />
                                ))}
                            </Scatter>
                        </ScatterChart>
                    </ResponsiveContainer>
                    <div style={{ textAlign: 'center', fontSize: '0.8rem', color: '#666', marginTop: 10 }}>
                        Bubble size indicates seeded cards volume. Color indicates seeding rate.
                    </div>
                </motion.div>
            </div>

            {/* Detailed State Table */}
            <motion.div
                className="table-container"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <h3 className="chart-title">
                    <Map size={20} style={{ marginRight: 8 }} />
                    Detailed State-wise Analysis {selectedRegion !== 'All' && `(${selectedRegion} Region)`}
                </h3>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>State/UT</th>
                            <th>Region</th>
                            <th>Total Ration Cards</th>
                            <th>Seeded Cards</th>
                            <th>Seeding Rate</th>
                            <th>Coverage Gap</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedBySeeding.map((state, index) => (
                            <tr key={state.state}>
                                <td>
                                    <span className={`rank-badge rank-${Math.min(index + 1, 10)}`}>#{index + 1}</span>
                                </td>
                                <td><strong>{state.state}</strong></td>
                                <td>{state.region}</td>
                                <td>{formatNumber(state.totalCards)}</td>
                                <td>{formatNumber(state.seededCards)}</td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <div style={{ width: 60, height: 8, background: '#edf2f7', borderRadius: 4, overflow: 'hidden' }}>
                                            <div style={{
                                                width: `${state.seedingRate}%`,
                                                height: '100%',
                                                background: getBarColor(state.seedingRate),
                                                borderRadius: 4
                                            }}></div>
                                        </div>
                                        <span style={{ fontWeight: 600 }}>{state.seedingRate}%</span>
                                    </div>
                                </td>
                                <td style={{ color: state.coverageGap > 10 ? '#f56565' : '#4a5568' }}>
                                    {state.coverageGap}%
                                </td>
                                <td>
                                    {state.seedingRate >= 90 ? (
                                        <span style={{ color: '#48bb78', display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <TrendingUp size={16} /> Strong
                                        </span>
                                    ) : state.seedingRate >= 50 ? (
                                        <span style={{ color: '#f69320', display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <TrendingUp size={16} /> Moderate
                                        </span>
                                    ) : (
                                        <span style={{ color: '#f56565', display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <TrendingDown size={16} /> Needs Focus
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </motion.div>
        </div>
    );
};

export default RationSeedingAnalysis;
