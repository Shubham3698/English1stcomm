import React, { useState, useEffect } from "react";
import staticPosts from "../data/posts";

export default function CommunityPost() {
  const [dbPosts, setDbPosts] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const userEmail = localStorage.getItem("eng_userEmail");

  const API_URL = window.location.hostname === "localhost" 
    ? "http://localhost:3000" : "https://serdeptry1st.onrender.com";

  const fetchPosts = () => {
    fetch(`${API_URL}/api/english-posts/all`)
      .then(res => res.json())
      .then(data => setDbPosts(data))
      .catch(err => console.log(err));
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // 🎨 Badge Styling Logic
  const getBadgeStyle = (badgeName) => {
    switch (badgeName) {
      case "Trending":
        return "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-orange-200";
      case "Professional":
        return "bg-gradient-to-r from-indigo-600 to-purple-700 text-white shadow-purple-200";
      case "Popular":
        return "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-blue-200";
      case "Easy":
        return "bg-gradient-to-r from-emerald-400 to-green-600 text-white shadow-green-200";
      default:
        return "bg-gray-800 text-white shadow-gray-200";
    }
  };

  const handleVote = async (e, postId) => {
    e.stopPropagation();
    if (!userEmail) return alert("Please Login first!");
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
    try {
      await fetch(`${API_URL}/api/english-posts/update-stat/${postId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level })
      });
      fetchPosts();
    } catch (err) { console.error(err); }
  };

  const allPosts = [...dbPosts, ...staticPosts];

  return (
    <div className="flex justify-center p-5 bg-gray-50 min-h-screen font-sans">
      <div className="w-full max-w-sm">
        {allPosts.map((post, index) => {
          const isVoted = post.votedBy?.includes(userEmail);
          const isOpen = activeIndex === index;

          return (
            <div key={index} 
                 onClick={() => setActiveIndex(isOpen ? null : index)} 
                 className="bg-white mb-10 rounded-[2.5rem] overflow-hidden shadow-sm border border-gray-100 transition-all active:scale-[0.98]">
              
              {/* Image Section */}
              <div className="relative overflow-hidden">
                <img 
                  src={post.image} 
                  className={`w-full h-80 object-cover transition duration-700 ${isOpen ? "brightness-110 scale-105" : "brightness-95"}`} 
                />
                
                {/* 🏷️ Badge Name - Click hone par hide ho jayega */}
                <div className={`absolute top-5 left-5 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg backdrop-blur-sm transition-all duration-300 ${
                  isOpen ? "opacity-0 invisible -translate-y-4" : "opacity-100 visible translate-y-0"
                } ${getBadgeStyle(post.badgeName)}`}>
                  {post.badgeName || "Normal"}
                </div>

                {/* 🗳️ Vote Floating Button - Click hone par hide ho jayega */}
                <button 
                  onClick={(e) => handleVote(e, post._id)}
                  className={`absolute top-5 right-5 p-3 rounded-2xl shadow-xl transition-all duration-300 active:scale-90 flex items-center gap-2 ${
                    isOpen ? "opacity-0 invisible -translate-y-4" : "opacity-100 visible translate-y-0"
                  } ${isVoted ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-800'}`}
                >
                  <span className="text-sm">🔥</span>
                  <span className="text-[10px] font-black">{post.voteCount || 0}</span>
                </button>
              </div>

              {/* Word & Meaning Section */}
              <div className="flex justify-between items-center px-6 py-5">
                <h3 className="font-black text-xl uppercase tracking-tighter text-gray-800">{post.word}</h3>
                <span className="text-red-500 font-black bg-red-50 px-4 py-2 rounded-2xl text-sm italic">{post.meaning}</span>
              </div>

              {/* 📊 Word Command Levels (Expandable) */}
              <div className={`px-6 pb-6 space-y-4 transition-all duration-500 ${isOpen ? "block animate-in fade-in slide-in-from-top-2" : "hidden"}`}>
                <div className="h-[1px] bg-gray-100 w-full mb-4"></div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">My Command Level</p>
                
                <div className="grid grid-cols-3 gap-2">
                  <button 
                    onClick={(e) => handleStatUpdate(e, post._id, 'neverHeard')}
                    className="flex flex-col items-center p-3 bg-gray-50 hover:bg-red-50 rounded-[1.5rem] border border-gray-100 transition-colors"
                  >
                    <span className="text-lg">🌑</span>
                    <span className="text-[8px] font-bold mt-1 text-gray-500 uppercase italic">New</span>
                    <span className="text-[11px] font-black text-red-500">{post.commandStats?.neverHeard || 0}</span>
                  </button>

                  <button 
                    onClick={(e) => handleStatUpdate(e, post._id, 'heardButNotUsed')}
                    className="flex flex-col items-center p-3 bg-gray-50 hover:bg-blue-50 rounded-[1.5rem] border border-gray-100 transition-colors"
                  >
                    <span className="text-lg">🌓</span>
                    <span className="text-[8px] font-bold mt-1 text-gray-500 uppercase italic">Heard</span>
                    <span className="text-[11px] font-black text-blue-500">{post.commandStats?.heardButNotUsed || 0}</span>
                  </button>

                  <button 
                    onClick={(e) => handleStatUpdate(e, post._id, 'dailyUse')}
                    className="flex flex-col items-center p-3 bg-gray-50 hover:bg-green-50 rounded-[1.5rem] border border-gray-100 transition-colors"
                  >
                    <span className="text-lg">🌟</span>
                    <span className="text-[8px] font-bold mt-1 text-gray-500 uppercase italic">Daily</span>
                    <span className="text-[11px] font-black text-green-600">{post.commandStats?.dailyUse || 0}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}