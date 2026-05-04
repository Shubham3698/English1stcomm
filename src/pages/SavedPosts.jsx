import React, { useState, useEffect, useRef } from "react";
import toast from 'react-hot-toast';
import CommentModal from "../components/CommentModal"; 

// --- Swiper Core Imports ---
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules'; 
import 'swiper/css';
import 'swiper/css/pagination';

export default function SavedPosts() {
  const [dbPosts, setDbPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(null); 
  const [selectedPostForComments, setSelectedPostForComments] = useState(null);
  
  const [playingIndex, setPlayingIndex] = useState({}); 
  const [currentSlideIdx, setCurrentSlideIdx] = useState({});
  const swiperRefs = useRef({}); 
  
  const userEmail = localStorage.getItem("eng_userEmail");

  const API_URL = window.location.hostname === "localhost" 
    ? "http://localhost:3000" : "https://serdeptry1st.onrender.com";

  const fetchSavedPosts = async () => {
    if (!userEmail) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/english-posts/saved-posts?email=${userEmail}`);
      const data = await res.json();
      setDbPosts(Array.isArray(data) ? data : []);
    } catch (err) { 
      console.error(err);
      toast.error("Saved items load nahi hue! 🥺");
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { fetchSavedPosts(); }, []);

  const handleUnsavePost = async (e, postId) => {
    if (e) e.stopPropagation();
    if (!userEmail) return;

    toast((t) => (
      <div className="flex flex-col gap-3 min-w-[220px] p-1 text-black font-sans">
        <div className="flex items-center gap-2">
          <span className="text-xl">📤</span>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Confirmation</span>
            <span className="text-[13px] font-black text-gray-800">Remove from Vault?</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={async () => { 
              toast.dismiss(t.id); 
              try {
                const res = await fetch(`${API_URL}/api/english-posts/save/${postId}`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email: userEmail })
                });
                if (res.ok) {
                  toast.success("Removed! ♻️");
                  fetchSavedPosts(); 
                }
              } catch (err) { toast.error("Unsave failed!"); }
            }} className="flex-1 bg-black text-white py-2 rounded-xl text-[10px] font-black uppercase active:scale-95">Yes, Remove</button>
          <button onClick={() => toast.dismiss(t.id)} className="flex-1 bg-gray-100 text-gray-400 py-2 rounded-xl text-[10px] font-black uppercase">Cancel</button>
        </div>
      </div>
    ), { duration: 6000, style: { borderRadius: '24px' } });
  };

  const handleShare = async (post) => {
    const shareUrl = `${window.location.origin}/community?postId=${post._id}`;
    const shareData = {
      title: `Check out: ${post.word}`,
      text: `Bhai, ye word dekh: "${post.word}" (${post.meaning}).🔥 Seekh le kaam aayega!`,
      url: shareUrl,
    };
    try {
      if (navigator.share) { await navigator.share(shareData); } 
      else {
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        toast.success("Link copied! 📋");
      }
    } catch (err) { console.error("Share failed", err); }
  };

  const renderMedia = (post) => {
    const mediaItems = post.media && post.media.length > 0 
      ? post.media : [{ type: 'image', url: post.image }];

    const hasMultipleItems = mediaItems.length > 1;
    const currentIdx = currentSlideIdx[post._id] || 0;
    const currentItem = mediaItems[currentIdx];
    const isVideoPlaying = playingIndex[post._id] === currentIdx;
    const showNavButtons = hasMultipleItems && currentItem.type === 'embed' && isVideoPlaying;

    return (
      <div className="relative group w-full h-[600px] font-sans"> 
        {showNavButtons && (
          <>
            <button onClick={() => swiperRefs.current[post._id]?.slidePrev()} className="absolute left-4 top-1/2 -translate-y-1/2 z-[10001] w-11 h-11 bg-black/60 border border-white/20 text-white rounded-full flex items-center justify-center backdrop-blur-md shadow-2xl active:scale-90">→</button>
            <button onClick={() => swiperRefs.current[post._id]?.slideNext()} className="absolute right-4 top-1/2 -translate-y-1/2 z-[10001] w-11 h-11 bg-black/60 border border-white/20 text-white rounded-full flex items-center justify-center backdrop-blur-md shadow-2xl active:scale-90">→</button>
          </>
        )}
        <Swiper 
          onSwiper={(swiper) => (swiperRefs.current[post._id] = swiper)}
          modules={[Pagination]} 
          pagination={hasMultipleItems ? { clickable: true, dynamicBullets: true } : false} 
          className="w-full h-full bg-black saved-swiper"
          onSlideChange={(swiper) => {
            setCurrentSlideIdx({ ...currentSlideIdx, [post._id]: swiper.activeIndex });
            const newPlaying = { ...playingIndex };
            delete newPlaying[post._id];
            setPlayingIndex(newPlaying);
          }}
        >
          {mediaItems.map((item, idx) => {
            let videoId = "";
            if (item.type === 'embed') {
              videoId = item.url.includes('v=') ? item.url.split('v=')[1]?.split('&')[0] : item.url.split('/').pop();
            }
            const isPlaying = playingIndex[post._id] === idx;
            return (
              <SwiperSlide key={idx} className="bg-black relative">
                <div className="w-full h-full flex items-center justify-center overflow-hidden relative">
                  {item.type === 'video' ? (
                    <video src={item.url} className="w-full h-auto max-h-full object-cover" controls playsInline />
                  ) : item.type === 'embed' ? (
                    <div className="w-full h-full relative bg-black">
                      {isPlaying ? (
                        <iframe className="w-full h-full border-0" src={`${item.url.replace('watch?v=', 'embed/')}?autoplay=1&rel=0`} allow="autoplay; encrypted-media" allowFullScreen></iframe>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center cursor-pointer" onClick={() => setPlayingIndex({...playingIndex, [post._id]: idx})}>
                          <img src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`} className="w-full h-full object-cover opacity-60" alt="thumb" />
                          <div className="absolute w-20 h-20 bg-red-600 rounded-full flex items-center justify-center shadow-2xl active:scale-90">▶</div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <img src={item.url} className="w-full h-auto max-h-full object-cover" alt="content" />
                  )}
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    );
  };

  if (loading) return <div className="flex justify-center p-20 animate-pulse font-black text-slate-300 uppercase italic text-sm text-center">Opening Vault...</div>;

  return (
    <div className="flex justify-center bg-white min-h-screen font-sans">
      <div className="w-full max-w-[450px]">
        
        <div className="px-6 py-8 border-b border-gray-100 mb-6">
          <div className="flex items-center gap-3">
             <span className="text-3xl">📥</span>
             <div className="flex flex-col">
                <h2 className="text-2xl font-black italic uppercase leading-none text-gray-900 tracking-tighter">My Saved Vault</h2>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Total: {dbPosts.length} Items</span>
             </div>
          </div>
        </div>

        {dbPosts.length === 0 ? (
          <div className="p-10 text-center flex flex-col items-center gap-5">
            <span className="text-6xl grayscale opacity-50">😅</span>
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest leading-relaxed">Bhai, pehle Community Post mein jake kuch save toh karo!</p>
          </div>
        ) : (
          dbPosts.map((post) => {
            const isOpen = activeIndex === post._id;
            const userLevel = post.userStats?.find(v => v.email === userEmail)?.level;

            return (
              <div key={post._id} id={post._id} className="mb-12 border-b border-gray-100 pb-6 relative">
                
                <div className="flex items-center px-4 py-3 gap-3">
                  <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-[10px] font-black text-white">{post.userEmail?.charAt(0).toUpperCase()}</div>
                  <span className="text-[11px] font-black text-gray-800 italic">{post.userEmail?.split('@')[0]}</span>
                </div>

                <div className="relative w-full bg-gray-50 overflow-hidden">
                  {renderMedia(post)}
                </div>

                <div className="flex items-center gap-5 px-5 pt-5 text-black">
                  <button onClick={() => setSelectedPostForComments(post)} className="active:scale-125 transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785 0 0 0 .19.08c.957.1 1.954.02 2.894-.21a1.2 1.2 0 0 1 1.008.204 9.07 9.07 0 0 0 2.972.524z" /></svg>
                  </button>
                  <button onClick={() => handleShare(post)} className="active:scale-125 transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0-10.628a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5m0 10.628a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5" /></svg>
                  </button>

                  <div className="ml-auto flex items-center gap-4">
                    <button onClick={(e) => handleUnsavePost(e, post._id)} className="transition-transform active:scale-125 text-black hover:text-red-500">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="black" viewBox="0 0 24 24" strokeWidth={1.5} stroke="black" className="w-7 h-7">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                      </svg>
                    </button>
                    <button onClick={() => setActiveIndex(isOpen ? null : post._id)}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill={isOpen ? "#3b82f6" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke={isOpen ? "#3b82f6" : "currentColor"} className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h.187c.306 0 .599.124.815.347l1.17 1.201 2.203-2.58a.513.513 0 01.384-.184h.345c.302 0 .594.12.809.33l2.127 2.083 3.578-7.352a.511.511 0 01.462-.286h.348c.302 0 .593.12.808.33l3.564 3.476c.247.242.387.577.387.926v3.97c0 .622-.504 1.125-1.125 1.125h-17.25c-.621 0-1.125-.503-1.125-1.125v-3.97z" /></svg>
                    </button>
                  </div>
                </div>

                <div className="px-5 py-4">
                  <p className="text-[12px] font-black text-gray-400 mb-2 italic">🔥 {post.voteCount || 0} Likes</p>
                  <div className="flex flex-col gap-1">
                    <h2 className="text-5xl font-black text-gray-900 uppercase tracking-tighter italic">{post.word}</h2>
                    <p className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent italic">{post.meaning}</p>
                  </div>
                  <p onClick={() => setSelectedPostForComments(post)} className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-5 cursor-pointer hover:text-black">
                    {post.comments && post.comments.length > 0 ? `View all ${post.comments.length} comments` : "View details..."}
                  </p>
                </div>

                {/* 🔥 Yahan Fixed: Charo Status Boxes Add Kar Diye Hain */}
                <div className={`px-4 mt-2 overflow-hidden transition-all duration-500 ${isOpen ? "max-h-60" : "max-h-0"}`}>
                  <div className="bg-gray-50/50 rounded-[2rem] p-4 grid grid-cols-2 gap-3 border border-gray-100">
                    <div className={`flex items-center justify-between p-3.5 rounded-2xl border-2 transition-all ${userLevel === 'easy' ? 'border-green-500 bg-white' : 'border-transparent bg-white/50'}`}>
                      <div className="flex items-center gap-2"><span>✅</span><span className="text-[10px] font-black uppercase text-gray-500">आसान</span></div>
                      <span className="text-[11px] font-black text-green-600">{post.commandStats?.easy || 0}</span>
                    </div>
                    <div className={`flex items-center justify-between p-3.5 rounded-2xl border-2 transition-all ${userLevel === 'hard' ? 'border-red-500 bg-white' : 'border-transparent bg-white/50'}`}>
                      <div className="flex items-center gap-2"><span>🔥</span><span className="text-[10px] font-black uppercase text-gray-500">एकदम नया</span></div>
                      <span className="text-[11px] font-black text-red-600">{post.commandStats?.hard || 0}</span>
                    </div>
                    <div className={`flex items-center justify-between p-3.5 rounded-2xl border-2 transition-all ${userLevel === 'heard' ? 'border-orange-400 bg-white' : 'border-transparent bg-white/50'}`}>
                      <div className="flex items-center gap-2"><span>👂</span><span className="text-[10px] font-black uppercase text-gray-500">सुना है</span></div>
                      <span className="text-[11px] font-black text-orange-500">{post.commandStats?.heard || 0}</span>
                    </div>
                    <div className={`flex items-center justify-between p-3.5 rounded-2xl border-2 transition-all ${userLevel === 'dailyUse' ? 'border-blue-500 bg-white' : 'border-transparent bg-white/50'}`}>
                      <div className="flex items-center gap-2"><span>💬</span><span className="text-[10px] font-black uppercase text-gray-500">रोज़ाना</span></div>
                      <span className="text-[11px] font-black text-blue-600">{post.commandStats?.dailyUse || 0}</span>
                    </div>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>
      {selectedPostForComments && <CommentModal post={selectedPostForComments} userEmail={userEmail} API_URL={API_URL} onClose={() => setSelectedPostForComments(null)} onRefresh={fetchSavedPosts} />}
    </div>
  );
}