import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import toast from 'react-hot-toast';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules'; 
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import 'swiper/css';
import 'swiper/css/pagination';

import CommentModal from "./CommentModal"; 
import PremiumSoundFeature from "./PremiumSoundFeature"; 

// 🔥 DYNAMIC HIGHLIGHT ENGINE
const highlightText = (text, highlight) => {
  if (!text || !highlight) return text;
  const regex = new RegExp(`(${highlight})`, "gi");
  const parts = String(text).split(regex);
  
  return parts.map((part, i) =>
    regex.test(part) ? (
      <span 
        key={i} 
        className="bg-[#FFB800]/20 text-[#8B004A] font-black px-1.5 py-0.5 rounded-md mx-0.5 shadow-sm border border-[#FFB800]/40 inline-block"
      >
        {part}
      </span>
    ) : (
      part
    )
  );
};

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
  const [showComments, setShowComments] = useState(false);
  const [showStats, setShowStats] = useState(false); 
  const [currentVocabIdx, setCurrentVocabIdx] = useState(0); 
  const [playingIndex, setPlayingIndex] = useState({}); 
  const [searchParams] = useSearchParams(); 
  const swiperRef = useRef(null);
  const cardRef = useRef(null); 

  const [activeCommentIdx, setActiveCommentIdx] = useState(0);
  const [commentFade, setCommentFade] = useState(true);

  // 🔥 FLIP CARD STATES 🔥
  const [isFlipped, setIsFlipped] = useState(false);
  const [hasHintPlayed, setHasHintPlayed] = useState(false);

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

  // RESET FLIP STATE WHEN WORD CHANGES
  useEffect(() => {
    setIsFlipped(false);
    setHasHintPlayed(false);
  }, [currentVocabIdx]);

  const { mediaItems, slideToVocabMap } = useMemo(() => {
    const items = [];
    const map = [];
    deck.forEach((vocab, vIdx) => {
      if (vocab.media && vocab.media.length > 0) {
        vocab.media.forEach((m) => {
          const mediaUrl = m.url || m.value;
          if(mediaUrl) {
            items.push({ ...m, url: mediaUrl, vocabIndex: vIdx, word: vocab.word });
            map.push(vIdx);
          }
        });
      }
    });
    return { mediaItems: items, slideToVocabMap: map };
  }, [deck]);

  const defaultEngagementComments = useMemo(() => [
    { name: "System", text: "A highly useful word for everyday conversations! 💯", isBot: true },
    { name: "Learner", text: "Adding this to my notes. Very helpful! 📚", isBot: true },
    { name: "Mentor", text: "Try making your own sentence with this word! ✍️", isBot: true }
  ], []);

  const displayComments = useMemo(() => {
    return post.comments && post.comments.length > 0 ? post.comments : defaultEngagementComments;
  }, [post.comments, defaultEngagementComments]);

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

  const handleWordSelect = useCallback((idx) => {
    setCurrentVocabIdx(idx);
    const firstSlideOfWord = slideToVocabMap.indexOf(idx);
    if (firstSlideOfWord !== -1 && swiperRef.current) {
      swiperRef.current.slideTo(firstSlideOfWord, 500);
    }
  }, [slideToVocabMap]);

  // 🔥 1. POST SCROLL EFFECT (Agar URL se share hokar aaya hai)
  useEffect(() => {
    const urlPostId = searchParams.get("postId");
    if (urlPostId === post._id) {
      setTimeout(() => {
        if (cardRef.current) {
          cardRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
          cardRef.current.style.borderColor = "#E01A76";
          cardRef.current.style.boxShadow = "0 0 20px rgba(224,26,118,0.3)";
          setTimeout(() => {
            cardRef.current.style.borderColor = "";
            cardRef.current.style.boxShadow = "";
          }, 3000);
        }
      }, 800);
    }
  }, [searchParams, post._id]);

  // 🔥 2. AUTO-SWIPE & SELECT WORD EFFECT (Search ya URL se word dhoondhne par)
  useEffect(() => {
    const urlHighlight = searchParams.get("highlight");
    const targetWord = propHighlight || urlHighlight; 

    if (targetWord && deck && deck.length > 0) {
      const targetIdx = deck.findIndex(
        v => v.word?.toLowerCase().trim() === targetWord.toLowerCase().trim()
      );

      if (targetIdx !== -1) {
        const timer = setTimeout(() => {
          handleWordSelect(targetIdx);
        }, 300); 
        return () => clearTimeout(timer);
      }
    }
  }, [propHighlight, searchParams, deck, handleWordSelect]);

  const currentVocab = deck[currentVocabIdx] || deck[0];
  const isSaved = post.savedBy?.includes(userEmail); 
  
  const isVoted = useMemo(() => {
    if (!userEmail || !currentVocab) return false;
    const normalizedEmail = userEmail.toLowerCase().trim();
    return currentVocab.votedBy?.some(e => e.toLowerCase().trim() === normalizedEmail);
  }, [currentVocab, userEmail]);

  const userLevel = currentVocab.wordStats?.find((v) => v.email === userEmail)?.level; 

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

  const renderMediaInternal = () => {
    if (mediaItems.length === 0) return null;
    const isAnyVideoPlaying = playingIndex[post._id] !== undefined;

    return (
      <div className="relative group w-full bg-gray-50 border-y border-gray-100" onDoubleClick={handleVote}>
        <div className="absolute top-3 right-3 z-[2] bg-white/90 backdrop-blur-md border border-[#8B004A]/20 px-3 py-1 rounded-full pointer-events-none shadow-sm">
          <p className="text-[10px] font-black text-[#8B004A] tracking-wider">{currentVocabIdx + 1} / {deck.length}</p>
        </div>

        {mediaItems.length > 1 && isAnyVideoPlaying && (
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-2 z-[60] pointer-events-none animate-in fade-in duration-300">
            <button onClick={(e) => { e.stopPropagation(); swiperRef.current?.slidePrev(); }} className="pointer-events-auto w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-[#8B004A] backdrop-blur-sm border border-gray-200 shadow-md active:scale-90"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="3" /></svg></button>
            <button onClick={(e) => { e.stopPropagation(); swiperRef.current?.slideNext(); }} className="pointer-events-auto w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-[#8B004A] backdrop-blur-sm border border-gray-200 shadow-md active:scale-90"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth="3" /></svg></button>
          </div>
        )}

        <Swiper 
          onSwiper={(s) => (swiperRef.current = s)}
          modules={[Pagination]} 
          pagination={mediaItems.length > 1 ? { clickable: true } : false} 
          autoHeight={true} 
          onSlideChange={(s) => {
            const item = mediaItems[s.activeIndex];
            if (item) setCurrentVocabIdx(item.vocabIndex);
            setPlayingIndex({}); 
          }}
          className="w-full flex items-center justify-center"
        >
          {mediaItems.map((item, idx) => {
            let videoId = "";
            if (item?.url && (item.url.includes('youtube.com') || item.url.includes('youtu.be'))) {
                const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\/shorts\/)([^#\&\?]*).*/;
                const match = item.url.match(regExp);
                videoId = (match && match[2].length === 11) ? match[2] : null;
            }
            const isPlaying = playingIndex[post._id] === idx;

            return (
              <SwiperSlide key={idx} className="bg-gray-100 flex items-center justify-center w-full">
                {(item?.type === 'video' || videoId) ? (
                  <div className="w-full aspect-[4/5] max-h-[550px] relative bg-black flex items-center justify-center">
                    {isPlaying ? (
                      <iframe className="w-full h-full border-0" src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`} allow="autoplay; encrypted-media" allowFullScreen></iframe>
                    ) : (
                      <div className="relative w-full h-full flex items-center justify-center cursor-pointer bg-gray-900" onClick={() => setPlayingIndex({[post._id]: idx})}>
                        <img src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`} className="w-full h-full object-cover opacity-80" alt="video-thumb" />
                        <div className="absolute w-14 h-14 bg-[#E01A76]/90 backdrop-blur-md border border-white/40 rounded-full flex items-center justify-center shadow-xl">
                          <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6 ml-1"><path d="M8 5v14l11-7z" /></svg>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full bg-gray-50 flex items-center justify-center max-h-[600px]">
                    <img src={item?.url || post.image} className="w-full h-auto max-h-[600px] object-contain object-center" alt="content" />
                  </div>
                )}
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    );
  };

  return (
    <div ref={cardRef} id={post._id} className="mb-8 mx-auto w-full max-w-[440px] bg-white border-[3px] border-[#8B004A]/10 rounded-[2rem] shadow-xl shadow-[#8B004A]/5 font-sans pb-4 transition-all duration-500">
      
      {/* 1. HEADER */}
      <div className="flex items-center justify-between px-4 py-3 border-b-2 border-gray-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#8B004A] to-[#E01A76] flex items-center justify-center text-sm font-black text-white shadow-md">
            {post.userEmail?.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-[13px] font-black text-gray-900 tracking-wide leading-none mb-1">
              {post.userEmail?.split("@")[0]}
            </span>
            {post.title ? (
              <span className="text-[10px] text-[#8B004A] font-bold uppercase tracking-wider leading-none">
                {post.title}
              </span>
            ) : (
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider leading-none">
                Vocabulary Post
              </span>
            )}
          </div>
        </div>
        <div className="px-2 py-1 bg-[#FFB800]/10 border border-[#FFB800]/30 rounded text-[9px] text-[#8B004A] font-black tracking-wider uppercase">
          {post.badgeName || "NORMAL"}
        </div>
      </div>

      {/* 2. MEDIA CONTAINER */}
      {renderMediaInternal()}

      {/* 3. INSTAGRAM ACTION BAR */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4 text-gray-700">
          <button onClick={handleVote} className={`transition-all active:scale-90 ${isVoted ? "text-[#E01A76]" : "hover:text-[#8B004A]"}`}>
            <svg className="w-7 h-7" fill={isVoted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/></svg>
          </button>
          
          <button onClick={() => setShowComments(true)} className="transition-all active:scale-90 hover:text-[#8B004A]">
             <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z"/></svg>
          </button>
          
          <button onClick={handleShare} className="transition-all active:scale-90 hover:text-[#8B004A]">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z"/></svg>
          </button>
          
          <button onClick={() => setShowStats(!showStats)} className={`transition-all active:scale-90 ml-1 ${showStats ? "text-[#E01A76]" : "hover:text-[#8B004A]"}`}>
             <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"/></svg>
          </button>
        </div>
        
        <button onClick={handleSavePost} className={`transition-all active:scale-90 ${isSaved ? "text-[#8B004A]" : "text-gray-400 hover:text-[#8B004A]"}`}>
          <svg className="w-7 h-7" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"/></svg>
        </button>
      </div>

      <div className="px-4 mb-2">
        <span className="text-[13px] font-black text-gray-900 cursor-pointer">{currentVocab.voteCount || 0} likes</span>
      </div>

      {/* 4. EXPANDABLE STATS */}
      <div className={`transition-all duration-300 overflow-hidden ${showStats ? "max-h-[200px] opacity-100 mb-4" : "max-h-0 opacity-0 mb-0"}`}>
        <div className="px-4">
          <div className="grid grid-cols-4 gap-2 bg-[#F2EFE7] p-2 rounded-xl border border-[#8B004A]/10">
            {['easy', 'hard', 'heard', 'dailyUse'].map((lvl) => (
              <button key={lvl} onClick={(e) => handleStatUpdate(e, lvl)} className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all ${userLevel === lvl ? "bg-[#8B004A] text-white shadow-md" : "hover:bg-white text-gray-500 hover:text-[#8B004A]"}`}>
                <span className="text-[14px] font-black mb-1">{currentVocab.commandStats?.[lvl] || 0}</span>
                <span className="text-[9px] font-black uppercase tracking-wider">{lvl === 'dailyUse' ? 'Daily' : lvl}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 5. WORD PILLS */}
      {deck.length > 1 && (
        <div className="px-4 mb-3 flex gap-2 overflow-x-auto no-scrollbar">
          {deck.map((item, idx) => (
            <button key={idx} onClick={() => handleWordSelect(idx)} className={`flex-shrink-0 px-3 py-1 rounded-full text-[10px] font-black border transition-all ${currentVocabIdx === idx ? "bg-[#8B004A] text-white border-[#8B004A] shadow-md" : "bg-gray-100 border-gray-200 text-gray-500 hover:bg-gray-200"}`}>
              {item.word}
            </button>
          ))}
        </div>
      )}

      {/* 🚀 6. PILL-SIZED TAP-TO-FLIP FLASHCARD 🚀 */}
      <div className="px-4 mb-2 perspective-[1000px] flex justify-start">
        <motion.div 
          className="cursor-pointer bg-white border-2 border-gray-100 shadow-sm rounded-2xl relative inline-flex items-center justify-center px-5 py-2.5 min-w-[120px] min-h-[60px] active:scale-[0.98] transition-transform"
          
          // 🔥 SCROLL ENTER TRIGGER
          onViewportEnter={() => {
            if (!hasHintPlayed) {
              setHasHintPlayed(true);
              setIsFlipped(true); 
              setTimeout(() => setIsFlipped(false), 800); 
            }
          }}
          
          // 🔥 SCROLL LEAVE TRIGGER
          onViewportLeave={() => setHasHintPlayed(false)}

          // 🔥 CHANGE: once: false taaki baar baar chale
          viewport={{ once: false, amount: 0.5 }}
          
          // 🔥 TAP TO FLIP
          onClick={() => setIsFlipped(!isFlipped)}
        >
          {/* Hint indicator (adjusted for smaller card) */}
          <div className="absolute top-1 right-2 flex items-center gap-1 opacity-40">
             <svg className="w-2.5 h-2.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg>
             <span className="text-[7px] font-black uppercase tracking-widest text-gray-500">Tap</span>
          </div>

          <AnimatePresence mode="wait">
            {!isFlipped ? (
              // FRONT FACE: ONLY ENGLISH WORD
              <motion.div
                key="front"
                initial={{ rotateX: 90, opacity: 0 }}
                animate={{ rotateX: 0, opacity: 1 }}
                exit={{ rotateX: -90, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="flex items-center gap-3 mt-1.5"
              >
                <h3 className="text-[1.6rem] leading-none font-black text-[#8B004A] tracking-tight capitalize">
                  {currentVocab.word}
                </h3>
                {/* Speaker Button */}
                <div onClick={(e) => e.stopPropagation()}>
                  <PremiumSoundFeature isPremiumUser={isPremiumUser} userEmail={userEmail}>
                    <button onClick={() => speakWord(currentVocab.word)} className="text-gray-400 hover:text-[#E01A76] transition-colors active:scale-90 bg-gray-50 p-1.5 rounded-full border border-gray-100 shadow-sm">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.5A2.25 2.25 0 002.25 9.75v4.5a2.25 2.25 0 002.25 2.25h1.94l4.5 4.5c.944.945 2.56.276 2.56-1.06V4.06z"/></svg>
                    </button>
                  </PremiumSoundFeature>
                </div>
              </motion.div>
            ) : (
              // BACK FACE: HINDI MEANING + SMALL ENGLISH WORD
              <motion.div
                key="back"
                initial={{ rotateX: 90, opacity: 0 }}
                animate={{ rotateX: 0, opacity: 1 }}
                exit={{ rotateX: -90, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="flex flex-col items-center justify-center mt-1"
              >
                {/* 🚀 Chhota sa English word upar 🚀 */}
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                  {currentVocab.word}
                </span>
                <p className="text-[1.2rem] text-[#8B004A] font-bold leading-relaxed text-center px-2">
                  {highlightText(currentVocab.meaning, currentVocab.word)}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* 🚀 6.5 SENTENCE OUTSIDE THE FLIP CARD 🚀 */}
      {currentVocab.sentence && (
        <div className="px-4 mb-2">
          <div className="p-3 bg-gray-50 rounded-xl border-l-4 border-[#FFB800] w-full text-left shadow-sm">
            <p className="text-[13px] text-gray-600 italic font-medium leading-relaxed">
              "{highlightText(currentVocab.sentence, currentVocab.word)}"
            </p>
          </div>
        </div>
      )}

      {/* 7. COMMENTS SECTION */}
      <div className="px-4 mt-3 pt-3 border-t border-gray-100">
        <button onClick={() => setShowComments(true)} className="text-[13px] font-bold text-gray-500 mb-1 hover:text-[#8B004A] transition-colors">
          View all {post.comments?.length || 0} comments
        </button>
        
        <div className={`text-[13px] transition-opacity duration-500 flex items-center gap-1.5 h-[20px] overflow-hidden ${commentFade ? 'opacity-100' : 'opacity-0'}`}>
          <span className="font-black text-gray-900 whitespace-nowrap shrink-0">
            {displayComments[activeCommentIdx]?.name}
          </span>
          <span className="text-gray-600 truncate">
            {displayComments[activeCommentIdx]?.text}
          </span>
        </div>
      </div>

      {showComments && <CommentModal post={post} userEmail={userEmail} API_URL={API_URL} onClose={() => setShowComments(false)} onRefresh={onRefresh} />}
    </div>
  );
}