import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Menu, X, LayoutDashboard, Receipt, ChartBar as BarChart3, Users, LogOut, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { path: '/transactions', label: 'Transactions', icon: <Receipt size={18} /> },
    { path: '/analytics', label: 'Analytics', icon: <BarChart3 size={18} /> },
    { path: '/reports', label: 'Reports', icon: <BarChart3 size={18} /> },
    { path: '/expense-manager', label: 'Expense Manager', icon: <Users size={18} /> },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-[#0A84FF] font-bold text-xl">FinTracker</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8 items-center">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === link.path
                    ? 'text-[#0A84FF] bg-[#F5F5F7]'
                    : 'text-[#1D1D1F] hover:text-[#0A84FF] hover:bg-[#F5F5F7]'
                }`}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            ))}
            
            {/* User Info and Logout */}
            {user && (
              <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-gray-200">
                <div className="flex items-center space-x-2 text-sm">
                  <User size={16} className="text-gray-600" />
                  <span className="text-gray-700 font-medium">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-[#1D1D1F] hover:text-[#0A84FF] hover:bg-[#F5F5F7] focus:outline-none"
              aria-controls="mobile-menu"
              aria-expanded={isMenuOpen}
              onClick={toggleMenu}
            >
              <span className="sr-only">{isMenuOpen ? 'Close menu' : 'Open menu'}</span>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden transition-all duration-300 ease-in-out transform ${
          isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
        } overflow-hidden bg-white shadow-lg`}
        id="mobile-menu"
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center space-x-3 px-3 py-3 rounded-md text-base font-medium ${
                location.pathname === link.path
                  ? 'text-[#0A84FF] bg-[#F5F5F7]'
                  : 'text-[#1D1D1F] hover:text-[#0A84FF] hover:bg-[#F5F5F7]'
              }`}
              onClick={closeMenu}
            >
              {link.icon}
              <span>{link.label}</span>
            </Link>
          ))}
          
          {/* Mobile User Info and Logout */}
          {user && (
            <>
              <div className="px-3 py-3 border-t border-gray-200">
                <div className="flex items-center space-x-2 text-sm text-gray-700">
                  <User size={16} className="text-gray-600" />
                  <span className="font-medium">{user.name}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  closeMenu();
                  handleLogout();
                }}
                className="w-full flex items-center space-x-3 px-3 py-3 rounded-md text-base font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
