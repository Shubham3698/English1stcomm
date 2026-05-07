import React from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0f0f15] flex flex-col items-center px-6 pt-16 font-sans text-white overflow-x-hidden">
      
      {/* 🚀 Hero Section */}
      <div className="w-full max-w-md text-center flex flex-col items-center">
        {/* Modern Badge */}
        <div className="inline-block bg-white/5 text-gray-400 text-[10px] font-black px-4 py-2 rounded-lg uppercase tracking-[0.2em] mb-8 border border-white/10 shadow-xl">
          Awareness is Power <span className="text-blue-400">⚡</span>
        </div>
        
        {/* 🛠️ Hero Heading - Modern Italic Style */}
        <h1 className="w-full text-5xl sm:text-6xl font-black tracking-tighter italic leading-[0.95] uppercase mb-8 break-words px-2">
          Words are <br /> 
          <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent block">Everywhere.</span>
        </h1>

        <p className="text-gray-500 text-sm font-medium leading-relaxed px-4 mb-12 max-w-[90%]">
          We are surrounded by English words every single day—on billboards, 
          packaging, and digital screens. Stop ignoring them. <span className="text-white">React</span> to them, 
          <span className="text-white"> Collect</span> them, and make them yours.
        </p>

        {/* 📱 Explore Button - Sleek Dark Look */}
        <button 
          onClick={() => navigate("/community")}
          className="group relative w-full bg-white text-black py-5 rounded-xl font-black uppercase tracking-[0.2em] text-xs shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95 transition-all mb-4 overflow-hidden"
        >
          <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent via-black/5 to-transparent group-hover:animate-shine transition-all duration-500" 
               style={{ animation: 'shine 2s infinite' }} 
          />
          <span className="relative z-10">Explore Community Posts</span>
        </button>

        <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.4em] mt-2">
          Join the Serial Learners Club
        </p>
      </div>

      {/* 📊 Feature Cards - Sharp & Modern Layout */}
      <div className="w-full max-w-md grid grid-cols-2 gap-4 mt-16">
        <div className="bg-white/[0.03] p-8 rounded-2xl border border-white/10 flex flex-col items-center text-center hover:bg-white/[0.05] transition-all group">
          <span className="text-3xl mb-4 block group-hover:scale-110 transition-transform">👁️</span>
          <h3 className="font-black text-[11px] uppercase tracking-widest text-white">Spot it</h3>
          <p className="text-[10px] text-gray-500 mt-2 font-bold italic leading-tight">
            Capture words from your daily life.
          </p>
        </div>
        
        <div className="bg-white/[0.03] p-8 rounded-2xl border border-white/10 flex flex-col items-center text-center hover:bg-white/[0.05] transition-all group">
          <span className="text-3xl mb-4 block group-hover:scale-110 transition-transform">📥</span>
          <h3 className="font-black text-[11px] uppercase tracking-widest text-white">Collect it</h3>
          <p className="text-[10px] text-gray-500 mt-2 font-bold italic leading-tight">
            Save them to your personal vault.
          </p>
        </div>
      </div>

      {/* Footer hint */}
      <div className="mt-20 mb-10 flex flex-col items-center gap-4">
        <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        <p className="text-gray-600 text-[8px] font-black uppercase tracking-[0.5em]">
          Designed for the Curious Mind
        </p>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
          @keyframes shine {
            0% { left: -100%; }
            20% { left: 100%; }
            100% { left: 100%; }
          }
      `}} />
    </div>
  );
}