import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { useState } from 'react'
import Login from './pages/Login'
import Landing from './pages/Landing'
import Signup from './pages/SignUp'
import Dashboard from './pages/Dashboard'
import Course from './pages/Course'
import NavBar from './Components/NavBar'
import HomePage from './pages/HomePage/HomePage';
import Certificate from './pages/Certificate'
import AllCertificate from './pages/AllCourses'
import Profile from './pages/Profile'
import CourseStructure from './pages/CourseStructure'
import CourseContain from './pages/CourseContain'
import Settings from './pages/Settings'

import './App.css'

function App() {
  const location = useLocation();
  const hideNavbarPaths = ['/', '/signup', '/login'];
  const currentPath = location.pathname;
  
  // Hide default navbar on course content pages
  const isCoursePage = currentPath.startsWith('/learn/');
  const shouldShowNavbar = !hideNavbarPaths.includes(currentPath) && !isCoursePage;

  return (
    <div>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/course" element={<Course />} />
        <Route path="/course/:courseId" element={<CourseStructure />} />
        <Route path="/learn/:courseId" element={<CourseContain />} />
        <Route path="/certificate" element={<Certificate />} />
        <Route path="/all-courses" element={<AllCertificate />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        {/* Add more routes as needed */}
      </Routes>
      {shouldShowNavbar && <NavBar />}
    </div>
  );
}

function AppWithRouter() {
  return (
    <Router>
      <App />
    </Router>
  );
}

export default AppWithRouter;
