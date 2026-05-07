import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function WordMatchGame({ data, onComplete }) {
  const [leftItems, setLeftItems] = useState([]);
  const [rightItems, setRightItems] = useState([]);
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [selectedRight, setSelectedRight] = useState(null);
  const [matches, setMatches] = useState([]); // Solved pairs
  const [errors, setErrors] = useState([]); // Temporary red flash

  useEffect(() => {
    if (data && data.length > 0) {
      // Shuffle logic
      const shuffledLeft = [...data].sort(() => Math.random() - 0.5);
      const shuffledRight = [...data].sort(() => Math.random() - 0.5);
      setLeftItems(shuffledLeft);
      setRightItems(shuffledRight);
    }
  }, [data]);

  useEffect(() => {
    if (selectedLeft && selectedRight) {
      if (selectedLeft._id === selectedRight._id) {
        // ✅ Correct Match
        setMatches((prev) => [...prev, selectedLeft._id]);
        setSelectedLeft(null);
        setSelectedRight(null);
        
        if (matches.length + 1 === data.length) {
          setTimeout(() => {
            toast.success("All Paired Up! 🎯");
            onComplete();
          }, 500);
        }
      } else {
        // ❌ Wrong Match
        setErrors([selectedLeft._id, selectedRight._id]);
        setTimeout(() => {
          setErrors([]);
          setSelectedLeft(null);
          setSelectedRight(null);
        }, 600);
      }
    }
  }, [selectedLeft, selectedRight]);

  return (
    <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
      <h2 className="text-center text-xl font-black italic uppercase mb-8 text-gray-800">
        Match the Correct Pairs 🔗
      </h2>

      <div className="grid grid-cols-2 gap-4">
        {/* Left Side: Hindi/Words */}
        <div className="space-y-3">
          {leftItems.map((item) => (
            <button
              key={`left-${item._id}`}
              disabled={matches.includes(item._id)}
              onClick={() => setSelectedLeft(item)}
              className={`w-full p-5 rounded-2xl text-[12px] font-black uppercase transition-all border-2 
              ${matches.includes(item._id) ? "opacity-0 invisible" : ""}
              ${selectedLeft?._id === item._id ? "border-blue-500 bg-blue-50 text-blue-600 shadow-md" : "border-gray-100 bg-white text-gray-700"}
              ${errors.includes(item._id) ? "border-red-500 bg-red-50 text-red-600 animate-shake" : ""}`}
            >
              {item.word}
            </button>
          ))}
        </div>

        {/* Right Side: English/Meanings */}
        <div className="space-y-3">
          {rightItems.map((item) => (
            <button
              key={`right-${item._id}`}
              disabled={matches.includes(item._id)}
              onClick={() => setSelectedRight(item)}
              className={`w-full p-5 rounded-2xl text-[12px] font-black uppercase transition-all border-2 
              ${matches.includes(item._id) ? "opacity-0 invisible" : ""}
              ${selectedRight?._id === item._id ? "border-blue-500 bg-blue-50 text-blue-600 shadow-md" : "border-gray-100 bg-white text-gray-700"}
              ${errors.includes(item._id) ? "border-red-500 bg-red-50 text-red-600 animate-shake" : ""}`}
            >
              {item.meaning}
            </button>
          ))}
        </div>
      </div>
      
      <p className="text-center mt-10 text-[9px] font-black text-gray-300 uppercase tracking-widest">
        Dameeto Interaction Engine
      </p>
    </div>
  );
}