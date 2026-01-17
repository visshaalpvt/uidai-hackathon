import React, { useEffect, useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    ComposedChart, Line
} from 'recharts';
import Papa from 'papaparse';
import { FileText, CheckCircle, XCircle, ArrowRight } from 'lucide-react';

interface ReceiptData {
    state: string;
    enrolment: number;
    generated: number;
    gap: number;
    conversionRate: number;
}

const ReceiptsPipeline: React.FC = () => {
    const [stats, setStats] = useState({
        totalEnrolments: 0,
        totalGenerated: 0,
        totalGap: 0,
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
                            .map((r: any) => {
                                const enrolment = parseInt(String(r["Total Enrolment"]).replace(/,/g, ''), 10) || 0;
                                const generated = parseInt(String(r["Aadhaar Number Provided"]).replace(/,/g, ''), 10) || 0;
                                return {
                                    state: r["India/State/UT"],
                                    enrolment,
                                    generated,
                                    gap: enrolment - generated,
                                    conversionRate: enrolment > 0 ? (generated / enrolment) * 100 : 0
                                };
                            });

                        // Sort by gap DESC (highest gap first)
                        processed.sort((a, b) => b.gap - a.gap);

                        // Get India totals
                        const indiaRow = raw.find((r: any) => r["India/State/UT"] === 'India');
                        const totalGen = indiaRow ? parseInt(String(indiaRow["Aadhaar Number Provided"]).replace(/,/g, ''), 10) : 0;
                        const totalEnr = indiaRow ? parseInt(String(indiaRow["Total Enrolment"]).replace(/,/g, ''), 10) : 0;

                        setStats({
                            totalEnrolments: totalEnr,
                            totalGenerated: totalGen,
                            totalGap: totalEnr - totalGen,
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

    if (loading) return <div>Loading Pipeline Data...</div>;

    return (
        <div className="overview-container">
            {/* Pipeline Funnel KPI Cards */}
            <div className="card-grid">
                <div className="stat-card">
                    <div className="stat-label">Total Enrolments</div>
                    <div className="stat-value">{stats.totalEnrolments.toLocaleString()}</div>
                    <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 5, color: '#718096', fontSize: '0.9rem' }}>
                        <FileText size={16} /> <span>Requests Received</span>
                    </div>
                </div>

                <div className="stat-card success">
                    <div className="stat-label">Aadhaar Generated</div>
                    <div className="stat-value">{stats.totalGenerated.toLocaleString()}</div>
                    <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 5, color: '#48bb78', fontSize: '0.9rem' }}>
                        <CheckCircle size={16} /> <span>Success Rate: {stats.conversionRate.toFixed(1)}%</span>
                    </div>
                </div>

                <div className="stat-card warning">
                    <div className="stat-label">Gap / Pending</div>
                    <div className="stat-value">{stats.totalGap.toLocaleString()}</div>
                    <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 5, color: '#ed8936', fontSize: '0.9rem' }}>
                        <XCircle size={16} /> <span>Rejected or In-Process</span>
                    </div>
                </div>
            </div>

            {/* Enrolment vs Generation Chart */}
            <div className="chart-container">
                <h3 className="chart-title">Enrolment vs Generation (Top 15 by Volume)</h3>
                <p style={{ color: '#718096', fontSize: '0.9rem', marginBottom: '1rem' }}>Comparing requested enrolments against actual generation numbers.</p>
                <ResponsiveContainer width="100%" height={350}>
                    <ComposedChart data={chartData.slice(0, 15)} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                        <defs>
                            <linearGradient id="colorEnr" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.3} />
                            </linearGradient>
                            <linearGradient id="colorGen" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.3} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="state" angle={-45} textAnchor="end" height={80} interval={0} tick={{ fontSize: 10 }} />
                        <YAxis yAxisId="left" tickFormatter={(v) => (v / 1000000).toFixed(0) + 'M'} />
                        <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => v + '%'} />
                        <Tooltip formatter={(value: any, name: string) => [Number(value).toLocaleString(), name]} />
                        <Bar yAxisId="left" dataKey="enrolment" fill="url(#colorEnr)" name="Enrolments" barSize={18} />
                        <Bar yAxisId="left" dataKey="generated" fill="url(#colorGen)" name="Generated" barSize={18} />
                        <Line yAxisId="right" type="monotone" dataKey="conversionRate" stroke="#16a34a" strokeWidth={2} name="Conversion %" dot={{ r: 3 }} />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>

            {/* Gap Table */}
            <div className="table-container">
                <h3 className="chart-title">Highest Processing Gaps (Potential Backlogs/Rejections)</h3>
                <table>
                    <thead>
                        <tr>
                            <th>State / UT</th>
                            <th style={{ textAlign: 'right' }}>Total Enrolments</th>
                            <th style={{ textAlign: 'right' }}>Generated</th>
                            <th style={{ textAlign: 'right' }}>Gap (Count)</th>
                            <th style={{ textAlign: 'right' }}>Efficiency</th>
                        </tr>
                    </thead>
                    <tbody>
                        {chartData.slice(0, 10).map((row) => (
                            <tr key={row.state}>
                                <td style={{ fontWeight: 500 }}>{row.state}</td>
                                <td style={{ textAlign: 'right' }}>{row.enrolment.toLocaleString()}</td>
                                <td style={{ textAlign: 'right' }}>{row.generated.toLocaleString()}</td>
                                <td style={{ textAlign: 'right', color: '#ed8936', fontWeight: 600 }}>{row.gap.toLocaleString()}</td>
                                <td style={{ textAlign: 'right' }}>
                                    <span className={`badge ${row.conversionRate > 90 ? 'badge-low' : row.conversionRate > 70 ? 'badge-medium' : 'badge-high'}`}>
                                        {row.conversionRate.toFixed(1)}%
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ReceiptsPipeline;
