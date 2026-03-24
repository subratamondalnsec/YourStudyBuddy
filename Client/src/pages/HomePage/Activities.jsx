import React from 'react';
import { motion } from 'framer-motion';

const Activities = ({ activities }) => {
  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-4 text-pink-400">Recent Activity</h3>
      <ul className="space-y-4">
        {activities.map((activity, idx) => (
          <motion.li
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={idx}
            className="bg-[#1a1a1a] rounded-lg px-5 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center border border-gray-800 hover:border-pink-600 transition-all duration-300"
          >
            <div className="text-white font-medium">{activity.description}</div>
            <div className="text-gray-400 text-sm mt-2 sm:mt-0">{activity.time}</div>
          </motion.li>
        ))}
      </ul>
    </div>
  );
};

export default Activities;
