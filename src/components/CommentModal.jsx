import React, { useState } from "react";
import toast from "react-hot-toast";

export default function CommentModal({ post, userEmail, onClose, API_URL, onRefresh }) {
  const [comment, setComment] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [loading, setLoading] = useState(false);

  const currentUser = userEmail?.split("@")[0];

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/english-posts/comment/${post._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: currentUser, text: comment })
      });
      if (res.ok) {
        setComment("");
        onRefresh();
        toast.success("Reaction sent! 🚀");
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleDeleteComment = async (commentId) => {
    toast((t) => (
      <div className="flex flex-col gap-3 p-2 bg-[#1a1a1d] text-white rounded-2xl border border-white/10 shadow-2xl">
        <p className="text-[10px] font-black uppercase tracking-widest text-red-400">
          Delete this transmission? 🗑️
        </p>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                const res = await fetch(`${API_URL}/api/english-posts/comment/${post._id}/${commentId}`, {
                  method: "DELETE",
                });
                if (res.ok) { toast.success("Deleted"); onRefresh(); }
              } catch (err) { toast.error("Failed"); }
            }}
            className="bg-red-500/20 border border-red-500/50 text-red-500 px-4 py-1.5 rounded-lg text-[9px] font-black uppercase hover:bg-red-500 hover:text-white transition-all"
          >
            Confirm
          </button>
          <button onClick={() => toast.dismiss(t.id)} className="bg-white/5 px-4 py-1.5 rounded-lg text-[9px] font-black uppercase text-gray-400">
            Abort
          </button>
        </div>
      </div>
    ), { position: 'top-center', style: { background: 'transparent', boxShadow: 'none' } });
  };

  const handleUpdateComment = async (commentId) => {
    if (!editText.trim()) return;
    try {
      const res = await fetch(`${API_URL}/api/english-posts/comment/${post._id}/${commentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: editText })
      });
      if (res.ok) {
        setEditingId(null);
        toast.success("Transmission Updated");
        onRefresh();
      }
    } catch (err) { toast.error("Failed"); }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[300] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-[#0d0d0f] w-full max-w-md h-[85vh] sm:h-[600px] rounded-t-[2.5rem] sm:rounded-[2rem] flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.5)] border-t sm:border border-white/10 overflow-hidden animate-in slide-in-from-bottom duration-500 relative">
        
        {/* Futuristic Top Bar */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-white/10 rounded-full sm:hidden"></div>

        {/* Header */}
        <div className="flex justify-between items-center px-8 py-7 bg-[#121215] border-b border-white/5">
          <div>
            <h3 className="font-black uppercase text-[11px] tracking-[0.2em] text-blue-500 italic">
              Post Discussion
            </h3>
            <p className="text-[9px] font-bold text-gray-500 uppercase mt-0.5">
              {post.comments?.length || 0} Signal(s) Received
            </p>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white hover:bg-red-500/20 hover:border-red-500/50 transition-all">✕</button>
        </div>

        {/* Comments Feed */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide bg-gradient-to-b from-[#0d0d0f] to-black">
          {post.comments?.length > 0 ? (
            post.comments.map((c, i) => {
              const isOwner = c.name === currentUser;
              const isEditing = editingId === c._id;

              return (
                <div key={i} className="flex gap-4 items-start group animate-in fade-in slide-in-from-left-4 duration-300">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-black text-[12px] flex-shrink-0 uppercase shadow-[0_0_15px_rgba(37,99,235,0.3)]">
                    {c.name?.charAt(0)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{c.name}</span>
                      {isOwner && !isEditing && (
                        <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setEditingId(c._id); setEditText(c.text); }} className="text-[9px] font-black uppercase text-blue-500 hover:text-blue-400">Edit</button>
                          <button onClick={() => handleDeleteComment(c._id)} className="text-[9px] font-black uppercase text-gray-600 hover:text-red-500">Delete</button>
                        </div>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="mt-2 space-y-2">
                        <textarea 
                          className="w-full bg-white/5 p-4 rounded-xl text-sm font-bold border border-blue-500/50 text-white outline-none shadow-[0_0_15px_rgba(59,130,246,0.1)] focus:border-blue-500"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <button onClick={() => handleUpdateComment(c._id)} className="px-5 py-2 bg-blue-600 text-white rounded-lg text-[9px] font-black uppercase shadow-lg shadow-blue-900/20">Update</button>
                          <button onClick={() => setEditingId(null)} className="px-5 py-2 bg-white/5 text-gray-500 rounded-lg text-[9px] font-black uppercase border border-white/5">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        <p className="text-sm font-bold text-gray-300 leading-relaxed bg-white/5 p-4 rounded-2xl rounded-tl-none border border-white/5 shadow-inner">
                          {c.text}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/5">
                <span className="text-3xl opacity-30">📡</span>
              </div>
              <p className="font-black text-[10px] uppercase tracking-[0.4em] text-gray-600">Waiting for signals...</p>
            </div>
          )}
        </div>

        {/* Cinematic Input Section */}
        <div className="p-6 bg-[#121215] border-t border-white/5">
          <form onSubmit={handlePostComment} className="relative flex items-center gap-3">
            <input 
              type="text" 
              placeholder="Transmit a reaction..." 
              className="flex-1 bg-black/40 border border-white/10 p-4 rounded-2xl outline-none text-sm font-bold text-white placeholder:text-gray-700 focus:border-blue-500/50 focus:shadow-[0_0_20px_rgba(59,130,246,0.1)] transition-all"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <button 
              disabled={loading} 
              className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/40 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale group"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <span className="text-xl group-hover:translate-x-1 transition-transform">→</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}