import { Heart } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-dark-800 text-white py-6">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <p className="text-sm">
              &copy; {currentYear} FISRT TECH - Plateforme de Sécurité Réseau
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <p className="text-sm flex items-center">
              Conçu avec <Heart className="h-4 w-4 mx-1 text-danger-400" /> pour votre sécurité
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;