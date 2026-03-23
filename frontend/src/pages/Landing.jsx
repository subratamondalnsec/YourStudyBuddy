import React from "react";
import Button from "@/components/Button";
import { motion } from "framer-motion";
import { Link } from "react-router";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-pink-100">
      <header className="flex items-center justify-between px-10 py-6 shadow-md bg-white/80 backdrop-blur">
        <h1 className="text-2xl font-bold text-indigo-700">StudyBuddy</h1>
        <div className="space-x-4">
          <Button variant="ghost" >
           <Link to="/login"> Login</Link>
            </Button>
          <Button>
            <Link to="/register"> Get Started</Link>
          </Button>
        </div>
      </header>

      <main className="px-8 py-16 text-center">
        <motion.h2
          className="text-5xl font-bold text-gray-800 mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Your AI-Powered Study Assistant
        </motion.h2>

        <p className="text-xl text-gray-600 mb-8">
          Turn your notes into smart summaries, flashcards, and quizzes in seconds.
        </p>

        <motion.div
          className="flex justify-center gap-6 flex-wrap"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <FeatureCard title="📄 Summarize Notes" desc="Upload PDFs or text and get concise summaries instantly." />
          <FeatureCard title="🧠 Flashcards" desc="AI-generated key concepts in a swipeable flashcard UI." />
          <FeatureCard title="📝 Quiz Generator" desc="Practice with quizzes generated from your uploaded notes." />
        </motion.div>

        <div className="mt-12">
          <Button size="lg" className="text-lg px-8 py-4">
          <Link to="/register"> Start Studying Now</Link>
          </Button>
        </div>
      </main>

      <footer className="mt-16 py-6 text-center text-gray-500">
        © {new Date().getFullYear()} StudyBuddy. All rights reserved.
      </footer>
    </div>
  );
}

function FeatureCard({ title, desc }) {
  return (
    <div className="w-72 bg-white rounded-2xl shadow-lg p-6 text-left hover:shadow-xl transition">
      <h3 className="text-xl font-semibold mb-2 text-indigo-600">{title}</h3>
      <p className="text-gray-600 text-sm">{desc}</p>
    </div>
  );
}
