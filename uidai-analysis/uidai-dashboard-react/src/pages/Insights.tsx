import React from 'react';
import { Target, TrendingUp, ShieldAlert, Cpu, ArrowRight } from 'lucide-react';

const InsightCard = ({ icon: Icon, title, stat, desc, color }: { icon: any, title: string, stat: string, desc: string, color: string }) => (
    <div style={{
        background: 'white',
        padding: '1.5rem',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        borderTop: `4px solid ${color}`,
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
    }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{ background: `${color}15`, padding: '10px', borderRadius: '12px' }}>
                <Icon size={24} color={color} />
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: color, background: `${color}10`, padding: '4px 8px', borderRadius: '4px' }}>
                Verified
            </span>
        </div>

        <h3 style={{ fontSize: '1rem', color: '#64748b', fontWeight: 600, marginBottom: '0.5rem' }}>{title}</h3>
        <div style={{ fontSize: '2rem', fontWeight: 700, color: '#1e293b', marginBottom: '1rem' }}>{stat}</div>
        <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.6, flex: 1 }}>{desc}</p>
    </div>
);

const RecommendationRow = ({ title, action }: { title: string, action: string }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px', marginBottom: '10px' }}>
        <div style={{ background: '#3b82f6', width: '8px', height: '8px', borderRadius: '50%' }}></div>
        <div style={{ flex: 1 }}>
            <span style={{ fontWeight: 600, color: '#1e293b', display: 'block' }}>{title}</span>
            <span style={{ color: '#64748b', fontSize: '0.9rem' }}>{action}</span>
        </div>
        <ArrowRight size={16} color="#94a3b8" />
    </div>
);

const Insights: React.FC = () => {
    return (
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#0f172a' }}>System Intelligence Report</h2>
                <p style={{ color: '#64748b' }}>Automated analysis summary of 3,967 enrolment records.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <InsightCard
                    icon={Target}
                    title="Geographic Concentration"
                    stat="90/25 Rule"
                    desc="90% of total enrolment volume is concentrated in just 25% of pincodes. Resource allocation should be highly targeted rather than uniform."
                    color="#3b82f6"
                />
                <InsightCard
                    icon={TrendingUp}
                    title="Seasonal Peaks"
                    stat="Sep & Nov"
                    desc="Data confirms consistent demand spikes post-monsoon. Operations must scale capacity by 40% during Q3 to prevent backlogs."
                    color="#f59e0b"
                />
                <InsightCard
                    icon={Cpu}
                    title="Forecast Accuracy"
                    stat="85% +-"
                    desc="The 3-month rolling average model (SMA-3) is performing with a 15% Error Margin, reliable enough for 60-day inventory planning."
                    color="#10b981"
                />
            </div>

            <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                    <ShieldAlert color="#ef4444" />
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>AI Recommended Actions</h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem' }}>
                    <RecommendationRow
                        title="Targeted Deployment"
                        action="Deploy mobile enrolment units specifically to the 22 'High Risk' hotspots identified."
                    />
                    <RecommendationRow
                        title="Staff Augmentation"
                        action="Increase operator count by 20% in Red Zone districts for the next 30 days."
                    />
                    <RecommendationRow
                        title="Performance Monitoring"
                        action="Switch to weekly reviews due to high volatility detected in Q4 projections."
                    />
                </div>
            </div>
        </div>
    );
};

export default Insights;
