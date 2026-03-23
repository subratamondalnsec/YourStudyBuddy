import { useState } from 'react'

import './App.css'
import LandingPage from './pages/Landing'
import LoginPage from '@/pages/Login.jsx'
import RegisterPage from '@/pages/Register.jsx'
import Dashboard from './pages/Dashboard'
import Upload from './pages/Upload.jsx'
import Notes from './pages/Notes.jsx'
import SummaryPage from './pages/Summery'
import FlashcardPage from './pages/Flashcard'
import QuizDashboard from './pages/Quiz'
import QuizAttemptPage from './pages/QuizAttempt'
import AnalyticsPage from './pages/Analytics'
import QuizStartPage from './pages/QuizStart'


import { createBrowserRouter, RouterProvider } from 'react-router'

 const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
  {
    path: "/upload",
    element: <Upload />,
  },
  {
    path: "/notes",
    element: <Notes />,
  },
  {
    path: "/summaries",
    element: <SummaryPage />,
  }, 
  {
    path: "/flashcards",
    element: <FlashcardPage />,
  },

  {
    path: "/quizzes",
    element: <QuizDashboard />,
  },
  
  {
    path: "/quiz/:id",
    element: <QuizAttemptPage />,
  },
  
  {
    path: "/quiz/:id/analytics",
    element: <AnalyticsPage />,
  },
  
  {
    path: "/quiz/start/:id",
    element: <QuizStartPage />,
  },

])
function App() {

  return (
    <RouterProvider router={router}/>
  )
}

export default App
