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
  API_URL,
  highlightWord // 🔥 Search se aaya hua word pakadne ke liye
}) {
  const [showComments, setShowComments] = useState(false);
  const [currentVocabIdx, setCurrentVocabIdx] = useState(0); // 🔥 Deck tracking index
  const [playingIndex, setPlayingIndex] = useState({}); 
  const swiperRef = useRef(null);
  const cardRef = useRef(null); // 🔥 Scroll target ke liye

  const isOpen = activeIndex === post._id;

  // 🔥 1. SMART DECK DATA: Har word ka apna media array
  const deck = post.vocabData && post.vocabData.length > 0 
    ? post.vocabData 
    : [{ _id: post._id, word: post.word, meaning: post.meaning, media: post.media || [{type:'image', url: post.image}], wordStats: post.userStats, votedBy: post.votedBy, voteCount: post.voteCount, commandStats: post.commandStats }];

  // 🔥 2. SLIDE MAPPING: Kaunsi slide kis word ki hai?
  const slideToVocabMap = [];
  deck.forEach((vocab, vIdx) => {
    if (vocab.media && vocab.media.length > 0) {
      vocab.media.forEach(() => slideToVocabMap.push(vIdx));
    } else {
      slideToVocabMap.push(vIdx); 
    }
  });

  // 🔥 3. AUTO-SWIPE & HIGHLIGHT LOGIC (NEW)
  // Jab search se word aaye, toh automatic us slide par swipe karo
  useEffect(() => {
    if (highlightWord) {
      const targetIdx = deck.findIndex(v => v.word.toLowerCase() === highlightWord.toLowerCase());
      if (targetIdx !== -1) {
        const firstSlideOfWord = slideToVocabMap.indexOf(targetIdx);
        if (firstSlideOfWord !== -1) {
          // Thoda delay taaki Swiper initialize ho jaye
          setTimeout(() => {
            swiperRef.current?.slideTo(firstSlideOfWord, 500);
            setCurrentVocabIdx(targetIdx);
          }, 600);
        }
      }
    }
  }, [highlightWord, deck]);

  const currentVocab = deck[currentVocabIdx] || deck[0];
  
  // ✅ THE FIXES: Definitive check for variables
  const isSaved = post.savedBy?.includes(userEmail); // Poore Post level pe
  const isVoted = currentVocab.votedBy?.includes(userEmail); // Specific Word level pe
  const userLevel = currentVocab.wordStats?.find((v) => v.email === userEmail)?.level; // Word level pe

  // ==========================================
  // 🛠️ INTERNAL HANDLERS (Word-Targeted)
  // ==========================================

  const handleWordSelect = (idx) => {
    const firstSlideOfWord = slideToVocabMap.indexOf(idx);
    if (firstSlideOfWord !== -1) {
      swiperRef.current?.slideTo(firstSlideOfWord);
      setCurrentVocabIdx(idx);
    }
  };

  const handleVote = async (e) => {
    if (e) e.stopPropagation();
    if (!userEmail) return toast.error("Bhai login karo! 😅");
    
    // 🔥 Targeting specific word ID
    const wordId = currentVocab._id;
    try {
      const res = await fetch(`${API_URL}/api/english-posts/vote-word/${post._id}/${wordId}`, {
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

    const wordId = currentVocab._id;
    try {
      const res = await fetch(`${API_URL}/api/english-posts/update-word-stat/${post._id}/${wordId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level, email: userEmail, nextReview: null })
      });
      if (res.ok) {
        toast.success(`Word marked as ${level.toUpperCase()} ✅`);
        onRefresh();
      }
    } catch (err) { toast.error("Update Failed!"); }
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

  const handleShare = async () => {
    // Ab share link mein specific word bhi jayega
    const wordName = currentVocab.word.replace(/"/g, '');
    const shareUrl = `${window.location.origin}/community?postId=${post._id}&highlight=${encodeURIComponent(wordName)}`;
    const text = `Bhai, ye word dekh: "${wordName}" (${currentVocab.meaning}).🔥`;
    
    if (navigator.share) await navigator.share({ title: wordName, text, url: shareUrl });
    else { 
      navigator.clipboard.writeText(`${text} ${shareUrl}`); 
      toast.success("Link Copied! 📋"); 
    }
  };

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
  const mediaItems = [];
  deck.forEach((vocab, vIdx) => {
    if (vocab.media && vocab.media.length > 0) {
      vocab.media.forEach((m) => mediaItems.push({ ...m, vocabIndex: vIdx }));
    } else {
      mediaItems.push({ type: 'image', url: post.image, vocabIndex: vIdx });
    }
  });

  const hasMultipleItems = mediaItems.length > 1;
  const activeIdx = playingIndex[post._id];
  const isVideoPlaying = activeIdx !== undefined;
  const currentItem = mediaItems[activeIdx] || mediaItems[currentVocabIdx];

  const isShorts = currentItem?.type === 'embed' && currentItem?.url?.includes('shorts/');
  const showNavButtons = hasMultipleItems && isShorts && isVideoPlaying;

  return (
    <div className="relative group w-full h-[600px] bg-black">
      <style>{`
        .community-swiper .swiper-pagination-bullet { background: white !important; opacity: 0.6; }
        .community-swiper .swiper-pagination-bullet-active { background: #ef4444 !important; opacity: 1; }
        .community-swiper .swiper-pagination { z-index: 10000 !important; bottom: 20px !important; }
      `}</style>

      {showNavButtons && (
        <>
          <button 
            onClick={(e) => { e.stopPropagation(); swiperRef.current?.slidePrev(); }} 
            className="absolute left-4 top-1/2 -translate-y-1/2 z-[10001] w-11 h-11 bg-black/60 border border-white/20 text-white rounded-full flex items-center justify-center backdrop-blur-md active:scale-90 transition-all shadow-2xl"
          >
            ←
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); swiperRef.current?.slideNext(); }} 
            className="absolute right-4 top-1/2 -translate-y-1/2 z-[10001] w-11 h-11 bg-black/60 border border-white/20 text-white rounded-full flex items-center justify-center backdrop-blur-md active:scale-90 transition-all shadow-2xl"
          >
            →
          </button>
        </>
      )}

      <Swiper 
        onSwiper={(swiper) => (swiperRef.current = swiper)}
        modules={[Pagination]} 
        pagination={hasMultipleItems ? { clickable: true, dynamicBullets: true } : false} 
        className="w-full h-full community-swiper"
        onSlideChange={(swiper) => {
          const item = mediaItems[swiper.activeIndex];
          if (item) setCurrentVocabIdx(item.vocabIndex);
          setPlayingIndex({}); 
        }}
      >
        {mediaItems.map((item, idx) => {
          let videoId = "";
          let itemIsShorts = false;
          let finalUrl = item.url;

          if (item.type === 'embed' || item.url.includes('youtube.com') || item.url.includes('youtu.be')) {
            if (item.url.includes('shorts/')) {
              videoId = item.url.split('shorts/')[1]?.split('?')[0]?.split('&')[0];
              itemIsShorts = true;
            } else if (item.url.includes('v=')) {
              videoId = item.url.split('v=')[1]?.split('&')[0];
            } else if (item.url.includes('youtu.be/')) {
              videoId = item.url.split('youtu.be/')[1]?.split('?')[0]?.split('&')[0];
            }
            finalUrl = `https://www.youtube.com/embed/${videoId}`;
          }

          const isPlaying = playingIndex[post._id] === idx;

          return (
            <SwiperSlide key={idx} className="bg-black relative">
              <div className="w-full h-full flex items-center justify-center overflow-hidden">
                {item.type === 'video' ? (
                  <video src={item.url} className="w-full h-auto max-h-full" controls playsInline />
                ) : (item.type === 'embed' || videoId) ? (
                  <div className={`w-full ${itemIsShorts ? 'h-full' : 'aspect-video'} relative bg-black`}>
                    {isPlaying ? (
                      <iframe 
                        className="w-full h-full border-0" 
                        src={`${finalUrl}?autoplay=1&rel=0&modestbranding=1&origin=${window.location.origin}`} 
                        allow="autoplay; encrypted-media; picture-in-picture" 
                        allowFullScreen
                      ></iframe>
                    ) : (
                      <div 
                        className="absolute inset-0 flex items-center justify-center cursor-pointer group/play" 
                        onClick={() => setPlayingIndex({[post._id]: idx})}
                      >
                        <img 
                          src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`} 
                          onError={(e) => e.target.src = `https://img.youtube.com/vi/${videoId}/0.jpg`}
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
    <div ref={cardRef} id={post._id} className="mb-12 border-b border-gray-100 pb-6 animate-in fade-in duration-500">
      {/* 👤 Header */}
      <div className="flex items-center px-4 py-3 gap-3">
        <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-[10px] font-black text-white">
          {post.userEmail?.charAt(0).toUpperCase()}
        </div>
        <span className="text-[11px] font-black text-gray-800 italic">{post.userEmail?.split("@")[0]}</span>
        <span className="text-[9px] ml-auto bg-gray-50 px-3 py-1.5 rounded-full text-gray-400 font-black uppercase tracking-widest border border-gray-100">
          {post.badgeName || "Vocabulary"}
        </span>
      </div>

      {/* Media */}
      <div className="relative w-full bg-gray-50 overflow-hidden" onDoubleClick={handleVote}>
        {renderMediaInternal()}
      </div>

      {/* 🔥 WORD SELECTOR PILLS */}
      {deck.length > 1 && (
        <div className="flex items-center gap-2 px-5 pt-4 overflow-x-auto no-scrollbar">
          {deck.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleWordSelect(idx)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all duration-300 border ${
                currentVocabIdx === idx 
                ? "bg-black text-white border-black scale-105 shadow-lg shadow-black/20" 
                : "bg-white text-gray-400 border-gray-100"
              }`}
            >
              {item.word}
            </button>
          ))}
        </div>
      )}

      {/* ⚡ Actions */}
      <div className="flex items-center gap-5 px-5 pt-5 text-black">
        <button onClick={handleVote} className="transition-transform active:scale-150 duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" fill={isVoted ? "#ef4444" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke={isVoted ? "#ef4444" : "currentColor"} className="w-7 h-7">
            <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </button>

        <button onClick={() => setShowComments(true)} className="transition-transform active:scale-125">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
            <path d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785 0 0 0 .19.08c.957.1 1.954.02 2.894-.21a1.2 1.2 0 0 1 1.008.204 9.07 9.07 0 0 0 2.972.524z" />
          </svg>
        </button>

        <button onClick={handleShare} className="transition-transform active:scale-125">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
            <path d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0-10.628a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5m0 10.628a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5" />
          </svg>
        </button>

        <div className="ml-auto flex items-center gap-4">
          <button onClick={handleSavePost} className="transition-transform active:scale-125">
            <svg xmlns="http://www.w3.org/2000/svg" fill={isSaved ? "black" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
              <path d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
            </svg>
          </button>
          <button onClick={() => setActiveIndex(isOpen ? null : post._id)} className="transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill={isOpen ? "#3b82f6" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke={isOpen ? "#3b82f6" : "currentColor"} className="w-7 h-7">
              <path d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        </div>
      </div>

      {/* 📖 Word Area */}
      <div className="px-5 py-4 min-h-[140px]">
        <p className="text-[12px] font-black text-gray-400 mb-2 italic">
          🔥 {currentVocab.voteCount || 0} Likes — Word {currentVocabIdx + 1}/{deck.length}
        </p>
        <div key={currentVocabIdx} className="flex flex-col gap-1 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="flex items-center gap-4">
            <h2 className="text-5xl font-black text-gray-900 uppercase tracking-tighter leading-tight mb-2 italic">
              {currentVocab.word}
            </h2>
            
            <PremiumSoundFeature isPremiumUser={isPremiumUser}>
              <button 
                onClick={() => speakWord(currentVocab.word)} 
                className="p-2.5 rounded-full bg-red-50 hover:bg-red-100 active:scale-90 transition-all shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-red-600">
                  <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.5A2.25 2.25 0 002.25 9.75v4.5a2.25 2.25 0 002.25 2.25h1.94l4.5 4.5c.944.945 2.56.276 2.56-1.06V4.06z" />
                </svg>
              </button>
            </PremiumSoundFeature>
          </div>
          <p className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent italic leading-relaxed py-1">
            {currentVocab.meaning}
          </p>
        </div>
        
        <p onClick={() => setShowComments(true)} className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-5 cursor-pointer hover:text-black">
          {post.comments && post.comments.length > 0 ? `View all ${post.comments.length} comments` : "Add a comment..."}
        </p>
      </div>

      {/* 📊 Stats Section (Word Targeted) */}
      <div className={`px-4 mt-2 overflow-hidden transition-all duration-500 ${isOpen ? "max-h-60" : "max-h-0"}`}>
        <div className="bg-gray-50/50 rounded-[2rem] p-4 grid grid-cols-2 gap-3 border border-gray-100">
          {['easy', 'hard', 'heard', 'dailyUse'].map((lvl) => (
            <button key={lvl} onClick={(e) => handleStatUpdate(e, lvl)} className={`flex items-center justify-between p-3.5 rounded-2xl border-2 transition-all ${userLevel === lvl ? 'border-red-500 bg-white' : 'border-transparent bg-white/50'}`}>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase text-gray-500">{lvl}</span>
                </div>
                <span className="text-[11px] font-black text-gray-900">{currentVocab.commandStats?.[lvl] || 0}</span>
            </button>
          ))}
        </div>
      </div>

      {showComments && (
        <CommentModal post={post} userEmail={userEmail} API_URL={API_URL} onClose={() => setShowComments(false)} onRefresh={onRefresh} />
      )}
    </div>
  );
}