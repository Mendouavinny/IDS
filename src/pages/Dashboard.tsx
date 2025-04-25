import { useState, useEffect } from 'react';
import { Shield, AlertTriangle, BarChart3, Wifi, ArrowUpRight } from 'lucide-react';
import { Doughnut, Line } from 'react-chartjs-2';
import { Chart, ArcElement, LineElement, PointElement, LinearScale, Title, Tooltip, Legend, CategoryScale } from 'chart.js';

Chart.register(ArcElement, LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalAlerts: 0,
    criticalAlerts: 0,
    highAlerts: 0,
    networkStatus: 'Optimal',
    securityScore: 0,
    uptime: '0%',
    lastScan: ''
  });
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setStats({
        totalAlerts: 37,
        criticalAlerts: 3,
        highAlerts: 12,
        networkStatus: 'Optimal',
        securityScore: 87,
        uptime: '99.8%',
        lastScan: new Date().toLocaleString('fr-FR')
      });
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Threat distribution chart data
  const threatDistributionData = {
    labels: ['SQLi', 'XSS', 'Brute Force', 'DDoS', 'Malware'],
    datasets: [
      {
        data: [15, 12, 8, 5, 7],
        backgroundColor: [
          '#ef4444',
          '#f97316',
          '#f59e0b',
          '#3e44cc',
          '#14b8a6',
        ],
        borderWidth: 0,
      },
    ],
  };

  // Network traffic data
  const lastWeekDates = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toLocaleDateString('fr-FR', { weekday: 'short' });
  });

  const trafficData = {
    labels: lastWeekDates,
    datasets: [
      {
        label: 'Trafic Légitime',
        data: [65, 59, 80, 81, 56, 55, 70],
        fill: false,
        borderColor: '#14b8a6',
        tension: 0.4,
      },
      {
        label: 'Trafic Suspect',
        data: [28, 48, 40, 19, 36, 27, 30],
        fill: false,
        borderColor: '#f97316',
        tension: 0.4,
      }
    ],
  };

  // Chart options
  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
    },
    cutout: '70%',
  };

  const lineOptions = {
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
    }
  };

  return (
    <div className="container-section">
      <h1 className="section-title">Tableau de Bord</h1>
      
      <div className="mb-6">
        <p className="text-dark-600">
          Aperçu de la sécurité de votre réseau et des activités récentes.
        </p>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="loading-spinner"></div>
        </div>
      ) : (
        <>
          {/* Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="card hover:shadow-lg hover:translate-y-[-2px]">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-danger-100 text-danger-700">
                  <AlertTriangle size={20} />
                </div>
                <div className="ml-4">
                  <h3 className="text-dark-500 text-sm font-medium">Alertes Totales</h3>
                  <div className="flex items-center">
                    <p className="text-2xl font-semibold text-dark-800">{stats.totalAlerts}</p>
                    <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-danger-100 text-danger-800">
                      {stats.criticalAlerts} critiques
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card hover:shadow-lg hover:translate-y-[-2px]">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-primary-100 text-primary-700">
                  <Shield size={20} />
                </div>
                <div className="ml-4">
                  <h3 className="text-dark-500 text-sm font-medium">Score de Sécurité</h3>
                  <div className="flex items-center">
                    <p className="text-2xl font-semibold text-dark-800">{stats.securityScore}/100</p>
                    <ArrowUpRight className="ml-2 h-4 w-4 text-success-600" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card hover:shadow-lg hover:translate-y-[-2px]">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-success-100 text-success-700">
                  <Wifi size={20} />
                </div>
                <div className="ml-4">
                  <h3 className="text-dark-500 text-sm font-medium">Statut Réseau</h3>
                  <div className="flex items-center">
                    <p className="text-2xl font-semibold text-dark-800">{stats.networkStatus}</p>
                    <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-success-100 text-success-800">
                      {stats.uptime}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card hover:shadow-lg hover:translate-y-[-2px]">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-accent-100 text-accent-700">
                  <BarChart3 size={20} />
                </div>
                <div className="ml-4">
                  <h3 className="text-dark-500 text-sm font-medium">Dernière Analyse</h3>
                  <div className="flex items-center">
                    <p className="text-lg font-semibold text-dark-800">{stats.lastScan}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="card">
              <h3 className="font-medium text-lg mb-4">Distribution des Menaces</h3>
              <div className="h-64">
                <Doughnut data={threatDistributionData} options={doughnutOptions} />
              </div>
            </div>
            
            <div className="card">
              <h3 className="font-medium text-lg mb-4">Trafic Réseau (7 derniers jours)</h3>
              <div className="h-64">
                <Line data={trafficData} options={lineOptions} />
              </div>
            </div>
          </div>
          
          {/* Recent activity */}
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-lg">Activités Récentes</h3>
              <button className="btn btn-primary">Tout Voir</button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-dark-200">
                <thead className="bg-dark-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">
                      Horodatage
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">
                      Source
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">
                      Niveau
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">
                      Statut
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-dark-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-500">
                      {new Date().toLocaleString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-800">
                      Attaque par force brute
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-500">
                      192.168.1.45
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="badge badge-danger">Critique</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-500">
                      Bloqué
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-500">
                      {new Date(Date.now() - 15 * 60000).toLocaleString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-800">
                      Scan de ports
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-500">
                      45.33.22.156
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="badge badge-warning">Moyen</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-500">
                      Détecté
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-500">
                      {new Date(Date.now() - 45 * 60000).toLocaleString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-800">
                      Injection SQL
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-500">
                      77.84.112.33
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="badge badge-danger">Critique</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-500">
                      Bloqué
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;