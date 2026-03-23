import React from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  BarChart, PieChart, Pie, Cell, XAxis, YAxis,
  Tooltip, LineChart, Line, CartesianGrid, Legend, Bar
} from 'recharts';

const pieData = [
  { name: 'Correct', value: 7 },
  { name: 'Incorrect', value: 2 },
  { name: 'Skipped', value: 1 },
];

const topicData = [
  { topic: 'JavaScript', correct: 3, total: 4 },
  { topic: 'React', correct: 2, total: 3 },
  { topic: 'Node.js', correct: 1, total: 3 },
];

const progressData = [
  { attempt: '1st', score: 60 },
  { attempt: '2nd', score: 75 },
  { attempt: '3rd', score: 85 },
];

const leaderboard = [
  { name: 'You', score: 85, rank: 3 },
  { name: 'Dona Das', score: 98, rank: 1 },
  { name: 'Shovan Mondal', score: 90, rank: 2 },
];

const COLORS = ['#4ade80', '#f87171', '#60a5fa'];

export default function AnalyticsPage() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-6 space-y-6">
        <h1 className="text-3xl font-bold text-indigo-700">📊 Quiz Analytics</h1>

        {/* Score Summary */}
        <Card>
          <CardContent className="flex flex-col md:flex-row justify-between items-center p-6">
            <div>
              <h2 className="text-xl font-semibold">
                Score: <span className="text-green-600">8/10</span>
              </h2>
              <p className="text-gray-600">Time Taken: 4m 20s</p>
              <p className="text-gray-600">Accuracy: 80%</p>
            </div>
            <div className="h-48 w-48">
              <PieChart width={200} height={200}>
                <Pie data={pieData} dataKey="value" outerRadius={80} label>
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </div>
          </CardContent>
        </Card>

        {/* Topic Breakdown */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">📚 Topic Performance</h2>
            <BarChart width={600} height={300} data={topicData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="topic" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="correct" fill="#4ade80" name="Correct" />
              <Bar dataKey="total" fill="#e5e7eb" name="Total" />
            </BarChart>
          </CardContent>
        </Card>

        {/* Progress Over Time */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">📈 Progress Over Time</h2>
            <LineChart width={600} height={300} data={progressData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="attempt" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={3} />
            </LineChart>
          </CardContent>
        </Card>

        {/* Leaderboard */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">🏆 Leaderboard</h2>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-indigo-700 border-b">
                  <th className="p-2">Rank</th>
                  <th className="p-2">Name</th>
                  <th className="p-2">Score</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard
                  .sort((a, b) => a.rank - b.rank)
                  .map((user) => (
                    <tr
                      key={user.rank}
                      className={`${user.name === 'You' ? 'bg-indigo-100 font-semibold' : ''} border-b`}
                    >
                      <td className="p-2">{user.rank}</td>
                      <td className="p-2">{user.name}</td>
                      <td className="p-2">{user.score}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
