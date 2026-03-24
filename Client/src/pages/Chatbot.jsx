import React, { useMemo, useState } from 'react';
import axios from 'axios';
import { FaPaperPlane, FaUpload } from 'react-icons/fa';

const API_BASE = 'http://localhost:8080';

const Chatbot = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileType, setFileType] = useState('pdf');
  const [question, setQuestion] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [askLoading, setAskLoading] = useState(false);
  const [uploadResponse, setUploadResponse] = useState(null);
  const [askResponse, setAskResponse] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [askError, setAskError] = useState('');

  const hasResponse = useMemo(
    () => Boolean(uploadResponse || askResponse || uploadError || askError),
    [uploadResponse, askResponse, uploadError, askError]
  );

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

      const response = await axios.post(`${API_BASE}/upload`, formData);

      setUploadResponse(response?.data || null);
    } catch (error) {
      setUploadError(error?.response?.data?.message || 'File upload failed.');
      setUploadResponse(null);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleAsk = async () => {
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion || askLoading) {
      if (!trimmedQuestion) {
        setAskError('Please enter a question.');
      }
      return;
    }

    setAskLoading(true);
    setAskError('');

    try {
      const response = await axios.post(`${API_BASE}/ask`, {
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

  const handleQuestionKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleAsk();
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
                Semantic Search Assistant
              </h1>
              <p className="text-gray-400">Upload your document, then ask questions using semantic search.</p>
            </div>

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
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  onKeyDown={handleQuestionKeyDown}
                  rows={4}
                  placeholder="Example: What is my skill?"
                  className="w-full resize-none bg-[#0d0d0d] border border-gray-700 rounded-xl px-4 py-3 text-gray-100 outline-none focus:border-pink-500"
                />

                <button
                  onClick={handleAsk}
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

            {hasResponse && (
              <div className="bg-[#1a1a1a] rounded-2xl border border-gray-800 p-5 space-y-4">
                <h2 className="text-xl font-semibold text-gray-100">Response</h2>

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
            )}

            {!hasResponse && (
              <div className="bg-[#1a1a1a] rounded-2xl border border-gray-800 p-5 text-gray-400">
                Upload a file and ask a question to see the response here.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Chatbot;
