import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import PostCard from "../components/PostCard"; 
import VisualAnchor from "../components/ai-wordsimg/VisualAnchor"; 

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
  Swords,
  Share2,
  Globe, 
  Loader2,
  BookOpen,
  ArrowRight,
  Zap,
  X 
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
  
  const [flippedCards, setFlippedCards] = useState({});
  const [contextBadge, setContextBadge] = useState("Active Target");

  const [imageGallery, setImageGallery] = useState([]);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [imageAction, setImageAction] = useState(""); 
  const [isImageExpanded, setIsImageExpanded] = useState(false);

  const [isUploading, setIsUploading] = useState(false);
  const [isSharing, setIsSharing] = useState(false); 
  const fileInputRef = useRef(null);

  const [userEmail, setUserEmail] = useState("");
  const isPremiumUser = localStorage.getItem("eng_isPremium") === "true"; 
  const isInitialized = useRef(false);

  const [relatedPosts, setRelatedPosts] = useState([]);
  const [isFetchingPosts, setIsFetchingPosts] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);
  const [resultView, setResultView] = useState("ai");

  const [sharedPostId, setSharedPostId] = useState(null);

  const [placeholderText, setPlaceholderText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const typingSpeed = isDeleting ? 60 : 120;
  
  const classicWords = [
    "Strategy...", "Objective...", "Efficiency...", "Collaboration...", 
    "Innovation...", "Optimization...", "Productivity...", "Leadership...", 
    "Execution...", "Development..."
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
        setTimeout(() => setIsDeleting(true), 1500); 
      } else if (isDeleting && placeholderText === "") {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
      }
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [placeholderText, isDeleting, loopNum]);

  const API_URL = window.location.hostname === "localhost"
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
    utterance.pitch = 1.2; // Thoda playful voice pitch
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const fetchRelatedPosts = async (searchWord) => {
    if (!searchWord) return;
    setIsFetchingPosts(true);
    setRelatedPosts([]); 
    try {
      const res = await fetch(`${API_URL}/api/english-posts/all`);
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        const query = searchWord.toLowerCase().trim();
        const matchedPosts = data.filter(post => {
          return post.title?.toLowerCase().includes(query) || 
                 post.word?.toLowerCase().includes(query) ||
                 (Array.isArray(post.vocabData) && post.vocabData.some(v => v.word?.toLowerCase().includes(query)));
        });
        setRelatedPosts(matchedPosts);

        const existingPost = matchedPosts.find(p => p.userEmail === userEmail && p.word?.toLowerCase() === query);
        if (existingPost) {
          setSharedPostId(existingPost._id);
        } else {
          setSharedPostId(null);
        }
      }
    } catch (err) {
      console.error("Failed to fetch related community posts:", err);
    } finally {
      setIsFetchingPosts(false);
    }
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
            setContextBadge("Latest Resumed");
          } else {
            handleSearchWord("magic", false, true); // Swapped 'dog' with 'magic' for a playful vibe
            setContextBadge("Example Target");
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

  const handleUpdateCommunityPost = async (updatedMeaning, updatedSentences, updatedGallery, isManualClick = false) => {
    if (!sharedPostId || !userEmail) return;
    const currentImages = updatedGallery || imageGallery;
    const data = new FormData();
    data.append("title", `Lexicon Entry: ${activeWord.toUpperCase()}`); 
    data.append("word", activeWord);
    data.append("meaning", updatedMeaning || meaning);
    data.append("sentence", updatedSentences || sentences || "");

    const vocabData = [{
      word: activeWord,
      meaning: updatedMeaning || meaning,
      sentence: updatedSentences || sentences || "",
      media: currentImages.map(url => ({ type: 'image', url })) 
    }];
    data.append("vocabData", JSON.stringify(vocabData));

    const mediaMetadata = currentImages.map((url) => ({
      type: 'image',
      url: url,   
      value: url,
      mode: 'url',
      vocabIndex: 0
    }));
    data.append("mediaMetadata", JSON.stringify(mediaMetadata));

    try {
      const res = await fetch(`${API_URL}/api/english-posts/update/${sharedPostId}`, {
        method: "PUT", 
        body: data
      });

      if (res.ok) {
        if (isManualClick) toast.success("Community Post Updated! 🔄✨");
        else toast.success("Community Post Auto-Updated! 🔄");
        fetchRelatedPosts(activeWord); 
      }
    } catch (e) {
      console.error("Failed to auto-update post", e);
    }
  };

  const handleGenerateImage = async (actionType = "normal", wordToGenerate, customPrompt = "", skipPostUpdate = false) => {
    if (!wordToGenerate || !userEmail) return;
    setIsImageLoading(true);
    setImageAction(actionType);
    if (actionType === "normal") {
      setImageGallery([]); 
      setIsImageExpanded(false);
    }

    try {
      const response = await fetch(`${API_URL}/api/image/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phrase: wordToGenerate, actionType, userId: userEmail, customPrompt }),
      });
      const data = await response.json();

      if (response.ok && data.imageUrl) {
        const updatedGallery = actionType === "normal" ? [data.imageUrl] : [...imageGallery, data.imageUrl];
        setImageGallery(updatedGallery);
        
        if (actionType !== "normal") {
          try {
            await fetch(`${API_URL}/api/words/update-images`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ word: activeWord, userId: userEmail, imageUrls: updatedGallery })
            });
          } catch(err) {
            console.error("History sync failed", err);
          }
        }
        fetchHistoryFromDB(); 
        setIsImageExpanded(true); 
        if (sharedPostId && !skipPostUpdate) handleUpdateCommunityPost(meaning, sentences, updatedGallery);
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
      const response = await fetch(`${API_URL}/api/image/upload-custom`, { method: "POST", body: formData });
      const data = await response.json();
      if (response.ok && data.imageUrl) {
        toast.success("Image added to gallery! 🎉");
        const updatedGallery = [...imageGallery, data.imageUrl]; 
        setImageGallery(updatedGallery); 
        try {
          await fetch(`${API_URL}/api/words/update-images`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ word: activeWord, userId: userEmail, imageUrls: updatedGallery })
          });
        } catch(err) {
          console.error("History sync failed", err);
        }
        fetchHistoryFromDB(); 
        if (sharedPostId) handleUpdateCommunityPost(meaning, sentences, updatedGallery);
      } else {
        toast.error(data.error || "Custom image upload failed.");
      }
    } catch (err) {
      toast.error("Upload error!");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = ""; 
    }
  };

  const handleRemoveImage = async (indexToRemove) => {
    const updatedGallery = imageGallery.filter((_, index) => index !== indexToRemove);
    setImageGallery(updatedGallery);
    if (sharedPostId) handleUpdateCommunityPost(meaning, sentences, updatedGallery, true);
    try {
      const response = await fetch(`${API_URL}/api/words/update-images`, {
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: activeWord, userId: userEmail, imageUrls: updatedGallery })
      });
      if (response.ok) {
        toast.success("Image removed permanently 🗑️");
        fetchHistoryFromDB(); 
      }
    } catch (err) {}
  };

  const handleSearchWord = async (wordToSearch = word, isAlternative = false, isSilent = false) => {
    const searchTarget = wordToSearch ? wordToSearch.trim() : "";
    if (!searchTarget && !isSilent) return toast.error("Please enter a word first ✍️");
    if (!userEmail || userEmail === "guest_user@gmail.com") {
        if (!isSilent) return toast.error("Please login first! 🚫");
    }

    if (!isAlternative) setSharedPostId(null);
    setLoading(true);
    setShowHistory(false);
    setResultView("ai"); 
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
          else toast.success("Word analyzed! 🚀");
          handlePronounce(resData.data.word);
        }
        
        setWord("");
        fetchHistoryFromDB();
        fetchRelatedPosts(resData.data.word); 

        let newGallery = [];
        if (resData.data.imageUrls && resData.data.imageUrls.length > 0) newGallery = resData.data.imageUrls;
        else if (resData.data.imageUrl) newGallery = [resData.data.imageUrl]; 

        setImageGallery(newGallery);
        setIsImageExpanded(false); 

        if (isAlternative && sharedPostId) handleUpdateCommunityPost(resData.data.meaning, resData.data.sentences, newGallery);
        if (newGallery.length === 0) handleGenerateImage("normal", resData.data.word, "", true);

      } else {
        if (!isSilent) toast.error(resData.message || "Server did not return data!");
      }
    } catch (err) {
      if (!isSilent) toast.error("Failed to connect to backend!");
    } finally {
      setLoading(false);
    }
  };

  const handleShareToCommunity = async () => {
    if (!userEmail || userEmail === "guest_user@gmail.com") return toast.error("Please login to share with the community! 🚫");
    if (!activeWord || !meaning) return toast.error("No word data to share!");
    if (sharedPostId) {
      await handleUpdateCommunityPost(meaning, sentences, imageGallery, true);
      setResultView("posts");
      return;
    }

    setIsSharing(true);
    const data = new FormData();
    data.append("userEmail", userEmail);
    data.append("title", `Lexicon Entry: ${activeWord.toUpperCase()}`); 
    data.append("word", activeWord);
    data.append("meaning", meaning);
    data.append("sentence", sentences || "");

    const vocabData = [{
      word: activeWord, meaning: meaning, sentence: sentences || "",
      media: imageGallery.map(url => ({ type: 'image', url })) 
    }];
    data.append("vocabData", JSON.stringify(vocabData));

    if (imageGallery.length > 0) {
      const mediaMetadata = imageGallery.map(url => ({ type: 'image', url: url, value: url, mode: 'url', vocabIndex: 0 }));
      data.append("mediaMetadata", JSON.stringify(mediaMetadata));
    }

    try {
      const res = await fetch(`${API_URL}/api/english-posts/create`, { method: "POST", body: data });
      const postResponseData = await res.json(); 

      if (res.ok) {
        toast.success("Word Shared to Community! 🌍✨");
        const newPostId = postResponseData.post?._id || postResponseData.data?._id || postResponseData._id;
        if (newPostId) setSharedPostId(newPostId);
        fetchRelatedPosts(activeWord);
        setResultView("posts"); 
      } else {
        toast.error("Failed to share word.");
      }
    } catch (e) {
      toast.error("Network Error! Could not share.");
    } finally {
      setIsSharing(false);
    }
  };

  const loadFromHistoryCard = (item, isSilent = false) => {
    setSharedPostId(null);
    setActiveWord(item.word);
    setPartOfSpeech(item.partOfSpeech || "Vocabulary");
    setMeaning(item.meaning);
    setExplanation(item.explanation);
    setSynonyms(item.synonyms);
    setAntonyms(item.antonyms);
    setSentences(item.sentences);
    setShowHistory(false);
    setResultView("ai"); 
    
    if (!isSilent) {
      setContextBadge("Historical Target");
      handlePronounce(item.word);
    }
    fetchRelatedPosts(item.word);
    
    if (item.imageUrls && item.imageUrls.length > 0) {
        setImageGallery(item.imageUrls);
        setIsImageExpanded(false);
    } else if (item.imageUrl) {
        setImageGallery([item.imageUrl]); 
        setIsImageExpanded(false);
    } else {
        setImageGallery([]);
        handleGenerateImage("normal", item.word, "", true);
    }
  };

  const toggleFlip = (id) => setFlippedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  const totalUniqueWords = new Set(history.map(item => item.word.toLowerCase())).size;

  return (
    <>
      <style>
        {`
          /* NEW: Playful & Readable Educational Fonts */
          @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;600;700;800&family=Kalam:wght@400;700&display=swap');
          
          :root {
            --font-body: 'Nunito', sans-serif;
            --font-display: 'Fredoka', sans-serif;
            --font-hand: 'Kalam', cursive;
          }

          .font-body { font-family: var(--font-body) !important; }
          .font-playful { font-family: var(--font-display) !important; }
          .font-hand { font-family: var(--font-hand) !important; }

          /* TACTILE 3D BUTTONS (Duolingo Style) */
          .btn-3d {
            transition: transform 0.1s cubic-bezier(0.4, 0, 0.2, 1), border-width 0.1s;
            border-bottom-width: 4px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          .btn-3d:active:not(:disabled) {
            transform: translateY(4px);
            border-bottom-width: 0px !important;
            margin-top: 4px; /* prevents layout shift */
          }
          
          .btn-3d-primary {
            background-color: #E01A76;
            border-color: #8B004A;
            color: white;
          }
          .btn-3d-primary:hover { background-color: #f02585; }

          .btn-3d-secondary {
            background-color: white;
            border-color: #cbd5e1; /* slate-300 */
            color: #8B004A;
          }
          .btn-3d-secondary:hover { background-color: #f8fafc; }

          /* Vibrant background dots */
          .bg-dots {
            background-image: radial-gradient(#E01A76 1px, transparent 1px);
            background-size: 24px 24px;
            background-position: 0 0, 12px 12px;
            background-color: white;
            opacity: 0.98;
          }

          /* STAGGERED FADE-IN ANIMATIONS */
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(15px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-stagger-1 { animation: fadeInUp 0.4s ease-out forwards; animation-delay: 0.05s; opacity: 0; }
          .animate-stagger-2 { animation: fadeInUp 0.4s ease-out forwards; animation-delay: 0.1s; opacity: 0; }
          .animate-stagger-3 { animation: fadeInUp 0.4s ease-out forwards; animation-delay: 0.15s; opacity: 0; }
          .animate-stagger-4 { animation: fadeInUp 0.4s ease-out forwards; animation-delay: 0.2s; opacity: 0; }

          .flip-card { perspective: 1000px; }
          .flip-card-inner {
            transform-style: preserve-3d;
            transition: transform 0.6s cubic-bezier(0.4, 0.2, 0.2, 1);
          }
          .flip-card-flipped { transform: rotateY(180deg); }
          .flip-card-front, .flip-card-back {
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
          }
          .flip-card-back { transform: rotateY(180deg); }
          .line-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}
      </style>

      {/* Main Container - Applied Nunito body font */}
      <div className="min-h-screen bg-[#F2EFE7] text-gray-900 flex flex-col items-center p-4 py-8 font-body transition-colors duration-500 pb-28 overflow-x-hidden w-full relative selection:bg-[#FFB800] selection:text-[#8B004A]">
        
        {/* Soft Playful Background Glows */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#E01A76]/10 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-[#FFB800]/15 rounded-full blur-[80px] pointer-events-none"></div>

        <Toaster 
          position="top-center" 
          toastOptions={{
            style: {
              background: '#8B004A',
              color: '#F2EFE7',
              border: '2px solid #E01A76',
              fontFamily: 'Fredoka, sans-serif',
              fontWeight: '600',
              borderRadius: '20px',
              padding: '14px 24px',
              boxShadow: '0 10px 25px -5px rgba(139, 0, 74, 0.3)',
            }
          }}
        />

        {/* TOP STATUS BAR - Chunkier and softer borders */}
        <div className="w-full max-w-2xl bg-white/80 backdrop-blur-xl rounded-[2rem] p-4 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-2 border-white shadow-xl shadow-gray-200/40 relative z-10">
          <div className="flex items-center space-x-4 w-full sm:w-auto">
            <div className="bg-[#E01A76] p-3.5 rounded-2xl text-white flex-shrink-0 shadow-inner -rotate-2">
              <History size={22} strokeWidth={3} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-playful font-bold text-gray-900 text-lg tracking-wide truncate">Dameeto Profile</h3>
              <p className="text-[#8B004A] font-bold text-[11px] truncate uppercase tracking-widest mt-0.5">
                {userEmail === "guest_user@gmail.com" ? "Guest Mode" : userEmail}
              </p>
            </div>
          </div>
          <div className="flex gap-6 text-right bg-white px-5 py-3 rounded-2xl border-2 border-gray-100 shadow-sm w-full sm:w-auto justify-between sm:justify-end">
            <div>
              <span className="font-playful text-[11px] text-gray-500 font-bold uppercase tracking-wider block mb-0.5">Queries</span>
              <span className="font-playful text-xl font-bold text-gray-800 leading-none">{history.length}</span>
            </div>
            <div className="border-l-2 border-gray-100 pl-6">
              <span className="font-playful text-[11px] text-gray-500 font-bold uppercase tracking-wider block mb-0.5">Unique</span>
              <span className="font-playful text-xl font-bold text-[#E01A76] leading-none">{totalUniqueWords}</span>
            </div>
          </div>
        </div>

        <div className="w-full max-w-2xl relative z-10">
          {/* BRANDING HEADER WITH 3D ACTION BUTTONS */}
          <div className="px-2 mb-10 flex flex-col sm:flex-row justify-between sm:items-end gap-5">
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <span className="bg-[#FFB800] text-[#4A0027] font-playful text-[11px] px-3 py-1.5 rounded-xl font-bold tracking-wider shadow-sm flex items-center gap-1.5 w-max rotate-1 border-2 border-white">
                  <Compass size={14} strokeWidth={3} /> PREMIUM NODE
                </span>
              </div>
              <h1 className="text-5xl sm:text-6xl font-bold text-[#8B004A] drop-shadow-sm font-hand pb-1">
                Vocab Mastery
              </h1>
              <p className="font-playful text-[#E01A76] font-semibold text-[13px] mt-1 tracking-wide flex items-center gap-2">
                <Zap size={16} fill="currentColor" /> AI-Driven Learning
              </p>
            </div>
            
            <div className="flex flex-row items-center gap-3 w-full sm:w-auto h-14">
              {/* Using New 3D Tactile Buttons */}
              <button
                onClick={() => navigate('/find-vocab')}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 font-playful text-sm font-bold px-6 h-full rounded-2xl btn-3d btn-3d-primary"
              >
                <Swords size={18} strokeWidth={3} /> Practice
              </button>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 font-playful text-sm font-bold px-6 h-full rounded-2xl btn-3d ${showHistory ? 'btn-3d-primary' : 'btn-3d-secondary'}`}
              >
                {showHistory ? "Close" : "Stack"}
                <ChevronDown size={18} className={`transform transition-transform duration-300 ${showHistory ? 'rotate-180' : ''}`} strokeWidth={3} />
              </button>
            </div>
          </div>

          {/* HISTORY DROPDOWN PANEL - Playful rounded cards */}
          <div className={`w-full grid transition-all duration-500 ease-in-out ${showHistory ? 'grid-rows-[1fr] opacity-100 mb-8' : 'grid-rows-[0fr] opacity-0 mb-0'}`}>
            <div className="overflow-hidden">
              <div className="bg-white border-4 border-gray-100 rounded-[2.5rem] p-6 shadow-xl relative w-full mt-2">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-2 bg-[#FFB800] rounded-b-full"></div>
                
                <div className="flex justify-between items-center mb-6 mt-2">
                  <h4 className="font-playful text-sm font-bold text-gray-600 tracking-wider flex items-center gap-2">
                    <History size={18} className="text-[#8B004A]" strokeWidth={2.5} /> Your Collection
                  </h4>
                  <span className="font-playful text-[11px] text-[#E01A76] font-bold bg-[#E01A76]/10 px-3 py-1.5 rounded-xl border border-[#E01A76]/20">
                    Tap to recall
                  </span>
                </div>

                {history.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 opacity-70">
                    <ImageIcon size={48} className="text-gray-300 mb-4" strokeWidth={1.5} />
                    <p className="font-playful text-center text-sm font-medium text-gray-400">No words discovered yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar pb-4">
                    {history.map((item) => (
                      <div key={item._id} className="flex items-center gap-2 bg-gray-50 border-2 border-gray-100 hover:border-[#FFB800]/50 rounded-[1.5rem] p-2 hover:-translate-y-1 transition-transform w-full group cursor-pointer shadow-sm">
                        <div 
                          className="flip-card flex-1 h-[64px]"
                          onClick={() => toggleFlip(item._id)}
                        >
                          <div className={`flip-card-inner w-full h-full relative ${flippedCards[item._id] ? 'flip-card-flipped' : ''}`}>
                            <div className="flip-card-front absolute w-full h-full bg-white rounded-xl px-4 flex items-center justify-between border-2 border-transparent transition-colors shadow-sm">
                              <span className="font-playful text-gray-900 text-[15px] font-bold tracking-wide truncate">
                                {item.word} {(item.imageUrl || (item.imageUrls && item.imageUrls.length > 0)) && "🎨"}
                              </span>
                              <span className="font-playful text-[10px] text-gray-400 font-bold tracking-wider bg-gray-100 px-2.5 py-1 rounded-lg">
                                FLIP
                              </span>
                            </div>
                            <div className="flip-card-back absolute w-full h-full bg-[#8B004A] text-white rounded-xl px-4 flex items-center justify-center shadow-inner border-2 border-[#8B004A]">
                              <span className="font-body text-[13px] font-bold text-center line-clamp-2 leading-snug w-full">
                                {item.meaning}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-row gap-2 flex-shrink-0">
                          <button
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              loadFromHistoryCard(item); 
                            }}
                            className="bg-white hover:bg-[#FFB800] text-[#8B004A] h-[64px] w-[54px] rounded-xl transition-all shadow-sm active:scale-90 border-2 border-gray-200 hover:border-[#FFB800] flex items-center justify-center"
                          >
                            <Search size={22} strokeWidth={2.5} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* MASSIVE SEARCH BAR - Big, bouncy and inviting */}
          <div className="w-full mb-8 group relative z-20">
            <div className="relative flex items-center bg-white border-4 border-gray-100 focus-within:border-[#E01A76]/50 focus-within:shadow-2xl rounded-[2.5rem] p-2 shadow-lg transition-all duration-300 w-full hover:shadow-xl">
              <div className="absolute left-6 text-[#E01A76] opacity-60 group-focus-within:opacity-100 group-focus-within:scale-110 group-focus-within:rotate-6 transition-all flex-shrink-0">
                <Search size={28} strokeWidth={3} />
              </div>
              <input
                type="text"
                placeholder={`Analyze: ${placeholderText}`}
                value={word}
                onChange={(e) => setWord(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearchWord()}
                className="flex-1 bg-transparent pl-16 sm:pl-20 pr-4 py-4 outline-none text-gray-900 font-playful font-bold placeholder-gray-400 text-xl w-full tracking-wide"
              />
              <button
                onClick={() => handleSearchWord()}
                disabled={loading}
                className="font-playful btn-3d btn-3d-primary h-14 px-8 sm:px-10 rounded-[1.8rem] text-sm flex items-center justify-center gap-2 flex-shrink-0 disabled:opacity-50 disabled:active:transform-none disabled:active:border-b-4 disabled:active:mt-0"
              >
                {loading ? (
                  <Loader2 size={20} className="animate-spin flex-shrink-0" strokeWidth={3} />
                ) : (
                  <>GO <ArrowRight size={20} strokeWidth={3} /></>
                )}
              </button>
            </div>
          </div>

          {/* TOGGLE TABS */}
          {activeWord && !loading && (
            <div className="w-full max-w-[440px] mx-auto mb-8 bg-white/80 backdrop-blur-md p-2 rounded-[2rem] border-2 border-gray-100 shadow-sm animate-stagger-1 relative z-10 flex gap-2">
              <button
                onClick={() => setResultView("ai")}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 font-playful text-[13px] font-bold tracking-wide rounded-2xl transition-all duration-300 ${
                  resultView === "ai"
                    ? "bg-[#FFB800] text-[#4A0027] shadow-sm border-b-[3px] border-[#d99d00]"
                    : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                }`}
              >
                <BookOpen size={18} strokeWidth={2.5} /> AI Read
              </button>
              <button
                onClick={() => setResultView("posts")}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 font-playful text-[13px] font-bold tracking-wide rounded-2xl transition-all duration-300 relative ${
                  resultView === "posts"
                    ? "bg-[#FFB800] text-[#4A0027] shadow-sm border-b-[3px] border-[#d99d00]"
                    : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                }`}
              >
                <Globe size={18} strokeWidth={2.5} /> See Posts
                {relatedPosts.length > 0 && (
                  <span className="ml-1 px-2.5 py-0.5 rounded-lg text-[11px] bg-white text-[#8B004A] shadow-sm border border-[#8B004A]/10">
                    {relatedPosts.length}
                  </span>
                )}
              </button>
            </div>
          )}

          {/* SKELETON LOADER STATE */}
          {loading && (
            <div className="w-full max-w-[440px] mx-auto bg-white rounded-[2.5rem] p-6 shadow-xl border-4 border-gray-100 relative mb-8">
              <div className="animate-pulse flex flex-col space-y-6">
                <div className="flex justify-between items-center">
                  <div className="h-12 bg-gray-100 rounded-2xl w-1/2"></div>
                  <div className="h-12 w-12 bg-gray-100 rounded-full"></div>
                </div>
                <div className="space-y-4">
                  <div className="h-24 bg-gray-50 rounded-2xl w-full"></div>
                  <div className="h-16 bg-gray-50 rounded-2xl w-3/4"></div>
                </div>
                <div className="h-40 bg-gray-50 rounded-[2rem] w-full border-2 border-gray-100"></div>
              </div>
            </div>
          )}

          {/* MAIN RESULTS CONTENT */}
          {activeWord && !loading && (
            <div className="w-full flex flex-col items-center relative z-10">
              
              {/* === VIEW 1: AI READ === */}
              {resultView === "ai" && (
                <>
                  <div className="flex justify-end pr-2 w-full max-w-[440px] animate-stagger-1 mb-3">
                    <div className="bg-[#8B004A] text-white rounded-[1.5rem] rounded-tr-md px-5 py-3.5 text-[14px] font-body font-bold leading-relaxed max-w-[85%] shadow-md border-b-4 border-[#600033] break-words">
                      Explain the exact Hindi meaning, context, and examples for <span className="text-[#FFB800] uppercase font-playful tracking-wider mx-1 break-all bg-black/20 px-2 py-0.5 rounded-lg">"{activeWord}"</span>.
                    </div>
                  </div>

                  {/* Main Result Card */}
                  <div className="bg-dots bg-white border-4 border-gray-100 rounded-[2.5rem] p-6 sm:p-8 shadow-2xl relative overflow-hidden w-full max-w-[440px] mb-8 animate-stagger-2">
                    
                    <div className="absolute top-0 right-0 bg-[#FFB800] text-[#4A0027] px-5 py-2 rounded-bl-3xl font-playful font-bold text-[10px] uppercase tracking-widest border-b-4 border-l-4 border-[#d99d00] z-10">
                      {contextBadge}
                    </div>

                    <div className="flex flex-row items-center justify-between border-b-2 border-gray-100 pb-5 mb-5 mt-5 gap-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-3">
                          <h2 className="text-4xl sm:text-5xl font-bold text-[#8B004A] capitalize tracking-tight break-all font-playful">
                            {activeWord}
                          </h2>
                          <span className="bg-[#E01A76]/10 text-[#E01A76] border-2 border-[#E01A76]/20 text-[11px] px-3.5 py-1.5 rounded-xl font-playful font-bold uppercase tracking-wider rotate-2">
                            {partOfSpeech}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handlePronounce(activeWord)}
                        className="bg-[#FFB800] hover:bg-[#f0ad00] p-4 rounded-2xl text-[#4A0027] transition-transform shadow-md active:scale-90 flex-shrink-0 border-b-4 border-[#d99d00] active:border-b-0 active:mt-1"
                        title="Listen to pronunciation"
                      >
                        <Volume2 size={26} strokeWidth={2.5} />
                      </button>
                    </div>

                    <div className="space-y-6 w-full animate-stagger-3">
                      {/* Meaning Block */}
                      <div className="space-y-4">
                        <div className="bg-[#8B004A] rounded-3xl p-6 border-b-4 border-[#600033] text-white shadow-sm relative">
                           <div className="absolute -top-3 -left-2 bg-[#FFB800] rounded-full p-2 text-[#4A0027] shadow-sm -rotate-6 border-2 border-white">
                             <Zap size={18} fill="currentColor"/>
                           </div>
                          <span className="text-white/70 font-playful text-[11px] uppercase font-bold tracking-widest mb-1.5 block ml-3">
                            Exact Meaning
                          </span>
                          <p className="font-body font-extrabold text-2xl sm:text-3xl leading-tight break-words">{meaning}</p>
                        </div>
                        
                        <div className="pl-5 border-l-[4px] border-[#E01A76] w-full ml-2">
                          <p className="text-gray-600 font-body font-bold leading-relaxed text-[15px] break-words">{explanation}</p>
                        </div>
                      </div>

                      {/* Usage Block */}
                      <div className="pt-2 w-full">
                        <span className="text-gray-400 font-playful text-[11px] uppercase font-bold tracking-widest mb-2 flex items-center gap-1.5 ml-1">
                          <Sparkles size={16} className="text-[#E01A76]" /> Real World Usage
                        </span>
                        <div className="bg-gray-50 rounded-3xl p-5 border-2 border-gray-100 text-gray-700 whitespace-pre-line font-body font-bold text-[15px] leading-relaxed break-words w-full shadow-inner">
                          {sentences}
                        </div>
                      </div>

                      {/* Synonyms/Antonyms */}
                      <div className="grid grid-cols-2 gap-4 pt-2 w-full">
                        <div className="bg-emerald-50 rounded-2xl p-4 border-2 border-emerald-100 hover:-translate-y-1 transition-transform">
                          <span className="text-emerald-600/60 font-playful font-bold text-[10px] uppercase tracking-wider block mb-1">Similar</span>
                          <span className="text-emerald-800 font-body font-extrabold text-[14px] break-words block">{synonyms || "N/A"}</span>
                        </div>
                        <div className="bg-rose-50 rounded-2xl p-4 border-2 border-rose-100 hover:-translate-y-1 transition-transform">
                          <span className="text-rose-600/60 font-playful font-bold text-[10px] uppercase tracking-wider block mb-1">Opposite</span>
                          <span className="text-rose-800 font-body font-extrabold text-[14px] break-words block">{antonyms || "N/A"}</span>
                        </div>
                      </div>

                      {/* Visual Component */}
                      <div className="pt-2">
                         <VisualAnchor 
                           activeWord={activeWord}
                           imageGallery={imageGallery}
                           isImageExpanded={isImageExpanded}
                           setIsImageExpanded={setIsImageExpanded}
                           isImageLoading={isImageLoading}
                           isUploading={isUploading}
                           handleGenerateImage={handleGenerateImage}
                           handleCustomImageUpload={handleCustomImageUpload}
                           handleRemoveImage={handleRemoveImage}
                           fileInputRef={fileInputRef}
                         />
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="flex flex-col sm:flex-row justify-between gap-3 border-t-2 border-gray-100 mt-8 pt-6 w-full animate-stagger-4">
                      <button
                        onClick={() => handleSearchWord(activeWord, true)}
                        disabled={loading}
                        className="font-playful text-[13px] bg-white text-[#8B004A] flex items-center justify-center gap-2 font-bold px-5 h-12 rounded-2xl flex-1 btn-3d btn-3d-secondary border-2 border-gray-200"
                      >
                        <RefreshCw size={16} strokeWidth={3} /> Alt Context
                      </button>

                      <button
                        onClick={handleShareToCommunity}
                        disabled={isSharing}
                        className={`font-playful text-[13px] flex items-center justify-center gap-2 font-bold px-5 h-12 rounded-2xl flex-1 btn-3d ${sharedPostId ? 'bg-emerald-500 hover:bg-emerald-600 border-[#047857] text-white' : 'btn-3d-primary'}`}
                      >
                        {isSharing ? (
                          <><Loader2 size={16} className="animate-spin" /> ...</>
                        ) : (
                          <>
                            {sharedPostId ? <RefreshCw size={16} strokeWidth={3} /> : <Share2 size={16} strokeWidth={3} />}
                            {sharedPostId ? "Update Post" : "Share Word"}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* === VIEW 2: SEE POSTS === */}
              {resultView === "posts" && (
                <div className="w-full flex flex-col items-center animate-stagger-1">
                  {isFetchingPosts ? (
                    <div className="flex flex-col items-center justify-center py-16 bg-white border-4 border-gray-100 rounded-[2.5rem] w-full max-w-[440px] shadow-sm">
                      <Loader2 className="w-12 h-12 text-[#E01A76] animate-spin mb-4" strokeWidth={3} />
                      <span className="font-playful text-[11px] text-gray-500 font-bold uppercase tracking-widest bg-gray-50 px-5 py-2.5 rounded-xl">Searching archives...</span>
                    </div>
                  ) : relatedPosts.length > 0 ? (
                    <div className="w-full flex flex-col items-center space-y-6">
                      {relatedPosts.map((post, idx) => (
                        <div key={post._id} className="w-full max-w-[440px] animate-stagger-1" style={{ animationDelay: `${idx * 0.1}s` }}>
                          <PostCard 
                            post={post} 
                            userEmail={userEmail} 
                            isPremiumUser={isPremiumUser} 
                            activeIndex={activeIndex} 
                            setActiveIndex={setActiveIndex} 
                            onRefresh={() => fetchRelatedPosts(activeWord)} 
                            API_URL={API_URL} 
                            highlightWord={activeWord} 
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 px-6 bg-white border-4 border-gray-100 rounded-[2.5rem] w-full max-w-[440px] text-center shadow-sm">
                      <div className="w-20 h-20 bg-[#FFB800]/20 rounded-full flex items-center justify-center mb-6 border-4 border-[#FFB800]/30 -rotate-3">
                        <Globe className="w-10 h-10 text-[#FFB800]" strokeWidth={2.5} />
                      </div>
                      <h3 className="font-playful text-[#8B004A] font-bold text-2xl mb-3 tracking-tight">No Posts Yet</h3>
                      <p className="font-body text-gray-500 text-sm font-bold leading-relaxed max-w-[250px]">
                        Be the first to share <span className="text-white bg-[#E01A76] px-2 py-0.5 rounded-lg border-b-2 border-[#8B004A] mx-1">"{activeWord}"</span> with the community!
                      </p>
                      <button 
                        onClick={() => setResultView("ai")}
                        className="mt-8 px-6 h-12 font-playful btn-3d btn-3d-secondary flex items-center gap-2 text-[13px] rounded-2xl border-2 border-gray-200"
                      >
                        <BookOpen size={16} strokeWidth={3} /> Back to AI Read
                      </button>
                    </div>
                  )}
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </>
  );
}