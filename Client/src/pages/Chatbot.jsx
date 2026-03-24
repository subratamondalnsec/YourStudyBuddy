import React, { useMemo, useState } from 'react';
import axios from 'axios';
import { FaPaperPlane, FaUpload } from 'react-icons/fa';

const SEMANTIC_API_BASE = 'http://localhost:8080';
const STUDY_API_BASE = 'http://localhost:3000';

const Chatbot = () => {
  const [activeTab, setActiveTab] = useState('study');

  const [studyQuestion, setStudyQuestion] = useState('');
  const [studyLoading, setStudyLoading] = useState(false);
  const [studyResponse, setStudyResponse] = useState('');
  const [studyError, setStudyError] = useState('');

  const [selectedFile, setSelectedFile] = useState(null);
  const [fileType, setFileType] = useState('pdf');
  const [semanticQuestion, setSemanticQuestion] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [askLoading, setAskLoading] = useState(false);
  const [uploadResponse, setUploadResponse] = useState(null);
  const [askResponse, setAskResponse] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [askError, setAskError] = useState('');

  const hasSemanticResponse = useMemo(
    () => Boolean(uploadResponse || askResponse || uploadError || askError),
    [uploadResponse, askResponse, uploadError, askError]
  );

  const handleStudyAsk = async () => {
    const trimmedQuestion = studyQuestion.trim();
    if (!trimmedQuestion || studyLoading) {
      if (!trimmedQuestion) {
        setStudyError('Please enter a study question.');
      }
      return;
    }

    setStudyLoading(true);
    setStudyError('');

    try {
      const response = await axios.post(`${STUDY_API_BASE}/chat`, {
        message: trimmedQuestion,
      });

      setStudyResponse(
        response?.data?.reply || response?.data?.message || 'No response available.'
      );
    } catch (error) {
      setStudyError(
        error?.response?.data?.message ||
          'Study chatbot request failed. Check if backend server is running on localhost:3000.'
      );
      setStudyResponse('');
    } finally {
      setStudyLoading(false);
    }
  };

  const handleStudyKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleStudyAsk();
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    setUploadError('');
  };

  const handleUpload = async () => {
    if (!selectedFile || uploadLoading) {
      if (!selectedFile) {
        setUploadError('Please select a file before uploading.');
      }
      return;
    }

    setUploadLoading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('fileType', fileType);

      const response = await axios.post(`${SEMANTIC_API_BASE}/upload`, formData);
      setUploadResponse(response?.data || null);
    } catch (error) {
      setUploadError(error?.response?.data?.message || 'File upload failed.');
      setUploadResponse(null);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleSemanticAsk = async () => {
    const trimmedQuestion = semanticQuestion.trim();
    if (!trimmedQuestion || askLoading) {
      if (!trimmedQuestion) {
        setAskError('Please enter a question.');
      }
      return;
    }

    setAskLoading(true);
    setAskError('');

    try {
      const response = await axios.post(`${SEMANTIC_API_BASE}/ask`, {
        question: trimmedQuestion,
      });
      setAskResponse(response?.data || null);
    } catch (error) {
      setAskError(error?.response?.data?.message || 'Question request failed.');
      setAskResponse(null);
    } finally {
      setAskLoading(false);
    }
  };

  const handleSemanticKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSemanticAsk();
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0d0d0d]">
      <main className="flex-1 lg:ml-64 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20"></div>
        <div className="relative z-10 p-6 lg:p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-gray-800">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 text-transparent bg-clip-text mb-2">
                Chatbot Hub
              </h1>
              <p className="text-gray-400">
                Use Study Chatbot for direct Q&A, or Semantic Chatbot for document upload and retrieval.
              </p>
            </div>

            <div className="bg-[#1a1a1a] rounded-2xl border border-gray-800 p-3 flex flex-wrap gap-3">
              <button
                onClick={() => setActiveTab('study')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  activeTab === 'study'
                    ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white'
                    : 'bg-[#0d0d0d] text-gray-300 border border-gray-700'
                }`}
              >
                Study Chatbot (Ask Only)
              </button>
              <button
                onClick={() => setActiveTab('semantic')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  activeTab === 'semantic'
                    ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white'
                    : 'bg-[#0d0d0d] text-gray-300 border border-gray-700'
                }`}
              >
                Semantic Chatbot (Upload + Ask)
              </button>
            </div>

            {activeTab === 'study' ? (
              <>
                <div className="bg-[#1a1a1a] rounded-2xl border border-gray-800 p-5 space-y-4">
                  <h2 className="text-xl font-semibold text-pink-300">Study Chatbot</h2>
                  <p className="text-sm text-gray-400">Ask only study-related questions.</p>

                  <textarea
                    value={studyQuestion}
                    onChange={(event) => setStudyQuestion(event.target.value)}
                    onKeyDown={handleStudyKeyDown}
                    rows={4}
                    placeholder="Type your study question..."
                    className="w-full resize-none bg-[#0d0d0d] border border-gray-700 rounded-xl px-4 py-3 text-gray-100 outline-none focus:border-pink-500"
                  />

                  <button
                    onClick={handleStudyAsk}
                    disabled={studyLoading}
                    className="h-11 px-5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white disabled:bg-gray-700 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <FaPaperPlane />
                    {studyLoading ? 'Asking...' : 'Ask'}
                  </button>

                  {studyError && (
                    <div className="rounded-xl px-4 py-3 text-sm border border-red-500/30 bg-red-500/10 text-red-200">
                      {studyError}
                    </div>
                  )}
                </div>

                {studyResponse && (
                  <div className="bg-[#1a1a1a] rounded-2xl border border-gray-800 p-5 space-y-3">
                    <h2 className="text-xl font-semibold text-gray-100">Study Response</h2>
                    <div className="rounded-xl px-4 py-3 border border-gray-700 bg-[#111111] text-gray-200 whitespace-pre-wrap leading-7">
                      {studyResponse}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <div className="bg-[#1a1a1a] rounded-2xl border border-gray-800 p-5 space-y-4">
                    <h2 className="text-xl font-semibold text-pink-300">1) Upload File</h2>

                    <div className="space-y-2">
                      <label className="text-sm text-gray-300">File Type</label>
                      <select
                        value={fileType}
                        onChange={(event) => setFileType(event.target.value)}
                        className="w-full bg-[#0d0d0d] border border-gray-700 rounded-xl px-4 py-3 text-gray-100 outline-none focus:border-pink-500"
                      >
                        <option value="pdf">PDF</option>
                        <option value="txt">TXT</option>
                        <option value="docx">DOCX</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-gray-300">Choose File</label>
                      <input
                        type="file"
                        accept=".pdf,.txt,.doc,.docx"
                        onChange={handleFileChange}
                        className="w-full bg-[#0d0d0d] border border-gray-700 rounded-xl px-4 py-3 text-gray-100 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-pink-600/20 file:text-pink-200"
                      />
                      {selectedFile && (
                        <p className="text-xs text-gray-400">Selected: {selectedFile.name}</p>
                      )}
                    </div>

                    <button
                      onClick={handleUpload}
                      disabled={uploadLoading}
                      className="h-11 px-5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white disabled:bg-gray-700 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <FaUpload />
                      {uploadLoading ? 'Uploading...' : 'Upload'}
                    </button>

                    {uploadError && (
                      <div className="rounded-xl px-4 py-3 text-sm border border-red-500/30 bg-red-500/10 text-red-200">
                        {uploadError}
                      </div>
                    )}

                    {uploadResponse && (
                      <div className="rounded-xl px-4 py-3 text-sm border border-green-500/30 bg-green-500/10 text-green-200">
                        {uploadResponse?.message || 'Upload successful'}
                      </div>
                    )}
                  </div>

                  <div className="bg-[#1a1a1a] rounded-2xl border border-gray-800 p-5 space-y-4">
                    <h2 className="text-xl font-semibold text-purple-300">2) Ask Question</h2>

                    <div className="rounded-lg border border-purple-500/30 bg-purple-500/10 px-3 py-2 text-sm text-purple-200 w-fit">
                      Mode: Semantic Search
                    </div>

                    <textarea
                      value={semanticQuestion}
                      onChange={(event) => setSemanticQuestion(event.target.value)}
                      onKeyDown={handleSemanticKeyDown}
                      rows={4}
                      placeholder="Example: What is my skill?"
                      className="w-full resize-none bg-[#0d0d0d] border border-gray-700 rounded-xl px-4 py-3 text-gray-100 outline-none focus:border-pink-500"
                    />

                    <button
                      onClick={handleSemanticAsk}
                      disabled={askLoading}
                      className="h-11 px-5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white disabled:bg-gray-700 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <FaPaperPlane />
                      {askLoading ? 'Asking...' : 'Ask'}
                    </button>

                    {askError && (
                      <div className="rounded-xl px-4 py-3 text-sm border border-red-500/30 bg-red-500/10 text-red-200">
                        {askError}
                      </div>
                    )}
                  </div>
                </div>

                {hasSemanticResponse ? (
                  <div className="bg-[#1a1a1a] rounded-2xl border border-gray-800 p-5 space-y-4">
                    <h2 className="text-xl font-semibold text-gray-100">Semantic Response</h2>

                    {askResponse?.answer && (
                      <div className="rounded-xl px-4 py-3 border border-gray-700 bg-[#111111] text-gray-200 whitespace-pre-wrap leading-7">
                        {askResponse.answer}
                      </div>
                    )}

                    {(uploadResponse || askResponse) && (
                      <pre className="text-xs sm:text-sm bg-[#0d0d0d] border border-gray-700 rounded-xl p-4 text-gray-300 overflow-x-auto">
                        {JSON.stringify({ uploadResponse, askResponse }, null, 2)}
                      </pre>
                    )}
                  </div>
                ) : (
                  <div className="bg-[#1a1a1a] rounded-2xl border border-gray-800 p-5 text-gray-400">
                    Upload a file and ask a question to see the response here.
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Chatbot;
