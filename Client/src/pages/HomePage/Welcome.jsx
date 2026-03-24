import React from 'react';
import { motion } from 'framer-motion';

const Welcome = ({ userName }) => {
  return (
    <motion.h2 
      className="text-3xl font-semibold mb-8"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      Welcome Back, {' '}
      <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-transparent bg-clip-text font-bold">
        {userName}
      </span>
    </motion.h2>
  );
};

export default Welcome;
