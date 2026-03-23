import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FaFolder, FaArrowLeft, FaDownload, FaTrash } from "react-icons/fa";
import Sidebar from "@/components/dashboard/Sidebar";
import axios from "axios";
const url = "http://localhost:3000";






const NotesPage = () => {
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [allSubjects, setallSubjects] = useState([]);
  const [notes, setNotes] = useState([]);
  function convertToDownloadableCloudinaryUrl(url) {
    if (!url || typeof url !== 'string') {
      throw new Error('Invalid URL');
    }
  
    const uploadKeyword = '/upload/';
    const index = url.indexOf(uploadKeyword);
  
    if (index === -1) {
      throw new Error('Not a valid Cloudinary upload URL');
    }
  
    // Insert 'fl_attachment/' right after '/upload/'
    const before = url.substring(0, index + uploadKeyword.length);
    const after = url.substring(index + uploadKeyword.length);
  
    return `${before}fl_attachment/${after}`;
  }
  const fetchNotes = async () => {
      try {
        const response = await fetch(`${url}/api/v1/notes/get-notes`, {
          method: "POST",
          credentials: "include", // equivalent to axios's withCredentials: true
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ subject: selectedSubject }), // Pass the selected subject here
        });
    
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
    
        const data = await response.json();
        setNotes(data.data); // Assuming the response structure is { data: [...] }
      } catch (error) {
        console.error("Error fetching notes:", error);
      }
    };
  useEffect(() => {
    
if (selectedSubject) {
      fetchNotes();
    }
  }, [selectedSubject]);


useEffect(() => {
  
  const fetchSubjects = async () =>{
    try {
      const response = await axios.post(`${url}/api/v1/notes/get-subjects`, {}, { withCredentials: true });
      if(!response.data.success){
        throw new Error("Failed to fetch subjects")
      }
      const subjects = response.data.data;
      setallSubjects(subjects);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      
    }
  }
  fetchSubjects();

}, [])

  const handleBack = () => setSelectedSubject(null);
  const handleDelete = async (subject) => {
    try {
      const response = await axios.post(`${url}/api/v1/notes/delete-subject`, { 
        subject:subject 
      }, { withCredentials: true });
      if(!response.data.success){
        throw new Error("Failed to delete subject")
      }
      const subjects = response.data.data;
      setallSubjects(subjects);
    } catch (error) {
      console.error("Error deleting subject:", error);
      
    }
  }

  
  const handleNoteDelete = (e) => {
    e.stopPropagation();
    const noteId = e.target.closest("[data-id]").getAttribute("data-id");
    console.log(noteId);
    const response = axios.post(`${url}/api/v1/notes/delete-note`,{
      noteId: noteId
    }, { withCredentials: true })
    if(!response.data.success){
      throw new Error("Failed to delete note")
    }
    const notes = response.data.data;
    fetchNotes();
    
  }


  const renderFolderView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {allSubjects?.map((folder, index) => (
        <Card
          key={index}
          className="cursor-pointer hover:shadow-lg transition"
          onClick={() => setSelectedSubject(folder)}
        >
          <CardContent className="flex items-center space-x-4 p-6 justify-between">
           <div className="flex items-center space-x-4"> <FaFolder className="text-4xl text-indigo-600" />
            <span className="text-lg font-semibold">{folder}</span> </div>
            <div><FaTrash className="text-1xl text-indigo-600" onClick={(e) => {
              e.stopPropagation(); 
              handleDelete(folder);
            }} /></div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderFilesView = () => {

    return (
      <div>
        <Button
          variant="ghost"
          onClick={handleBack}
          className="mb-4 flex items-center text-indigo-600"
        >
          <FaArrowLeft className="mr-2" /> Back to Folders
        </Button>

        <h2 className="text-2xl font-bold text-gray-700 mb-6">{selectedSubject} Files</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {notes?.map((file, index) => {
  const downloadUrl = convertToDownloadableCloudinaryUrl(file.fileUrl);
          
  return (
    <Card key={index} className="p-4" data-id={file._id}>
      <CardContent>
        <p className="font-semibold text-gray-800 mb-2">{file.fileName}</p>
        <p className="text-sm text-gray-500 mb-4">Subject: {file.subject}</p>
        <div className="flex justify-between"><a
          href={downloadUrl}
          download
          className="inline-flex items-center text-indigo-600 hover:underline"
        >
          <FaDownload className="mr-2" /> Download
        </a>
        <FaTrash className="text-1xl text-indigo-600 cursor-pointer"
        onClick={(e) =>handleNoteDelete(e)}
        ></FaTrash>
        </div>
      </CardContent> 
    </Card>
  );
})}

        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-3xl font-bold text-indigo-700 mb-8">Your Notes</h1>
        {selectedSubject ? renderFilesView() : renderFolderView()}
      </main>
    </div>
  );
};

export default NotesPage;
