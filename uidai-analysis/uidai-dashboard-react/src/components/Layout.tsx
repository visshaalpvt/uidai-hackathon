import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, TrendingUp, MapPin, AlertTriangle, Lightbulb, FileText,
    Fingerprint, Users, BarChart3, XCircle, AlertOctagon, Server, ShoppingBag, CreditCard, FileCheck
} from 'lucide-react';
import '../styles.css';

interface LayoutProps {
    children?: React.ReactNode;
}

// Dataset configuration
const datasets = [
    {
        id: 'enrolment',
        name: 'Aadhaar Monthly Enrolment',
        icon: Users,
        basePath: '/',
        sections: [
            { path: '/', name: 'Overview', icon: LayoutDashboard },
            { path: '/pipeline', name: 'Data Pipeline', icon: FileText },
            { path: '/trends', name: 'Trends', icon: TrendingUp },
            { path: '/hotspots', name: 'Hotspots', icon: MapPin },
            { path: '/forecast', name: 'Forecast & Risk', icon: AlertTriangle },
            { path: '/insights', name: 'Insights', icon: Lightbulb },
        ]
    },
    {
        id: 'demographic',
        name: 'Demographic Updates',
        icon: FileText,
        basePath: '/demographic',
        sections: [
            { path: '/demographic', name: 'Overview', icon: LayoutDashboard },
            { path: '/demographic/categories', name: 'Update Categories', icon: Users },
            { path: '/demographic/patterns', name: 'Change Patterns', icon: TrendingUp },
            { path: '/demographic/hotspots', name: 'Hotspots', icon: MapPin },
            { path: '/demographic/anomaly', name: 'Anomaly & Risk', icon: AlertTriangle },
            { path: '/demographic/insights', name: 'Insights', icon: Lightbulb },
        ]
    },
    {
        id: 'biometric',
        name: 'Biometric Updates',
        icon: Fingerprint,
        basePath: '/biometric',
        sections: [
            { path: '/biometric', name: 'Overview', icon: LayoutDashboard },
            { path: '/biometric/update-types', name: 'Update Types', icon: BarChart3 },
            { path: '/biometric/failure-analysis', name: 'Failure Analysis', icon: XCircle },
            { path: '/biometric/hotspots', name: 'Hotspots', icon: MapPin },
            { path: '/biometric/anomaly-risk', name: 'Anomaly & Risk', icon: AlertOctagon },
            { path: '/biometric/device-performance', name: 'Device Performance', icon: Server },
            { path: '/biometric/insights', name: 'Insights', icon: Lightbulb },
        ]
    },
    {
        id: 'receipts',
        name: 'Aadhaar Receipts (2023-24)',
        icon: BarChart3,
        basePath: '/receipts',
        sections: [
            { path: '/receipts', name: 'Overview', icon: LayoutDashboard },
            { path: '/receipts/pipeline', name: 'Conversion Pipeline', icon: FileText },
            { path: '/receipts/patterns', name: 'Distribution Patterns', icon: TrendingUp },
            { path: '/receipts/hotspots', name: 'Regional Hotspots', icon: MapPin },
            { path: '/receipts/anomalies', name: 'Anomaly & Risk', icon: AlertTriangle },
            { path: '/receipts/insights', name: 'Insights', icon: Lightbulb },
        ]
    },
    {
        id: 'pds',
        name: 'PDS Authentication',
        icon: ShoppingBag,
        basePath: '/pds',
        sections: [
            { path: '/pds', name: 'Overview', icon: LayoutDashboard },
            { path: '/pds/state-analysis', name: 'State Analysis', icon: BarChart3 },
            { path: '/pds/hotspots', name: 'Hotspots', icon: MapPin },
            { path: '/pds/anomaly-risk', name: 'Anomaly & Risk', icon: AlertTriangle },
            { path: '/pds/insights', name: 'Insights', icon: Lightbulb },
        ]
    },
    {
        id: 'ration',
        name: 'Ration Card Seeding',
        icon: CreditCard,
        basePath: '/ration',
        sections: [
            { path: '/ration', name: 'Overview', icon: LayoutDashboard },
            { path: '/ration/analysis', name: 'State Analysis', icon: BarChart3 },
            { path: '/ration/risk', name: 'Risk Assessment', icon: AlertTriangle },
            { path: '/ration/insights', name: 'Insights', icon: Lightbulb },
        ]
    },
    {
        id: 'pan',
        name: 'PAN-Aadhaar Linkage',
        icon: FileCheck,
        basePath: '/pan',
        sections: [
            { path: '/pan', name: 'Overview', icon: LayoutDashboard },
            { path: '/pan/analysis', name: 'State Analysis', icon: BarChart3 },
            { path: '/pan/insights', name: 'Insights', icon: Lightbulb },
        ]
    }
];

const Layout: React.FC<LayoutProps> = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [activeDataset, setActiveDataset] = useState<typeof datasets[0] | null>(null);
    const [title, setTitle] = useState("Overview");

    // Determine active dataset from current path
    useEffect(() => {
        const path = location.pathname;

        if (path.startsWith('/biometric')) {
            setActiveDataset(datasets[2]);
            const section = datasets[2].sections.find(s => s.path === path);
            setTitle(section?.name || 'Biometric Updates');
        } else if (path.startsWith('/demographic')) {
            setActiveDataset(datasets[1]);
            const section = datasets[1].sections.find(s => s.path === path);
            setTitle(section?.name || 'Demographic Updates');
        } else if (path.startsWith('/receipts')) {
            setActiveDataset(datasets[3]);
            const section = datasets[3].sections.find(s => s.path === path);
            setTitle(section?.name || 'Overview');
        } else if (path.startsWith('/pds')) {
            setActiveDataset(datasets[4]);
            const section = datasets[4].sections.find(s => s.path === path);
            setTitle(section?.name || 'PDS Overview');
        } else if (path.startsWith('/ration')) {
            setActiveDataset(datasets[5]);
            const section = datasets[5].sections.find(s => s.path === path);
            setTitle(section?.name || 'Ration Card Seeding');
        } else if (path.startsWith('/pan')) {
            setActiveDataset(datasets[6]);
            const section = datasets[6].sections.find(s => s.path === path);
            setTitle(section?.name || 'PAN-Aadhaar Linkage');
        } else {
            setActiveDataset(datasets[0]);
            const section = datasets[0].sections.find(s => s.path === path);
            setTitle(section?.name || 'Overview');
        }
    }, [location]);

    const handleDatasetClick = (dataset: typeof datasets[0]) => {
        // Navigate to the first section of the dataset
        navigate(dataset.sections[0].path);
    };

    const isDatasetActive = (dataset: typeof datasets[0]) => {
        const path = location.pathname;
        if (dataset.id === 'biometric') {
            return path.startsWith('/biometric');
        }
        if (dataset.id === 'demographic') {
            return path.startsWith('/demographic');
        }
        if (dataset.id === 'receipts') {
            return path.startsWith('/receipts');
        }
        if (dataset.id === 'pds') {
            return path.startsWith('/pds');
        }
        if (dataset.id === 'ration') {
            return path.startsWith('/ration');
        }
        if (dataset.id === 'pan') {
            return path.startsWith('/pan');
        }
        // distinct check for enrollment which is root
        return path === '/' || (!path.startsWith('/biometric') && !path.startsWith('/demographic') && !path.startsWith('/receipts') && !path.startsWith('/pds') && !path.startsWith('/ration') && !path.startsWith('/pan'));
    };

    return (
        <div className="dashboard-layout">
            {/* Sidebar - Dataset Selection Only */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <div style={{ background: 'white', padding: 5, borderRadius: 4, display: 'flex' }}>
                        <div style={{ width: 20, height: 20, background: '#f69320', borderRadius: '50%' }}></div>
                    </div>
                    <span>UIDAI Intel</span>
                </div>

                <div className="nav-section-label">Datasets</div>

                <nav className="dataset-nav">
                    {datasets.map(dataset => {
                        const DatasetIcon = dataset.icon;
                        const isActive = isDatasetActive(dataset);

                        return (
                            <button
                                key={dataset.id}
                                className={`dataset-btn ${isActive ? 'active' : ''}`}
                                onClick={() => handleDatasetClick(dataset)}
                            >
                                <DatasetIcon size={20} />
                                <span>{dataset.name}</span>
                            </button>
                        );
                    })}
                </nav>

                <div style={{ marginTop: 'auto', fontSize: '0.8rem', opacity: 0.7 }}>
                    <p>System Status: Online</p>
                    <p>Last Updated: Jan 2026</p>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                {/* Header with Top Navigation */}
                <header className="header-with-tabs">
                    <div className="header-top">
                        <h1 className="page-title">{activeDataset?.name} - {title}</h1>
                        <div className="user-profile">
                            <span style={{ fontWeight: 600 }}>Administrator</span>
                        </div>
                    </div>

                    {/* Top Navigation Tabs */}
                    {activeDataset && (
                        <nav className="top-nav-tabs">
                            {activeDataset.sections.map(section => {
                                const SectionIcon = section.icon;
                                return (
                                    <NavLink
                                        key={section.path}
                                        to={section.path}
                                        className={({ isActive }) => `tab-item ${isActive ? 'active' : ''}`}
                                        end={section.path === '/' || section.path === '/biometric' || section.path === '/demographic' || section.path === '/receipts'}
                                    >
                                        <SectionIcon size={16} />
                                        <span>{section.name}</span>
                                    </NavLink>
                                );
                            })}
                        </nav>
                    )}
                </header>

                <div className="content-area">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
