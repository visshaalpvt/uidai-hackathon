import React, { useEffect, useState } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import Papa from 'papaparse';
import { TrendingUp, BarChart3, PieChart as PieIcon, Layers } from 'lucide-react';

interface ReceiptData {
    state: string;
    generated: number;
}

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444'];

const ReceiptsPatterns: React.FC = () => {
    const [chartData, setChartData] = useState<ReceiptData[]>([]);
    const [distributionData, setDistributionData] = useState<{ name: string; value: number }[]>([]);
    const [stats, setStats] = useState({
        top5Percent: 0,
        under1M: 0,
        over10M: 0
    });
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
                                generated: parseInt(String(r["Aadhaar Number Provided"]).replace(/,/g, ''), 10) || 0,
                            }));

                        // Sort ASC for cumulative curve
                        const sortedAsc = [...processed].sort((a, b) => a.generated - b.generated);
                        setChartData(sortedAsc);

                        // Calculate distribution buckets
                        let under1M = 0, bet1_5M = 0, bet5_10M = 0, over10M = 0;
                        processed.forEach(p => {
                            if (p.generated < 1000000) under1M++;
                            else if (p.generated < 5000000) bet1_5M++;
                            else if (p.generated < 10000000) bet5_10M++;
                            else over10M++;
                        });

                        setDistributionData([
                            { name: '< 1M', value: under1M },
                            { name: '1M - 5M', value: bet1_5M },
                            { name: '5M - 10M', value: bet5_10M },
                            { name: '> 10M', value: over10M },
                        ]);

                        // Top 5 contribution
                        const sortedDesc = [...processed].sort((a, b) => b.generated - a.generated);
                        const totalVol = processed.reduce((s, p) => s + p.generated, 0);
                        const top5Vol = sortedDesc.slice(0, 5).reduce((s, p) => s + p.generated, 0);

                        setStats({
                            top5Percent: totalVol > 0 ? Math.round((top5Vol / totalVol) * 100) : 0,
                            under1M,
                            over10M
                        });

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

    if (loading) return <div>Loading Patterns...</div>;

    return (
        <div className="overview-container">
            {/* Pattern Summary Cards */}
            <div className="card-grid">
                <div className="stat-card">
                    <div className="stat-label">Concentration</div>
                    <div className="stat-value">Pareto Heavy</div>
                    <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 5, color: '#6366f1', fontSize: '0.9rem' }}>
                        <PieIcon size={16} /> <span>Top 5 states: {stats.top5Percent}% of total</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-label">Skewness</div>
                    <div className="stat-value">Right Skewed</div>
                    <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 5, color: '#718096', fontSize: '0.9rem' }}>
                        <BarChart3 size={16} /> <span>Majority ({stats.under1M}) have &lt; 1M receipts</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-label">High Volume</div>
                    <div className="stat-value">{stats.over10M} States</div>
                    <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 5, color: '#10b981', fontSize: '0.9rem' }}>
                        <TrendingUp size={16} /> <span>Processed over 10M each</span>
                    </div>
                </div>

                <div className="stat-card warning">
                    <div className="stat-label">Distribution Type</div>
                    <div className="stat-value">Uneven</div>
                    <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 5, color: '#ed8936', fontSize: '0.9rem' }}>
                        <Layers size={16} /> <span>Population-driven load</span>
                    </div>
                </div>
            </div>

            {/* Distribution Pie Chart */}
            <div className="charts-row">
                <div className="chart-container">
                    <h3 className="chart-title">Volume Distribution (States/UTs)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={distributionData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                                label={({ name, value }) => `${name}: ${value}`}
                            >
                                {distributionData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Cumulative Curve */}
                <div className="chart-container">
                    <h3 className="chart-title">Cumulative Volume Curve</h3>
                    <p style={{ color: '#718096', fontSize: '0.85rem', marginBottom: '0.5rem' }}>States sorted Low → High</p>
                    <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorCurve" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="state" hide />
                            <YAxis tickFormatter={(v) => (v / 1000000).toFixed(0) + 'M'} />
                            <Tooltip formatter={(value: number) => value.toLocaleString()} />
                            <Area type="monotone" dataKey="generated" stroke="#8884d8" fillOpacity={1} fill="url(#colorCurve)" name="Volume" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default ReceiptsPatterns;
