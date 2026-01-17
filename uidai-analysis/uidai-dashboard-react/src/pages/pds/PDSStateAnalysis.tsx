import React, { useEffect, useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Cell
} from 'recharts';
import { Map, TrendingUp, TrendingDown, Filter, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import Papa from 'papaparse';

interface ProcessedState {
    state: string;
    adoption: number;
    category: string;
    region: string;
}

// Simple region classification
const getRegion = (state: string): string => {
    const northEast = ['Arunachal Pradesh', 'Assam', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Sikkim', 'Tripura'];
    const south = ['Andhra Pradesh', 'Karnataka', 'Kerala', 'Tamil Nadu', 'Telangana', 'Puducherry', 'Lakshadweep', 'Andaman & Nicobar Islands'];
    const north = ['Delhi', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Ladakh', 'Punjab', 'Rajasthan', 'Uttarakhand', 'Uttar Pradesh', 'Chandigarh'];
    const east = ['Bihar', 'Jharkhand', 'Odisha', 'West Bengal'];
    const west = ['Goa', 'Gujarat', 'Maharashtra', 'Dadra & Nagar Haveli and Daman & Diu'];
    const central = ['Chhattisgarh', 'Madhya Pradesh'];

    if (northEast.includes(state)) return 'North-East';
    if (south.includes(state)) return 'South';
    if (north.includes(state)) return 'North';
    if (east.includes(state)) return 'East';
    if (west.includes(state)) return 'West';
    if (central.includes(state)) return 'Central';
    return 'Other';
};

const PDSStateAnalysis: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [states, setStates] = useState<ProcessedState[]>([]);
    const [regionStats, setRegionStats] = useState<{ region: string; avgAdoption: number; statesCount: number }[]>([]);
    const [selectedRegion, setSelectedRegion] = useState<string>('All');

    const COLORS = ['#1a3672', '#48bb78', '#f69320', '#f56565', '#667eea', '#ed8936'];

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

                        const processed: ProcessedState[] = validData.map(d => {
                            const adoptionValue = d['% Aadhaar based PDS transactions in June 2021'];
                            let adoption = 0;
                            let category = 'NA';

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
                                region: getRegion(d['State/UT'])
                            };
                        });

                        // Calculate regional stats
                        const regions = ['North', 'South', 'East', 'West', 'Central', 'North-East'];
                        const regStats = regions.map(region => {
                            const regionStates = processed.filter(s => s.region === region && s.category !== 'NA');
                            const avgAdoption = regionStates.length > 0
                                ? regionStates.reduce((acc, s) => acc + s.adoption, 0) / regionStates.length
                                : 0;
                            return {
                                region,
                                avgAdoption: Math.round(avgAdoption),
                                statesCount: regionStates.length
                            };
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
        ? states.filter(s => s.category !== 'NA')
        : states.filter(s => s.region === selectedRegion && s.category !== 'NA');

    const sortedByAdoption = [...filteredStates].sort((a, b) => b.adoption - a.adoption);

    const getBarColor = (adoption: number) => {
        if (adoption >= 90) return '#48bb78';
        if (adoption >= 50) return '#f69320';
        if (adoption > 0) return '#f56565';
        return '#c53030';
    };

    return (
        <div className="pds-state-analysis">
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
                    <h3 className="chart-title">Regional Average Adoption Comparison</h3>
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={regionStats} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="region" />
                            <YAxis domain={[0, 100]} unit="%" />
                            <Tooltip
                                formatter={(value: number, name: string) => [
                                    name === 'avgAdoption' ? `${value}%` : value,
                                    name === 'avgAdoption' ? 'Avg Adoption' : 'States'
                                ]}
                            />
                            <Legend />
                            <Bar dataKey="avgAdoption" name="Avg Adoption (%)" radius={[4, 4, 0, 0]}>
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
                    <h3 className="chart-title">Regional Coverage Radar</h3>
                    <ResponsiveContainer width="100%" height={350}>
                        <RadarChart data={regionStats}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="region" tick={{ fontSize: 11 }} />
                            <PolarRadiusAxis domain={[0, 100]} />
                            <Radar
                                name="Avg Adoption"
                                dataKey="avgAdoption"
                                stroke="#1a3672"
                                fill="#1a3672"
                                fillOpacity={0.5}
                            />
                            <Tooltip />
                        </RadarChart>
                    </ResponsiveContainer>
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
                            <th>Adoption Rate</th>
                            <th>Category</th>
                            <th>Trend Indicator</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedByAdoption.map((state, index) => (
                            <tr key={state.state}>
                                <td>
                                    <span className={`rank-badge rank-${Math.min(index + 1, 10)}`}>#{index + 1}</span>
                                </td>
                                <td><strong>{state.state}</strong></td>
                                <td>{state.region}</td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <div style={{ width: 80, height: 8, background: '#edf2f7', borderRadius: 4, overflow: 'hidden' }}>
                                            <div style={{
                                                width: `${state.adoption}%`,
                                                height: '100%',
                                                background: getBarColor(state.adoption),
                                                borderRadius: 4
                                            }}></div>
                                        </div>
                                        <span style={{ fontWeight: 600 }}>{state.adoption}%</span>
                                    </div>
                                </td>
                                <td>
                                    <span className={`status-badge risk-${state.category === 'High' ? 'low' : state.category === 'Medium' ? 'medium' : 'high'}`}>
                                        {state.category}
                                    </span>
                                </td>
                                <td>
                                    {state.adoption >= 90 ? (
                                        <span style={{ color: '#48bb78', display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <TrendingUp size={16} /> Strong
                                        </span>
                                    ) : state.adoption >= 50 ? (
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

export default PDSStateAnalysis;
