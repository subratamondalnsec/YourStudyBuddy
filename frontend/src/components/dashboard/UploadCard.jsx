import React from "react";

export default function UploadCard() {
  return (
    <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
      <h3 className="text-lg font-semibold text-indigo-600 mb-2">📄 Recent Uploads</h3>
      <ul className="text-sm text-gray-600 space-y-1">
        <li>Math Notes - Apr 30, 2025</li>
        <li>Physics Summary - Apr 28, 2025</li>
        <li>Chemistry MCQs - Apr 27, 2025</li>
      </ul>
    </div>
  );
}
