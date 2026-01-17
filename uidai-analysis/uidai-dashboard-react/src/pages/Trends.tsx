import React, { useEffect, useState } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    BarChart, Bar
} from 'recharts';
import Papa from 'papaparse';

const Trends: React.FC = () => {
    const [monthlyData, setMonthlyData] = useState<any[]>([]);
    const [stateData, setStateData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            // 1. Fetch Monthly Aggregate
            const mRes = await fetch('/data/enrolment_monthly.csv');
            const mText = await mRes.text();

            Papa.parse(mText, {
                header: true,
                dynamicTyping: true,
                complete: (results) => {
                    const data = results.data as any[];
                    // Agg by month
                    const agg = data.reduce((acc: any, curr: any) => {
                        if (!curr.month) return acc;
                        if (!acc[curr.month]) acc[curr.month] = { month: curr.month, valid: 0, rejected: 0, total: 0 };
                        acc[curr.month].total += (curr.total_enrolments || 0);
                        // assuming rejected/valid might not be in CSV, we use total. If they were we'd sum them.
                        return acc;
                    }, {});
                    setMonthlyData(Object.values(agg).sort((a: any, b: any) => new Date(a.month).getTime() - new Date(b.month).getTime()));
                }
            });

            // 2. Fetch State Aggregate (can be derived from same file)
            Papa.parse(mText, {
                header: true,
                dynamicTyping: true,
                complete: (results) => {
                    const data = results.data as any[];
                    const agg = data.reduce((acc: any, curr: any) => {
                        if (!curr.state) return acc;
                        if (!acc[curr.state]) acc[curr.state] = { state: curr.state, total: 0 };
                        acc[curr.state].total += (curr.total_enrolments || 0);
                        return acc;
                    }, {});
                    setStateData(Object.values(agg).sort((a: any, b: any) => b.total - a.total).slice(0, 10)); // Top 10 states
                    setLoading(false);
                }
            });
        };
        loadData();
    }, []);

    if (loading) return <div>Loading Trends...</div>;

    return (
        <div>
            <div className="chart-container">
                <h3 className="chart-title">Seasonality Analysis (Monthly Growth)</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="total" stroke="#f69320" strokeWidth={3} name="Total Enrolments" activeDot={{ r: 8 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="chart-container">
                <h3 className="chart-title">State-wise Distribution (Top 10)</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stateData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="state" interval={0} angle={-30} textAnchor="end" height={80} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="total" fill="#1a3672" radius={[4, 4, 0, 0]} name="Enrolments" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default Trends;
