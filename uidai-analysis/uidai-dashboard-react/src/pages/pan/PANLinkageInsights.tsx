import React, { useEffect, useState } from 'react';
import { Lightbulb, TrendingUp, AlertTriangle, Target, Award, Users, BookOpen, CheckCircle, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import Papa from 'papaparse';

interface StateData {
    state: string;
    linkedPANs: number;
    sharePercent: number;
    region: string;
}

// Simple region classification
const getRegion = (state: string): string => {
    const northEast = ['Arunachal Pradesh', 'Assam', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Sikkim', 'Tripura'];
    const south = ['Andhra Pradesh', 'Karnataka', 'Kerala', 'Tamilnadu', 'Tamil Nadu', 'Telangana', 'Pondicherry', 'Lakhswadeep', 'Andaman and Nicobar Islands'];
    const north = ['Delhi', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Punjab', 'Rajasthan', 'Uttarakhand', 'Uttar Pradesh', 'Chandigarh'];
    const east = ['Bihar', 'Jharkhand', 'Odisha', 'West Bengal'];
    const west = ['Goa', 'Gujarat', 'Maharashtra', 'Dadra and Nagar Haveli', 'Daman and Diu'];
    const central = ['Chhatishgarh', 'Chhattisgarh', 'Madhya Pradesh'];

    if (northEast.includes(state)) return 'North-East';
    if (south.includes(state)) return 'South';
    if (north.includes(state)) return 'North';
    if (east.includes(state)) return 'East';
    if (west.includes(state)) return 'West';
    if (central.includes(state)) return 'Central';
    return 'Other';
};

const PANLinkageInsights: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [states, setStates] = useState<StateData[]>([]);
    const [stats, setStats] = useState({
        total: 0,
        totalLinked: 0,
        avgPerState: 0,
        topState: '',
        topStateCount: 0,
        bottomState: '',
        bottomStateCount: 0
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/data/pan_aadhaar_linkage.csv');
                const text = await response.text();
                const cleanedText = text.replace(/\r/g, '\n');

                Papa.parse(cleanedText, {
                    header: true,
                    complete: (results) => {
                        const data = results.data as any[];
                        const validData = data.filter(d =>
                            d['Residential Address State'] &&
                            d['Residential Address State'].trim() !== '' &&
                            d['Residential Address State'] !== 'Foreign'
                        );

                        const total = validData.reduce((a, d) => a + parseInt(d['Pan Count']?.replace(/,/g, '') || '0', 10), 0);

                        const processed: StateData[] = validData.map(d => {
                            const linkedPANs = parseInt(d['Pan Count']?.replace(/,/g, '') || '0', 10);
                            return {
                                state: d['Residential Address State'],
                                linkedPANs,
                                sharePercent: (linkedPANs / total) * 100,
                                region: getRegion(d['Residential Address State'])
                            };
                        }).sort((a, b) => b.linkedPANs - a.linkedPANs);

                        setStates(processed);
                        setStats({
                            total: processed.length,
                            totalLinked: total,
                            avgPerState: total / processed.length,
                            topState: processed[0]?.state || 'N/A',
                            topStateCount: processed[0]?.linkedPANs || 0,
                            bottomState: processed[processed.length - 1]?.state || 'N/A',
                            bottomStateCount: processed[processed.length - 1]?.linkedPANs || 0
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

    const formatCrores = (num: number) => (num / 10000000).toFixed(2) + ' Cr';
    const formatNumber = (num: number) => num.toLocaleString('en-IN');

    const topStates = states.slice(0, 5);
    const bottomStates = states.slice(-5).reverse();
    const northEastStates = states.filter(s => s.region === 'North-East');
    const topRegionShare = states.slice(0, 10).reduce((a, s) => a + s.sharePercent, 0);

    return (
        <div className="pan-insights">
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
                        <FileText size={28} />
                        <div>
                            <strong>{formatCrores(stats.totalLinked)}</strong>
                            <span>Total Linked PANs</span>
                        </div>
                    </div>
                    <div className="summary-item">
                        <Users size={28} />
                        <div>
                            <strong>{stats.total}</strong>
                            <span>States/UTs Covered</span>
                        </div>
                    </div>
                    <div className="summary-item">
                        <Award size={28} />
                        <div>
                            <strong>{stats.topState}</strong>
                            <span>Highest Linkage</span>
                        </div>
                    </div>
                    <div className="summary-item">
                        <TrendingUp size={28} />
                        <div>
                            <strong>{topRegionShare.toFixed(1)}%</strong>
                            <span>Top 10 States Share</span>
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
                        style={{ borderLeftColor: '#1a3672' }}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="insight-header">
                            <div className="insight-icon"><CheckCircle size={20} color="#1a3672" /></div>
                            <div className="insight-meta">
                                <span className="insight-category">COMPLIANCE PROGRESS</span>
                                <span className="priority-badge low">National View</span>
                            </div>
                        </div>
                        <h4 className="insight-title">Strong National PAN-Aadhaar Linkage</h4>
                        <p className="insight-description">
                            A total of <strong>{formatCrores(stats.totalLinked)}</strong> PANs are linked with Aadhaar across {stats.total} States and UTs. This represents significant progress in building the Aadhaar-based financial identity infrastructure.
                        </p>
                    </motion.div>

                    <motion.div
                        className="insight-card priority-high"
                        style={{ borderLeftColor: '#48bb78' }}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="insight-header">
                            <div className="insight-icon"><Award size={20} color="#48bb78" /></div>
                            <div className="insight-meta">
                                <span className="insight-category">TOP PERFORMERS</span>
                                <span className="priority-badge low">By Volume</span>
                            </div>
                        </div>
                        <h4 className="insight-title">High-Volume States Leading Linkage</h4>
                        <p className="insight-description">
                            The top 5 states by linkage volume are: {topStates.map(s => `${s.state} (${formatCrores(s.linkedPANs)})`).join(', ')}. These states collectively account for a major share of linked PANs nationally.
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
                            <div className="insight-icon"><AlertTriangle size={20} color="#f69320" /></div>
                            <div className="insight-meta">
                                <span className="insight-category">REGIONAL PATTERN</span>
                                <span className="priority-badge medium">Observation</span>
                            </div>
                        </div>
                        <h4 className="insight-title">North-East Region Volume Pattern</h4>
                        <p className="insight-description">
                            North-Eastern states ({northEastStates.map(s => s.state).join(', ')}) show lower absolute linkage volumes. This reflects population size and economic structure rather than compliance gaps.
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
                                <span className="insight-category">CONCENTRATION</span>
                                <span className="priority-badge low">Analysis</span>
                            </div>
                        </div>
                        <h4 className="insight-title">Linkage Concentration Analysis</h4>
                        <p className="insight-description">
                            The top 10 states account for <strong>{topRegionShare.toFixed(1)}%</strong> of all linked PANs. This concentration aligns with population and economic activity distribution across India.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Policy Recommendations */}
            <div className="policy-section">
                <h3 className="section-title">
                    <Target size={20} /> Policy Observations
                </h3>
                <p className="section-subtitle">Evidence-based observations for PAN-Aadhaar linkage monitoring:</p>

                <div className="policy-cards">
                    <motion.div
                        className="policy-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <div className="policy-number">1</div>
                        <div className="policy-content">
                            <h4>Volume-Based Monitoring</h4>
                            <p>High-volume states like Maharashtra, Uttar Pradesh, and West Bengal require continued monitoring infrastructure to handle large linkage transaction volumes.</p>
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
                            <h4>Regional Accessibility Focus</h4>
                            <p>Smaller states and UTs may benefit from targeted outreach programs to ensure PAN-Aadhaar linkage awareness and service accessibility.</p>
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
                            <h4>Data Quality Monitoring</h4>
                            <p>Regular data quality audits can help maintain linkage accuracy and identify potential duplicate or erroneous entries in the PAN-Aadhaar database.</p>
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
                            <h4>Trend Analysis Requirement</h4>
                            <p>Historical data comparison is needed to assess linkage progress trends and identify states with improving or stagnating compliance rates.</p>
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
                    <p>This analysis is based on cross-sectional data as of 30-11-2023. The dataset provides absolute linkage counts only; linkage rates cannot be computed without total PAN issuance data by state. Volume comparisons may reflect population and economic differences rather than compliance behavior.</p>
                </div>
            </motion.div>
        </div>
    );
};

export default PANLinkageInsights;
