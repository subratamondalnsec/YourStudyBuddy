import React, { useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { FaPaperPlane, FaRobot, FaUserCircle } from 'react-icons/fa';

const API_BASE = 'http://localhost:3000';

const Chatbot = () => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: 'Ask any study question and I will help with a clear explanation.',
    },
  ]);
  const bottomRef = useRef(null);

  const hasMessages = useMemo(() => messages.length > 0, [messages]);

  const scrollToBottom = () => {
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    setMessages((prev) => [...prev, { role: 'user', text: trimmed }]);
    setInput('');
    setLoading(true);
    scrollToBottom();

    try {
      const response = await axios.post(`${API_BASE}/chat`, { message: trimmed });
      const reply = response?.data?.reply || 'I could not generate a response right now.';
      setMessages((prev) => [...prev, { role: 'bot', text: reply }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          text: error?.response?.data?.message || 'Something went wrong. Please try again.',
        },
      ]);
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0d0d0d]">
      <main className="flex-1 lg:ml-64 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20"></div>
        <div className="relative z-10 p-6 lg:p-8">
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-gray-800">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 text-transparent bg-clip-text mb-2">
                Study Chatbot
              </h1>
              <p className="text-gray-400">Instant doubt-solving for study topics only.</p>
            </div>

            <div className="bg-[#1a1a1a] rounded-2xl border border-gray-800 h-[68vh] flex flex-col">
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {hasMessages &&
                  messages.map((message, index) => {
                    const isUser = message.role === 'user';
                    return (
                      <div
                        key={`${message.role}-${index}`}
                        className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isUser && (
                          <div className="w-9 h-9 rounded-full border border-purple-500/40 bg-purple-500/20 text-purple-300 flex items-center justify-center">
                            <FaRobot />
                          </div>
                        )}

                        <div
                          className={`max-w-[82%] rounded-xl px-4 py-3 text-sm leading-6 border ${
                            isUser
                              ? 'bg-pink-500/20 border-pink-500/40 text-pink-100'
                              : 'bg-[#2a2a2a] border-gray-700 text-gray-200'
                          }`}
                        >
                          {message.text}
                        </div>

                        {isUser && (
                          <div className="w-9 h-9 rounded-full border border-pink-500/40 bg-pink-500/20 text-pink-300 flex items-center justify-center">
                            <FaUserCircle />
                          </div>
                        )}
                      </div>
                    );
                  })}

                {loading && (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full border border-purple-500/40 bg-purple-500/20 text-purple-300 flex items-center justify-center">
                      <FaRobot />
                    </div>
                    <div className="rounded-xl px-4 py-3 text-sm border border-gray-700 bg-[#2a2a2a] text-gray-300">
                      Thinking...
                    </div>
                  </div>
                )}

                <div ref={bottomRef} />
              </div>

              <div className="border-t border-gray-800 p-4">
                <div className="flex items-end gap-3">
                  <textarea
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={2}
                    placeholder="Type your study question..."
                    className="flex-1 resize-none bg-[#0d0d0d] border border-gray-700 rounded-xl px-4 py-3 text-gray-100 outline-none focus:border-pink-500"
                  />

                  <button
                    onClick={sendMessage}
                    disabled={loading || !input.trim()}
                    className="h-12 px-5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white disabled:bg-gray-700 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <FaPaperPlane />
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Chatbot;
