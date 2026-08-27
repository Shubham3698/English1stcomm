import React, { useState, useEffect, useRef } from 'react';
import toast from "react-hot-toast";
import { Capacitor } from '@capacitor/core';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { Volume2, Plus, X, Loader2, ChevronLeft, ChevronRight, Bookmark, ArrowRight } from "lucide-react";

// 🔥 IMPORT YOUR FULL SCRIPT HERE 🔥
import fullScriptData from '../full_script.json'; 

const ITEMS_PER_PAGE = 50; 

export default function MyScript() {
  const [isSaving, setIsSaving] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [playingIndex, setPlayingIndex] = useState(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  
  // 🔥 NEW: Saved Words State & Sidebar State 🔥
  const [savedWords, setSavedWords] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  const [popup, setPopup] = useState({ 
    visible: false, 
    phrase: '', 
    context: '', 
    x: 0, 
    y: 0,
    isAddingMode: false 
  });
  
  const popupRef = useRef(null);
  const audioRef = useRef(null);

  const isApp = Capacitor.isNativePlatform();
  let API_URL = "https://serdeptry1st.onrender.com"; 
  if (!isApp) {
    const currentHost = window.location.hostname;
    if (currentHost === "localhost" || currentHost === "127.0.0.1") {
      API_URL = "http://localhost:3000"; 
    } else if (currentHost.startsWith("192.168.")) {
      API_URL = `http://${currentHost}:3000`; 
    }
  }

  // Fetch previously saved words from backend
  useEffect(() => {
    const fetchSavedVocab = async () => {
      const userEmail = localStorage.getItem("eng_userEmail");
      if (!userEmail) return;
      try {
        const res = await fetch(`${API_URL}/api/mybucket/vocab?email=${userEmail}`);
        if(res.ok) {
          const data = await res.json();
          if(data.vocab) setSavedWords(data.vocab);
        }
      } catch (error) {
        console.log("Could not fetch old words");
      }
    };
    fetchSavedVocab();
  }, [API_URL]);

  useEffect(() => {
    audioRef.current = new Audio();
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (event.target.closest('.script-word')) return;

      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setPopup((prev) => ({ ...prev, visible: false, isAddingMode: false }));
        window.getSelection().removeAllRanges();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const playPremiumAudio = async (textToSpeak, blockIndex = null) => {
    if (!textToSpeak) return;
    
    if (audioRef.current) audioRef.current.pause();
    setIsPlayingAudio(true);
    if (blockIndex !== null) setPlayingIndex(blockIndex);

    try {
      const res = await fetch(`${API_URL}/api/words/speak`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToSpeak })
      });
      
      const data = await res.json();
      
      if (data.success && data.audioBase64) {
        audioRef.current.src = "data:audio/mp3;base64," + data.audioBase64;
        audioRef.current.onended = () => { setIsPlayingAudio(false); setPlayingIndex(null); };
        audioRef.current.onerror = () => fallbackSpeak(textToSpeak, blockIndex); 
        await audioRef.current.play();
      } else {
        throw new Error("Failed to fetch premium voice");
      }
    } catch (error) {
      fallbackSpeak(textToSpeak, blockIndex);
    }
  };

  const fallbackSpeak = async (text, blockIndex) => {
    try {
      if (isApp) {
        await TextToSpeech.speak({ text: text, lang: 'en-US', rate: 0.9, pitch: 1.2, volume: 1.0 });
        setIsPlayingAudio(false); setPlayingIndex(null);
      } else {
        if (window.speechSynthesis && window.speechSynthesis.cancel) window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "en-US"; utterance.pitch = 1.2; utterance.rate = 0.9;
        utterance.onend = () => { setIsPlayingAudio(false); setPlayingIndex(null); };
        window.speechSynthesis.speak(utterance);
      }
    } catch (err) { 
      setIsPlayingAudio(false); setPlayingIndex(null);
    }
  };

  const handleWordClick = (e, word, fullContext) => {
    e.stopPropagation();
    
    const cleanWord = word.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").trim().toLowerCase();
    if (!cleanWord) return;

    const x = Math.min(e.clientX - 100, window.innerWidth - 260); 
    const y = Math.min(e.clientY - 140, window.innerHeight - 180);

    setPopup(prev => {
      if (prev.isAddingMode) {
        return {
          ...prev,
          phrase: `${prev.phrase} ${cleanWord}`, 
          isAddingMode: false, 
          x: Math.max(10, x),
          y: Math.max(10, y)
        };
      } else {
        return {
          visible: true, 
          phrase: cleanWord, 
          context: fullContext, 
          x: Math.max(10, x), 
          y: Math.max(10, y),
          isAddingMode: false 
        };
      }
    });
  };

  const enableAddingMode = (e) => {
    e.stopPropagation();
    setPopup(prev => ({ ...prev, isAddingMode: true }));
    
    toast("Tap next word to combine...", {
      icon: '👆',
      duration: 2500,
      style: {
        background: '#333',
        color: '#fff',
        borderRadius: '20px',
        fontSize: '14px',
        fontWeight: 'bold',
        fontFamily: "'Plus Jakarta Sans', sans-serif"
      }
    });
  };

  const handleSaveToBucket = async () => {
    setIsSaving(true);
    const userEmail = localStorage.getItem("eng_userEmail") || "guest_user@gmail.com";

    try {
      const response = await fetch(`${API_URL}/api/mybucket/add-vocab`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word: popup.phrase,
          context: popup.context,
          source: "Onward Movie Script",
          userEmail: userEmail
        })
      });

      if (response.ok) {
        toast.success(`'${popup.phrase}' added! 🎯`);
        setSavedWords(prev => [{ word: popup.phrase, context: popup.context }, ...prev]);
        setPopup((prev) => ({ ...prev, visible: false, isAddingMode: false }));
        window.getSelection().removeAllRanges();
      } else {
        toast.error(`Failed to save ❌`);
      }
    } catch (error) {
      toast.error(`Network Error ❌`);
    } finally {
      setIsSaving(false);
    }
  };

  // 🔥 JUMP TO WORD LOGIC 🔥
  const handleJumpToPhrase = (savedItem) => {
    const blockIndex = fullScriptData.findIndex(block => 
      block.text && block.text.includes(savedItem.context)
    );

    if (blockIndex !== -1) {
      const targetPage = Math.floor(blockIndex / ITEMS_PER_PAGE) + 1;
      setCurrentPage(targetPage);
      setIsDrawerOpen(false);

      setTimeout(() => {
        const element = document.getElementById(`block-${blockIndex}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('bg-[#FFB800]/30', 'transition-all', 'duration-500', 'rounded-xl', 'p-2');
          setTimeout(() => {
            element.classList.remove('bg-[#FFB800]/30', 'p-2');
          }, 2000);
        }
      }, 300);
    } else {
      toast.error("Could not locate this phrase in the script!");
    }
  };

  const renderClickableText = (text) => {
    if (!text) return null;
    const sentences = text.match(/[^.!?]+[.!?]*/g) || [text];

    return sentences.map((sentence, sIdx) => {
      const cleanSentence = sentence.trim();
      
      return (
        <span key={`sentence-${sIdx}`} data-context={cleanSentence}>
          {cleanSentence.split(' ').map((word, wIdx) => {
            const cleanWord = word.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").trim().toLowerCase();
            const isSelected = popup.visible && popup.context === cleanSentence && popup.phrase.split(' ').includes(cleanWord);
            const isSaved = savedWords.some(sw => sw.context === cleanSentence && sw.word.split(' ').includes(cleanWord));

            return (
              <span 
                key={`word-${sIdx}-${wIdx}`} 
                onClick={(e) => handleWordClick(e, word, cleanSentence)}
                className={`script-word cursor-pointer px-[2px] rounded transition-all duration-200 inline-block font-body ${
                  isSelected 
                    ? 'bg-[#FFB800] text-[#8B004A] font-bold shadow-sm scale-105'
                    : isSaved 
                      ? 'text-[#E01A76] hover:bg-[#FFB800]/40' 
                      : 'hover:bg-[#FFB800]/40 hover:text-[#8B004A]'
                }`}
              >
                {word}{' '}
              </span>
            );
          })}
        </span>
      );
    });
  };

  // 🔥 PAGINATION CALCULATION 🔥
  const totalPages = Math.ceil((fullScriptData?.length || 0) / ITEMS_PER_PAGE);
  const currentScriptData = fullScriptData?.slice(
    (currentPage - 1) * ITEMS_PER_PAGE, 
    currentPage * ITEMS_PER_PAGE
  ) || [];

  // 🔥 MISSING PAGINATION FUNCTIONS RESTORED 🔥
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@600;700;800;900&display=swap');
          
          :root {
            --font-heading: 'Plus Jakarta Sans', sans-serif;
            --font-body: 'Inter', sans-serif;
          }
          .font-heading { font-family: var(--font-heading); }
          .font-body { font-family: var(--font-body); }

          @keyframes fade-in-up {
            0% { opacity: 0; transform: translateY(10px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in-up {
            animation: fade-in-up 0.3s ease-out forwards;
          }
        `}
      </style>

      <div className="min-h-screen bg-[#F2EFE7] text-gray-800 p-4 md:p-8 relative overflow-x-hidden pb-32 font-body selection:bg-[#FFB800]/30 selection:text-[#8B004A]">
        
        {/* GLOWING ORBS */}
        <div className="fixed top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-gradient-to-br from-[#E01A76]/20 to-[#8B004A]/10 rounded-full blur-[100px] pointer-events-none animate-pulse" style={{animationDuration: '6s'}}></div>
        <div className="fixed top-[30%] right-[-20%] w-[60vw] h-[60vw] bg-[#FFB800]/15 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-4xl mx-auto bg-white/95 backdrop-blur-md p-6 md:p-10 rounded-3xl shadow-[0_8px_32px_0_rgba(139,0,74,0.05)] border border-white relative z-10">
          
          {/* HEADER */}
          <div className="sticky top-0 bg-white/90 backdrop-blur-xl pb-4 pt-2 mb-8 border-b border-gray-100 z-20 flex flex-col sm:flex-row justify-between items-center gap-4 rounded-b-xl">
            <h1 className="text-[26px] font-black text-[#8B004A] font-heading tracking-tight drop-shadow-sm">
              Script Reader
            </h1>
            <div className="px-4 py-2 bg-[#8B004A]/10 text-[#8B004A] rounded-2xl border border-[#8B004A]/20 text-[13px] font-bold shadow-sm font-heading flex items-center gap-2">
              <span>Page <span className="text-[#E01A76] font-black">{currentPage}</span> of {totalPages}</span>
            </div>
          </div>

          {/* SCRIPT RENDERER */}
          <div className="space-y-6 text-[17px] leading-relaxed">
            {currentScriptData.map((block, relativeIndex) => {
              const absoluteIndex = (currentPage - 1) * ITEMS_PER_PAGE + relativeIndex;
              const isPlayingThis = playingIndex === absoluteIndex;
              
              const PlayButton = () => (
                <button 
                  onClick={() => playPremiumAudio(block.text, absoluteIndex)}
                  disabled={isPlayingAudio && !isPlayingThis}
                  className={`ml-3 p-1.5 rounded-full border-2 transition-all shrink-0 ${
                    isPlayingThis 
                      ? 'bg-[#FFB800] border-[#D99D00] text-[#8B004A] animate-pulse shadow-md scale-110' 
                      : 'bg-gray-50 hover:bg-white border-gray-200 text-gray-400 hover:text-[#E01A76] hover:border-[#E01A76]/50 hover:shadow-sm'
                  }`}
                >
                  <Volume2 size={16} strokeWidth={isPlayingThis ? 3 : 2.5}/>
                </button>
              );

              if (block.type === 'sceneHeading') {
                return (
                  <div key={absoluteIndex} id={`block-${absoluteIndex}`} className="pt-8 pb-2 font-black font-heading text-gray-900 uppercase flex items-center tracking-widest text-[15px] border-b-2 border-gray-100 w-max pr-4">
                    {renderClickableText(block.text)}
                    <PlayButton />
                  </div>
                );
              }
              if (block.type === 'action') {
                return (
                  <div key={absoluteIndex} id={`block-${absoluteIndex}`} className="text-gray-600 mb-6 relative font-body font-medium">
                    <span className="absolute -left-12 top-0 hidden md:flex items-center h-full"><PlayButton /></span>
                    {renderClickableText(block.text)}
                    <span className="md:hidden inline-flex align-middle"><PlayButton /></span>
                  </div>
                );
              }
              if (block.type === 'dialogue') {
                return (
                  <div key={absoluteIndex} id={`block-${absoluteIndex}`} className="flex flex-col md:flex-row gap-1 md:gap-6 my-5 bg-gradient-to-r from-gray-50 to-white p-5 rounded-2xl border border-gray-100 shadow-sm relative group hover:border-[#8B004A]/20 transition-colors">
                    <div className="md:w-1/4 text-left md:text-right pt-0.5 flex md:flex-col items-center md:items-end justify-between md:justify-start gap-2">
                      <span className="text-[#E01A76] font-black font-heading text-[14px] tracking-widest uppercase bg-[#E01A76]/10 px-3 py-1 rounded-xl">
                        {block.character}
                      </span>
                      <PlayButton />
                    </div>
                    <div className="md:w-3/4 text-gray-900 font-bold font-body text-[18px]">
                      {renderClickableText(block.text)}
                    </div>
                  </div>
                );
              }
              return null;
            })}
          </div>

          {/* PAGINATION CONTROLS */}
          <div className="mt-12 pt-6 border-t-2 border-dashed border-gray-200 flex justify-between items-center">
            <button 
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="flex items-center gap-2 px-5 py-3.5 bg-white border-2 border-gray-200 text-gray-600 rounded-2xl font-bold hover:border-[#8B004A]/50 hover:text-[#8B004A] disabled:opacity-40 disabled:hover:border-gray-200 transition-all font-heading shadow-sm active:scale-95"
            >
              <ChevronLeft size={20} strokeWidth={3}/> Prev
            </button>
            
            <button 
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-[#E01A76] to-[#8B004A] text-white rounded-2xl font-black hover:opacity-90 shadow-[0_8px_20px_rgba(139,0,74,0.25)] disabled:opacity-50 transition-all font-heading active:scale-95"
            >
              Next Page <ChevronRight size={20} strokeWidth={3}/>
            </button>
          </div>

        </div>

        {/* 🔥 POPUP 🔥 */}
        {popup.visible && !popup.isAddingMode && (
          <div 
            ref={popupRef}
            style={{ top: popup.y, left: popup.x }}
            className="fixed z-50 bg-white/95 backdrop-blur-xl border border-white w-[280px] rounded-2xl shadow-[0_20px_50px_rgba(139,0,74,0.25)] flex flex-col overflow-hidden animate-fade-in-up"
          >
            <div className="bg-gradient-to-r from-[#8B004A] to-[#E01A76] px-4 py-3.5 flex items-center relative">
              <span className="text-white font-black font-heading text-[18px] tracking-wide lowercase truncate flex-1 drop-shadow-md">
                {popup.phrase}
              </span>
              
              <button 
                onClick={enableAddingMode}
                className="p-2 bg-[#FFB800] text-[#8B004A] hover:bg-[#F0AD00] rounded-xl transition-transform active:scale-90 shadow-sm flex items-center gap-1"
                title="Combine next word"
              >
                <Plus size={18} strokeWidth={4}/>
              </button>

              <button 
                onClick={() => { setPopup({visible: false, isAddingMode: false}); window.getSelection().removeAllRanges(); }} 
                className="text-white/80 hover:text-white p-2 ml-1 active:scale-90 transition-transform"
              >
                <X size={20} strokeWidth={3}/>
              </button>
            </div>
            
            <div className="flex flex-col p-4 gap-3 bg-[#F2EFE7]/50">
              <div className="flex gap-2">
                <button 
                  onClick={() => playPremiumAudio(popup.phrase)}
                  disabled={isPlayingAudio}
                  className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-white border border-gray-200 hover:border-[#FFB800] hover:bg-[#FFB800]/10 hover:text-[#8B004A] transition-all text-gray-700 text-[13px] font-black shadow-sm disabled:opacity-50 active:scale-95 font-heading"
                >
                  <Volume2 size={18} strokeWidth={2.5}/> Phrase
                </button>
                <button 
                  onClick={() => playPremiumAudio(popup.context)}
                  disabled={isPlayingAudio}
                  className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-white border border-gray-200 hover:border-[#FFB800] hover:bg-[#FFB800]/10 hover:text-[#8B004A] transition-all text-gray-700 text-[13px] font-black shadow-sm disabled:opacity-50 active:scale-95 font-heading"
                >
                  <Volume2 size={18} strokeWidth={2.5}/> Line
                </button>
              </div>
              
              <button 
                onClick={handleSaveToBucket}
                disabled={isSaving}
                className="w-full flex items-center justify-center gap-2 p-3.5 rounded-xl bg-[#8B004A] hover:bg-[#E01A76] transition-all text-white text-[15px] font-black shadow-[0_5px_15px_rgba(139,0,74,0.3)] mt-1 disabled:opacity-50 active:scale-95 font-heading"
              >
                {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Plus size={20} strokeWidth={3}/>}
                {isSaving ? 'Saving...' : 'Add to Bucket'}
              </button>
            </div>
          </div>
        )}

{/* 🔥 FLOATING ACTION BUTTON (OPEN SAVED WORDS) 🔥 */}
        <button 
          onClick={() => setIsDrawerOpen(true)}
          // Yahan bottom-28 add kiya hai taaki mobile me upar dikhe, aur md:bottom-8 desktop ke liye
          className="fixed bottom-28 md:bottom-8 right-5 md:right-8 z-50 bg-gradient-to-r from-[#FFB800] to-[#F0AD00] text-[#8B004A] p-4 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center justify-center"
        >
          <Bookmark size={28} strokeWidth={2.5} />
          {savedWords.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-[#E01A76] text-white text-[11px] font-black w-6 h-6 flex items-center justify-center rounded-full border-2 border-white">
              {savedWords.length}
            </span>
          )}
        </button>
        {/* 🔥 SAVED WORDS SIDEBAR / DRAWER 🔥 */}
        <div className={`fixed inset-0 bg-[#4A0027]/40 backdrop-blur-sm z-[110] transition-opacity duration-300 ${isDrawerOpen ? "opacity-100 visible" : "opacity-0 invisible"}`} onClick={() => setIsDrawerOpen(false)} />
        
        <div className={`fixed top-0 right-0 h-full w-[90%] max-w-[360px] bg-[#F2EFE7] border-l-4 border-[#8B004A] z-[120] transform transition-transform duration-500 ease-in-out flex flex-col shadow-2xl ${isDrawerOpen ? "translate-x-0" : "translate-x-full"}`}>
          <div className="bg-white p-6 flex justify-between items-center border-b border-gray-200">
            <h2 className="text-xl font-black text-[#8B004A] font-heading flex items-center gap-2">
              <Bookmark size={20} /> My Bucket
            </h2>
            <button onClick={() => setIsDrawerOpen(false)} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-600 transition-colors">
              <X size={20} strokeWidth={2.5}/>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {savedWords.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 opacity-60">
                <Bookmark size={48} className="mb-4" />
                <p className="font-heading font-bold text-lg">No words saved yet</p>
                <p className="text-sm">Highlight and save words from the script to see them here.</p>
              </div>
            ) : (
              savedWords.map((item, idx) => (
                <div key={idx} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:border-[#FFB800] transition-all group">
                  <h3 className="font-black text-[#8B004A] text-lg mb-1">{item.word}</h3>
                  <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed mb-3">"{item.context}"</p>
                  
                  <button 
                    onClick={() => handleJumpToPhrase(item)}
                    className="w-full py-2.5 bg-gray-50 text-gray-600 hover:bg-[#FFB800] hover:text-[#8B004A] rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors border border-gray-200 hover:border-transparent font-heading"
                  >
                    Jump to word <ArrowRight size={16} strokeWidth={3}/>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </>
  );
}