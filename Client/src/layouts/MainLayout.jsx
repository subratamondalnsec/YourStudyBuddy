import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { FaRobot } from 'react-icons/fa';
import NavBar from '../Components/NavBar';

const MainLayout = () => {
  const location = useLocation();
  const hideNavbarPaths = ['/', '/signup', '/login'];
  const currentPath = location.pathname;

  const isCoursePage = currentPath.startsWith('/learn/');
  const shouldShowNavbar = !hideNavbarPaths.includes(currentPath) && !isCoursePage;
  const routeKey = `${location.pathname}${location.search}${location.hash}`;

  return (
    <div>
      <div key={routeKey}>
        <Outlet />
      </div>
      {shouldShowNavbar && <NavBar />}
      <Link
        to="/chatbot"
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
        aria-label="Open Study Chatbot"
        title="Study Chatbot"
      >
        <FaRobot className="text-xl" />
      </Link>
    </div>
  );
};

export default MainLayout;
