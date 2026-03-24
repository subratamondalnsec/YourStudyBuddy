import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  FaHome, 
  FaCertificate, 
  FaUser, 
  FaCog,
  FaExclamationTriangle,
  FaBrain,
  FaCalendarAlt,
  FaRobot,
  FaCode,
  FaBars,
  FaTimes
} from 'react-icons/fa';
import { MdOutlineOndemandVideo } from "react-icons/md";
import { motion, AnimatePresence } from 'framer-motion';

const NavBar = ({ user = { name: "John Doe", avatar: null } }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  React.useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname, location.search, location.hash]);

  const handleSidebarNavigate = (event, path) => {
    event.preventDefault();
    navigate(path);
    setTimeout(() => {
      window.location.reload();
    }, 0);
  };

  const navItems = [
    {
      to: "/home",
      icon: FaHome,
      label: "Home"
    },
    {
      to: "/weak-area",
      icon: FaExclamationTriangle,
      label: "Weak Areas"
    },
    {
      to: "/practice",
      icon: FaBrain,
      label: "AI Practice"
    },
    {
      to: "/schedule",
      icon: FaCalendarAlt,
      label: "Study Schedule"
    },
    {
      to: "/visualizer",
      icon: FaCode,
      label: "Visualizer"
    },
    {
      to: "/chatbot",
      icon: FaRobot,
      label: "Study Chatbot"
    },
    {
      to: "/course",
      icon: MdOutlineOndemandVideo,
      label: "Courses"
    },
    {
      to: "/certificate",
      icon: FaCertificate,
      label: "Certificate"
    },
    {
      to: "/all-courses",
      icon: FaCertificate,
      label: "All Courses"
    },
    {
      to: "/profile",
      icon: FaUser,
      label: "Profile"
    },
    {
      to: "/settings",
      icon: FaCog,
      label: "Settings"
    }
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <motion.button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-gradient-to-r from-pink-600 to-purple-600 text-white p-3 rounded-lg shadow-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
        </motion.button>
      </div>

      {/* Desktop Sidebar */}
      <nav className="hidden lg:flex fixed left-0 top-0 h-screen w-64 bg-[#0d0d0d] text-white flex-col border-r border-gray-800 overflow-hidden z-30">
        {/* Background elements similar to Landing page */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-purple-900/10 to-pink-900/10"></div>
        
        {/* Profile Section */}
        <motion.div 
          className="p-6 border-b border-gray-800 relative z-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-4">
            {/* Profile Picture */}
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center overflow-hidden">
              {user.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <FaUser className="text-white text-lg" />
              )}
            </div>
            
            {/* Profile Name */}
            <div>
              <h3 className="font-semibold text-white truncate">
                {user.name}
              </h3>
              <p className="text-xs text-gray-400">YourStudyBuddy Learner</p>
            </div>
          </div>
        </motion.div>

        {/* Navigation Items */}
        <div className="flex-1 py-6 relative z-10">
          <ul className="space-y-2 px-4">
            {navItems.map((item, index) => (
              <motion.li 
                key={item.to}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <NavLink
                  to={item.to}
                  onClick={(event) => handleSidebarNavigate(event, item.to)}
                  className={({ isActive }) =>
                    `flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-300 group ${
                      isActive
                        ? 'bg-gradient-to-r from-pink-600/20 to-purple-600/20 border border-pink-500/30 text-pink-400'
                        : 'hover:bg-[#1a1a1a] hover:border-gray-700 text-gray-300 hover:text-white border border-transparent'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon 
                        className={`text-lg transition-colors ${
                          isActive 
                            ? 'text-pink-400' 
                            : 'text-gray-400 group-hover:text-pink-400'
                        }`} 
                      />
                      <span className="font-medium">{item.label}</span>
                    </>
                  )}
                </NavLink>
              </motion.li>
            ))}
          </ul>
        </div>

        {/* YourStudyBuddy Branding */}
        <motion.div 
          className="p-6 border-t border-gray-800 relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="text-center">
            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-transparent bg-clip-text mb-1">
              YourStudyBuddy
            </h2>
            <p className="text-xs text-gray-500">AI-Powered Learning</p>
          </div>
        </motion.div>

        {/* Decorative gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-pink-900/5 to-transparent pointer-events-none"></div>
      </nav>

      {/* Mobile Overlay Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            {/* Mobile Menu */}
            <motion.nav
              className="lg:hidden fixed top-0 left-0 h-full w-80 bg-[#0d0d0d] text-white border-r border-gray-800 z-40 overflow-hidden"
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              {/* Background elements */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-purple-900/10 to-pink-900/10"></div>
              
              {/* Mobile Profile Section */}
              <div className="p-6 border-b border-gray-800 relative z-10 mt-16">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center overflow-hidden">
                    {user.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FaUser className="text-white text-lg" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white truncate">
                      {user.name}
                    </h3>
                    <p className="text-xs text-gray-400">YourStudyBuddy Learner</p>
                  </div>
                </div>
              </div>

              {/* Mobile Navigation Items */}
              <div className="flex-1 py-6 relative z-10">
                <ul className="space-y-2 px-4">
                  {navItems.map((item, index) => (
                    <li key={item.to}>
                      <NavLink
                        to={item.to}
                        onClick={(event) => {
                          setIsMobileMenuOpen(false);
                          handleSidebarNavigate(event, item.to);
                        }}
                        className={({ isActive }) =>
                          `flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-300 group ${
                            isActive
                              ? 'bg-gradient-to-r from-pink-600/20 to-purple-600/20 border border-pink-500/30 text-pink-400'
                              : 'hover:bg-[#1a1a1a] hover:border-gray-700 text-gray-300 hover:text-white border border-transparent'
                          }`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <item.icon 
                              className={`text-lg transition-colors ${
                                isActive 
                                  ? 'text-pink-400' 
                                  : 'text-gray-400 group-hover:text-pink-400'
                              }`} 
                            />
                            <span className="font-medium">{item.label}</span>
                          </>
                        )}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Mobile Branding */}
              <div className="p-6 border-t border-gray-800 relative z-10">
                <div className="text-center">
                  <h2 className="text-xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-transparent bg-clip-text mb-1">
                    YourStudyBuddy
                  </h2>
                  <p className="text-xs text-gray-500">AI-Powered Learning</p>
                </div>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default NavBar;
