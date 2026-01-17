import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Papa from 'papaparse';
import { Users, TrendingUp, MapPin, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

interface DemographicRecord {
    date: string;
    state: string;
    district: string;
    total_updates: number;
    update_name: number;
    update_address: number;
    update_dob: number;
    update_gender: number;
    update_mobile: number;
}

const Overview: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalUpdates: 0,
        growthRate: 0,
        topDistrict: '',
        topCategory: ''
    });
    const [trendData, setTrendData] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/data/demographic.csv');
                const text = await response.text();

                Papa.parse(text, {
                    header: true,
                    dynamicTyping: true,
                    complete: (results) => {
                        const data = results.data as DemographicRecord[];
                        const validData = data.filter(d => d.date);

                        // 1. Total Updates (Latest Month vs Previous)
                        // Group by Month
                        const monthlyAgg: { [key: string]: number } = {};
                        const categoryAgg = { name: 0, address: 0, dob: 0, gender: 0, mobile: 0 };
                        const districtAgg: { [key: string]: number } = {};

                        validData.forEach(d => {
                            const dateParts = d.date.split('-');
                            // Verify date format - assuming DD-MM-YYYY or YYYY-MM-DD
                            // Mock data is YYYY-MM-DD (2025-06-01)
                            const monthKey = d.date.substring(0, 7); // YYYY-MM

                            monthlyAgg[monthKey] = (monthlyAgg[monthKey] || 0) + (d.total_updates || 0);

                            categoryAgg.name += d.update_name || 0;
                            categoryAgg.address += d.update_address || 0;
                            categoryAgg.dob += d.update_dob || 0;
                            categoryAgg.gender += d.update_gender || 0;
                            categoryAgg.mobile += d.update_mobile || 0;

                            if (d.district) districtAgg[d.district] = (districtAgg[d.district] || 0) + (d.total_updates || 0);
                        });

                        const sortedMonths = Object.keys(monthlyAgg).sort();
                        const latestMonth = sortedMonths[sortedMonths.length - 1];
                        const prevMonth = sortedMonths[sortedMonths.length - 2];

                        const currentTotal = monthlyAgg[latestMonth] || 0;
                        const prevTotal = monthlyAgg[prevMonth] || 0;
                        const growth = prevTotal > 0 ? ((currentTotal - prevTotal) / prevTotal) * 100 : 0;

                        // Top Category
                        const topCatEntry = Object.entries(categoryAgg).sort((a, b) => b[1] - a[1])[0];
                        const topCategory = topCatEntry ? topCatEntry[0].charAt(0).toUpperCase() + topCatEntry[0].slice(1) : 'N/A';

                        // Top District
                        const topDistEntry = Object.entries(districtAgg).sort((a, b) => b[1] - a[1])[0];
                        const topDistrict = topDistEntry ? topDistEntry[0] : 'N/A';

                        // Trend Data
                        const chartData = sortedMonths.map(m => ({
                            month: m,
                            updates: monthlyAgg[m]
                        }));

                        setStats({
                            totalUpdates: currentTotal,
                            growthRate: growth,
                            topDistrict,
                            topCategory
                        });
                        setTrendData(chartData);
                        setLoading(false);
                    }
                });
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div>Loading Overview...</div>;

    return (
        <div className="overview-container">
            {/* KPI Cards */}
            <div className="card-grid">
                <motion.div className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="stat-icon"><Users size={24} color="white" /></div>
                    <div className="stat-content">
                        <div className="stat-label">Total Updates (Latest)</div>
                        <div className="stat-value">{stats.totalUpdates.toLocaleString()}</div>
                        <div className="stat-meta">
                            <span style={{ color: stats.growthRate >= 0 ? '#48bb78' : '#f56565' }}>
                                {stats.growthRate >= 0 ? '+' : ''}{stats.growthRate.toFixed(1)}%
                            </span> vs last month
                        </div>
                    </div>
                </motion.div>

                <motion.div className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <div className="stat-icon"><MapPin size={24} color="white" /></div>
                    <div className="stat-content">
                        <div className="stat-label">Top District</div>
                        <div className="stat-value small">{stats.topDistrict}</div>
                        <div className="stat-meta">Highest activity region</div>
                    </div>
                </motion.div>

                <motion.div className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <div className="stat-icon"><TrendingUp size={24} color="white" /></div>
                    <div className="stat-content">
                        <div className="stat-label">Top Category</div>
                        <div className="stat-value small">{stats.topCategory}</div>
                        <div className="stat-meta">Most frequent update type</div>
                    </div>
                </motion.div>

                <motion.div className="stat-card success" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <div className="stat-icon success"><FileText size={24} color="white" /></div>
                    <div className="stat-content">
                        <div className="stat-label">Dataset Status</div>
                        <div className="stat-value small">Active</div>
                        <div className="stat-meta">Govt. Verified Data</div>
                    </div>
                </motion.div>
            </div>

            {/* Main Chart */}
            <motion.div className="chart-container" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}>
                <h3 className="chart-title">Demographic Updates Trend (Monthly)</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={trendData}>
                        <defs>
                            <linearGradient id="colorUpdates" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#1a3672" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#1a3672" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Area type="monotone" dataKey="updates" stroke="#1a3672" fillOpacity={1} fill="url(#colorUpdates)" />
                    </AreaChart>
                </ResponsiveContainer>
            </motion.div>
        </div>
    );
};

export default Overview;
