import { useState, useEffect, useRef } from 'react';
import { Activity, Wifi, RefreshCw, WifiOff, Play, Pause, Download } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import { 
  Chart, 
  LineElement, 
  PointElement, 
  LinearScale, 
  Title, 
  Tooltip, 
  Legend,
  CategoryScale, 
  TimeScale 
} from 'chart.js';

// Register ChartJS components
Chart.register(
  LineElement, 
  PointElement, 
  LinearScale, 
  CategoryScale,
  TimeScale,
  Title, 
  Tooltip, 
  Legend
);

// Initial metrics
const initialMetrics = {
  latency: Array(20).fill(0),
  bandwidth: Array(20).fill(0),
  packetLoss: Array(20).fill(0),
  connections: Array(20).fill(0)
};

const RealtimeAnalysis = () => {
  const [metrics, setMetrics] = useState(initialMetrics);
  const [isRunning, setIsRunning] = useState(false);
  const [anomalyDetected, setAnomalyDetected] = useState(false);
  const [alerts, setAlerts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const animationRef = useRef<number | null>(null);
  
  // Define time labels (last 20 seconds)
  const timeLabels = Array(20).fill(0).map((_, i) => 
    new Date(Date.now() - (19 - i) * 1000).toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    })
  );
  
  // Anomaly detection model from IBM (simulated)
  const detectAnomalies = async (data: any) => {
    try {
      // Get last 5 data points
      const latestMetrics = {
        latency: metrics.latency.slice(-5),
        bandwidth: metrics.bandwidth.slice(-5),
        packetLoss: metrics.packetLoss.slice(-5)
      };
      
      // Normally this would be an API call to the model
      // For demo, we'll simulate anomaly detection
      const randomThreshold = Math.random();
      
      // Check for high latency and high packet loss or bandwidth drop
      const hasHighLatency = latestMetrics.latency.some(val => val > 200);
      const hasPacketLossSpike = latestMetrics.packetLoss.some(val => val > 5);
      const hasBandwidthDrop = latestMetrics.bandwidth.some((val, i, arr) => {
        return i > 0 && val < arr[i-1] * 0.7; // 30% drop
      });
      
      const isAnomaly = (hasHighLatency && (hasPacketLossSpike || hasBandwidthDrop)) || 
                        (randomThreshold > 0.95); // Occasional random anomaly
      
      if (isAnomaly && !anomalyDetected) {
        setAnomalyDetected(true);
        const alertMessage = `Anomalie détectée à ${new Date().toLocaleTimeString('fr-FR')} - Latence: ${metrics.latency.slice(-1)[0].toFixed(2)}ms, Perte: ${metrics.packetLoss.slice(-1)[0].toFixed(2)}%`;
        setAlerts(prev => [alertMessage, ...prev].slice(0, 10));
      } else if (!isAnomaly && anomalyDetected) {
        setAnomalyDetected(false);
      }
      
      return isAnomaly;
    } catch (error) {
      console.error('Erreur lors de la détection d\'anomalies:', error);
      return false;
    }
  };
  
  // Generate random network metrics
  const generateMetrics = () => {
    // Base values
    const baseLatency = 50; // ms
    const baseBandwidth = 100; // Mbps
    const basePacketLoss = 0.5; // %
    const baseConnections = 35; // count
    
    // Add randomness
    const newLatency = baseLatency + (Math.random() * 30) - 15;
    const newBandwidth = baseBandwidth + (Math.random() * 20) - 10;
    const newPacketLoss = basePacketLoss + (Math.random() * 1) - 0.5;
    const newConnections = baseConnections + Math.floor(Math.random() * 10) - 5;
    
    // Occasionally simulate spikes
    const shouldSpike = Math.random() > 0.95;
    
    return {
      latency: shouldSpike ? newLatency * 3 : newLatency,
      bandwidth: shouldSpike ? newBandwidth * 0.5 : newBandwidth,
      packetLoss: shouldSpike ? newPacketLoss * 5 : newPacketLoss,
      connections: newConnections
    };
  };
  
  // Update metrics with new values
  const updateMetrics = () => {
    const newMetric = generateMetrics();
    
    setMetrics(prev => ({
      latency: [...prev.latency.slice(1), newMetric.latency],
      bandwidth: [...prev.bandwidth.slice(1), newMetric.bandwidth],
      packetLoss: [...prev.packetLoss.slice(1), newMetric.packetLoss],
      connections: [...prev.connections.slice(1), newMetric.connections]
    }));
    
    detectAnomalies(newMetric);
    
    if (isRunning) {
      animationRef.current = requestAnimationFrame(() => {
        // Using setTimeout to limit updates to ~1 per second
        setTimeout(updateMetrics, 1000);
      });
    }
  };
  
  // Start/stop monitoring
  const toggleMonitoring = () => {
    if (isRunning) {
      setIsRunning(false);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    } else {
      setIsRunning(true);
      setIsLoading(true);
      
      // Simulate connection setup
      setTimeout(() => {
        setIsLoading(false);
        updateMetrics();
      }, 1500);
    }
  };
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);
  
  // Show warning if anomaly is detected
  useEffect(() => {
    if (anomalyDetected) {
      setShowWarning(true);
      const timer = setTimeout(() => {
        setShowWarning(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [anomalyDetected]);
  
  // Prepare chart data
  const latencyData = {
    labels: timeLabels,
    datasets: [
      {
        label: 'Latence (ms)',
        data: metrics.latency,
        borderColor: '#4b52e6',
        backgroundColor: 'rgba(75, 82, 230, 0.1)',
        fill: true,
        tension: 0.4,
      }
    ]
  };
  
  const bandwidthData = {
    labels: timeLabels,
    datasets: [
      {
        label: 'Bande passante (Mbps)',
        data: metrics.bandwidth,
        borderColor: '#14b8a6',
        backgroundColor: 'rgba(20, 184, 166, 0.1)',
        fill: true,
        tension: 0.4,
      }
    ]
  };
  
  const packetLossData = {
    labels: timeLabels,
    datasets: [
      {
        label: 'Perte de paquets (%)',
        data: metrics.packetLoss,
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4,
      }
    ]
  };
  
  const connectionsData = {
    labels: timeLabels,
    datasets: [
      {
        label: 'Connexions actives',
        data: metrics.connections,
        borderColor: '#f97316',
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        fill: true,
        tension: 0.4,
      }
    ]
  };
  
  // Chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true
      }
    },
    animation: {
      duration: 0 // Disable animations for better performance
    }
  };
  
  // Download metrics as CSV
  const downloadMetrics = () => {
    // Prepare data
    const headers = 'Timestamp,Latence (ms),Bande passante (Mbps),Perte de paquets (%),Connexions\n';
    const rows = timeLabels.map((time, i) => 
      `${time},${metrics.latency[i].toFixed(2)},${metrics.bandwidth[i].toFixed(2)},${metrics.packetLoss[i].toFixed(2)},${metrics.connections[i]}`
    ).join('\n');
    
    const csvContent = `data:text/csv;charset=utf-8,${headers}${rows}`;
    const encodedUri = encodeURI(csvContent);
    
    // Create download link
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `network_metrics_${new Date().toISOString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className="container-section">
      <h1 className="section-title flex items-center">
        <Activity className="mr-2 h-6 w-6 text-primary-600" />
        Analyse en Temps Réel
      </h1>
      
      <div className="mb-6">
        <p className="text-dark-600">
          Surveillez les performances et la sécurité de votre réseau en temps réel.
        </p>
      </div>
      
      {/* Status and controls */}
      <div className="card mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <div className="flex items-center mb-4 sm:mb-0">
            <div className={`p-3 rounded-full ${isRunning ? 'bg-success-100' : 'bg-dark-100'} mr-4`}>
              {isRunning ? (
                <Wifi className="h-6 w-6 text-success-600" />
              ) : (
                <WifiOff className="h-6 w-6 text-dark-500" />
              )}
            </div>
            <div>
              <h3 className="font-medium text-lg">Statut de Surveillance</h3>
              <p className="text-dark-500">
                {isLoading ? 'Connexion au réseau...' : 
                 isRunning ? 'Surveillance active' : 'Surveillance inactive'}
              </p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button 
              onClick={toggleMonitoring} 
              className={`btn flex items-center ${isRunning ? 'btn-danger' : 'btn-primary'}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
              ) : isRunning ? (
                <Pause className="h-5 w-5 mr-2" />
              ) : (
                <Play className="h-5 w-5 mr-2" />
              )}
              {isLoading ? 'Connexion...' : isRunning ? 'Arrêter' : 'Démarrer'}
            </button>
            
            <button 
              onClick={downloadMetrics}
              className="btn btn-secondary flex items-center"
              disabled={!isRunning && metrics.latency.every(val => val === 0)}
            >
              <Download className="h-5 w-5 mr-2" />
              Exporter
            </button>
          </div>
        </div>
      </div>
      
      {/* Warning message */}
      {showWarning && (
        <div className="bg-danger-100 border-l-4 border-danger-500 text-danger-700 p-4 mb-8 rounded shadow-md animate-pulse-slow">
          <div className="flex">
            <AlertTriangle className="h-6 w-6 mr-2" />
            <div>
              <p className="font-medium">Anomalie détectée!</p>
              <p>Des variations anormales dans les métriques du réseau ont été détectées.</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <h3 className="font-medium text-lg mb-4">Latence</h3>
          <div className="h-64">
            <Line data={latencyData} options={chartOptions} />
          </div>
        </div>
        
        <div className="card">
          <h3 className="font-medium text-lg mb-4">Bande Passante</h3>
          <div className="h-64">
            <Line data={bandwidthData} options={chartOptions} />
          </div>
        </div>
        
        <div className="card">
          <h3 className="font-medium text-lg mb-4">Perte de Paquets</h3>
          <div className="h-64">
            <Line data={packetLossData} options={chartOptions} />
          </div>
        </div>
        
        <div className="card">
          <h3 className="font-medium text-lg mb-4">Connexions Actives</h3>
          <div className="h-64">
            <Line data={connectionsData} options={chartOptions} />
          </div>
        </div>
      </div>
      
      {/* Anomaly alerts */}
      <div className="card">
        <h3 className="font-medium text-lg mb-4">Journal d'Anomalies</h3>
        
        {alerts.length === 0 ? (
          <div className="bg-dark-50 p-4 rounded text-dark-500 text-center">
            Aucune anomalie détectée. Démarrez la surveillance pour analyser le trafic.
          </div>
        ) : (
          <div className="bg-dark-50 p-4 rounded max-h-48 overflow-y-auto">
            <ul className="space-y-2">
              {alerts.map((alert, i) => (
                <li key={i} className="p-2 bg-white rounded shadow-sm border-l-4 border-danger-500">
                  {alert}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default RealtimeAnalysis;