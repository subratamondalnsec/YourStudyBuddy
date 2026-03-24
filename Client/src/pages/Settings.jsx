import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Settings = () => {
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [form, setForm] = useState({ current: '', new: '', confirm: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (!form.current || !form.new || !form.confirm) {
      setError('All fields are required.');
      return;
    }
    if (form.new !== form.confirm) {
      setError('New passwords do not match.');
      return;
    }
    // Simulate password change
    setShowChangePassword(false);
    setForm({ current: '', new: '', confirm: '' });
    setError('');
    alert('Password changed successfully!');
  };

  const handleLogout = () => {
    // Simulate logout
    navigate('/');
  };

  return (
    <div className="flex min-h-screen bg-[#0d0d0d]">
      <main className="flex-1 lg:ml-64 p-6 lg:p-8">
        <div className="max-w-xl mx-auto">
          <motion.div
            className="bg-[#1a1a1a] rounded-2xl p-8 border border-gray-800"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 text-transparent bg-clip-text mb-8 text-center">
              Settings
            </h1>
            <div className="flex flex-col gap-6 items-center">
              <button
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 px-6 rounded-lg font-semibold text-lg hover:opacity-90 transition"
                onClick={() => setShowChangePassword(true)}
              >
                Change Password
              </button>
              <button
                className="w-full bg-gray-700 text-white py-3 px-6 rounded-lg font-semibold text-lg hover:bg-gray-600 transition"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>

            {/* Change Password Modal */}
            <AnimatePresence>
              {showChangePassword && (
                <motion.div
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowChangePassword(false)}
                >
                  <motion.form
                    className="bg-[#1a1a1a] rounded-2xl p-8 border border-gray-800 w-full max-w-md relative"
                    initial={{ scale: 0.95, y: 40 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.95, y: 40 }}
                    onSubmit={handleChangePassword}
                    onClick={e => e.stopPropagation()}
                  >
                    <h2 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-pink-500 to-purple-500 text-transparent bg-clip-text">
                      Change Password
                    </h2>
                    <label className="block text-gray-400 mb-2">Current Password</label>
                    <input
                      type="password"
                      name="current"
                      value={form.current}
                      onChange={handleChange}
                      className="w-full mb-4 px-4 py-2 rounded-lg bg-[#2a2a2a] border border-gray-700 text-white focus:border-pink-500 focus:outline-none"
                      autoFocus
                    />
                    <label className="block text-gray-400 mb-2">New Password</label>
                    <input
                      type="password"
                      name="new"
                      value={form.new}
                      onChange={handleChange}
                      className="w-full mb-4 px-4 py-2 rounded-lg bg-[#2a2a2a] border border-gray-700 text-white focus:border-pink-500 focus:outline-none"
                    />
                    <label className="block text-gray-400 mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      name="confirm"
                      value={form.confirm}
                      onChange={handleChange}
                      className="w-full mb-4 px-4 py-2 rounded-lg bg-[#2a2a2a] border border-gray-700 text-white focus:border-pink-500 focus:outline-none"
                    />
                    {error && <div className="text-red-500 mb-4 text-center">{error}</div>}
                    <div className="flex gap-4 mt-6 justify-center">
                      <button
                        type="button"
                        className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        onClick={() => setShowChangePassword(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:opacity-90 transition-opacity"
                      >
                        Change Password
                      </button>
                    </div>
                  </motion.form>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
