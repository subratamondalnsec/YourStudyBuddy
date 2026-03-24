import React from 'react';
import { motion } from 'framer-motion';

const LessonContent = ({ lesson }) => {
  return (
    <div className="bg-[#2a2a2a] rounded-xl p-6 border border-gray-700">
      <h2 className="text-xl font-semibold text-white mb-4">📚 Lesson Content</h2>
      <div className="space-y-6">
        <div className="prose prose-invert max-w-none">
          <h3 className="text-lg font-semibold text-pink-400 mb-3">Introduction</h3>
          <p className="text-gray-300 leading-relaxed mb-4">{lesson.content}</p>
          
          <h3 className="text-lg font-semibold text-pink-400 mb-3">Key Concepts</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-300 mb-4">
            {lesson.keyPoints?.map((point, index) => (
              <li key={index}>{point}</li>
            ))}
          </ul>

          {lesson.examples && (
            <>
              <h3 className="text-lg font-semibold text-pink-400 mb-3">Examples</h3>
              <div className="bg-[#1a1a1a] p-4 rounded-lg mb-4">
                {lesson.examples}
              </div>
            </>
          )}

          {lesson.importantNotes && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-4">
              <h4 className="text-yellow-400 font-semibold mb-2">⚠️ Important Note</h4>
              <p className="text-gray-300">{lesson.importantNotes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonContent;
