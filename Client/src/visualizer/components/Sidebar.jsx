import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import useAlgorithmStore from "../store/algorithmStore";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Add useLocation hook to fix location reference
  const {
    algorithmCategories,
    currentAlgorithm,
    setCurrentAlgorithm,
    setArraySize,
    generateNewArray,
  } = useAlgorithmStore();

  const handleAlgorithmSelect = (category, algorithm) => {
    const categoryPath = category.toLowerCase().replace(/\s+/g, "-");
    const algorithmPath = algorithm.toLowerCase().replace(/\s+/g, "-");
    const urlPath = `/visualizer/${categoryPath}/${algorithmPath}`;
    setCurrentAlgorithm(algorithm);
    setArraySize(50); // Reset array size
    generateNewArray(); // Generate fresh array
    navigate(urlPath);
  };

  return (
    <aside className="fixed top-0 left-64 w-64 h-screen p-4 overflow-y-auto border-r shadow-lg bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 pt-8 border-pink-500/20 shadow-pink-500/10 scrollbar scrollbar-track-gray-900/40 scrollbar-thumb-pink-500/50 scrollbar-w-2 hover:scrollbar-thumb-pink-400">
      {Object.entries(algorithmCategories).map(([category, algorithms]) => (
        <div key={category} className="mb-6">
          <h3 className="mb-2 text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">
            {category}
          </h3>
          <div className="space-y-2">
            {algorithms.map((algorithm, algoIndex) => (
              <button
                key={algorithm}
                onClick={() => handleAlgorithmSelect(category, algorithm)}
                className={`group relative w-full text-left px-3 py-2 rounded-lg transition-all overflow-hidden
                  ${
                    location.pathname.includes(
                      algorithm.toLowerCase().replace(/\s+/g, "-")
                    )
                      ? "bg-[linear-gradient(110deg,#041b36,45%,#0c7bb8,55%,#041b36)] text-white border-sky-500/40 shadow-lg shadow-sky-500/10"
                      : "bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] text-slate-400 border-slate-800"
                  } border font-medium focus:outline-none focus:ring-2 focus:ring-slate-400`}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                  initial={{ x: "-100%" }}
                  animate={{
                    x: "100%",
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
                <div className="relative z-10 flex items-start gap-3">
                  <span
                    className={`mt-0.5 min-w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold border ${
                      location.pathname.includes(
                        algorithm.toLowerCase().replace(/\s+/g, "-")
                      )
                        ? "bg-gradient-to-r from-pink-600 to-purple-600 border-pink-400 text-white"
                        : "bg-[#1a1a1a] border-pink-500/40 text-pink-300"
                    }`}
                  >
                    {algoIndex + 1}
                  </span>

                  <div className="flex flex-col items-start leading-tight">
                    <span className="text-sm font-semibold text-left">{algorithm}</span>
                    <span className="mt-1 text-[10px] tracking-wide uppercase text-gray-400">Algorithm</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </aside>
  );
};

export default Sidebar;
