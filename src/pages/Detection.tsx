import { useState, useEffect } from 'react';
import { AlertTriangle, Shield, Download, Eye, CheckCircle, XCircle, FileText } from 'lucide-react';
import { Pie } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
// Mock import for PDF generation - in real app would use jspdf
import { jsPDF } from 'jspdf';

Chart.register(ArcElement, Tooltip, Legend);

interface Alert {
  id: string;
  timestamp: Date;
  type: string;
  source: string;
  destination: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'investigating' | 'resolved' | 'ignored';
}

const mockAlerts: Alert[] = [
  {
    id: '1',
    timestamp: new Date(),
    type: 'Attaque par force brute',
    source: '192.168.1.45',
    destination: '192.168.1.1',
    severity: 'critical',
    status: 'investigating'
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 15 * 60000),
    type: 'Scan de ports',
    source: '45.33.22.156',
    destination: '192.168.1.1',
    severity: 'medium',
    status: 'pending'
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 45 * 60000),
    type: 'Injection SQL',
    source: '77.84.112.33',
    destination: '192.168.1.25',
    severity: 'critical',
    status: 'resolved'
  },
  {
    id: '4',
    timestamp: new Date(Date.now() - 120 * 60000),
    type: 'Tentative XSS',
    source: '91.189.92.10',
    destination: '192.168.1.30',
    severity: 'high',
    status: 'pending'
  },
  {
    id: '5',
    timestamp: new Date(Date.now() - 180 * 60000),
    type: 'Connexion suspecte',
    source: '101.43.224.21',
    destination: '192.168.1.5',
    severity: 'medium',
    status: 'ignored'
  }
];

const Detection = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Load alerts
  useEffect(() => {
    const timer = setTimeout(() => {
      setAlerts(mockAlerts);
      setFilteredAlerts(mockAlerts);
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Apply filters
  useEffect(() => {
    let result = alerts;
    
    if (severityFilter !== 'all') {
      result = result.filter(alert => alert.severity === severityFilter);
    }
    
    if (statusFilter !== 'all') {
      result = result.filter(alert => alert.status === statusFilter);
    }
    
    setFilteredAlerts(result);
  }, [alerts, severityFilter, statusFilter]);
  
  // Chart data
  const severityData = {
    labels: ['Critique', 'Élevé', 'Moyen', 'Faible'],
    datasets: [
      {
        data: [
          alerts.filter(a => a.severity === 'critical').length,
          alerts.filter(a => a.severity === 'high').length,
          alerts.filter(a => a.severity === 'medium').length,
          alerts.filter(a => a.severity === 'low').length
        ],
        backgroundColor: [
          '#ef4444',
          '#f97316', 
          '#f59e0b',
          '#22c55e'
        ],
        borderWidth: 1,
      },
    ],
  };
  
  const statusData = {
    labels: ['En attente', 'En investigation', 'Résolu', 'Ignoré'],
    datasets: [
      {
        data: [
          alerts.filter(a => a.status === 'pending').length,
          alerts.filter(a => a.status === 'investigating').length,
          alerts.filter(a => a.status === 'resolved').length,
          alerts.filter(a => a.status === 'ignored').length
        ],
        backgroundColor: [
          '#3e44cc',
          '#f97316',
          '#22c55e',
          '#64748b'
        ],
        borderWidth: 1,
      },
    ],
  };
  
  // Export to PDF
  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      doc.text("Rapport d'alertes de sécurité", 20, 20);
      doc.text(`Généré le: ${new Date().toLocaleString('fr-FR')}`, 20, 30);
      
      // Table headers
      doc.text("Date", 20, 50);
      doc.text("Type", 60, 50);
      doc.text("Source", 120, 50);
      doc.text("Niveau", 170, 50);
      
      // Table content
      filteredAlerts.forEach((alert, index) => {
        const y = 60 + (index * 10);
        doc.text(alert.timestamp.toLocaleString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }), 20, y);
        doc.text(alert.type.substring(0, 20), 60, y);
        doc.text(alert.source, 120, y);
        doc.text(alert.severity, 170, y);
      });
      
      doc.save("rapport-alertes.pdf");
    } catch (error) {
      console.error("Erreur lors de l'export PDF:", error);
      alert("Erreur lors de l'export du rapport. Veuillez réessayer.");
    }
  };
  
  // Change alert status
  const updateAlertStatus = (id: string, newStatus: Alert['status']) => {
    const updatedAlerts = alerts.map(alert => 
      alert.id === id ? { ...alert, status: newStatus } : alert
    );
    setAlerts(updatedAlerts);
  };
  
  // Severity badge component
  const SeverityBadge = ({ severity }: { severity: Alert['severity'] }) => {
    const classes = {
      critical: 'badge badge-danger',
      high: 'badge-warning',
      medium: 'bg-accent-100 text-accent-800',
      low: 'badge-success'
    };
    
    const labels = {
      critical: 'Critique',
      high: 'Élevé',
      medium: 'Moyen',
      low: 'Faible'
    };
    
    return (
      <span className={`badge ${classes[severity]}`}>
        {labels[severity]}
      </span>
    );
  };
  
  // Status badge component
  const StatusBadge = ({ status }: { status: Alert['status'] }) => {
    const classes = {
      pending: 'bg-primary-100 text-primary-800',
      investigating: 'bg-accent-100 text-accent-800',
      resolved: 'bg-success-100 text-success-800',
      ignored: 'bg-dark-100 text-dark-800'
    };
    
    const labels = {
      pending: 'En attente',
      investigating: 'En investigation',
      resolved: 'Résolu',
      ignored: 'Ignoré'
    };
    
    return (
      <span className={`badge ${classes[status]}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <div className="container-section">
      <h1 className="section-title flex items-center">
        <Shield className="mr-2 h-6 w-6 text-primary-600" />
        Détection d'Intrusions
      </h1>
      
      <div className="mb-6">
        <p className="text-dark-600">
          Surveillance et détection des activités suspectes sur votre réseau.
        </p>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="loading-spinner"></div>
        </div>
      ) : (
        <>
          {/* Alert stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="card bg-danger-50 border-l-4 border-danger-500">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-danger-600" />
                <div className="ml-4">
                  <h3 className="text-dark-500 text-sm font-medium">Alertes Critiques</h3>
                  <p className="text-2xl font-semibold text-danger-700">
                    {alerts.filter(a => a.severity === 'critical').length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="card bg-warning-50 border-l-4 border-warning-500">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-warning-600" />
                <div className="ml-4">
                  <h3 className="text-dark-500 text-sm font-medium">Alertes Élevées</h3>
                  <p className="text-2xl font-semibold text-warning-700">
                    {alerts.filter(a => a.severity === 'high').length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="card bg-accent-50 border-l-4 border-accent-500">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-accent-600" />
                <div className="ml-4">
                  <h3 className="text-dark-500 text-sm font-medium">Alertes Moyennes</h3>
                  <p className="text-2xl font-semibold text-accent-700">
                    {alerts.filter(a => a.severity === 'medium').length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="card bg-success-50 border-l-4 border-success-500">
              <div className="flex items-center">
                <Shield className="h-8 w-8 text-success-600" />
                <div className="ml-4">
                  <h3 className="text-dark-500 text-sm font-medium">Alertes Résolues</h3>
                  <p className="text-2xl font-semibold text-success-700">
                    {alerts.filter(a => a.status === 'resolved').length}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Filters and charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="card col-span-1">
              <h3 className="font-medium text-lg mb-4">Filtres</h3>
              
              <div className="mb-4">
                <label htmlFor="severityFilter" className="block text-sm font-medium text-dark-600 mb-2">
                  Niveau de sévérité
                </label>
                <select
                  id="severityFilter"
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-dark-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-400"
                >
                  <option value="all">Tous les niveaux</option>
                  <option value="critical">Critique</option>
                  <option value="high">Élevé</option>
                  <option value="medium">Moyen</option>
                  <option value="low">Faible</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label htmlFor="statusFilter" className="block text-sm font-medium text-dark-600 mb-2">
                  Statut
                </label>
                <select
                  id="statusFilter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-dark-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-400"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="pending">En attente</option>
                  <option value="investigating">En investigation</option>
                  <option value="resolved">Résolu</option>
                  <option value="ignored">Ignoré</option>
                </select>
              </div>
              
              <button 
                onClick={exportToPDF}
                className="btn btn-primary w-full flex items-center justify-center"
              >
                <FileText className="h-4 w-4 mr-2" />
                Exporter en PDF
              </button>
            </div>
            
            <div className="card">
              <h3 className="font-medium text-lg mb-4">Répartition par Sévérité</h3>
              <div className="h-40">
                <Pie data={severityData} />
              </div>
            </div>
            
            <div className="card">
              <h3 className="font-medium text-lg mb-4">Répartition par Statut</h3>
              <div className="h-40">
                <Pie data={statusData} />
              </div>
            </div>
          </div>
          
          {/* Alerts table */}
          <div className="card">
            <h3 className="font-medium text-lg mb-4">Alertes de Sécurité</h3>
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
                      Destination
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">
                      Sévérité
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-dark-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-dark-200">
                  {filteredAlerts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center text-dark-500">
                        Aucune alerte correspondant aux filtres sélectionnés
                      </td>
                    </tr>
                  ) : (
                    filteredAlerts.map(alert => (
                      <tr key={alert.id} className="hover:bg-dark-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-500">
                          {alert.timestamp.toLocaleString('fr-FR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-dark-800">
                          {alert.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-500">
                          {alert.source}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-500">
                          {alert.destination}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <SeverityBadge severity={alert.severity} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <StatusBadge status={alert.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex space-x-2 justify-end">
                            <button 
                              className="text-primary-600 hover:text-primary-900"
                              title="Voir les détails"
                            >
                              <Eye size={18} />
                            </button>
                            <button 
                              className="text-success-600 hover:text-success-900"
                              title="Marquer comme résolu"
                              onClick={() => updateAlertStatus(alert.id, 'resolved')}
                            >
                              <CheckCircle size={18} />
                            </button>
                            <button 
                              className="text-dark-400 hover:text-dark-600"
                              title="Ignorer l'alerte"
                              onClick={() => updateAlertStatus(alert.id, 'ignored')}
                            >
                              <XCircle size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Detection;