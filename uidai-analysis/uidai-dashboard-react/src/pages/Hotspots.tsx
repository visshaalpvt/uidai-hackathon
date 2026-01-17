import React, { useEffect, useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import Papa from 'papaparse';

interface FlaggedRecord {
    pincode: string;
    state: string;
    district: string;
    total_enrolments: number;
    enrolments_mom_growth: number;
    risk_level: string;
    flag_reason: string;
}

const Hotspots: React.FC = () => {
    const [data, setData] = useState<FlaggedRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/data/flagged_records.csv');
                const text = await response.text();
                Papa.parse(text, {
                    header: true,
                    dynamicTyping: true,
                    complete: (results) => {
                        // Filter and sort top 20 by enrolments for the chart
                        const rawData = results.data as FlaggedRecord[];
                        const cleanData = rawData.filter(d => d.pincode && d.total_enrolments > 0);
                        setData(cleanData);
                    }
                });
            } catch (e) {
                console.error("Fetch error", e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const top10 = [...data].sort((a, b) => b.total_enrolments - a.total_enrolments).slice(0, 10);

    if (loading) return <div>Loading Hotspots...</div>;

    return (
        <div>
            <div className="chart-container">
                <h3 className="chart-title">Top 10 High-Volume Pincodes</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={top10} layout="vertical" margin={{ left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" />
                        <YAxis dataKey="pincode" type="category" width={80} />
                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const d = payload[0].payload;
                                    return (
                                        <div style={{ background: '#fff', padding: '10px', border: '1px solid #ccc' }}>
                                            <p><strong>Pincode:</strong> {d.pincode}</p>
                                            <p><strong>District:</strong> {d.district}</p>
                                            <p><strong>Total:</strong> {d.total_enrolments}</p>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Bar dataKey="total_enrolments" fill="#f69320" radius={[0, 4, 4, 0]} name="Enrolments" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="table-container">
                <h3 className="chart-title" style={{ marginBottom: '1rem' }}>Flagged Areas Requiring Intervention</h3>
                <div style={{ overflowX: 'auto' }}>
                    <table>
                        <thead>
                            <tr>
                                <th>Pincode</th>
                                <th>District</th>
                                <th>State</th>
                                <th>Enrolments</th>
                                <th>Growth (MoM)</th>
                                <th>Risk Level</th>
                                <th>Reason</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.slice(0, 50).map((row, i) => (
                                <tr key={i}>
                                    <td style={{ fontWeight: 'bold' }}>{row.pincode}</td>
                                    <td>{row.district}</td>
                                    <td>{row.state}</td>
                                    <td>{row.total_enrolments}</td>
                                    <td style={{
                                        color: row.enrolments_mom_growth > 0 ? '#48bb78' : '#f56565',
                                        fontWeight: 'bold'
                                    }}>
                                        {typeof row.enrolments_mom_growth === 'number' ? row.enrolments_mom_growth.toFixed(1) + '%' : 'N/A'}
                                    </td>
                                    <td>
                                        <span className={`badge badge-${row.risk_level?.toLowerCase() || 'low'}`}>
                                            {row.risk_level || 'Normal'}
                                        </span>
                                    </td>
                                    <td style={{ fontSize: '0.85rem', color: '#718096' }}>{row.flag_reason}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <p style={{ marginTop: '1rem', color: '#718096', fontSize: '0.85rem' }}>
                    Showing top 50 records. Download full report for details.
                </p>
            </div>
        </div>
    );
};

export default Hotspots;
