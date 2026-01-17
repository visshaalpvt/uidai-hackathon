import React, { useEffect, useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    AreaChart, Area, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import Papa from 'papaparse';
import { TrendingUp, TrendingDown, Users, MapPin, Activity, Fingerprint, Calendar, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

// Types for biometric data
interface BiometricRecord {
    date: string;
    state: string;
    district: string;
    pincode: string;
    bio_age_5_17: number;
    bio_age_17_: number;
}

interface MonthlyStats {
    month: string;
    total: number;
    age5to17: number;
    age17plus: number;
    growthRate?: number;
}

interface StateStats {
    state: string;
    total: number;
    districts: number;
}

const BiometricOverview: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalUpdates: 0,
        latestMonthUpdates: 0,
        momGrowth: 0,
        age5to17Total: 0,
        age17plusTotal: 0,
        uniqueStates: 0,
        uniqueDistricts: 0,
        uniquePincodes: 0
    });
    const [monthlyData, setMonthlyData] = useState<MonthlyStats[]>([]);
    const [topStates, setTopStates] = useState<StateStats[]>([]);
    const [topDistricts, setTopDistricts] = useState<{ district: string; state: string; total: number }[]>([]);
    const [ageDistribution, setAgeDistribution] = useState<{ name: string; value: number }[]>([]);

    const COLORS = ['#1a3672', '#f69320', '#48bb78', '#667eea', '#ed8936'];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/data/biometric.csv');
                const text = await response.text();

                Papa.parse(text, {
                    header: true,
                    dynamicTyping: true,
                    complete: (results) => {
                        const data = results.data as BiometricRecord[];
                        const validData = data.filter(d => d.date && d.pincode);

                        // Parse dates and aggregate by month
                        const monthlyAgg: { [key: string]: MonthlyStats } = {};
                        const stateAgg: { [key: string]: { total: number; districts: Set<string> } } = {};
                        const districtAgg: { [key: string]: { district: string; state: string; total: number } } = {};

                        let totalAge5to17 = 0;
                        let totalAge17plus = 0;
                        const uniquePincodes = new Set<string>();
                        const uniqueStates = new Set<string>();
                        const uniqueDistricts = new Set<string>();

                        validData.forEach(record => {
                            // Parse date (DD-MM-YYYY format)
                            const dateParts = record.date.split('-');
                            const monthKey = `${dateParts[2]}-${dateParts[1].padStart(2, '0')}`;

                            const age5to17 = record.bio_age_5_17 || 0;
                            const age17plus = record.bio_age_17_ || 0;
                            const total = age5to17 + age17plus;

                            // Monthly aggregation
                            if (!monthlyAgg[monthKey]) {
                                monthlyAgg[monthKey] = { month: monthKey, total: 0, age5to17: 0, age17plus: 0 };
                            }
                            monthlyAgg[monthKey].total += total;
                            monthlyAgg[monthKey].age5to17 += age5to17;
                            monthlyAgg[monthKey].age17plus += age17plus;

                            // State aggregation
                            if (!stateAgg[record.state]) {
                                stateAgg[record.state] = { total: 0, districts: new Set() };
                            }
                            stateAgg[record.state].total += total;
                            stateAgg[record.state].districts.add(record.district);

                            // District aggregation
                            const districtKey = `${record.state}-${record.district}`;
                            if (!districtAgg[districtKey]) {
                                districtAgg[districtKey] = { district: record.district, state: record.state, total: 0 };
                            }
                            districtAgg[districtKey].total += total;

                            // Totals
                            totalAge5to17 += age5to17;
                            totalAge17plus += age17plus;
                            uniquePincodes.add(record.pincode);
                            uniqueStates.add(record.state);
                            uniqueDistricts.add(record.district);
                        });

                        // Sort monthly data
                        const sortedMonthly = Object.values(monthlyAgg).sort((a, b) =>
                            a.month.localeCompare(b.month)
                        );

                        // Calculate MoM growth
                        for (let i = 1; i < sortedMonthly.length; i++) {
                            const prev = sortedMonthly[i - 1].total;
                            const curr = sortedMonthly[i].total;
                            sortedMonthly[i].growthRate = prev > 0 ? ((curr - prev) / prev) * 100 : 0;
                        }

                        // Top 5 states
                        const sortedStates = Object.entries(stateAgg)
                            .map(([state, data]) => ({ state, total: data.total, districts: data.districts.size }))
                            .sort((a, b) => b.total - a.total)
                            .slice(0, 5);

                        // Top 5 districts
                        const sortedDistricts = Object.values(districtAgg)
                            .sort((a, b) => b.total - a.total)
                            .slice(0, 5);

                        // Latest month stats
                        const latestMonth = sortedMonthly[sortedMonthly.length - 1];
                        const prevMonth = sortedMonthly[sortedMonthly.length - 2];
                        const momGrowth = prevMonth && prevMonth.total > 0
                            ? ((latestMonth.total - prevMonth.total) / prevMonth.total) * 100
                            : 0;

                        setStats({
                            totalUpdates: totalAge5to17 + totalAge17plus,
                            latestMonthUpdates: latestMonth?.total || 0,
                            momGrowth,
                            age5to17Total: totalAge5to17,
                            age17plusTotal: totalAge17plus,
                            uniqueStates: uniqueStates.size,
                            uniqueDistricts: uniqueDistricts.size,
                            uniquePincodes: uniquePincodes.size
                        });

                        setMonthlyData(sortedMonthly);
                        setTopStates(sortedStates);
                        setTopDistricts(sortedDistricts);
                        setAgeDistribution([
                            { name: 'Age 5-17', value: totalAge5to17 },
                            { name: 'Age 17+', value: totalAge17plus }
                        ]);

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

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading Biometric Analytics...</p>
            </div>
        );
    }

    const formatNumber = (num: number) => num.toLocaleString('en-IN');

    return (
        <div className="biometric-overview">
            {/* KPI Cards */}
            <div className="card-grid">
                <motion.div
                    className="stat-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #1a3672 0%, #2d4a8c 100%)' }}>
                        <Fingerprint size={24} color="white" />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Total Biometric Updates</div>
                        <div className="stat-value">{formatNumber(stats.totalUpdates)}</div>
                        <div className="stat-meta">
                            <Activity size={14} /> All-time cumulative
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    className="stat-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f69320 0%, #ff9f43 100%)' }}>
                        <Calendar size={24} color="white" />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Latest Month Updates</div>
                        <div className="stat-value">{formatNumber(stats.latestMonthUpdates)}</div>
                        <div className={`stat-meta ${stats.momGrowth >= 0 ? 'positive' : 'negative'}`}>
                            {stats.momGrowth >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                            {stats.momGrowth.toFixed(1)}% MoM
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    className="stat-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #48bb78 0%, #68d391 100%)' }}>
                        <Users size={24} color="white" />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Age 5-17 Updates</div>
                        <div className="stat-value">{formatNumber(stats.age5to17Total)}</div>
                        <div className="stat-meta">
                            {((stats.age5to17Total / stats.totalUpdates) * 100).toFixed(1)}% of total
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    className="stat-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                        <MapPin size={24} color="white" />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Coverage</div>
                        <div className="stat-value">{stats.uniquePincodes}</div>
                        <div className="stat-meta">
                            <MapPin size={14} /> Unique Pincodes
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Charts Row 1 */}
            <div className="charts-row">
                <motion.div
                    className="chart-container large"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <h3 className="chart-title">Biometric Update Trends (Monthly)</h3>
                    <ResponsiveContainer width="100%" height={320}>
                        <AreaChart data={monthlyData}>
                            <defs>
                                <linearGradient id="colorBioTotal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#1a3672" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#1a3672" stopOpacity={0.1} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{
                                    background: 'rgba(255,255,255,0.95)',
                                    border: 'none',
                                    borderRadius: 8,
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                }}
                                formatter={(value: number) => [formatNumber(value), 'Updates']}
                            />
                            <Area
                                type="monotone"
                                dataKey="total"
                                stroke="#1a3672"
                                strokeWidth={2}
                                fill="url(#colorBioTotal)"
                                name="Total Updates"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </motion.div>

                <motion.div
                    className="chart-container small"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <h3 className="chart-title">Age Group Distribution</h3>
                    <ResponsiveContainer width="100%" height={320}>
                        <PieChart>
                            <Pie
                                data={ageDistribution}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                            >
                                {ageDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value: number) => formatNumber(value)} />
                        </PieChart>
                    </ResponsiveContainer>
                </motion.div>
            </div>

            {/* Age Group Breakdown Chart */}
            <motion.div
                className="chart-container"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <h3 className="chart-title">Age Group Breakdown by Month</h3>
                <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={monthlyData} barGap={2}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip
                            contentStyle={{
                                background: 'rgba(255,255,255,0.95)',
                                border: 'none',
                                borderRadius: 8,
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                            }}
                            formatter={(value: number) => formatNumber(value)}
                        />
                        <Legend />
                        <Bar dataKey="age5to17" name="Age 5-17" fill="#48bb78" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="age17plus" name="Age 17+" fill="#1a3672" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </motion.div>

            {/* Top Regions */}
            <div className="tables-row">
                <motion.div
                    className="table-container"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <h3 className="chart-title">Top 5 States by Biometric Activity</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Rank</th>
                                <th>State</th>
                                <th>Total Updates</th>
                                <th>Districts</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topStates.map((state, index) => (
                                <tr key={state.state}>
                                    <td>
                                        <span className={`rank-badge rank-${index + 1}`}>{index + 1}</span>
                                    </td>
                                    <td><strong>{state.state}</strong></td>
                                    <td>{formatNumber(state.total)}</td>
                                    <td>{state.districts}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </motion.div>

                <motion.div
                    className="table-container"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 }}
                >
                    <h3 className="chart-title">Top 5 Districts by Biometric Activity</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Rank</th>
                                <th>District</th>
                                <th>State</th>
                                <th>Total Updates</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topDistricts.map((district, index) => (
                                <tr key={`${district.state}-${district.district}`}>
                                    <td>
                                        <span className={`rank-badge rank-${index + 1}`}>{index + 1}</span>
                                    </td>
                                    <td><strong>{district.district}</strong></td>
                                    <td>{district.state}</td>
                                    <td>{formatNumber(district.total)}</td>
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
                transition={{ delay: 0.8 }}
            >
                <h3 className="chart-title">Quick Summary</h3>
                <div className="insights-grid">
                    <div className="insight-card info">
                        <AlertCircle size={20} />
                        <div>
                            <strong>Data Coverage</strong>
                            <p>Biometric update data spans {stats.uniqueStates} states, {stats.uniqueDistricts} districts, and {stats.uniquePincodes} unique pincodes.</p>
                        </div>
                    </div>
                    <div className="insight-card success">
                        <TrendingUp size={20} />
                        <div>
                            <strong>Age Group Analysis</strong>
                            <p>Adult updates (Age 17+) constitute {((stats.age17plusTotal / stats.totalUpdates) * 100).toFixed(1)}% of all biometric updates, indicating higher adult engagement.</p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default BiometricOverview;
