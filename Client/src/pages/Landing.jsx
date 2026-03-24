import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white flex flex-col items-center justify-center px-6 font-sans">
      {/* Hero Section */}
      <motion.div
        className="text-center max-w-3xl mt-10"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <h1 className="text-5xl md:text-6xl font-extrabold mb-4 leading-tight bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-transparent bg-clip-text drop-shadow-md">
          AI-Generated Learning.<br />
          Certified On-Chain.
        </h1>
        <p className="text-lg text-gray-300 mb-8">
          Instantly create micro-courses with AI, learn interactively, and earn NFT-backed certificates powered by the Aptos blockchain.
        </p>
        <div className="space-x-4">
          <Link to="/signup">
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-r from-pink-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition-all"
            >
              Get Started
            </motion.button>
          </Link>
          <Link to="/login">
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="border border-pink-500 text-pink-400 hover:bg-pink-600 hover:text-white px-6 py-3 rounded-xl font-semibold shadow-md transition-all"
            >
              Log In
            </motion.button>
          </Link>
        </div>
      </motion.div>

      {/* Features Section */}
      <motion.div
        className="mt-24 grid md:grid-cols-3 gap-10 w-full max-w-6xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
      >
        <FeatureCard
          title="⚙️ AI-Generated Courses"
          description="Enter any topic, and instantly receive full modules, lessons, and quizzes. Designed with smart GenAI."
        />
        <FeatureCard
          title="🧠 Gamified Learning"
          description="Track your XP, earn achievements, and climb leaderboards while mastering real-world skills."
        />
        <FeatureCard
          title="🔗 NFT Certifications"
          description="Mint verifiable certificates on the Aptos blockchain. Showcase your skills on-chain forever."
        />
      </motion.div>

      {/* Footer */}
      <footer className="mt-28 text-center text-gray-500 text-sm pb-4">
        © {new Date().getFullYear()} <span className="text-pink-500 font-medium">YourStudyBuddy</span>. All rights reserved.
      </footer>
    </div>
  );
};

const FeatureCard = ({ title, description }) => (
  <motion.div
    className="bg-[#1a1a1a] p-6 rounded-2xl shadow-lg border border-gray-800 hover:border-pink-600 transition-all duration-300 hover:shadow-pink-500/30"
    whileHover={{ scale: 1.05 }}
  >
    <h3 className="text-xl font-semibold mb-3 text-pink-400">{title}</h3>
    <p className="text-gray-300">{description}</p>
  </motion.div>
);

export default LandingPage;
