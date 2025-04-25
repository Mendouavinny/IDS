import { useState, useEffect } from 'react';
import { BarChart3, Filter, Dices as Devices, Network, Cpu, Wifi } from 'lucide-react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { 
  Chart, 
  ArcElement, 
  BarElement, 
  CategoryScale, 
  LinearScale, 
  Title, 
  Tooltip, 
  Legend
} from 'chart.js';

Chart.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);

// Interface for network device
interface NetworkDevice {
  id: string;
  name: string;
  ip: string;
  mac: string;
  type: 'server' | 'workstation' | 'iot' | 'mobile' | 'network';
  traffic: number;
  status: 'online' | 'offline' | 'warning';
  lastSeen: Date;
}

// Interface for protocol data
interface ProtocolData {
  protocol: string;
  bytes: number;
  packets: number;
  percentage: number;
}

// Interface for port data
interface PortData {
  port: number;
  service: string;
  connections: number;
  traffic: number;
}

// Mock data for devices
const mockDevices: NetworkDevice[] = [
  {
    id: '1',
    name: 'Serveur Principal',
    ip: '192.168.1.10',
    mac: '00:1A:2B:3C:4D:5E',
    type: 'server',
    traffic: 1240,
    status: 'online',
    lastSeen: new Date()
  },
  {
    id: '2',
    name: 'Firewall',
    ip: '192.168.1.1',
    mac: '00:1A:2B:3C:4D:5F',
    type: 'network',
    traffic: 3450,
    status: 'online',
    lastSeen: new Date()
  },
  {
    id: '3',
    name: 'PC Dev',
    ip: '192.168.1.25',
    mac: '00:1A:2B:3C:4D:60',
    type: 'workstation',
    traffic: 320,
    status: 'online',
    lastSeen: new Date()
  },
  {
    id: '4',
    name: 'Caméra Surveillance',
    ip: '192.168.1.45',
    mac: '00:1A:2B:3C:4D:61',
    type: 'iot',
    traffic: 750,
    status: 'warning',
    lastSeen: new Date(Date.now() - 10 * 60000)
  },
  {
    id: '5',
    name: 'Smartphone PDG',
    ip: '192.168.1.102',
    mac: '00:1A:2B:3C:4D:62',
    type: 'mobile',
    traffic: 150,
    status: 'offline',
    lastSeen: new Date(Date.now() - 120 * 60000)
  },
  {
    id: '6',
    name: 'Serveur Backup',
    ip: '192.168.1.11',
    mac: '00:1A:2B:3C:4D:63',
    type: 'server',
    traffic: 890,
    status: 'online',
    lastSeen: new Date()
  },
];

// Mock protocol data
const mockProtocols: ProtocolData[] = [
  { protocol: 'HTTP/HTTPS', bytes: 1850000000, packets: 4200000, percentage: 42 },
  { protocol: 'DNS', bytes: 150000000, packets: 3000000, percentage: 8 },
  { protocol: 'SMTP', bytes: 420000000, packets: 1300000, percentage: 12 },
  { protocol: 'SMB', bytes: 730000000, packets: 2100000, percentage: 18 },
  { protocol: 'SSH', bytes: 210000000, packets: 800000, percentage: 6 },
  { protocol: 'Others', bytes: 540000000, packets: 1500000, percentage: 14 }
];

// Mock port data
const mockPorts: PortData[] = [
  { port: 80, service: 'HTTP', connections: 450, traffic: 540 },
  { port: 443, service: 'HTTPS', connections: 820, traffic: 1250 },
  { port: 53, service: 'DNS', connections: 380, traffic: 85 },
  { port: 22, service: 'SSH', connections: 26, traffic: 210 },
  { port: 25, service: 'SMTP', connections: 12, traffic: 320 },
  { port: 445, service: 'SMB', connections: 28, traffic: 730 }
];

const NetworkAnalysis = () => {
  const [devices, setDevices] = useState<NetworkDevice[]>([]);
  const [protocols, setProtocols] = useState<ProtocolData[]>([]);
  const [ports, setPorts] = useState<PortData[]>([]);
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('day');
  
  // Load data
  useEffect(() => {
    const timer = setTimeout(() => {
      setDevices(mockDevices);
      setProtocols(mockProtocols);
      setPorts(mockPorts);
      setIsLoading(false);
    }, 1200);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Apply filters to devices
  const filteredDevices = devices.filter(device => {
    if (typeFilter !== 'all' && device.type !== typeFilter) return false;
    if (statusFilter !== 'all' && device.status !== statusFilter) return false;
    return true;
  });
  
  // Protocol chart data
  const protocolChartData = {
    labels: protocols.map(p => p.protocol),
    datasets: [
      {
        data: protocols.map(p => p.percentage),
        backgroundColor: [
          '#4b52e6', // primary-600
          '#14b8a6', // secondary-500
          '#f97316', // accent-500
          '#ef4444', // danger-500
          '#f59e0b', // warning-500
          '#64748b', // dark-500
        ],
        borderWidth: 1,
      },
    ],
  };
  
  // Port connections chart data
  const portChartData = {
    labels: ports.map(p => `${p.port} (${p.service})`),
    datasets: [
      {
        label: 'Connexions',
        data: ports.map(p => p.connections),
        backgroundColor: '#4b52e6',
      },
    ],
  };
  
  // Port traffic chart data
  const trafficChartData = {
    labels: ports.map(p => `${p.port} (${p.service})`),
    datasets: [
      {
        label: 'Trafic (MB)',
        data: ports.map(p => p.traffic),
        backgroundColor: '#14b8a6',
      },
    ],
  };
  
  // Device type counts for chart
  const deviceTypeCounts = {
    server: devices.filter(d => d.type === 'server').length,
    workstation: devices.filter(d => d.type === 'workstation').length,
    network: devices.filter(d => d.type === 'network').length,
    iot: devices.filter(d => d.type === 'iot').length,
    mobile: devices.filter(d => d.type === 'mobile').length,
  };
  
  // Device type chart data
  const deviceTypeChartData = {
    labels: ['Serveurs', 'Postes', 'Réseau', 'IoT', 'Mobiles'],
    datasets: [
      {
        data: [
          deviceTypeCounts.server,
          deviceTypeCounts.workstation,
          deviceTypeCounts.network,
          deviceTypeCounts.iot,
          deviceTypeCounts.mobile,
        ],
        backgroundColor: [
          '#4b52e6', // primary-600
          '#14b8a6', // secondary-500
          '#f97316', // accent-500
          '#ef4444', // danger-500
          '#f59e0b', // warning-500
        ],
        borderWidth: 1,
      },
    ],
  };
  
  // Format bytes
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // Get total traffic
  const totalTraffic = devices.reduce((acc, device) => acc + device.traffic, 0);
  
  // Get device type icon
  const getDeviceIcon = (type: NetworkDevice['type']) => {
    switch (type) {
      case 'server':
        return <Cpu className="h-5 w-5" />;
      case 'workstation':
        return <Devices className="h-5 w-5" />;
      case 'network':
        return <Network className="h-5 w-5" />;
      case 'iot':
        return <Wifi className="h-5 w-5" />;
      case 'mobile':
        return <Devices className="h-5 w-5" />;
    }
  };
  
  // Get status badge class
  const getStatusBadgeClass = (status: NetworkDevice['status']) => {
    switch (status) {
      case 'online':
        return 'badge-success';
      case 'warning':
        return 'badge-warning';
      case 'offline':
        return 'badge-danger';
    }
  };
  
  // Chart options
  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
    },
  };
  
  const barOptions = {
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
      <h1 className="section-title flex items-center">
        <BarChart3 className="mr-2 h-6 w-6 text-primary-600" />
        Analyse du Réseau
      </h1>
      
      <div className="mb-6">
        <p className="text-dark-600">
          Examinez la composition et les flux de données de votre réseau.
        </p>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="loading-spinner"></div>
        </div>
      ) : (
        <>
          {/* Network overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="card">
              <h3 className="text-lg font-medium mb-2">Appareils</h3>
              <div className="flex justify-between items-end">
                <div className="text-3xl font-bold text-primary-600">
                  {devices.length}
                </div>
                <div className="text-dark-500 text-sm">
                  <span className="text-success-600 font-medium">
                    {devices.filter(d => d.status === 'online').length}
                  </span> en ligne
                </div>
              </div>
            </div>
            
            <div className="card">
              <h3 className="text-lg font-medium mb-2">Trafic Total</h3>
              <div className="flex justify-between items-end">
                <div className="text-3xl font-bold text-secondary-600">
                  {totalTraffic} MB
                </div>
                <div className="text-dark-500 text-sm">
                  Dernières 24h
                </div>
              </div>
            </div>
            
            <div className="card">
              <h3 className="text-lg font-medium mb-2">Période</h3>
              <div>
                <select 
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="w-full px-3 py-2 border border-dark-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-400"
                >
                  <option value="hour">Dernière heure</option>
                  <option value="day">Dernières 24h</option>
                  <option value="week">Dernière semaine</option>
                  <option value="month">Dernier mois</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="card">
              <h3 className="font-medium text-lg mb-4">Protocoles Réseau</h3>
              <div className="h-64">
                <Doughnut data={protocolChartData} options={doughnutOptions} />
              </div>
            </div>
            
            <div className="card">
              <h3 className="font-medium text-lg mb-4">Types d'Appareils</h3>
              <div className="h-64">
                <Doughnut data={deviceTypeChartData} options={doughnutOptions} />
              </div>
            </div>
            
            <div className="card">
              <h3 className="font-medium text-lg mb-4">Connexions par Port</h3>
              <div className="h-64">
                <Bar data={portChartData} options={barOptions} />
              </div>
            </div>
            
            <div className="card">
              <h3 className="font-medium text-lg mb-4">Trafic par Port (MB)</h3>
              <div className="h-64">
                <Bar data={trafficChartData} options={barOptions} />
              </div>
            </div>
          </div>
          
          {/* Device table */}
          <div className="card">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <h3 className="font-medium text-lg mb-3 sm:mb-0">Appareils Réseau</h3>
              
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                <div className="flex items-center">
                  <Filter className="h-4 w-4 mr-1 text-dark-400" />
                  <select 
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="px-2 py-1 border border-dark-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-400"
                  >
                    <option value="all">Tous types</option>
                    <option value="server">Serveurs</option>
                    <option value="workstation">Postes de travail</option>
                    <option value="network">Réseau</option>
                    <option value="iot">IoT</option>
                    <option value="mobile">Mobiles</option>
                  </select>
                </div>
                
                <div className="flex items-center">
                  <Filter className="h-4 w-4 mr-1 text-dark-400" />
                  <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-2 py-1 border border-dark-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-400"
                  >
                    <option value="all">Tous statuts</option>
                    <option value="online">En ligne</option>
                    <option value="warning">Avertissement</option>
                    <option value="offline">Hors ligne</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-dark-200">
                <thead className="bg-dark-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">
                      Appareil
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">
                      IP
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">
                      MAC
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">
                      Trafic
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">
                      Dernière Activité
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-dark-200">
                  {filteredDevices.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center text-dark-500">
                        Aucun appareil ne correspond aux filtres sélectionnés
                      </td>
                    </tr>
                  ) : (
                    filteredDevices.map(device => (
                      <tr key={device.id} className="hover:bg-dark-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-primary-100 text-primary-600 rounded-full">
                              {getDeviceIcon(device.type)}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-dark-800">
                                {device.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-500">
                          {device.ip}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-500">
                          {device.mac}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-500">
                          <span className="capitalize">
                            {device.type === 'iot' ? 'IoT' : device.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-500">
                          {device.traffic} MB
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`badge ${getStatusBadgeClass(device.status)}`}>
                            {device.status === 'online' ? 'En ligne' : 
                             device.status === 'warning' ? 'Avertissement' : 'Hors ligne'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-500">
                          {device.lastSeen.toLocaleString('fr-FR')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Protocol details */}
          <div className="mt-8 card">
            <h3 className="font-medium text-lg mb-4">Détails des Protocoles</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-dark-200">
                <thead className="bg-dark-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">
                      Protocole
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">
                      Octets
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">
                      Paquets
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">
                      Pourcentage
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-dark-200">
                  {protocols.map((protocol, index) => (
                    <tr key={index} className="hover:bg-dark-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-dark-800">
                        {protocol.protocol}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-500">
                        {formatBytes(protocol.bytes)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-500">
                        {protocol.packets.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-full bg-dark-200 rounded-full h-2.5">
                            <div 
                              className="bg-primary-600 h-2.5 rounded-full" 
                              style={{ width: `${protocol.percentage}%` }}
                            ></div>
                          </div>
                          <span className="ml-2 text-sm text-dark-600">
                            {protocol.percentage}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NetworkAnalysis;