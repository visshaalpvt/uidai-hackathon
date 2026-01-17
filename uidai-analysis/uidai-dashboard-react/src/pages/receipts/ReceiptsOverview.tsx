import React, { useEffect, useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area
} from 'recharts';
import Papa from 'papaparse';
import { Activity, TrendingUp, MapPin, AlertTriangle } from 'lucide-react';

interface ReceiptData {
    state: string;
    enrolment: number;
    generated: number;
}

const ReceiptsOverview: React.FC = () => {
    const [stats, setStats] = useState({
        totalGenerated: 0,
        totalEnrolments: 0,
        topState: '',
        topStateVal: 0,
        bottomState: '',
        bottomStateVal: 0,
        conversionRate: 0
    });
    const [chartData, setChartData] = useState<ReceiptData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/data/state_wise_aadhaar_2023_24.csv');
                const csvText = await response.text();

                Papa.parse(csvText, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results: any) => {
                        const raw = results.data;
                        const processed: ReceiptData[] = raw
                            .filter((r: any) => r["India/State/UT"] && r["India/State/UT"] !== 'India')
                            .map((r: any) => ({
                                state: r["India/State/UT"],
                                enrolment: parseInt(String(r["Total Enrolment"]).replace(/,/g, ''), 10) || 0,
                                generated: parseInt(String(r["Aadhaar Number Provided"]).replace(/,/g, ''), 10) || 0,
                            }));

                        // Sort by generated DESC
                        processed.sort((a, b) => b.generated - a.generated);

                        // Get India totals
                        const indiaRow = raw.find((r: any) => r["India/State/UT"] === 'India');
                        const totalGen = indiaRow ? parseInt(String(indiaRow["Aadhaar Number Provided"]).replace(/,/g, ''), 10) : 0;
                        const totalEnr = indiaRow ? parseInt(String(indiaRow["Total Enrolment"]).replace(/,/g, ''), 10) : 0;

                        setStats({
                            totalGenerated: totalGen,
                            totalEnrolments: totalEnr,
                            topState: processed[0]?.state || '',
                            topStateVal: processed[0]?.generated || 0,
                            bottomState: processed[processed.length - 1]?.state || '',
                            bottomStateVal: processed[processed.length - 1]?.generated || 0,
                            conversionRate: totalEnr > 0 ? (totalGen / totalEnr) * 100 : 0
                        });

                        setChartData(processed);
                        setLoading(false);
                    }
                });
            } catch (error) {
                console.error("Error fetching data:", error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div>Loading Dashboard Data...</div>;

    return (
        <div className="overview-container">
            {/* KPI Cards */}
            <div className="card-grid">
                <div className="stat-card">
                    <div className="stat-label">Total Aadhaar Generated</div>
                    <div className="stat-value">{stats.totalGenerated.toLocaleString()}</div>
                    <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 5, color: '#48bb78', fontSize: '0.9rem' }}>
                        <Activity size={16} /> <span>All India (2023-24)</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-label">Highest Contributor</div>
                    <div className="stat-value">{stats.topState}</div>
                    <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 5, color: '#718096', fontSize: '0.9rem' }}>
                        <TrendingUp size={16} /> <span>{stats.topStateVal.toLocaleString()} Generated</span>
                    </div>
                </div>

                <div className="stat-card warning">
                    <div className="stat-label">Lowest Contributor</div>
                    <div className="stat-value">{stats.bottomState}</div>
                    <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 5, color: '#ed8936', fontSize: '0.9rem' }}>
                        <MapPin size={16} /> <span>{stats.bottomStateVal.toLocaleString()} Generated</span>
                    </div>
                </div>

                <div className="stat-card danger">
                    <div className="stat-label">Conversion Efficiency</div>
                    <div className="stat-value">{stats.conversionRate.toFixed(1)}%</div>
                    <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 5, color: '#f56565', fontSize: '0.9rem' }}>
                        <AlertTriangle size={16} /> <span>National Average</span>
                    </div>
                </div>
            </div>

            {/* Main Area Chart */}
            <div className="chart-container">
                <h3 className="chart-title">State-wise Aadhaar Generation (Top 15)</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData.slice(0, 15)} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                        <defs>
                            <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#1a3672" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#1a3672" stopOpacity={0.3} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="state" angle={-45} textAnchor="end" height={80} interval={0} tick={{ fontSize: 10 }} />
                        <YAxis tickFormatter={(v) => (v / 1000000).toFixed(0) + 'M'} />
                        <Tooltip formatter={(value: number) => value.toLocaleString()} />
                        <Bar dataKey="generated" fill="url(#colorBar)" name="Aadhaar Generated" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Distribution Curve */}
            <div className="chart-container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 className="chart-title" style={{ marginBottom: 0 }}>Volume Distribution Curve</h3>
                    <span style={{ fontSize: '0.8rem', background: '#e6fffa', color: '#047481', padding: '4px 8px', borderRadius: 4 }}>
                        Cumulative View
                    </span>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={[...chartData].reverse()}>
                        <defs>
                            <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f69320" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#f69320" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="state" hide />
                        <YAxis tickFormatter={(v) => (v / 1000000).toFixed(0) + 'M'} />
                        <Tooltip formatter={(value: number) => value.toLocaleString()} />
                        <Area
                            type="monotone"
                            dataKey="generated"
                            stroke="#f69320"
                            fillOpacity={1}
                            fill="url(#colorVolume)"
                            name="Volume"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default ReceiptsOverview;
