import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FaCloudUploadAlt } from "react-icons/fa";
import Sidebar from "@/components/dashboard/Sidebar";

const UploadPage = () => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");
  const [subject, setSubject] = useState("");
 const url = "http://localhost:3000"

  const allowedTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain"
  ];
  const maxSizeMB = 10;

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    validateAndSetFile(selected);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    validateAndSetFile(dropped);
  };

  const validateAndSetFile = (selected) => {
    if (!selected) return;

    if (!allowedTypes.includes(selected.type)) {
      setError("❌ Unsupported file type. Only PDF, DOCX, and TXT allowed.");
      setFile(null);
      return;
    }

    if (selected.size > maxSizeMB * 1024 * 1024) {
      setError(`❌ File size exceeds ${maxSizeMB}MB.`);
      setFile(null);
      return;
    }

    setFile(selected);
    setError("");
  };

  const handleSubmit = async () => {
    if (!file || !fileName.trim() || !subject.trim()) {
      setError("⚠️ Please fill in all required fields.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileName", fileName);
    formData.append("subject", subject);

    console.log("Uploading file with metadata:", formData);

  //   try {
  //     const response = await fetch(`${url}/api/v1/notes/upload-notes`, {
  //       method: "POST",
  //       body: formData,
  //       credentials: "include",
  //     });

  //     const data = await response.json();
  //     console.log(data);
  //     setFile(null);
  //     setFileName("");
  //     setSubject("");
  //   } catch (error) {
  //     console.error(error);
  //     setFile(null);
  //     setFileName("");
  //     setSubject("");
  //   }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-lg p-8">
          <h1 className="text-3xl font-bold mb-6 text-indigo-700">Upload Your Notes</h1>

          <div
            className="border-4 border-dashed border-indigo-300 p-6 text-center rounded-lg hover:bg-indigo-50 transition"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <FaCloudUploadAlt className="text-4xl mx-auto text-indigo-500 mb-2" />
            <p className="font-medium text-gray-700">Drag & drop your file here</p>
            <p className="text-sm text-gray-500 mt-1">or select manually</p>
            <Input
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleFileChange}
              className="mt-3"
            />
          </div>

          {error && (
            <p className="mt-4 text-red-500 text-sm">{error}</p>
          )}

          {file && (
            <div className="mt-6 bg-indigo-50 p-6 rounded shadow-sm space-y-4">
              <div className="text-sm text-indigo-800">
                <p><strong>Selected File:</strong> {file.name}</p>
                <p><strong>Size:</strong> {(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                <p><strong>Last Modified:</strong> {new Date(file.lastModified).toLocaleDateString()}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Custom File Name</label>
                <Input
                  placeholder="e.g. Lecture 4 - Thermodynamics"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <Input
                  placeholder="e.g. Physics"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              <Button onClick={handleSubmit} className="w-full mt-4">
                Upload & Process
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default UploadPage;
