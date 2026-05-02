import React, { useState, useEffect } from "react";
import CommentModal from "../components/CommentModal"; // Make sure path is correct

export default function CommunityPost() {
  const [dbPosts, setDbPosts] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const [selectedPostForComments, setSelectedPostForComments] = useState(null);
  const [loading, setLoading] = useState(true);
  const userEmail = localStorage.getItem("eng_userEmail");

  const API_URL = window.location.hostname === "localhost" 
    ? "http://localhost:3000" : "https://serdeptry1st.onrender.com";

  const fetchPosts = async () => {
    try {
      const res = await fetch(`${API_URL}/api/english-posts/all`);
      const data = await res.json();
      setDbPosts(data);
      setLoading(false);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchPosts();
    const interval = setInterval(fetchPosts, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleVote = async (e, postId) => {
    if (e) e.stopPropagation();
    if (!userEmail) return alert("Bhai, pehle login kar lo!");
    try {
      const res = await fetch(`${API_URL}/api/english-posts/vote/${postId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail })
      });
      if (res.ok) fetchPosts();
    } catch (err) { console.error(err); }
  };

  const handleStatUpdate = async (e, postId, level) => {
    e.stopPropagation();
    if (!userEmail) return alert("Login first!");
    try {
      const res = await fetch(`${API_URL}/api/english-posts/update-stat/${postId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level, email: userEmail })
      });
      if (res.ok) fetchPosts();
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className="flex justify-center p-20 animate-pulse font-black text-slate-300 tracking-widest uppercase italic">Hub Updating...</div>;

  return (
    <div className="flex justify-center bg-white min-h-screen font-sans">
      <div className="w-full max-w-[450px]">
        
        {dbPosts.map((post) => {
          const isVoted = post.votedBy?.includes(userEmail);
          const isOpen = activeIndex === post._id;
          const userLevel = post.userStats?.find(v => v.email === userEmail)?.level;

          return (
            <div key={post._id} className="mb-8 border-b border-gray-50 pb-4">
              
              {/* --- 👤 User Info Strip --- */}
              <div className="flex items-center px-4 py-3 gap-3">
                <div className="w-8 h-8 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 rounded-full p-[2px] shadow-sm">
                  <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-[10px] font-black">
                    {post.userEmail?.charAt(0).toUpperCase()}
                  </div>
                </div>
                <span className="text-[11px] font-black text-gray-800 tracking-tight">{post.userEmail?.split('@')[0]}</span>
                <span className="text-[9px] ml-auto bg-gray-100 px-3 py-1.5 rounded-full text-gray-500 font-black uppercase tracking-widest border border-gray-50">
                  {post.badgeName || "Vocabulary"}
                </span>
              </div>

              {/* --- 📸 Post Image (Double Tap to Like) --- */}
             <div 
  className="relative w-full bg-gray-50 flex items-center justify-center cursor-pointer" 
  onDoubleClick={(e) => handleVote(e, post._id)}
>
  <img 
    src={post.image} 
    alt="post"
    className="w-full h-auto max-h-[600px] object-contain block transition-transform duration-700 hover:scale-[1.01]" 
    /* 
       Note: 
       - h-auto se image apni original height le legi.
       - object-contain se image box ke andar fit ho jayegi bina cut hue.
       - max-h-[600px] isliye taaki agar koi bahut lambi image ho toh screen na bhar jaye.
    */
  />
</div>
              {/* --- ⚡ Action Bar --- */}
              <div className="flex items-center gap-4 px-4 pt-4">
                <button onClick={(e) => handleVote(e, post._id)} className="transition-transform active:scale-150">
                  <svg xmlns="http://www.w3.org/2000/svg" fill={isVoted ? "#ef4444" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke={isVoted ? "#ef4444" : "currentColor"} className="w-7 h-7">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                </button>
                
                {/* Comment Trigger */}
                <button onClick={() => setSelectedPostForComments(post)} className="transition-transform active:scale-125">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785 0 00.19.08c.957.1 1.954.02 2.894-.21a1.2 1.2 0 011.008.204 9.07 9.07 0 002.972.524z" />
                  </svg>
                </button>

                {/* Stat Trigger */}
                <button onClick={() => setActiveIndex(isOpen ? null : post._id)} className="ml-auto transition-transform active:rotate-12">
                  <svg xmlns="http://www.w3.org/2000/svg" fill={isOpen ? "#3b82f6" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke={isOpen ? "#3b82f6" : "currentColor"} className="w-7 h-7">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h.187c.306 0 .599.124.815.347l1.17 1.201 2.203-2.58a.513.513 0 01.384-.184h.345c.302 0 .594.12.809.33l2.127 2.083 3.578-7.352a.511.511 0 01.462-.286h.348c.302 0 .593.12.808.33l3.564 3.476c.247.242.387.577.387.926v3.97c0 .622-.504 1.125-1.125 1.125h-17.25c-.621 0-1.125-.503-1.125-1.125v-3.97z" />
                  </svg>
                </button>
              </div>

              {/* --- 📝 Caption Area --- */}
              <div className="px-4 py-2">
                <p className="text-[13px] font-black text-gray-900 mb-1 tracking-tight">{post.voteCount || 0} likes</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-[13px] font-black text-gray-900 uppercase tracking-tighter">{post.word}</span>
                  <span className="text-sm text-red-500 font-bold italic tracking-tight">{post.meaning}</span>
                </div>
                
                {/* View All Comments Link */}
                <p 
                  onClick={() => setSelectedPostForComments(post)}
                  className="text-[11px] font-black text-gray-400 uppercase tracking-widest mt-2 cursor-pointer hover:text-gray-600 transition-colors"
                >
                  View all {post.comments?.length || 0} comments
                </p>
              </div>

              {/* --- 📊 Expanded Progress (Radio Style) --- */}
              <div className={`px-4 mt-3 overflow-hidden transition-all duration-500 ${isOpen ? "max-h-40" : "max-h-0"}`}>
                <div className="bg-gray-50/80 backdrop-blur-sm rounded-[1.5rem] p-4 grid grid-cols-3 gap-3 border border-gray-100">
                  {[
                    { id: 'neverHeard', icon: '🌑', label: 'New', count: post.commandStats?.neverHeard, color: 'text-red-500' },
                    { id: 'heardButNotUsed', icon: '🌓', label: 'Heard', count: post.commandStats?.heardButNotUsed, color: 'text-blue-500' },
                    { id: 'dailyUse', icon: '🌟', label: 'Pro', count: post.commandStats?.dailyUse, color: 'text-green-600' }
                  ].map((stat) => (
                    <button 
                      key={stat.id}
                      onClick={(e) => handleStatUpdate(e, post._id, stat.id)}
                      className={`flex flex-col items-center py-3 rounded-2xl border-2 transition-all duration-300 ${userLevel === stat.id ? 'border-gray-900 bg-white shadow-md scale-105' : 'border-transparent bg-white/50'}`}
                    >
                      <span className="text-lg mb-1">{stat.icon}</span>
                      <span className={`text-[11px] font-black ${stat.color}`}>{stat.count || 0}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* --- 🔥 Comment Modal Component --- */}
      {selectedPostForComments && (
        <CommentModal 
          post={selectedPostForComments}
          userEmail={userEmail}
          API_URL={API_URL}
          onClose={() => setSelectedPostForComments(null)}
          onRefresh={() => {
            fetchPosts();
            // Update the modal with fresh data
            const updated = dbPosts.find(p => p._id === selectedPostForComments._id);
            if(updated) setSelectedPostForComments(updated);
          }}
        />
      )}
    </div>
  );
}