import React from "react";
import { Link } from "react-router-dom";


export default function QuickActionCard({ title, link }) {
    return (
      <Link to={link} className="bg-indigo-50 hover:bg-indigo-100 p-6 rounded-xl text-center shadow">
        <h3 className="text-xl text-indigo-700 font-semibold">{title}</h3>
      </Link>
    );
  }