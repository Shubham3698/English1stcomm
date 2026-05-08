import React, { useState, useRef, useEffect } from "react";
import toast from 'react-hot-toast';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules'; 
import { useSearchParams } from "react-router-dom";
import 'swiper/css';
import 'swiper/css/pagination';
import CommentModal from "./CommentModal"; 
import PremiumSoundFeature from "./PremiumSoundFeature"; 

/**
 * PostCard Component
 * UI Match: Screenshot 2026-05-09 040633.png
 * Features: Multimedia Deck, Word Counter (e.g., 3/7), YT Shorts Nav, Word Chips, Stat Tracking
 */
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
  // --- 1. CORE STATES ---
  const [showComments, setShowComments] = useState(false);
  const [currentVocabIdx, setCurrentVocabIdx] = useState(0); 
  const [playingIndex, setPlayingIndex] = useState({}); 
  const [searchParams] = useSearchParams(); 
  const swiperRef = useRef(null);
  const cardRef = useRef(null); 

  const isOpen = activeIndex === post._id;

  // --- 2. MULTIMEDIA & DECK MAPPING ---
  const deck = post.vocabData && post.vocabData.length > 0 
    ? post.vocabData 
    : [{ 
        _id: post._id, 
        word: post.word, 
        meaning: post.meaning, 
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

  // --- 3. AUTO-SWIPE & SCROLL LOGIC ---
  useEffect(() => {
    const urlPostId = searchParams.get("postId");
    const urlHighlight = searchParams.get("highlight");
    const targetWord = propHighlight || (urlPostId === post._id ? urlHighlight : null);

    if (targetWord) {
      const targetIdx = deck.findIndex(v => v.word.toLowerCase() === targetWord.toLowerCase());
      if (targetIdx !== -1) {
        const firstSlideOfWord = slideToVocabMap.indexOf(targetIdx);
        if (firstSlideOfWord !== -1) {
          setTimeout(() => {
            swiperRef.current?.slideTo(firstSlideOfWord, 500);
            setCurrentVocabIdx(targetIdx);
            if (propHighlight || urlPostId === post._id) {
              cardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
            }
          }, 600);
        }
      }
    }
  }, [propHighlight, searchParams, post._id, deck, slideToVocabMap]);

  const currentVocab = deck[currentVocabIdx] || deck[0];
  const isSaved = post.savedBy?.includes(userEmail); 
  const isVoted = currentVocab.votedBy?.includes(userEmail); 
  const userLevel = currentVocab.wordStats?.find((v) => v.email === userEmail)?.level; 

  // --- 4. ACTION HANDLERS ---
  const handleWordSelect = (idx) => {
    const firstSlideOfWord = slideToVocabMap.indexOf(idx);
    if (firstSlideOfWord !== -1) {
      swiperRef.current?.slideTo(firstSlideOfWord);
      setCurrentVocabIdx(idx);
    }
  };

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

  const handleShare = async () => {
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
  const renderMediaInternal = () => {
    const activeSlide = swiperRef.current?.activeIndex || 0;
    const currentItem = mediaItems[activeSlide];
    const isShortsPlaying = currentItem?.url?.includes('shorts/') && playingIndex[post._id] !== undefined;

    return (
      <div className="relative group w-full aspect-[3/4] bg-black rounded-xl overflow-hidden border border-white/5 shadow-inner">
        
        {/* 🔥 NEW: Word Count Indicator (e.g., 3/7 Word) */}
        <div className="absolute top-3 right-3 z-[70] bg-black/40 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full pointer-events-none shadow-xl transition-opacity duration-300">
          <p className="text-[9px] font-black text-white/90 uppercase tracking-widest italic">
            {currentVocabIdx + 1}/{deck.length} Word
          </p>
        </div>

        {/* Manual Nav Buttons for Playing Shorts */}
        {mediaItems.length > 1 && isShortsPlaying && (
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-2 z-[60] pointer-events-none">
            <button onClick={(e) => { e.stopPropagation(); swiperRef.current?.slidePrev(); }} className="pointer-events-auto w-8 h-8 bg-black/40 rounded-full flex items-center justify-center text-white backdrop-blur-sm active:scale-90"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" /></svg></button>
            <button onClick={(e) => { e.stopPropagation(); swiperRef.current?.slideNext(); }} className="pointer-events-auto w-8 h-8 bg-black/40 rounded-full flex items-center justify-center text-white backdrop-blur-sm active:scale-90"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg></button>
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
            let videoId = ""; let isShorts = false; let finalUrl = item.url;
            if (item.type === 'embed' || item.url.includes('youtube')) {
              if (item.url.includes('shorts/')) { videoId = item.url.split('shorts/')[1]?.split(/[?&]/)[0]; isShorts = true; }
              else if (item.url.includes('v=')) { videoId = item.url.split('v=')[1]?.split('&')[0]; }
              else if (item.url.includes('youtu.be/')) { videoId = item.url.split('youtu.be/')[1]?.split(/[?&]/)[0]; }
              finalUrl = `https://www.youtube.com/embed/${videoId}`;
            }
            const isPlaying = playingIndex[post._id] === idx;
            return (
              <SwiperSlide key={idx} className="bg-black flex items-center justify-center">
                {item.type === 'video' ? (
                  <video src={item.url} className="w-full h-full object-contain" controls playsInline onPlay={() => setPlayingIndex({[post._id]: idx})} />
                ) : (videoId) ? (
                  <div className="w-full h-full">
                    {isPlaying ? (
                      <iframe className={`w-full ${isShorts ? 'h-full' : 'aspect-video'} border-0`} src={`${finalUrl}?autoplay=1&rel=0`} allow="autoplay" allowFullScreen></iframe>
                    ) : (
                      <div className="relative w-full h-full flex items-center justify-center cursor-pointer" onClick={() => setPlayingIndex({[post._id]: idx})}>
                        <img src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`} className="w-full h-full object-contain opacity-50" alt="thumb" />
                        <div className="absolute w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-2xl"><svg viewBox="0 0 24 24" fill="white" className="w-6 h-6"><path d="M8 5v14l11-7z" /></svg></div>
                      </div>
                    )}
                  </div>
                ) : (
                  <img src={item.url} className="w-full h-full object-contain" alt="content" />
                )}
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    );
  };

  // --- 6. FINAL UI RENDER ---
  return (
    <div ref={cardRef} id={post._id} className="mb-8 mx-auto max-w-[380px] overflow-hidden bg-[#0d0d0f] border border-[#1f1f22] rounded-2xl shadow-2xl transition-all duration-500 font-sans">
      
      {/* 1. HEADER (Exact UI Match) */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#121215] border-b border-[#1f1f22]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[#4f46e5] flex items-center justify-center text-[10px] font-black text-white uppercase shadow-lg">
            {post.userEmail?.charAt(0)}
          </div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            {post.userEmail?.split("@")[0]}
          </span>
        </div>
        <span className="text-[7px] bg-[#1a1a1d] border border-white/5 px-2 py-0.5 rounded text-gray-600 font-black uppercase">
          {post.badgeName || "NORMAL"}
        </span>
      </div>

      {/* 2. MEDIA DECK */}
      <div className="p-1.5 relative" onDoubleClick={handleVote}>
        {renderMediaInternal()}
      </div>

      {/* 3. WORD CHIPS NAVIGATION (UX Enhanced) */}
      {deck.length > 1 && (
        <div className="flex gap-1.5 px-4 py-1.5 overflow-x-auto no-scrollbar">
          {deck.map((item, idx) => (
            <button 
              key={idx} 
              onClick={() => handleWordSelect(idx)} 
              className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all border 
                ${currentVocabIdx === idx 
                  ? "bg-[#1a1a1d] border-[#3b82f6] text-[#3b82f6] shadow-[0_0_10px_rgba(59,130,246,0.1)]" 
                  : "bg-transparent border-white/5 text-gray-600"}`}
            >
              {item.word}
            </button>
          ))}
        </div>
      )}

      {/* 4. WORD INFO & SOUND */}
      <div className="px-5 pt-4 pb-2">
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <h2 className="text-3xl font-black text-white uppercase italic leading-none tracking-tighter">
              {currentVocab.word}
            </h2>
            <div className="h-[2px] w-12 bg-[#fbbf24] mt-2"></div>
          </div>
          <div className="relative">
            <PremiumSoundFeature isPremiumUser={isPremiumUser}>
              <button onClick={() => speakWord(currentVocab.word)} className="w-10 h-10 rounded-xl bg-[#1a1a1d] border border-white/5 flex items-center justify-center text-gray-500 hover:text-white transition-all shadow-md active:scale-90">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.5A2.25 2.25 0 002.25 9.75v4.5a2.25 2.25 0 002.25 2.25h1.94l4.5 4.5c.944.945 2.56.276 2.56-1.06V4.06z" /></svg>
              </button>
            </PremiumSoundFeature>
            {!isPremiumUser && <div className="absolute -top-1 -right-1 w-4 h-4 bg-black/80 rounded-full flex items-center justify-center border border-white/10"><svg className="w-2 h-2 text-gray-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 15a3 3 0 100-6 3 3 0 000 6zm5.83-6.23a8 8 0 11-11.66 0 8 8 0 0111.66 0z" /></svg></div>}
          </div>
        </div>
        <p className="text-sm font-bold text-gray-500 italic mt-3 leading-relaxed">
          {currentVocab.meaning}
        </p>
      </div>

      {/* 5. PRIMARY ACTIONS (Balanced) */}
      <div className="px-4 py-3 flex items-center gap-2">
        <button onClick={handleVote} className={`flex-[1.1] flex items-center justify-center gap-2 py-3.5 rounded-xl font-black text-xs uppercase transition-all shadow-lg active:scale-95 ${isVoted ? "bg-[#ef4444] text-white" : "bg-[#1a1a1d] text-gray-500 border border-white/5"}`}>
          <svg className="w-4 h-4" fill={isVoted ? "white" : "none"} stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>
          <span className="tracking-tighter">{currentVocab.voteCount || 0}</span>
        </button>

        <button onClick={handleShare} className="flex-[1.8] py-3.5 rounded-xl bg-[#1a1a1d] border border-white/5 font-black text-[10px] uppercase text-gray-400 tracking-[0.2em] shadow-lg active:bg-neutral-800 transition-all">
          SHARE
        </button>

        <button onClick={handleSavePost} className={`w-12 h-[52px] flex items-center justify-center rounded-xl border transition-all active:scale-90 ${isSaved ? "bg-white text-black" : "bg-[#1a1a1d] border-white/5 text-gray-500 shadow-lg"}`}>
          <svg className="w-5 h-5" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" /></svg>
        </button>
        <button onClick={() => setActiveIndex(isOpen ? null : post._id)} className={`w-12 h-[52px] flex items-center justify-center rounded-xl transition-all shadow-lg active:scale-95 ${isOpen ? "bg-[#2563eb] text-white" : "bg-[#3b82f6] text-white"}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
        </button>
      </div>

      {/* 6. STATS PANEL */}
      <div className={`px-4 transition-all duration-500 overflow-hidden ${isOpen ? "max-h-[250px] mb-4 opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {['easy', 'hard', 'heard', 'dailyUse'].map((lvl) => (
            <button key={lvl} onClick={(e) => handleStatUpdate(e, lvl)} className={`flex items-center justify-between p-3.5 rounded-xl bg-[#141417] border transition-all ${userLevel === lvl ? "border-yellow-500/50 shadow-[0_0_15px_rgba(251,191,36,0.1)]" : "border-white/5"}`}>
              <span className="text-[9.5px] font-black uppercase text-gray-500 tracking-tighter">{lvl}</span>
              <span className="text-[11px] font-black text-white">{currentVocab.commandStats?.[lvl] || 0}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 7. FOOTER */}
      <div className="pb-6 text-center mt-2">
        <button onClick={() => setShowComments(true)} className="text-[8.5px] font-black text-gray-500 uppercase tracking-[0.25em] border-b border-gray-800 pb-0.5 hover:text-white transition-all">
          COMMENTS ({post.comments?.length || 0})
        </button>
      </div>

      {showComments && <CommentModal post={post} userEmail={userEmail} API_URL={API_URL} onClose={() => setShowComments(false)} onRefresh={onRefresh} />}
    </div>
  );
}