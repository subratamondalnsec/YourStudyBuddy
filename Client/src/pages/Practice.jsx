import React from 'react';
import { useSearchParams } from 'react-router-dom';
import PracticeAndSchedulePanel from '../Components/PracticeAndSchedulePanel';

const Practice = () => {
  const [searchParams] = useSearchParams();
  const queryCourseId = searchParams.get('courseId');
  const courseId = queryCourseId || localStorage.getItem('activeCourseId') || '';

  return (
    <div className="flex min-h-screen bg-[#0d0d0d]">
      <main className="flex-1 lg:ml-64 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20"></div>
        <div className="relative z-10 p-6 lg:p-8">
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-gray-800">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 text-transparent bg-clip-text mb-2">
                AI Practice
              </h1>
              <p className="text-gray-400">Generate targeted practice sets and adaptive weak-area quizzes.</p>
            </div>

            <PracticeAndSchedulePanel
              courseId={courseId}
              showPractice={true}
              showSchedule={false}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Practice;
