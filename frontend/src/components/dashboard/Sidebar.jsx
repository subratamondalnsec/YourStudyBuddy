import React from "react";
import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white shadow-lg p-6 hidden md:block">
      <h2 className="text-xl font-bold text-indigo-600 mb-6">StudyBuddy</h2>
      <nav className="space-y-4">
      <Link to="/dashboard" className="block text-gray-700 hover:text-indigo-600">Dashboard</Link>
        <Link to="/upload" className="block text-gray-700 hover:text-indigo-600">Upload</Link>
        <Link to="/notes" className="block text-gray-700 hover:text-indigo-600">Notes</Link>
        <Link to="/summaries" className="block text-gray-700 hover:text-indigo-600">Summaries</Link>
        <Link to="/flashcards" className="block text-gray-700 hover:text-indigo-600">Flashcards</Link>
        <Link to="/quizzes" className="block text-gray-700 hover:text-indigo-600">Quizzes</Link>
        <Link to="/profile" className="block text-gray-700 hover:text-indigo-600">Profile</Link>
      </nav>
    </aside>
  );
}