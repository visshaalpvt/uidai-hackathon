import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
import { AlertOctagon } from 'lucide-react';
import { motion } from 'framer-motion';

const AnomalyRisk: React.FC = () => {
    const [risks, setRisks] = useState<any[]>([]);

    useEffect(() => {
        fetch('/data/demographic.csv')
            .then(r => r.text())
            .then(text => {
                Papa.parse(text, {
                    header: true, dynamicTyping: true, complete: res => {
                        const valid = (res.data as any[]).filter(d => d.date);
                        // Filter for "Risk": High volume of sensitive updates (DOB + Gender)
                        const risky = valid.map(d => {
                            const sensitive = (d.update_dob || 0) + (d.update_gender || 0);
                            const ratio = d.total_updates > 0 ? (sensitive / d.total_updates) * 100 : 0;
                            return { ...d, sensitive, ratio };
                        })
                            .filter(d => d.ratio > 30 && d.total_updates > 10) // Threshold: >30% sensitive and meaningful volume
                            .sort((a, b) => b.ratio - a.ratio);

                        setRisks(risky);
                    }
                });
            });
    }, []);

    return (
        <div className="demographic-anomaly">
            <div className="section-header">
                <div>
                    <h2 className="page-title">Anomaly Detection</h2>
                    <p className="section-subtitle">Focus: Unusual spikes in Sensitive Fields (DOB, Gender)</p>
                </div>
            </div>

            <motion.div className="table-container" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Pincode</th>
                            <th>Total Updates</th>
                            <th>Sensitive (DOB+Gender)</th>
                            <th>Risk Ratio</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {risks.length > 0 ? risks.map((row, i) => (
                            <tr key={i}>
                                <td>{row.date}</td>
                                <td>{row.pincode}</td>
                                <td>{row.total_updates}</td>
                                <td>{row.sensitive}</td>
                                <td>
                                    <div className="progress-bar-container">
                                        <div className="progress-bar" style={{ width: `${Math.min(row.ratio, 100)}%`, background: '#f56565' }}></div>
                                        <span>{row.ratio.toFixed(1)}%</span>
                                    </div>
                                </td>
                                <td><span className="badge badge-high">High Risk</span></td>
                            </tr>
                        )) : (
                            <tr><td colSpan={6} style={{ textAlign: 'center', padding: 20 }}>No Significant Anomalies Detected</td></tr>
                        )}
                    </tbody>
                </table>
            </motion.div>
        </div>
    );
};

export default AnomalyRisk;
