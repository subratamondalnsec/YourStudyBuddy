import React, { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { FaArrowLeft, FaEye, FaEyeSlash } from 'react-icons/fa';
import { motion } from 'framer-motion';
import axios from 'axios';
const url = "http://localhost:3000"
const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullname: '',
    email: '',
    password: '',
    confirmPassword: '',
    agree: false,
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.fullname.trim()) newErrors.fullname = 'Full name is required';
    if (!form.email.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) {
      newErrors.email = 'Valid email is required';
    }
    if (!form.password || form.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (!form.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    }
    if (form.password && form.confirmPassword && form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!form.agree) newErrors.agree = 'You must agree to the terms and conditions';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    const response = await axios.post(`${url}/api/v1/users/register`,  {
      name: form.fullname,
      email: form.email,
      password: form.password,
      }, { withCredentials: true });
    console.log(response.data);
    if (response.data.success) {
      navigate('/login');
    }
    setSubmitted(true);
    if (Object.keys(validationErrors).length === 0) {
      // Submit logic here
      alert('Sign up successful!');
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white flex flex-col items-center justify-center px-6 font-sans relative overflow-hidden">
      {/* Background elements similar to Landing page */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20"></div>
      
      {/* Header with back button */}
      <div className="absolute left-4 top-4 z-20 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg p-2 font-semibold hover:from-pink-700 hover:to-purple-700 transition flex items-center justify-center"
          aria-label="Back"
        >
          <FaArrowLeft className="text-lg" />
        </button>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">
          YourStudyBuddy
        </h1>
      </div>

      {/* SignUp Form */}
      <motion.div
        className="w-full max-w-md mx-auto px-4 py-8 bg-[#1a1a1a] rounded-2xl shadow-lg border border-gray-800 z-10 relative mt-20 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 text-transparent bg-clip-text mb-2">
            Join YourStudyBuddy
          </h2>
          <p className="text-gray-400">Start your AI-powered learning journey</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Full Name Input */}
          <motion.div 
            whileFocus={{ scale: 1.02 }} 
            whileHover={{ scale: 1.01 }}
          >
            <motion.input
              name="fullname"
              value={form.fullname}
              onChange={handleChange}
              placeholder="Full Name"
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.fullname ? 'border-red-400' : 'border-gray-600'
              } bg-[#2a2a2a] text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 transition-all`}
              aria-label="Full Name"
              autoComplete="name"
            />
            {errors.fullname && <p className="text-red-400 text-xs mt-1">{errors.fullname}</p>}
          </motion.div>

      

          {/* Email Input */}
          <motion.div 
            whileFocus={{ scale: 1.02 }} 
            whileHover={{ scale: 1.01 }}
          >
            <motion.input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email"
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.email ? 'border-red-400' : 'border-gray-600'
              } bg-[#2a2a2a] text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 transition-all`}
              aria-label="Email"
              autoComplete="email"
            />
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
          </motion.div>

          {/* Password Input */}
          <motion.div 
            className="relative"
            whileFocus={{ scale: 1.02 }} 
            whileHover={{ scale: 1.01 }}
          >
            <motion.input
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={handleChange}
              placeholder="Password (min 8 characters)"
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.password ? 'border-red-400' : 'border-gray-600'
              } bg-[#2a2a2a] text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 transition-all pr-12`}
              aria-label="Password"
              autoComplete="new-password"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-pink-400 transition-colors"
              tabIndex={-1}
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
          </motion.div>

          {/* Confirm Password Input */}
          <motion.div 
            className="relative"
            whileFocus={{ scale: 1.02 }} 
            whileHover={{ scale: 1.01 }}
          >
            <motion.input
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm Password"
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.confirmPassword ? 'border-red-400' : 'border-gray-600'
              } bg-[#2a2a2a] text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 transition-all pr-12`}
              aria-label="Confirm Password"
              autoComplete="new-password"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-pink-400 transition-colors"
              tabIndex={-1}
              onClick={() => setShowConfirmPassword((v) => !v)}
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
            {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>}
          </motion.div>

          {/* Terms and Conditions Checkbox */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              name="agree"
              checked={form.agree}
              onChange={handleChange}
              className={`mt-1 accent-pink-500 w-4 h-4 rounded border-gray-600 focus:ring-2 focus:ring-pink-400 transition ${
                errors.agree ? 'border-red-400' : ''
              }`}
              id="agree"
            />
            <label htmlFor="agree" className="text-xs text-gray-400 select-none leading-relaxed">
              I agree to the{' '}
              <a href="/terms" className="text-pink-400 hover:text-pink-300 underline transition-colors">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" className="text-pink-400 hover:text-pink-300 underline transition-colors">
                Privacy Policy
              </a>
            </label>
          </div>
          {errors.agree && <p className="text-red-400 text-xs -mt-2">{errors.agree}</p>}

          {/* Submit Button */}
          <motion.button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={submitted && Object.keys(errors).length > 0}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Create Account
          </motion.button>
        </form>

        <div className="text-center mt-6 text-sm text-gray-400">
          Already have an account?{' '}
          <NavLink to="/login" className="text-pink-400 hover:text-pink-300 font-semibold transition-colors">
            Sign in
          </NavLink>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
