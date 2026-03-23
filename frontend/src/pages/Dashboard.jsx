import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Sidebar from "@/components/dashboard/Sidebar";
import ProgressCard from "@/components/dashboard/ProgressCard";
import UploadCard from "@/components/dashboard/UploadCard";
import QuickActionCard from "@/components/dashboard/QuickActionCard";

export default function Dashboard() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Welcome Back </h1>
          <p className="text-gray-500 text-sm mt-1">Your AI-powered study stats and tools</p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <UploadCard />
          <ProgressCard title="📚 Flashcards Learned" value="128" />
          <ProgressCard title="🎯 Quiz Accuracy" value="85%" />
        </section>

        <section className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          <QuickActionCard title="Resume Study" link="/study" />
          <QuickActionCard title="Upload New Note" link="/upload" />
        </section>

        <div className="mt-12 bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">🔥 Streak Progress</h2>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div className="bg-indigo-600 h-4 rounded-full" style={{ width: '70%' }}></div>
          </div>
          <p className="mt-2 text-sm text-gray-500">7-day streak! Keep going!</p>
        </div>
      </main>
    </div>
  );
} // END Dashboard Page

