import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, Home, BarChart3, Info, LogOut, Menu, X, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export const Navigation: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated, user, logout, checkAuth } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/dashboard', label: 'Dashboard', icon: BarChart3, protected: true },
    { path: '/profile', label: 'Profile', icon: User, protected: true },
    { path: '/about', label: 'About', icon: Info },
  ];

  const visibleNavItems = navItems.filter(item => !item.protected || isAuthenticated);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-gray-100/50">
        <div className="container-wide">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/25 group-hover:shadow-primary-500/40 transition-all duration-200">
                  <Sparkles size={18} className="text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full opacity-80"></div>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xl text-gray-900 tracking-tight">ANIDHI</span>
                <span className="text-xs text-gray-500 -mt-1">Personal Branding</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {visibleNavItems.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    location.pathname === path
                      ? 'text-primary-700 bg-primary-50 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={16} />
                  <span>{label}</span>
                </Link>
              ))}
            </div>

            {/* Desktop Auth Section */}
            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-50 rounded-xl">
                    <div className="w-6 h-6 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-medium">
                        {user?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {user?.name}
                    </span>
                  </div>
                  <button
                    onClick={() => logout()}
                    className="flex items-center space-x-1 px-3 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl transition-all duration-200"
                  >
                    <LogOut size={16} />
                    <span className="text-sm">Logout</span>
                  </button>
                </div>
              ) : (
                <Link
                  to="/auth"
                  className="btn-primary"
                >
                  Get Started
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={toggleMobileMenu} />
          <div className="fixed top-16 left-0 right-0 glass-dark border-b border-gray-700/20 animate-slide-down">
            <div className="container-wide py-4">
              <div className="space-y-2">
                {visibleNavItems.map(({ path, label, icon: Icon }) => (
                  <Link
                    key={path}
                    to={path}
                    onClick={toggleMobileMenu}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      location.pathname === path
                        ? 'text-white bg-primary-600'
                        : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                    }`}
                  >
                    <Icon size={18} />
                    <span>{label}</span>
                  </Link>
                ))}
                
                {/* Mobile Auth Section */}
                <div className="pt-4 mt-4 border-t border-gray-700/20">
                  {isAuthenticated ? (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3 px-4 py-2 text-gray-300">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {user?.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium">{user?.name}</span>
                      </div>
                      <button
                        onClick={() => {
                          logout();
                          toggleMobileMenu();
                        }}
                        className="flex items-center space-x-3 px-4 py-3 w-full text-left text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-xl transition-all duration-200"
                      >
                        <LogOut size={18} />
                        <span>Logout</span>
                      </button>
                    </div>
                  ) : (
                    <Link
                      to="/auth"
                      onClick={toggleMobileMenu}
                      className="block w-full btn-primary text-center"
                    >
                      Get Started
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};