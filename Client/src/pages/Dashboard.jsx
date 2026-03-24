import React, { useState, useEffect } from 'react';
import NavBar from '../Components/NavBar';
import axios from 'axios';
const url = "http://localhost:3000";

const Dashboard = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Example user data - you can replace this with real user data from your auth system
  const user = {
    name: "Alex Johnson",
    avatar: null // You can set an image URL here like: "https://example.com/avatar.jpg"
  };

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
      {/* Navigation Sidebar */}
      <NavBar user={user} />
      
      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-[#1a1a1a] rounded-2xl p-8 border border-gray-800">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 text-transparent bg-clip-text mb-4">
              All Courses
            </h1>
            <p className="text-gray-400 mb-6">
              Browse through our available courses and start learning today!
            </p>
            
            {loading ? (
              <div className="text-center text-white">Loading courses...</div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map(course => (
                  <div key={course._id} className="bg-[#2a2a2a] p-6 rounded-lg border border-gray-700">
                    <h3 className="text-lg font-semibold text-white mb-2">{course.title}</h3>
                    <p className="text-gray-400 text-sm mb-2">{course.description}</p>
                    <p className="text-gray-500 text-xs">Created by: {course.creator.name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
