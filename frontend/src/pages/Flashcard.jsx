  import React, { useState, useEffect } from 'react';
  import { Button } from '@/components/ui/button';
  import { FaPlus ,FaTrash,
  } from 'react-icons/fa';
  import Sidebar from "@/components/dashboard/Sidebar";
  import CardStack from '@/components/CardStack';
  import axios from 'axios';
  import './flashcard.css'; // Ensure you have the CSS for flip card and animations

  const url = "http://localhost:3000";

  export default function FlashcardPage() {
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [subjects, setSubjects] = useState([]);
    const [notes, setNotes] = useState([]);
    const [groups, setGroups] = useState([]);

    const [formData, setFormData] = useState({
      selectedSubject: "",
      selectedNote: "",
      flashcardNumber: 0,
    });

    const [selectedGroup, setSelectedGroup] = useState(null);
    const [flashcards, setFlashcards] = useState([]);
    const [showFlashcardViewer, setShowFlashcardViewer] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);

    useEffect(() => {
      if (formData.selectedSubject !== "") {
        handleNotesFetch();
      } else {
        setNotes([]);
      }
    }, [formData.selectedSubject]);

    useEffect(() => {
      axios.post(`${url}/api/v1/notes/get-subjects`, {}, { withCredentials: true })
        .then(res => {
          if (res.data.success) setSubjects(res.data.data);
        }).catch(err => console.error("Subject fetch error:", err));
    }, []);

    const handleNotesFetch = async () => {
      const subject = formData.selectedSubject;
      const res = await axios.post(`${url}/api/v1/notes/get-notes`, { subject }, { withCredentials: true });
      if (res.data.success) {
        setNotes(res.data.data);
      }
    };

    const handleDeleteGroup = async (groupId) => {
      try {
        const response = await axios.post(`${url}/api/v1/flashcard/delete-group`, { groupId }, { withCredentials: true });
        if (response.data.success) {
          console.log("Group deleted successfully");
        } else {
          console.error("Error deleting group:", response.data.message);
        }
      } catch (err) {
        console.error("Group deletion error:", err);
      }
    }
    const handleCreateFlashcard = async () => {
      try {
        const response = await axios.post(`${url}/api/v1/flashcard/create`, {
          selectedSubject: formData.selectedSubject,
          selectedNote: formData.selectedNote,
          flashcardNumber: formData.flashcardNumber,
        }, { withCredentials: true });

        if (response.data.success) {
          console.log("Flashcard created successfully");
        } else {
          console.error("Error creating flashcard:", response.data.message);
        }

        setFormData({ selectedSubject: "", selectedNote: "", flashcardNumber: 0 });
        setShowUploadModal(false);
      } catch (err) {
        console.error("Flashcard creation error:", err);
      }
    };

    useEffect(() => {
      axios.post(`${url}/api/v1/flashcard/groups`, {}, { withCredentials: true })
        .then(res => {
          if (res.data.success) {
            setGroups(res.data.data);
          }
        }).catch(err => console.error("group fetch error:", err));
    }, []);

    const handleGroupClick = async (groupId) => {
      
      try {
        const res = await axios.post(`${url}/api/v1/flashcard/get`, { groupId }, { withCredentials: true });
        console.log(res.data.data);
        
        if (res.data.success) {
          setFlashcards(res.data.data);
          setSelectedGroup(groupId);
          setCurrentIndex(0);
          setShowAnswer(false);
          setShowFlashcardViewer(true);
        }
      } catch (error) {
        console.error("Error fetching flashcards:", error);
      }
    };


    const handleFlashcardDelete = async (flashcardId) => {
      try {
        const response = await axios.post(`${url}/api/v1/flashcard/delete-card`, { flashcardId }, { withCredentials: true });
        if (response.data.success) {
          console.log("Flashcard deleted successfully");
          setFlashcards(flashcards.filter(f => f._id !== flashcardId));
          if (currentIndex >= flashcards.length - 1) {
            setCurrentIndex(flashcards.length - 2);
          }
        } else {
          console.error("Error deleting flashcard:", response.data.message);
        }
      } catch (err) {
        console.error("Flashcard deletion error:", err);
      }
    }
    const CreateFlashcardModal = () => (
      <div className="fixed inset-0 flex items-center justify-center z-50"> 
        <div className="fixed inset-0 bg-black opacity-50 z-40"></div>
        <div className="bg-white rounded-lg p-6 w-[90%] md:w-[400px] space-y-4 shadow-lg z-50">
          <h2 className="text-xl font-semibold mb-4">Create new flashcard group</h2>

          <select className="w-full border p-2 rounded cursor-pointer" onChange={e => setFormData({ ...formData, selectedSubject: e.target.value })}>
            <option value="">Select Subject</option>
            {subjects.map((s, i) => <option key={i} value={s}>{s}</option>)}
          </select>

          <select
            disabled={!formData.selectedSubject}
            style={{ opacity: formData.selectedSubject ? 1 : 0.5, cursor: formData.selectedSubject ? "pointer" : "not-allowed" }}
            className="w-full border p-2 rounded"
            onChange={e => setFormData({ ...formData, selectedNote: e.target.value })}
          >
            <option value="">Select Note</option>
            {notes.map((s, i) => <option key={i} value={s._id}>{s.fileName}</option>)}
          </select>

          <input
            type="number"
            placeholder="Number of Flashcards"
            value={formData.flashcardNumber}
            onChange={e => setFormData({ ...formData, flashcardNumber: e.target.value })}
            className="w-full border rounded p-2"
          />

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowUploadModal(false)}>Cancel</Button>
            <Button onClick={handleCreateFlashcard}>Create</Button>
          </div>
        </div>
      </div>
    );

    const FlashcardViewer = () => (
      <div className="fixed inset-0  backdrop-blur-sm z-50 flex items-center justify-center transition-opacity">
        <div className="fixed inset-0 bg-black  backdrop-blur-sm opacity-[30%] transition-opacity z-[60]" ></div>
        <div className="relative w-[90%] max-w-md h-[70vh] bg-white rounded-2xl shadow-xl p-8 pb-5 flex flex-col items-center justify-between animate-fade-in-up z-[100]">
          <button
            onClick={() => setShowFlashcardViewer(false)}
            className="absolute top-2 right-2 text-gray-500 hover:text-red-500 transition cursor-pointer"
          >✖</button>

          <div className="flex-1 w-full flex items-center justify-center perspective">
            <div className="relative w-full h-full">
            <div className="count absolute top-2 left-2 z-60 font-semibold ">{currentIndex + 1}/{flashcards.length}</div>  
              <div className="flip-card-inner w-full h-full" style={{ transform: `rotateY(${showAnswer ? 180 : 0}deg)` }}>
                <div className="flip-card-front absolute w-full h-full bg-indigo-100 rounded-xl flex items-center justify-center p-4 text-center text-lg font-semibold shadow-md">
            <FaTrash className="count absolute top-2 right-2 z-60 font-semibold text-black cursor-pointer hover:text-red-500"
            onClick={(e) => {
              e.stopPropagation();
              handleFlashcardDelete(flashcards[currentIndex]._id);
            }}
            ></FaTrash>  

                  {flashcards[currentIndex]?.front || "No Question"}
                </div>
                <div className="flip-card-back absolute w-full h-full bg-indigo-300 rounded-xl flex items-center justify-center p-4 text-center text-lg font-semibold shadow-md rotate-y-180 overflow-y-scroll pt-5">
                  
                  {flashcards[currentIndex]?.back || "No Answer"}
                
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center w-full mt-4">
            <button
              disabled={currentIndex === 0}
              onClick={() => { setCurrentIndex(currentIndex - 1); setShowAnswer(false); }}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
            >
              Prev
            </button>
            <button
              onClick={() => setShowAnswer(!showAnswer)}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
            >
              {showAnswer ? "Hide Answer" : "Show Answer"}
            </button>
            <button
              disabled={currentIndex === flashcards.length - 1}
              onClick={() => { setCurrentIndex(currentIndex + 1); setShowAnswer(false); }}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    );

    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-indigo-700">Your FlashCards</h1>
            <Button onClick={() => setShowUploadModal(true)} className="flex items-center">
              <FaPlus className="mr-2" /> New FlashCard
            </Button>
          </div>

          <div className="flashcardGroups flex flex-wrap gap-4">
            {groups.map((group, index) => (
              <div
                onClick={() => handleGroupClick(group._id)}
                key={index}
                className="card h-[200px] w-[200px] rounded-lg flex items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-300 relative"
              
              >
                <FaTrash className="absolute top-2 right-2 z-50 text-indigo-700 hover:text-red-500 transition cursor-pointer"
                onClick={(e) =>{e.stopPropagation(); handleDeleteGroup(group._id)}}
                ></FaTrash>
                <CardStack title={group.note.fileName} />
              </div>
            ))}
          </div>
        </main>

        {showUploadModal && CreateFlashcardModal()}
        {showFlashcardViewer && FlashcardViewer()}
      </div>
    );
  }
