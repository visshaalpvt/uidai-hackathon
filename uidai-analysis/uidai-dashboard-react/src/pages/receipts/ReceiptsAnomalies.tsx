import React, { useEffect, useState } from 'react';
import {
    ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine
} from 'recharts';
import Papa from 'papaparse';
import { AlertTriangle, Info } from 'lucide-react';

interface ReceiptData {
    state: string;
    enrolment: number;
    generated: number;
    conversionRate: number;
}

const ReceiptsAnomalies: React.FC = () => {
    const [chartData, setChartData] = useState<ReceiptData[]>([]);
    const [anomalies, setAnomalies] = useState<ReceiptData[]>([]);
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
                                    conversionRate: enrolment > 0 ? (generated / enrolment) * 100 : 0
                                };
                            })
                            .filter((d: ReceiptData) => d.enrolment > 1000);

                        setChartData(processed);

                        // Get lowest conversion rates
                        const sorted = [...processed].sort((a, b) => a.conversionRate - b.conversionRate);
                        setAnomalies(sorted.slice(0, 5));

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

    if (loading) return <div>Loading Anomaly Analysis...</div>;

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const d = payload[0].payload as ReceiptData;
            return (
                <div style={{ background: 'white', padding: '12px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                    <p style={{ fontWeight: 'bold', marginBottom: '4px' }}>{d.state}</p>
                    <p style={{ fontSize: '0.9rem', color: '#4a5568' }}>Enrolment: {d.enrolment.toLocaleString()}</p>
                    <p style={{ fontSize: '0.9rem', color: '#4a5568' }}>Generated: {d.generated.toLocaleString()}</p>
                    <p style={{ fontSize: '0.9rem', fontWeight: 'bold', color: d.conversionRate < 80 ? '#ef4444' : '#16a34a' }}>
                        Conversion: {d.conversionRate.toFixed(1)}%
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="overview-container">
            {/* Methodology Banner */}
            <div className="info-banner" style={{ borderLeftColor: '#ed8936', background: 'linear-gradient(135deg, #fffaf0 0%, #fef3c7 100%)' }}>
                <AlertTriangle size={24} color="#ed8936" />
                <div>
                    <strong>Logic: Conversion Rate Deviation</strong>
                    <p style={{ fontSize: '0.9rem', color: '#78350f', margin: '4px 0 0' }}>
                        Anomalies are detected by comparing <strong>Enrolment Requests</strong> vs <strong>Aadhaar Generated</strong>.
                        States with significantly lower generation rates (Gap &gt; 20%) are flagged as operational risks.
                    </p>
                </div>
            </div>

            {/* Scatter Plot */}
            <div className="chart-container">
                <h3 className="chart-title">Performance Clustering (Enrolment vs Generation)</h3>
                <ResponsiveContainer width="100%" height={400}>
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            type="number"
                            dataKey="enrolment"
                            name="Enrolments"
                            tickFormatter={(v) => (v / 1000000).toFixed(0) + 'M'}
                            label={{ value: 'Enrolments (Millions)', position: 'insideBottomRight', offset: -10 }}
                        />
                        <YAxis
                            type="number"
                            dataKey="generated"
                            name="Generated"
                            tickFormatter={(v) => (v / 1000000).toFixed(0) + 'M'}
                            label={{ value: 'Generated (Millions)', angle: -90, position: 'insideLeft' }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <ReferenceLine
                            segment={[{ x: 0, y: 0 }, { x: 45000000, y: 45000000 }]}
                            stroke="#ccc"
                            strokeDasharray="3 3"
                        />
                        <Scatter name="States" data={chartData} fill="#8884d8">
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.conversionRate < 80 ? '#ef4444' : '#4f46e5'} />
                            ))}
                        </Scatter>
                    </ScatterChart>
                </ResponsiveContainer>
            </div>

            {/* Anomalies Table */}
            <div className="table-container">
                <h3 className="chart-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertTriangle size={18} color="#ef4444" />
                    Flagged Anomalies (Lowest Conversion Rates)
                </h3>
                <table>
                    <thead style={{ background: '#fef2f2' }}>
                        <tr>
                            <th style={{ color: '#991b1b' }}>State / UT</th>
                            <th style={{ color: '#991b1b', textAlign: 'right' }}>Enrolment</th>
                            <th style={{ color: '#991b1b', textAlign: 'right' }}>Generated</th>
                            <th style={{ color: '#991b1b', textAlign: 'right' }}>Difference</th>
                            <th style={{ color: '#991b1b', textAlign: 'right' }}>Conversion %</th>
                        </tr>
                    </thead>
                    <tbody>
                        {anomalies.map((row) => (
                            <tr key={row.state}>
                                <td style={{ fontWeight: 500 }}>{row.state}</td>
                                <td style={{ textAlign: 'right' }}>{row.enrolment.toLocaleString()}</td>
                                <td style={{ textAlign: 'right' }}>{row.generated.toLocaleString()}</td>
                                <td style={{ textAlign: 'right' }}>{(row.enrolment - row.generated).toLocaleString()}</td>
                                <td style={{ textAlign: 'right', fontWeight: 'bold', color: '#ef4444' }}>{row.conversionRate.toFixed(1)}%</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '1rem', color: '#718096', fontSize: '0.85rem' }}>
                    <Info size={16} />
                    <p style={{ margin: 0 }}>Low conversion could indicate high rejection rates due to documentation issues or technical pipeline duplications.</p>
                </div>
            </div>
        </div>
    );
};

export default ReceiptsAnomalies;
