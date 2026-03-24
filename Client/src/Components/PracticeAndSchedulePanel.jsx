import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

const API_BASE = 'http://localhost:3000';

const PracticeAndSchedulePanel = ({
  courseId,
  defaultTopic = 'General',
  weakTopics = [],
  showPractice = true,
  showSchedule = true,
}) => {
  const [userCourses, setUserCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(courseId || '');
  const [courseTopics, setCourseTopics] = useState([]);
  const [studiedTopics, setStudiedTopics] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [difficulty, setDifficulty] = useState('medium');
  const [practiceQuestions, setPracticeQuestions] = useState([]);
  const [practiceLoading, setPracticeLoading] = useState(false);
  const [practiceError, setPracticeError] = useState('');
  const [topicsLoading, setTopicsLoading] = useState(false);

  const [availableTime, setAvailableTime] = useState(60);
  const [schedule, setSchedule] = useState(null);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [scheduleError, setScheduleError] = useState('');

  const [adaptiveWeakTopics, setAdaptiveWeakTopics] = useState([]);
  const [strongTopics, setStrongTopics] = useState([]);
  const [weakAreaQuiz, setWeakAreaQuiz] = useState([]);
  const [weakAreaAnswers, setWeakAreaAnswers] = useState({});
  const [weakAreaLoading, setWeakAreaLoading] = useState(false);
  const [weakAreaSubmitting, setWeakAreaSubmitting] = useState(false);
  const [weakAreaError, setWeakAreaError] = useState('');
  const [weakAreaResult, setWeakAreaResult] = useState(null);

  const normalizeTopicStrings = (items) => {
    if (!Array.isArray(items)) return [];
    return items
      .map((item) => {
        if (typeof item === 'string') return item.trim();
        if (item && typeof item === 'object' && item.topic) return String(item.topic).trim();
        return '';
      })
      .filter(Boolean);
  };

  const mergeTopicSources = (...sourceArrays) => {
    const next = [];
    const seen = new Set();
    sourceArrays.forEach((arr) => {
      normalizeTopicStrings(arr).forEach((topic) => {
        if (seen.has(topic)) return;
        seen.add(topic);
        next.push(topic);
      });
    });
    return next;
  };

  const resolveAvailableTopics = () => {
    return mergeTopicSources(courseTopics, studiedTopics, adaptiveWeakTopics, [defaultTopic]);
  };

  const availableTopics = resolveAvailableTopics();

  useEffect(() => {
    setSelectedCourseId(courseId || localStorage.getItem('activeCourseId') || '');
  }, [courseId]);

  useEffect(() => {
    const loadUserPracticeContext = async () => {
      try {
        const [progressRes, topicRes, weakRes] = await Promise.all([
          axios.post(`${API_BASE}/api/v1/progress/`, {}, { withCredentials: true }),
          axios.get(`${API_BASE}/api/v1/progress/topic`, { withCredentials: true }),
          axios.get(`${API_BASE}/api/v1/progress/weak-areas`, { withCredentials: true }),
        ]);

        const progressList = Array.isArray(progressRes?.data?.data) ? progressRes.data.data : [];
        const courseOptions = [];
        const seenCourseIds = new Set();

        progressList.forEach((item) => {
          const currentCourseId = item?.course?._id;
          const currentCourseTitle = item?.course?.title;
          if (!currentCourseId || seenCourseIds.has(currentCourseId)) return;
          seenCourseIds.add(currentCourseId);
          courseOptions.push({ _id: currentCourseId, title: currentCourseTitle || 'Course' });
        });

        setUserCourses(courseOptions);

        if (!selectedCourseId && courseOptions.length > 0) {
          setSelectedCourseId(courseOptions[0]._id);
          localStorage.setItem('activeCourseId', courseOptions[0]._id);
        }

        const topicStats = Array.isArray(topicRes?.data?.data) ? topicRes.data.data : [];
        const studied = topicStats
          .map((entry) => entry?.topic)
          .filter(Boolean);
        setStudiedTopics(studied);

        const weakRaw = Array.isArray(weakRes?.data?.weakTopics) ? weakRes.data.weakTopics : [];
        const normalizedWeak = normalizeTopicStrings(weakRaw);
        setAdaptiveWeakTopics(normalizedWeak);
      } catch {
        setUserCourses([]);
      }
    };

    loadUserPracticeContext();
  }, []);

  useEffect(() => {
    const fetchTopics = async () => {
      if (!selectedCourseId) {
        setCourseTopics([]);
        return;
      }
      setTopicsLoading(true);
      try {
        const res = await axios.get(`${API_BASE}/api/v1/courses/topics`, {
          params: { courseId: selectedCourseId },
          withCredentials: true,
        });

        const topics = res?.data?.topics || [];
        setCourseTopics(topics);
      } catch {
        setCourseTopics([]);
      } finally {
        setTopicsLoading(false);
      }
    };

    fetchTopics();
  }, [selectedCourseId]);

  useEffect(() => {
    if (!availableTopics.length) {
      setSelectedTopics([]);
      return;
    }

    setSelectedTopics((prev) => {
      const filtered = prev.filter((topic) => availableTopics.includes(topic));
      if (filtered.length > 0) return filtered;
      return [availableTopics[0]];
    });
  }, [courseTopics, studiedTopics, adaptiveWeakTopics, defaultTopic]);

  useEffect(() => {
    setAdaptiveWeakTopics(Array.isArray(weakTopics) ? weakTopics : []);
  }, [weakTopics]);

  const loadSchedule = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/v1/schedule`, { withCredentials: true });
      setSchedule(res?.data?.schedule || []);
    } catch {
      setSchedule([]);
    }
  };

  useEffect(() => {
    loadSchedule();
  }, []);

  const generatePractice = async () => {
    setPracticeLoading(true);
    setPracticeError('');
    try {
      const topics = selectedTopics.length ? selectedTopics : availableTopics;

      if (!topics.length) {
        setPracticeError('No topics available yet. Please select a course or complete a lesson first.');
        setPracticeLoading(false);
        return;
      }

      const res = await axios.post(
        `${API_BASE}/api/v1/practice/generate`,
        { topics, difficulty },
        { withCredentials: true }
      );
      setPracticeQuestions(res?.data?.questions || res?.data?.data?.questions || []);
    } catch (err) {
      setPracticeError(err?.response?.data?.message || 'Failed to generate practice questions.');
    } finally {
      setPracticeLoading(false);
    }
  };

  const toggleTopic = (topic) => {
    setSelectedTopics((prev) => {
      if (prev.includes(topic)) return prev.filter((item) => item !== topic);
      return [...prev, topic];
    });
  };

  const selectWeakTopics = () => {
    const weakOnly = normalizeTopicStrings(adaptiveWeakTopics).filter((topic) => availableTopics.includes(topic));
    if (weakOnly.length) setSelectedTopics(weakOnly);
  };

  const selectStudiedTopics = () => {
    const studiedOnly = normalizeTopicStrings(studiedTopics).filter((topic) => availableTopics.includes(topic));
    if (studiedOnly.length) setSelectedTopics(studiedOnly);
  };

  const generateSchedule = async () => {
    setScheduleLoading(true);
    setScheduleError('');
    try {
      const res = await axios.post(
        `${API_BASE}/api/v1/schedule/generate`,
        { weakTopics: normalizeTopicStrings(adaptiveWeakTopics), availableTime: Number(availableTime) || 60 },
        { withCredentials: true }
      );
      setSchedule(res?.data?.schedule || []);
    } catch (err) {
      setScheduleError(err?.response?.data?.message || 'Failed to generate study schedule.');
    } finally {
      setScheduleLoading(false);
    }
  };

  const handlePracticeWeakAreas = async () => {
    setWeakAreaLoading(true);
    setWeakAreaError('');
    setWeakAreaResult(null);
    setWeakAreaAnswers({});

    try {
      const res = await axios.post(
        `${API_BASE}/api/v1/quiz/weak-area`,
        {},
        { withCredentials: true }
      );

      setWeakAreaQuiz(res?.data?.questions || []);
      setAdaptiveWeakTopics(normalizeTopicStrings(res?.data?.weakTopics || adaptiveWeakTopics));
      setStrongTopics(res?.data?.strongTopics || []);
    } catch (err) {
      setWeakAreaError(err?.response?.data?.message || 'Failed to generate weak-area quiz.');
    } finally {
      setWeakAreaLoading(false);
    }
  };

  const handleWeakAnswerSelect = (questionId, selectedIndex) => {
    setWeakAreaAnswers((prev) => ({ ...prev, [questionId]: selectedIndex }));
  };

  const submitWeakAreaQuiz = async () => {
    if (!weakAreaQuiz.length) return;
    setWeakAreaSubmitting(true);
    setWeakAreaError('');

    try {
      const answers = weakAreaQuiz.map((question) => ({
        questionId: question.questionId,
        topic: question.topic,
        isCorrect: Number(weakAreaAnswers[question.questionId]) === Number(question.answerIndex),
      }));

      const res = await axios.post(
        `${API_BASE}/api/v1/quiz/weak-area/submit`,
        { answers },
        { withCredentials: true }
      );

      setWeakAreaResult(res?.data || null);
      setAdaptiveWeakTopics(normalizeTopicStrings(res?.data?.weakTopics || []));
      setStrongTopics(res?.data?.strongTopics || []);
    } catch (err) {
      setWeakAreaError(err?.response?.data?.message || 'Failed to submit weak-area quiz.');
    } finally {
      setWeakAreaSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {showPractice && (
      <motion.div
        className="bg-[#2a2a2a] rounded-xl p-6 border border-gray-700 space-y-5"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-xl font-semibold text-white">🧠 AI Practice Generator</h2>

        <div>
          <p className="text-sm text-gray-300 mb-3">Selected Course</p>
          <select
            value={selectedCourseId}
            onChange={(event) => {
              const nextCourseId = event.target.value;
              setSelectedCourseId(nextCourseId);
              if (nextCourseId) localStorage.setItem('activeCourseId', nextCourseId);
            }}
            className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg p-3 text-gray-200"
          >
            <option value="">No specific course selected</option>
            {userCourses.map((course) => (
              <option key={course._id} value={course._id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <p className="text-sm text-gray-300 mb-3">Select Topics</p>
          {topicsLoading ? (
            <p className="text-gray-400 text-sm">Loading topics...</p>
          ) : (
            <>
            <div className="flex flex-wrap gap-2 mb-3">
              <button
                onClick={selectWeakTopics}
                className="px-3 py-1 rounded-full text-xs bg-red-500/10 border border-red-500/30 text-red-300"
              >
                Use Weak Topics
              </button>
              <button
                onClick={selectStudiedTopics}
                className="px-3 py-1 rounded-full text-xs bg-blue-500/10 border border-blue-500/30 text-blue-300"
              >
                Use Studied Topics
              </button>
              <button
                onClick={() => setSelectedTopics([])}
                className="px-3 py-1 rounded-full text-xs bg-[#1a1a1a] border border-gray-700 text-gray-300"
              >
                Clear
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {availableTopics.map((topic) => {
                const active = selectedTopics.includes(topic);
                const isWeak = normalizeTopicStrings(adaptiveWeakTopics).includes(topic);
                const isStudied = normalizeTopicStrings(studiedTopics).includes(topic);
                const isCourseTopic = normalizeTopicStrings(courseTopics).includes(topic);
                return (
                  <button
                    key={topic}
                    onClick={() => toggleTopic(topic)}
                    className={`px-3 py-1 rounded-full text-sm border transition-all ${
                      active
                        ? 'bg-pink-600/20 border-pink-500 text-pink-300'
                        : 'bg-[#1a1a1a] border-gray-700 text-gray-300 hover:border-pink-500'
                    }`}
                  >
                    {topic}
                    {isWeak && <span className="ml-1 text-[10px] text-red-300">• weak</span>}
                    {!isWeak && isStudied && <span className="ml-1 text-[10px] text-blue-300">• studied</span>}
                    {!isWeak && !isStudied && isCourseTopic && <span className="ml-1 text-[10px] text-purple-300">• course</span>}
                  </button>
                );
              })}
            </div>
            </>
          )}
        </div>

        <div>
          <p className="text-sm text-gray-300 mb-3">Difficulty</p>
          <div className="grid grid-cols-3 gap-3">
            {['easy', 'medium', 'hard'].map((level) => (
              <button
                key={level}
                onClick={() => setDifficulty(level)}
                className={`rounded-lg p-3 border text-sm font-medium uppercase ${
                  difficulty === level
                    ? 'bg-purple-600/20 border-purple-500 text-purple-300'
                    : 'bg-[#1a1a1a] border-gray-700 text-gray-300 hover:border-purple-500'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={generatePractice}
            disabled={practiceLoading || selectedTopics.length === 0}
            className="px-5 py-2 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 text-white disabled:bg-gray-700"
          >
            {practiceLoading ? 'Generating...' : 'Generate'}
          </button>
          <button
            onClick={generatePractice}
            disabled={practiceLoading || selectedTopics.length === 0}
            className="px-5 py-2 rounded-lg bg-[#1a1a1a] border border-gray-700 text-gray-200 hover:border-pink-500 disabled:opacity-50"
          >
            Regenerate
          </button>
        </div>

        <div className="pt-2 border-t border-gray-700">
          <button
            onClick={handlePracticeWeakAreas}
            disabled={weakAreaLoading}
            className="px-5 py-2 rounded-lg bg-[#1a1a1a] border border-pink-500/40 text-pink-300 hover:bg-pink-500/10 disabled:opacity-60"
          >
            {weakAreaLoading ? 'Preparing Weak Area Quiz...' : 'Practice Weak Areas'}
          </button>

          {(adaptiveWeakTopics.length > 0 || strongTopics.length > 0) && (
            <div className="mt-3 space-y-2">
              <div className="flex flex-wrap gap-2">
                {(adaptiveWeakTopics || []).map((topic) => (
                  <span key={`weak-${topic}`} className="px-2 py-1 rounded-full text-xs bg-red-500/10 border border-red-500/30 text-red-300">
                    Weak: {topic}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {(strongTopics || []).map((topic) => (
                  <span key={`strong-${topic}`} className="px-2 py-1 rounded-full text-xs bg-green-500/10 border border-green-500/30 text-green-300">
                    Strong: {topic}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {practiceError && <p className="text-red-400 text-sm">{practiceError}</p>}

        {weakAreaError && <p className="text-red-400 text-sm">{weakAreaError}</p>}

        {weakAreaQuiz.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-white font-semibold">Adaptive Weak Area Quiz</h3>
            {weakAreaQuiz.map((q, idx) => (
              <div key={q.questionId || idx} className="bg-[#1a1a1a] border border-gray-700 rounded-lg p-4">
                <p className="text-white mb-1">{idx + 1}. {q.question}</p>
                <p className="text-xs text-red-300 mb-2">Topic: {q.topic}</p>
                <div className="space-y-2">
                  {(q.options || []).map((opt, optionIdx) => {
                    const selected = Number(weakAreaAnswers[q.questionId]) === optionIdx;
                    return (
                      <button
                        key={optionIdx}
                        onClick={() => handleWeakAnswerSelect(q.questionId, optionIdx)}
                        className={`w-full text-left p-2 rounded-md border ${
                          selected
                            ? 'border-pink-500 bg-pink-500/10 text-pink-200'
                            : 'border-gray-700 bg-[#2a2a2a] text-gray-300 hover:border-pink-500'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <button
              onClick={submitWeakAreaQuiz}
              disabled={weakAreaSubmitting || weakAreaQuiz.some((q) => weakAreaAnswers[q.questionId] === undefined)}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 text-white disabled:bg-gray-700"
            >
              {weakAreaSubmitting ? 'Submitting...' : 'Submit Weak Area Quiz'}
            </button>

            {weakAreaResult?.topicReport?.length > 0 && (
              <div className="bg-[#1a1a1a] border border-gray-700 rounded-lg p-4">
                <p className="text-white font-semibold mb-2">Performance Feedback</p>
                <div className="space-y-1 text-sm">
                  {weakAreaResult.topicReport.map((item) => (
                    <p key={item.topic} className={item.status === 'strong' ? 'text-green-300' : 'text-red-300'}>
                      {item.topic}: {item.accuracy}% ({item.status})
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {!!practiceQuestions.length && (
          <div className="grid md:grid-cols-2 gap-3">
            {practiceQuestions.map((q, idx) => (
              <motion.div
                key={idx}
                className="bg-[#1a1a1a] border border-gray-700 rounded-lg p-4"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="text-white mb-2">{idx + 1}. {q.question}</p>
                <p className="text-xs text-pink-300 mb-2">{q.topic || 'General'} • {(q.difficulty || difficulty).toUpperCase()}</p>
                <ul className="list-disc list-inside text-gray-300 text-sm">
                  {(q.options || []).map((opt, optIdx) => (
                    <li key={optIdx}>{opt}</li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
      )}

      {showSchedule && (
      <motion.div
        className="bg-[#2a2a2a] rounded-xl p-6 border border-gray-700 space-y-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-xl font-semibold text-white">📅 Study Schedule Recommendation</h2>
        <div className="grid md:grid-cols-3 gap-3 items-end">
          <div>
            <label className="text-sm text-gray-300 mb-1 block">Daily Available Time (min)</label>
            <input
              type="number"
              min={15}
              value={availableTime}
              onChange={(e) => setAvailableTime(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg p-3 text-gray-200"
            />
          </div>
          <div className="md:col-span-2">
            <button
              onClick={generateSchedule}
              disabled={scheduleLoading}
              className="px-5 py-3 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 text-white disabled:bg-gray-700"
            >
              {scheduleLoading ? 'Generating Schedule...' : 'Generate Schedule'}
            </button>
          </div>
        </div>

        {scheduleError && <p className="text-red-400 text-sm">{scheduleError}</p>}

        {schedule?.length > 0 && (
          <div className="space-y-3">
            {schedule.map((item, idx) => (
              <div key={`${item.topic}-${idx}`} className="bg-[#1a1a1a] border border-gray-700 rounded-lg p-4 flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-pink-400 font-semibold">{item.topic}</h4>
                  <p className="text-gray-300 text-sm mt-1">Priority: <span className="uppercase">{item.priority}</span></p>
                </div>
                <div className="text-right">
                  <p className="text-white font-semibold">{item.time} min</p>
                  <p className="text-xs text-gray-400">Allocated</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
      )}
    </div>
  );
};

export default PracticeAndSchedulePanel;
