import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import toast from 'react-hot-toast';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, EffectCreative } from 'swiper/modules'; 
import { useSearchParams } from "react-router-dom";

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-creative';

import CommentModal from "./CommentModal"; 
import PremiumSoundFeature from "./PremiumSoundFeature"; 

/**
 * @component PostCard
 * @description Advanced English Vocabulary Card with Deck Support, Multimedia, SRS Stats, and Smart Social Proof.
 * Preservation Level: 100% (Original logic intact) + Performance Optimization.
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
  // --- 1. CORE ENGINE STATES ---
  const [showComments, setShowComments] = useState(false);
  const [showStats, setShowStats] = useState(false); 
  const [currentVocabIdx, setCurrentVocabIdx] = useState(0); 
  const [playingIndex, setPlayingIndex] = useState({}); 
  const [searchParams] = useSearchParams(); 
  const swiperRef = useRef(null);
  const cardRef = useRef(null); 

  // --- SMART COMMENT ENGINE STATES ---
  const [activeCommentIdx, setActiveCommentIdx] = useState(0);
  const [commentFade, setCommentFade] = useState(true);

  const isExpanded = activeIndex === post._id;

  // --- 2. DECK & MEDIA NORMALIZATION ---
  const deck = useMemo(() => {
    return post.vocabData && post.vocabData.length > 0 
      ? post.vocabData 
      : [{ 
          _id: post._id, 
          word: post.word, 
          meaning: post.meaning, 
          sentence: post.sentence || "", 
          media: post.media || (post.image ? [{type:'image', url: post.image}] : []), 
          wordStats: post.userStats, 
          votedBy: post.votedBy, 
          voteCount: post.voteCount, 
          commandStats: post.commandStats 
        }];
  }, [post]);

  const { mediaItems, slideToVocabMap } = useMemo(() => {
    const items = [];
    const map = [];
    deck.forEach((vocab, vIdx) => {
      if (vocab.media && vocab.media.length > 0) {
        vocab.media.forEach((m) => {
          if(m.url) {
            items.push({ ...m, vocabIndex: vIdx, word: vocab.word });
            map.push(vIdx);
          }
        });
      }
    });
    return { mediaItems: items, slideToVocabMap: map };
  }, [deck]);

  // --- 3. SMART ENGAGEMENT LOGIC ---
  const defaultEngagementComments = useMemo(() => [
    { name: "System", text: "New signal detected! Save it to your vault. 🧠", isBot: true },
    { name: "Learner", text: "Adding this to my daily vocabulary. Super useful! 🔥", isBot: true },
    { name: "Mentor", text: "Great word! Try practicing this in a sentence. 💎", isBot: true },
    { name: "Community", text: "Got questions? Join the discussion below! 👇", isBot: true }
  ], []);

  const displayComments = useMemo(() => {
    return post.comments && post.comments.length > 0 ? post.comments : defaultEngagementComments;
  }, [post.comments, defaultEngagementComments]);

  // Loop optimization for interval cleanup
  const totalComments = displayComments.length;
  useEffect(() => {
    if (totalComments > 0) {
      const interval = setInterval(() => {
        setCommentFade(false);
        setTimeout(() => {
          setActiveCommentIdx((prev) => (prev + 1) % totalComments);
          setCommentFade(true);
        }, 500);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [totalComments]);

  // --- 4. NAVIGATION & SYNC ---
  const handleWordSelect = useCallback((idx) => {
    setCurrentVocabIdx(idx);
    const firstSlideOfWord = slideToVocabMap.indexOf(idx);
    if (firstSlideOfWord !== -1 && swiperRef.current) {
      swiperRef.current.slideTo(firstSlideOfWord, 500);
    }
  }, [slideToVocabMap]);

  useEffect(() => {
    const urlPostId = searchParams.get("postId");
    const urlHighlight = searchParams.get("highlight");
    
    if (urlPostId === post._id) {
      const targetWord = propHighlight || urlHighlight;
      if (targetWord) {
        const targetIdx = deck.findIndex(v => v.word.toLowerCase() === targetWord.toLowerCase());
        if (targetIdx !== -1) {
          handleWordSelect(targetIdx);
          setActiveIndex(post._id);
          setTimeout(() => {
            if (cardRef.current) {
              cardRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
            }
          }, 800);
        }
      }
    }
  }, [searchParams, post._id, deck, propHighlight, setActiveIndex, handleWordSelect]);

  const currentVocab = deck[currentVocabIdx] || deck[0];
  const isSaved = post.savedBy?.includes(userEmail); 
  
  // FIX: isVoted logic specifically synced to the currentVocab
  const isVoted = useMemo(() => {
    if (!userEmail || !currentVocab) return false;
    const normalizedEmail = userEmail.toLowerCase().trim();
    return currentVocab.votedBy?.some(e => e.toLowerCase().trim() === normalizedEmail);
  }, [currentVocab, userEmail]);

  const userLevel = currentVocab.wordStats?.find((v) => v.email === userEmail)?.level; 

  // --- 5. ACTIONS ---
  const handleVote = async (e) => {
    if (e) e.stopPropagation();
    if (!userEmail) return toast.error("Please login first! 🔑");
    const toastId = toast.loading("Syncing...");
    try {
      const res = await fetch(`${API_URL}/api/english-posts/vote-word/${post._id}/${currentVocab._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail })
      });
      if (res.ok) { 
        toast.success("Vibe Matched! 🔥", { id: toastId }); 
        onRefresh(); 
      } else { toast.error("Sync failed.", { id: toastId }); }
    } catch (err) { toast.error("Error!", { id: toastId }); }
  };

  const handleStatUpdate = async (e, level) => {
    if (e) e.stopPropagation();
    if (!userEmail) return toast.error("Login required!");
    try {
      const res = await fetch(`${API_URL}/api/english-posts/update-word-stat/${post._id}/${currentVocab._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level, email: userEmail })
      });
      if (res.ok) { onRefresh(); toast.success(`${level.toUpperCase()} set!`); }
    } catch (err) { toast.error("Error!"); }
  };

  const speakWord = (word) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(word);
      u.lang = 'en-US'; u.rate = 0.85;
      window.speechSynthesis.speak(u);
    }
  };

  const handleShare = async (e) => {
    if (e) e.stopPropagation();
    const wordName = currentVocab.word.replace(/"/g, '');
    const shareUrl = `${window.location.origin}/community?postId=${post._id}&highlight=${encodeURIComponent(wordName)}`;
    if (navigator.share) await navigator.share({ title: `Learn ${wordName}`, url: shareUrl });
    else { navigator.clipboard.writeText(shareUrl); toast.success("Copied! 📋"); }
  };

  const handleSavePost = async (e) => {
    if (e) e.stopPropagation();
    if (!userEmail) return toast.error("Login required!");
    try {
      const res = await fetch(`${API_URL}/api/english-posts/save/${post._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail })
      });
      if (res.ok) { onRefresh(); toast.success("Saved! 📥"); }
    } catch (err) { toast.error("Error!"); }
  };

  // --- 6. RENDER MULTIMEDIA SLIDER ---
// --- 6. RENDER MULTIMEDIA SLIDER ---
  const renderMediaInternal = () => {
    if (mediaItems.length === 0) return null;
    
    // Check kar rahe hain ki kya koi video currently PLAY ho raha hai
    const isAnyVideoPlaying = playingIndex[post._id] !== undefined;

    return (
      <div className="relative group w-full aspect-[3/4] bg-black rounded-xl overflow-hidden border border-white/5 shadow-inner" onDoubleClick={handleVote}>
        
        {/* WORD COUNTER BADGE */}
        <div className="absolute top-3 right-3 z-[2] bg-black/40 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full pointer-events-none shadow-xl">
          <p className="text-[9px] font-black text-white/90 uppercase tracking-widest italic">{currentVocabIdx + 1}/{deck.length} Word</p>
        </div>

        {/* 🔥 DYNAMIC NAVIGATION BUTTONS 🔥 */}
        {/* Ye buttons sirf tab dikhenge jab isAnyVideoPlaying 'true' hoga */}
        {mediaItems.length > 1 && isAnyVideoPlaying && (
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-2 z-[60] pointer-events-none animate-in fade-in duration-300">
            <button 
              onClick={(e) => { e.stopPropagation(); swiperRef.current?.slidePrev(); }} 
              className="pointer-events-auto w-8 h-8 bg-black/60 rounded-full flex items-center justify-center text-white backdrop-blur-sm active:scale-90 border border-white/10"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="3" /></svg>
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); swiperRef.current?.slideNext(); }} 
              className="pointer-events-auto w-8 h-8 bg-black/40 rounded-full flex items-center justify-center text-white backdrop-blur-sm active:scale-90 border border-white/10"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth="3" /></svg>
            </button>
          </div>
        )}

        <Swiper 
          onSwiper={(s) => (swiperRef.current = s)}
          modules={[Pagination]} 
          pagination={mediaItems.length > 1 ? { clickable: true } : false} 
          onSlideChange={(s) => {
            const item = mediaItems[s.activeIndex];
            if (item) setCurrentVocabIdx(item.vocabIndex);
            
            // ✅ SWIPE KARTE HI BUTTONS GAYAB:
            // Jab bhi slide change hogi, hum playing state clear kar denge
            setPlayingIndex({}); 
          }}
          className="w-full h-full"
        >
          {mediaItems.map((item, idx) => {
            // Bulletproof YT Parser
            let videoId = "";
            if (item?.url && (item.url.includes('youtube.com') || item.url.includes('youtu.be'))) {
                const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\/shorts\/)([^#\&\?]*).*/;
                const match = item.url.match(regExp);
                videoId = (match && match[2].length === 11) ? match[2] : null;
            }

            const isPlaying = playingIndex[post._id] === idx;

            return (
              <SwiperSlide key={idx} className="bg-black flex items-center justify-center">
                {(item?.type === 'video' || videoId) ? (
                  <div className="w-full h-full relative bg-black">
                    {isPlaying ? (
                      <iframe 
                        className="w-full h-full border-0" 
                        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`} 
                        allow="autoplay; encrypted-media" 
                        allowFullScreen
                      ></iframe>
                    ) : (
                      <div className="relative w-full h-full flex items-center justify-center cursor-pointer" onClick={() => setPlayingIndex({[post._id]: idx})}>
                        <img 
                          src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`} 
                          className="w-full h-full object-cover opacity-60" 
                          alt="video-thumb"
                        />
                        <div className="absolute w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.5)]">
                          <svg viewBox="0 0 24 24" fill="white" className="w-7 h-7 ml-1"><path d="M8 5v14l11-7z" /></svg>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <img src={item?.url || post.image} className="w-full h-full object-contain" alt="content" />
                )}
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    );
  };

  return (
    <div ref={cardRef} id={post._id} className="mb-6 mx-auto w-full max-w-[370px] overflow-hidden bg-[#0a0a0c] border border-white/10 rounded-[2rem] shadow-2xl transition-all duration-500 font-sans group">
      
      
      {/* HEADER */}
      <div className="flex items-center justify-between px-5 py-4 bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-[10px] font-black text-white shadow-lg">
            {post.userEmail?.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-white tracking-widest leading-none">{post.userEmail?.split("@")[0]}</span>
            <span className="text-[7px] text-gray-500 font-bold uppercase mt-1">Authorized</span>
          </div>
        </div>
        <div className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-md">
          <span className="text-[7px] text-yellow-500 font-black uppercase tracking-tighter">{post.badgeName || "NORMAL"}</span>
        </div>
      </div>

      {/* MEDIA CONTAINER */}
      <div className={`px-2 transition-all duration-700 ease-out overflow-hidden ${isExpanded && mediaItems.length > 0 ? "max-h-[480px] opacity-100 my-2" : "max-h-0 opacity-0"}`}>
        {renderMediaInternal()}
      </div>

      {/* WORD PILLS */}
      {deck.length > 1 && (
        <div className="px-5 my-2 flex gap-1.5 overflow-x-auto no-scrollbar">
          {deck.map((item, idx) => (
            <button key={idx} onClick={(e) => { e.stopPropagation(); handleWordSelect(idx); }} className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-[8px] font-black uppercase border transition-all ${currentVocabIdx === idx ? "bg-blue-600 border-blue-400 text-white shadow-lg" : "bg-white/5 border-white/5 text-gray-500"}`}>{item.word}</button>
          ))}
        </div>
      )}

      <div className={`px-6 transition-all duration-500 ease-in-out overflow-hidden ${!isExpanded ? "max-h-20 opacity-100 mt-4 mb-1" : "max-h-0 opacity-0 m-0"}`}>
  <div className="flex items-center gap-3 bg-white/[0.03] border border-white/5 p-2 rounded-2xl backdrop-blur-md shadow-inner group/ctx">
    
    {/* 🖼️ Context Image */}
    <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10 flex-shrink-0 bg-black shadow-lg">
      <img 
        src={deck[0]?.media?.[0]?.url || post.image || "https://img.icons8.com/ios-filled/50/ffffff/idea.png"} 
        alt="Context" 
        className="w-full h-full object-cover group-hover/ctx:scale-110 transition-transform duration-700"
      />
    </div>

    {/* 🏷️ Context Title */}
    <div className="flex flex-col overflow-hidden">
      <div className="flex items-center gap-1.5">
        <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" />
        <span className="text-[8px] font-black text-blue-500 uppercase tracking-[0.2em] opacity-70">
          Source_Intelligence
        </span>
      </div>
      <h3 className="text-[11px] font-black text-white/90 uppercase tracking-tighter truncate italic">
        {post.title || "Uncategorized Signal"}
      </h3>
    </div>

    {/* ⚡ Status Light */}
    <div className="ml-auto pr-2">
       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
    </div>
  </div>
</div>

      {/* CONTENT AREA */}
      <div onClick={() => { setActiveIndex(isExpanded ? null : post._id); setShowStats(false); }} className="px-6 pt-2 pb-4 cursor-pointer">
        <div className="flex justify-between items-start">
          <div className="flex flex-col flex-1">
            <h2 className="text-4xl font-black text-white uppercase italic leading-none tracking-tighter group-hover:text-blue-400 transition-colors leading-tight">
              {currentVocab.word}
            </h2>
            <div className="h-1 w-10 bg-yellow-500 rounded-full my-3"></div>
            <p className="text-xl font-bold text-gray-400 leading-tight italic">{currentVocab.meaning}</p>
          </div>
          <PremiumSoundFeature isPremiumUser={isPremiumUser} userEmail={userEmail}>
            <button onClick={(e)=>{e.stopPropagation(); speakWord(currentVocab.word)}} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white active:scale-90 shadow-xl transition-all">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.5A2.25 2.25 0 002.25 9.75v4.5a2.25 2.25 0 002.25 2.25h1.94l4.5 4.5c.944.945 2.56.276 2.56-1.06V4.06z"/></svg>
            </button>
          </PremiumSoundFeature>
        </div>
        {currentVocab.sentence && (
          <div className="mt-3 p-3 bg-white/[0.03] border-l-2 border-yellow-500 rounded-r-xl">
            <p className="text-[11px] font-bold text-white/70 italic leading-snug">"{currentVocab.sentence}"</p>
          </div>
        )}
      </div>

      {/* ACTION & STATS GRID */}
      <div className={`transition-all duration-500 overflow-hidden ${isExpanded ? "max-h-[350px] opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="px-5 py-3 grid grid-cols-4 gap-2 border-t border-white/5 bg-white/[0.01]">
          <button onClick={handleVote} className={`flex flex-col items-center justify-center py-2 rounded-xl transition-all active:scale-95 ${isVoted ? "bg-red-500 text-white shadow-lg" : "bg-white/5 text-gray-500"}`}>
            <svg className="w-4 h-4" fill={isVoted ? "white" : "none"} stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/></svg>
            <span className="text-[9px] font-black mt-0.5">{currentVocab.voteCount || 0}</span>
          </button>
          <button onClick={handleShare} className="flex flex-col items-center justify-center bg-white/5 text-gray-500 rounded-xl active:scale-95"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" /></svg><span className="text-[7px] font-black uppercase mt-0.5">Share</span></button>
          <button onClick={handleSavePost} className={`flex items-center justify-center rounded-xl transition-all active:scale-95 ${isSaved ? "bg-white text-black shadow-xl" : "bg-white/5 text-gray-500"}`}><svg className="w-5 h-5" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"/></svg></button>
          <button onClick={(e)=>{e.stopPropagation(); setShowStats(!showStats)}} className={`flex items-center justify-center rounded-xl transition-all active:scale-95 ${showStats ? "bg-blue-600 text-white" : "bg-blue-500/10 text-blue-500"}`}><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"/></svg></button>
        </div>

        <div className={`transition-all duration-500 overflow-hidden ${showStats ? "max-h-[180px] opacity-100 px-5 pb-5" : "max-h-0 opacity-0"}`}>
          <div className="grid grid-cols-2 gap-2 pt-1">
            {['easy', 'hard', 'heard', 'dailyUse'].map((lvl) => (
              <button key={lvl} onClick={(e) => handleStatUpdate(e, lvl)} className={`flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border transition-all ${userLevel === lvl ? "border-blue-500 bg-blue-500/5 shadow-inner" : "border-white/5"}`}>
                <span className="text-[9px] font-black uppercase text-gray-500">{lvl === 'dailyUse' ? 'Daily' : lvl}</span>
                <span className="text-[10px] font-black text-white">{currentVocab.commandStats?.[lvl] || 0}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* FOOTER & FADING INSIGHT */}
      <div className="pb-6 px-5 border-t border-white/5 pt-4 bg-gradient-to-t from-white/[0.02] to-transparent">
        <div onClick={(e) => { e.stopPropagation(); setShowComments(true); }} className="flex flex-col items-center gap-2 cursor-pointer group">
          <div className={`flex items-center gap-2 px-3 py-1.5 bg-white/[0.03] border border-white/5 rounded-full transition-all duration-700 ${commentFade ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-black text-white uppercase ${displayComments[activeCommentIdx]?.isBot ? 'bg-yellow-500' : 'bg-blue-600'}`}>
              {displayComments[activeCommentIdx]?.name?.charAt(0)}
            </div>
            <p className="text-[9px] font-bold text-gray-400 italic line-clamp-1 max-w-[200px]">"{displayComments[activeCommentIdx]?.text}"</p>
          </div>
          <button className="relative px-6 py-1">
            <span className="relative z-10 text-[8px] font-black text-gray-600 uppercase tracking-[0.3em] group-hover:text-blue-400 transition-colors">REACTIONS ({post.comments?.length || 0})</span>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[1px] bg-blue-500 group-hover:w-full transition-all duration-500"></div>
          </button>
        </div>
      </div>

      {showComments && <CommentModal post={post} userEmail={userEmail} API_URL={API_URL} onClose={() => setShowComments(false)} onRefresh={onRefresh} />}
    </div>
  );
}