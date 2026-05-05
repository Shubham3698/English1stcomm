import React, { useState, useEffect } from "react";
import toast from 'react-hot-toast';
import CommentModal from "../components/CommentModal"; 
import PostCard from "../components/PostCard";

export default function SavedPosts() {
  const [dbPosts, setDbPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(null); 
  const [selectedPostForComments, setSelectedPostForComments] = useState(null);
  const [isPremiumUser, setIsPremiumUser] = useState(localStorage.getItem("eng_isPremium") === "true");

  const userEmail = localStorage.getItem("eng_userEmail");
  const API_URL = window.location.hostname === "localhost" 
    ? "http://localhost:3000" : "https://serdeptry1st.onrender.com";

  const fetchSavedPosts = async () => {
    if (!userEmail) return setLoading(false);
    try {
      const res = await fetch(`${API_URL}/api/english-posts/saved-posts?email=${userEmail}`);
      const data = await res.json();
      setDbPosts(Array.isArray(data) ? data : []);
    } catch (err) { toast.error("Vault load fail! 🥺"); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSavedPosts(); }, []);

  if (loading) return <div className="flex justify-center p-20 animate-pulse font-black text-slate-300 uppercase italic text-sm text-center">Opening Vault...</div>;

  return (
    <div className="flex justify-center bg-white min-h-screen font-sans">
      <div className="w-full max-w-[450px]">
        <div className="px-6 py-8 border-b border-gray-100 mb-6">
          <h2 className="text-2xl font-black italic uppercase text-gray-900 tracking-tighter">My Saved Vault 📥</h2>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Total: {dbPosts.length} Items</span>
        </div>

        {dbPosts.length === 0 ? (
          <div className="p-10 text-center text-gray-400 uppercase text-[10px] font-black tracking-widest">Bhai Vault khali hai! 😅</div>
        ) : (
          dbPosts.map((post) => (
            <PostCard 
              key={post._id}
              post={post}
              userEmail={userEmail}
              isPremiumUser={isPremiumUser}
              activeIndex={activeIndex}
              setActiveIndex={setActiveIndex}
              setSelectedPostForComments={setSelectedPostForComments}
              onRefresh={fetchSavedPosts}
              API_URL={API_URL}
            />
          ))
        )}
      </div>
      
      {selectedPostForComments && (
        <CommentModal 
          post={selectedPostForComments} 
          userEmail={userEmail} 
          API_URL={API_URL} 
          onClose={() => setSelectedPostForComments(null)} 
          onRefresh={fetchSavedPosts} 
        />
      )}
    </div>
  );
}