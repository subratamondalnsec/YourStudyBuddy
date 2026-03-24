import React from 'react';
import { motion } from 'framer-motion';
import Welcome from './Welcome';
import Stats from './Stats';
import Activities from './Activities';

const userName = 'John Doe'; // Replace with dynamic user data as needed
const stats = [
  { title: 'Total XP', value: 1200 },
  { title: 'Courses Completed', value: 5 },
  { title: 'Courses Ongoing', value: 2 },
  { title: 'Certificates Earned', value: 3 },
];

const activities = [
  { description: 'Completed Lesson: Introduction to AI Ethics', time: '2 days ago' },
  { description: 'Minted Certificate: AI Fundamentals', time: '1 week ago' },
  { description: 'Started Course: Advanced Machine Learning', time: '2 weeks ago' },
];

const HomePage = () => {
  return (
    <div className="flex min-h-screen bg-[#0d0d0d]">
      {/* Main Content */}
      <main className="flex-1 lg:ml-64 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20"></div>
        
        <div className="relative z-10 p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-white"
            >
              <Welcome userName={userName} />
              <Stats stats={stats} />
              <Activities activities={activities} />
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
