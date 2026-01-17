import React, { useEffect, useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, AreaChart, Area, ComposedChart, ScatterChart, Scatter
} from 'recharts';
import Papa from 'papaparse';
import { XCircle, AlertTriangle, TrendingUp, TrendingDown, MapPin, Activity, Info } from 'lucide-react';
import { motion } from 'framer-motion';

interface BiometricRecord {
    date: string;
    state: string;
    district: string;
    pincode: string;
    bio_age_5_17: number;
    bio_age_17_: number;
}

interface FailureData {
    location: string;
    state: string;
    district: string;
    pincode: string;
    totalUpdates: number;
    zeroUpdates: number;
    lowUpdates: number;
    failureRate: number;
    riskLevel: 'Low' | 'Medium' | 'High';
}

interface MonthlyFailure {
    month: string;
    total: number;
    potentialFailures: number;
    failureRate: number;
}

const FailureAnalysis: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [failureStats, setFailureStats] = useState({
        overallFailureRate: 0,
        highRiskLocations: 0,
        mediumRiskLocations: 0,
        lowUpdateRecords: 0,
        totalRecords: 0
    });
    const [monthlyFailures, setMonthlyFailures] = useState<MonthlyFailure[]>([]);
    const [highRiskLocations, setHighRiskLocations] = useState<FailureData[]>([]);
    const [districtFailures, setDistrictFailures] = useState<{ district: string; failureRate: number; total: number }[]>([]);

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

                        // Analyze failure patterns
                        // Since we don't have explicit failure data, we'll approximate:
                        // - Records with very low updates (< 5 total) relative to area average = potential issues
                        // - Records with 0 in one age group but activity in another = potential capture issues

                        const monthlyAgg: { [key: string]: { total: number; lowRecords: number; zeroAgeGroup: number } } = {};
                        const pincodeAgg: { [key: string]: FailureData } = {};
                        const districtAgg: { [key: string]: { total: number; lowRecords: number; records: number } } = {};

                        let totalLowUpdates = 0;
                        let totalZeroInOneGroup = 0;

                        // Calculate average for threshold
                        const avgPerRecord = validData.reduce((sum, r) =>
                            sum + (r.bio_age_5_17 || 0) + (r.bio_age_17_ || 0), 0) / validData.length;
                        const lowThreshold = avgPerRecord * 0.1; // 10% of average is considered low

                        validData.forEach(record => {
                            const dateParts = record.date.split('-');
                            const monthKey = `${dateParts[2]}-${dateParts[1].padStart(2, '0')}`;

                            const age5to17 = record.bio_age_5_17 || 0;
                            const age17plus = record.bio_age_17_ || 0;
                            const total = age5to17 + age17plus;

                            const isLow = total < lowThreshold;
                            const hasZeroInGroup = (age5to17 === 0 && age17plus > 0) || (age17plus === 0 && age5to17 > 0);

                            // Monthly aggregation
                            if (!monthlyAgg[monthKey]) {
                                monthlyAgg[monthKey] = { total: 0, lowRecords: 0, zeroAgeGroup: 0 };
                            }
                            monthlyAgg[monthKey].total += total;
                            if (isLow) monthlyAgg[monthKey].lowRecords++;
                            if (hasZeroInGroup) monthlyAgg[monthKey].zeroAgeGroup++;

                            // Pincode aggregation
                            if (!pincodeAgg[record.pincode]) {
                                pincodeAgg[record.pincode] = {
                                    location: record.pincode,
                                    state: record.state,
                                    district: record.district,
                                    pincode: record.pincode,
                                    totalUpdates: 0,
                                    zeroUpdates: 0,
                                    lowUpdates: 0,
                                    failureRate: 0,
                                    riskLevel: 'Low'
                                };
                            }
                            pincodeAgg[record.pincode].totalUpdates += total;
                            if (isLow) pincodeAgg[record.pincode].lowUpdates++;
                            if (total === 0) pincodeAgg[record.pincode].zeroUpdates++;

                            // District aggregation
                            if (!districtAgg[record.district]) {
                                districtAgg[record.district] = { total: 0, lowRecords: 0, records: 0 };
                            }
                            districtAgg[record.district].total += total;
                            districtAgg[record.district].records++;
                            if (isLow) districtAgg[record.district].lowRecords++;

                            if (isLow) totalLowUpdates++;
                            if (hasZeroInGroup) totalZeroInOneGroup++;
                        });

                        // Process monthly failures
                        const processedMonthly = Object.entries(monthlyAgg)
                            .map(([month, data]) => ({
                                month,
                                total: data.total,
                                potentialFailures: data.lowRecords + data.zeroAgeGroup,
                                failureRate: validData.length > 0 ?
                                    ((data.lowRecords + data.zeroAgeGroup) / (validData.length / Object.keys(monthlyAgg).length)) * 100 : 0
                            }))
                            .sort((a, b) => a.month.localeCompare(b.month));

                        // Calculate pincode failure rates
                        Object.values(pincodeAgg).forEach(pincode => {
                            const recordCount = validData.filter(d => d.pincode === pincode.pincode).length;
                            pincode.failureRate = recordCount > 0 ?
                                ((pincode.lowUpdates + pincode.zeroUpdates) / recordCount) * 100 : 0;

                            if (pincode.failureRate > 50) pincode.riskLevel = 'High';
                            else if (pincode.failureRate > 25) pincode.riskLevel = 'Medium';
                            else pincode.riskLevel = 'Low';
                        });

                        // Sort by failure rate
                        const sortedPincodes = Object.values(pincodeAgg)
                            .sort((a, b) => b.failureRate - a.failureRate)
                            .slice(0, 10);

                        // District failure rates
                        const processedDistricts = Object.entries(districtAgg)
                            .map(([district, data]) => ({
                                district,
                                failureRate: data.records > 0 ? (data.lowRecords / data.records) * 100 : 0,
                                total: data.total
                            }))
                            .sort((a, b) => b.failureRate - a.failureRate)
                            .slice(0, 8);

                        // Calculate stats
                        const overallFailureRate = (totalLowUpdates / validData.length) * 100;
                        const highRisk = Object.values(pincodeAgg).filter(p => p.riskLevel === 'High').length;
                        const mediumRisk = Object.values(pincodeAgg).filter(p => p.riskLevel === 'Medium').length;

                        setFailureStats({
                            overallFailureRate,
                            highRiskLocations: highRisk,
                            mediumRiskLocations: mediumRisk,
                            lowUpdateRecords: totalLowUpdates,
                            totalRecords: validData.length
                        });

                        setMonthlyFailures(processedMonthly);
                        setHighRiskLocations(sortedPincodes);
                        setDistrictFailures(processedDistricts);

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
                <p>Analyzing Failure Patterns...</p>
            </div>
        );
    }

    const formatNumber = (num: number) => num.toLocaleString('en-IN');

    return (
        <div className="failure-analysis-container">
            {/* Info Banner */}
            <motion.div
                className="info-banner"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <Info size={20} />
                <div>
                    <strong>Methodology Note:</strong> Since explicit failure data is not available, we approximate
                    potential issues using low-update patterns (records below 10% of average) and unbalanced
                    age-group captures as indicators of potential operational issues.
                </div>
            </motion.div>

            {/* KPI Cards */}
            <div className="card-grid">
                <motion.div
                    className="stat-card danger"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="stat-icon danger">
                        <XCircle size={24} color="white" />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Estimated Failure Rate</div>
                        <div className="stat-value">{failureStats.overallFailureRate.toFixed(1)}%</div>
                        <div className="stat-meta">
                            Records with low/zero updates
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    className="stat-card warning"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="stat-icon warning">
                        <AlertTriangle size={24} color="white" />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">High Risk Locations</div>
                        <div className="stat-value">{failureStats.highRiskLocations}</div>
                        <div className="stat-meta">
                            Pincodes with &gt;50% failure rate
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    className="stat-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="stat-icon">
                        <MapPin size={24} color="white" />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Medium Risk Locations</div>
                        <div className="stat-value">{failureStats.mediumRiskLocations}</div>
                        <div className="stat-meta">
                            Pincodes with 25-50% failure rate
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    className="stat-card success"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <div className="stat-icon success">
                        <Activity size={24} color="white" />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Total Records Analyzed</div>
                        <div className="stat-value">{formatNumber(failureStats.totalRecords)}</div>
                        <div className="stat-meta">
                            Biometric update records
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Failure Trend Chart */}
            <motion.div
                className="chart-container"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
            >
                <h3 className="chart-title">Failure Pattern Trend Over Time</h3>
                <ResponsiveContainer width="100%" height={320}>
                    <ComposedChart data={monthlyFailures}>
                        <defs>
                            <linearGradient id="colorFailure" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f56565" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#f56565" stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                        <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                        <Tooltip
                            contentStyle={{
                                background: 'rgba(255,255,255,0.95)',
                                border: 'none',
                                borderRadius: 8,
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                            }}
                        />
                        <Legend />
                        <Area
                            yAxisId="left"
                            type="monotone"
                            dataKey="potentialFailures"
                            name="Potential Failures"
                            fill="url(#colorFailure)"
                            stroke="#f56565"
                            strokeWidth={2}
                        />
                        <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="failureRate"
                            name="Failure Rate %"
                            stroke="#1a3672"
                            strokeWidth={3}
                            dot={{ fill: '#1a3672', strokeWidth: 2 }}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </motion.div>

            {/* District Comparison */}
            <motion.div
                className="chart-container"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <h3 className="chart-title">Districts with Highest Failure Rates</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={districtFailures} layout="vertical" margin={{ left: 80 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                        <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                        <YAxis dataKey="district" type="category" tick={{ fontSize: 11 }} width={80} />
                        <Tooltip
                            formatter={(value: number) => `${(value || 0).toFixed(1)}%`}
                            contentStyle={{
                                background: 'rgba(255,255,255,0.95)',
                                border: 'none',
                                borderRadius: 8,
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                            }}
                        />
                        <Bar
                            dataKey="failureRate"
                            fill="#ed8936"
                            radius={[0, 4, 4, 0]}
                            name="Failure Rate %"
                        />
                    </BarChart>
                </ResponsiveContainer>
            </motion.div>

            {/* High Risk Locations Table */}
            <motion.div
                className="table-container"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <h3 className="chart-title">
                    <AlertTriangle size={20} style={{ marginRight: 8, color: '#ed8936' }} />
                    High Failure Rate Locations (Top 10)
                </h3>
                <table>
                    <thead>
                        <tr>
                            <th>Pincode</th>
                            <th>Total Updates</th>
                            <th>Failure Rate</th>
                            <th>Probable Cause</th>
                            <th>Risk Level</th>
                        </tr>
                    </thead>
                    <tbody>
                        {highRiskLocations.map((location, index) => (
                            <tr key={location.pincode}>
                                <td>
                                    <strong>{location.pincode}</strong>
                                    <div style={{ fontSize: '0.75rem', color: '#718096' }}>{location.district}</div>
                                </td>
                                <td>{formatNumber(location.totalUpdates)}</td>
                                <td>
                                    <div className="progress-bar-container">
                                        <div
                                            className="progress-bar"
                                            style={{
                                                width: `${Math.min(location.failureRate, 100)}%`,
                                                background: location.riskLevel === 'High' ? '#f56565' :
                                                    location.riskLevel === 'Medium' ? '#ed8936' : '#48bb78'
                                            }}
                                        ></div>
                                        <span>{location.failureRate.toFixed(1)}%</span>
                                    </div>
                                </td>
                                <td style={{ fontSize: '0.85rem', color: '#4a5568' }}>
                                    {location.totalUpdates < 10 ?
                                        "Extremely Low Volume (Potential Downtime)" :
                                        location.failureRate > 80 ?
                                            "Consistently Below Threshold" :
                                            "Irregular Activity Patterns"}
                                </td>
                                <td>
                                    <span className={`badge badge-${location.riskLevel.toLowerCase()}`}>
                                        {location.riskLevel}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </motion.div>

            {/* Recommendations */}
            <motion.div
                className="recommendations-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
            >
                <h3 className="chart-title">Recommended Actions</h3>
                <div className="recommendations-grid">
                    <div className="recommendation-card critical">
                        <div className="rec-header">
                            <XCircle size={20} />
                            <strong>Equipment Check</strong>
                        </div>
                        <p>
                            {failureStats.highRiskLocations} locations show consistently high failure patterns.
                            Deploy diagnostic checks for biometric capture devices in these areas.
                        </p>
                    </div>

                    <div className="recommendation-card important">
                        <div className="rec-header">
                            <AlertTriangle size={20} />
                            <strong>Operator Training</strong>
                        </div>
                        <p>
                            Locations with unbalanced age-group captures may indicate operator errors.
                            Schedule refresher training sessions for operators in medium-risk zones.
                        </p>
                    </div>

                    <div className="recommendation-card info">
                        <div className="rec-header">
                            <Activity size={20} />
                            <strong>Monitoring Enhancement</strong>
                        </div>
                        <p>
                            Implement real-time failure alerts for pincodes where failure rate exceeds 40%.
                            This enables proactive intervention before quality degrades further.
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default FailureAnalysis;
