import React from 'react';
import { motion } from 'framer-motion';

const LessonNavigation = ({
  onPrevious,
  onNext,
  onComplete,
  isFirstLesson,
  isLastLesson,
  isQuizPassed,
  isLastModule,
  isCourseComplete,
  progressPercentage,
}) => {
  return (
    <div className="space-y-6">
      {/* Navigation Buttons */}
      <div className="flex justify-between items-center">
        <motion.button
          onClick={onPrevious}
          disabled={isFirstLesson}
          whileHover={{ scale: isFirstLesson ? 1 : 1.05 }}
          whileTap={{ scale: isFirstLesson ? 1 : 0.95 }}
          className={`px-6 py-3 rounded-xl transition-all ${
            isFirstLesson
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-[#2a2a2a] text-white hover:bg-[#3a3a3a]'
          }`}
        >
          ← Previous Lesson
        </motion.button>
        
        {/* Only show Next button if not on last lesson or if course isn't complete */}
        {(!isLastLesson || !isLastModule) && (
          <motion.button
            onClick={onNext}
            disabled={!isQuizPassed}
            whileHover={{ scale: !isQuizPassed ? 1 : 1.05 }}
            whileTap={{ scale: !isQuizPassed ? 1 : 0.95 }}
            className={`px-6 py-3 rounded-xl transition-all ${
              !isQuizPassed
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg hover:shadow-pink-500/30'
            }`}
          >
            Next Lesson →
          </motion.button>
        )}
      </div>

      {/* Complete Course Button - Shows when 100% complete */}
      {progressPercentage === 100 && isQuizPassed && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center"
        >
          <motion.button
            onClick={onComplete}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold shadow-lg hover:shadow-green-500/30 transition-all flex items-center gap-2"
          >
            <span>🎉</span>
            Complete Course and Get Certificate
            <span>🏆</span>
          </motion.button>
        </motion.div>
      )}

      {/* Quiz Required Message */}
      {!isQuizPassed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4"
        >
          ⚠️ Complete the quiz to unlock the next lesson
        </motion.div>
      )}
    </div>
  );
};

export default LessonNavigation;
