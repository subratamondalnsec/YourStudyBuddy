import React from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

const questionCount = new URLSearchParams(window.location.search).get('questionCount') || 0;
console.log('Question Count:', questionCount);

const quizId = window.location.pathname.split("/").slice(-1)[0];
export default function QuizAttemptStartPage() {
  const navigate = useNavigate();
  const count = useSelector((state) => state.questionCounter.value);
  const quizId = useSelector((state) => state.quizId.value);
  
  const handleStartQuiz = () => {
    // Navigate to quiz or trigger quiz start
    navigate(`/quiz/${quizId}`);
    console.log('Quiz started');
  };

  const sec = count * 30; // Assuming each question takes 30 seconds
  const formatTime = (sec) => {
    const min = Math.floor(sec / 60);
    const s = sec % 60;
    return `${min}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-6 flex justify-center items-center">
        <Card className="max-w-2xl w-full">
          <CardContent className="p-8 space-y-6">
            <h1 className="text-3xl font-bold text-indigo-700 text-center">🚀 Get Ready to Attempt Your Quiz</h1>

            <div className="space-y-3 text-gray-700 text-base leading-relaxed">
              <p>📌 You will have <strong>{formatTime(sec)} minutes</strong> to complete this quiz.</p>
              <p>📌 The quiz consists of <strong>{count} questions</strong> of mixed difficulty.</p>
              <p>📌 No negative marking. Each correct answer gives you points.</p>
              <p>📌 Do not refresh or close the window during the quiz.</p>
              <p>📌 Your score and analytics will be shown after submission.</p>
            </div>

            <div className="flex justify-center">
              <Button
                className="px-8 py-3 text-lg"
                onClick={() => handleStartQuiz()}
              >
                Start Quiz
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
