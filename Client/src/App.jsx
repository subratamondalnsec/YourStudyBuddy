import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import Login from './pages/Login'
import Landing from './pages/Landing'
import Signup from './pages/SignUp'
import Dashboard from './pages/Dashboard'
import Course from './pages/Course'
import HomePage from './pages/HomePage/HomePage';
import Certificate from './pages/Certificate'
import AllCertificate from './pages/AllCourses'
import Profile from './pages/Profile'
import CourseStructure from './pages/CourseStructure'
import CourseContain from './pages/CourseContain'
import Settings from './pages/Settings'
import Practice from './pages/Practice'
import Schedule from './pages/Schedule'
import WeakArea from './pages/WeakArea'
import Chatbot from './pages/Chatbot'
import CodeEditor from './CodeEditor/CodeEditor'
import VisualizerApp from './visualizer/App'
import MainLayout from './layouts/MainLayout'

import './App.css'

function App() {
  const location = useLocation();
  const routeKey = `${location.pathname}${location.search}${location.hash}`;

  return (
    <div>
      <Routes location={location} key={routeKey}>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Landing />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
          <Route path="home" element={<HomePage />} />
          <Route path="weak-area" element={<WeakArea />} />
          <Route path="course" element={<Course />} />
          <Route path="course/:courseId" element={<CourseStructure />} />
          <Route path="learn/:courseId" element={<CourseContain />} />
          <Route path="practice" element={<Practice />} />
          <Route path="schedule" element={<Schedule />} />
          <Route path="chatbot" element={<Chatbot />} />
          <Route path="code-editor" element={<CodeEditor />} />
          <Route path="visualizer/*" element={<VisualizerApp />} />
          <Route path="certificate" element={<Certificate />} />
          <Route path="all-courses" element={<AllCertificate />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
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
