import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FaFolder, FaArrowLeft, FaDownload, FaTrash, FaPlus } from "react-icons/fa";
import Sidebar from "@/components/dashboard/Sidebar";
import axios from "axios";

const url = "http://localhost:3000";

const SummaryPage = () => {
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [summerySubject, setsummerySubject] = useState([])
  const [summaries, setSummaries] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [notes, setNotes] = useState([])
  const [formData, setFormData] = useState({
    summaryName: "",
    selectedSubject: "",
    selectedNote: "",
    summeryLength:""
  });

  const convertToDownloadableUrl = (url) => {
    const i = url.indexOf("/upload/");
    return i === -1 ? url : url.slice(0, i + 8) + "fl_attachment/" + url.slice(i + 8);
  };

  useEffect(() => {
    axios.post(`${url}/api/v1/summery/get-summery-subjects`, {}, { withCredentials: true })
      .then(res => {
        if (res.data.success) setsummerySubject(res.data.data);
      }).catch(err => console.error("Subject fetch error:", err));
  }, []); 

useEffect(() => {
    axios.post(`${url}/api/v1/notes/get-subjects`, {}, { withCredentials: true })
      .then(res => {
        if (res.data.success) setSubjects(res.data.data);
      }).catch(err => console.error("Subject fetch error:", err));
  }, []);

  useEffect(() => {
    if (selectedSubject) {
      axios.post(`${url}/api/v1/summery/get-summeries`, { subject: selectedSubject }, { withCredentials: true })
        .then(res =>{ 
          console.log(res.data.data);
          
          setSummaries(res.data.data)
          console.log(summaries);
          
    })
        .catch(err => console.error("Summary fetch error:", err));
    }
  }, [selectedSubject]);

  const handleSummaryDelete = async (id) => {
    await axios.post(`${url}/api/v1/summery/delete-summery`, { summaryId: id }, { withCredentials: true });
    setSummaries(prev => prev.filter(s => s._id !== id));
  };
   useEffect(() => {
    console.log("changed");
    
    if (formData.selectedSubject !== "") {
      console.log("fetching notes");
      
      handleNotesFetch();
    }
    else {
      setNotes([]); 
    }
  }, [formData.selectedSubject]);
  
  const handleFolderDelete = async (subject) => {
    await axios.post(`${url}/api/v1/summery/delete-subject`, { subject }, { withCredentials: true });
    setsummerySubject(prev => prev.filter(s => s !== subject));
    if (selectedSubject === subject) {
      setSelectedSubject(null);
      setSummaries([]);
    }
  }
  const handleNotesFetch = async () => {
    const subject = formData.selectedSubject
    const res = await axios.post(`${url}/api/v1/notes/get-notes`, { subject }, { withCredentials: true });
    if (res.data.success) {
      setNotes(res.data.data);  
    }
  }

 const handleDownload = async (id) => {
  try {
    const response = await axios.post(
      `${url}/api/v1/summery/download-summery-file`,
      { summaryId: id },
      { responseType: "blob", withCredentials: true }
    );

    // Create a blob URL and trigger download
    const blob = new Blob([response.data], { type: "application/pdf" });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;

    // Optional: dynamically name the file
    link.download = "summary.pdf";
    document.body.appendChild(link);
    link.click();
    link.remove();

    // Clean up the blob URL
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error("Error downloading the file", error);
  }
};


    // const file = new Blob([responce.data], { type: "application/pdf" });
    // const fileUrl = URL.createObjectURL(file);
    // const link = document.createElement("a");
    // link.href = fileUrl;
    // link.download = "summary.pdf";
    // link.click();
    // URL.revokeObjectURL(fileUrl);

 


  const handleUpload = async () => {
  const payload = {
    summaryName: formData.summaryName,
    subject: formData.selectedSubject,
    noteId: formData.selectedNote,
    summeryLength: formData.summeryLength,
  };

  try {
    const res = await axios.post(
      `${url}/api/v1/summery/summerize`,
      payload,
      { withCredentials: true }
    );
console.log(res.data);

    setShowUploadModal(false);
    if (selectedSubject) setSelectedSubject(null); // refresh view
  } catch (error) {
    console.error("Upload failed:", error);
  }
};

  const renderFolders = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 ">
      {summerySubject.map((subj, i) => (
        <Card key={i} onClick={() => setSelectedSubject(subj)} className="cursor-pointer hover:shadow-md">
          <CardContent className="flex justify-between p-6 items-center">
            <div className="flex items-center space-x-4">
              <FaFolder className="text-4xl text-indigo-600" />
              <span className="font-semibold text-lg">{subj}</span>
            </div>
            <FaTrash className="text-indigo-600 cursor-pointer"
              onClick={e => { e.stopPropagation(); handleFolderDelete(subj); }} />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderSummaries = () => (
    <div>
      <Button variant="ghost " onClick={() => {setSelectedSubject(null); setSummaries([])}} className="mb-4 flex items-center text-indigo-600 cursor-pointer">
        <FaArrowLeft className="mr-2 " /> Back to Folders
      </Button>

      <h2 className="text-2xl font-bold text-gray-700 mb-6 ">{selectedSubject} Summaries</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {summaries.map((file, index) => (
          <Card key={index} className="p-4 cursor-pointer">
            <CardContent>
              <p className="font-semibold mb-2">{file.fileName}</p>
              <p className="text-sm text-gray-500 mb-1">Note: {file.note.fileName}</p>
              <p className="text-sm text-gray-500 mb-3">Word: {file.wordCount}</p>


              <div className="flex justify-between items-center">
                <a href="#" onClick={() => handleDownload(file._id)}  className="text-indigo-600 hover:underline flex items-center">
                  <FaDownload className="mr-2" /> Download
                </a>
              <div className="text-sm capitalize " 
              style={{color: file.level === "short" ? "green" : file.level === "medium" ? "orange" : "red"}}
              > {file.level}</div>

                <FaTrash onClick={() => handleSummaryDelete(file._id)} className="text-indigo-600 cursor-pointer" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-700">Your Summaries</h1>
          <Button onClick={() => setShowUploadModal(true)} className="flex items-center">
            <FaPlus className="mr-2" /> New Summary
          </Button>
        </div>

        {selectedSubject ? renderSummaries() : renderFolders()}

        {showUploadModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div  className="fixed inset-0 flex items-center justify-center bg-black opacity-50 z-[40]"></div>
            <div className="bg-white rounded-lg p-6 w-[90%] md:w-[400px] space-y-4 shadow-lg z-[50]">
              <h2 className="text-xl font-semibold mb-4">Upload New Summary</h2>
              <input type="text" placeholder="Summary Name" value={formData.summaryName} onChange={e => setFormData({ ...formData, summaryName: e.target.value })} className="w-full border rounded p-2" />
              <select className="w-full border p-2 rounded cursor-pointer" onChange={e => setFormData({ ...formData, selectedSubject: e.target.value })}>
                <option value="">Select Subject</option>
                {subjects.map((s, i) => <option key={i} value={s}>{s}</option>)}
              </select>
              <select 
              disabled={!(formData.selectedSubject !== "")}
              style={{ opacity: formData.selectedSubject !== "" ? 1 : 0.5 , cursor: formData.selectedSubject !== "" ? "pointer" : "not-allowed"}}
              className="w-full border p-2 rounded" onChange={e => setFormData({ ...formData, selectedNote: e.target.value })}>
                <option value="">Select Note</option>
                {notes.map((s, i) => <option key={i} value={s._id}>{s.fileName}</option>)}
              </select> 
              <select 
              disabled={!(formData.selectedNote !== "")}
              style={{ opacity: formData.selectedNote !== "" ? 1 : 0.5 , cursor: formData.selectedNote !== "" ? "pointer" : "not-allowed"}}
              className="w-full border p-2 rounded"
               onChange={e => setFormData({ ...formData, summeryLength: e.target.value }) }> 
                <option value="">Select Length</option>
                <option value="short">Short(14-15% of note)</option>
                <option value="medium">Medium(22-25% of note)</option>
                <option value="long">Long(30-32% of note)</option>

              </select> 
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowUploadModal(false)}>Cancel</Button>
                <Button onClick={handleUpload}>Summarize</Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SummaryPage;
