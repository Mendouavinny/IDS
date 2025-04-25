import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Home } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();
  
  return (
    <div className="container-section flex flex-col items-center justify-center py-16">
      <AlertTriangle className="h-20 w-20 text-warning-500 mb-6" />
      
      <h1 className="text-4xl font-bold text-dark-800 mb-4">Page Non Trouvée</h1>
      
      <p className="text-dark-600 text-center max-w-lg mb-8">
        La page que vous recherchez n'existe pas ou a été déplacée.
      </p>
      
      <button 
        onClick={() => navigate('/')}
        className="btn btn-primary flex items-center"
      >
        <Home className="h-5 w-5 mr-2" />
        Retour à l'accueil
      </button>
    </div>
  );
};

export default NotFound;