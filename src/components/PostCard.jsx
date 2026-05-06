import React, { useState, useRef, useEffect } from "react";
import toast from 'react-hot-toast';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules'; 
import 'swiper/css';
import 'swiper/css/pagination';
import CommentModal from "./CommentModal"; 
// 🔥 Import the new sound feature component
import PremiumSoundFeature from "./PremiumSoundFeature"; 

export default function PostCard({ 
  post, 
  userEmail, 
  isPremiumUser, 
  activeIndex, 
  setActiveIndex, 
  onRefresh, 
  API_URL 
}) {
  const [showComments, setShowComments] = useState(false);
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);
  const [playingIndex, setPlayingIndex] = useState({}); 
  const swiperRef = useRef(null);

  const isVoted = post.votedBy?.includes(userEmail);
  const isSaved = post.savedBy?.includes(userEmail);
  const isOpen = activeIndex === post._id;
  const userLevel = post.userStats?.find((v) => v.email === userEmail)?.level;

  // ==========================================
  // 🛠️ INTERNAL HANDLERS
  // ==========================================

  const handleVote = async (e) => {
    if (e) e.stopPropagation();
    if (!userEmail) return toast.error("Bhai login karo! 😅");
    try {
      const res = await fetch(`${API_URL}/api/english-posts/vote/${post._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail })
      });
      if (res.ok) onRefresh(); 
    } catch (err) { toast.error("Error voting!"); }
  };

  const handleSavePost = async (e) => {
    if (e) e.stopPropagation();
    if (!userEmail) return toast.error("Bhai, login bina save nahi hoga! 💾");
    try {
      const res = await fetch(`${API_URL}/api/english-posts/save/${post._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail })
      });
      if (res.ok) {
        const data = await res.json();
        toast.success(data.isSaved ? "Post Saved! 📥" : "Removed from Vault! 📤");
        onRefresh();
      }
    } catch (err) { toast.error("Network check karo bhai!"); }
  };

  const handleStatUpdate = async (e, level) => {
    if (e) e.stopPropagation();
    if (!userEmail) return toast.error("Login first! 🔑");
    try {
      const res = await fetch(`${API_URL}/api/english-posts/update-stat/${post._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level, email: userEmail, nextReview: null })
      });
      if (res.ok) {
        toast.success(`Marked as ${level.toUpperCase()} ✅`);
        onRefresh();
      }
    } catch (err) { toast.error("Update Failed!"); }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/community?postId=${post._id}`;
    const text = `Bhai, ye word dekh: "${post.word}" (${post.meaning}).🔥 Seekh le kaam aayega!`;
    if (navigator.share) await navigator.share({ title: post.word, text, url: shareUrl });
    else { 
      navigator.clipboard.writeText(`${text} ${shareUrl}`); 
      toast.success("Link Copied! 📋"); 
    }
  };

  // 🗣️ Speak logic (Premium check is now handled by the Wrapper)
  const speakWord = (word) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US'; 
      utterance.rate = 0.8; 
      window.speechSynthesis.speak(utterance);
    }
  };

  const renderMediaInternal = () => {
    const mediaItems = post.media && post.media.length > 0 ? post.media : [{ type: 'image', url: post.image }];
    const hasMultipleItems = mediaItems.length > 1;
    const currentItem = mediaItems[currentSlideIdx];
    const isVideoPlaying = playingIndex[post._id] === currentSlideIdx;
    const showNavButtons = hasMultipleItems && currentItem?.type === 'embed' && isVideoPlaying;

    return (
      <div className="relative group w-full h-[600px]">
        <style>{`
          .community-swiper .swiper-pagination-bullet { background: white !important; opacity: 0.6; }
          .community-swiper .swiper-pagination-bullet-active { background: #ef4444 !important; opacity: 1; }
          .community-swiper .swiper-pagination { z-index: 10000 !important; bottom: 20px !important; }
        `}</style>

        {showNavButtons && (
          <>
            <button onClick={() => swiperRef.current?.slidePrev()} className="absolute left-4 top-1/2 -translate-y-1/2 z-[10001] w-11 h-11 bg-black/60 border border-white/20 text-white rounded-full flex items-center justify-center backdrop-blur-md active:scale-90 transition-all shadow-2xl">←</button>
            <button onClick={() => swiperRef.current?.slideNext()} className="absolute right-4 top-1/2 -translate-y-1/2 z-[10001] w-11 h-11 bg-black/60 border border-white/20 text-white rounded-full flex items-center justify-center backdrop-blur-md active:scale-90 transition-all shadow-2xl">→</button>
          </>
        )}

        <Swiper 
          onSwiper={(swiper) => (swiperRef.current = swiper)}
          modules={[Pagination]} 
          pagination={hasMultipleItems ? { clickable: true, dynamicBullets: true } : false} 
          className="w-full h-full bg-black community-swiper"
          onSlideChange={(swiper) => {
            setCurrentSlideIdx(swiper.activeIndex);
            setPlayingIndex({}); 
          }}
        >
          {mediaItems.map((item, idx) => {
            let finalUrl = item.url;
            let videoId = "";
            let isShorts = false;

            if (item.type === 'embed') {
              if (finalUrl.includes('youtube.com/shorts/')) {
                videoId = finalUrl.split('shorts/')[1]?.split('?')[0]?.split('&')[0];
                isShorts = true;
              } else if (finalUrl.includes('youtube.com/watch?v=')) {
                videoId = finalUrl.split('v=')[1]?.split('&')[0];
              } else if (finalUrl.includes('youtu.be/')) {
                videoId = finalUrl.split('youtu.be/')[1]?.split('?')[0]?.split('&')[0];
              } else if (finalUrl.includes('youtube.com/embed/')) {
                videoId = finalUrl.split('embed/')[1]?.split('?')[0]?.split('&')[0];
              }
              finalUrl = `https://www.youtube.com/embed/${videoId}`;
            }

            const isPlaying = playingIndex[post._id] === idx;

            return (
              <SwiperSlide key={idx} className="bg-black relative">
                <div className="w-full h-full flex items-center justify-center overflow-hidden">
                  {item.type === 'video' ? (
                    <video src={item.url} className="w-full h-auto max-h-full" controls playsInline />
                  ) : item.type === 'embed' ? (
                    <div className={`w-full ${isShorts ? 'h-full' : 'aspect-video'} relative bg-black`}>
                       {isPlaying ? (
                         <iframe 
                           className="w-full h-full border-0" 
                           src={`${finalUrl}?autoplay=1&rel=0&modestbranding=1&origin=${window.location.origin}`} 
                           title="Post Media" 
                           allow="autoplay; encrypted-media; picture-in-picture" 
                           allowFullScreen
                         ></iframe>
                       ) : (
                         <div className="absolute inset-0 flex items-center justify-center cursor-pointer group/play" onClick={() => setPlayingIndex({[post._id]: idx})}>
                           <img 
                             src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`} 
                             onError={(e) => e.target.src = `https://img.youtube.com/vi/${videoId}/0.jpg`}
                             alt="thumb" 
                             className="w-full h-full object-cover opacity-60" 
                           />
                           <div className="absolute w-20 h-20 bg-red-600 rounded-full flex items-center justify-center shadow-2xl">
                             <span className="text-white text-3xl ml-1">▶</span>
                           </div>
                         </div>
                       )}
                    </div>
                  ) : (
                    <img src={item.url} alt="content" className="w-full h-auto max-h-full object-cover" />
                  )}
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    );
  };

  return (
    <div id={post._id} className="mb-12 border-b border-gray-100 pb-6 animate-in fade-in duration-500">
      {/* 👤 User Header */}
      <div className="flex items-center px-4 py-3 gap-3">
        <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-[10px] font-black text-white">
          {post.userEmail?.charAt(0).toUpperCase()}
        </div>
        <span className="text-[11px] font-black text-gray-800 italic">{post.userEmail?.split("@")[0]}</span>
        <span className="text-[9px] ml-auto bg-gray-50 px-3 py-1.5 rounded-full text-gray-400 font-black uppercase tracking-widest border border-gray-100">
          {post.badgeName || "Vocabulary"}
        </span>
      </div>

      {/* 🖼️ Media Content Area */}
      <div className="relative w-full bg-gray-50 overflow-hidden" onDoubleClick={handleVote}>
        {renderMediaInternal()}
      </div>

      {/* ⚡ Action Buttons */}
      <div className="flex items-center gap-5 px-5 pt-5 text-black">
        <button onClick={handleVote} className="transition-transform active:scale-150 duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" fill={isVoted ? "#ef4444" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke={isVoted ? "#ef4444" : "currentColor"} className="w-7 h-7">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </button>

        <button onClick={() => setShowComments(true)} className="transition-transform active:scale-125">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785 0 0 0 .19.08c.957.1 1.954.02 2.894-.21a1.2 1.2 0 0 1 1.008.204 9.07 9.07 0 0 0 2.972.524z" />
          </svg>
        </button>

        <button onClick={handleShare} className="transition-transform active:scale-125">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0-10.628a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5m0 10.628a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5" />
          </svg>
        </button>
        <div className="ml-auto flex items-center gap-4">
          <button onClick={handleSavePost} className="transition-transform active:scale-125">
            <svg xmlns="http://www.w3.org/2000/svg" fill={isSaved ? "black" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
            </svg>
          </button>
          <button onClick={() => setActiveIndex(isOpen ? null : post._id)} className="transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill={isOpen ? "#3b82f6" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke={isOpen ? "#3b82f6" : "currentColor"} className="w-7 h-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h.187c.306 0 .599.124.815.347l1.17 1.201 2.203-2.58a.513.513 0 01.384-.184h.345c.302 0 .594.12.809.33l2.127 2.083 3.578-7.352a.511.511 0 01.462-.286h.348c.302 0 .593.12.808.33l3.564 3.476c.247.242.387.577.387.926v3.97c0 .622-.504 1.125-1.125 1.125h-17.25c-.621 0-1.125-.503-1.125-1.125v-3.97z" />
            </svg>
          </button>
        </div>
      </div>

      {/* 📖 Word Area */}
      <div className="px-5 py-4">
        <p className="text-[12px] font-black text-gray-400 mb-2 italic">🔥 {post.voteCount || 0} Likes</p>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-4">
            <h2 className="text-5xl font-black text-gray-900 uppercase tracking-tighter leading-tight mb-2 italic">{post.word}</h2>
            
            {/* 🔥 Wrapped with PremiumSoundFeature */}
            <PremiumSoundFeature isPremiumUser={isPremiumUser}>
              <button 
                onClick={() => speakWord(post.word)} 
                className="p-2.5 rounded-full bg-red-50 hover:bg-red-100 active:scale-90 transition-all shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-red-600">
                  <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.5A2.25 2.25 0 002.25 9.75v4.5a2.25 2.25 0 002.25 2.25h1.94l4.5 4.5c.944.945 2.56.276 2.56-1.06V4.06zM18.563 6.625a.75.75 0 011.06 0 9 9 0 010 12.75.75.75 0 11-1.06-1.06 7.5 7.5 0 000-10.63.75.75 0 010-1.06zm-3.182 3.182a.75.75 0 011.061 0 4.5 4.5 0 010 6.364.75.75 0 01-1.06-1.06 3 3 0 000-4.242.75.75 0 010-1.062z" />
                </svg>
              </button>
            </PremiumSoundFeature>
          </div>
          <p className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent italic leading-relaxed py-1">{post.meaning}</p>
        </div>
        
        <p onClick={() => setShowComments(true)} className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-5 cursor-pointer hover:text-black">
          {post.comments && post.comments.length > 0 ? `View all ${post.comments.length} comments` : "Add a comment..."}
        </p>
      </div>

      {/* 📊 Stats Section */}
      <div className={`px-4 mt-2 overflow-hidden transition-all duration-500 ${isOpen ? "max-h-60" : "max-h-0"}`}>
        <div className="bg-gray-50/50 rounded-[2rem] p-4 grid grid-cols-2 gap-3 border border-gray-100">
          <button onClick={(e) => handleStatUpdate(e, 'easy')} className={`flex items-center justify-between p-3.5 rounded-2xl border-2 transition-all ${userLevel === 'easy' ? 'border-green-500 bg-white' : 'border-transparent bg-white/50'}`}>
            <div className="flex items-center gap-2"><span>✅</span><span className="text-[10px] font-black uppercase text-gray-500">आसान</span></div>
            <span className="text-[11px] font-black text-green-600">{post.commandStats?.easy || 0}</span>
          </button>
          <button onClick={(e) => handleStatUpdate(e, 'hard')} className={`flex items-center justify-between p-3.5 rounded-2xl border-2 transition-all ${userLevel === 'hard' ? 'border-red-500 bg-white' : 'border-transparent bg-white/50'}`}>
            <div className="flex items-center gap-2"><span>🔥</span><span className="text-[10px] font-black uppercase text-gray-500">एकदम नया</span></div>
            <span className="text-[11px] font-black text-red-600">{post.commandStats?.hard || 0}</span>
          </button>
          <button onClick={(e) => handleStatUpdate(e, 'heard')} className={`flex items-center justify-between p-3.5 rounded-2xl border-2 transition-all ${userLevel === 'heard' ? 'border-orange-400 bg-white' : 'border-transparent bg-white/50'}`}>
            <div className="flex items-center gap-2"><span>👂</span><span className="text-[10px] font-black uppercase text-gray-500">सुना है</span></div>
            <span className="text-[11px] font-black text-orange-500">{post.commandStats?.heard || 0}</span>
          </button>
          <button onClick={(e) => handleStatUpdate(e, 'dailyUse')} className={`flex items-center justify-between p-3.5 rounded-2xl border-2 transition-all ${userLevel === 'dailyUse' ? 'border-blue-500 bg-white' : 'border-transparent bg-white/50'}`}>
            <div className="flex items-center gap-2"><span>💬</span><span className="text-[10px] font-black uppercase text-gray-500">रोज़ाना</span></div>
            <span className="text-[11px] font-black text-blue-600">{post.commandStats?.dailyUse || 0}</span>
          </button>
        </div>
      </div>

      {showComments && (
        <CommentModal 
          post={post} 
          userEmail={userEmail} 
          API_URL={API_URL} 
          onClose={() => setShowComments(false)} 
          onRefresh={onRefresh} 
        />
      )}
    </div>
  );
}