import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams, useNavigate } from 'react-router-dom';
import CourseSidebar from '../components/CourseSidebar';
import LessonContent from '../components/LessonContent';
import QuizSection from '../components/QuizSection';
import LessonNavigation from '../components/LessonNavigation';
import axios from 'axios';
const url = "http://localhost:3000";


const CourseContain = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [courseContent, setCourseContent] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [quizResults, setQuizResults] = useState({});

  // Initialize progress and fetch course/progress data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Initialize progress (creates if not exists)
        await axios.post(`${url}/api/v1/progress/initialize/${courseId}`, {}, { withCredentials: true });
        // 2. Fetch course content
        const courseRes = await axios.get(`${url}/api/v1/courses/course/${courseId}`);
        setCourseContent(courseRes.data.data);
        // 3. Fetch progress
        const progressRes = await axios.post(`${url}/api/v1/progress/${courseId}`, {}, { withCredentials: true });
        setProgress(progressRes.data.data);
        // 4. Set current lesson index from progress
        if (progressRes.data.data && courseRes.data.data) {
          const idx = courseRes.data.data.lessons.findIndex(
            l => l._id === (progressRes.data.data.currentLesson?._id || progressRes.data.data.currentLesson)
          );
          setCurrentLessonIndex(idx >= 0 ? idx : 0);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error initializing/fetching course/progress:", error);
        setLoading(false);
      }
    };
    fetchData();
    // eslint-disable-next-line
  }, [courseId]);

  // Reset quiz results when changing lessons
  useEffect(() => {
    setQuizResults({});
  }, [currentLessonIndex]);

  if (loading) {
    return <div className="text-center text-white">Loading course...</div>;
  }
  if (!courseContent || !progress) {
    return <div className="text-center text-white">Course not found or progress not loaded.</div>;
  }

  const currentLesson = courseContent.lessons[currentLessonIndex];
  const totalLessons = courseContent.lessons.length;
  const completedLessons = progress.completedLessons || [];
  const progressPercentage = Math.round((completedLessons.length / totalLessons) * 100);

  // Navigation handlers
  const handlePreviousLesson = async () => {
    if (currentLessonIndex > 0) {
      const prevLessonId = courseContent.lessons[currentLessonIndex - 1]._id;
      // Update current lesson in backend
      await axios.post(`${url}/api/v1/progress/${courseId}/lesson/${prevLessonId}/current`, {}, { withCredentials: true });
      setCurrentLessonIndex(currentLessonIndex - 1);
    }
  };

  const handleNextLesson = async () => {
    if (currentLessonIndex < totalLessons - 1) {
      const nextLessonId = courseContent.lessons[currentLessonIndex + 1]._id;
      // Check access
      const accessRes = await axios.post(`${url}/api/v1/progress/${courseId}/lesson/${nextLessonId}/can-access`, {}, { withCredentials: true });
      if (accessRes.data.data.canAccess) {
        await axios.post(`${url}/api/v1/progress/${courseId}/lesson/${nextLessonId}/current`, {}, { withCredentials: true });
        setCurrentLessonIndex(currentLessonIndex + 1);
      } else {
        alert(accessRes.data.data.reason || 'You cannot access this lesson yet.');
      }
    }
  };

  // Mark lesson as completed (after quiz passed)
  const handleQuizComplete = async (quizIndex, passed) => {
    const quizKey = `${currentLessonIndex}-${quizIndex}`;
    setQuizResults(prev => ({ ...prev, [quizKey]: passed }));
    // If all quiz questions passed, mark lesson as complete
    if (passed) {
      // Check if all questions for this lesson are passed
      const allPassed = currentLesson.quiz?.questions?.every((_, idx) => {
        const key = `${currentLessonIndex}-${idx}`;
        return quizResults[key] === true || (quizIndex === idx && passed);
      });
      if (allPassed && !completedLessons.includes(currentLesson._id)) {
        await axios.post(`${url}/api/v1/progress/${courseId}/lesson/${currentLesson._id}/complete`, { xpGained: 10 }, { withCredentials: true });
        // Refresh progress
        const progressRes = await axios.post(`${url}/api/v1/progress/${courseId}`, {}, { withCredentials: true });
        setProgress(progressRes.data.data);
      }
    }
  };

  // Complete course handler
  const handleCourseComplete = async () => {
    // Optionally, you can call a backend endpoint to finalize course completion or just navigate
    navigate('/certificate');
  };

  // Quiz passing logic
  const isQuizPassed = (() => {
    if (!currentLesson.quiz || !currentLesson.quiz.questions || currentLesson.quiz.questions.length === 0) {
      return true;
    }
    return currentLesson.quiz.questions.every((_, index) => {
      const quizKey = `${currentLessonIndex}-${index}`;
      return quizResults[quizKey] === true;
    });
  })();

  const isFirstLesson = currentLessonIndex === 0;
  const isLastLesson = currentLessonIndex === totalLessons - 1;
  const isCourseComplete = progress.isCompleted;

  return (
    <div className="flex min-h-screen bg-[#0d0d0d]">
      <CourseSidebar 
        course={courseContent}
        currentLesson={currentLesson}
        currentLessonIndex={currentLessonIndex}
        totalLessons={totalLessons}
        progressPercentage={progressPercentage}
        completedLessons={completedLessons}
      />
      <main className="flex-1 lg:ml-64 p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="bg-[#1a1a1a] rounded-2xl p-8 border border-gray-800"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            key={`${currentLessonIndex}`}
          >
            <div className="lg:hidden mb-6">
              <Link 
                to="/course" 
                className="inline-block text-pink-500 hover:text-pink-400 transition-colors"
              >
                ← Back to Course Generator
              </Link>
            </div>
            <div className="mb-8">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 text-transparent bg-clip-text mb-4">
                {currentLesson.title}
              </h1>
              <p className="text-gray-400">
                Lesson {currentLessonIndex + 1} of {totalLessons} • {progressPercentage}% Complete
              </p>
            </div>
            {/* Content Sections */}
            <div className="space-y-8">
              <LessonContent lesson={currentLesson} />
              {currentLesson.quiz?.questions?.map((question, index) => (
                <QuizSection
                  key={`${currentLessonIndex}-${index}`}
                  quiz={question}
                  onComplete={(passed) => handleQuizComplete(index, passed)}
                />
              ))}
              <LessonNavigation 
                onPrevious={handlePreviousLesson}
                onNext={handleNextLesson}
                onComplete={handleCourseComplete}
                isFirstLesson={isFirstLesson}
                isLastLesson={isLastLesson}
                isQuizPassed={isQuizPassed}
                isCourseComplete={isCourseComplete}
                progressPercentage={progressPercentage}
              />
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default CourseContain;