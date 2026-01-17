import React, { useEffect, useState } from 'react';
import { Lightbulb, TrendingUp, AlertTriangle, Target, Award, Users, BookOpen, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Papa from 'papaparse';

interface StateData {
    state: string;
    adoption: number;
    category: string;
}

const PDSInsights: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [states, setStates] = useState<StateData[]>([]);
    const [stats, setStats] = useState({
        total: 0,
        avgAdoption: 0,
        fullAdoption: 0,
        zeroAdoption: 0,
        highPerformers: 0,
        needsAttention: 0
    });

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

                        const processed: StateData[] = validData
                            .filter(d => d['% Aadhaar based PDS transactions in June 2021'] !== 'NA')
                            .map(d => {
                                const adoption = parseInt(d['% Aadhaar based PDS transactions in June 2021'], 10);
                                let category = 'Low';
                                if (adoption >= 90) category = 'High';
                                else if (adoption >= 50) category = 'Medium';
                                else if (adoption === 0) category = 'Critical';

                                return { state: d['State/UT'], adoption, category };
                            });

                        const avg = processed.reduce((a, s) => a + s.adoption, 0) / processed.length;

                        setStates(processed);
                        setStats({
                            total: processed.length,
                            avgAdoption: avg,
                            fullAdoption: processed.filter(s => s.adoption === 100).length,
                            zeroAdoption: processed.filter(s => s.adoption === 0).length,
                            highPerformers: processed.filter(s => s.category === 'High').length,
                            needsAttention: processed.filter(s => s.category === 'Critical' || s.category === 'Low').length
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

    const topPerformers = states.filter(s => s.adoption === 100).map(s => s.state);
    const criticalStates = states.filter(s => s.adoption === 0).map(s => s.state);
    const improvementStates = states.filter(s => s.adoption > 0 && s.adoption < 50).sort((a, b) => b.adoption - a.adoption);

    return (
        <div className="pds-insights">
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
                        <Users size={28} />
                        <div>
                            <strong>{stats.total}</strong>
                            <span>States/UTs Analyzed</span>
                        </div>
                    </div>
                    <div className="summary-item">
                        <TrendingUp size={28} />
                        <div>
                            <strong>{stats.avgAdoption.toFixed(1)}%</strong>
                            <span>National Average</span>
                        </div>
                    </div>
                    <div className="summary-item">
                        <Award size={28} />
                        <div>
                            <strong>{stats.fullAdoption}</strong>
                            <span>100% Adoption</span>
                        </div>
                    </div>
                    <div className="summary-item">
                        <AlertTriangle size={28} />
                        <div>
                            <strong>{stats.zeroAdoption}</strong>
                            <span>Zero Adoption</span>
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
                        <h4 className="insight-title">Strong Adoption in Key States</h4>
                        <p className="insight-description">
                            <strong>{topPerformers.length} states</strong> have achieved 100% Aadhaar-based PDS transactions: {topPerformers.slice(0, 5).join(', ')}{topPerformers.length > 5 ? ` and ${topPerformers.length - 5} more` : ''}. These states can serve as models for best practices in digital PDS implementation.
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
                        <h4 className="insight-title">States with Zero Digital PDS Adoption</h4>
                        <p className="insight-description">
                            <strong>{criticalStates.length} states</strong> show 0% Aadhaar-based transactions: {criticalStates.join(', ')}. This indicates potential challenges with infrastructure readiness, policy implementation, or biometric device availability.
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
                            <div className="insight-icon"><TrendingUp size={20} color="#f69320" /></div>
                            <div className="insight-meta">
                                <span className="insight-category">OPPORTUNITY</span>
                                <span className="priority-badge medium">Action Needed</span>
                            </div>
                        </div>
                        <h4 className="insight-title">States with Growth Potential</h4>
                        <p className="insight-description">
                            <strong>{improvementStates.length} states</strong> have partial adoption (1-49%): {improvementStates.map(s => `${s.state} (${s.adoption}%)`).join(', ')}. Targeted interventions could significantly improve national averages.
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
                            <div className="insight-icon"><Target size={20} color="#667eea" /></div>
                            <div className="insight-meta">
                                <span className="insight-category">TREND</span>
                                <span className="priority-badge low">Observation</span>
                            </div>
                        </div>
                        <h4 className="insight-title">Regional Disparity Pattern</h4>
                        <p className="insight-description">
                            There is a 100% spread between best and worst performing states. Southern and Western states generally show higher adoption rates, while North-Eastern and some Northern states lag behind.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Policy Recommendations */}
            <div className="policy-section">
                <h3 className="section-title">
                    <Target size={20} /> Policy Recommendations
                </h3>
                <p className="section-subtitle">Based on the analysis, the following evidence-based recommendations are suggested:</p>

                <div className="policy-cards">
                    <motion.div
                        className="policy-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <div className="policy-number">1</div>
                        <div className="policy-content">
                            <h4>Infrastructure Gap Assessment</h4>
                            <p>Conduct infrastructure audits in zero-adoption states to identify biometric device shortages, connectivity issues, or power supply challenges affecting PDS digitization.</p>
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
                            <h4>Best Practice Sharing</h4>
                            <p>Establish knowledge transfer programs between high-performing states (like Andhra Pradesh, Maharashtra, Telangana) and states requiring improvement.</p>
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
                            <h4>Targeted Intervention Programs</h4>
                            <p>Prioritize capacity building and awareness campaigns in states with low adoption (1-49%) to accelerate digital transformation in PDS operations.</p>
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
                            <h4>Regional Focus Approach</h4>
                            <p>Develop region-specific strategies considering unique challenges in North-Eastern states, including terrain difficulties and connectivity limitations.</p>
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
                    <strong>Data Limitations & Assumptions</strong>
                    <p>This analysis is based on a single snapshot from June 2021. For comprehensive trend analysis and forecasting, historical time-series data would be required. "NA" values indicate data unavailability for certain states/UTs and have been excluded from statistical calculations.</p>
                </div>
            </motion.div>
        </div>
    );
};

export default PDSInsights;
