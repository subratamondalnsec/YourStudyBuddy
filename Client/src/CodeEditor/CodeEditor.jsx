import React, { useMemo, useState } from 'react';
import axios from 'axios';
import Editor from '@monaco-editor/react';
import { FaCode, FaPlay, FaStickyNote, FaCopy } from 'react-icons/fa';

const API_BASE = 'http://localhost:3000';

const defaultTemplates = {
  javascript: `function solve(input) {
  return input;
}

const fs = require('fs');
const input = fs.readFileSync(0, 'utf8').trim();
console.log(solve(input));
`,
  python: `def solve(text):
    return text

if __name__ == '__main__':
    import sys
    data = sys.stdin.read().strip()
    print(solve(data))
`,
  java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String input = sc.hasNextLine() ? sc.nextLine() : "";
        System.out.println(input);
    }
}
`,
  cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    string input;
    getline(cin, input);
    cout << input << "\\n";
    return 0;
}
`,
  c: `#include <stdio.h>

int main() {
    char input[1005];
    if (fgets(input, sizeof(input), stdin)) {
        printf("%s", input);
    }
    return 0;
}
`
};

const languageOptions = {
  javascript: { id: 63, label: 'JavaScript (Node.js)', monaco: 'javascript' },
  python: { id: 71, label: 'Python 3', monaco: 'python' },
  java: { id: 62, label: 'Java (JDK 17)', monaco: 'java' },
  cpp: { id: 54, label: 'C++ (GCC)', monaco: 'cpp' },
  c: { id: 50, label: 'C (Clang)', monaco: 'c' }
};

const tabs = [
  { id: 'code', label: 'Code', icon: FaCode },
  { id: 'output', label: 'Output', icon: FaPlay },
  { id: 'notes', label: 'Notes', icon: FaStickyNote }
];

const CodeEditor = () => {
  const [activeTab, setActiveTab] = useState('code');
  const [language, setLanguage] = useState('javascript');
  const [codeByLanguage, setCodeByLanguage] = useState(defaultTemplates);
  const [stdin, setStdin] = useState('');
  const [notes, setNotes] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [copyLabel, setCopyLabel] = useState('Copy Output');

  const currentCode = useMemo(
    () => codeByLanguage[language] || '',
    [codeByLanguage, language]
  );

  const outputText = useMemo(() => {
    if (!result) return 'Run code from the Code tab to see output here.';
    return result?.stdout || result?.compile_output || result?.stderr || 'No output returned.';
  }, [result]);

  const updateCode = (value = '') => {
    setCodeByLanguage((prev) => ({ ...prev, [language]: value }));
  };

  const handleReset = () => {
    setCodeByLanguage((prev) => ({
      ...prev,
      [language]: defaultTemplates[language] || ''
    }));
    setError('');
  };

  const handleCopyOutput = async () => {
    try {
      await navigator.clipboard.writeText(outputText);
      setCopyLabel('Copied');
      setTimeout(() => setCopyLabel('Copy Output'), 1200);
    } catch {
      setCopyLabel('Copy Failed');
      setTimeout(() => setCopyLabel('Copy Output'), 1200);
    }
  };

  const handleRun = async () => {
    if (!currentCode.trim()) {
      setError('Please write some code before running.');
      return;
    }

    setIsRunning(true);
    setError('');

    try {
      const response = await axios.post(
        `${API_BASE}/api/v1/compiler/execute`,
        {
          languageId: languageOptions[language].id,
          sourceCode: currentCode,
          input: stdin
        },
        { withCredentials: true }
      );

      setResult(response?.data || null);
      setActiveTab('output');
    } catch (requestError) {
      setError(
        requestError?.response?.data?.details ||
          requestError?.response?.data?.message ||
          requestError?.response?.data?.error ||
          'Compilation failed. Ensure backend is running and you are logged in.'
      );
      setResult(null);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0d0d0d]">
      <main className="flex-1 lg:ml-64 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20" />

        <div className="relative z-10 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-gray-800">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 text-transparent bg-clip-text mb-2">
                Code Editor +
              </h1>
              <p className="text-gray-400">Monaco-powered editor with stable fixed layout and cleaner output workflow.</p>
            </div>

            <div className="bg-[#1a1a1a] rounded-2xl border border-gray-800 p-3 flex flex-wrap gap-3">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white'
                        : 'bg-[#0d0d0d] text-gray-300 border border-gray-700'
                    }`}
                  >
                    <Icon />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="bg-[#1a1a1a] rounded-2xl border border-gray-800 p-5">
              {activeTab === 'code' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-3 items-center justify-between">
                    <div className="flex items-center gap-3">
                      <label className="text-sm text-gray-300">Language</label>
                      <select
                        value={language}
                        onChange={(event) => setLanguage(event.target.value)}
                        className="bg-[#0d0d0d] border border-gray-700 rounded-xl px-3 py-2 text-gray-100"
                      >
                        {Object.entries(languageOptions).map(([key, option]) => (
                          <option key={key} value={key}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleReset}
                        className="px-4 py-2 rounded-xl border border-gray-700 text-gray-300 hover:bg-[#0d0d0d]"
                      >
                        Reset Template
                      </button>
                      <button
                        onClick={handleRun}
                        disabled={isRunning}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white disabled:bg-gray-700"
                      >
                        {isRunning ? 'Running...' : 'Run Code'}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
                    <div className="xl:col-span-3 bg-[#0d0d0d] border border-gray-700 rounded-xl overflow-hidden">
                      <Editor
                        height="520px"
                        language={languageOptions[language].monaco}
                        theme="vs-dark"
                        value={currentCode}
                        onChange={updateCode}
                        options={{
                          minimap: { enabled: true },
                          fontSize: 14,
                          wordWrap: 'on',
                          scrollBeyondLastLine: false,
                          automaticLayout: true,
                          smoothScrolling: true,
                          padding: { top: 12 },
                          tabSize: 2
                        }}
                      />
                    </div>

                    <div className="xl:col-span-1">
                      <div className="h-full bg-[#0d0d0d] border border-gray-700 rounded-xl p-3 flex flex-col">
                        <label className="text-sm text-gray-300 mb-2">Program Input</label>
                        <textarea
                          value={stdin}
                          onChange={(event) => setStdin(event.target.value)}
                          className="flex-1 min-h-[220px] bg-transparent border border-gray-700 rounded-lg p-3 text-gray-100 text-sm outline-none"
                          placeholder="Input for stdin..."
                        />
                        <p className="mt-2 text-xs text-gray-500">Tip: use newline for multiple inputs.</p>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="rounded-xl px-4 py-3 text-sm border border-red-500/30 bg-red-500/10 text-red-200">
                      {error}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'output' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <h2 className="text-xl font-semibold text-gray-100">Compilation Output</h2>
                    <button
                      onClick={handleCopyOutput}
                      className="px-3 py-2 rounded-xl border border-gray-700 text-gray-300 hover:bg-[#0d0d0d] flex items-center gap-2 text-sm"
                    >
                      <FaCopy />
                      {copyLabel}
                    </button>
                  </div>

                  {result && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                      <div className="bg-[#0d0d0d] border border-gray-700 rounded-xl p-3 text-gray-300">
                        <span className="text-gray-400">Status:</span> {result?.status?.description || 'N/A'}
                      </div>
                      <div className="bg-[#0d0d0d] border border-gray-700 rounded-xl p-3 text-gray-300">
                        <span className="text-gray-400">Time:</span> {result?.time ?? 'N/A'}
                      </div>
                      <div className="bg-[#0d0d0d] border border-gray-700 rounded-xl p-3 text-gray-300">
                        <span className="text-gray-400">Memory:</span> {result?.memory ?? 'N/A'}
                      </div>
                    </div>
                  )}

                  <div className="bg-[#0d0d0d] border border-gray-700 rounded-xl p-4 text-gray-200 whitespace-pre-wrap min-h-[360px]">
                    {outputText}
                  </div>
                </div>
              )}

              {activeTab === 'notes' && (
                <div className="space-y-3">
                  <h2 className="text-xl font-semibold text-gray-100">Notes</h2>
                  <div className="bg-[#0d0d0d] border border-gray-700 rounded-xl overflow-hidden">
                    <Editor
                      height="520px"
                      language="markdown"
                      theme="vs-dark"
                      value={notes}
                      onChange={(value) => setNotes(value || '')}
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        wordWrap: 'on',
                        automaticLayout: true,
                        padding: { top: 12 }
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CodeEditor;
