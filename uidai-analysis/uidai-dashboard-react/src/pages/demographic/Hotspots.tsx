import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import Papa from 'papaparse';
import { motion } from 'framer-motion';

const Hotspots: React.FC = () => {
    const [topDistricts, setTopDistricts] = useState<any[]>([]);

    useEffect(() => {
        fetch('/data/demographic.csv')
            .then(r => r.text())
            .then(text => {
                Papa.parse(text, {
                    header: true, dynamicTyping: true, complete: res => {
                        const valid = (res.data as any[]).filter(d => d.date);
                        const agg: any = {};
                        valid.forEach(d => {
                            if (d.pincode) {
                                agg[d.pincode] = (agg[d.pincode] || 0) + d.total_updates;
                            }
                        });
                        const sorted = Object.entries(agg)
                            .map(([pincode, total]) => ({ pincode: String(pincode), total }))
                            .sort((a: any, b: any) => b.total - a.total)
                            .slice(0, 10);
                        setTopDistricts(sorted);
                    }
                });
            });
    }, []);

    return (
        <div className="demographic-hotspots">
            <motion.div className="chart-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h3 className="chart-title">Top 10 High-Volume Pincodes</h3>
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={topDistricts} layout="vertical" margin={{ left: 30 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" />
                        <YAxis dataKey="pincode" type="category" />
                        <Tooltip />
                        <Bar dataKey="total" fill="#1a3672" radius={[0, 4, 4, 0]}>
                            {topDistricts.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={index < 3 ? '#f56565' : '#1a3672'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </motion.div>
        </div>
    );
};

export default Hotspots;
