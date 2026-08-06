import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import PostCard from '../components/PostCard'; // Aapka existing PostCard
import toast from 'react-hot-toast';

export default function SinglePostView() {
  const { postId } = useParams(); // URL se ID nikalne ke liye
  const navigate = useNavigate();
  
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const userEmail = localStorage.getItem("eng_userEmail");
  const isPremiumUser = localStorage.getItem("eng_isPremium") === "true";
 const API_URL = Capacitor.isNativePlatform() 
  ? "https://serdeptry1st.onrender.com"  // Agar APK hai, toh humesha Live API hit karega
  : (window.location.hostname === "localhost" 
      ? "http://localhost:3000"          // Agar Web/Laptop par test kar rahe ho
      : "https://serdeptry1st.onrender.com"); // Agar Web par Vercel/Netlify par deployed hai
  // Sirf ek post fetch karne ka function
  useEffect(() => {
    const fetchSinglePost = async () => {
      try {
        // Aapko backend me ye route banana padega agar nahi hai toh
        const res = await fetch(`${API_URL}/api/english-posts/single/${postId}`);
        const data = await res.json();
        
        if (data.success) {
          setPost(data.post);
        } else {
          toast.error("Post not found");
        }
      } catch (error) {
        console.error("Error fetching post:", error);
        toast.error("Failed to load post");
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      fetchSinglePost();
    }
  }, [postId]);

  return (
    <div className="flex justify-center bg-[#F2EFE7] min-h-screen font-sans overflow-x-hidden pb-24">
      <div className="w-full max-w-[450px] relative pt-6 px-3">
        
        {/* 🔙 BACK BUTTON HEADER */}
        <div className="flex items-center gap-4 mb-6 bg-white p-4 rounded-[1.5rem] shadow-sm border-[3px] border-[#8B004A]/10">
          <button 
            onClick={() => navigate(-1)} // Ek step peeche jane ke liye
            className="w-10 h-10 flex items-center justify-center bg-gray-50 hover:bg-gray-100 rounded-full transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-[#8B004A]" />
          </button>
          <div>
            <h1 className="font-black text-gray-900 uppercase tracking-widest text-sm">Post Detail</h1>
            <p className="text-[10px] font-bold text-gray-400">View notification context</p>
          </div>
        </div>

        {/* 🔄 LOADING STATE */}
        {loading && (
          <div className="py-32 flex flex-col items-center justify-center text-center">
            <Loader2 className="w-10 h-10 text-[#E01A76] animate-spin mb-4" />
          </div>
        )}

        {/* 📝 ACTUAL POST RENDER */}
        {!loading && post && (
          <div className="animate-in slide-in-from-bottom-4 fade-in duration-500">
            {/* Aapka same PostCard component yaha reuse hoga */}
            <PostCard 
              post={post} 
              userEmail={userEmail} 
              isPremiumUser={isPremiumUser} 
              API_URL={API_URL} 
            />
          </div>
        )}

        {/* 🚫 ERROR STATE */}
        {!loading && !post && (
          <div className="py-24 text-center text-gray-500 font-bold uppercase tracking-widest text-xs">
            Post has been deleted or is unavailable.
          </div>
        )}
      </div>
    </div>
  );
}