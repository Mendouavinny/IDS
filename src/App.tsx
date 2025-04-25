import { Routes, Route } from 'react-router-dom';

// Layouts
import Layout from './components/Layout';

// Pages
import Dashboard from './pages/Dashboard';
import Detection from './pages/Detection';
import RealtimeAnalysis from './pages/RealtimeAnalysis';
import NetworkAnalysis from './pages/NetworkAnalysis';
import Reports from './pages/Reports';
import DataUpload from './pages/DataUpload';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="detection" element={<Detection />} />
        <Route path="realtime-analysis" element={<RealtimeAnalysis />} />
        <Route path="network-analysis" element={<NetworkAnalysis />} />
        <Route path="reports" element={<Reports />} />
        <Route path="upload" element={<DataUpload />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;