import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Menu, X, LayoutDashboard, Receipt, ChartBar as BarChart3, Users } from 'lucide-react';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

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
          <nav className="hidden md:flex space-x-8">
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
        </div>
      </div>
    </header>
  );
};

export default Header;