import React, { useState, useEffect } from "react";
import CommentModal from "../components/CommentModal"; 
import PostCard from "../components/PostCard"; 
import { useLocation } from "react-router-dom";

export default function CommunityPost() {
  const [dbPosts, setDbPosts] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const [selectedPostForComments, setSelectedPostForComments] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPremiumUser, setIsPremiumUser] = useState(localStorage.getItem("eng_isPremium") === "true");
  
  const userEmail = localStorage.getItem("eng_userEmail");
  const API_URL = window.location.hostname === "localhost" 
    ? "http://localhost:3000" : "https://serdeptry1st.onrender.com";

  const fetchPosts = async () => {
    try {
      const res = await fetch(`${API_URL}/api/english-posts/all`);
      const data = await res.json();
      setDbPosts(data);
      setLoading(false);
      // Premium Status check logic yaha rakh sakte ho
    } catch (err) { setLoading(false); }
  };

  useEffect(() => {
    fetchPosts();
    const interval = setInterval(fetchPosts, 15000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="flex justify-center p-20 animate-pulse font-black text-slate-300 uppercase italic text-sm text-center">Hub Updating...</div>;

  return (
    <div className="flex justify-center bg-white min-h-screen font-sans">
      <div className="w-full max-w-[450px]">
        {dbPosts.map((post) => (
          <PostCard 
            key={post._id}
            post={post}
            userEmail={userEmail}
            isPremiumUser={isPremiumUser}
            activeIndex={activeIndex}
            setActiveIndex={setActiveIndex}
            setSelectedPostForComments={setSelectedPostForComments}
            onRefresh={fetchPosts}
            API_URL={API_URL}
          />
        ))}
      </div>
      {selectedPostForComments && (
        <CommentModal 
          post={selectedPostForComments} 
          userEmail={userEmail} 
          API_URL={API_URL} 
          onClose={() => setSelectedPostForComments(null)} 
          onRefresh={fetchPosts} 
        />
      )}
    </div>
  );
}