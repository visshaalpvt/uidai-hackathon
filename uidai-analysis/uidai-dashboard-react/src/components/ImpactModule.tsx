import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';

interface ImpactModuleProps {
    title: string;
    datasetName: string;
    trendDirection: string;
    projectionPeriod: string; // e.g., "3 Months"
    projectedValue: number;
    impactMetricLabel: string;
    impactPredictionText: string;
    riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
    disclaimer?: string;
}

const ImpactModule: React.FC<ImpactModuleProps> = ({
    title,
    datasetName,
    trendDirection,
    projectionPeriod,
    projectedValue,
    impactMetricLabel,
    impactPredictionText,
    riskLevel,
    disclaimer = "Trend-based estimation only. Not a guaranteed prediction."
}) => {
    const getRiskColor = (level: string) => ({
        Critical: '#c53030', High: '#f56565', Medium: '#ed8936', Low: '#48bb78'
    }[level] || '#48bb78');

    const color = getRiskColor(riskLevel);

    const TrendIcon = trendDirection.includes('Rising') ? TrendingUp :
        trendDirection.includes('Declining') ? TrendingDown : Minus;

    return (
        <motion.div
            className="impact-module-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
                background: 'white',
                borderRadius: '12px',
                padding: '1.5rem',
                borderLeft: `5px solid ${color}`,
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                marginBottom: '2rem'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#2d3748', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <AlertTriangle size={20} color={color} />
                        {title}
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: '#718096' }}>Based on {datasetName} Trends</p>
                </div>
                <span className="badge" style={{
                    background: `${color}20`,
                    color: color,
                    border: `1px solid ${color}`,
                    fontSize: '0.8rem',
                    padding: '4px 12px'
                }}>
                    {riskLevel} Risk
                </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ background: '#f7fafc', padding: '1rem', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#718096', textTransform: 'uppercase', fontWeight: 600 }}>Current Trend</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#2d3748', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <TrendIcon size={18} />
                        {trendDirection}
                    </div>
                </div>
                <div style={{ background: '#f7fafc', padding: '1rem', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#718096', textTransform: 'uppercase', fontWeight: 600 }}>Projection ({projectionPeriod})</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: color, marginTop: '4px' }}>
                        {projectedValue.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#718096' }}>{impactMetricLabel}</div>
                </div>
            </div>

            <div style={{ background: `${color}10`, padding: '1rem', borderRadius: '8px', border: `1px dashed ${color}50` }}>
                <strong style={{ color: color, fontSize: '0.9rem', display: 'block', marginBottom: '4px' }}>Potential Impact Scenario:</strong>
                <p style={{ fontSize: '0.9rem', color: '#4a5568', margin: 0, lineHeight: 1.5 }}>
                    "{impactPredictionText}"
                </p>
            </div>

            <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#a0aec0' }}>
                <Info size={14} />
                {disclaimer}
            </div>
        </motion.div>
    );
};

export default ImpactModule;
