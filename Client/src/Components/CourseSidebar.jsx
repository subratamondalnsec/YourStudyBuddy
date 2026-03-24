import React from 'react';
import { Link } from 'react-router-dom';

const CourseSidebar = ({
  course,
  currentLesson,
  currentLessonIndex,
  totalLessons,
  progressPercentage,
  completedLessons = []
}) => {
  return (
    <div>
      <nav className="fixed top-0 left-0 h-screen w-64 bg-[#1a1a1a] border-r border-gray-800 hidden lg:flex lg:flex-col">
        {/* Header section - fixed */}
        <div className="p-6 space-y-8 flex-shrink-0">
          <Link
            to="/all-courses"
            className="flex items-center text-pink-500 hover:text-pink-400 transition-colors mb-8"
          >
            ← Back to All Courses
          </Link>

          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Course Progress</h3>
            <div className="relative pt-1 mb-4">
              <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-700">
                <div
                  style={{ width: `${progressPercentage}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-pink-500 to-purple-500"
                ></div>
              </div>
            </div>
            <p className="text-sm text-gray-400">
              {progressPercentage}% Complete
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-4">{course.title}</h3>
          </div>
        </div>

        {/* Lessons list - scrollable */}
        <div className="flex-1 overflow-hidden px-6 pb-6">
          <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 hover:scrollbar-thumb-pink-500 pr-2">
            <ul className="space-y-2">
              {course.lessons.map((lesson, index) => {
                const isCompleted = completedLessons.includes(lesson._id);
                return (
                  <li
                    key={lesson._id}
                    className={`text-sm py-2 px-3 rounded-lg transition-all cursor-pointer ${
                      index === currentLessonIndex 
                        ? 'text-pink-400 bg-pink-500/10 border-l-2 border-pink-500' 
                        : isCompleted
                        ? 'text-green-400 bg-green-500/10 border-l-2 border-green-500'
                        : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/50'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                        isCompleted
                          ? 'bg-green-500 text-white'
                          : index === currentLessonIndex
                          ? 'bg-pink-500 text-white'
                          : 'bg-gray-600 text-gray-300'
                      }`}>
                        {isCompleted ? '✓' : index + 1}
                      </span>
                      <span className="flex-1 truncate">{lesson.title}</span>
                    </div>
                    {/* Show quiz indicator if lesson has quiz */}
                    {lesson.quiz?.questions?.length > 0 && (
                      <div className="mt-1 ml-7">
                        <span className="text-xs text-yellow-400">🎯 Quiz Available</span>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Footer - fixed */}
        <div className="p-6 border-t border-gray-800 flex-shrink-0">
          <p className="text-sm text-gray-400 text-center">
            Lesson {currentLessonIndex + 1} of {totalLessons}
          </p>
        </div>
      </nav>
    </div>
  );
};

export default CourseSidebar;