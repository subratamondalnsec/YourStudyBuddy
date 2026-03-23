import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FaPlus, FaTrash, FaChartPie } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { number } from 'framer-motion';
import { setQuestionCount } from '@/redux/quiz/questionCountSlice';
import { setQuizId } from '@/redux/quiz/quizIdSlice';
import { useDispatch } from 'react-redux';
// const quizzes = [
//   { id: 1, title: 'JavaScript Basics Quiz', subject: 'JavaScript', note: 'JS Notes', attempts: 3 },
//   { id: 2, title: 'React Components Quiz', subject: 'React', note: 'React Guide', attempts: 2 },
// ];
  const url = "http://localhost:3000";


export default function QuizDashboard() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [notes, setNotes] = useState([]);
  const navigate = useNavigate();
  const [showMobileOptions, setShowMobileOptions] = useState(false);
  const [formData, setFormData] = useState({
        selectedSubject: "",
        selectedNote: "",
        difficulty:"",
        numberOfQuestions: 0,
      });
  const [quizzes, setQuizzes] = useState([])
  const dispatch = useDispatch()
  
   useEffect(() => {
      axios.post(`${url}/api/v1/notes/get-subjects`, {}, { withCredentials: true })
        .then(res => {
          if (res.data.success) setSubjects(res.data.data);
        }).catch(err => console.error("Subject fetch error:", err));
    }, []);

     useEffect(() => {
      axios.post(`${url}/api/v1/quiz/fetch`, {}, { withCredentials: true })
        .then(res => {
          console.log(res.data.data);
          if (res.data.success) setQuizzes(res.data.data);
        }).catch(err => console.error("Quiz fetch error:", err));
    }, []);
    const handleNotesFetch = async () => {
      const subject = formData.selectedSubject;
      const res = await axios.post(`${url}/api/v1/notes/get-notes`, { subject }, { withCredentials: true });
      if (res.data.success) {
        setNotes(res.data.data);
      }
    };

useEffect(() => {
      if (formData.selectedSubject !== "") {
        handleNotesFetch();
      } else {
        setNotes([]);
      }
    }, [formData.selectedSubject]);

  const handleCreateQuiz = async () => {
    if (!formData.selectedSubject || !formData.selectedNote || !formData.difficulty) {
      alert("Please fill all fields");
      return;
    }

    try {
      const response = await axios.post(`${url}/api/v1/quiz/create`, {
        subject: formData.selectedSubject,
        note: formData.selectedNote,
        difficulty: formData.difficulty,
        numberOfQuestions: formData.numberOfQuestions,
      }, { withCredentials: true });
      console.log("Quiz creation response:", response);
      if (response.data.success) {
        alert("Quiz created successfully!");

        setShowCreateModal(false);
        setFormData({
          selectedSubject: "",
          selectedNote: "",
          difficulty: "",
          numberOfQuestions: 0,
        });
        // Optionally, refresh the quizzes list or redirect
      } else {
        alert("Failed to create quiz: " + response.data.message);
      }
    } catch (error) {
      console.error("Error creating quiz:", error);
      alert("An error occurred while creating the quiz.");
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-700">Your Quizzes</h1>
           <div className="relative md:hidden">
        <Button onClick={() => setShowMobileOptions(!showMobileOptions)}>
          <FaPlus className="mr-2" />
        </Button>

        {/* Floating Card */}
        {showMobileOptions && (
          <div className="absolute top-full mt-2 right-0 bg-white shadow-lg border border-gray-200 rounded-md z-50 p-2 w-40">
            <button
              className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
              onClick={() => {
                setShowCreateModal(true);
                setShowMobileOptions(false);
              }}
            >
              Add Quiz
            </button>
            <button
              className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
              onClick={() => {
                setShowCreateModal(true);
                setShowMobileOptions(false);
              }}
            >
              Create Quiz
            </button>
          </div>
        )}
      </div>

      {/* Desktop Buttons */}
      <div className="md:flex gap-2 md:flex-row hidden">
        <Button onClick={() => setShowCreateModal(true)} className="flex items-center cursor-pointer">
          <FaPlus className="" /> Add Quiz
        </Button>
        <Button onClick={() => setShowCreateModal(true)} className="flex items-center cursor-pointer">
          <FaPlus className="mr-2" /> Create Quiz
        </Button>
      </div>
        </div>

        {/* Quiz Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <Card key={quiz._id} className="relative shadow-lg">
              <CardContent className="p-4 flex flex-col gap-2">
                <h2 className="text-xl font-semibold text-indigo-600">{quiz.note.fileName} Quiz</h2>
                <p className="text-sm text-gray-600">Subject: {quiz.note.subject}</p>
                <p className="text-sm text-gray-600">From: {quiz.note.fileName}</p>
                <p className="text-sm text-gray-600 capitalize font-bold" style={{color: quiz.difficulty === "easy" ? "green" : quiz.difficulty === "medium" ? "orange" : "red"}} >{quiz.difficulty}</p>

                <div className="flex gap-2 mt-4">
                  <Button
                    onClick={() => {dispatch(setQuestionCount(quiz.questions.length)); dispatch(setQuizId(quiz._id)) ;navigate(`/quiz/start/${quiz._id}`)}}
                    className="flex-1 cursor-pointer"
                  >
                    Attempt
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => console.log('Delete quiz', quiz._id)}
                    className="flex items-center justify-center cursor-pointer"
                  >
                    <FaTrash className="text-black" />
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => navigate(`/quiz/${quiz._id}/analytics`)}
                    className="flex items-center justify-center cursor-pointer"
                  >
                    <FaChartPie />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Create Quiz Modal (simplified placeholder) */}
        {showCreateModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50">

          <div className="fixed inset-0 bg-black opacity-50 z-40"></div>
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md z-50">
              <h2 className="text-xl font-bold mb-4">Create Quiz</h2>
              <select className="w-full mb-3 border p-2 rounded cursor-pointer" onChange={e => setFormData({ ...formData, selectedSubject: e.target.value })}>
            <option value="">Select Subject</option>
            {subjects.map((s, i) => <option key={i} value={s}>{s}</option>)}
          </select>
              <select
            disabled={!formData.selectedSubject}
            style={{ opacity: formData.selectedSubject ? 1 : 0.5, cursor: formData.selectedSubject ? "pointer" : "not-allowed" }}
            className="w-full border p-2 mb-3 rounded"
            onChange={e => setFormData({ ...formData, selectedNote: e.target.value })}
          >
            <option value="">Select Note</option>
            {notes.map((s, i) => <option key={i} value={s._id}>{s.fileName}</option>)}
          </select>
              <select 
              disabled={!formData.selectedNote}
            style={{ opacity: formData.selectedNote ? 1 : 0.5, cursor: formData.selectedNote ? "pointer" : "not-allowed" }}
              className="w-full mb-3 border rounded p-2"
               onChange={e => setFormData({ ...formData, difficulty: e.target.value })}
              >
                <option value="">Select Difficulty </option>
                <option value="easy">Easy</option>
                <option value="medium" >Medium</option>
                <option value="hard" >Hard</option>
              </select>
               <select
            disabled={!formData.difficulty}
            style={{ opacity: formData.difficulty ? 1 : 0.5, cursor: formData.difficulty ? "pointer" : "not-allowed" }}
            className="w-full border p-2 mb-3 rounded"
            onChange={e => setFormData({ ...formData, numberOfQuestions: e.target.value })}
          >
            <option value="">Number of Questions</option>
            {[5, 10, 15, 20, 25].map((num, i) => <option key={i} value={num}>{num}</option>)}
          </select>
              <div className="flex justify-end space-x-2">
                          <Button className="cursor-pointer" variant="outline" onClick={() =>{ setShowCreateModal(false); setFormData({selectedSubject: "", selectedNote: "", difficulty: "", numberOfQuestions: ""})}}>Cancel</Button>
                          <Button className="cursor-pointer" onClick={() =>{handleCreateQuiz(); setShowCreateModal(false)}}>Create</Button>
              </div>
              
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
