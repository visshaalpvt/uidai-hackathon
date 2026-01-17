import React from 'react';
import { Database, Filter, Calculator, BarChart2, AlertOctagon, ArrowRight } from 'lucide-react';

const PipelineBox = ({ icon: Icon, title, desc, step }: { icon: any, title: string, desc: string, step: number }) => (
    <div style={{
        background: 'white',
        padding: '1.5rem',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
        position: 'relative',
        borderLeft: '4px solid #1a3672'
    }}>
        <div style={{ position: 'absolute', top: -10, right: -10, background: '#1a3672', color: 'white', width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
            {step}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ background: '#e2e8f0', padding: '10px', borderRadius: '8px' }}>
                <Icon size={24} color="#1a3672" />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{title}</h3>
        </div>
        <p style={{ color: '#718096', fontSize: '0.9rem', lineHeight: 1.6 }}>{desc}</p>
    </div>
);

const Pipeline: React.FC = () => {
    return (
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#1a3672', marginBottom: '1rem' }}>
                    Data Processing Pipeline
                </h2>
                <p style={{ color: '#718096', maxWidth: 600, margin: '0 auto' }}>
                    Our system processes raw enrolment data through a graphical 5-stage pipeline to transform raw numbers into actionable intelligence.
                </p>
            </div>

            <div style={{ display: 'grid', gap: '2rem', position: 'relative' }}>
                <div style={{
                    position: 'absolute',
                    left: '50%',
                    top: 0,
                    bottom: 0,
                    width: 4,
                    background: '#e2e8f0',
                    transform: 'translateX(-50%)',
                    zIndex: -1
                }} />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'center' }}>
                    <PipelineBox
                        step={1}
                        icon={Database}
                        title="Load & Clean"
                        desc="Ingests raw data (enrolment.csv), handles missing values, standardizes column names, and converts dates."
                    />
                    <div /> {/* Spacer */}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'center' }}>
                    <div /> {/* Spacer */}
                    <PipelineBox
                        step={2}
                        icon={Filter}
                        title="Aggregation"
                        desc="Merges multiple data sources and aggregates records by Pincode, District, and Month for granular analysis."
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'center' }}>
                    <PipelineBox
                        step={3}
                        icon={Calculator}
                        title="Feature Engineering"
                        desc="Calculates Rolling Averages (3-month), Month-over-Month Growth %, and Market Share metrics."
                    />
                    <div /> {/* Spacer */}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'center' }}>
                    <div /> {/* Spacer */}
                    <PipelineBox
                        step={4}
                        icon={BarChart2}
                        title="Analysis Visualization"
                        desc="Generates Univariate (trends), Bivariate (correlations), and Trivariate (multidimensional) plots."
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'center' }}>
                    <PipelineBox
                        step={5}
                        icon={AlertOctagon}
                        title="ML Anomaly Detection"
                        desc="Applies Isolation Forest (Unsupervised Learning) and Z-Score statistics to flag high-risk anomalies."
                    />
                    <div /> {/* Spacer */}
                </div>
            </div>
        </div>
    );
};

export default Pipeline;
