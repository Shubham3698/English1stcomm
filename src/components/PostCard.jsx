import React, { useState, useRef, useEffect } from "react";
import toast from 'react-hot-toast';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules'; 
import { useSearchParams } from "react-router-dom";
import 'swiper/css';
import 'swiper/css/pagination';
import CommentModal from "./CommentModal"; 
import PremiumSoundFeature from "./PremiumSoundFeature"; 

export default function PostCard({ 
  post, 
  userEmail, 
  isPremiumUser, 
  activeIndex, 
  setActiveIndex, 
  onRefresh, 
  API_URL,
  highlightWord: propHighlight 
}) {
  // --- 1. CORE STATES (RETAINED) ---
  const [showComments, setShowComments] = useState(false);
  const [showStats, setShowStats] = useState(false); // 🔥 Toggles the stats grid
  const [currentVocabIdx, setCurrentVocabIdx] = useState(0); 
  const [playingIndex, setPlayingIndex] = useState({}); 
  const [searchParams] = useSearchParams(); 
  const swiperRef = useRef(null);
  const cardRef = useRef(null); 

  const isExpanded = activeIndex === post._id;

  // --- 2. MULTIMEDIA & DECK MAPPING (RETAINED) ---
  const deck = post.vocabData && post.vocabData.length > 0 
    ? post.vocabData 
    : [{ 
        _id: post._id, 
        word: post.word, 
        meaning: post.meaning, 
        sentence: post.sentence || "", 
        media: post.media || [{type:'image', url: post.image}], 
        wordStats: post.userStats, 
        votedBy: post.votedBy, 
        voteCount: post.voteCount, 
        commandStats: post.commandStats 
      }];

  const slideToVocabMap = [];
  const mediaItems = [];
  deck.forEach((vocab, vIdx) => {
    if (vocab.media && vocab.media.length > 0) {
      vocab.media.forEach((m) => {
        mediaItems.push({ ...m, vocabIndex: vIdx });
        slideToVocabMap.push(vIdx);
      });
    } else {
      mediaItems.push({ type: 'image', url: post.image, vocabIndex: vIdx });
      slideToVocabMap.push(vIdx); 
    }
  });

  // --- 3. LOGIC SYNC (RETAINED) ---
  const handleWordSelect = (idx) => {
    setCurrentVocabIdx(idx);
    const firstSlideOfWord = slideToVocabMap.indexOf(idx);
    if (firstSlideOfWord !== -1 && swiperRef.current) {
      swiperRef.current.slideTo(firstSlideOfWord, 500);
    }
  };

useEffect(() => {
  const urlPostId = searchParams.get("postId");
  const urlHighlight = searchParams.get("highlight");
  
  // 1. Check karo ki kya ye card wahi hai jise scroll karna hai
  if (urlPostId === post._id) {
    const targetWord = propHighlight || urlHighlight;

    if (targetWord) {
      // 2. Deck mein wo word dhoondo
      const targetIdx = deck.findIndex(v => v.word.toLowerCase() === targetWord.toLowerCase());
      
      if (targetIdx !== -1) {
        handleWordSelect(targetIdx); // Word select karo
        setActiveIndex(post._id);    // Card expand karo

        // 3. Scroll logic with a small delay (taaki expansion ke baad scroll ho)
        setTimeout(() => {
          if (cardRef.current) {
            cardRef.current.scrollIntoView({ 
              behavior: "smooth", 
              block: "center" 
            });
            
            // Optional: Chhota sa glow effect dene ke liye
            cardRef.current.style.borderColor = "#3b82f6";
            setTimeout(() => {
              if (cardRef.current) cardRef.current.style.borderColor = "#1f1f22";
            }, 2000);
          }
        }, 800); // 800ms ka delay expansion animation ke liye best hai
      }
    }
  }
}, [searchParams, post._id]); // propHighlight ko dependency se hata sakte ho agar issue kare
  const currentVocab = deck[currentVocabIdx] || deck[0];
  const isSaved = post.savedBy?.includes(userEmail); 
  const isVoted = currentVocab.votedBy?.includes(userEmail); 
  const userLevel = currentVocab.wordStats?.find((v) => v.email === userEmail)?.level; 

  // --- 4. ACTION HANDLERS (RETAINED) ---
  const handleVote = async (e) => {
    if (e) e.stopPropagation();
    if (!userEmail) return toast.error("Bhai login karo! 🔑");
    try {
      const res = await fetch(`${API_URL}/api/english-posts/vote-word/${post._id}/${currentVocab._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail })
      });
      if (res.ok) onRefresh(); 
    } catch (err) { toast.error("Error voting!"); }
  };

  const handleStatUpdate = async (e, level) => {
    if (e) e.stopPropagation();
    if (!userEmail) return toast.error("Login first! 🔑");
    try {
      const res = await fetch(`${API_URL}/api/english-posts/update-word-stat/${post._id}/${currentVocab._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level, email: userEmail })
      });
      if (res.ok) { onRefresh(); toast.success(`${level.toUpperCase()} updated!`); }
    } catch (err) { toast.error("Update Failed!"); }
  };

  const handleSavePost = async (e) => {
    if (e) e.stopPropagation();
    if (!userEmail) return toast.error("Login to save! 💾");
    try {
      const res = await fetch(`${API_URL}/api/english-posts/save/${post._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail })
      });
      if (res.ok) { onRefresh(); toast.success("Vault updated! 📥"); }
    } catch (err) { toast.error("Error saving post!"); }
  };

  const handleShare = async (e) => {
    if (e) e.stopPropagation();
    const wordName = currentVocab.word.replace(/"/g, '');
    const shareUrl = `${window.location.origin}/community?postId=${post._id}&highlight=${encodeURIComponent(wordName)}`;
    if (navigator.share) await navigator.share({ title: wordName, url: shareUrl });
    else { navigator.clipboard.writeText(shareUrl); toast.success("Link Copied! 📋"); }
  };

  const speakWord = (word) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US'; utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  // --- 5. RENDER MEDIA ---
// --- 5. RENDER MEDIA ---
  const renderMediaInternal = () => {
    const activeSlide = swiperRef.current?.activeIndex || 0;
    const currentItem = mediaItems[activeSlide];
    
    // Yahan safe check lagaya hai ?. ke saath
    const isShortsPlaying = currentItem?.url?.includes('shorts/') && playingIndex[post._id] !== undefined;

    return (
      <div className="relative group w-full aspect-[3/4] bg-black rounded-xl overflow-hidden border border-white/5 shadow-inner" onDoubleClick={handleVote}>
        <div className="absolute top-3 right-3 z-[70] bg-black/40 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full pointer-events-none shadow-xl">
          <p className="text-[9px] font-black text-white/90 uppercase tracking-widest italic">{currentVocabIdx + 1}/{deck.length} Word</p>
        </div>

        {mediaItems.length > 1 && isShortsPlaying && (
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-2 z-[60] pointer-events-none">
            <button onClick={(e) => { e.stopPropagation(); swiperRef.current?.slidePrev(); }} className="pointer-events-auto w-8 h-8 bg-black/40 rounded-full flex items-center justify-center text-white backdrop-blur-sm active:scale-90"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="3" /></svg></button>
            <button onClick={(e) => { e.stopPropagation(); swiperRef.current?.slideNext(); }} className="pointer-events-auto w-8 h-8 bg-black/40 rounded-full flex items-center justify-center text-white backdrop-blur-sm active:scale-90"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth="3" /></svg></button>
          </div>
        )}

        <Swiper 
          onSwiper={(s) => (swiperRef.current = s)}
          modules={[Pagination]} 
          pagination={mediaItems.length > 1 ? { clickable: true } : false} 
          onSlideChange={(s) => {
            const item = mediaItems[s.activeIndex];
            if (item) setCurrentVocabIdx(item.vocabIndex);
            setPlayingIndex({});
          }}
          className="w-full h-full"
        >
          {mediaItems.map((item, idx) => {
            let videoId = "";
            
            // 🔥 Yahan tha main error! item.url ko pehle check karna zaroori hai
            if (item?.url && (item.url.includes('youtube') || item.url.includes('youtu.be'))) {
              videoId = item.url.includes('shorts/') 
                ? item.url.split('shorts/')[1]?.split(/[?&]/)[0] 
                : item.url.split('v=')[1]?.split('&')[0];
            }
            
            const isPlaying = playingIndex[post._id] === idx;
            
            return (
              <SwiperSlide key={idx} className="bg-black flex items-center justify-center">
                {item?.type === 'video' ? (
                  <video src={item.url} className="w-full h-full object-contain" controls playsInline onPlay={() => setPlayingIndex({[post._id]: idx})} />
                ) : (videoId) ? (
                  <div className="w-full h-full">
                    {isPlaying ? (
                      <iframe className="w-full h-full border-0" src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`} allow="autoplay" allowFullScreen></iframe>
                    ) : (
                      <div className="relative w-full h-full flex items-center justify-center cursor-pointer" onClick={() => setPlayingIndex({[post._id]: idx})}>
                        <img src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`} className="w-full h-full object-contain opacity-50" />
                        <div className="absolute w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-2xl"><svg viewBox="0 0 24 24" fill="white" className="w-6 h-6"><path d="M8 5v14l11-7z" /></svg></div>
                      </div>
                    )}
                  </div>
                ) : (
                  // Safe check for image URL
                  <img src={item?.url || post.image} className="w-full h-full object-contain" alt="content" />
                )}
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    );
  };
  // --- 6. FINAL LAYOUT ---
  return (
    <div ref={cardRef} id={post._id} className="mb-8 mx-auto max-w-[380px] overflow-hidden bg-[#0d0d0f] border border-[#1f1f22] rounded-2xl shadow-2xl transition-all duration-500 font-sans">
      
      {/* 1. Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-[#121215] border-b border-[#1f1f22]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[#4f46e5] flex items-center justify-center text-[10px] font-black text-white uppercase shadow-lg">
            {post.userEmail?.charAt(0)}
          </div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{post.userEmail?.split("@")[0]}</span>
        </div>
        <span className="text-[7px] bg-[#1a1a1d] border border-white/5 px-2 py-0.5 rounded text-gray-600 font-black uppercase tracking-widest">{post.badgeName || "NORMAL"}</span>
      </div>

      {/* 2. Media Deck (Expanded State only) */}
      <div className={`transition-all duration-700 ease-in-out overflow-hidden ${isExpanded ? "max-h-[500px] opacity-100 p-2" : "max-h-0 opacity-0"}`}>
        {renderMediaInternal()}
      </div>

      {/* 3. Word Pills Navigation (Retained) */}
      {deck.length > 1 && (
        <div className="flex gap-1.5 px-5 py-3 overflow-x-auto no-scrollbar">
          {deck.map((item, idx) => (
            <button key={idx} onClick={(e) => { e.stopPropagation(); handleWordSelect(idx); }} className={`whitespace-nowrap px-3.5 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest border transition-all ${currentVocabIdx === idx ? "bg-blue-600 border-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.3)]" : "bg-transparent border-white/5 text-gray-600"}`}>{item.word}</button>
          ))}
        </div>
      )}

      {/* 4. Main Focus Area (Click to Expand Stage 2) */}
      <div onClick={() => { setActiveIndex(isExpanded ? null : post._id); setShowStats(false); }} className="px-6 pt-2 pb-4 cursor-pointer group">
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <h2 className="text-4xl font-black text-white uppercase italic leading-none tracking-tighter group-hover:text-blue-500 transition-colors">{currentVocab.word}</h2>
            <div className="h-[2px] w-12 bg-[#fbbf24] mt-2 mb-2"></div>
            <p className="text-xl font-bold text-gray-400 italic leading-relaxed">{currentVocab.meaning}</p>
          </div>
          <PremiumSoundFeature isPremiumUser={isPremiumUser}>
            <button onClick={(e) => { e.stopPropagation(); speakWord(currentVocab.word); }} className="w-11 h-11 rounded-xl bg-[#1a1a1d] border border-white/5 flex items-center justify-center text-gray-500 active:scale-90 transition-all hover:text-white shadow-lg">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.5A2.25 2.25 0 002.25 9.75v4.5a2.25 2.25 0 002.25 2.25h1.94l4.5 4.5c.944.945 2.56.276 2.56-1.06V4.06z" /></svg>
            </button>
          </PremiumSoundFeature>
        </div>
        {currentVocab.sentence && (
          <div className="bg-[#141417] border-l-4 border-[#fbbf24] p-3.5 rounded-r-xl my-3 shadow-inner">
            <p className="text-[12px] font-black text-white/90 italic leading-relaxed">
              "{currentVocab.sentence}"
            </p>
          </div>
        )}
      </div>

      {/* 5. Primary Actions & Stats (Stage 2 & 3 Combined) */}
      <div className={`transition-all duration-500 overflow-hidden ${isExpanded ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="px-5 py-3 flex items-center gap-2 border-t border-white/5">
          <button onClick={handleVote} className={`flex-[1.1] flex items-center justify-center gap-2 py-4 rounded-xl font-black text-xs uppercase shadow-lg active:scale-95 transition-all ${isVoted ? "bg-[#ef4444] text-white" : "bg-[#1a1a1d] text-gray-500 border border-white/5"}`}>
            <svg className="w-4 h-4" fill={isVoted ? "white" : "none"} stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>
            <span className="tracking-tighter">{currentVocab.voteCount || 0}</span>
          </button>
          <button onClick={handleShare} className="flex-[1.8] py-4 rounded-xl bg-[#1a1a1d] border border-white/5 font-black text-[10px] uppercase text-gray-400 tracking-widest shadow-lg active:bg-neutral-800 transition-all">SHARE</button>
          <button onClick={handleSavePost} className={`w-14 h-[56px] flex items-center justify-center rounded-xl border transition-all ${isSaved ? "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]" : "bg-[#1a1a1d] border-white/5 text-gray-500 shadow-lg"}`}><svg className="w-6 h-6" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" /></svg></button>
          
          <button onClick={(e) => { e.stopPropagation(); setShowStats(!showStats); }} className={`w-14 h-[56px] flex items-center justify-center rounded-xl transition-all shadow-lg active:scale-95 ${showStats ? "bg-[#2563eb] text-white" : "bg-[#3b82f6] text-white"}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
          </button>
        </div>

        {/* 6. Stats Panel (Toggled by Blue Button) */}
        <div className={`transition-all duration-500 overflow-hidden ${showStats ? "max-h-[250px] mb-4 opacity-100 px-5" : "max-h-0 opacity-0"}`}>
          <div className="grid grid-cols-2 gap-2 mt-2 pb-5">
            {['easy', 'hard', 'heard', 'dailyUse'].map((lvl) => (
              <button key={lvl} onClick={(e) => handleStatUpdate(e, lvl)} className={`flex items-center justify-between p-3.5 rounded-xl bg-[#141417] border transition-all ${userLevel === lvl ? "border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.1)]" : "border-white/5"}`}>
                <span className="text-[9.5px] font-black uppercase text-gray-500 tracking-tighter">{lvl}</span>
                <span className="text-[11px] font-black text-white">{currentVocab.commandStats?.[lvl] || 0}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 7. Footer - Comments Bar (Always Static) */}
      <div className="pb-8 text-center mt-2 border-t border-white/5 pt-4">
        <button onClick={(e) => { e.stopPropagation(); setShowComments(true); }} className="text-[8.5px] font-black text-gray-500 uppercase tracking-[0.25em] border-b border-white/10 pb-1 hover:text-white transition-all">REACTIONS ({post.comments?.length || 0})</button>
      </div>

      {showComments && <CommentModal post={post} userEmail={userEmail} API_URL={API_URL} onClose={() => setShowComments(false)} onRefresh={onRefresh} />}
    </div>
  );
}