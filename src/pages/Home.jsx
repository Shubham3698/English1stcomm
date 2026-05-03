import React from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col items-center px-6 pt-16 font-sans text-black overflow-x-hidden">
      
      {/* 🚀 Hero Section */}
      <div className="w-full max-w-md text-center flex flex-col items-center">
        <div className="inline-block bg-red-50 text-red-500 text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest mb-8 border border-red-100 animate-pulse">
          Awareness is Power ⚡
        </div>
        
        {/* 🛠️ FIX: Responsive font size and break-words to prevent right-side cutting */}
        <h1 className="w-full text-5xl sm:text-6xl font-black tracking-tighter italic leading-[0.95] uppercase mb-8 break-words px-2">
          Words are <br /> 
          <span className="text-red-500 block">Everywhere.</span>
        </h1>

        <p className="text-gray-500 text-sm font-medium leading-relaxed px-4 mb-12 max-w-[90%]">
          We are surrounded by English words every single day—on billboards, 
          packaging, and digital screens. Stop ignoring them. **React** to them, 
          **Collect** them, and make them yours.
        </p>

        {/* 📱 Explore Button */}
        <button 
          onClick={() => navigate("/community")}
          className="w-full bg-black text-white py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-gray-200 active:scale-95 transition-all mb-4"
        >
          Explore Community Posts
        </button>

        <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.3em]">
          Join the Serial Learners Club
        </p>
      </div>

      {/* 📊 Feature Cards - Quick Awareness */}
      <div className="w-full max-w-md grid grid-cols-2 gap-4 mt-16">
        <div className="bg-gray-50 p-6 rounded-[2.5rem] border border-gray-100 flex flex-col items-center text-center">
          <span className="text-3xl mb-3 block">👁️</span>
          <h3 className="font-black text-[10px] uppercase tracking-widest text-gray-800">Spot it</h3>
          <p className="text-[9px] text-gray-400 mt-2 font-bold italic leading-tight">
            Capture words from your daily life.
          </p>
        </div>
        
        <div className="bg-gray-50 p-6 rounded-[2.5rem] border border-gray-100 flex flex-col items-center text-center">
          <span className="text-3xl mb-3 block">📥</span>
          <h3 className="font-black text-[10px] uppercase tracking-widest text-gray-800">Collect it</h3>
          <p className="text-[9px] text-gray-400 mt-2 font-bold italic leading-tight">
            Save them to your personal vault.
          </p>
        </div>
      </div>

      {/* Footer hint */}
      <div className="mt-20 mb-10 flex flex-col items-center gap-2">
        <div className="w-8 h-[1px] bg-gray-200"></div>
        <p className="text-gray-300 text-[8px] font-black uppercase tracking-[0.4em]">
          Designed for the Curious Mind
        </p>
      </div>
    </div>
  );
}