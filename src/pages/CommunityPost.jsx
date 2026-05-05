import React, { useState, useEffect } from "react";
import PostCard from "../components/PostCard"; 

export default function CommunityPost() {
  const [dbPosts, setDbPosts] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPremiumUser] = useState(localStorage.getItem("eng_isPremium") === "true");
  
  const userEmail = localStorage.getItem("eng_userEmail");
  const API_URL = window.location.hostname === "localhost" 
    ? "http://localhost:3000" : "https://serdeptry1st.onrender.com";

  // Posts fetch karne ka logic
  const fetchPosts = async () => {
    try {
      const res = await fetch(`${API_URL}/api/english-posts/all`);
      const data = await res.json();
      setDbPosts(data);
      setLoading(false);
    } catch (err) { 
      setLoading(false); 
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchPosts();
    // Auto refresh interval (15 seconds)
    const interval = setInterval(fetchPosts, 15000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return (
    <div className="flex justify-center p-20 animate-pulse font-black text-slate-300 uppercase italic text-sm text-center">
      Hub Updating...
    </div>
  );

  return (
    <div className="flex justify-center bg-white min-h-screen font-sans">
      <div className="w-full max-w-[450px]">
        {/* 🔥 Ab sirf PostCard map hoga, Comments card ke andar se hi khulenge */}
        {dbPosts.map((post) => (
          <PostCard 
            key={post._id}
            post={post}
            userEmail={userEmail}
            isPremiumUser={isPremiumUser}
            activeIndex={activeIndex}
            setActiveIndex={setActiveIndex}
            onRefresh={fetchPosts}
            API_URL={API_URL}
          />
        ))}

        {/* Empty State check (Optional but good) */}
        {dbPosts.length === 0 && !loading && (
          <div className="p-20 text-center font-black text-gray-200 uppercase tracking-widest italic">
            No posts in the hub yet! 🧊
          </div>
        )}
      </div>
    </div>
  );
}