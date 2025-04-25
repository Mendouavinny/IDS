import { useState, useEffect } from 'react';
import { FileText, Calendar, Download, ArrowDown, Filter, Clock } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import { 
  Chart, 
  BarElement, 
  CategoryScale, 
  LinearScale, 
  Title, 
  Tooltip, 
  Legend
} from 'chart.js';
// Mock import for PDF generation - in real app would use jspdf
import { jsPDF } from 'jspdf';

Chart.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);

interface Report {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  type: 'security' | 'performance' | 'traffic' | 'audit';
  status: 'generated' | 'pending';
  size: string;
}

const mockReports: Report[] = [
  {
    id: '1',
    name: 'Rapport de Sécurité Mensuel',
    description: 'Analyse complète des menaces et vulnérabilités détectées au cours du dernier mois',
    createdAt: new Date(),
    type: 'security',
    status: 'generated',
    size: '2.4 MB'
  },
  {
    id: '2',
    name: 'Analyse de Performance Réseau',
    description: 'Mesures de performance du réseau incluant latence, bande passante et congestion',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    type: 'performance',
    status: 'generated',
    size: '1.8 MB'
  },
  {
    id: '3',
    name: 'Audit de Trafic Hebdomadaire',
    description: 'Distribution du trafic réseau par protocole, source et destination',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    type: 'traffic',
    status: 'generated',
    size: '3.2 MB'
  },
  {
    id: '4',
    name: 'Rapport d\'Audit de Conformité',
    description: 'Évaluation de la conformité aux politiques de sécurité et réglementations',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    type: 'audit',
    status: 'generated',
    size: '5.1 MB'
  },
  {
    id: '5',
    name: 'Analyse des Tentatives d\'Intrusion',
    description: 'Détail des tentatives d\'intrusion et actions prises pour les contrer',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    type: 'security',
    status: 'generated',
    size: '1.5 MB'
  }
];

// Security stats for chart
const securityStats = {
  labels: ['Intrusions', 'Malware', 'Vulnérabilités', 'Accès Non Autorisés', 'Mauvaise Config.'],
  datasets: [
    {
      label: 'Incidents Détectés',
      data: [12, 8, 15, 5, 9],
      backgroundColor: '#ef4444',
    },
    {
      label: 'Incidents Résolus',
      data: [10, 7, 9, 4, 8],
      backgroundColor: '#22c55e',
    }
  ]
};

// Performance stats for chart
const performanceStats = {
  labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
  datasets: [
    {
      label: 'Latence Moyenne (ms)',
      data: [45, 35, 60, 48, 52, 30, 28],
      backgroundColor: '#4b52e6',
    },
    {
      label: 'Perte de Paquets (%)',
      data: [0.5, 0.3, 1.2, 0.8, 0.4, 0.2, 0.1],
      backgroundColor: '#f97316',
    }
  ]
};

const Reports = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [generatingReport, setGeneratingReport] = useState(false);
  
  // Report types for UI
  const reportTypes = [
    { value: 'security', label: 'Sécurité', color: 'danger' },
    { value: 'performance', label: 'Performance', color: 'primary' },
    { value: 'traffic', label: 'Trafic', color: 'accent' },
    { value: 'audit', label: 'Audit', color: 'warning' },
  ];
  
  // Load reports
  useEffect(() => {
    const timer = setTimeout(() => {
      setReports(mockReports);
      setFilteredReports(mockReports);
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...reports];
    
    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(report => report.type === typeFilter);
    }
    
    // Sort
    filtered.sort((a, b) => {
      if (sortOrder === 'newest') {
        return b.createdAt.getTime() - a.createdAt.getTime();
      } else {
        return a.createdAt.getTime() - b.createdAt.getTime();
      }
    });
    
    setFilteredReports(filtered);
  }, [reports, typeFilter, sortOrder]);
  
  // Generate a new report
  const generateReport = (type: string) => {
    setGeneratingReport(true);
    
    // Simulate report generation
    setTimeout(() => {
      const newReport: Report = {
        id: `new-${Date.now()}`,
        name: `Nouveau Rapport de ${type === 'security' ? 'Sécurité' : 
               type === 'performance' ? 'Performance' : 
               type === 'traffic' ? 'Trafic' : 'Audit'}`,
        description: 'Rapport généré automatiquement basé sur les données actuelles',
        createdAt: new Date(),
        type: type as any,
        status: 'generated',
        size: `${(Math.random() * 5).toFixed(1)} MB`
      };
      
      setReports(prev => [newReport, ...prev]);
      setGeneratingReport(false);
    }, 3000);
  };
  
  // Download a report (mock)
  const downloadReport = (report: Report) => {
    try {
      const doc = new jsPDF();
      
      // Title
      doc.setFontSize(20);
      doc.text(report.name, 20, 20);
      
      // Report info
      doc.setFontSize(12);
      doc.text(`Généré le: ${report.createdAt.toLocaleString('fr-FR')}`, 20, 35);
      doc.text(`Type: ${report.type}`, 20, 45);
      doc.text(`Description: ${report.description}`, 20, 55);
      
      // Content would be added here in a real application
      doc.text("Contenu du rapport...", 20, 70);
      
      doc.save(`${report.name.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error("Erreur lors de l'export PDF:", error);
      alert("Erreur lors du téléchargement du rapport. Veuillez réessayer.");
    }
  };
  
  // Get type badge class
  const getTypeBadgeClass = (type: Report['type']) => {
    switch (type) {
      case 'security':
        return 'badge-danger';
      case 'performance':
        return 'badge-primary';
      case 'traffic':
        return 'badge-accent';
      case 'audit':
        return 'badge-warning';
    }
  };
  
  // Chart options
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
        <FileText className="mr-2 h-6 w-6 text-primary-600" />
        Rapports
      </h1>
      
      <div className="mb-6">
        <p className="text-dark-600">
          Consultez, générez et téléchargez des rapports d'analyse réseau et de sécurité.
        </p>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="loading-spinner"></div>
        </div>
      ) : (
        <>
          {/* Report summaries */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="card">
              <h3 className="font-medium text-lg mb-4">Résumé de Sécurité</h3>
              <div className="h-64">
                <Bar data={securityStats} options={barOptions} />
              </div>
            </div>
            
            <div className="card">
              <h3 className="font-medium text-lg mb-4">Performances Réseau</h3>
              <div className="h-64">
                <Bar data={performanceStats} options={barOptions} />
              </div>
            </div>
          </div>
          
          {/* Generate report card */}
          <div className="card mb-8">
            <h3 className="font-medium text-lg mb-4">Générer un Nouveau Rapport</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {reportTypes.map(type => (
                <button
                  key={type.value}
                  onClick={() => generateReport(type.value)}
                  disabled={generatingReport}
                  className={`p-4 rounded-lg border-2 border-${type.color}-500 bg-${type.color}-50 hover:bg-${type.color}-100 transition-colors flex flex-col items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <FileText className={`h-8 w-8 mb-2 text-${type.color}-600`} />
                  <span className="font-medium">{type.label}</span>
                </button>
              ))}
            </div>
            
            {generatingReport && (
              <div className="mt-4 p-3 bg-primary-50 rounded-md flex items-center">
                <div className="loading-spinner mr-3" style={{ width: 20, height: 20 }}></div>
                <span className="text-primary-700">Génération du rapport en cours...</span>
              </div>
            )}
          </div>
          
          {/* Reports list */}
          <div className="card">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <h3 className="font-medium text-lg mb-3 sm:mb-0">Rapports Disponibles</h3>
              
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                <div className="flex items-center">
                  <Filter className="h-4 w-4 mr-1 text-dark-400" />
                  <select 
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="px-2 py-1 border border-dark-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-400"
                  >
                    <option value="all">Tous types</option>
                    <option value="security">Sécurité</option>
                    <option value="performance">Performance</option>
                    <option value="traffic">Trafic</option>
                    <option value="audit">Audit</option>
                  </select>
                </div>
                
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1 text-dark-400" />
                  <select 
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="px-2 py-1 border border-dark-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-400"
                  >
                    <option value="newest">Plus récents</option>
                    <option value="oldest">Plus anciens</option>
                  </select>
                </div>
              </div>
            </div>
            
            {filteredReports.length === 0 ? (
              <div className="bg-dark-50 p-6 rounded text-center text-dark-500">
                Aucun rapport ne correspond aux filtres sélectionnés.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredReports.map(report => (
                  <div key={report.id} className="p-4 bg-white border border-dark-200 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 mr-2 text-primary-600" />
                          <h4 className="font-medium text-dark-800">{report.name}</h4>
                          <span className={`badge ml-3 ${getTypeBadgeClass(report.type)}`}>
                            {report.type === 'security' ? 'Sécurité' : 
                             report.type === 'performance' ? 'Performance' : 
                             report.type === 'traffic' ? 'Trafic' : 'Audit'}
                          </span>
                        </div>
                        
                        <p className="text-dark-500 text-sm mt-1 ml-7">
                          {report.description}
                        </p>
                        
                        <div className="flex items-center mt-2 ml-7 text-xs text-dark-400">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>
                            Généré le {report.createdAt.toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          <span className="mx-2">•</span>
                          <span>{report.size}</span>
                        </div>
                      </div>
                      
                      <div className="ml-7 md:ml-0 mt-3 md:mt-0">
                        <button 
                          onClick={() => downloadReport(report)}
                          className="btn btn-primary flex items-center"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Télécharger
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Reports;