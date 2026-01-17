import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Papa from 'papaparse';
import { motion } from 'framer-motion';

const ChangePatterns: React.FC = () => {
    const [data, setData] = useState<any[]>([]);

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

                        const monthlyAgg: any = {};
                        valid.forEach(d => {
                            const month = d.date.substring(0, 7);
                            if (!monthlyAgg[month]) monthlyAgg[month] = { month, Address: 0, Mobile: 0, Sensitive: 0 };
                            monthlyAgg[month].Address += d.update_address || 0;
                            monthlyAgg[month].Mobile += d.update_mobile || 0;
                            monthlyAgg[month].Sensitive += (d.update_dob || 0) + (d.update_gender || 0);
                        });
                        setData(Object.values(monthlyAgg).sort((a: any, b: any) => a.month.localeCompare(b.month)));
                    }
                });
            });
    }, []);

    return (
        <div className="demographic-patterns">
            <motion.div className="chart-container" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <h3 className="chart-title">Seasonal Change Patterns</h3>
                <p className="chart-subtitle">Address (Migration) vs. Mobile (Communication) vs. Sensitive (DOB/Gender) Updates</p>
                <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="Address" stroke="#00C49F" strokeWidth={2} name="Address (Migration)" />
                        <Line type="monotone" dataKey="Mobile" stroke="#8884d8" strokeWidth={2} name="Mobile Updates" />
                        <Line type="monotone" dataKey="Sensitive" stroke="#ff7300" strokeWidth={2} name="Sensitive (DOB/Gender)" />
                    </LineChart>
                </ResponsiveContainer>
            </motion.div>
        </div>
    );
};

export default ChangePatterns;
