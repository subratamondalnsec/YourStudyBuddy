import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import NavBar from '../Components/NavBar';
import axios from 'axios';
const url = "http://localhost:3000";
const Course = () => {
  const [courseInput, setCourseInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  // Example user data
  const user = {
    name: "Alex Johnson",
    avatar: null
  };

  // Hot topics that users can click to auto-fill
  const hotTopics = [
    "JavaScript Fundamentals",
    "React Development",
    "Python for Beginners",
    "Machine Learning Basics",
    "Web Design with CSS",
    "Node.js Backend",
    "Data Science with Python",
    "Mobile App Development",
    "Blockchain Technology",
    "AI and Neural Networks",
    "Cloud Computing AWS",
    "Digital Marketing",
    "Cybersecurity Basics",
    "UI/UX Design",
    "Database Management",
    "DevOps Fundamentals"
  ];

  const handleTopicClick = (topic) => {
    setCourseInput(topic);
  };

  const handleGenerate = async () => {
    if (!courseInput.trim()) return;

    setErrorMessage('');
    setIsGenerating(true);

    try {
      const response = await axios.post(
        `${url}/api/v1/courses/create`,
        {
          topic: courseInput
        },
        { withCredentials: true }
      );

      console.log(response.data);

      const createdCourseId = response?.data?.data?._id;
      if (!createdCourseId) {
        setErrorMessage('Course created but ID not found. Please refresh and try again.');
        setIsGenerating(false);
        return;
      }

      setTimeout(() => {
        setIsGenerating(false);
        navigate(`/course/${createdCourseId}`);
      }, 2000);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error?.response?.status;
        const serverMessage = error?.response?.data?.message;

        if (status === 429) {
          setErrorMessage(serverMessage || 'AI quota exceeded. Please try again later.');
        } else if (status === 401) {
          setErrorMessage('Please log in to generate a course.');
        } else {
          setErrorMessage(serverMessage || 'Failed to generate course. Please try again.');
        }
      } else {
        setErrorMessage('Something went wrong. Please try again.');
      }
      setIsGenerating(false);
    }
  };

  const handleInputChange = (e) => {
    setCourseInput(e.target.value);
    if (errorMessage) setErrorMessage('');
  };

  return (
    <div className="flex min-h-screen bg-[#0d0d0d]">
      {/* Navigation Sidebar */}
      {/* <NavBar user={user} /> */}
      
      {/* Main Content */}
      <main className="flex-1 lg:ml-64 relative overflow-hidden">
        {/* Background elements similar to Landing page */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20"></div>
        
        <div className="relative z-10 p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">
            {/* Header Section */}
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">
                AI Course Generator
              </h1>
              <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                Enter any topic and let our AI create a comprehensive course with lessons, quizzes, and interactive content
              </p>
            </motion.div>

            {/* Course Input Section */}
            <motion.div
              className="bg-[#1a1a1a] rounded-2xl p-8 border border-gray-800 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="space-y-6">
                <div>
                  <label htmlFor="courseInput" className="block text-lg font-semibold text-white mb-3">
                    What would you like to learn today?
                  </label>
                  <motion.input
                    id="courseInput"
                    type="text"
                    value={courseInput}
                    onChange={handleInputChange}
                    placeholder="Enter your course topic... (e.g., 'JavaScript for Beginners', 'Machine Learning Fundamentals')"
                    className="w-full px-6 py-4 rounded-xl border border-gray-600 bg-[#2a2a2a] text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 transition-all"
                    whileFocus={{ scale: 1.02 }}
                  />
                </div>

                <motion.button
                onClick={handleGenerate}
                disabled={!courseInput.trim() || isGenerating}
                className="w-full py-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-xl shadow-lg transition-all disabled:cursor-not-allowed"
                whileHover={{ scale: isGenerating ? 1 : 1.02 }}
                whileTap={{ scale: isGenerating ? 1 : 0.98 }}
                >
                {isGenerating ? (
                    <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Generating Course...
                    </div>
                ) : (
                    '🚀 Generate AI Course'
                )}
                </motion.button>

                {errorMessage && (
                  <p className="text-sm text-red-400">{errorMessage}</p>
                )}
              </div>
            </motion.div>

            {/* Hot Topics Section */}
            <motion.div
              className="bg-[#1a1a1a] rounded-2xl p-8 border border-gray-800"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h2 className="text-2xl font-bold text-white mb-6">
                🔥 Hot Topics
              </h2>
              <p className="text-gray-400 mb-6">
                Click on any topic below to instantly start creating a course
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {hotTopics.map((topic, index) => (
                  <motion.button
                    key={topic}
                    onClick={() => handleTopicClick(topic)}
                    className="p-4 bg-[#2a2a2a] hover:bg-[#3a3a3a] border border-gray-700 hover:border-pink-500 rounded-lg text-left text-white transition-all group"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="text-sm font-medium group-hover:text-pink-400 transition-colors">
                      {topic}
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Course;
