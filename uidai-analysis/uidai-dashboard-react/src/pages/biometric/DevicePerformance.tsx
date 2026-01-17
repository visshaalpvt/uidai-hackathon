import React, { useEffect, useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    Cell, ScatterChart, Scatter, ZAxis
} from 'recharts';
import {
    CheckCircle, XCircle, AlertTriangle, Activity, Server, Smartphone,
    ArrowUpRight, ArrowDownRight, Award, AlertOctagon
} from 'lucide-react';
import { motion } from 'framer-motion';

// Types for device data
interface DevicePerformanceRecord {
    device_name: string;
    manufacturer: string;
    model: string;
    total_attempts: number;
    successful_attempts: number;
    failed_attempts: number;
    avg_response_time_ms: number;
}

interface ProcessedDeviceData extends DevicePerformanceRecord {
    success_rate: number;
    failure_rate: number;
    risk_level: 'Low' | 'Medium' | 'High';
    rank: number;
}

const DevicePerformance: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [devices, setDevices] = useState<ProcessedDeviceData[]>([]);
    const [stats, setStats] = useState({
        totalDevices: 0,
        avgSuccessRate: 0,
        bestDevice: '',
        worstDevice: '',
        highRiskCount: 0
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/data/biometric_devices.json');
                const data: DevicePerformanceRecord[] = await response.json();

                // Process data
                const processed = data.map(d => {
                    const success_rate = (d.successful_attempts / d.total_attempts) * 100;
                    const failure_rate = (d.failed_attempts / d.total_attempts) * 100;

                    let risk_level: 'Low' | 'Medium' | 'High' = 'Low';
                    if (failure_rate > 10) risk_level = 'High';
                    else if (failure_rate > 5) risk_level = 'Medium';

                    return {
                        ...d,
                        success_rate,
                        failure_rate,
                        risk_level,
                        rank: 0 // placeholder
                    };
                });

                // Sort by success rate descending for ranking
                processed.sort((a, b) => b.success_rate - a.success_rate);

                // Assign ranks
                processed.forEach((d, i) => d.rank = i + 1);

                // Calculate Summary Stats
                const avgSuccess = processed.reduce((acc, curr) => acc + curr.success_rate, 0) / processed.length;
                const highRisk = processed.filter(d => d.risk_level === 'High').length;

                setDevices(processed);
                setStats({
                    totalDevices: processed.length,
                    avgSuccessRate: avgSuccess,
                    bestDevice: processed[0].device_name,
                    worstDevice: processed[processed.length - 1].device_name,
                    highRiskCount: highRisk
                });
                setLoading(false);
            } catch (error) {
                console.error('Error fetching device data:', error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading Device Performance Analytics...</p>
            </div>
        );
    }

    const formatNumber = (num: number) => num.toLocaleString('en-IN');

    // Risk Color Helper
    const getRiskColor = (level: string) => {
        switch (level) {
            case 'Low': return '#48bb78'; // Green
            case 'Medium': return '#f69320'; // Orange
            case 'High': return '#f56565'; // Red
            default: return '#cbd5e0';
        }
    };

    return (
        <div className="device-performance-page">
            <h2 className="page-header-title">Biometric Device Performance Analysis</h2>

            {/* KPI Cards */}
            <div className="card-grid">
                <motion.div
                    className="stat-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #1a3672 0%, #2d4a8c 100%)' }}>
                        <Server size={24} color="white" />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Total Devices Monitored</div>
                        <div className="stat-value">{stats.totalDevices}</div>
                        <div className="stat-meta">
                            <Activity size={14} /> Active across network
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
                        <CheckCircle size={24} color="white" />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Best Performing</div>
                        <div className="stat-value" style={{ fontSize: '1.2rem' }}>{stats.bestDevice}</div>
                        <div className="stat-meta positive">
                            <Award size={14} /> Highest Success Rate
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
                        <div className="stat-label">Avg Success Rate</div>
                        <div className="stat-value">{stats.avgSuccessRate.toFixed(1)}%</div>
                        <div className="stat-meta">
                            Across all devices
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
                        <div className="stat-label">High Risk Devices</div>
                        <div className="stat-value">{stats.highRiskCount}</div>
                        <div className="stat-meta negative">
                            <AlertOctagon size={14} /> Needs Attention
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
                    <h3 className="chart-title">Device Reliability: Success vs Failure Rate</h3>
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={devices} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis
                                dataKey="device_name"
                                angle={-45}
                                textAnchor="end"
                                interval={0}
                                height={80}
                                tick={{ fontSize: 10 }}
                            />
                            <YAxis unit="%" domain={[0, 100]} />
                            <Tooltip
                                contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            />
                            <Legend wrapperStyle={{ paddingTop: 20 }} />
                            <Bar dataKey="success_rate" name="Success Rate (%)" fill="#48bb78" stackId="a" radius={[0, 0, 4, 4]} />
                            <Bar dataKey="failure_rate" name="Failure Rate (%)" fill="#f56565" stackId="a" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>

                <motion.div
                    className="chart-container small"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 }}
                >
                    <h3 className="chart-title">Response Time Performance</h3>
                    <ResponsiveContainer width="100%" height={350}>
                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                            <CartesianGrid stroke="#e2e8f0" />
                            <XAxis type="category" dataKey="device_name" name="Device" hide />
                            <YAxis type="number" dataKey="avg_response_time_ms" name="Time" unit="ms" />
                            <ZAxis type="number" dataKey="total_attempts" range={[60, 400]} name="Volume" />
                            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                            <Scatter name="Response Time" data={devices} fill="#1a3672">
                                {devices.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.avg_response_time_ms > 600 ? '#f56565' : '#1a3672'} />
                                ))}
                            </Scatter>
                        </ScatterChart>
                    </ResponsiveContainer>
                    <div style={{ textAlign: 'center', fontSize: '0.8rem', color: '#666', marginTop: 10 }}>
                        Circle size represents transaction volume. Red indicates slow response (&gt;600ms).
                    </div>
                </motion.div>
            </div>

            {/* Detailed Top 10 Table */}
            <motion.div
                className="table-container full-width"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                    <h3 className="chart-title">Top 10 Device Performance Ranking</h3>
                    <span style={{ fontSize: '0.8rem', color: '#666' }}>*Ranked by Success Rate</span>
                </div>

                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Device Model</th>
                            <th>Manufacturer</th>
                            <th>Total Attempts</th>
                            <th>Success Rate</th>
                            <th>Failure Rate</th>
                            <th>Response Time</th>
                            <th>Risk Assessment</th>
                        </tr>
                    </thead>
                    <tbody>
                        {devices.slice(0, 10).map((device) => (
                            <tr key={device.device_name}>
                                <td>
                                    <span className={`rank-badge rank-${device.rank}`}>#{device.rank}</span>
                                </td>
                                <td>
                                    <div style={{ fontWeight: 600 }}>{device.model}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#718096' }}>{device.device_name}</div>
                                </td>
                                <td>{device.manufacturer}</td>
                                <td>{formatNumber(device.total_attempts)}</td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                        <div style={{
                                            width: 50, height: 6, background: '#edf2f7', borderRadius: 3, overflow: 'hidden'
                                        }}>
                                            <div style={{
                                                width: `${device.success_rate}%`,
                                                height: '100%',
                                                background: device.success_rate > 95 ? '#48bb78' : '#f69320'
                                            }}></div>
                                        </div>
                                        {device.success_rate.toFixed(1)}%
                                    </div>
                                </td>
                                <td style={{ color: device.failure_rate > 5 ? '#e53e3e' : '#4a5568' }}>
                                    {device.failure_rate.toFixed(1)}%
                                </td>
                                <td>{device.avg_response_time_ms} ms</td>
                                <td>
                                    <span className={`status-badge risk-${device.risk_level.toLowerCase()}`}>
                                        {device.risk_level} Risk
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </motion.div>

            {/* Risk Assessment Section */}
            <motion.div
                className="insights-summary"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                style={{ marginTop: 20 }}
            >
                <h3 className="chart-title">Risk & Operational Impact Assessment</h3>
                <div className="insights-grid">
                    <div className="insight-card info">
                        <AlertOctagon size={20} />
                        <div>
                            <strong>Operational Impact</strong>
                            <p>Devices with high failure rates (&gt;{stats.highRiskCount > 0 ? '10%' : '5%'}) contribute to increased queue times and user frustration. Recommended to inspect <strong>{devices.filter(d => d.risk_level === 'High').map(d => d.model).join(', ') || 'N/A'}</strong> due to consistent performance anomalies.</p>
                        </div>
                    </div>
                    <div className="insight-card warning">
                        <ArrowUpRight size={20} />
                        <div>
                            <strong>Performance Disparity</strong>
                            <p>There is a <strong>{(devices[0]?.success_rate - devices[devices.length - 1]?.success_rate).toFixed(1)}%</strong> spread between the best and worst performing devices in the network.</p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default DevicePerformance;
