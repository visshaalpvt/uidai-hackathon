import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
import { Lightbulb, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Users, MapPin, Activity, ArrowRight, Target } from 'lucide-react';
import { motion } from 'framer-motion';

interface BiometricRecord {
    date: string; state: string; district: string; pincode: string;
    bio_age_5_17: number; bio_age_17_: number;
}

interface InsightItem {
    id: string; category: 'trend' | 'risk' | 'opportunity' | 'recommendation';
    title: string; description: string; metric?: string; priority: 'high' | 'medium' | 'low';
}

const BiometricInsights: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [insights, setInsights] = useState<InsightItem[]>([]);
    const [crossDatasetInsights, setCrossDatasetInsights] = useState<InsightItem[]>([]);
    const [summaryStats, setSummaryStats] = useState({
        totalUpdates: 0, avgMonthly: 0, topState: '', topDistrict: '',
        youthPct: 0, adultPct: 0, momGrowth: 0
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/data/biometric.csv');
                const text = await response.text();

                Papa.parse(text, {
                    header: true, dynamicTyping: true,
                    complete: (results) => {
                        const data = results.data as BiometricRecord[];
                        const validData = data.filter(d => d.date && d.pincode);

                        // Aggregate data
                        const monthlyAgg: { [key: string]: { total: number; age5to17: number; age17plus: number } } = {};
                        const stateAgg: { [key: string]: number } = {};
                        const districtAgg: { [key: string]: { total: number; state: string } } = {};
                        const pincodeFailure: { [key: string]: { low: number; total: number; district: string } } = {};

                        let totalAge5to17 = 0, totalAge17plus = 0;

                        validData.forEach(record => {
                            const dateParts = record.date.split('-');
                            const monthKey = `${dateParts[2]}-${dateParts[1].padStart(2, '0')}`;
                            const age5to17 = record.bio_age_5_17 || 0;
                            const age17plus = record.bio_age_17_ || 0;
                            const total = age5to17 + age17plus;

                            if (!monthlyAgg[monthKey]) monthlyAgg[monthKey] = { total: 0, age5to17: 0, age17plus: 0 };
                            monthlyAgg[monthKey].total += total;
                            monthlyAgg[monthKey].age5to17 += age5to17;
                            monthlyAgg[monthKey].age17plus += age17plus;

                            if (!stateAgg[record.state]) stateAgg[record.state] = 0;
                            stateAgg[record.state] += total;

                            if (!districtAgg[record.district]) districtAgg[record.district] = { total: 0, state: record.state };
                            districtAgg[record.district].total += total;

                            if (!pincodeFailure[record.pincode]) pincodeFailure[record.pincode] = { low: 0, total: 0, district: record.district };
                            pincodeFailure[record.pincode].total += total;
                            if (total < 5) pincodeFailure[record.pincode].low++;

                            totalAge5to17 += age5to17;
                            totalAge17plus += age17plus;
                        });

                        const totalUpdates = totalAge5to17 + totalAge17plus;
                        const sortedMonths = Object.keys(monthlyAgg).sort();
                        const avgMonthly = sortedMonths.length > 0 ? totalUpdates / sortedMonths.length : 0;

                        const topState = Object.entries(stateAgg).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
                        const topDistrict = Object.entries(districtAgg).sort((a, b) => b[1].total - a[1].total)[0]?.[0] || 'N/A';

                        const youthPct = totalUpdates > 0 ? (totalAge5to17 / totalUpdates) * 100 : 0;
                        const adultPct = totalUpdates > 0 ? (totalAge17plus / totalUpdates) * 100 : 0;

                        // Calculate MoM growth
                        let momGrowth = 0;
                        if (sortedMonths.length >= 2) {
                            const last = monthlyAgg[sortedMonths[sortedMonths.length - 1]].total;
                            const prev = monthlyAgg[sortedMonths[sortedMonths.length - 2]].total;
                            momGrowth = prev > 0 ? ((last - prev) / prev) * 100 : 0;
                        }

                        setSummaryStats({ totalUpdates, avgMonthly, topState, topDistrict, youthPct, adultPct, momGrowth });

                        // Generate insights
                        const generatedInsights: InsightItem[] = [];

                        // Trend insights
                        if (momGrowth > 20) {
                            generatedInsights.push({
                                id: 'trend-1', category: 'trend', priority: 'high',
                                title: 'Sharp Increase in Biometric Updates',
                                description: `Biometric updates increased by ${momGrowth.toFixed(1)}% in the latest month. This surge may indicate a campaign or policy-driven push for biometric renewals.`,
                                metric: `+${momGrowth.toFixed(1)}% MoM`
                            });
                        } else if (momGrowth < -20) {
                            generatedInsights.push({
                                id: 'trend-2', category: 'risk', priority: 'high',
                                title: 'Significant Drop in Biometric Activity',
                                description: `Biometric updates dropped by ${Math.abs(momGrowth).toFixed(1)}% in the latest month. Investigate potential causes: seasonal factors, infrastructure issues, or staffing gaps.`,
                                metric: `${momGrowth.toFixed(1)}% MoM`
                            });
                        }

                        // Age distribution insights
                        if (youthPct < 30) {
                            generatedInsights.push({
                                id: 'age-1', category: 'opportunity', priority: 'medium',
                                title: 'Low Youth Biometric Engagement',
                                description: `Only ${youthPct.toFixed(1)}% of biometric updates are from the 5-17 age group. Consider school-based campaigns to increase youth biometric renewals.`,
                                metric: `${youthPct.toFixed(1)}% youth share`
                            });
                        }

                        // High failure locations
                        const highFailureDistricts = Object.entries(pincodeFailure)
                            .filter(([_, data]) => data.total > 0 && (data.low / data.total) > 0.4)
                            .map(([pincode, data]) => ({ pincode, district: data.district, rate: (data.low / data.total) * 100 }))
                            .sort((a, b) => b.rate - a.rate);

                        if (highFailureDistricts.length > 0) {
                            const topFailure = highFailureDistricts[0];
                            generatedInsights.push({
                                id: 'failure-1', category: 'risk', priority: 'high',
                                title: `High Failure Indicators in ${topFailure.district}`,
                                description: `Pincode ${topFailure.pincode} shows ${topFailure.rate.toFixed(1)}% of records with low/zero updates. This may indicate device issues or operator training gaps.`,
                                metric: `${topFailure.rate.toFixed(1)}% failure rate`
                            });
                        }

                        // Top performing region
                        generatedInsights.push({
                            id: 'perf-1', category: 'trend', priority: 'low',
                            title: `${topDistrict} Leads in Biometric Activity`,
                            description: `${topDistrict} district in ${topState} has the highest biometric update volume. Consider this as a model location for best practices.`,
                            metric: `#1 District`
                        });

                        // Recommendations
                        generatedInsights.push({
                            id: 'rec-1', category: 'recommendation', priority: 'medium',
                            title: 'Optimize Resource Allocation',
                            description: `With ${adultPct.toFixed(1)}% of updates from adults, ensure adequate staffing during work-friendly hours (evenings, weekends) in high-traffic districts.`
                        });

                        generatedInsights.push({
                            id: 'rec-2', category: 'recommendation', priority: 'high',
                            title: 'Proactive Equipment Maintenance',
                            description: `Schedule quarterly diagnostic checks for biometric capture devices, especially in locations showing persistent low-update patterns.`
                        });

                        setInsights(generatedInsights);

                        // Cross-dataset insights (placeholders for when enrolment data is linked)
                        setCrossDatasetInsights([
                            {
                                id: 'cross-1', category: 'risk', priority: 'high',
                                title: 'High Enrolment + High Biometric Failure = Device Alert',
                                description: 'When cross-referenced with enrolment data, locations with high new enrolments but high biometric failure rates may indicate device calibration issues or operator fatigue.'
                            },
                            {
                                id: 'cross-2', category: 'opportunity', priority: 'medium',
                                title: 'Enrolment Surge Zones Need Biometric Capacity',
                                description: 'Areas with recent enrolment spikes will likely need biometric updates in 5-7 years. Plan capacity expansion accordingly.'
                            }
                        ]);

                        setLoading(false);
                    }
                });
            } catch (error) { console.error('Error:', error); setLoading(false); }
        };
        fetchData();
    }, []);

    const formatNumber = (num: number) => num.toLocaleString('en-IN');

    const getIcon = (category: string) => {
        switch (category) {
            case 'trend': return <TrendingUp size={20} />;
            case 'risk': return <AlertTriangle size={20} />;
            case 'opportunity': return <Target size={20} />;
            case 'recommendation': return <CheckCircle size={20} />;
            default: return <Lightbulb size={20} />;
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'trend': return '#1a3672';
            case 'risk': return '#f56565';
            case 'opportunity': return '#48bb78';
            case 'recommendation': return '#667eea';
            default: return '#718096';
        }
    };

    if (loading) return <div className="loading-container"><div className="loading-spinner"></div><p>Generating Insights...</p></div>;

    return (
        <div className="biometric-insights-container">
            {/* Executive Summary */}
            <motion.div className="executive-summary" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <h3 className="section-title"><Lightbulb size={24} /> Executive Summary</h3>
                <div className="summary-grid">
                    <div className="summary-item">
                        <Activity size={20} color="#1a3672" />
                        <div><strong>{formatNumber(summaryStats.totalUpdates)}</strong><span>Total Biometric Updates</span></div>
                    </div>
                    <div className="summary-item">
                        <TrendingUp size={20} color={summaryStats.momGrowth >= 0 ? '#48bb78' : '#f56565'} />
                        <div><strong>{summaryStats.momGrowth >= 0 ? '+' : ''}{summaryStats.momGrowth.toFixed(1)}%</strong><span>Latest MoM Growth</span></div>
                    </div>
                    <div className="summary-item">
                        <Users size={20} color="#667eea" />
                        <div><strong>{summaryStats.adultPct.toFixed(1)}%</strong><span>Adult Updates (17+)</span></div>
                    </div>
                    <div className="summary-item">
                        <MapPin size={20} color="#f69320" />
                        <div><strong>{summaryStats.topDistrict}</strong><span>Top Activity District</span></div>
                    </div>
                </div>
            </motion.div>

            {/* Key Insights */}
            <motion.div className="insights-section" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                <h3 className="section-title">Key Insights & Findings</h3>
                <div className="insights-list">
                    {insights.map((insight, idx) => (
                        <motion.div
                            key={insight.id}
                            className={`insight-card priority-${insight.priority}`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * idx }}
                            style={{ borderLeftColor: getCategoryColor(insight.category) }}
                        >
                            <div className="insight-header">
                                <div className="insight-icon" style={{ color: getCategoryColor(insight.category) }}>
                                    {getIcon(insight.category)}
                                </div>
                                <div className="insight-meta">
                                    <span className="insight-category">{insight.category.toUpperCase()}</span>
                                    <span className={`priority-badge ${insight.priority}`}>{insight.priority}</span>
                                </div>
                            </div>
                            <h4 className="insight-title">{insight.title}</h4>
                            <p className="insight-description">{insight.description}</p>
                            {insight.metric && <div className="insight-metric"><ArrowRight size={14} /> {insight.metric}</div>}
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Cross-Dataset Insights */}
            <motion.div className="cross-insights-section" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                <h3 className="section-title">Cross-Dataset Intelligence (Future Integration)</h3>
                <p className="section-subtitle">These insights will be automatically generated when biometric data is linked with enrolment data.</p>
                <div className="cross-insights-list">
                    {crossDatasetInsights.map((insight, idx) => (
                        <div key={insight.id} className="cross-insight-card">
                            <div className="cross-insight-icon" style={{ color: getCategoryColor(insight.category) }}>
                                {getIcon(insight.category)}
                            </div>
                            <div className="cross-insight-content">
                                <h4>{insight.title}</h4>
                                <p>{insight.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Policy Recommendations */}
            <motion.div className="policy-section" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                <h3 className="section-title">Policy & Operational Recommendations</h3>
                <div className="policy-cards">
                    <div className="policy-card">
                        <div className="policy-number">1</div>
                        <div className="policy-content">
                            <h4>Strengthen Device Maintenance Protocols</h4>
                            <p>Implement automated alerts when failure rates exceed 30% in any location for 2+ consecutive weeks. This enables proactive intervention before quality significantly degrades.</p>
                        </div>
                    </div>
                    <div className="policy-card">
                        <div className="policy-number">2</div>
                        <div className="policy-content">
                            <h4>Youth Outreach Programs</h4>
                            <p>Partner with schools for annual biometric refresh drives, targeting the 5-17 age group which currently constitutes only {summaryStats.youthPct.toFixed(1)}% of updates.</p>
                        </div>
                    </div>
                    <div className="policy-card">
                        <div className="policy-number">3</div>
                        <div className="policy-content">
                            <h4>Capacity Planning for Peak Periods</h4>
                            <p>Analyze seasonal patterns to pre-position resources. Deploy additional operators in {summaryStats.topState} during historically high-activity months.</p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default BiometricInsights;
