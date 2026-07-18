import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { 
  Search, 
  History, 
  Volume2, 
  RefreshCw, 
  Sparkles, 
  Image as ImageIcon, 
  Upload, 
  ChevronDown,
  Compass,
  Swords
} from "lucide-react";

export default function VocabPage() {
  const navigate = useNavigate();
  const [word, setWord] = useState("");
  const [meaning, setMeaning] = useState("");
  const [sentences, setSentences] = useState("");
  const [partOfSpeech, setPartOfSpeech] = useState("");
  const [explanation, setExplanation] = useState("");
  const [synonyms, setSynonyms] = useState("");
  const [antonyms, setAntonyms] = useState("");

  const [activeWord, setActiveWord] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  
  // UX State for context badge
  const [contextBadge, setContextBadge] = useState("Active Target");

  // --- IMAGE STATES ---
  const [imageSrc, setImageSrc] = useState(null);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [imageAction, setImageAction] = useState(""); 
  const [isImageExpanded, setIsImageExpanded] = useState(false);

  // Custom Image Upload
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const [userEmail, setUserEmail] = useState("");
  const isInitialized = useRef(false);

  // 🔥 PLACEHOLDER TYPING ANIMATION STATES
  const [placeholderText, setPlaceholderText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const typingSpeed = isDeleting ? 60 : 120;
  
  const classicWords = [
  "Strategy...", 
  "Objective...", 
  "Efficiency...", 
  "Collaboration...", 
  "Innovation...", 
  "Optimization...", 
  "Productivity...", 
  "Leadership...", 
  "Execution...", 
  "Development..."
];

  useEffect(() => {
    let timer = setTimeout(() => {
      const i = loopNum % classicWords.length;
      const fullText = classicWords[i];

      setPlaceholderText(
        isDeleting
          ? fullText.substring(0, placeholderText.length - 1)
          : fullText.substring(0, placeholderText.length + 1)
      );

      if (!isDeleting && placeholderText === fullText) {
        setTimeout(() => setIsDeleting(true), 1500); // Pause when word completes
      } else if (isDeleting && placeholderText === "") {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
      }
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [placeholderText, isDeleting, loopNum]);


  const API_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:3000"
      : "https://serdeptry1st.onrender.com";

  useEffect(() => {
    const loggedInUserEmail = localStorage.getItem("eng_userEmail");
    if (loggedInUserEmail) {
      setUserEmail(loggedInUserEmail.trim());
    } else {
      setUserEmail("guest_user@gmail.com"); 
    }
  }, []);

  const handlePronounce = (textToSpeak) => {
    if (!textToSpeak) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = "en-US";
    utterance.pitch = 1;
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  };

  const fetchHistoryFromDB = async (isFirstLoad = false) => {
    if (!userEmail) return;
    try {
      const response = await fetch(`${API_URL}/api/words/history/${encodeURIComponent(userEmail)}`);
      const resData = await response.json();
      if (response.ok && resData.success) {
        const fetchedHistory = resData.data;
        setHistory(fetchedHistory);

        if (isFirstLoad) {
          if (fetchedHistory.length > 0) {
            loadFromHistoryCard(fetchedHistory[0], true);
            setContextBadge("Latest Resumed Target");
          } else {
            handleSearchWord("dog", false, true);
            setContextBadge("Default Example Target");
          }
        }
      }
    } catch (err) {
      console.error("History fetch error:", err);
    }
  };

  useEffect(() => {
    if (userEmail) {
      fetchHistoryFromDB(true);
    }
  }, [userEmail]);

  const handleGenerateImage = async (actionType = "normal", wordToGenerate, customPrompt = "") => {
    if (!wordToGenerate || !userEmail) return;
    
    setIsImageLoading(true);
    setImageAction(actionType);

    if (actionType === "normal") {
      setImageSrc(null);
      setIsImageExpanded(false);
    }

    try {
      const response = await fetch(`${API_URL}/api/image/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            phrase: wordToGenerate, 
            actionType, 
            userId: userEmail,
            customPrompt
        }),
      });

      const data = await response.json();

      if (response.ok && data.imageUrl) {
        setImageSrc(data.imageUrl);
        fetchHistoryFromDB(); 
        setIsImageExpanded(true); 
      } else {
        toast.error("Visual generation failed behind the scenes");
      }
    } catch (err) {
      console.error("Image Fetch error:", err);
    } finally {
      setIsImageLoading(false);
      setImageAction("");
    }
  };

  const handleCustomImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !userEmail || !activeWord) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("image", file);
    formData.append("word", activeWord);
    formData.append("userId", userEmail);

    try {
      const response = await fetch(`${API_URL}/api/image/upload-custom`, {
        method: "POST",
        body: formData, 
      });

      const data = await response.json();

      if (response.ok && data.imageUrl) {
        toast.success("Image successfully replaced! 🎉");
        setImageSrc(data.imageUrl); 
        fetchHistoryFromDB(); 
      } else {
        toast.error(data.error || "Custom image upload failed.");
      }
    } catch (err) {
      console.error("Custom Image Upload error:", err);
      toast.error("Upload error!");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = ""; 
    }
  };

  const handleSearchWord = async (wordToSearch = word, isAlternative = false, isSilent = false) => {
    const searchTarget = wordToSearch ? wordToSearch.trim() : "";
    if (!searchTarget && !isSilent) return toast.error("Please enter a word first ✍️");
    if (!userEmail || userEmail === "guest_user@gmail.com") {
        if (!isSilent) return toast.error("Please login first! 🚫");
    }

    setLoading(true);
    setShowHistory(false);
    if (!isSilent) setContextBadge("Analyzed Target");

    try {
      const response = await fetch(`${API_URL}/api/words/define`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: searchTarget, userId: userEmail, getAlternative: isAlternative }),
      });

      const resData = await response.json();

      if (response.ok && resData.success) {
        setActiveWord(resData.data.word);
        setPartOfSpeech(resData.data.partOfSpeech);
        setMeaning(resData.data.meaning);
        setExplanation(resData.data.explanation);
        setSynonyms(resData.data.synonyms);
        setAntonyms(resData.data.antonyms);
        setSentences(resData.data.sentences);

        if (!isSilent) {
          if (isAlternative) toast.success("New context generated! 🔄");
          else toast.success("Word analyzed 🚀");
          handlePronounce(resData.data.word);
        }
        
        setWord("");
        fetchHistoryFromDB();

        if (resData.data.imageUrl) {
            setImageSrc(resData.data.imageUrl);
            setIsImageExpanded(false); 
        } else {
            handleGenerateImage("normal", resData.data.word);
        }

      } else {
        if (!isSilent) toast.error(resData.message || "Server did not return data!");
      }
    } catch (err) {
      if (!isSilent) toast.error("Failed to connect to backend!");
    } finally {
      setLoading(false);
    }
  };

  const loadFromHistoryCard = (item, isSilent = false) => {
    setActiveWord(item.word);
    setPartOfSpeech(item.partOfSpeech || "Vocabulary");
    setMeaning(item.meaning);
    setExplanation(item.explanation);
    setSynonyms(item.synonyms);
    setAntonyms(item.antonyms);
    setSentences(item.sentences);
    setShowHistory(false);
    
    if (!isSilent) {
      setContextBadge("Historical Target");
      handlePronounce(item.word);
    }
    
    if (item.imageUrl) {
        setImageSrc(item.imageUrl);
        setIsImageExpanded(false);
    } else {
        handleGenerateImage("normal", item.word);
    }
  };

  const totalUniqueWords = new Set(history.map(item => item.word.toLowerCase())).size;

  return (
    <div className="min-h-screen bg-[#F2EFE7] text-gray-900 flex flex-col items-center p-4 py-8 font-sans transition-colors duration-500 pb-28 overflow-x-hidden w-full">
      <Toaster 
        position="top-center" 
        toastOptions={{
          style: {
            background: '#8B004A',
            color: '#F2EFE7',
            border: 'none',
            fontWeight: 'bold'
          }
        }}
      />

      {/* TOP STATUS BAR */}
      <div className="w-full max-w-2xl bg-white rounded-[2rem] p-4 sm:p-5 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-[3px] border-[#8B004A]/10 shadow-xl shadow-[#8B004A]/5">
        <div className="flex items-center space-x-4 w-full sm:w-auto">
          <div className="bg-[#8B004A]/10 p-3 rounded-2xl text-[#8B004A] flex-shrink-0">
            <History size={24} strokeWidth={2.5} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-black text-gray-900 text-sm tracking-wide truncate">Dameeto Profile</h3>
            <p className="text-gray-500 font-bold text-xs truncate uppercase tracking-widest mt-0.5">
              {userEmail === "guest_user@gmail.com" ? "Guest Mode" : userEmail}
            </p>
          </div>
        </div>
        <div className="flex gap-4 sm:gap-5 text-right bg-[#F2EFE7] px-4 sm:px-5 py-3 rounded-2xl border border-gray-200 w-full sm:w-auto justify-between sm:justify-end">
          <div>
            <span className="text-[9px] text-gray-400 font-black uppercase block tracking-[0.2em]">Queries</span>
            <span className="text-base font-black text-gray-800">{history.length}</span>
          </div>
          <div className="border-l-2 border-gray-300 pl-4 sm:pl-5">
            <span className="text-[9px] text-gray-400 font-black uppercase block tracking-[0.2em]">Unique</span>
            <span className="text-base font-black text-[#E01A76]">{totalUniqueWords}</span>
          </div>
        </div>
      </div>

      <div className="w-full max-w-2xl">
        {/* BRANDING HEADER WITH ACTION BUTTONS */}
        <div className="px-2 mb-6 sm:mb-8 flex flex-col sm:flex-row justify-between sm:items-end gap-5">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="bg-[#FFB800] text-[#4A0027] text-[10px] px-3 py-1 rounded-md font-black tracking-widest uppercase shadow-sm flex items-center gap-1.5 w-max">
                <Compass size={12} strokeWidth={3} /> PREMIUM NODE
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-[#8B004A] tracking-wide drop-shadow-sm break-words">Vocab Mastery</h1>
            <p className="text-gray-500 font-black text-xs mt-1.5 uppercase tracking-[0.2em] opacity-80 break-words">AI-Driven Structural Lexicon</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => navigate('/find-vocab')}
              className="flex items-center justify-center gap-2 text-xs font-black text-white hover:text-white bg-[#8B004A] hover:bg-[#E01A76] transition-all px-5 py-3.5 rounded-xl border-2 border-transparent hover:border-[#8B004A] shadow-md active:scale-95 uppercase tracking-widest w-full sm:w-auto"
            >
              <Swords size={16} strokeWidth={2.5} className="flex-shrink-0" /> Practice Stack
            </button>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center justify-center gap-2 text-xs font-black text-[#8B004A] hover:text-white hover:bg-[#8B004A] transition-all bg-white px-5 py-3.5 rounded-xl border-2 border-[#8B004A]/20 shadow-sm active:scale-95 uppercase tracking-widest w-full sm:w-auto"
            >
              {showHistory ? "Close Stack" : "View Stack"}
              <ChevronDown size={16} className={`transform transition-transform duration-500 flex-shrink-0 ${showHistory ? 'rotate-180' : ''}`} strokeWidth={3} />
            </button>
          </div>
        </div>

        {/* HISTORY DROPDOWN PANEL */}
        <div className={`w-full grid transition-all duration-500 ease-in-out ${showHistory ? 'grid-rows-[1fr] opacity-100 mb-8 mt-2' : 'grid-rows-[0fr] opacity-0 mb-0 mt-0'}`}>
          <div className="overflow-hidden">
            <div className="bg-white border-[3px] border-[#8B004A]/20 rounded-3xl p-5 sm:p-6 shadow-xl shadow-[#8B004A]/10 relative w-full mt-1">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-[#8B004A]"></div>
              <h4 className="text-xs font-black text-gray-400 uppercase mb-4 tracking-[0.2em] break-words">Your Word Arsenal</h4>
              {history.length === 0 ? (
                <p className="text-center text-sm font-black text-gray-400 py-6 uppercase tracking-wider">No words discovered yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                  {history.map((item) => (
                    <div
                      key={item._id}
                      className="bg-[#F2EFE7] border-2 border-transparent hover:border-[#E01A76] rounded-2xl p-4 text-left transition-all group shadow-sm hover:shadow-md w-full flex flex-col overflow-hidden"
                    >
                      <div 
                        className="flex-1 cursor-pointer mb-3" 
                        onClick={() => loadFromHistoryCard(item)}
                      >
                        <div className="text-gray-900 text-sm font-black truncate group-hover:text-[#E01A76] tracking-wide w-full">
                          {item.word} {item.imageUrl && "🖼️"}
                        </div>
                        <div className="text-[10px] font-bold text-gray-500 truncate mt-1.5 tracking-wider w-full">
                          {item.meaning}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-auto pt-3 border-t-2 border-gray-200">
                         <button
                           onClick={(e) => { 
                             e.stopPropagation(); 
                             loadFromHistoryCard(item); 
                           }}
                           className="flex-1 bg-white hover:bg-[#8B004A] text-[#8B004A] hover:text-white border border-gray-200 hover:border-transparent py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                         >
                           <Search size={12} strokeWidth={3} /> Analyze
                         </button>
                         <button
                           onClick={(e) => { 
                             e.stopPropagation(); 
                             navigate('/find-vocab'); 
                           }}
                           className="flex-1 bg-gray-900 hover:bg-[#E01A76] text-white py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                         >
                           <Swords size={12} strokeWidth={3} /> Practice
                         </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 🔥 SINGLE LINE SEARCH BAR WITH ANIMATION 🔥 */}
        <div className="w-full mb-10 group">
          <div className="relative flex items-center bg-white border-[3px] border-[#8B004A]/20 hover:border-[#8B004A]/40 focus-within:border-[#E01A76] rounded-full p-1.5 sm:p-2 shadow-sm transition-all duration-300 w-full">
            <Search className="absolute left-6 text-[#8B004A] transition-transform group-focus-within:scale-110 flex-shrink-0" size={22} strokeWidth={2.5} />
            <input
              type="text"
              placeholder={`Analyze: ${placeholderText}`}
              value={word}
              onChange={(e) => setWord(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearchWord()}
              className="flex-1 bg-transparent pl-14 sm:pl-16 pr-4 py-3 sm:py-4 outline-none text-gray-900 font-black placeholder-gray-400 text-sm sm:text-base w-full"
            />
            <button
              onClick={() => handleSearchWord()}
              disabled={loading}
              className="bg-[#8B004A] hover:bg-[#6a0038] text-white px-6 sm:px-10 py-3 sm:py-4 rounded-full text-sm font-black uppercase tracking-widest transition-all shadow-xl shadow-[#8B004A]/30 disabled:opacity-70 disabled:cursor-not-allowed border-none active:scale-95 flex items-center justify-center gap-2 flex-shrink-0"
            >
              {loading ? (
                <RefreshCw size={18} className="animate-spin flex-shrink-0" />
              ) : "GO"}
            </button>
          </div>
        </div>

        {/* RESULT CARD - Deep Engaging View */}
        {activeWord && (
          <div className="space-y-4 animate-fade-in relative w-full">
            
            <div className="flex justify-end pr-2 w-full">
              <div className="bg-[#E01A76] text-white rounded-3xl rounded-tr-sm px-5 sm:px-6 py-4 text-xs font-black leading-relaxed max-w-[95%] sm:max-w-[85%] shadow-lg shadow-[#E01A76]/20 break-words">
                Explain the exact Hindi meaning, context, and examples for <span className="text-[#FFB800] uppercase tracking-wider text-sm mx-1 break-all">"{activeWord}"</span>.
              </div>
            </div>

            <div className="bg-white border-[4px] border-[#8B004A]/10 rounded-[2.5rem] p-5 sm:p-8 shadow-2xl relative overflow-hidden mt-2 w-full">
              
              <div className="absolute top-0 right-0 bg-[#F2EFE7] text-[#8B004A] px-3 sm:px-4 py-1.5 rounded-bl-2xl font-black text-[8px] sm:text-[9px] uppercase tracking-[0.2em] border-b-2 border-l-2 border-[#8B004A]/10 max-w-[60%] truncate text-right">
                {contextBadge}
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b-2 border-gray-100 pb-5 mb-5 mt-6 sm:mt-2 gap-4">
                <div className="w-full sm:w-auto min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-3xl sm:text-5xl font-black text-[#8B004A] capitalize drop-shadow-sm tracking-tight break-all">
                      {activeWord}
                    </h2>
                    <span className="bg-[#8B004A] text-[#F2EFE7] text-[10px] px-3 py-1.5 rounded-lg font-black uppercase tracking-widest shadow-sm flex-shrink-0">
                      {partOfSpeech}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handlePronounce(activeWord)}
                  className="bg-[#F2EFE7] hover:bg-[#8B004A] p-4 rounded-full text-[#8B004A] hover:text-white transition-all border-2 border-transparent hover:border-white shadow-sm active:scale-90 flex-shrink-0 self-end sm:self-auto"
                  title="Listen to pronunciation"
                >
                  <Volume2 size={24} strokeWidth={2.5} />
                </button>
              </div>

              <div className="space-y-6 text-sm w-full">
                <div className="space-y-4">
                  <div className="bg-[#F2EFE7] rounded-2xl p-5 sm:p-6 border-l-[6px] border-[#E01A76] shadow-inner w-full">
                    <span className="text-[#8B004A]/70 text-[10px] uppercase font-black tracking-[0.2em] mb-2 block">Meaning</span>
                    <p className="text-[#8B004A] font-black text-xl sm:text-2xl leading-snug break-words">{meaning}</p>
                  </div>
                  
                  <div className="pl-4 sm:pl-5 border-l-[3px] border-[#FFB800] w-full">
                    <p className="text-gray-700 font-bold leading-relaxed text-sm break-words">{explanation}</p>
                  </div>
                </div>

                <div className="pt-2 w-full">
                  <span className="text-gray-500 text-[10px] uppercase font-black tracking-widest mb-3 flex items-center gap-2">
                    <Sparkles size={16} className="text-[#FFB800] flex-shrink-0" strokeWidth={2.5} /> Practical Application
                  </span>
                  <div className="bg-gray-50 rounded-2xl p-5 sm:p-6 border-2 border-dashed border-gray-200 text-gray-800 whitespace-pre-line font-bold text-sm leading-loose shadow-sm break-words w-full overflow-hidden">
                    {sentences}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 w-full">
                  <div className="bg-white border-[3px] border-gray-100 rounded-2xl p-5 shadow-sm overflow-hidden">
                    <span className="text-[#8B004A]/60 font-black text-[10px] uppercase tracking-[0.2em] block mb-2">Similar Words</span>
                    <span className="text-gray-900 font-black text-sm tracking-wide break-words block">{synonyms || "N/A"}</span>
                  </div>
                  <div className="bg-white border-[3px] border-gray-100 rounded-2xl p-5 shadow-sm overflow-hidden">
                    <span className="text-[#8B004A]/60 font-black text-[10px] uppercase tracking-[0.2em] block mb-2">Opposite Words</span>
                    <span className="text-gray-900 font-black text-sm tracking-wide break-words block">{antonyms || "N/A"}</span>
                  </div>
                </div>

                <div className="pt-8 mt-6 border-t-2 border-gray-100 w-full">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-500 text-[10px] uppercase font-black tracking-widest flex items-center gap-2">
                      <ImageIcon size={18} className="text-[#E01A76] flex-shrink-0" strokeWidth={2.5} /> Memory Anchor
                    </span>
                  </div>
                  
                  <div className={`w-full rounded-[2rem] bg-[#F2EFE7] border-[3px] border-gray-200 shadow-inner flex flex-col items-center justify-center overflow-hidden relative transition-all duration-500 ${!isImageExpanded ? 'py-10 sm:py-12' : ''}`}>
                    
                    {(isImageLoading || isUploading) && (
                      <div className="flex flex-col items-center justify-center gap-4 absolute inset-0 bg-[#F2EFE7]/90 backdrop-blur-sm z-10 min-h-[150px]">
                        <div className="w-10 h-10 border-[4px] border-[#E01A76] border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-[#8B004A] font-black text-[10px] uppercase tracking-[0.2em] animate-pulse text-center px-4">
                          {isUploading ? 'Uploading Data...' : 'Rendering Visual...'}
                        </p>
                      </div>
                    )}

                    {imageSrc && !isImageExpanded && !isImageLoading && !isUploading && (
                      <div className="flex flex-col items-center text-center px-4 animate-fade-in w-full">
                        <div className="bg-white p-4 sm:p-5 rounded-full mb-4 text-[#8B004A] shadow-md border-2 border-gray-100 flex-shrink-0">
                          <ImageIcon size={32} strokeWidth={2} />
                        </div>
                        <h3 className="text-lg font-black text-gray-900 mb-1 break-words">Visual Concept Ready</h3>
                        <p className="text-gray-500 font-bold text-[10px] uppercase tracking-widest mb-6 break-words px-2">Tap to burn "{activeWord}" into memory</p>
                        <button 
                          onClick={() => setIsImageExpanded(true)}
                          className="px-8 sm:px-10 py-4 bg-[#8B004A] hover:bg-[#E01A76] text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-[#8B004A]/20 active:scale-95 border-none w-full sm:w-auto"
                        >
                          Reveal Imagery
                        </button>
                      </div>
                    )}

                    {imageSrc && isImageExpanded && (
                      <img 
                        src={imageSrc} 
                        alt={activeWord} 
                        className="w-full h-auto max-h-[450px] object-cover transition-opacity duration-700 block"
                      />
                    )}
                  </div>

                  {imageSrc && isImageExpanded && (
                    <div className="flex flex-wrap sm:flex-nowrap gap-2 sm:gap-3 mt-4 justify-center animate-fade-in w-full">
                      <button
                        onClick={() => handleGenerateImage('regenerate', activeWord)}
                        disabled={isImageLoading || isUploading}
                        className="flex-1 w-full sm:w-auto py-4 px-2 bg-white hover:bg-[#F2EFE7] text-[#8B004A] text-[9px] sm:text-[10px] font-black rounded-xl disabled:opacity-50 transition-all border-2 border-gray-200 hover:border-[#8B004A]/30 flex justify-center items-center gap-1.5 sm:gap-2 uppercase tracking-widest shadow-sm active:scale-95"
                      >
                        <RefreshCw size={14} className="sm:w-4 sm:h-4" strokeWidth={2.5} /> <span className="truncate">Regenerate</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          const userIdea = window.prompt("Custom visual prompt (e.g., 'A modern neon city'):");
                          if (userIdea !== null && userIdea.trim() !== "") {
                            handleGenerateImage('refine', activeWord, userIdea);
                          }
                        }}
                        disabled={isImageLoading || isUploading}
                        className="flex-1 w-full sm:w-auto py-4 px-2 bg-white hover:bg-[#F2EFE7] text-[#8B004A] text-[9px] sm:text-[10px] font-black rounded-xl disabled:opacity-50 transition-all border-2 border-gray-200 hover:border-[#8B004A]/30 flex justify-center items-center gap-1.5 sm:gap-2 uppercase tracking-widest shadow-sm active:scale-95"
                      >
                        <Sparkles size={14} className="sm:w-4 sm:h-4" strokeWidth={2.5} /> <span className="truncate">Custom</span>
                      </button>

                      <button
                        onClick={() => fileInputRef.current.click()}
                        disabled={isImageLoading || isUploading}
                        className="flex-1 w-full sm:w-auto py-4 px-2 bg-white hover:bg-[#F2EFE7] text-[#8B004A] text-[9px] sm:text-[10px] font-black rounded-xl disabled:opacity-50 transition-all border-2 border-gray-200 hover:border-[#8B004A]/30 flex justify-center items-center gap-1.5 sm:gap-2 uppercase tracking-widest shadow-sm active:scale-95"
                      >
                        <Upload size={14} className="sm:w-4 sm:h-4" strokeWidth={2.5} /> <span className="truncate">Upload</span>
                      </button>

                      <input 
                        type="file" 
                        accept="image/*" 
                        ref={fileInputRef} 
                        onChange={handleCustomImageUpload} 
                        className="hidden" 
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-center sm:justify-end border-t-2 border-gray-100 mt-8 pt-5 w-full">
                <button
                  onClick={() => handleSearchWord(activeWord, true)}
                  disabled={loading}
                  className="text-[10px] bg-[#F2EFE7] hover:bg-[#8B004A] text-[#8B004A] hover:text-white flex items-center justify-center gap-2 font-black transition-all uppercase tracking-[0.2em] px-5 py-3.5 rounded-xl shadow-sm active:scale-95 w-full sm:w-auto"
                >
                  <RefreshCw size={14} strokeWidth={2.5} className="flex-shrink-0" /> Alternative Context
                </button>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}