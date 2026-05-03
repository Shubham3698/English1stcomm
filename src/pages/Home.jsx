import React from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col items-center px-6 pt-16 font-sans text-black">
      
      {/* 🚀 Hero Section */}
      <div className="w-full max-w-md text-center">
        <div className="inline-block bg-red-50 text-red-500 text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest mb-6 border border-red-100">
          Awareness is Power ⚡
        </div>
        
        <h1 className="text-6xl font-black tracking-tighter italic leading-[0.9] uppercase mb-6">
          Words are <br /> 
          <span className="text-red-500">Everywhere.</span>
        </h1>

        <p className="text-gray-500 text-sm font-medium leading-relaxed px-4 mb-10">
          Hamare charo taraf English shabdo ka jaal hai. Unhe ignore mat karo. 
          Unpar **Pratikriya** do, unhe **Collect** karo, aur apni vocabulary ka 
          hissa banao.
        </p>

        {/* 📱 Explore Button */}
        <button 
          onClick={() => navigate("/community")}
          className="w-full bg-black text-white py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-gray-300 active:scale-95 transition-all mb-4"
        >
          Explore Community Posts
        </button>

        <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.3em]">
          Join the Serial Learners Club
        </p>
      </div>

      {/* 📊 Feature Cards - Quick Awareness */}
      <div className="w-full max-w-md grid grid-cols-2 gap-4 mt-16">
        <div className="bg-gray-50 p-6 rounded-[2.5rem] border border-gray-100">
          <span className="text-2xl mb-2 block">👁️</span>
          <h3 className="font-black text-[10px] uppercase tracking-widest text-gray-800">Spot it</h3>
          <p className="text-[9px] text-gray-400 mt-1 font-bold italic">Words in your daily life.</p>
        </div>
        <div className="bg-gray-50 p-6 rounded-[2.5rem] border border-gray-100">
          <span className="text-2xl mb-2 block">📥</span>
          <h3 className="font-black text-[10px] uppercase tracking-widest text-gray-800">Collect it</h3>
          <p className="text-[9px] text-gray-400 mt-1 font-bold italic">Save to your personal vault.</p>
        </div>
      </div>

      {/* Footer hint */}
      <p className="mt-auto mb-10 text-gray-300 text-[8px] font-black uppercase tracking-[0.4em]">
        Designed for the Curious Mind
      </p>
    </div>
  );
}