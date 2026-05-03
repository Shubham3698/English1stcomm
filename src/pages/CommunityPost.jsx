import React, { useState, useEffect, useRef } from "react"; // Added useRef
import CommentModal from "../components/CommentModal"; 
import toast from 'react-hot-toast';
import { useLocation } from "react-router-dom"; // Added useLocation

// --- Swiper Core Imports ---
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

export default function CommunityPost() {
  const [dbPosts, setDbPosts] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const [selectedPostForComments, setSelectedPostForComments] = useState(null);
  const [loading, setLoading] = useState(true);
  const userEmail = localStorage.getItem("eng_userEmail");
  
  const location = useLocation(); // To detectpostId in URL

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

  // 🎯 SPECIFIC POST SCROLL LOGIC
  useEffect(() => {
    if (!loading && dbPosts.length > 0) {
      const params = new URLSearchParams(location.search);
      const postId = params.get("postId");
      if (postId) {
        setTimeout(() => {
          const element = document.getElementById(postId);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
            // Briefly highlight the post
            element.classList.add("bg-red-50/50");
            setTimeout(() => element.classList.remove("bg-red-50/50"), 2000);
          }
        }, 500);
      }
    }
  }, [loading, dbPosts, location]);

  // 🚀 UPDATED: Specific Post Share Logic
  const handleShare = async (post) => {
    // Creating a unique link for this specific post
    const shareUrl = `${window.location.origin}${window.location.pathname}?postId=${post._id}`;
    
    const shareData = {
      title: `Check out: ${post.word}`,
      text: `Bhai, ye word dekh: "${post.word}" (${post.meaning}). Seekh le kaam aayega! 🔥`,
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        toast.success("Link copied! Ab WhatsApp pe chipka do. 📋");
      }
    } catch (err) { console.error("Share failed", err); }
  };

  const renderMedia = (post) => {
    const mediaItems = post.media && post.media.length > 0 
      ? post.media 
      : [{ type: 'image', url: post.image }];

    return (
      <Swiper modules={[Pagination]} pagination={{ clickable: true }} className="w-full h-[600px] bg-gray-50">
        {mediaItems.map((item, idx) => {
          let finalUrl = item.url;
          let isShorts = false;
          if (item.type === 'embed') {
            if (finalUrl.includes('youtube.com/shorts/')) {
              finalUrl = finalUrl.replace('youtube.com/shorts/', 'youtube.com/embed/');
              isShorts = true;
            } else if (finalUrl.includes('youtube.com/watch?v=')) {
              finalUrl = finalUrl.replace('watch?v=', 'embed/');
            } else if (finalUrl.includes('youtu.be/')) {
              finalUrl = finalUrl.replace('youtu.be/', 'youtube.com/embed/');
            }
            finalUrl = finalUrl.split('?')[0];
          }
          return (
            <SwiperSlide key={idx} className="bg-gray-50">
              <div className="w-full h-full flex items-center justify-center bg-black overflow-hidden">
                {item.type === 'video' ? (
                  <video src={item.url} className="w-full h-auto max-h-full object-cover" controls playsInline />
                ) : item.type === 'embed' ? (
                  <div className={`w-full ${isShorts ? 'h-full' : 'aspect-video'}`}>
                    <iframe className="w-full h-full border-0" src={finalUrl} title={`media-${idx}`} allowFullScreen></iframe>
                  </div>
                ) : (
                  <img src={item.url} alt="content" className="w-full h-auto max-h-full object-cover" />
                )}
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    );
  };

  const handleVote = async (e, postId) => {
    if (e) e.stopPropagation();
    if (!userEmail) return toast.error("Bhai, pehle login kar lo! 😅");
    try {
      const res = await fetch(`${API_URL}/api/english-posts/vote/${postId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail })
      });
      if (res.ok) {
        toast.success("Voted! 🔥", { duration: 1000 });
        fetchPosts();
      }
    } catch (err) { toast.error("Error voting!"); }
  };

  const submitStatUpdate = async (postId, level) => {
    try {
      const res = await fetch(`${API_URL}/api/english-posts/update-stat/${postId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level, email: userEmail, nextReview: null })
      });
      if (res.ok) {
        toast.success(`Marked as ${level.toUpperCase()} ✅`);
        fetchPosts();
      }
    } catch (err) { toast.error("Update Failed!"); }
  };

  const handleStatUpdate = async (e, postId, level) => {
    e.stopPropagation();
    if (!userEmail) return toast.error("Login first! 🔑");
    const currentPost = dbPosts.find(p => p._id === postId);
    const existingStat = currentPost?.userStats?.find(v => v.email === userEmail);
    if (existingStat && existingStat.level !== level) {
      toast((t) => (
        <div className="flex flex-col gap-3 min-w-[220px] p-1 text-black">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔄</span>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Status Change</span>
              <span className="text-[13px] font-black text-gray-800">Move to <span className="text-red-500 italic uppercase">{level}</span>?</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { toast.dismiss(t.id); submitStatUpdate(postId, level); }} className="flex-1 bg-black text-white py-2 rounded-xl text-[10px] font-black uppercase">Update</button>
            <button onClick={() => toast.dismiss(t.id)} className="flex-1 bg-gray-100 text-gray-400 py-2 rounded-xl text-[10px] font-black uppercase">Deny</button>
          </div>
        </div>
      ), { duration: 5000, style: { borderRadius: '24px', background: '#fff' } });
      return;
    }
    submitStatUpdate(postId, level);
  };

  if (loading) return <div className="flex justify-center p-20 animate-pulse font-black text-slate-300 uppercase italic text-sm">Hub Updating...</div>;

  return (
    <div className="flex justify-center bg-white min-h-screen font-sans">
      <div className="w-full max-w-[450px]">
        {dbPosts.map((post) => {
          const isVoted = post.votedBy?.includes(userEmail);
          const isOpen = activeIndex === post._id;
          const userLevel = post.userStats?.find(v => v.email === userEmail)?.level;

          return (
            <div id={post._id} key={post._id} className="mb-12 border-b border-gray-100 pb-6 transition-colors duration-1000">
              <div className="flex items-center px-4 py-3 gap-3">
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-[10px] font-black text-white">
                  {post.userEmail?.charAt(0).toUpperCase()}
                </div>
                <span className="text-[11px] font-black text-gray-800 italic">{post.userEmail?.split('@')[0]}</span>
                <span className="text-[9px] ml-auto bg-gray-50 px-3 py-1.5 rounded-full text-gray-400 font-black uppercase tracking-widest border border-gray-100">
                  {post.badgeName || "Vocabulary"}
                </span>
              </div>

              <div className="relative w-full bg-gray-50 overflow-hidden" onDoubleClick={(e) => handleVote(e, post._id)}>
                {renderMedia(post)}
              </div>

              <div className="flex items-center gap-5 px-5 pt-5 text-black">
                <button onClick={(e) => handleVote(e, post._id)} className="transition-transform active:scale-150 duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" fill={isVoted ? "#ef4444" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke={isVoted ? "#ef4444" : "currentColor"} className="w-7 h-7">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                </button>
                <button onClick={() => setSelectedPostForComments(post)} className="transition-transform active:scale-125">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785 0 0 0 .19.08c.957.1 1.954.02 2.894-.21a1.2 1.2 0 0 1 1.008.204 9.07 9.07 0 0 0 2.972.524z" /></svg>
                </button>
                <button onClick={() => handleShare(post)} className="transition-transform active:scale-125">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0-10.628a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5m0 10.628a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5" />
                  </svg>
                </button>
                <button onClick={() => setActiveIndex(isOpen ? null : post._id)} className="ml-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" fill={isOpen ? "#3b82f6" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke={isOpen ? "#3b82f6" : "currentColor"} className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h.187c.306 0 .599.124.815.347l1.17 1.201 2.203-2.58a.513.513 0 01.384-.184h.345c.302 0 .594.12.809.33l2.127 2.083 3.578-7.352a.511.511 0 01.462-.286h.348c.302 0 .593.12.808.33l3.564 3.476c.247.242.387.577.387.926v3.97c0 .622-.504 1.125-1.125 1.125h-17.25c-.621 0-1.125-.503-1.125-1.125v-3.97z" /></svg>
                </button>
              </div>

              <div className="px-5 py-4">
                <p className="text-[12px] font-black text-gray-400 mb-2 italic">🔥 {post.voteCount || 0} Likes</p>
                <div className="flex flex-col gap-0">
                  <h2 className="text-5xl font-black text-gray-900 uppercase tracking-tighter leading-[0.85] mb-2 italic">{post.word}</h2>
                  <p className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent italic leading-none">{post.meaning}</p>
                </div>
                <p onClick={() => setSelectedPostForComments(post)} className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-5 cursor-pointer">View comments</p>
              </div>

              <div className={`px-4 mt-2 overflow-hidden transition-all duration-500 ${isOpen ? "max-h-60" : "max-h-0"}`}>
                <div className="bg-gray-50/50 rounded-[2rem] p-4 grid grid-cols-2 gap-3 border border-gray-100">
                  <button onClick={(e) => handleStatUpdate(e, post._id, 'easy')} className={`flex items-center justify-between p-3.5 rounded-2xl border-2 transition-all ${userLevel === 'easy' ? 'border-green-500 bg-white' : 'border-transparent bg-white/50'}`}>
                    <div className="flex items-center gap-2"><span>✅</span><span className="text-[10px] font-black uppercase text-gray-500">आसान</span></div>
                    <span className="text-[11px] font-black text-green-600">{post.commandStats?.easy || 0}</span>
                  </button>
                  <button onClick={(e) => handleStatUpdate(e, post._id, 'hard')} className={`flex items-center justify-between p-3.5 rounded-2xl border-2 transition-all ${userLevel === 'hard' ? 'border-red-500 bg-white' : 'border-transparent bg-white/50'}`}>
                    <div className="flex items-center gap-2"><span>🔥</span><span className="text-[10px] font-black uppercase text-gray-500">मुश्किल</span></div>
                    <span className="text-[11px] font-black text-red-600">{post.commandStats?.hard || 0}</span>
                  </button>
                  <button onClick={(e) => handleStatUpdate(e, post._id, 'heard')} className={`flex items-center justify-between p-3.5 rounded-2xl border-2 transition-all ${userLevel === 'heard' ? 'border-orange-400 bg-white' : 'border-transparent bg-white/50'}`}>
                    <div className="flex items-center gap-2"><span>👂</span><span className="text-[10px] font-black uppercase text-gray-500">सुना है</span></div>
                    <span className="text-[11px] font-black text-orange-500">{post.commandStats?.heard || 0}</span>
                  </button>
                  <button onClick={(e) => handleStatUpdate(e, post._id, 'dailyUse')} className={`flex items-center justify-between p-3.5 rounded-2xl border-2 transition-all ${userLevel === 'dailyUse' ? 'border-blue-500 bg-white' : 'border-transparent bg-white/50'}`}>
                    <div className="flex items-center gap-2"><span>💬</span><span className="text-[10px] font-black uppercase text-gray-500">रोज़ाना</span></div>
                    <span className="text-[11px] font-black text-blue-600">{post.commandStats?.dailyUse || 0}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {selectedPostForComments && <CommentModal post={selectedPostForComments} userEmail={userEmail} API_URL={API_URL} onClose={() => setSelectedPostForComments(null)} onRefresh={fetchPosts} />}
    </div>
  );
}