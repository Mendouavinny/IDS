import { useState, useRef, ChangeEvent } from 'react';
import { Upload, FileType, CheckCircle, XCircle, Eye, AlertTriangle, RefreshCw } from 'lucide-react';
import { Pie } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';

Chart.register(ArcElement, Tooltip, Legend);

interface FilePreview {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  preview: string[][];
  columns: string[];
  valid: boolean;
  errors: string[];
}

interface Statistics {
  protocolDistribution: Record<string, number>;
  sourceDistribution: Record<string, number>;
  totalRecords: number;
}

const DataUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<FilePreview | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      processFile(selectedFile);
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      processFile(droppedFile);
    }
  };
  
  const processFile = (file: File) => {
    setIsProcessing(true);
    setUploadSuccess(false);
    
    // Check file type
    const validTypes = ['text/csv', 'application/json', 'application/vnd.ms-excel'];
    const isValidType = validTypes.includes(file.type) || file.name.endsWith('.csv') || file.name.endsWith('.json');
    
    if (!isValidType) {
      setFilePreview({
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        preview: [],
        columns: [],
        valid: false,
        errors: ['Type de fichier non supporté. Veuillez utiliser CSV ou JSON.']
      });
      setIsProcessing(false);
      return;
    }
    
    // Read file
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const result = e.target?.result as string;
        
        if (file.name.endsWith('.csv') || file.type === 'text/csv' || file.type === 'application/vnd.ms-excel') {
          // Process CSV
          const lines = result.split('\n');
          const headers = lines[0].split(',').map(h => h.trim());
          
          // Check required columns
          const requiredColumns = ['timestamp', 'source', 'destination', 'protocol'];
          const missingColumns = requiredColumns.filter(col => 
            !headers.some(h => h.toLowerCase() === col.toLowerCase())
          );
          
          if (missingColumns.length > 0) {
            setFilePreview({
              name: file.name,
              size: file.size,
              type: file.type,
              lastModified: file.lastModified,
              preview: [],
              columns: headers,
              valid: false,
              errors: [`Colonnes requises manquantes: ${missingColumns.join(', ')}`]
            });
            setIsProcessing(false);
            return;
          }
          
          // Create preview (max 10 rows)
          const dataRows = lines.slice(1, 11).map(line => line.split(',').map(cell => cell.trim()));
          
          setFilePreview({
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified,
            preview: dataRows,
            columns: headers,
            valid: true,
            errors: []
          });
          
          // Generate statistics
          generateStatistics(headers, lines.slice(1));
          
        } else if (file.name.endsWith('.json') || file.type === 'application/json') {
          // Process JSON
          const jsonData = JSON.parse(result);
          
          // Check if it's an array
          if (!Array.isArray(jsonData)) {
            setFilePreview({
              name: file.name,
              size: file.size,
              type: file.type,
              lastModified: file.lastModified,
              preview: [],
              columns: [],
              valid: false,
              errors: ['Le fichier JSON doit contenir un tableau d\'objets.']
            });
            setIsProcessing(false);
            return;
          }
          
          // Get columns from first object
          const firstObject = jsonData[0] || {};
          const columns = Object.keys(firstObject);
          
          // Check required columns
          const requiredColumns = ['timestamp', 'source', 'destination', 'protocol'];
          const missingColumns = requiredColumns.filter(col => 
            !columns.some(c => c.toLowerCase() === col.toLowerCase())
          );
          
          if (missingColumns.length > 0) {
            setFilePreview({
              name: file.name,
              size: file.size,
              type: file.type,
              lastModified: file.lastModified,
              preview: [],
              columns,
              valid: false,
              errors: [`Colonnes requises manquantes: ${missingColumns.join(', ')}`]
            });
            setIsProcessing(false);
            return;
          }
          
          // Create preview (max 10 rows)
          const dataRows = jsonData.slice(0, 10).map(row => 
            columns.map(col => String(row[col] || ''))
          );
          
          setFilePreview({
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified,
            preview: dataRows,
            columns,
            valid: true,
            errors: []
          });
          
          // Generate statistics from JSON
          const protocolIndex = columns.findIndex(c => c.toLowerCase() === 'protocol');
          const sourceIndex = columns.findIndex(c => c.toLowerCase() === 'source');
          
          const protocols: Record<string, number> = {};
          const sources: Record<string, number> = {};
          
          jsonData.forEach((row: any) => {
            const protocol = row[columns[protocolIndex]];
            if (protocol) {
              protocols[protocol] = (protocols[protocol] || 0) + 1;
            }
            
            const source = row[columns[sourceIndex]];
            if (source) {
              sources[source] = (sources[source] || 0) + 1;
            }
          });
          
          setStatistics({
            protocolDistribution: protocols,
            sourceDistribution: sources,
            totalRecords: jsonData.length
          });
        }
      } catch (error) {
        console.error('Error processing file:', error);
        setFilePreview({
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
          preview: [],
          columns: [],
          valid: false,
          errors: ['Erreur de traitement du fichier. Vérifiez le format et réessayez.']
        });
      }
      
      setIsProcessing(false);
    };
    
    reader.onerror = () => {
      setFilePreview({
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        preview: [],
        columns: [],
        valid: false,
        errors: ['Erreur de lecture du fichier.']
      });
      setIsProcessing(false);
    };
    
    reader.readAsText(file);
  };
  
  const generateStatistics = (headers: string[], dataRows: string[]) => {
    // Find column indices
    const protocolIndex = headers.findIndex(h => h.toLowerCase() === 'protocol');
    const sourceIndex = headers.findIndex(h => h.toLowerCase() === 'source');
    
    // Count protocols and sources
    const protocols: Record<string, number> = {};
    const sources: Record<string, number> = {};
    
    dataRows.forEach(row => {
      const rowData = row.split(',').map(cell => cell.trim());
      
      if (rowData.length > protocolIndex) {
        const protocol = rowData[protocolIndex];
        if (protocol) {
          protocols[protocol] = (protocols[protocol] || 0) + 1;
        }
      }
      
      if (rowData.length > sourceIndex) {
        const source = rowData[sourceIndex];
        if (source) {
          sources[source] = (sources[source] || 0) + 1;
        }
      }
    });
    
    setStatistics({
      protocolDistribution: protocols,
      sourceDistribution: sources,
      totalRecords: dataRows.length
    });
  };
  
  const uploadData = () => {
    if (!filePreview || !filePreview.valid) return;
    
    setIsProcessing(true);
    
    // Simulate API upload
    setTimeout(() => {
      setUploadSuccess(true);
      setIsProcessing(false);
    }, 2000);
  };
  
  const resetForm = () => {
    setFile(null);
    setFilePreview(null);
    setStatistics(null);
    setUploadSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // Prepare chart data
  const getProtocolChartData = () => {
    if (!statistics) return null;
    
    // Get top 5 protocols
    const topProtocols = Object.entries(statistics.protocolDistribution)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    // Calculate others
    const totalProtocols = Object.values(statistics.protocolDistribution).reduce((a, b) => a + b, 0);
    const topProtocolsTotal = topProtocols.reduce((acc, [_, count]) => acc + count, 0);
    const others = totalProtocols - topProtocolsTotal;
    
    const labels = [...topProtocols.map(([protocol]) => protocol)];
    const data = [...topProtocols.map(([_, count]) => count)];
    
    if (others > 0) {
      labels.push('Autres');
      data.push(others);
    }
    
    return {
      labels,
      datasets: [
        {
          data,
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
  };
  
  const getSourceChartData = () => {
    if (!statistics) return null;
    
    // Get top 5 sources
    const topSources = Object.entries(statistics.sourceDistribution)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    // Calculate others
    const totalSources = Object.values(statistics.sourceDistribution).reduce((a, b) => a + b, 0);
    const topSourcesTotal = topSources.reduce((acc, [_, count]) => acc + count, 0);
    const others = totalSources - topSourcesTotal;
    
    const labels = [...topSources.map(([source]) => source)];
    const data = [...topSources.map(([_, count]) => count)];
    
    if (others > 0) {
      labels.push('Autres');
      data.push(others);
    }
    
    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: [
            '#14b8a6', // secondary-500
            '#4b52e6', // primary-600
            '#f97316', // accent-500
            '#f59e0b', // warning-500
            '#ef4444', // danger-500
            '#64748b', // dark-500
          ],
          borderWidth: 1,
        },
      ],
    };
  };
  
  // Chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
    },
  };
  
  return (
    <div className="container-section">
      <h1 className="section-title flex items-center">
        <Upload className="mr-2 h-6 w-6 text-primary-600" />
        Importer des Données
      </h1>
      
      <div className="mb-6">
        <p className="text-dark-600">
          Importez des fichiers de logs réseau pour analyse et détection d'anomalies.
        </p>
      </div>
      
      {/* File upload area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="card">
            <h3 className="font-medium text-lg mb-4">Importer un fichier</h3>
            
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center ${
                isDragging ? 'border-primary-500 bg-primary-50' : 'border-dark-300'
              } ${uploadSuccess ? 'border-success-500 bg-success-50' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {uploadSuccess ? (
                <div className="flex flex-col items-center">
                  <CheckCircle className="h-12 w-12 text-success-500 mb-3" />
                  <p className="text-success-700 font-medium">Fichier importé avec succès!</p>
                  <p className="text-dark-500 text-sm mt-1">
                    {filePreview?.name}
                  </p>
                  <button 
                    className="mt-4 btn btn-primary"
                    onClick={resetForm}
                  >
                    Importer un autre fichier
                  </button>
                </div>
              ) : (
                <>
                  <FileType className="h-12 w-12 text-dark-400 mx-auto mb-4" />
                  <p className="text-dark-500 mb-2">
                    Glissez-déposez votre fichier ou
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.json"
                    onChange={handleFileChange}
                    className="hidden"
                    id="fileInput"
                  />
                  <button 
                    className="btn btn-primary"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessing}
                  >
                    Parcourir
                  </button>
                  <p className="text-dark-400 text-xs mt-4">
                    Formats acceptés: CSV, JSON
                  </p>
                </>
              )}
            </div>
            
            {/* File requirements */}
            <div className="mt-6">
              <h4 className="font-medium text-dark-700 mb-2">Exigences du fichier</h4>
              <ul className="space-y-2 text-sm text-dark-600">
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-success-500 mr-2 mt-0.5" />
                  Format: CSV ou JSON
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-success-500 mr-2 mt-0.5" />
                  Colonnes requises: timestamp, source, destination, protocol
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-success-500 mr-2 mt-0.5" />
                  Taille maximum: 10MB
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-success-500 mr-2 mt-0.5" />
                  Encodage: UTF-8
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-2">
          {/* File preview area */}
          {isProcessing ? (
            <div className="card flex flex-col items-center justify-center py-10">
              <div className="loading-spinner mb-4"></div>
              <p className="text-dark-600">Traitement du fichier...</p>
            </div>
          ) : filePreview ? (
            <div className="card">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-medium text-lg">Aperçu du fichier</h3>
                  <p className="text-dark-500 text-sm">
                    {filePreview.name} ({formatFileSize(filePreview.size)})
                  </p>
                </div>
                
                {filePreview.valid && !uploadSuccess && (
                  <button 
                    className="btn btn-primary flex items-center"
                    onClick={uploadData}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Importer les données
                  </button>
                )}
              </div>
              
              {!filePreview.valid ? (
                <div className="bg-danger-50 border-l-4 border-danger-500 p-4 rounded-md text-danger-700 mb-4">
                  <div className="flex">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    <div>
                      <p className="font-medium">Erreur de validation</p>
                      <ul className="list-disc list-inside mt-1">
                        {filePreview.errors.map((error, i) => (
                          <li key={i} className="text-sm">{error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ) : null}
              
              {/* Preview table */}
              {filePreview.columns.length > 0 && filePreview.preview.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-dark-200">
                    <thead className="bg-dark-50">
                      <tr>
                        {filePreview.columns.map((column, i) => (
                          <th 
                            key={i} 
                            scope="col" 
                            className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider"
                          >
                            {column}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-dark-200">
                      {filePreview.preview.map((row, rowIndex) => (
                        <tr key={rowIndex} className="hover:bg-dark-50">
                          {row.map((cell, cellIndex) => (
                            <td 
                              key={cellIndex} 
                              className="px-6 py-4 whitespace-nowrap text-sm text-dark-500"
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              {/* Charts */}
              {statistics && (
                <div className="mt-6">
                  <h3 className="font-medium text-lg mb-4">Aperçu des Statistiques</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-center font-medium text-dark-600 mb-2">Distribution des Protocoles</h4>
                      <div className="h-56">
                        <Pie data={getProtocolChartData() || {labels:[], datasets:[]}} options={chartOptions} />
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-center font-medium text-dark-600 mb-2">Top 5 Sources</h4>
                      <div className="h-56">
                        <Pie data={getSourceChartData() || {labels:[], datasets:[]}} options={chartOptions} />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 bg-primary-50 p-3 rounded-md text-primary-700 text-sm">
                    <div className="flex items-start">
                      <Eye className="h-5 w-5 mr-2 mt-0.5" />
                      <div>
                        <p className="font-medium">Aperçu des données</p>
                        <p>Nombre total d'enregistrements: {statistics.totalRecords}</p>
                        <p>Nombre de protocoles distincts: {Object.keys(statistics.protocolDistribution).length}</p>
                        <p>Nombre de sources distinctes: {Object.keys(statistics.sourceDistribution).length}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="card flex flex-col items-center justify-center py-12 bg-dark-50">
              <FileType className="h-16 w-16 text-dark-300 mb-4" />
              <p className="text-dark-500 text-lg">Aucun fichier sélectionné</p>
              <p className="text-dark-400 text-sm">
                Veuillez importer un fichier pour voir l'aperçu et les statistiques
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataUpload;