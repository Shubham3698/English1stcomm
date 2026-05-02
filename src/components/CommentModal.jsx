import React, { useState } from "react";

export default function CommentModal({ post, userEmail, onClose, API_URL, onRefresh }) {
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/english-posts/comment/${post._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: userEmail.split("@")[0], // Email ka pehla part name ban jayega
          text: comment
        })
      });

      if (res.ok) {
        setComment("");
        onRefresh(); // Data refresh karo taaki naya comment dikhe
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-end sm:items-center justify-center">
      <div className="bg-white w-full max-w-md h-[70vh] sm:h-[500px] rounded-t-[2.5rem] sm:rounded-[2.5rem] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-50">
          <h3 className="font-black uppercase text-xs tracking-widest text-gray-400 italic">Comments ({post.comments?.length || 0})</h3>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-black transition-all">✕</button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {post.comments?.length > 0 ? (
            post.comments.map((c, i) => (
              <div key={i} className="flex gap-3 items-start animate-in fade-in slide-in-from-bottom-2">
                <div className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center font-black text-[10px] flex-shrink-0 uppercase tracking-tighter">
                  {c.name?.charAt(0)}
                </div>
                <div className="bg-gray-50 p-3 rounded-2xl rounded-tl-none flex-1">
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-1">{c.name}</p>
                  <p className="text-sm font-medium text-gray-800 leading-tight">{c.text}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full opacity-30 italic font-bold text-gray-400 uppercase text-xs">
              No comments yet
            </div>
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handlePostComment} className="p-6 bg-white border-t border-gray-50 flex gap-2">
          <input 
            type="text" 
            placeholder="Add a comment..." 
            className="flex-1 bg-gray-50 p-4 rounded-2xl outline-none text-sm font-bold focus:ring-2 ring-red-500 transition-all"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <button disabled={loading} className="bg-red-500 text-white px-6 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-red-100 hover:bg-red-600 active:scale-95 transition-all">
            {loading ? "..." : "Post"}
          </button>
        </form>
      </div>
    </div>
  );
}