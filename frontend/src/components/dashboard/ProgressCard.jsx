import React from "react";

export default function ProgressCard({ title, value }) {
    return (
      <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition text-center">
        <h3 className="text-lg font-medium text-gray-600 mb-1">{title}</h3>
        <div className="text-3xl font-bold text-indigo-700">{value}</div>
      </div>
    );
  }
  