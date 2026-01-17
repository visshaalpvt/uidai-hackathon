import React, { useEffect, useState, useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    ScatterChart, Scatter, Cell, Treemap
} from 'recharts';
import Papa from 'papaparse';
import { MapPin, Filter, TrendingUp, AlertTriangle, Activity, Flame, Target } from 'lucide-react';
import { motion } from 'framer-motion';

interface BiometricRecord {
    date: string;
    state: string;
    district: string;
    pincode: string;
    bio_age_5_17: number;
    bio_age_17_: number;
}

interface HotspotData {
    pincode: string;
    state: string;
    district: string;
    total: number;
    age5to17: number;
    age17plus: number;
    failureIndicator: number;
    hotspotType: 'volume' | 'risk' | 'both';
}

const BiometricHotspots: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<BiometricRecord[]>([]);
    const [hotspots, setHotspots] = useState<HotspotData[]>([]);
    const [filters, setFilters] = useState({
        state: 'all',
        month: 'all',
        hotspotType: 'all' as 'all' | 'volume' | 'risk'
    });
    const [states, setStates] = useState<string[]>([]);
    const [months, setMonths] = useState<string[]>([]);
    const [districtHotspots, setDistrictHotspots] = useState<{ name: string; value: number; state: string }[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/data/biometric.csv');
                const text = await response.text();

                Papa.parse(text, {
                    header: true,
                    dynamicTyping: true,
                    complete: (results) => {
                        const rawData = results.data as BiometricRecord[];
                        const validData = rawData.filter(d => d.date && d.pincode);

                        // Extract unique states and months
                        const uniqueStates = [...new Set(validData.map(d => d.state))].filter(Boolean).sort();
                        const uniqueMonths = [...new Set(validData.map(d => {
                            const parts = d.date.split('-');
                            return `${parts[2]}-${parts[1].padStart(2, '0')}`;
                        }))].sort();

                        setStates(uniqueStates);
                        setMonths(uniqueMonths);
                        setData(validData);
                        setLoading(false);
                    }
                });
            } catch (error) {
                console.error('Error fetching biometric data:', error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Process hotspots based on filters
    const processedData = useMemo(() => {
        if (!data.length) return { hotspots: [], districtData: [] };

        let filteredData = [...data];

        // Apply state filter
        if (filters.state !== 'all') {
            filteredData = filteredData.filter(d => d.state === filters.state);
        }

        // Apply month filter
        if (filters.month !== 'all') {
            filteredData = filteredData.filter(d => {
                const parts = d.date.split('-');
                return `${parts[2]}-${parts[1].padStart(2, '0')}` === filters.month;
            });
        }

        // Aggregate by pincode
        const pincodeAgg: { [key: string]: HotspotData } = {};
        const districtAgg: { [key: string]: { total: number; state: string } } = {};

        // Calculate overall average for thresholds
        const totalSum = filteredData.reduce((sum, r) =>
            sum + (r.bio_age_5_17 || 0) + (r.bio_age_17_ || 0), 0);
        const avgPerRecord = filteredData.length > 0 ? totalSum / filteredData.length : 1;
        const highVolumeThreshold = avgPerRecord * 3;
        const lowThreshold = avgPerRecord * 0.1;

        filteredData.forEach(record => {
            const age5to17 = record.bio_age_5_17 || 0;
            const age17plus = record.bio_age_17_ || 0;
            const total = age5to17 + age17plus;

            // Pincode aggregation
            if (!pincodeAgg[record.pincode]) {
                pincodeAgg[record.pincode] = {
                    pincode: record.pincode,
                    state: record.state,
                    district: record.district,
                    total: 0,
                    age5to17: 0,
                    age17plus: 0,
                    failureIndicator: 0,
                    hotspotType: 'volume'
                };
            }
            pincodeAgg[record.pincode].total += total;
            pincodeAgg[record.pincode].age5to17 += age5to17;
            pincodeAgg[record.pincode].age17plus += age17plus;
            if (total < lowThreshold) pincodeAgg[record.pincode].failureIndicator++;

            // District aggregation
            if (!districtAgg[record.district]) {
                districtAgg[record.district] = { total: 0, state: record.state };
            }
            districtAgg[record.district].total += total;
        });

        // Determine hotspot types
        Object.values(pincodeAgg).forEach(pincode => {
            const recordCount = filteredData.filter(d => d.pincode === pincode.pincode).length;
            const avgPerPincode = recordCount > 0 ? pincode.total / recordCount : 0;
            const failureRate = recordCount > 0 ? (pincode.failureIndicator / recordCount) * 100 : 0;

            const isHighVolume = pincode.total > highVolumeThreshold * 10;
            const isHighRisk = failureRate > 30;

            if (isHighVolume && isHighRisk) {
                pincode.hotspotType = 'both';
            } else if (isHighRisk) {
                pincode.hotspotType = 'risk';
            } else {
                pincode.hotspotType = 'volume';
            }
        });

        // Apply hotspot type filter
        let processedHotspots = Object.values(pincodeAgg);
        if (filters.hotspotType !== 'all') {
            processedHotspots = processedHotspots.filter(h =>
                h.hotspotType === filters.hotspotType || h.hotspotType === 'both'
            );
        }

        // Sort and limit
        const sortedHotspots = processedHotspots
            .sort((a, b) => b.total - a.total)
            .slice(0, 20);

        // Process district data for treemap
        const districtData = Object.entries(districtAgg)
            .map(([name, data]) => ({ name, value: data.total, state: data.state }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 15);

        return { hotspots: sortedHotspots, districtData };
    }, [data, filters]);

    useEffect(() => {
        setHotspots(processedData.hotspots);
        setDistrictHotspots(processedData.districtData);
    }, [processedData]);

    const formatNumber = (num: number) => num.toLocaleString('en-IN');

    const COLORS = {
        volume: '#48bb78',
        risk: '#f56565',
        both: '#ed8936'
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Mapping Hotspots...</p>
            </div>
        );
    }

    const volumeHotspots = hotspots.filter(h => h.hotspotType === 'volume' || h.hotspotType === 'both');
    const riskHotspots = hotspots.filter(h => h.hotspotType === 'risk' || h.hotspotType === 'both');

    return (
        <div className="hotspots-container">
            {/* Filter Bar */}
            <motion.div
                className="filter-bar"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="filter-group">
                    <label><Filter size={16} /> State</label>
                    <select
                        value={filters.state}
                        onChange={(e) => setFilters(f => ({ ...f, state: e.target.value }))}
                    >
                        <option value="all">All States</option>
                        {states.map(state => (
                            <option key={state} value={state}>{state}</option>
                        ))}
                    </select>
                </div>

                <div className="filter-group">
                    <label>Month</label>
                    <select
                        value={filters.month}
                        onChange={(e) => setFilters(f => ({ ...f, month: e.target.value }))}
                    >
                        <option value="all">All Months</option>
                        {months.map(month => (
                            <option key={month} value={month}>{month}</option>
                        ))}
                    </select>
                </div>

                <div className="filter-group">
                    <label>Hotspot Type</label>
                    <select
                        value={filters.hotspotType}
                        onChange={(e) => setFilters(f => ({ ...f, hotspotType: e.target.value as any }))}
                    >
                        <option value="all">All Types</option>
                        <option value="volume">High Volume</option>
                        <option value="risk">High Risk</option>
                    </select>
                </div>
            </motion.div>

            {/* Hotspot Type Legend */}
            <motion.div
                className="hotspot-legend"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
            >
                <div className="legend-item">
                    <span className="legend-dot" style={{ background: COLORS.volume }}></span>
                    <span>High Volume (High biometric activity)</span>
                </div>
                <div className="legend-item">
                    <span className="legend-dot" style={{ background: COLORS.risk }}></span>
                    <span>High Risk (High failure indicators)</span>
                </div>
                <div className="legend-item">
                    <span className="legend-dot" style={{ background: COLORS.both }}></span>
                    <span>Both (High volume + High risk)</span>
                </div>
            </motion.div>

            {/* Summary Cards */}
            <div className="card-grid three-cols">
                <motion.div
                    className="stat-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    style={{ borderLeftColor: COLORS.volume }}
                >
                    <div className="stat-icon" style={{ background: COLORS.volume }}>
                        <TrendingUp size={24} color="white" />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">High Volume Hotspots</div>
                        <div className="stat-value">{volumeHotspots.length}</div>
                        <div className="stat-meta">Active biometric centers</div>
                    </div>
                </motion.div>

                <motion.div
                    className="stat-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    style={{ borderLeftColor: COLORS.risk }}
                >
                    <div className="stat-icon" style={{ background: COLORS.risk }}>
                        <AlertTriangle size={24} color="white" />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">High Risk Hotspots</div>
                        <div className="stat-value">{riskHotspots.length}</div>
                        <div className="stat-meta">Require attention</div>
                    </div>
                </motion.div>

                <motion.div
                    className="stat-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="stat-icon" style={{ background: '#667eea' }}>
                        <MapPin size={24} color="white" />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Total Pincodes</div>
                        <div className="stat-value">{hotspots.length}</div>
                        <div className="stat-meta">In current view</div>
                    </div>
                </motion.div>
            </div>

            {/* Scatter Plot - Volume vs Risk */}
            <motion.div
                className="chart-container"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
            >
                <h3 className="chart-title">
                    <Target size={20} style={{ marginRight: 8 }} />
                    Hotspot Distribution (Volume vs Risk Indicator)
                </h3>
                <p className="chart-subtitle">Each dot represents a pincode. Size indicates total updates.</p>
                <ResponsiveContainer width="100%" height={400}>
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            type="number"
                            dataKey="total"
                            name="Total Updates"
                            tick={{ fontSize: 11 }}
                            label={{ value: 'Total Updates', position: 'bottom', offset: 0 }}
                        />
                        <YAxis
                            type="number"
                            dataKey="failureIndicator"
                            name="Failure Indicators"
                            tick={{ fontSize: 11 }}
                            label={{ value: 'Failure Indicators', angle: -90, position: 'insideLeft' }}
                        />
                        <Tooltip
                            cursor={{ strokeDasharray: '3 3' }}
                            content={({ payload }) => {
                                if (payload && payload.length) {
                                    const data = payload[0].payload as HotspotData;
                                    return (
                                        <div className="custom-tooltip">
                                            <p><strong>{data.pincode}</strong></p>
                                            <p>District: {data.district}</p>
                                            <p>State: {data.state}</p>
                                            <p>Total Updates: {formatNumber(data.total)}</p>
                                            <p>Type: <span style={{ color: COLORS[data.hotspotType] }}>{data.hotspotType.toUpperCase()}</span></p>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Scatter name="Hotspots" data={hotspots}>
                            {hotspots.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[entry.hotspotType]}
                                    opacity={0.7}
                                />
                            ))}
                        </Scatter>
                    </ScatterChart>
                </ResponsiveContainer>
            </motion.div>

            {/* District Heatmap */}
            <motion.div
                className="chart-container"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <h3 className="chart-title">
                    <Flame size={20} style={{ marginRight: 8 }} />
                    District Activity Heatmap
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={districtHotspots} layout="vertical" margin={{ left: 100 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                        <XAxis type="number" tick={{ fontSize: 11 }} />
                        <YAxis
                            dataKey="name"
                            type="category"
                            tick={{ fontSize: 11 }}
                            width={100}
                        />
                        <Tooltip
                            formatter={(value: number) => formatNumber(value)}
                            contentStyle={{
                                background: 'rgba(255,255,255,0.95)',
                                border: 'none',
                                borderRadius: 8,
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                            }}
                        />
                        <Bar
                            dataKey="value"
                            name="Total Updates"
                            radius={[0, 4, 4, 0]}
                        >
                            {districtHotspots.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={`hsl(${220 - (index * 8)}, 70%, ${45 + (index * 2)}%)`}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </motion.div>

            {/* Hotspot Table */}
            <motion.div
                className="table-container"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <h3 className="chart-title">
                    <MapPin size={20} style={{ marginRight: 8 }} />
                    Top Hotspot Locations
                </h3>
                <table>
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Pincode</th>
                            <th>District</th>
                            <th>State</th>
                            <th>Total Updates</th>
                            <th>Age 5-17</th>
                            <th>Age 17+</th>
                            <th>Type</th>
                        </tr>
                    </thead>
                    <tbody>
                        {hotspots.slice(0, 15).map((hotspot, index) => (
                            <tr key={hotspot.pincode}>
                                <td>
                                    <span className={`rank-badge rank-${Math.min(index + 1, 3)}`}>
                                        {index + 1}
                                    </span>
                                </td>
                                <td><strong>{hotspot.pincode}</strong></td>
                                <td>{hotspot.district}</td>
                                <td>{hotspot.state}</td>
                                <td>{formatNumber(hotspot.total)}</td>
                                <td>{formatNumber(hotspot.age5to17)}</td>
                                <td>{formatNumber(hotspot.age17plus)}</td>
                                <td>
                                    <span
                                        className="hotspot-type-badge"
                                        style={{
                                            background: `${COLORS[hotspot.hotspotType]}20`,
                                            color: COLORS[hotspot.hotspotType],
                                            border: `1px solid ${COLORS[hotspot.hotspotType]}`
                                        }}
                                    >
                                        {hotspot.hotspotType === 'both' ? 'VOLUME + RISK' : hotspot.hotspotType.toUpperCase()}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </motion.div>
        </div>
    );
};

export default BiometricHotspots;
