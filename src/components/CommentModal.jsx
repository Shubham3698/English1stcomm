import React, { useState } from "react";
import toast from "react-hot-toast";

export default function CommentModal({ post, userEmail, onClose, API_URL, onRefresh }) {
  const [comment, setComment] = useState("");
  const [editingId, setEditingId] = useState(null); // Kaunsa comment edit ho raha hai
  const [editText, setEditText] = useState(""); // Edit wala text state
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
        toast.success("Comment posted! 💬");
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleDeleteComment = async (commentId) => {
    // Custom Toast Confirmation taaki browser wala ganda popup na aaye
    toast((t) => (
      <div className="flex flex-col gap-3 p-1">
        <p className="text-[11px] font-black uppercase text-gray-800 tracking-tighter">
          Pukka delete karna hai? 🗑️
        </p>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                const res = await fetch(`${API_URL}/api/english-posts/comment/${post._id}/${commentId}`, {
                  method: "DELETE",
                });
                if (res.ok) { toast.success("Comment removed"); onRefresh(); }
              } catch (err) { toast.error("Delete failed"); }
            }}
            className="bg-red-500 text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase"
          >
            Delete
          </button>
          <button onClick={() => toast.dismiss(t.id)} className="bg-gray-100 px-3 py-1 rounded-lg text-[9px] font-black uppercase text-gray-400">
            Cancel
          </button>
        </div>
      </div>
    ), { duration: 4000, position: 'top-center', style: { borderRadius: '20px' } });
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
        toast.success("Comment updated!");
        onRefresh();
      }
    } catch (err) { toast.error("Update failed"); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-end sm:items-center justify-center">
      <div className="bg-white w-full max-w-md h-[70vh] sm:h-[500px] rounded-t-[3rem] sm:rounded-[3rem] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-500">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-50 bg-white sticky top-0 z-10">
          <h3 className="font-black uppercase text-[10px] tracking-widest text-gray-400 italic">
            Vault Discussion ({post.comments?.length || 0})
          </h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-gray-50 rounded-full text-gray-400 hover:text-black transition-all">✕</button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
          {post.comments?.length > 0 ? (
            post.comments.map((c, i) => {
              const isOwner = c.name === currentUser;
              const isEditing = editingId === c._id;

              return (
                <div key={i} className="flex gap-4 items-start animate-in fade-in slide-in-from-left-4">
                  <div className="w-9 h-9 rounded-full bg-red-50 text-red-500 flex items-center justify-center font-black text-[11px] flex-shrink-0 uppercase shadow-sm border border-red-100">
                    {c.name?.charAt(0)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{c.name}</span>
                      {isOwner && !isEditing && (
                        <div className="flex gap-3">
                          <button onClick={() => { setEditingId(c._id); setEditText(c.text); }} className="text-[9px] font-black uppercase text-blue-400 hover:text-blue-600 transition-colors">Edit</button>
                          <button onClick={() => handleDeleteComment(c._id)} className="text-[9px] font-black uppercase text-gray-300 hover:text-red-500 transition-colors">Delete</button>
                        </div>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="mt-2 animate-in fade-in zoom-in-95">
                        <textarea 
                          className="w-full bg-gray-50 p-3 rounded-2xl text-sm font-bold border-2 border-blue-100 outline-none"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                        />
                        <div className="flex gap-2 mt-2">
                          <button onClick={() => handleUpdateComment(c._id)} className="px-4 py-2 bg-blue-500 text-white rounded-xl text-[9px] font-black uppercase shadow-lg shadow-blue-100">Save</button>
                          <button onClick={() => setEditingId(null)} className="px-4 py-2 bg-gray-100 text-gray-400 rounded-xl text-[9px] font-black uppercase">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm font-bold text-gray-800 leading-snug bg-gray-50/50 p-3 rounded-2xl rounded-tl-none border border-gray-100/50">
                        {c.text}
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center h-full opacity-20">
              <span className="text-4xl mb-2">💬</span>
              <p className="font-black text-[10px] uppercase tracking-[0.3em]">No words shared yet</p>
            </div>
          )}
        </div>

        {/* Input Section */}
        <form onSubmit={handlePostComment} className="p-6 bg-white border-t border-gray-50 flex gap-3">
          <input 
            type="text" 
            placeholder="Write a reaction..." 
            className="flex-1 bg-gray-50 p-4 rounded-[1.5rem] outline-none text-sm font-bold placeholder:text-gray-300 focus:bg-white focus:ring-2 ring-red-100 transition-all"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <button disabled={loading} className="w-14 h-14 bg-red-500 text-white rounded-full flex items-center justify-center shadow-xl shadow-red-100 active:scale-90 transition-all disabled:bg-gray-200">
            {loading ? "..." : <span className="text-lg">→</span>}
          </button>
        </form>
      </div>
    </div>
  );
}