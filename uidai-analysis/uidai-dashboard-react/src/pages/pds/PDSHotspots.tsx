import React, { useEffect, useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { MapPin, AlertTriangle, CheckCircle, Zap, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import Papa from 'papaparse';

interface ProcessedState {
    state: string;
    adoption: number;
    category: 'High' | 'Medium' | 'Low' | 'Critical' | 'NA';
}

const PDSHotspots: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [states, setStates] = useState<ProcessedState[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/data/authenticated_pds_trans.csv');
                const text = await response.text();

                Papa.parse(text, {
                    header: true,
                    complete: (results) => {
                        const data = results.data as any[];
                        const validData = data.filter(d => d['State/UT'] && d['State/UT'].trim() !== '');

                        const processed: ProcessedState[] = validData.map(d => {
                            const adoptionValue = d['% Aadhaar based PDS transactions in June 2021'];
                            let adoption = 0;
                            let category: 'High' | 'Medium' | 'Low' | 'Critical' | 'NA' = 'NA';

                            if (adoptionValue && adoptionValue !== 'NA') {
                                adoption = parseInt(adoptionValue, 10);
                                if (adoption >= 90) category = 'High';
                                else if (adoption >= 50) category = 'Medium';
                                else if (adoption > 0) category = 'Low';
                                else category = 'Critical';
                            }

                            return { state: d['State/UT'], adoption, category };
                        }).filter(s => s.category !== 'NA');

                        setStates(processed);
                        setLoading(false);
                    }
                });
            } catch (error) {
                console.error('Error:', error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading Hotspot Analysis...</p>
            </div>
        );
    }

    const highAdoptionStates = states.filter(s => s.category === 'High').sort((a, b) => b.adoption - a.adoption);
    const criticalStates = states.filter(s => s.category === 'Critical').sort((a, b) => a.adoption - b.adoption);
    const improvementStates = states.filter(s => s.category === 'Medium' || s.category === 'Low').sort((a, b) => b.adoption - a.adoption);

    const getBarColor = (category: string) => {
        switch (category) {
            case 'High': return '#48bb78';
            case 'Medium': return '#f69320';
            case 'Low': return '#f56565';
            case 'Critical': return '#c53030';
            default: return '#a0aec0';
        }
    };

    return (
        <div className="pds-hotspots">
            {/* Hotspot Legend */}
            <div className="hotspot-legend" style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <div className="legend-item">
                    <span className="legend-dot" style={{ background: '#48bb78' }}></span>
                    High Adoption (&ge;90%)
                </div>
                <div className="legend-item">
                    <span className="legend-dot" style={{ background: '#f69320' }}></span>
                    Medium (50-89%)
                </div>
                <div className="legend-item">
                    <span className="legend-dot" style={{ background: '#f56565' }}></span>
                    Low (1-49%)
                </div>
                <div className="legend-item">
                    <span className="legend-dot" style={{ background: '#c53030' }}></span>
                    Critical (0%)
                </div>
            </div>

            {/* Hotspot Summary Cards */}
            <div className="card-grid three-cols">
                <motion.div
                    className="stat-card success"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="stat-icon success">
                        <Zap size={24} color="white" />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Success Hotspots</div>
                        <div className="stat-value">{highAdoptionStates.length}</div>
                        <div className="stat-meta positive">
                            States with &ge;90% adoption
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    className="stat-card warning"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="stat-icon warning">
                        <Globe size={24} color="white" />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Improvement Zone</div>
                        <div className="stat-value">{improvementStates.length}</div>
                        <div className="stat-meta">
                            States with potential growth
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    className="stat-card danger"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="stat-icon danger">
                        <AlertTriangle size={24} color="white" />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Critical Hotspots</div>
                        <div className="stat-value">{criticalStates.length}</div>
                        <div className="stat-meta negative">
                            States with 0% adoption
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Success Hotspots */}
            <motion.div
                className="chart-container"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
            >
                <h3 className="chart-title" style={{ color: '#48bb78' }}>
                    <CheckCircle size={20} style={{ marginRight: 8 }} />
                    Success Hotspots - High Adoption States
                </h3>
                <p className="chart-subtitle">States demonstrating excellent Aadhaar-based PDS implementation</p>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={highAdoptionStates} layout="vertical" margin={{ top: 10, right: 30, left: 120, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                        <XAxis type="number" domain={[0, 100]} unit="%" />
                        <YAxis type="category" dataKey="state" tick={{ fontSize: 11 }} width={110} />
                        <Tooltip formatter={(value: number) => [`${value}%`, 'Adoption Rate']} />
                        <Bar dataKey="adoption" fill="#48bb78" radius={[0, 4, 4, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </motion.div>

            {/* Critical Hotspots */}
            <motion.div
                className="chart-container"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
            >
                <h3 className="chart-title" style={{ color: '#c53030' }}>
                    <AlertTriangle size={20} style={{ marginRight: 8 }} />
                    Critical Hotspots - States Requiring Immediate Attention
                </h3>
                <p className="chart-subtitle">States with 0% Aadhaar-based PDS transactions - Infrastructure or policy intervention required</p>

                <div className="insights-grid" style={{ marginTop: '1rem' }}>
                    {criticalStates.map((state, index) => (
                        <motion.div
                            key={state.state}
                            className="insight-card"
                            style={{ background: '#fff5f5', borderLeft: '4px solid #c53030' }}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * index }}
                        >
                            <MapPin size={24} color="#c53030" />
                            <div>
                                <strong>{state.state}</strong>
                                <p>Current adoption: <strong style={{ color: '#c53030' }}>0%</strong></p>
                                <p style={{ fontSize: '0.85rem', marginTop: 4 }}>
                                    Priority status: <span className="status-badge risk-high">Critical</span>
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Improvement Zone */}
            <motion.div
                className="chart-container"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
            >
                <h3 className="chart-title" style={{ color: '#f69320' }}>
                    <Globe size={20} style={{ marginRight: 8 }} />
                    Improvement Zone - States with Growth Potential
                </h3>
                <p className="chart-subtitle">States with partial adoption showing room for improvement</p>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={improvementStates} layout="vertical" margin={{ top: 10, right: 30, left: 120, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                        <XAxis type="number" domain={[0, 100]} unit="%" />
                        <YAxis type="category" dataKey="state" tick={{ fontSize: 11 }} width={110} />
                        <Tooltip formatter={(value: number) => [`${value}%`, 'Adoption Rate']} />
                        <Bar dataKey="adoption" radius={[0, 4, 4, 0]}>
                            {improvementStates.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={getBarColor(entry.category)} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </motion.div>
        </div>
    );
};

export default PDSHotspots;
