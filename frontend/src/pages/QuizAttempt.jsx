import React, { useState, useEffect } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Circle } from "lucide-react";
import axios from "axios";
import { useSelector } from "react-redux";

// const quizId = window.location.pathname.split("/").slice(-1)[0];

const url = "http://localhost:3000";

export default function QuizAttemptPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(
    useSelector((state) => state.questionCounter.value) * 30
  ); // 5 minutes
  const totalTime = useSelector((state) => state.questionCounter.value) * 30; // 5 minutes in seconds
  const [Questions, setQuestions] = useState([]);
  const [score, setScore] = useState(0);
  const quizId = useSelector((state) => state.quizId.value);
  const [showModal, setShowModal] = useState(false);
  const [answers, setAnswers] = useState({
    question: "",
    isattempted: false,
    topic: "",
    selectedAnswer: "",
    isCorrect: false,
  });
  const [payload, setPayload] = useState({
    quizId: quizId,
    score: 0,
    timeTaken: 0,
    takenAt: new Date(),
    answers: [],
  });

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const response = await axios.post(
          `${url}/api/v1/quiz/questions`,
          { quizId },
          {
            withCredentials: true,
          }
        );

        const data = response.data;
        console.log("Quiz Data:", data);

        if (data.success && data.data) {
          const questionObj = data.data;

          // Handle both string and array responses (future-proofing)
          const isArray = Array.isArray(questionObj);
          const formatted = isArray
            ? questionObj.map((q) => ({
                id:q._id,
                questionText: q.questionText,
                options: q.options,
                topic: q.topic,

                correct: q.options.findIndex(
                  (opt) =>
                    opt.toLowerCase().trim() ===
                    q.correctAnswer.toLowerCase().trim()
                ),
                explanation: q.explanation,
              }))
            : [
                {
                  id: questionObj._id,
                  questionText: questionObj.questionText,
                  options: questionObj.options,
                  topic: questionObj.topic,
                  correct: questionObj.options.findIndex(
                    (opt) =>
                      opt.toLowerCase().trim() ===
                      questionObj.correctAnswer.toLowerCase().trim()
                  ),
                  explanation: questionObj.explanation,
                },
              ];

          setQuestions(formatted);
        } else {
          console.error("Failed to fetch quiz data:", data.message);
        }
      } catch (error) {
        console.error("Error fetching quiz data:", error);
      }
    };

    fetchQuizData();
  }, []);

  const currentQuestion = Questions[currentIndex];
  const totalQuestions = Questions.length;

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) clearInterval(interval);
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleOptionSelect = (optionIndex) => {
    setSelectedAnswers({ ...selectedAnswers, [currentIndex]: optionIndex });
  };

  const handleSubmit = () => {
    const totalTimeTaken = totalTime - timeLeft;
    setScore(
      Questions.reduce((acc, question, index) => {
        const isCorrect =
          selectedAnswers[index] !== undefined &&
          question.correct === selectedAnswers[index];
        return acc + (isCorrect ? 5 : 0);
      }, 0)
    );
    setShowModal(true);
    alert("Quiz submitted!");
    console.log("Selected Answers:", selectedAnswers);
    // You could also send this to backend here
  };
  const handleFinalSubmit = () => {
    const finalPayload = {
      ...payload,
      score: score,
      timeTaken: totalTime - timeLeft,
    };

    axios.post(`${url}/api/v1/quiz/submit`, finalPayload, {
      withCredentials: true,
    })
      .then((res) => {
        console.log("Quiz submitted successfully:", res.data);
        setShowModal(false);
        window.location.href = "/dashboard";
      })
      .catch((error) => {
        console.error("Error submitting quiz:", error);
      });
  }

  const handleNext = () => {
    payload.answers.length < currentIndex + 1 ?
      payload.answers.push({
        question:currentQuestion.id,
        isattempted: selectedAnswers[currentIndex] === undefined ? false : true,
    topic: currentQuestion.topic,
    selectedAnswer: parseInt(selectedAnswers[currentIndex]),
    isCorrect: currentQuestion.correct === parseInt(selectedAnswers[currentIndex]) ? true : 
    false,
      })
      :
      payload.answers[currentIndex] = {
        question:currentQuestion.id,
        isattempted: selectedAnswers[currentIndex] === undefined ? false : true,
    topic: currentQuestion.topic,
    selectedAnswer: parseInt(selectedAnswers[currentIndex]),
    isCorrect: currentQuestion.correct === parseInt(selectedAnswers[currentIndex]) ? true : 
    false,
      }

      console.log(payload);
      
  }


  const handlechange = (e) => {
    const { name, value } = e.target;
    setAnswers({ ...answers, [name]: value });
  };

  const formatTime = (sec) => {
    const min = Math.floor(sec / 60);
    const s = sec % 60;
    return `${min}:${s < 10 ? "0" : ""}${s}`;
  };

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600">Loading question...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="overlay bg-black fixed w-full h-full z-50 opacity-50 hidden"
      style={{ display: showModal ? "block" : "none" }}
      ></div>
      <section className="w-64 hidden h-25 bg-white shadow-md p-4 fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-55  flex-col items-center gap-4 rounded-lg"
      style={{ display: showModal ? "flex" : "none" }}>
    <h1>Want to Submit your Quiz?</h1>
    
    <div className="buttons"> 
      <Button onClick={handleFinalSubmit}>Submit</Button>
    <Button onClick={() =>{
     setShowModal(false)}}>Cancle</Button>
    </div>
      </section>
      <main className="flex-1 p-8">
        {/* Header with progress and timer */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-indigo-700">
            🧪 Quiz Attempt
          </h2>
          <div className="flex items-center gap-4">
            <Progress
              value={(currentIndex / totalQuestions) * 100}
              className="w-64 h-2 rounded-full bg-indigo-200"
              insideColor="#667eea"
            />

            <div className="flex items-center text-gray-700">
              <Circle className="w-4 h-4 mr-1 text-red-500 animate-pulse" />
              <span className="font-mono">{formatTime(timeLeft)}</span>
            </div>
          </div>
        </div>

        {/* Question card */}
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white p-6 rounded-xl shadow-lg"
        >
          <h3 className="text-lg font-semibold mb-4">
            Q{currentIndex + 1}. {currentQuestion.questionText}
          </h3>
          <div className="flex flex-col gap-3">
            {currentQuestion.options.map((option, idx) => (
              <label
                key={idx}
                className={`p-3 border rounded-lg cursor-pointer ${
                  selectedAnswers[currentIndex] === idx
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-gray-300 hover:border-indigo-300"
                }`}
              >
                <input
                  type="radio"
                  className="hidden"
                  name={`question-${currentIndex}`}
                  value={idx}
                  checked={selectedAnswers[currentIndex] === idx}
                  onChange={() => handleOptionSelect(idx)}
                />
                {option}
              </label>
            ))}
           </div>

           {/* Navigation */}
           <div className="flex justify-between mt-6">
            <Button
              onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
              disabled={currentIndex === 0}
              variant="outline"
            >
              Previous
            </Button>

            {currentIndex < totalQuestions - 1 ? (
              <Button
                onClick={() =>{
                  setCurrentIndex((prev) =>
                    Math.min(prev + 1, totalQuestions - 1)
                  );
                  handleNext()}
                }
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={() =>{handleNext();handleSubmit()}}
                // disabled={
                //   Object.keys(selectedAnswers).length !== totalQuestions
                // }
              >
                Submit Quiz
              </Button>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
