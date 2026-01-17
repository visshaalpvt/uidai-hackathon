import React, { useEffect, useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import Papa from 'papaparse';
import { Trophy, TrendingDown, AlertOctagon } from 'lucide-react';

interface ReceiptData {
    state: string;
    generated: number;
}

const ReceiptsHotspots: React.FC = () => {
    const [top5, setTop5] = useState<ReceiptData[]>([]);
    const [bottom5, setBottom5] = useState<ReceiptData[]>([]);
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

                        // Sort DESC and get top/bottom
                        processed.sort((a, b) => b.generated - a.generated);
                        setTop5(processed.slice(0, 5));
                        setBottom5([...processed].reverse().slice(0, 5));

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

    if (loading) return <div>Loading Hotspots...</div>;

    return (
        <div className="overview-container">
            <div className="charts-row">
                {/* Top 5 */}
                <div className="chart-container">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
                        <Trophy size={24} color="#16a34a" />
                        <h3 className="chart-title" style={{ marginBottom: 0 }}>Top 5 High-Volume Contributors</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={top5} layout="vertical" margin={{ left: 20, right: 20 }}>
                            <defs>
                                <linearGradient id="colorTop" x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.9} />
                                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0.5} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                            <XAxis type="number" hide />
                            <YAxis dataKey="state" type="category" width={100} tick={{ fontSize: 12 }} />
                            <Tooltip formatter={(value: number) => value.toLocaleString()} />
                            <Bar dataKey="generated" fill="url(#colorTop)" barSize={30} radius={[0, 4, 4, 0]} name="Generated">
                                {top5.map((_, index) => (
                                    <Cell key={`cell-${index}`} fillOpacity={1 - index * 0.15} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                    <p style={{ fontSize: '0.85rem', color: '#718096', marginTop: '0.5rem' }}>
                        Uttar Pradesh and Maharashtra consistently lead in volume, driving national statistics significantly.
                    </p>
                </div>

                {/* Bottom 5 */}
                <div className="chart-container">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
                        <TrendingDown size={24} color="#f97316" />
                        <h3 className="chart-title" style={{ marginBottom: 0 }}>Bottom 5 Low-Volume Contributors</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={bottom5} layout="vertical" margin={{ left: 20, right: 20 }}>
                            <defs>
                                <linearGradient id="colorBottom" x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.9} />
                                    <stop offset="95%" stopColor="#f97316" stopOpacity={0.5} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                            <XAxis type="number" hide />
                            <YAxis dataKey="state" type="category" width={140} tick={{ fontSize: 12 }} />
                            <Tooltip formatter={(value: number) => value.toLocaleString()} />
                            <Bar dataKey="generated" fill="url(#colorBottom)" barSize={30} radius={[0, 4, 4, 0]} name="Generated">
                                {bottom5.map((_, index) => (
                                    <Cell key={`cell-${index}`} fillOpacity={1 - index * 0.15} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                    <p style={{ fontSize: '0.85rem', color: '#718096', marginTop: '0.5rem' }}>
                        Island territories and smaller northeastern states have naturally lower volumes.
                    </p>
                </div>
            </div>

            {/* Strategic Note */}
            <div className="info-banner" style={{ marginTop: '1rem' }}>
                <AlertOctagon size={24} color="#3182ce" />
                <div>
                    <strong>Regional Strategy Insight</strong>
                    <p style={{ fontSize: '0.9rem', color: '#4a5568', marginTop: '4px' }}>
                        While the top 5 states provide the bulk of volume, the lower 5 require different operational strategies.
                        High-volume states need robust infrastructure to handle load, whereas low-volume remote areas
                        (like Lakshadweep or Ladakh) prioritize <strong>connectivity and accessibility</strong> over raw processing speed.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ReceiptsHotspots;
