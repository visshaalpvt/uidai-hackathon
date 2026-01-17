import React, { useEffect, useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import Papa from 'papaparse';
import { BarChart3, TrendingUp, Users, Percent, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface BiometricRecord {
    date: string;
    state: string;
    district: string;
    pincode: string;
    bio_age_5_17: number;
    bio_age_17_: number;
}

interface MonthlyTypeData {
    month: string;
    age5to17: number;
    age17plus: number;
    total: number;
    age5to17Pct: number;
    age17plusPct: number;
}

const UpdateTypes: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [monthlyData, setMonthlyData] = useState<MonthlyTypeData[]>([]);
    const [overallDistribution, setOverallDistribution] = useState<{ name: string; value: number; color: string }[]>([]);
    const [trends, setTrends] = useState({
        age5to17Trend: 0,
        age17plusTrend: 0,
        dominantType: '',
        shiftDirection: ''
    });

    const COLORS = {
        age5to17: '#48bb78',
        age17plus: '#1a3672',
        total: '#f69320'
    };

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

                        // Aggregate by month
                        const monthlyAgg: { [key: string]: { age5to17: number; age17plus: number } } = {};
                        let totalAge5to17 = 0;
                        let totalAge17plus = 0;

                        validData.forEach(record => {
                            const dateParts = record.date.split('-');
                            const monthKey = `${dateParts[2]}-${dateParts[1].padStart(2, '0')}`;

                            const age5to17 = record.bio_age_5_17 || 0;
                            const age17plus = record.bio_age_17_ || 0;

                            if (!monthlyAgg[monthKey]) {
                                monthlyAgg[monthKey] = { age5to17: 0, age17plus: 0 };
                            }
                            monthlyAgg[monthKey].age5to17 += age5to17;
                            monthlyAgg[monthKey].age17plus += age17plus;

                            totalAge5to17 += age5to17;
                            totalAge17plus += age17plus;
                        });

                        // Process monthly data
                        const processedMonthly: MonthlyTypeData[] = Object.entries(monthlyAgg)
                            .map(([month, data]) => {
                                const total = data.age5to17 + data.age17plus;
                                return {
                                    month,
                                    age5to17: data.age5to17,
                                    age17plus: data.age17plus,
                                    total,
                                    age5to17Pct: total > 0 ? (data.age5to17 / total) * 100 : 0,
                                    age17plusPct: total > 0 ? (data.age17plus / total) * 100 : 0
                                };
                            })
                            .sort((a, b) => a.month.localeCompare(b.month));

                        // Calculate trends (compare last 3 months avg to first 3 months avg)
                        if (processedMonthly.length >= 4) {
                            const firstHalf = processedMonthly.slice(0, Math.floor(processedMonthly.length / 2));
                            const secondHalf = processedMonthly.slice(Math.floor(processedMonthly.length / 2));

                            const firstAge5to17Avg = firstHalf.reduce((sum, d) => sum + d.age5to17Pct, 0) / firstHalf.length;
                            const secondAge5to17Avg = secondHalf.reduce((sum, d) => sum + d.age5to17Pct, 0) / secondHalf.length;

                            const firstAge17plusAvg = firstHalf.reduce((sum, d) => sum + d.age17plusPct, 0) / firstHalf.length;
                            const secondAge17plusAvg = secondHalf.reduce((sum, d) => sum + d.age17plusPct, 0) / secondHalf.length;

                            setTrends({
                                age5to17Trend: secondAge5to17Avg - firstAge5to17Avg,
                                age17plusTrend: secondAge17plusAvg - firstAge17plusAvg,
                                dominantType: totalAge17plus > totalAge5to17 ? 'Age 17+ (Adult)' : 'Age 5-17 (Youth)',
                                shiftDirection: secondAge5to17Avg > firstAge5to17Avg ? 'Youth updates increasing' : 'Adult updates increasing'
                            });
                        }

                        setMonthlyData(processedMonthly);
                        setOverallDistribution([
                            { name: 'Age 5-17 (Youth)', value: totalAge5to17, color: COLORS.age5to17 },
                            { name: 'Age 17+ (Adult)', value: totalAge17plus, color: COLORS.age17plus }
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

    const formatNumber = (num: number) => num.toLocaleString('en-IN');

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Analyzing Update Types...</p>
            </div>
        );
    }

    const totalUpdates = overallDistribution.reduce((sum, d) => sum + d.value, 0);

    return (
        <div className="update-types-container">
            {/* Summary Cards */}
            <div className="card-grid three-cols">
                {overallDistribution.map((type, index) => (
                    <motion.div
                        key={type.name}
                        className="stat-card type-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        style={{ borderLeftColor: type.color }}
                    >
                        <div className="type-icon" style={{ background: type.color }}>
                            <Users size={24} color="white" />
                        </div>
                        <div className="type-content">
                            <div className="stat-label">{type.name}</div>
                            <div className="stat-value">{formatNumber(type.value)}</div>
                            <div className="stat-percentage">
                                <Percent size={14} />
                                {((type.value / totalUpdates) * 100).toFixed(1)}% of total
                            </div>
                        </div>
                    </motion.div>
                ))}

                <motion.div
                    className="stat-card trend-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="trend-icon">
                        <TrendingUp size={24} />
                    </div>
                    <div className="trend-content">
                        <div className="stat-label">Dominant Category</div>
                        <div className="stat-value small">{trends.dominantType}</div>
                        <div className="trend-insight">
                            {trends.shiftDirection}
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Pie Chart - Overall Distribution */}
            <div className="charts-row">
                <motion.div
                    className="chart-container medium"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <h3 className="chart-title">
                        <BarChart3 size={20} style={{ marginRight: 8 }} />
                        Overall Update Type Distribution
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={overallDistribution}
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={110}
                                paddingAngle={5}
                                dataKey="value"
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                                labelLine={true}
                            >
                                {overallDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value: number) => formatNumber(value)} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="chart-legend">
                        {overallDistribution.map(type => (
                            <div key={type.name} className="legend-item">
                                <span className="legend-color" style={{ background: type.color }}></span>
                                <span>{type.name}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                <motion.div
                    className="chart-container medium"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <h3 className="chart-title">Monthly Update Volume by Type</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={monthlyData} barGap={0}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} />
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
                            <Bar dataKey="age5to17" name="Age 5-17" stackId="a" fill={COLORS.age5to17} />
                            <Bar dataKey="age17plus" name="Age 17+" stackId="a" fill={COLORS.age17plus} />
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>
            </div>

            {/* Percentage Trend Over Time */}
            <motion.div
                className="chart-container full"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <h3 className="chart-title">Update Type Share Trend (%)</h3>
                <p className="chart-subtitle">Track how the composition of biometric updates changes over time</p>
                <ResponsiveContainer width="100%" height={320}>
                    <AreaChart data={monthlyData}>
                        <defs>
                            <linearGradient id="colorAge5to17" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={COLORS.age5to17} stopOpacity={0.8} />
                                <stop offset="95%" stopColor={COLORS.age5to17} stopOpacity={0.2} />
                            </linearGradient>
                            <linearGradient id="colorAge17plus" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={COLORS.age17plus} stopOpacity={0.8} />
                                <stop offset="95%" stopColor={COLORS.age17plus} stopOpacity={0.2} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                        <Tooltip
                            formatter={(value: number) => `${value.toFixed(1)}%`}
                            contentStyle={{
                                background: 'rgba(255,255,255,0.95)',
                                border: 'none',
                                borderRadius: 8,
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                            }}
                        />
                        <Legend />
                        <Area
                            type="monotone"
                            dataKey="age5to17Pct"
                            name="Age 5-17 %"
                            stroke={COLORS.age5to17}
                            strokeWidth={2}
                            fill="url(#colorAge5to17)"
                        />
                        <Area
                            type="monotone"
                            dataKey="age17plusPct"
                            name="Age 17+ %"
                            stroke={COLORS.age17plus}
                            strokeWidth={2}
                            fill="url(#colorAge17plus)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </motion.div>

            {/* Insight Section */}
            <motion.div
                className="insight-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <h3 className="chart-title">Key Observations</h3>
                <div className="insight-cards-row">
                    <div className="insight-card">
                        <div className="insight-header">
                            <Users size={20} color="#1a3672" />
                            <strong>Adult Dominance</strong>
                        </div>
                        <p>
                            Adult biometric updates (Age 17+) constitute the majority of all updates at
                            <strong> {((overallDistribution[1]?.value / totalUpdates) * 100).toFixed(1)}%</strong>.
                            This indicates regular biometric maintenance among the adult population.
                        </p>
                    </div>

                    <div className="insight-card">
                        <div className="insight-header">
                            {trends.age5to17Trend > 0 ?
                                <ArrowUpRight size={20} color="#48bb78" /> :
                                <ArrowDownRight size={20} color="#ed8936" />
                            }
                            <strong>Youth Update Trend</strong>
                        </div>
                        <p>
                            Youth updates (Age 5-17) have {trends.age5to17Trend > 0 ? 'increased' : 'decreased'} by
                            <strong> {Math.abs(trends.age5to17Trend).toFixed(1)}%</strong> share
                            from first half to second half of the period. This may indicate
                            {trends.age5to17Trend > 0 ? ' growing school-based enrolment drives.' : ' seasonal variations in youth engagement.'}
                        </p>
                    </div>

                    <div className="insight-card highlight">
                        <div className="insight-header">
                            <BarChart3 size={20} color="#f69320" />
                            <strong>Operational Insight</strong>
                        </div>
                        <p>
                            The biometric update workload is <strong>age-segmented</strong>, with distinct patterns
                            for youth and adult populations. Consider staffing adjustments during school
                            campaigns to handle youth biometric spikes.
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default UpdateTypes;
