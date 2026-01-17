import React, { useEffect, useState } from 'react';
import { Lightbulb, TrendingUp, AlertTriangle, Target, Award, Users, BookOpen, CheckCircle, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';
import Papa from 'papaparse';

interface StateData {
    state: string;
    totalCards: number;
    seededCards: number;
    seedingRate: number;
    coverageGap: number;
}

const RationSeedingInsights: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [states, setStates] = useState<StateData[]>([]);
    const [stats, setStats] = useState({
        total: 0,
        avgSeeding: 0,
        nationalRate: 0,
        fullSeeding: 0,
        zeroSeeding: 0,
        totalCards: 0,
        totalSeeded: 0,
        totalUnseeded: 0
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/data/aadhar_ration_seeding.csv');
                const text = await response.text();

                Papa.parse(text, {
                    header: true,
                    complete: (results) => {
                        const data = results.data as any[];
                        const total = data.find(d => d['State/UTs'] === 'Total');
                        const validData = data.filter(d =>
                            d['State/UTs'] &&
                            d['State/UTs'].trim() !== '' &&
                            d['State/UTs'] !== 'Total'
                        );

                        const processed: StateData[] = validData.map(d => ({
                            state: d['State/UTs'],
                            totalCards: parseInt(d['Total Ration Cards']?.replace(/,/g, '') || '0', 10),
                            seededCards: parseInt(d['No. of Ration Cards Seeded']?.replace(/,/g, '') || '0', 10),
                            seedingRate: parseInt(d['Seeding@ (%)'] || '0', 10),
                            coverageGap: 100 - parseInt(d['Seeding@ (%)'] || '0', 10)
                        }));

                        const totalCards = total ? parseInt(total['Total Ration Cards']?.replace(/,/g, '') || '0', 10) : 0;
                        const totalSeeded = total ? parseInt(total['No. of Ration Cards Seeded']?.replace(/,/g, '') || '0', 10) : 0;
                        const nationalRate = total ? parseInt(total['Seeding@ (%)'] || '0', 10) : 0;
                        const avg = processed.reduce((a, s) => a + s.seedingRate, 0) / processed.length;

                        setStates(processed);
                        setStats({
                            total: processed.length,
                            avgSeeding: avg,
                            nationalRate,
                            fullSeeding: processed.filter(s => s.seedingRate >= 100).length,
                            zeroSeeding: processed.filter(s => s.seedingRate === 0).length,
                            totalCards,
                            totalSeeded,
                            totalUnseeded: totalCards - totalSeeded
                        });
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
                <p>Generating Insights...</p>
            </div>
        );
    }

    const formatNumber = (num: number) => num.toLocaleString('en-IN');

    const topPerformers = states.filter(s => s.seedingRate >= 100).map(s => s.state);
    const zeroStates = states.filter(s => s.seedingRate === 0).map(s => s.state);
    const lowStates = states.filter(s => s.seedingRate > 0 && s.seedingRate < 50).sort((a, b) => a.seedingRate - b.seedingRate);
    const highVolumeGaps = states
        .filter(s => s.coverageGap > 0)
        .sort((a, b) => (b.totalCards - b.seededCards) - (a.totalCards - a.seededCards))
        .slice(0, 5);

    return (
        <div className="ration-insights">
            {/* Executive Summary */}
            <motion.div
                className="executive-summary"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <h2 className="section-title">
                    <BookOpen size={24} /> Executive Summary
                </h2>
                <div className="summary-grid">
                    <div className="summary-item">
                        <CreditCard size={28} />
                        <div>
                            <strong>{formatNumber(stats.totalCards)}</strong>
                            <span>Total Ration Cards</span>
                        </div>
                    </div>
                    <div className="summary-item">
                        <TrendingUp size={28} />
                        <div>
                            <strong>{stats.nationalRate}%</strong>
                            <span>National Seeding Rate</span>
                        </div>
                    </div>
                    <div className="summary-item">
                        <Award size={28} />
                        <div>
                            <strong>{stats.fullSeeding}</strong>
                            <span>100% Seeded States</span>
                        </div>
                    </div>
                    <div className="summary-item">
                        <AlertTriangle size={28} />
                        <div>
                            <strong>{formatNumber(stats.totalUnseeded)}</strong>
                            <span>Unseeded Cards</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Key Insights */}
            <div className="insights-section">
                <h3 className="section-title">
                    <Lightbulb size={20} /> Key Insights
                </h3>

                <div className="insights-list">
                    <motion.div
                        className="insight-card priority-high"
                        style={{ borderLeftColor: '#48bb78' }}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="insight-header">
                            <div className="insight-icon"><CheckCircle size={20} color="#48bb78" /></div>
                            <div className="insight-meta">
                                <span className="insight-category">SUCCESS STORY</span>
                                <span className="priority-badge low">Positive</span>
                            </div>
                        </div>
                        <h4 className="insight-title">Strong Aadhaar-Ration Card Integration</h4>
                        <p className="insight-description">
                            <strong>{topPerformers.length} states</strong> have achieved 100% Aadhaar seeding with ration cards: {topPerformers.slice(0, 6).join(', ')}{topPerformers.length > 6 ? ` and ${topPerformers.length - 6} more` : ''}. These states are fully equipped for Aadhaar-authenticated PDS delivery.
                        </p>
                    </motion.div>

                    <motion.div
                        className="insight-card priority-high"
                        style={{ borderLeftColor: '#c53030' }}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="insight-header">
                            <div className="insight-icon"><AlertTriangle size={20} color="#c53030" /></div>
                            <div className="insight-meta">
                                <span className="insight-category">CRITICAL CONCERN</span>
                                <span className="priority-badge high">Priority</span>
                            </div>
                        </div>
                        <h4 className="insight-title">States with Zero Aadhaar Seeding</h4>
                        <p className="insight-description">
                            <strong>{zeroStates.length} states</strong> ({zeroStates.join(', ')}) show 0% seeding, meaning no ration cards are linked with Aadhaar. This may indicate systemic barriers in implementation or data infrastructure.
                        </p>
                    </motion.div>

                    <motion.div
                        className="insight-card priority-medium"
                        style={{ borderLeftColor: '#f69320' }}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <div className="insight-header">
                            <div className="insight-icon"><Target size={20} color="#f69320" /></div>
                            <div className="insight-meta">
                                <span className="insight-category">HIGH VOLUME GAPS</span>
                                <span className="priority-badge medium">Impact Analysis</span>
                            </div>
                        </div>
                        <h4 className="insight-title">States with Largest Unseeded Card Volumes</h4>
                        <p className="insight-description">
                            States with the highest absolute number of unseeded cards: {highVolumeGaps.map(s => `${s.state} (${formatNumber(s.totalCards - s.seededCards)} cards)`).join(', ')}. These represent significant beneficiary populations without Aadhaar linkage.
                        </p>
                    </motion.div>

                    <motion.div
                        className="insight-card priority-low"
                        style={{ borderLeftColor: '#667eea' }}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <div className="insight-header">
                            <div className="insight-icon"><Users size={20} color="#667eea" /></div>
                            <div className="insight-meta">
                                <span className="insight-category">COVERAGE ANALYSIS</span>
                                <span className="priority-badge low">Observation</span>
                            </div>
                        </div>
                        <h4 className="insight-title">Regional Pattern in Low-Seeding States</h4>
                        <p className="insight-description">
                            Most states with low seeding rates are in the North-East: {lowStates.map(s => `${s.state} (${s.seedingRate}%)`).slice(0, 4).join(', ')}. This suggests region-specific challenges in infrastructure, connectivity, or implementation capacity.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Policy Recommendations */}
            <div className="policy-section">
                <h3 className="section-title">
                    <Target size={20} /> Policy Recommendations
                </h3>
                <p className="section-subtitle">Evidence-based recommendations for improving Aadhaar-ration card seeding coverage:</p>

                <div className="policy-cards">
                    <motion.div
                        className="policy-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <div className="policy-number">1</div>
                        <div className="policy-content">
                            <h4>Priority Focus on Zero-Seeding States</h4>
                            <p>Conduct root cause analysis in Assam and Meghalaya to identify barriers preventing Aadhaar seeding initiation. Consider special task forces for accelerated implementation.</p>
                        </div>
                    </motion.div>

                    <motion.div
                        className="policy-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                    >
                        <div className="policy-number">2</div>
                        <div className="policy-content">
                            <h4>High-Impact Volume Focus</h4>
                            <p>Prioritize large-population states like West Bengal (22M+ unseeded) and Uttar Pradesh (4.8M+) given the absolute beneficiary impact of closing coverage gaps.</p>
                        </div>
                    </motion.div>

                    <motion.div
                        className="policy-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                    >
                        <div className="policy-number">3</div>
                        <div className="policy-content">
                            <h4>North-East Region Strategy</h4>
                            <p>Develop a dedicated North-East seeding acceleration program addressing unique challenges in terrain, connectivity, and population documentation in the region.</p>
                        </div>
                    </motion.div>

                    <motion.div
                        className="policy-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9 }}
                    >
                        <div className="policy-number">4</div>
                        <div className="policy-content">
                            <h4>Best Practice Documentation</h4>
                            <p>Document successful strategies from 100%-seeding states (Andhra Pradesh, Tamil Nadu, etc.) for replication in lagging states.</p>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Data Limitations */}
            <motion.div
                className="info-banner"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
            >
                <AlertTriangle size={24} />
                <div>
                    <strong>Data Limitations &amp; Assumptions</strong>
                    <p>This analysis is based on cross-sectional data. Seeding percentages are as reported and may have rounding adjustments. For some states seeding &gt;100% may indicate data update timing or methodological differences. Historical trend analysis requires multi-year data.</p>
                </div>
            </motion.div>
        </div>
    );
};

export default RationSeedingInsights;
