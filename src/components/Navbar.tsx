import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Shield, Activity, BarChart3, FileText, Upload, Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <NavLink to="/" className="text-xl font-bold text-primary-600 flex items-center">
                <Shield className="h-6 w-6 mr-2" />
                FIRST TECH
              </NavLink>
            </div>
          </div>
          
          {/* Desktop menu */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <NavLink 
              to="/" 
              className={({ isActive }) => 
                `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-primary-100 text-primary-700' 
                    : 'text-dark-600 hover:bg-dark-100'
                }`
              }
              end
            >
              Accueil
            </NavLink>
            <NavLink 
              to="/detection" 
              className={({ isActive }) => 
                `px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors ${
                  isActive 
                    ? 'bg-primary-100 text-primary-700' 
                    : 'text-dark-600 hover:bg-dark-100'
                }`
              }
            >
              <Shield className="h-4 w-4 mr-1" />
              Détection
            </NavLink>
            <NavLink 
              to="/realtime-analysis" 
              className={({ isActive }) => 
                `px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors ${
                  isActive 
                    ? 'bg-primary-100 text-primary-700' 
                    : 'text-dark-600 hover:bg-dark-100'
                }`
              }
            >
              <Activity className="h-4 w-4 mr-1" />
              Temps Réel
            </NavLink>
            <NavLink 
              to="/network-analysis" 
              className={({ isActive }) => 
                `px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors ${
                  isActive 
                    ? 'bg-primary-100 text-primary-700' 
                    : 'text-dark-600 hover:bg-dark-100'
                }`
              }
            >
              <BarChart3 className="h-4 w-4 mr-1" />
              Analyse
            </NavLink>
            <NavLink 
              to="/reports" 
              className={({ isActive }) => 
                `px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors ${
                  isActive 
                    ? 'bg-primary-100 text-primary-700' 
                    : 'text-dark-600 hover:bg-dark-100'
                }`
              }
            >
              <FileText className="h-4 w-4 mr-1" />
              Rapports
            </NavLink>
            <NavLink 
              to="/upload" 
              className={({ isActive }) => 
                `px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors ${
                  isActive 
                    ? 'bg-primary-100 text-primary-700' 
                    : 'text-dark-600 hover:bg-dark-100'
                }`
              }
            >
              <Upload className="h-4 w-4 mr-1" />
              Ajouter Données
            </NavLink>
          </div>
          
          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <button 
              onClick={toggleMenu}
              className="p-2 rounded-md text-dark-500 hover:text-dark-700 hover:bg-dark-100 focus:outline-none"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white">
            <NavLink 
              to="/" 
              className={({ isActive }) => 
                `block px-3 py-2 rounded-md text-base font-medium ${
                  isActive 
                    ? 'bg-primary-100 text-primary-700' 
                    : 'text-dark-600 hover:bg-dark-100'
                }`
              }
              onClick={() => setIsMenuOpen(false)}
              end
            >
              Accueil
            </NavLink>
            <NavLink 
              to="/detection" 
              className={({ isActive }) => 
                `block px-3 py-2 rounded-md text-base font-medium ${
                  isActive 
                    ? 'bg-primary-100 text-primary-700' 
                    : 'text-dark-600 hover:bg-dark-100'
                }`
              }
              onClick={() => setIsMenuOpen(false)}
            >
              Détection
            </NavLink>
            <NavLink 
              to="/realtime-analysis" 
              className={({ isActive }) => 
                `block px-3 py-2 rounded-md text-base font-medium ${
                  isActive 
                    ? 'bg-primary-100 text-primary-700' 
                    : 'text-dark-600 hover:bg-dark-100'
                }`
              }
              onClick={() => setIsMenuOpen(false)}
            >
              Temps Réel
            </NavLink>
            <NavLink 
              to="/network-analysis" 
              className={({ isActive }) => 
                `block px-3 py-2 rounded-md text-base font-medium ${
                  isActive 
                    ? 'bg-primary-100 text-primary-700' 
                    : 'text-dark-600 hover:bg-dark-100'
                }`
              }
              onClick={() => setIsMenuOpen(false)}
            >
              Analyse
            </NavLink>
            <NavLink 
              to="/reports" 
              className={({ isActive }) => 
                `block px-3 py-2 rounded-md text-base font-medium ${
                  isActive 
                    ? 'bg-primary-100 text-primary-700' 
                    : 'text-dark-600 hover:bg-dark-100'
                }`
              }
              onClick={() => setIsMenuOpen(false)}
            >
              Rapports
            </NavLink>
            <NavLink 
              to="/upload" 
              className={({ isActive }) => 
                `block px-3 py-2 rounded-md text-base font-medium ${
                  isActive 
                    ? 'bg-primary-100 text-primary-700' 
                    : 'text-dark-600 hover:bg-dark-100'
                }`
              }
              onClick={() => setIsMenuOpen(false)}
            >
              Ajouter Données
            </NavLink>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;