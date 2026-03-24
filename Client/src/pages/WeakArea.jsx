import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { FaExclamationTriangle, FaCheckCircle, FaBrain, FaBookOpen } from 'react-icons/fa';

const API_BASE = 'http://localhost:3000';

const normalizeWeakTopics = (input) => {
  if (!Array.isArray(input)) return [];

  return input
    .map((item) => {
      if (typeof item === 'string') {
        return { topic: item, wrongCount: 1 };
      }

      if (item && typeof item === 'object' && item.topic) {
        return {
          topic: item.topic,
          wrongCount: Number(item.wrongCount || 1),
        };
      }

      return null;
    })
    .filter(Boolean);
};

const WeakArea = () => {
  const [weakTopics, setWeakTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [explanations, setExplanations] = useState({});
  const [practiceByTopic, setPracticeByTopic] = useState({});
  const [answersByTopic, setAnswersByTopic] = useState({});
  const [practiceLoadingByTopic, setPracticeLoadingByTopic] = useState({});
  const [submitLoadingByTopic, setSubmitLoadingByTopic] = useState({});
  const [resultByTopic, setResultByTopic] = useState({});

  const topicList = useMemo(() => weakTopics.map((item) => item.topic), [weakTopics]);

  const fetchWeakAreas = async () => {
    try {
      setError('');
      const res = await axios.get(`${API_BASE}/api/v1/progress/weak-areas`, { withCredentials: true });
      const normalized = normalizeWeakTopics(res?.data?.weakTopics || []);
      setWeakTopics(normalized);
      return normalized;
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load weak areas.');
      setWeakTopics([]);
      return [];
    }
  };

  const fetchExplanation = async (topic) => {
    setExplanations((prev) => ({
      ...prev,
      [topic]: { ...(prev[topic] || {}), loading: true, error: '' },
    }));

    try {
      const res = await axios.get(`${API_BASE}/api/v1/topic/explanation`, {
        params: { topic },
        withCredentials: true,
      });

      setExplanations((prev) => ({
        ...prev,
        [topic]: {
          loading: false,
          error: '',
          explanation: res?.data?.explanation || 'No explanation available.',
        },
      }));
    } catch (err) {
      setExplanations((prev) => ({
        ...prev,
        [topic]: {
          loading: false,
          error: err?.response?.data?.message || 'Failed to load explanation.',
          explanation: '',
        },
      }));
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await fetchWeakAreas();
      await Promise.all(data.map((item) => fetchExplanation(item.topic)));
      setLoading(false);
    };

    load();
  }, []);

  useEffect(() => {
    setPracticeByTopic((prev) => {
      const next = {};
      topicList.forEach((topic) => {
        if (prev[topic]) next[topic] = prev[topic];
      });
      return next;
    });

    setAnswersByTopic((prev) => {
      const next = {};
      topicList.forEach((topic) => {
        if (prev[topic]) next[topic] = prev[topic];
      });
      return next;
    });

    setResultByTopic((prev) => {
      const next = {};
      topicList.forEach((topic) => {
        if (prev[topic]) next[topic] = prev[topic];
      });
      return next;
    });
  }, [topicList]);

  const handleGeneratePractice = async (topic) => {
    setPracticeLoadingByTopic((prev) => ({ ...prev, [topic]: true }));
    setResultByTopic((prev) => ({ ...prev, [topic]: null }));

    try {
      const res = await axios.post(
        `${API_BASE}/api/v1/practice/generate`,
        { topic, difficulty: 'medium' },
        { withCredentials: true }
      );

      const questions = res?.data?.questions || res?.data?.data?.questions || [];
      setPracticeByTopic((prev) => ({ ...prev, [topic]: questions.slice(0, 5) }));
      setAnswersByTopic((prev) => ({ ...prev, [topic]: {} }));
    } catch (err) {
      setResultByTopic((prev) => ({
        ...prev,
        [topic]: {
          type: 'error',
          message: err?.response?.data?.message || 'Failed to generate practice questions.',
        },
      }));
    } finally {
      setPracticeLoadingByTopic((prev) => ({ ...prev, [topic]: false }));
    }
  };

  const handleSelectAnswer = (topic, questionId, selectedIndex) => {
    setAnswersByTopic((prev) => ({
      ...prev,
      [topic]: {
        ...(prev[topic] || {}),
        [questionId]: selectedIndex,
      },
    }));
  };

  const handleSubmitTopicQuiz = async (topic) => {
    const questions = practiceByTopic[topic] || [];
    if (!questions.length) return;

    const selectedAnswers = answersByTopic[topic] || {};
    const allAnswered = questions.every((question, index) => {
      const questionId = question.questionId || `${topic}-${index}`;
      return selectedAnswers[questionId] !== undefined;
    });

    if (!allAnswered) {
      setResultByTopic((prev) => ({
        ...prev,
        [topic]: {
          type: 'error',
          message: 'Please answer all questions before submitting.',
        },
      }));
      return;
    }

    setSubmitLoadingByTopic((prev) => ({ ...prev, [topic]: true }));

    try {
      const answers = questions.map((question, index) => {
        const questionId = question.questionId || `${topic}-${index}`;
        const selected = Number(selectedAnswers[questionId]);

        return {
          questionId,
          topic,
          isCorrect: selected === Number(question.answerIndex),
        };
      });

      const res = await axios.post(
        `${API_BASE}/api/v1/quiz/weak-area/submit`,
        { answers },
        { withCredentials: true }
      );

      const report = Array.isArray(res?.data?.topicReport)
        ? res.data.topicReport.find((item) => item.topic === topic)
        : null;

      setResultByTopic((prev) => ({
        ...prev,
        [topic]: {
          type: 'success',
          message: report
            ? `Accuracy: ${report.accuracy}%. Topic marked as ${report.status}.`
            : 'Quiz submitted successfully.',
        },
      }));

      const refreshed = await fetchWeakAreas();
      await Promise.all(
        refreshed
          .map((item) => item.topic)
          .filter((topicName) => !explanations[topicName])
          .map((topicName) => fetchExplanation(topicName))
      );
    } catch (err) {
      setResultByTopic((prev) => ({
        ...prev,
        [topic]: {
          type: 'error',
          message: err?.response?.data?.message || 'Failed to submit weak-area quiz.',
        },
      }));
    } finally {
      setSubmitLoadingByTopic((prev) => ({ ...prev, [topic]: false }));
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0d0d0d]">
      <main className="flex-1 lg:ml-64 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20"></div>
        <div className="relative z-10 p-6 lg:p-8">
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-gray-800">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 text-transparent bg-clip-text mb-2">
                Weak Areas
              </h1>
              <p className="text-gray-400">See your mistake-prone topics, understand them, and practice immediately.</p>
            </div>

            {loading && <p className="text-gray-300">Loading weak areas...</p>}

            {!loading && error && (
              <div className="bg-[#1a1a1a] border border-red-500/40 rounded-xl p-4 text-red-300">
                {error}
              </div>
            )}

            {!loading && !error && weakTopics.length === 0 && (
              <div className="bg-[#1a1a1a] rounded-2xl p-8 border border-gray-800 text-center">
                <FaCheckCircle className="mx-auto text-3xl text-green-400 mb-3" />
                <p className="text-gray-300">No active weak areas right now. Keep practicing to stay sharp.</p>
              </div>
            )}

            {!loading && !error && weakTopics.map((item) => {
              const topic = item.topic;
              const explanationState = explanations[topic] || {};
              const topicQuestions = practiceByTopic[topic] || [];
              const topicAnswers = answersByTopic[topic] || {};
              const topicResult = resultByTopic[topic];
              const isGenerating = Boolean(practiceLoadingByTopic[topic]);
              const isSubmitting = Boolean(submitLoadingByTopic[topic]);

              return (
                <div key={topic} className="bg-[#1a1a1a] rounded-2xl p-6 border border-gray-800 space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
                        <FaExclamationTriangle className="text-red-400" />
                        {topic}
                      </h2>
                      <p className="text-red-300 text-sm mt-1">{item.wrongCount} {item.wrongCount === 1 ? 'mistake' : 'mistakes'}</p>
                    </div>

                    <button
                      onClick={() => handleGeneratePractice(topic)}
                      disabled={isGenerating}
                      className="px-4 py-2 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 text-white disabled:bg-gray-700"
                    >
                      {isGenerating ? 'Generating...' : 'Practice This Topic'}
                    </button>
                  </div>

                  <div className="bg-[#2a2a2a] border border-gray-700 rounded-xl p-4">
                    <p className="text-white font-semibold mb-2 flex items-center gap-2">
                      <FaBookOpen className="text-purple-300" />
                      Explanation
                    </p>
                    {explanationState.loading && <p className="text-gray-400 text-sm">Loading explanation...</p>}
                    {!explanationState.loading && explanationState.error && (
                      <p className="text-red-300 text-sm">{explanationState.error}</p>
                    )}
                    {!explanationState.loading && !explanationState.error && (
                      <p className="text-gray-300 text-sm leading-6">{explanationState.explanation}</p>
                    )}
                  </div>

                  {topicQuestions.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-white font-semibold flex items-center gap-2">
                        <FaBrain className="text-pink-300" />
                        Mini Quiz
                      </p>

                      {topicQuestions.map((question, index) => {
                        const questionId = question.questionId || `${topic}-${index}`;
                        return (
                          <div key={questionId} className="bg-[#2a2a2a] border border-gray-700 rounded-xl p-4">
                            <p className="text-gray-100 mb-3">{index + 1}. {question.question}</p>
                            <div className="space-y-2">
                              {(question.options || []).map((option, optionIndex) => {
                                const selected = Number(topicAnswers[questionId]) === optionIndex;
                                return (
                                  <button
                                    key={`${questionId}-${optionIndex}`}
                                    onClick={() => handleSelectAnswer(topic, questionId, optionIndex)}
                                    className={`w-full text-left p-2 rounded-lg border text-sm ${
                                      selected
                                        ? 'border-pink-500 bg-pink-500/10 text-pink-100'
                                        : 'border-gray-700 bg-[#1a1a1a] text-gray-300 hover:border-pink-500'
                                    }`}
                                  >
                                    {option}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}

                      <button
                        onClick={() => handleSubmitTopicQuiz(topic)}
                        disabled={isSubmitting}
                        className="px-4 py-2 rounded-lg bg-[#1a1a1a] border border-pink-500/40 text-pink-300 hover:bg-pink-500/10 disabled:opacity-60"
                      >
                        {isSubmitting ? 'Submitting...' : 'Submit Mini Quiz'}
                      </button>

                      {topicResult?.message && (
                        <p className={`text-sm ${topicResult.type === 'success' ? 'text-green-300' : 'text-red-300'}`}>
                          {topicResult.message}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

export default WeakArea;
