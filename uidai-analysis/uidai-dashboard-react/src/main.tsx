import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'

// Enrolment Dashboard Pages
import Overview from './pages/Overview'
import Hotspots from './pages/Hotspots'
import Pipeline from './pages/Pipeline'
import Trends from './pages/Trends'
import Forecast from './pages/Forecast'
import Insights from './pages/Insights'

// Biometric Dashboard Pages
import BiometricOverview from './pages/biometric/BiometricOverview'
import UpdateTypes from './pages/biometric/UpdateTypes'
import FailureAnalysis from './pages/biometric/FailureAnalysis'
import BiometricHotspots from './pages/biometric/BiometricHotspots'
import AnomalyRisk from './pages/biometric/AnomalyRisk'
import BiometricInsights from './pages/biometric/BiometricInsights'
import DevicePerformance from './pages/biometric/DevicePerformance'

// Demographic Dashboard Pages
import DemoOverview from './pages/demographic/Overview'
import DemoCategories from './pages/demographic/UpdateCategories'
import DemoPatterns from './pages/demographic/ChangePatterns'
import DemoHotspots from './pages/demographic/Hotspots'
import DemoInsights from './pages/demographic/Insights'
import DemoAnomaly from './pages/demographic/AnomalyRisk'
import ReceiptsOverview from './pages/receipts/ReceiptsOverview'
import ReceiptsPipeline from './pages/receipts/ReceiptsPipeline'
import ReceiptsPatterns from './pages/receipts/ReceiptsPatterns'
import ReceiptsHotspots from './pages/receipts/ReceiptsHotspots'
import ReceiptsAnomalies from './pages/receipts/ReceiptsAnomalies'
import ReceiptsInsights from './pages/receipts/ReceiptsInsights'

// PDS Dashboard Pages
import PDSOverview from './pages/pds/PDSOverview'
import PDSStateAnalysis from './pages/pds/PDSStateAnalysis'
import PDSHotspots from './pages/pds/PDSHotspots'
import PDSAnomalyRisk from './pages/pds/PDSAnomalyRisk'
import PDSInsights from './pages/pds/PDSInsights'

// Ration Seeding Dashboard Pages
import RationSeedingOverview from './pages/ration/RationSeedingOverview'
import RationSeedingAnalysis from './pages/ration/RationSeedingAnalysis'
import RationSeedingRisk from './pages/ration/RationSeedingRisk'
import RationSeedingInsights from './pages/ration/RationSeedingInsights'

// PAN-Aadhaar Linkage Dashboard Pages
import PANLinkageOverview from './pages/pan/PANLinkageOverview'
import PANLinkageAnalysis from './pages/pan/PANLinkageAnalysis'
import PANLinkageInsights from './pages/pan/PANLinkageInsights'

import './styles.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Enrolment Dashboard Routes (Legacy + New Path) */}
          <Route index element={<Overview />} />
          <Route path="pipeline" element={<Pipeline />} />
          <Route path="trends" element={<Trends />} />
          <Route path="hotspots" element={<Hotspots />} />
          <Route path="forecast" element={<Forecast />} />
          <Route path="insights" element={<Insights />} />

          {/* Enrolment Routes with /enrolment prefix */}
          <Route path="enrolment" element={<Overview />} />
          <Route path="enrolment/pipeline" element={<Pipeline />} />
          <Route path="enrolment/trends" element={<Trends />} />
          <Route path="enrolment/hotspots" element={<Hotspots />} />
          <Route path="enrolment/forecast" element={<Forecast />} />
          <Route path="enrolment/insights" element={<Insights />} />

          {/* Demographic Dashboard Routes */}
          <Route path="demographic" element={<DemoOverview />} />
          <Route path="demographic/categories" element={<DemoCategories />} />
          <Route path="demographic/patterns" element={<DemoPatterns />} />
          <Route path="demographic/hotspots" element={<DemoHotspots />} />
          <Route path="demographic/anomaly" element={<DemoAnomaly />} />
          <Route path="demographic/insights" element={<DemoInsights />} />

          {/* Biometric Dashboard Routes */}
          <Route path="biometric" element={<BiometricOverview />} />
          <Route path="biometric/update-types" element={<UpdateTypes />} />
          <Route path="biometric/failure-analysis" element={<FailureAnalysis />} />
          <Route path="biometric/hotspots" element={<BiometricHotspots />} />
          <Route path="biometric/anomaly-risk" element={<AnomalyRisk />} />
          <Route path="biometric/insights" element={<BiometricInsights />} />
          <Route path="biometric/device-performance" element={<DevicePerformance />} />

          {/* Receipts Dashboard Routes */}
          <Route path="receipts" element={<ReceiptsOverview />} />
          <Route path="receipts/pipeline" element={<ReceiptsPipeline />} />
          <Route path="receipts/patterns" element={<ReceiptsPatterns />} />
          <Route path="receipts/hotspots" element={<ReceiptsHotspots />} />
          <Route path="receipts/anomalies" element={<ReceiptsAnomalies />} />
          <Route path="receipts/insights" element={<ReceiptsInsights />} />

          {/* PDS Dashboard Routes */}
          <Route path="pds" element={<PDSOverview />} />
          <Route path="pds/state-analysis" element={<PDSStateAnalysis />} />
          <Route path="pds/hotspots" element={<PDSHotspots />} />
          <Route path="pds/anomaly-risk" element={<PDSAnomalyRisk />} />
          <Route path="pds/insights" element={<PDSInsights />} />

          {/* Ration Seeding Dashboard Routes */}
          <Route path="ration" element={<RationSeedingOverview />} />
          <Route path="ration/analysis" element={<RationSeedingAnalysis />} />
          <Route path="ration/risk" element={<RationSeedingRisk />} />
          <Route path="ration/insights" element={<RationSeedingInsights />} />

          {/* PAN-Aadhaar Linkage Dashboard Routes */}
          <Route path="pan" element={<PANLinkageOverview />} />
          <Route path="pan/analysis" element={<PANLinkageAnalysis />} />
          <Route path="pan/insights" element={<PANLinkageInsights />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
