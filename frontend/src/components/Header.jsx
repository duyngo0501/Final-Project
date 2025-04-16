import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCartIcon, UserIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // This will be replaced with actual auth state

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-gray-800 text-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-white hover:text-gray-300 transition">
            GameStore
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6">
            <Link to="/" className="hover:text-gray-300 transition">
              Home
            </Link>
            <Link to="/games" className="hover:text-gray-300 transition">
              Games
            </Link>
            <Link to="/cart" className="hover:text-gray-300 transition flex items-center">
              <ShoppingCartIcon className="h-5 w-5 mr-1" />
              Cart
            </Link>
            {isLoggedIn ? (
              <Link to="/profile" className="hover:text-gray-300 transition flex items-center">
                <UserIcon className="h-5 w-5 mr-1" />
                Profile
              </Link>
            ) : (
              <Link to="/login" className="hover:text-gray-300 transition">
                Login
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-white focus:outline-none"
            onClick={toggleMenu}
          >
            {isMenuOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-4">
            <div className="flex flex-col space-y-3">
              <Link 
                to="/" 
                className="hover:text-gray-300 transition py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/games" 
                className="hover:text-gray-300 transition py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Games
              </Link>
              <Link 
                to="/cart" 
                className="hover:text-gray-300 transition py-2 flex items-center"
                onClick={() => setIsMenuOpen(false)}
              >
                <ShoppingCartIcon className="h-5 w-5 mr-1" />
                Cart
              </Link>
              {isLoggedIn ? (
                <Link 
                  to="/profile" 
                  className="hover:text-gray-300 transition py-2 flex items-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <UserIcon className="h-5 w-5 mr-1" />
                  Profile
                </Link>
              ) : (
                <Link 
                  to="/login" 
                  className="hover:text-gray-300 transition py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header; 