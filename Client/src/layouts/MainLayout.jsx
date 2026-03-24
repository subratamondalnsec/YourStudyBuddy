import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
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
    </div>
  );
};

export default MainLayout;
