import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaEnvelope, FaPhone } from 'react-icons/fa';
import { useParams } from 'react-router-dom';
import axios from 'axios';
const url =  'http://localhost:3000';
const Profile = () => {
  const { userId } = useParams();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const response = await axios.post(`${url}/api/v1/users/profile`, {}, {
          withCredentials: true, // Ensure cookies are sent with the request
        });
        console.log('User Profile Response:', response.data);
        
        setUserData(response.data.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

      fetchUserProfile();
  }, []);

  if (loading) {
    return <div className="flex min-h-screen bg-[#0d0d0d] items-center justify-center text-white">Loading profile...</div>;
  }

  if (error) {
    return <div className="flex min-h-screen bg-[#0d0d0d] items-center justify-center text-red-500">Error: {error.message}</div>;
  }

  if (!userData) {
    return <div className="flex min-h-screen bg-[#0d0d0d] items-center justify-center text-gray-400">No user data found.</div>;
  }

  return (
    <div className="flex min-h-screen bg-[#0d0d0d]">
      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="bg-[#1a1a1a] rounded-2xl p-8 border border-gray-800"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Header */}
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 text-transparent bg-clip-text mb-2">
                My Profile
              </h1>
              <p className="text-gray-400">
                Manage your account information and preferences
              </p>
            </div>

            {/* Profile Section */}
            <div className="text-center mb-8">
              {/* Profile Image */}
              <div className="relative inline-block mb-6">
                <div className="w-32 h-32 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center overflow-hidden mx-auto">
                  {userData.avatar ? (
                    <img 
                      src={userData.avatar} 
                      alt={userData.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FaUser className="text-white text-4xl" />
                  )}
                </div>
              </div>

              {/* Name */}
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-white">{userData.name}</h2>
              </div>

              {/* Email */}
              <div className="mb-6">
                <p className="text-gray-400 flex items-center justify-center gap-2">
                  <FaEnvelope className="text-pink-400" />
                  {userData.email}
                </p>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white mb-4 text-center">Contact Information</h3>
              <div className="max-w-md mx-auto">
                <div className="text-center">
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    <FaPhone className="inline mr-2 text-pink-400" />
                    Mobile Number
                  </label>
                  <p className="text-white text-lg">{userData.mobile || 'N/A'}</p>
                </div>
                <div className="text-center mt-4">
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Total XP
                  </label>
                  <p className="text-white text-lg">{userData.totalXP}</p>
                </div>
                <div className="text-center mt-4">
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Wallet Address
                  </label>
                  <p className="text-white text-lg break-all">{userData.walletAddress || 'N/A'}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
