import React from 'react';
import { motion } from 'framer-motion';

const Certificate = () => {
  // Demo certificate data
  const certificates = {
    completed: [
      {
        id: 1,
        title: "AI Fundamentals",
        completionDate: "June 15, 2025",
        grade: "A",
        status: "completed",
        issuer: "YourStudyBuddy Academy",
        chainId: "0x123...789"
      },
      {
        id: 2,
        title: "Web Development Mastery",
        completionDate: "May 28, 2025",
        grade: "A+",
        status: "completed",
        issuer: "YourStudyBuddy Academy",
        chainId: "0x456...012"
      }
    ],
    pending: [
      {
        id: 3,
        title: "Blockchain Development",
        requiredScore: 85,
        currentScore: 82,
        status: "pending",
        estimatedCompletion: "2 days remaining"
      },
      {
        id: 4,
        title: "Machine Learning Basics",
        requiredScore: 80,
        currentScore: 75,
        status: "pending",
        estimatedCompletion: "5 days remaining"
      }
    ],
    ongoing: [
      {
        id: 5,
        title: "Cloud Computing Fundamentals",
        progress: 45,
        status: "ongoing",
        lastActivity: "2 hours ago"
      },
      {
        id: 6,
        title: "Cybersecurity Essentials",
        progress: 30,
        status: "ongoing",
        lastActivity: "1 day ago"
      }
    ]
  };

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
                Completed Certificates
              </h1>
              <p className="text-gray-400">
                Your blockchain-verified certificates and achievements
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <motion.div
                className="bg-[#2a2a2a] p-6 rounded-xl border border-gray-700 hover:border-pink-500 transition-all"
                whileHover={{ scale: 1.02 }}
              >
                <h3 className="text-lg font-semibold text-pink-400 mb-2">Total Certificates</h3>
                <p className="text-2xl font-bold text-white">{certificates.completed.length}</p>
              </motion.div>
              
              <motion.div
                className="bg-[#2a2a2a] p-6 rounded-xl border border-gray-700 hover:border-pink-500 transition-all"
                whileHover={{ scale: 1.02 }}
              >
                <h3 className="text-lg font-semibold text-pink-400 mb-2">Average Grade</h3>
                <p className="text-2xl font-bold text-white">A+</p>
              </motion.div>
            </div>

            {/* Certificate Sections */}
            <div className="space-y-8">
              <CertificateSection
                title="🏆 Your Achievements"
                items={certificates.completed}
                type="completed"
              />
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

const CertificateSection = ({ title, items, type }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-white">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map((item) => (
          <motion.div
            key={item.id}
            className={`bg-[#2a2a2a] rounded-xl p-6 border transition-all hover:border-pink-500 ${
              type === 'pending' && item.currentScore < item.requiredScore
                ? 'border-red-600 bg-red-900/20'
                : 'border-gray-700'
            }`}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-white">{item.title}</h3>
              <StatusBadge status={item.status} />
            </div>

            {type === 'completed' && (
              <>
                <div className="text-gray-400 mb-2">Completed: {item.completionDate}</div>
                <div className="text-gray-400 mb-2">Grade: {item.grade}</div>
                <div className="text-gray-400 mb-2">Issuer: {item.issuer}</div>
                <div className="text-sm text-pink-400">Chain ID: {item.chainId}</div>
              </>
            )}

            {type === 'ongoing' && (
              <>
                <div className="relative pt-1 mb-4">
                  <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-700">
                    <div
                      style={{ width: `${item.progress}%` }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-pink-500 to-purple-500"
                    ></div>
                  </div>
                </div>
                <div className="text-gray-400">Progress: {item.progress}%</div>
                <div className="text-sm text-pink-400">Last activity: {item.lastActivity}</div>
              </>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const statusStyles = {
    completed: "bg-green-500/20 text-green-400 border border-green-500/20",
    pending: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/20",
    ongoing: "bg-blue-500/20 text-blue-400 border border-blue-500/20"
  };

  return (
    <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${statusStyles[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default Certificate;
