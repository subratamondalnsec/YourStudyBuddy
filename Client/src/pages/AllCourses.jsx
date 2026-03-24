import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
const url = "http://localhost:3000";

const AllCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(`${url}/api/v1/courses/fetchAll`);
        setCourses(response.data.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching courses:", error);
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div className="flex min-h-screen bg-[#0d0d0d]">
      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="bg-[#1a1a1a] rounded-2xl p-8 border border-gray-800"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-8">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 text-transparent bg-clip-text mb-4">
                All Courses
              </h1>
              <p className="text-gray-400">
                Browse through our available courses and start learning today!
              </p>
            </div>

            {loading ? (
              <div className="text-center text-white">Loading courses...</div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map(course => (
                  <a href={`/learn/${course._id}`} key={course._id}>
                    <div
                      className="bg-[#2a2a2a] p-6 rounded-lg border border-gray-700 hover:border-pink-500 transition-all cursor-pointer h-full"
                    >
                      <h3 className="text-lg font-semibold text-white mb-2">{course.title}</h3>
                      <p className="text-gray-400 text-sm mb-2">{course.description}</p>
                      <p className="text-gray-500 text-xs">Created by: {course.creator.name}</p>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default AllCourses;
