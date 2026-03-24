import React from 'react';
import { motion } from 'framer-motion';

const Stats = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-10">
      {stats.map((stat, idx) => (
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-[#1a1a1a] rounded-xl shadow-md p-6 flex flex-col items-center hover:shadow-lg transition-shadow border border-gray-800 hover:border-pink-600"
          key={idx}
        >
          <div className="text-pink-400 text-base mb-2">{stat.title}</div>
          <div className="text-3xl text-white font-extrabold">{stat.value}</div>
        </motion.div>
      ))}
    </div>
  );
};

export default Stats;
