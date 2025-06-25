import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Target, CheckSquare, Clock, Menu, X, Wallet } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const getActiveStyles = (path: string) => {
    const isActive = currentPath === path;
    const baseStyles =
      "group relative px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4";

    if (isActive) {
      switch (path) {
        case "/habits":
          return `${baseStyles} bg-gradient-to-r from-purple-600 via-violet-600 to-purple-700 hover:shadow-lg hover:shadow-purple-500/25 focus:ring-purple-500/50`;
        case "/todo":
          return `${baseStyles} bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 hover:shadow-lg hover:shadow-blue-500/25 focus:ring-blue-500/50`;
        case "/pomodoro":
          return `${baseStyles} bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 hover:shadow-lg hover:shadow-orange-500/25 focus:ring-orange-500/50`;
        case "/finance-tracker":
          return `${baseStyles} bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:shadow-lg hover:shadow-emerald-500/25 focus:ring-emerald-500/50`;
        default:
          return `${baseStyles} bg-gradient-to-r from-gray-600 to-gray-700`;
      }
    }

    return `${baseStyles} text-gray-300 hover:text-white hover:bg-gray-700/50`;
  };

  const getActiveGlow = (path: string) => {
    const isActive = currentPath === path;
    if (!isActive) return null;

    let gradientClass = "";
    switch (path) {
      case "/habits":
        gradientClass = "from-purple-600 via-violet-600 to-purple-700";
        break;
      case "/todo":
        gradientClass = "from-blue-600 via-cyan-600 to-blue-700";
        break;
      case "/pomodoro":
        gradientClass = "from-orange-600 via-red-600 to-orange-700";
        break;
      case "/finance-tracker":
        gradientClass = "from-emerald-600 via-teal-600 to-emerald-700";
        break;
    }

    return (
      <div
        className={`absolute inset-0 bg-gradient-to-r ${gradientClass} rounded-lg blur opacity-75 group-hover:opacity-100 transition-opacity duration-300`}
      ></div>
    );
  };

  const NavLink = ({
    to,
    icon: Icon,
    children,
  }: {
    to: string;
    icon: any;
    children: React.ReactNode;
  }) => (
    <Link to={to} onClick={closeMobileMenu} className={getActiveStyles(to)}>
      {getActiveGlow(to)}
      <div className="relative flex items-center gap-2">
        <Icon size={18} />
        {children}
      </div>
    </Link>
  );

  return (
    <nav className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm border-b border-gray-700/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="text-xl font-bold bg-gradient-to-r from-purple-400 via-violet-400 to-purple-600 bg-clip-text text-transparent"
            onClick={closeMobileMenu}
          >
            Taskify
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <NavLink to="/habits" icon={Target}>
              Habits
            </NavLink>
            <NavLink to="/todo" icon={CheckSquare}>
              Todo List
            </NavLink>
            <NavLink to="/pomodoro" icon={Clock}>
              Pomodoro
            </NavLink>
            <NavLink to="/finance-tracker" icon={Wallet}>
              Finance
            </NavLink>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden mt-4 pb-4"
            >
              <div className="flex flex-col gap-2 bg-gray-800/30 rounded-lg p-4 border border-gray-700/30">
                <NavLink to="/habits" icon={Target}>
                  Habits
                </NavLink>
                <NavLink to="/todo" icon={CheckSquare}>
                  Todo List
                </NavLink>
                <NavLink to="/pomodoro" icon={Clock}>
                  Pomodoro
                </NavLink>
                <NavLink to="/finance-tracker" icon={Wallet}>
                  Finance
                </NavLink>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;
