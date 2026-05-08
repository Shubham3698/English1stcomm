import React from "react";

/**
 * ArchiveItem - Cinematic Dark Edition
 * Matching the futuristic social feed aesthetic.
 */
export default function ArchiveItem({ post, onEdit, onDelete }) {
  return (
    <div className="group relative bg-[#0a0a0c] rounded-2xl overflow-hidden border border-white/5 flex items-center p-3.5 gap-4 transition-all duration-300 hover:border-blue-500/30 hover:shadow-[0_0_20px_rgba(59,130,246,0.08)]">
      
      {/* --- Media Thumbnail --- */}
      <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-black/60 border border-white/5 flex-shrink-0 shadow-inner">
        <img 
          src={post.vocabData?.[0]?.media?.[0]?.url || post.image} 
          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500" 
          alt="" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </div>

      {/* --- Text Content --- */}
      <div className="flex-1 min-w-0">
        <h3 className="font-black text-[11px] text-white uppercase italic tracking-wider truncate mb-0.5">
          {post.vocabData?.[0]?.word || post.word}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-[7px] font-black bg-blue-500/10 text-blue-500 border border-blue-500/20 px-2 py-0.5 rounded-md uppercase tracking-tighter">
            {post.vocabData?.length || 1} Cards Signal
          </span>
        </div>
      </div>

      {/* --- Actions --- */}
      <div className="flex gap-2">
        <button 
          onClick={() => onEdit(post)} 
          className="w-9 h-9 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-[10px] text-gray-400 hover:bg-blue-600 hover:text-white hover:border-blue-500 transition-all shadow-lg active:scale-90"
          title="Edit Transmission"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
        
        <button 
          onClick={() => onDelete(post._id)} 
          className="w-9 h-9 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-[10px] text-gray-500 hover:bg-red-600/20 hover:text-red-500 hover:border-red-500/50 transition-all shadow-lg active:scale-90"
          title="Terminate Unit"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* --- Subtle Hover Underline --- */}
      <div className="absolute bottom-0 left-0 h-[1.5px] w-0 bg-blue-600 group-hover:w-full transition-all duration-500 shadow-[0_0_10px_rgba(37,99,235,0.5)]" />
    </div>
  );
}