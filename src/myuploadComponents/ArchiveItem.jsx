import React from "react";

export default function ArchiveItem({ post, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-gray-100 flex items-center p-4 gap-4 transition-all hover:shadow-md">
      <img src={post.vocabData?.[0]?.media?.[0]?.url || post.image} className="w-16 h-16 rounded-2xl object-cover bg-gray-50 shadow-inner" alt="" />
      <div className="flex-1">
        <h3 className="font-black text-xs uppercase italic truncate">{post.vocabData?.[0]?.word || post.word}</h3>
        <span className="text-[8px] font-black text-blue-500 uppercase">{post.vocabData?.length || 1} Cards</span>
      </div>
      <div className="flex gap-2">
        <button onClick={() => onEdit(post)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs shadow-sm">✍️</button>
        <button onClick={() => onDelete(post._id)} className="w-8 h-8 bg-red-50 text-red-500 rounded-full font-bold shadow-sm">✕</button>
      </div>
    </div>
  );
}