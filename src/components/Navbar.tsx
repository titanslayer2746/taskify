import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Target,
  CheckSquare,
  Clock,
  Menu,
  X,
  Wallet,
  BookOpen,
  Heart,
  Moon,
} from "lucide-react";
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
    const isActive = currentPath === path || currentPath.startsWith(path + "/");
    const baseStyles =
      "group relative px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4";

    // Always show colors for each tab
    switch (path) {
      case "/habits":
        return isActive
          ? `${baseStyles} bg-gradient-to-r from-purple-600 via-violet-600 to-purple-700 hover:shadow-lg hover:shadow-purple-500/25 focus:ring-purple-500/50 text-white`
          : `${baseStyles} bg-gradient-to-r from-purple-500/20 via-violet-500/20 to-purple-600/20 hover:from-purple-500/30 hover:via-violet-500/30 hover:to-purple-600/30 text-purple-300 hover:text-purple-200 hover:shadow-lg hover:shadow-purple-500/25 focus:ring-purple-500/50`;
      case "/todo":
        return isActive
          ? `${baseStyles} bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 hover:shadow-lg hover:shadow-blue-500/25 focus:ring-blue-500/50 text-white`
          : `${baseStyles} bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-blue-600/20 hover:from-blue-500/30 hover:via-cyan-500/30 hover:to-blue-600/30 text-blue-300 hover:text-blue-200 hover:shadow-lg hover:shadow-blue-500/25 focus:ring-blue-500/50`;
      case "/pomodoro":
        return isActive
          ? `${baseStyles} bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 hover:shadow-lg hover:shadow-orange-500/25 focus:ring-orange-500/50 text-white`
          : `${baseStyles} bg-gradient-to-r from-orange-500/20 via-red-500/20 to-orange-600/20 hover:from-orange-500/30 hover:via-red-500/30 hover:to-orange-600/30 text-orange-300 hover:text-orange-200 hover:shadow-lg hover:shadow-orange-500/25 focus:ring-orange-500/50`;
      case "/finance-tracker":
        return isActive
          ? `${baseStyles} bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:shadow-lg hover:shadow-emerald-500/25 focus:ring-emerald-500/50 text-white`
          : `${baseStyles} bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-emerald-600/20 hover:from-emerald-500/30 hover:via-teal-500/30 hover:to-emerald-600/30 text-emerald-300 hover:text-emerald-200 hover:shadow-lg hover:shadow-emerald-500/25 focus:ring-emerald-500/50`;
      case "/journal":
        return isActive
          ? `${baseStyles} bg-gradient-to-r from-yellow-600 via-amber-600 to-yellow-700 hover:shadow-lg hover:shadow-yellow-500/25 focus:ring-yellow-500/50 text-white`
          : `${baseStyles} bg-gradient-to-r from-yellow-500/20 via-amber-500/20 to-yellow-600/20 hover:from-yellow-500/30 hover:via-amber-500/30 hover:to-yellow-600/30 text-yellow-300 hover:text-yellow-200 hover:shadow-lg hover:shadow-yellow-500/25 focus:ring-yellow-500/50`;
      case "/health":
        return isActive
          ? `${baseStyles} bg-gradient-to-r from-pink-600 via-rose-600 to-pink-700 hover:shadow-lg hover:shadow-pink-500/25 focus:ring-pink-500/50 text-white`
          : `${baseStyles} bg-gradient-to-r from-pink-500/20 via-rose-500/20 to-pink-600/20 hover:from-pink-500/30 hover:via-rose-500/30 hover:to-pink-600/30 text-pink-300 hover:text-pink-200 hover:shadow-lg hover:shadow-pink-500/25 focus:ring-pink-500/50`;
      case "/sleep":
        return isActive
          ? `${baseStyles} bg-gradient-to-r from-cyan-600 via-teal-600 to-cyan-700 hover:shadow-lg hover:shadow-cyan-500/25 focus:ring-cyan-500/50 text-white`
          : `${baseStyles} bg-gradient-to-r from-cyan-500/20 via-teal-500/20 to-cyan-600/20 hover:from-cyan-500/30 hover:via-teal-500/30 hover:to-cyan-600/30 text-cyan-300 hover:text-cyan-200 hover:shadow-lg hover:shadow-cyan-500/25 focus:ring-cyan-500/50`;
      default:
        return `${baseStyles} text-gray-300 hover:text-white hover:bg-gray-700/50`;
    }
  };

  const getActiveGlow = (path: string) => {
    const isActive = currentPath === path || currentPath.startsWith(path + "/");
    let gradientClass = "";

    switch (path) {
      case "/habits":
        gradientClass = isActive
          ? "from-purple-600 via-violet-600 to-purple-700"
          : "from-purple-500/30 via-violet-500/30 to-purple-600/30";
        break;
      case "/todo":
        gradientClass = isActive
          ? "from-blue-600 via-cyan-600 to-blue-700"
          : "from-blue-500/30 via-cyan-500/30 to-blue-600/30";
        break;
      case "/pomodoro":
        gradientClass = isActive
          ? "from-orange-600 via-red-600 to-orange-700"
          : "from-orange-500/30 via-red-500/30 to-orange-600/30";
        break;
      case "/finance-tracker":
        gradientClass = isActive
          ? "from-emerald-600 via-teal-600 to-emerald-700"
          : "from-emerald-500/30 via-teal-500/30 to-emerald-600/30";
        break;
      case "/journal":
        gradientClass = isActive
          ? "from-yellow-600 via-amber-600 to-yellow-700"
          : "from-yellow-500/30 via-amber-500/30 to-yellow-600/30";
        break;
      case "/health":
        gradientClass = isActive
          ? "from-pink-600 via-rose-600 to-pink-700"
          : "from-pink-500/30 via-rose-500/30 to-pink-600/30";
        break;
      case "/sleep":
        gradientClass = isActive
          ? "from-cyan-600 via-teal-600 to-cyan-700"
          : "from-cyan-500/30 via-teal-500/30 to-cyan-600/30";
        break;
      default:
        return null;
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
    icon: React.ElementType;
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
            className="text-xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent"
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
            <NavLink to="/journal" icon={BookOpen}>
              Journal
            </NavLink>
            <NavLink to="/health" icon={Heart}>
              Health
            </NavLink>
            <NavLink to="/sleep" icon={Moon}>
              Sleep
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
                <NavLink to="/journal" icon={BookOpen}>
                  Journal
                </NavLink>
                <NavLink to="/health" icon={Heart}>
                  Health
                </NavLink>
                <NavLink to="/sleep" icon={Moon}>
                  Sleep
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
