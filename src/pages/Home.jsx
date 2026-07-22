import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import PostCard from "../components/PostCard"; 
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
  Zap
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

  const [imageSrc, setImageSrc] = useState(null);
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
    utterance.pitch = 1;
    utterance.rate = 0.85;
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

  const handleUpdateCommunityPost = async (updatedMeaning, updatedSentences, updatedImage, isManualClick = false) => {
    if (!sharedPostId || !userEmail) return;

    const data = new FormData();
    data.append("title", `Lexicon Entry: ${activeWord.toUpperCase()}`); 
    data.append("word", activeWord);
    data.append("meaning", updatedMeaning || meaning);
    data.append("sentence", updatedSentences || sentences || "");
    if (updatedImage || imageSrc) {
      data.append("image", updatedImage || imageSrc); 
    }

    const vocabData = [{
      word: activeWord,
      meaning: updatedMeaning || meaning,
      sentence: updatedSentences || sentences || "",
      media: (updatedImage || imageSrc) ? [{ type: 'image', url: updatedImage || imageSrc }] : [] 
    }];
    data.append("vocabData", JSON.stringify(vocabData));

    if (updatedImage || imageSrc) {
      const mediaMetadata = [{
        type: 'image',
        url: updatedImage || imageSrc,   
        value: updatedImage || imageSrc,
        mode: 'url',
        vocabIndex: 0
      }];
      data.append("mediaMetadata", JSON.stringify(mediaMetadata));
    }

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
        
        if (sharedPostId) {
          handleUpdateCommunityPost(meaning, sentences, data.imageUrl);
        }
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

        if (sharedPostId) {
          handleUpdateCommunityPost(meaning, sentences, data.imageUrl);
        }
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
          else toast.success("Word analyzed 🚀");
          handlePronounce(resData.data.word);
        }
        
        setWord("");
        fetchHistoryFromDB();
        fetchRelatedPosts(resData.data.word); 

        if (isAlternative && sharedPostId) {
           handleUpdateCommunityPost(resData.data.meaning, resData.data.sentences, imageSrc);
        }

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

  const handleShareToCommunity = async () => {
    if (!userEmail || userEmail === "guest_user@gmail.com") {
      return toast.error("Please login to share with the community! 🚫");
    }
    if (!activeWord || !meaning) {
      return toast.error("No word data to share!");
    }

    if (sharedPostId) {
      await handleUpdateCommunityPost(meaning, sentences, imageSrc, true);
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
    if (imageSrc) {
      data.append("image", imageSrc); 
    }

    const vocabData = [{
      word: activeWord,
      meaning: meaning,
      sentence: sentences || "",
      media: imageSrc ? [{ type: 'image', url: imageSrc }] : [] 
    }];
    data.append("vocabData", JSON.stringify(vocabData));

    if (imageSrc) {
      const mediaMetadata = [{
        type: 'image',
        url: imageSrc,   
        value: imageSrc,
        mode: 'url',
        vocabIndex: 0
      }];
      data.append("mediaMetadata", JSON.stringify(mediaMetadata));
    }

    try {
      const res = await fetch(`${API_URL}/api/english-posts/create`, {
        method: "POST",
        body: data
      });
      
      const postResponseData = await res.json(); 

      if (res.ok) {
        toast.success("Word Shared to Community! 🌍✨");

        const newPostId = postResponseData.post?._id || postResponseData.data?._id || postResponseData._id;
        if (newPostId) setSharedPostId(newPostId);

        try {
          const squadsRes = await fetch(`${API_URL}/api/squads/user/${userEmail}`);
          const squadsData = await squadsRes.json();

          if (squadsData.success && squadsData.squads.length > 0 && newPostId) {
            squadsData.squads.forEach(async (squad) => {
              await fetch(`${API_URL}/api/squads/${squad._id}/message`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  senderEmail: userEmail,
                  type: "post", 
                  postId: newPostId, 
                  text: `Hey squad! I just added a new word: ${activeWord}`
                }),
              });
            });
          }
        } catch (squadErr) {
          console.error("Failed to broadcast to squads:", squadErr);
        }

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
    
    if (item.imageUrl) {
        setImageSrc(item.imageUrl);
        setIsImageExpanded(false);
    } else {
        handleGenerateImage("normal", item.word);
    }
  };

  const toggleFlip = (id) => {
    setFlippedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const totalUniqueWords = new Set(history.map(item => item.word.toLowerCase())).size;

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Kalam:wght@400;700&display=swap');
          
          .font-playful {
            font-family: 'Kalam', cursive !important;
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
          .line-clamp-3 {
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          
          /* Custom Subtle Dotted Background */
          .bg-dots {
            background-image: radial-gradient(#8B004A 0.5px, transparent 0.5px);
            background-size: 20px 20px;
            background-position: 0 0, 10px 10px;
            background-color: white;
            opacity: 0.98;
          }
          
          /* Hide scrollbar for clean UI */
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}
      </style>

      <div className="min-h-screen bg-[#F2EFE7] text-gray-900 flex flex-col items-center p-4 py-8 font-sans transition-colors duration-500 pb-28 overflow-x-hidden w-full relative">
        
        {/* Soft Background Glow Effects - Muted for elegance */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#E01A76]/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/4 right-0 w-[30rem] h-[30rem] bg-[#8B004A]/5 rounded-full blur-3xl pointer-events-none"></div>

        <Toaster 
          position="top-center" 
          toastOptions={{
            style: {
              background: '#8B004A',
              color: '#F2EFE7',
              border: 'none',
              fontWeight: '600',
              borderRadius: '16px',
              padding: '14px 24px',
              boxShadow: '0 10px 25px -5px rgba(139, 0, 74, 0.2)',
            }
          }}
        />

        {/* TOP STATUS BAR - Sleek Glassmorphism */}
        <div className="w-full max-w-2xl bg-white/70 backdrop-blur-xl rounded-3xl p-4 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 border border-white shadow-sm relative z-10">
          <div className="flex items-center space-x-4 w-full sm:w-auto">
            <div className="bg-gradient-to-br from-[#8B004A] to-[#E01A76] p-3 rounded-2xl text-white flex-shrink-0 shadow-md">
              <History size={20} strokeWidth={2.5} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-gray-900 text-[15px] tracking-wide truncate">Dameeto Profile</h3>
              <p className="text-[#8B004A]/80 font-semibold text-xs truncate uppercase tracking-wider mt-0.5">
                {userEmail === "guest_user@gmail.com" ? "Guest Mode" : userEmail}
              </p>
            </div>
          </div>
          <div className="flex gap-6 text-right bg-white/60 px-5 py-3 rounded-2xl border border-gray-100 w-full sm:w-auto justify-between sm:justify-end">
            <div>
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-0.5">Queries</span>
              <span className="text-[17px] font-black text-gray-800 leading-none">{history.length}</span>
            </div>
            <div className="border-l border-gray-200 pl-6">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-0.5">Unique</span>
              <span className="text-[17px] font-black text-[#E01A76] leading-none">{totalUniqueWords}</span>
            </div>
          </div>
        </div>

        <div className="w-full max-w-2xl relative z-10">
          {/* BRANDING HEADER WITH ACTION BUTTONS */}
          <div className="px-2 mb-8 flex flex-col sm:flex-row justify-between sm:items-end gap-5">
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <span className="bg-gradient-to-r from-[#FFB800] to-[#F59E0B] text-[#4A0027] text-[10px] px-3 py-1.5 rounded-lg font-bold tracking-widest uppercase shadow-sm flex items-center gap-1.5 w-max">
                  <Compass size={12} strokeWidth={2.5} /> PREMIUM NODE
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-[#8B004A] to-[#E01A76] bg-clip-text text-transparent tracking-tight drop-shadow-sm break-words font-playful pb-1">
                Vocab Mastery
              </h1>
              <p className="text-gray-500 font-semibold text-xs mt-1 uppercase tracking-widest opacity-90 flex items-center gap-2">
                <Zap size={14} className="text-[#E01A76]" /> AI-Driven Lexicon
              </p>
            </div>
            
            <div className="flex flex-row items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => navigate('/find-vocab')}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-[11px] font-bold text-white bg-gradient-to-br from-[#8B004A] to-[#E01A76] transition-all px-5 py-3.5 rounded-2xl shadow-lg shadow-[#E01A76]/20 hover:shadow-[#E01A76]/40 hover:-translate-y-0.5 active:scale-95 uppercase tracking-wider border border-transparent"
              >
                <Swords size={16} strokeWidth={2.5} /> Practice
              </button>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 text-[11px] font-bold transition-all px-5 py-3.5 rounded-2xl border active:scale-95 uppercase tracking-wider ${showHistory ? 'bg-[#8B004A] text-white border-[#8B004A]' : 'bg-white text-[#8B004A] hover:bg-gray-50 border-gray-200'}`}
              >
                {showHistory ? "Close" : "Stack"}
                <ChevronDown size={16} className={`transform transition-transform duration-300 ${showHistory ? 'rotate-180 text-white' : 'text-[#8B004A]'}`} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* HISTORY DROPDOWN PANEL - Smoother look */}
          <div className={`w-full grid transition-all duration-500 ease-in-out ${showHistory ? 'grid-rows-[1fr] opacity-100 mb-8' : 'grid-rows-[0fr] opacity-0 mb-0'}`}>
            <div className="overflow-hidden">
              <div className="bg-white/95 backdrop-blur-xl border border-gray-100 rounded-3xl p-5 shadow-xl shadow-gray-200/50 relative w-full mt-2">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-[#8B004A] to-[#E01A76] rounded-b-full"></div>
                
                <div className="flex justify-between items-center mb-5 mt-1">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <History size={16} className="text-[#8B004A]" /> Your Cards
                  </h4>
                  <span className="text-[10px] text-[#E01A76] font-semibold bg-[#E01A76]/10 px-2 py-1 rounded-md">
                    Tap to recall
                  </span>
                </div>

                {history.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 opacity-70">
                    <ImageIcon size={40} className="text-gray-300 mb-3" strokeWidth={1.5} />
                    <p className="text-center text-xs font-medium text-gray-400 uppercase tracking-wider">No words discovered yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar pb-2">
                    {history.map((item) => (
                      <div key={item._id} className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-2xl p-1.5 shadow-sm hover:shadow-md transition-all w-full group">
                        
                        <div 
                          className="flip-card flex-1 h-[56px] cursor-pointer"
                          onClick={() => toggleFlip(item._id)}
                        >
                          <div className={`flip-card-inner w-full h-full relative ${flippedCards[item._id] ? 'flip-card-flipped' : ''}`}>
                            
                            <div className="flip-card-front absolute w-full h-full bg-white group-hover:bg-[#E01A76]/5 rounded-xl px-4 flex items-center justify-between border border-transparent transition-colors shadow-sm">
                              <span className="text-gray-900 text-[14px] font-bold tracking-wide truncate">
                                {item.word} {item.imageUrl && "🖼️"}
                              </span>
                              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider bg-gray-100 px-2 py-1 rounded">
                                Flip
                              </span>
                            </div>

                            <div className="flip-card-back absolute w-full h-full bg-gradient-to-r from-[#8B004A] to-[#E01A76] text-white rounded-xl px-3 flex items-center justify-center shadow-inner">
                              <span className="text-[12px] font-medium text-center line-clamp-2 leading-snug w-full">
                                {item.meaning}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-row gap-1.5 flex-shrink-0">
                          <button
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              loadFromHistoryCard(item); 
                            }}
                            className="bg-white hover:bg-[#8B004A] text-[#8B004A] hover:text-white h-[56px] w-[46px] rounded-xl transition-colors shadow-sm active:scale-95 border border-gray-200 hover:border-transparent flex items-center justify-center"
                          >
                            <Search size={18} strokeWidth={2} />
                          </button>
                        </div>

                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* MASSIVE SEARCH BAR - Refined Pill shape */}
          <div className="w-full mb-8 group relative z-20">
            <div className="relative flex items-center bg-white border-2 border-gray-100 focus-within:border-[#8B004A]/30 focus-within:shadow-xl focus-within:shadow-[#8B004A]/10 rounded-full p-1.5 shadow-lg transition-all duration-300 w-full">
              <div className="absolute left-6 text-[#8B004A] opacity-70 group-focus-within:opacity-100 group-focus-within:scale-110 transition-all flex-shrink-0">
                <Search size={24} strokeWidth={2.5} />
              </div>
              <input
                type="text"
                placeholder={`Analyze: ${placeholderText}`}
                value={word}
                onChange={(e) => setWord(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearchWord()}
                className="flex-1 bg-transparent pl-16 sm:pl-20 pr-4 py-4 outline-none text-gray-900 font-bold placeholder-gray-400 text-lg w-full tracking-wide"
              />
              <button
                onClick={() => handleSearchWord()}
                disabled={loading}
                className="bg-[#8B004A] hover:bg-[#E01A76] text-white px-8 sm:px-10 py-3.5 rounded-full text-[13px] font-bold uppercase tracking-widest transition-all disabled:opacity-70 disabled:cursor-not-allowed border-none active:scale-95 flex items-center justify-center gap-2 flex-shrink-0 shadow-md"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin flex-shrink-0" strokeWidth={2.5} />
                ) : (
                  <>GO <ArrowRight size={18} strokeWidth={2.5} /></>
                )}
              </button>
            </div>
          </div>

          {/* TOGGLE TABS (AI READ / SEE POSTS) - Sleek Segmented Control */}
          {activeWord && !loading && (
            <div className="w-full max-w-[440px] mx-auto mb-8 bg-white/70 backdrop-blur-md p-1.5 rounded-2xl border border-gray-200 shadow-sm animate-stagger-1 relative z-10 flex">
              <button
                onClick={() => setResultView("ai")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-[11px] font-bold uppercase tracking-widest rounded-xl transition-all duration-300 ${
                  resultView === "ai"
                    ? "bg-white text-[#8B004A] shadow-sm border border-gray-100"
                    : "text-gray-500 hover:text-[#8B004A] hover:bg-white/50"
                }`}
              >
                <BookOpen size={16} strokeWidth={2} /> AI Read
              </button>
              <button
                onClick={() => setResultView("posts")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-[11px] font-bold uppercase tracking-widest rounded-xl transition-all duration-300 relative ${
                  resultView === "posts"
                    ? "bg-white text-[#8B004A] shadow-sm border border-gray-100"
                    : "text-gray-500 hover:text-[#8B004A] hover:bg-white/50"
                }`}
              >
                <Globe size={16} strokeWidth={2} /> See Posts
                {relatedPosts.length > 0 && (
                  <span className="ml-1 px-2 py-0.5 rounded-md text-[10px] bg-[#E01A76]/10 text-[#E01A76] border border-[#E01A76]/20">
                    {relatedPosts.length}
                  </span>
                )}
              </button>
            </div>
          )}

          {/* SKELETON LOADER STATE */}
          {loading && (
            <div className="w-full max-w-[440px] mx-auto bg-white rounded-3xl p-6 shadow-xl border border-gray-100 relative mb-8">
              <div className="animate-pulse flex flex-col space-y-6">
                <div className="flex justify-between items-center">
                  <div className="h-10 bg-gray-100 rounded-xl w-1/2"></div>
                  <div className="h-10 w-10 bg-gray-100 rounded-full"></div>
                </div>
                <div className="space-y-3">
                  <div className="h-20 bg-gray-50 rounded-xl w-full"></div>
                  <div className="h-12 bg-gray-50 rounded-xl w-3/4"></div>
                </div>
                <div className="h-32 bg-gray-50 rounded-xl w-full border border-gray-100"></div>
              </div>
            </div>
          )}

          {/* MAIN RESULTS CONTENT */}
          {activeWord && !loading && (
            <div className="w-full flex flex-col items-center relative z-10">
              
              {/* === VIEW 1: AI READ === */}
              {resultView === "ai" && (
                <>
                  {/* Modern Chat Bubble Prompt */}
                  <div className="flex justify-end pr-2 w-full max-w-[440px] animate-stagger-1 mb-3">
                    <div className="bg-gradient-to-r from-[#8B004A] to-[#E01A76] text-white rounded-2xl rounded-tr-sm px-4 py-3 text-[13px] font-medium leading-relaxed max-w-[85%] shadow-md shadow-[#E01A76]/10 break-words">
                      Explain the exact Hindi meaning, context, and examples for <span className="text-[#FFB800] uppercase font-bold tracking-wider mx-1 break-all">"{activeWord}"</span>.
                    </div>
                  </div>

                  {/* Main Result Card - Cleaned up borders and background */}
                  <div className="bg-dots bg-white border border-gray-200 rounded-[2rem] p-6 shadow-xl shadow-[#8B004A]/5 relative overflow-hidden w-full max-w-[440px] mb-8 animate-stagger-2">
                    
                    <div className="absolute top-0 right-0 bg-[#F2EFE7] text-[#8B004A] px-4 py-1.5 rounded-bl-2xl font-bold text-[9px] uppercase tracking-widest border-b border-l border-gray-200">
                      {contextBadge}
                    </div>

                    <div className="flex flex-row items-center justify-between border-b border-gray-100 pb-5 mb-5 mt-4 gap-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-3">
                          <h2 className="text-4xl sm:text-5xl font-bold text-[#8B004A] capitalize tracking-tight break-all font-playful">
                            {activeWord}
                          </h2>
                          <span className="bg-[#8B004A]/5 text-[#8B004A] border border-[#8B004A]/10 text-[10px] px-3 py-1 rounded-lg font-bold uppercase tracking-widest">
                            {partOfSpeech}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handlePronounce(activeWord)}
                        className="bg-gray-50 hover:bg-[#8B004A] p-3.5 rounded-2xl text-[#8B004A] hover:text-white transition-colors border border-gray-100 shadow-sm active:scale-95 flex-shrink-0"
                        title="Listen to pronunciation"
                      >
                        <Volume2 size={22} strokeWidth={2} />
                      </button>
                    </div>

                    <div className="space-y-5 w-full animate-stagger-3">
                      {/* Meaning Block */}
                      <div className="space-y-3">
                        <div className="bg-[#8B004A]/5 rounded-2xl p-5 border border-[#8B004A]/10">
                          <span className="text-[#8B004A]/60 text-[10px] uppercase font-bold tracking-widest mb-1 block flex items-center gap-1.5">
                            <BookOpen size={12} /> Exact Meaning
                          </span>
                          <p className="text-gray-900 font-bold text-xl sm:text-2xl leading-snug break-words tracking-tight">{meaning}</p>
                        </div>
                        
                        <div className="pl-4 border-l-[3px] border-[#FFB800] w-full">
                          <p className="text-gray-600 font-medium leading-relaxed text-[14px] break-words">{explanation}</p>
                        </div>
                      </div>

                      {/* Usage Block */}
                      <div className="pt-2 w-full">
                        <span className="text-gray-400 text-[10px] uppercase font-bold tracking-widest mb-2 flex items-center gap-1.5">
                          <Sparkles size={14} className="text-[#FFB800]" /> Real World Usage
                        </span>
                        <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 text-gray-800 whitespace-pre-line font-medium text-[14px] leading-relaxed break-words w-full">
                          {sentences}
                        </div>
                      </div>

                      {/* Synonyms/Antonyms */}
                      <div className="grid grid-cols-2 gap-3 pt-2 w-full">
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                          <span className="text-gray-400 font-bold text-[9px] uppercase tracking-widest block mb-1">Similar</span>
                          <span className="text-[#8B004A] font-semibold text-[13px] break-words block">{synonyms || "N/A"}</span>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                          <span className="text-gray-400 font-bold text-[9px] uppercase tracking-widest block mb-1">Opposite</span>
                          <span className="text-gray-700 font-semibold text-[13px] break-words block">{antonyms || "N/A"}</span>
                        </div>
                      </div>

                      {/* VISUAL MEMORY ANCHOR */}
                      <div className="pt-6 mt-6 border-t border-gray-100 w-full animate-stagger-4">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-gray-500 text-[10px] uppercase font-bold tracking-widest flex items-center gap-1.5">
                            <ImageIcon size={14} className="text-[#E01A76]" /> Visual Anchor
                          </span>
                        </div>
                        
                        <div className={`w-full rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden relative transition-all duration-500 ${!isImageExpanded ? 'py-10' : ''}`}>
                          
                          {(isImageLoading || isUploading) && (
                            <div className="flex flex-col items-center justify-center gap-4 absolute inset-0 bg-white/80 backdrop-blur-sm z-10 min-h-[160px]">
                              <Loader2 size={32} className="animate-spin text-[#E01A76]" strokeWidth={2} />
                              <p className="text-[#8B004A] font-bold text-[10px] uppercase tracking-widest animate-pulse">
                                {isUploading ? 'Uploading...' : 'Rendering Concept...'}
                              </p>
                            </div>
                          )}

                          {imageSrc && !isImageExpanded && !isImageLoading && !isUploading && (
                            <div className="flex flex-col items-center text-center px-4 w-full">
                              <div className="bg-[#8B004A]/10 p-4 rounded-full mb-3 text-[#8B004A]">
                                <ImageIcon size={28} strokeWidth={1.5} />
                              </div>
                              <h3 className="text-lg font-bold text-gray-900 mb-1">Visual Ready</h3>
                              <p className="text-gray-400 font-medium text-[11px] mb-5">Tap to reveal the memory anchor for "{activeWord}"</p>
                              <button 
                                onClick={() => setIsImageExpanded(true)}
                                className="px-8 py-3 bg-gray-900 hover:bg-[#E01A76] text-white text-[12px] font-bold uppercase tracking-wider rounded-xl transition-colors active:scale-95 flex items-center justify-center gap-2"
                              >
                                Reveal Image <ArrowRight size={14} strokeWidth={2} />
                              </button>
                            </div>
                          )}

                          {imageSrc && isImageExpanded && (
                            <div className="relative group w-full bg-black">
                              <img 
                                src={imageSrc} 
                                alt={activeWord} 
                                className="w-full h-auto max-h-[400px] object-cover transition-opacity duration-500 block"
                              />
                            </div>
                          )}
                        </div>

                        {/* Neater Button Grid for Actions */}
                        {imageSrc && isImageExpanded && (
                          <div className="grid grid-cols-3 gap-2 mt-3 w-full animate-stagger-2">
                            <button
                              onClick={() => handleGenerateImage('regenerate', activeWord)}
                              disabled={isImageLoading || isUploading}
                              className="py-3 px-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-[10px] font-bold rounded-xl border border-gray-200 transition-colors flex flex-col items-center gap-1 uppercase tracking-wider active:scale-95"
                            >
                              <RefreshCw size={16} strokeWidth={2} className="text-[#8B004A]" /> Regenerate
                            </button>
                            
                            <button
                              onClick={() => {
                                const userIdea = window.prompt("Custom prompt (e.g., 'A modern neon city'):");
                                if (userIdea && userIdea.trim() !== "") {
                                  handleGenerateImage('refine', activeWord, userIdea);
                                }
                              }}
                              disabled={isImageLoading || isUploading}
                              className="py-3 px-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-[10px] font-bold rounded-xl border border-gray-200 transition-colors flex flex-col items-center gap-1 uppercase tracking-wider active:scale-95"
                            >
                              <Sparkles size={16} strokeWidth={2} className="text-[#FFB800]" /> Custom
                            </button>

                            <button
                              onClick={() => fileInputRef.current.click()}
                              disabled={isImageLoading || isUploading}
                              className="py-3 px-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-[10px] font-bold rounded-xl border border-gray-200 transition-colors flex flex-col items-center gap-1 uppercase tracking-wider active:scale-95"
                            >
                              <Upload size={16} strokeWidth={2} className="text-gray-500" /> Upload
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

                    {/* Bottom Action Footer */}
                    <div className="flex flex-col sm:flex-row justify-between gap-3 border-t border-gray-100 mt-6 pt-5 w-full animate-stagger-4">
                      <button
                        onClick={() => handleSearchWord(activeWord, true)}
                        disabled={loading}
                        className="text-[11px] bg-gray-50 hover:bg-gray-100 text-gray-600 flex items-center justify-center gap-2 font-bold transition-colors uppercase tracking-wider px-5 py-3.5 rounded-xl border border-gray-200 active:scale-95 flex-1"
                      >
                        <RefreshCw size={14} strokeWidth={2} /> Alt Context
                      </button>

                      <button
                        onClick={handleShareToCommunity}
                        disabled={isSharing}
                        className={`text-[11px] text-white flex items-center justify-center gap-2 font-bold transition-transform uppercase tracking-wider px-5 py-3.5 rounded-xl shadow-md active:scale-95 flex-1 ${sharedPostId ? 'bg-emerald-500' : 'bg-gradient-to-r from-[#8B004A] to-[#E01A76]'}`}
                      >
                        {isSharing ? (
                          <><Loader2 size={14} className="animate-spin" /> Processing...</>
                        ) : (
                          <>
                            {sharedPostId ? <RefreshCw size={14} /> : <Share2 size={14} />}
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
                    <div className="flex flex-col items-center justify-center py-16 bg-white border border-gray-100 rounded-[2rem] w-full max-w-[440px] shadow-sm">
                      <Loader2 className="w-10 h-10 text-[#E01A76] animate-spin mb-4" strokeWidth={2} />
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest bg-gray-50 px-4 py-2 rounded-lg">Searching archives...</span>
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
                    <div className="flex flex-col items-center justify-center py-16 px-6 bg-white border border-gray-100 rounded-[2rem] w-full max-w-[440px] text-center shadow-sm">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-5 border border-gray-100">
                        <Globe className="w-8 h-8 text-gray-300" strokeWidth={1.5} />
                      </div>
                      <h3 className="text-gray-900 font-bold text-xl mb-2 tracking-tight">No Posts Yet</h3>
                      <p className="text-gray-500 text-[11px] uppercase tracking-wider font-medium leading-relaxed max-w-[250px]">
                        Be the first to share <span className="text-[#E01A76] bg-[#E01A76]/10 px-1 rounded">"{activeWord}"</span> with the community!
                      </p>
                      <button 
                        onClick={() => setResultView("ai")}
                        className="mt-6 px-6 py-3 bg-gray-900 hover:bg-[#8B004A] text-white rounded-xl text-[11px] font-bold uppercase tracking-widest transition-colors active:scale-95 flex items-center gap-2"
                      >
                        <BookOpen size={14} /> Back to AI Read
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