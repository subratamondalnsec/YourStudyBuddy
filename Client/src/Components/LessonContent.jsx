import React from 'react';
import { motion } from 'framer-motion';

const LessonContent = ({ lesson }) => {
  const extractKeyConceptsFromContent = (content = '') => {
    if (!content || typeof content !== 'string') return [];

    const headingRegex = /(^|\n)#{1,6}\s*Key\s*Concepts?\s*\n([\s\S]*?)(\n#{1,6}\s|$)/i;
    const headingMatch = content.match(headingRegex);

    const sectionText = headingMatch?.[2]?.trim() || '';

    if (sectionText) {
      const bulletPoints = sectionText
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => /^[-*]\s+/.test(line) || /^\d+\.\s+/.test(line))
        .map((line) => line.replace(/^[-*]\s+/, '').replace(/^\d+\.\s+/, '').trim())
        .filter(Boolean);

      if (bulletPoints.length > 0) return bulletPoints;

      return sectionText
        .split(/\n+/)
        .map((line) => line.trim())
        .filter(Boolean)
        .slice(0, 5);
    }

    return content
      .split('.')
      .map((line) => line.trim())
      .filter((line) => line.length > 20)
      .slice(0, 4);
  };

  const keyConcepts =
    (Array.isArray(lesson.keyPoints) && lesson.keyPoints.length > 0 && lesson.keyPoints) ||
    (Array.isArray(lesson.keyConcepts) && lesson.keyConcepts.length > 0 && lesson.keyConcepts) ||
    (typeof lesson.keyConcepts === 'string' && lesson.keyConcepts.trim()
      ? lesson.keyConcepts.split(/\n|,/).map((item) => item.trim()).filter(Boolean)
      : null) ||
    extractKeyConceptsFromContent(lesson.content);

  return (
    <div className="bg-[#2a2a2a] rounded-xl p-6 border border-gray-700">
      <h2 className="text-xl font-semibold text-white mb-4">📚 Lesson Content</h2>
      <div className="space-y-6">
        <div className="prose prose-invert max-w-none">
          <h3 className="text-lg font-semibold text-pink-400 mb-3">Introduction</h3>
          <p className="text-gray-300 leading-relaxed mb-4">{lesson.content}</p>
          
          <h3 className="text-lg font-semibold text-pink-400 mb-3">Key Concepts</h3>
          {keyConcepts && keyConcepts.length > 0 ? (
            <ul className="list-disc list-inside space-y-2 text-gray-300 mb-4">
              {keyConcepts.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 mb-4">No key concepts available for this lesson yet.</p>
          )}

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
