import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Welcome from './Welcome';
import Stats from './Stats';
import Activities from './Activities';
import axios from 'axios';

const API_BASE = 'http://localhost:3000';

const userName = 'Learner';

const HomePage = () => {
  const [overall, setOverall] = useState(null);
  const [topics, setTopics] = useState([]);
  const [history, setHistory] = useState([]);
  const [weakAreas, setWeakAreas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [accuracyRes, weakRes, historyRes, topicRes] = await Promise.all([
          axios.get(`${API_BASE}/api/v1/progress/accuracy`, { withCredentials: true }),
          axios.get(`${API_BASE}/api/v1/progress/weak-areas`, { withCredentials: true }),
          axios.get(`${API_BASE}/api/v1/progress/recent-activity`, { withCredentials: true }),
          axios.get(`${API_BASE}/api/v1/progress/topic`, { withCredentials: true }),
        ]);

        setOverall({
          accuracy: accuracyRes?.data?.accuracy || 0,
          correct: accuracyRes?.data?.correct || 0,
          wrong: accuracyRes?.data?.wrong || 0,
        });
        setWeakAreas(weakRes?.data?.weakTopics || []);
        setTopics(topicRes?.data?.data || []);
        setHistory(historyRes?.data?.data || []);
      } catch (error) {
        setOverall(null);
        setTopics([]);
        setHistory([]);
        setWeakAreas([]);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const stats = useMemo(
    () => [
      { title: 'Accuracy', value: `${overall?.accuracy || 0}%` },
      { title: 'Correct Answers', value: overall?.correct || 0 },
      { title: 'Wrong Answers', value: overall?.wrong || 0 },
      { title: 'Weak Areas', value: weakAreas?.length || 0 },
    ],
    [overall, weakAreas]
  );

  const activities = useMemo(
    () =>
      history.slice(0, 8).map((item) => ({
        description: `${item.course}: ${item.action}`,
        time: item.time || 'Recently',
      })),
    [history]
  );

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
              {loading ? (
                <p className="text-gray-300">Loading dashboard...</p>
              ) : (
                <>
                  <Stats stats={stats} />

                  <div id="weak-areas" className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-6 mb-8">
                    <h3 className="text-xl font-semibold text-pink-400 mb-4">Weak Areas</h3>
                    {weakAreas.length === 0 ? (
                      <p className="text-gray-400">No weak areas detected yet.</p>
                    ) : (
                      <ul className="list-disc list-inside text-gray-200 space-y-1">
                        {weakAreas.map((item, index) => {
                          const topicName = typeof item === 'string' ? item : item?.topic || 'Unknown';
                          return <li key={`${topicName}-${index}`}>{topicName}</li>;
                        })}
                      </ul>
                    )}
                  </div>

                  <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-6 mb-8">
                    <h3 className="text-xl font-semibold text-pink-400 mb-4">Topic-wise Progress</h3>
                    <div className="space-y-4">
                      {(topics || []).length === 0 ? (
                        <p className="text-gray-400">No topic breakdown available yet.</p>
                      ) : (
                        topics.map((topic) => (
                          <div key={topic.topic}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-white">{topic.topic}</span>
                              <span className="text-gray-300">{topic.completion || 0}% complete • {topic.accuracy || 0}% accuracy</span>
                            </div>
                            <div className="h-2 rounded bg-gray-700 overflow-hidden">
                              <div className="h-2 bg-gradient-to-r from-pink-500 to-purple-500" style={{ width: `${topic.completion || 0}%` }}></div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <Activities activities={activities} />
                </>
              )}
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
