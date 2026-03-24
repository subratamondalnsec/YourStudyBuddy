import React, { useState } from 'react';
import { motion } from 'framer-motion';

const QuizSection = ({ quiz, onComplete }) => {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  
  console.log("QuizSection received quiz:", quiz);
  console.log("Quiz correctAnswer:", quiz.correctAnswer);
  console.log("Quiz answerIndex:", quiz.answerIndex);

  // Determine which property to use for correct answer
  const correctAnswerIndex = quiz.correctAnswer !== undefined ? quiz.correctAnswer : quiz.answerIndex;
  
  console.log("Using correctAnswerIndex:", correctAnswerIndex);

  const handleAnswerSelect = (index) => {
    if (isAnswered) return;
    
    console.log("Selected answer index:", index);
    console.log("Correct answer index:", correctAnswerIndex);
    
    setSelectedAnswer(index);
    setIsAnswered(true);

    const isPassed = index === correctAnswerIndex;
    console.log("Is answer correct?", isPassed);
    
    if (isPassed) {
      console.log("Calling onComplete(true)");
      onComplete?.(true);
      // Show success animation
      const confetti = document.createElement('div');
      confetti.className = 'fixed inset-0 pointer-events-none z-50';
      document.body.appendChild(confetti);
      setTimeout(() => confetti.remove(), 2000);
    } else {
      console.log("Calling onComplete(false)");
      onComplete?.(false);
    }
  };

  return (
    <motion.div
      className="bg-[#2a2a2a] rounded-xl p-6 border border-gray-700 hover:border-pink-500 transition-all"
      whileHover={{ scale: 1.02 }}
    >
      <h2 className="text-xl font-semibold text-white mb-4">🎯 Knowledge Check</h2>
      
      {/* Debug Info - Remove in production */}
      <div className="mb-4 p-2 bg-gray-800 rounded text-xs text-gray-400">
        <p>Correct Answer Index: {correctAnswerIndex}</p>
        <p>Selected: {selectedAnswer}</p>
        <p>Is Answered: {isAnswered}</p>
      </div>
      
      <div className="space-y-4">
        <div className="p-4 bg-[#1a1a1a] rounded-lg">
          <p className="text-white mb-3">{quiz.question}</p>
          <div className="space-y-2">
            {Array.isArray(quiz?.options) && quiz.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                disabled={isAnswered}
                className={`w-full p-3 text-left rounded-lg transition-colors ${
                  isAnswered
                    ? index === correctAnswerIndex
                      ? 'bg-green-500/20 text-green-300 border border-green-500/50'
                      : index === selectedAnswer
                      ? 'bg-red-500/20 text-red-300 border border-red-500/50'
                      : 'bg-[#2a2a2a] text-gray-400'
                    : 'bg-[#2a2a2a] text-gray-300 hover:bg-[#3a3a3a]'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          {isAnswered && (
            <div className={`mt-4 p-3 rounded-lg ${
              selectedAnswer === correctAnswerIndex
                ? 'bg-green-500/10 text-green-400'
                : 'bg-red-500/10 text-red-400'
            }`}>
              {selectedAnswer === correctAnswerIndex
                ? '✅ Correct! Well done!'
                : '❌ Not quite right. Try reviewing the material again.'}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default QuizSection;