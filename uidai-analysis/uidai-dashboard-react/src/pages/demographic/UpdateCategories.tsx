import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Papa from 'papaparse';
import { motion } from 'framer-motion';

const UpdateCategories: React.FC = () => {
    const [data, setData] = useState<any[]>([]);
    const [pieData, setPieData] = useState<any[]>([]);

    useEffect(() => {
        fetch('/data/demographic.csv')
            .then(r => r.text())
            .then(text => {
                Papa.parse(text, {
                    header: true,
                    dynamicTyping: true,
                    complete: (results) => {
                        const raw = results.data as any[];
                        const valid = raw.filter(d => d.date);

                        // Monthly Breakdown
                        const monthlyAgg: any = {};
                        // Total Breakdown
                        const totalAgg = { Name: 0, Address: 0, DOB: 0, Gender: 0, Mobile: 0 };

                        valid.forEach(d => {
                            const month = d.date.substring(0, 7);
                            if (!monthlyAgg[month]) monthlyAgg[month] = { month, Name: 0, Address: 0, DOB: 0, Gender: 0, Mobile: 0 };

                            monthlyAgg[month].Name += d.update_name || 0;
                            monthlyAgg[month].Address += d.update_address || 0;
                            monthlyAgg[month].DOB += d.update_dob || 0;
                            monthlyAgg[month].Gender += d.update_gender || 0;
                            monthlyAgg[month].Mobile += d.update_mobile || 0;

                            totalAgg.Name += d.update_name || 0;
                            totalAgg.Address += d.update_address || 0;
                            totalAgg.DOB += d.update_dob || 0;
                            totalAgg.Gender += d.update_gender || 0;
                            totalAgg.Mobile += d.update_mobile || 0;
                        });

                        setData(Object.values(monthlyAgg).sort((a: any, b: any) => a.month.localeCompare(b.month)));

                        const pieChartData = Object.entries(totalAgg).map(([name, value]) => ({ name, value }));
                        setPieData(pieChartData);
                    }
                });
            });
    }, []);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    return (
        <div className="demographic-categories">
            <div className="charts-row">
                <motion.div className="chart-container medium" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <h3 className="chart-title">Update Type Distribution (Total)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} label dataKey="value">
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </motion.div>

                <motion.div className="chart-container medium" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    <h3 className="chart-title">Monthly Trends by Category</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="Address" stackId="a" fill="#00C49F" />
                            <Bar dataKey="Mobile" stackId="a" fill="#8884d8" />
                            <Bar dataKey="Name" stackId="a" fill="#0088FE" />
                            <Bar dataKey="DOB" stackId="a" fill="#FFBB28" />
                            <Bar dataKey="Gender" stackId="a" fill="#FF8042" />
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>
            </div>
        </div>
    );
};

export default UpdateCategories;
