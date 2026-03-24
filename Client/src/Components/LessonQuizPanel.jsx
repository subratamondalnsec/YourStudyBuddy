import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:3000';

const LessonQuizPanel = ({ courseId, lessonId, onQuizStatusChange, onWeakTopicsChange }) => {
  const [sessionId, setSessionId] = useState('');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const totalQuestions = questions.length;
  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);

  const loadQuizSession = async () => {
    if (!courseId || !lessonId) return;
    setLoading(true);
    setError('');
    setResult(null);
    setAnswers({});

    try {
      const startRes = await axios.post(
        `${API_BASE}/api/v1/quiz/start`,
        { courseId, lessonId },
        { withCredentials: true }
      );

      const newSessionId = startRes?.data?.data?.sessionId;
      setSessionId(newSessionId);

      const questionsRes = await axios.get(`${API_BASE}/api/v1/quiz/questions`, {
        params: { sessionId: newSessionId },
        withCredentials: true,
      });

      setQuestions(questionsRes?.data?.data?.questions || []);
      onQuizStatusChange?.(false);
      onWeakTopicsChange?.([]);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load quiz.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuizSession();
  }, [courseId, lessonId]);

  const handleAnswerChange = (questionIndex, selectedIndex) => {
    if (result) return;
    setAnswers((prev) => ({ ...prev, [questionIndex]: selectedIndex }));
  };

  const handleSubmitQuiz = async () => {
    if (!sessionId || !questions.length) return;
    setSubmitting(true);
    setError('');

    try {
      const payload = questions.map((q) => ({
        questionIndex: q.questionIndex,
        selectedIndex: answers[q.questionIndex] ?? -1,
      }));

      await axios.post(
        `${API_BASE}/api/v1/quiz/submit`,
        { sessionId, answers: payload },
        { withCredentials: true }
      );

      const resultRes = await axios.get(`${API_BASE}/api/v1/quiz/result`, {
        params: { sessionId },
        withCredentials: true,
      });

      const resultData = resultRes?.data?.data;
      setResult(resultData);
      onQuizStatusChange?.(!!resultData?.canProceed);
      onWeakTopicsChange?.(resultData?.weakTopics || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to submit quiz.');
      onQuizStatusChange?.(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTryAgain = async () => {
    if (!sessionId) return;
    setSubmitting(true);
    setError('');

    try {
      await axios.post(
        `${API_BASE}/api/v1/quiz/retry`,
        { sessionId },
        { withCredentials: true }
      );
      await loadQuizSession();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to reset quiz.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="bg-[#2a2a2a] rounded-xl p-6 border border-gray-700 text-gray-300">Loading quiz...</div>;
  }

  return (
    <div className="bg-[#2a2a2a] rounded-xl p-6 border border-gray-700 space-y-5">
      <h2 className="text-xl font-semibold text-white">🎯 Knowledge Check</h2>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      {questions.map((q) => (
        <div key={q.questionIndex} className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-700">
          <p className="text-white mb-3">{q.question}</p>
          <div className="space-y-2">
            {(q.options || []).map((option, optionIndex) => {
              const selected = answers[q.questionIndex] === optionIndex;
              return (
                <button
                  key={optionIndex}
                  onClick={() => handleAnswerChange(q.questionIndex, optionIndex)}
                  disabled={!!result}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selected
                      ? 'bg-pink-500/20 border border-pink-500 text-pink-200'
                      : 'bg-[#2a2a2a] border border-gray-700 text-gray-300 hover:bg-[#3a3a3a]'
                  } ${result ? 'cursor-not-allowed opacity-80' : ''}`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {!result && (
        <button
          onClick={handleSubmitQuiz}
          disabled={submitting || answeredCount !== totalQuestions || totalQuestions === 0}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white disabled:bg-gray-700 disabled:text-gray-400"
        >
          {submitting ? 'Submitting...' : 'Submit Quiz'}
        </button>
      )}

      {result && (
        <div className={`rounded-lg p-4 border ${result.canProceed ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
          <p className="text-white font-medium">Score: {result.score}/{result.totalQuestions} ({result.accuracy}%)</p>
          {!result.canProceed && (
            <>
              <p className="text-red-300 mt-2">You answered one or more questions incorrectly. Next lesson is locked.</p>
              {!!result.weakTopics?.length && (
                <div className="mt-3">
                  <p className="text-red-200 font-semibold mb-1">Weak Topics</p>
                  <ul className="list-disc list-inside text-red-200 text-sm">
                    {result.weakTopics.map((topic, index) => (
                      <li key={`${topic}-${index}`}>{topic}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}

          {result.canProceed ? (
            <p className="text-green-300 mt-2">Great work! You can proceed to the next lesson.</p>
          ) : (
            <button
              onClick={handleTryAgain}
              disabled={submitting}
              className="mt-4 px-5 py-2 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 text-white disabled:bg-gray-700 disabled:text-gray-400"
            >
              {submitting ? 'Resetting...' : 'Try Again'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default LessonQuizPanel;
