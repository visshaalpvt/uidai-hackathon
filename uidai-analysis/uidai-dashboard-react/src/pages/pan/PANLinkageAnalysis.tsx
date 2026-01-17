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
    linkedPANs: number;
    region: string;
    sharePercent: number;
}

// Simple region classification
const getRegion = (state: string): string => {
    const northEast = ['Arunachal Pradesh', 'Assam', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Sikkim', 'Tripura'];
    const south = ['Andhra Pradesh', 'Karnataka', 'Kerala', 'Tamilnadu', 'Tamil Nadu', 'Telangana', 'Pondicherry', 'Puducherry', 'Lakhswadeep', 'Lakshadweep', 'Andaman and Nicobar Islands'];
    const north = ['Delhi', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Punjab', 'Rajasthan', 'Uttarakhand', 'Uttar Pradesh', 'Chandigarh'];
    const east = ['Bihar', 'Jharkhand', 'Odisha', 'West Bengal'];
    const west = ['Goa', 'Gujarat', 'Maharashtra', 'Dadra and Nagar Haveli', 'Daman and Diu'];
    const central = ['Chhatishgarh', 'Chhattisgarh', 'Madhya Pradesh'];

    if (northEast.includes(state)) return 'North-East';
    if (south.includes(state)) return 'South';
    if (north.includes(state)) return 'North';
    if (east.includes(state)) return 'East';
    if (west.includes(state)) return 'West';
    if (central.includes(state)) return 'Central';
    return 'Other';
};

const PANLinkageAnalysis: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [states, setStates] = useState<ProcessedState[]>([]);
    const [regionStats, setRegionStats] = useState<{ region: string; totalLinked: number; statesCount: number }[]>([]);
    const [selectedRegion, setSelectedRegion] = useState<string>('All');
    const [totalLinked, setTotalLinked] = useState(0);

    const COLORS = ['#1a3672', '#48bb78', '#f69320', '#f56565', '#667eea', '#ed8936'];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/data/pan_aadhaar_linkage.csv');
                const text = await response.text();
                const cleanedText = text.replace(/\r/g, '\n');

                Papa.parse(cleanedText, {
                    header: true,
                    complete: (results) => {
                        const data = results.data as any[];
                        const validData = data.filter(d =>
                            d['Residential Address State'] &&
                            d['Residential Address State'].trim() !== '' &&
                            d['Residential Address State'] !== 'Foreign'
                        );

                        const total = validData.reduce((a, d) => a + parseInt(d['Pan Count']?.replace(/,/g, '') || '0', 10), 0);
                        setTotalLinked(total);

                        const processed: ProcessedState[] = validData.map(d => {
                            const linkedPANs = parseInt(d['Pan Count']?.replace(/,/g, '') || '0', 10);
                            return {
                                state: d['Residential Address State'],
                                linkedPANs,
                                region: getRegion(d['Residential Address State']),
                                sharePercent: (linkedPANs / total) * 100
                            };
                        });

                        // Calculate regional stats
                        const regions = ['North', 'South', 'East', 'West', 'Central', 'North-East'];
                        const regStats = regions.map(region => {
                            const regionStates = processed.filter(s => s.region === region);
                            const totalLinked = regionStates.reduce((a, s) => a + s.linkedPANs, 0);
                            return { region, totalLinked, statesCount: regionStates.length };
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

    const sortedByVolume = [...filteredStates].sort((a, b) => b.linkedPANs - a.linkedPANs);

    const formatNumber = (num: number) => num.toLocaleString('en-IN');
    const formatCrores = (num: number) => (num / 10000000).toFixed(2) + ' Cr';

    return (
        <div className="pan-state-analysis">
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
                    <h3 className="chart-title">Regional Linkage Volume Comparison</h3>
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={regionStats} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="region" />
                            <YAxis tickFormatter={(v) => `${(v / 10000000).toFixed(0)}Cr`} />
                            <Tooltip
                                formatter={(value: number) => [formatCrores(value), 'Linked PANs']}
                            />
                            <Bar dataKey="totalLinked" name="Total Linked PANs" radius={[4, 4, 0, 0]}>
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
                    <h3 className="chart-title">State Volume Distribution</h3>
                    <ResponsiveContainer width="100%" height={350}>
                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                            <CartesianGrid stroke="#e2e8f0" />
                            <XAxis type="category" dataKey="state" hide />
                            <YAxis type="number" dataKey="linkedPANs" tickFormatter={(v) => `${(v / 10000000).toFixed(0)}Cr`} />
                            <ZAxis type="number" dataKey="sharePercent" range={[50, 400]} />
                            <Tooltip
                                formatter={(value: number, name: string) => [
                                    name === 'linkedPANs' ? formatCrores(value) : `${value.toFixed(2)}%`,
                                    name === 'linkedPANs' ? 'Linked PANs' : 'Share'
                                ]}
                                labelFormatter={(label) => `State: ${label}`}
                            />
                            <Scatter name="States" data={states} fill="#1a3672">
                                {states.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Scatter>
                        </ScatterChart>
                    </ResponsiveContainer>
                    <div style={{ textAlign: 'center', fontSize: '0.8rem', color: '#666', marginTop: 10 }}>
                        Bubble size indicates national share percentage.
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
                            <th>Linked PANs</th>
                            <th>National Share</th>
                            <th>Volume Category</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedByVolume.map((state, index) => (
                            <tr key={state.state}>
                                <td>
                                    <span className={`rank-badge rank-${Math.min(index + 1, 10)}`}>#{index + 1}</span>
                                </td>
                                <td><strong>{state.state}</strong></td>
                                <td>{state.region}</td>
                                <td>{formatCrores(state.linkedPANs)}</td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <div style={{ width: 60, height: 8, background: '#edf2f7', borderRadius: 4, overflow: 'hidden' }}>
                                            <div style={{
                                                width: `${Math.min(state.sharePercent * 5, 100)}%`,
                                                height: '100%',
                                                background: state.sharePercent > 5 ? '#1a3672' : state.sharePercent > 2 ? '#48bb78' : '#f69320',
                                                borderRadius: 4
                                            }}></div>
                                        </div>
                                        <span style={{ fontWeight: 600 }}>{state.sharePercent.toFixed(2)}%</span>
                                    </div>
                                </td>
                                <td>
                                    {state.sharePercent > 5 ? (
                                        <span style={{ color: '#1a3672', display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <TrendingUp size={16} /> Very High
                                        </span>
                                    ) : state.sharePercent > 2 ? (
                                        <span style={{ color: '#48bb78', display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <TrendingUp size={16} /> High
                                        </span>
                                    ) : state.sharePercent > 0.5 ? (
                                        <span style={{ color: '#f69320', display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <TrendingDown size={16} /> Medium
                                        </span>
                                    ) : (
                                        <span style={{ color: '#f56565', display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <TrendingDown size={16} /> Low
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

export default PANLinkageAnalysis;
