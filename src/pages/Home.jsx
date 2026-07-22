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

  // Track if the current word is already posted by this user
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

        // Check if current user already has a post for this word
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

  // Helper Function to Update Existing Community Post Silently
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
        fetchRelatedPosts(activeWord); // Refresh feed
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
          
          .animate-stagger-1 { animation: fadeInUp 0.5s ease-out forwards; animation-delay: 0.1s; opacity: 0; }
          .animate-stagger-2 { animation: fadeInUp 0.5s ease-out forwards; animation-delay: 0.2s; opacity: 0; }
          .animate-stagger-3 { animation: fadeInUp 0.5s ease-out forwards; animation-delay: 0.3s; opacity: 0; }
          .animate-stagger-4 { animation: fadeInUp 0.5s ease-out forwards; animation-delay: 0.4s; opacity: 0; }

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
          
          /* Custom Dotted Background for Results Card */
          .bg-dots {
            background-image: radial-gradient(#8B004A 0.5px, transparent 0.5px);
            background-size: 16px 16px;
            background-position: 0 0, 8px 8px;
            background-color: white;
          }
        `}
      </style>

      <div className="min-h-screen bg-[#F2EFE7] text-gray-900 flex flex-col items-center p-4 py-8 font-sans transition-colors duration-500 pb-28 overflow-x-hidden w-full relative">
        
        {/* Soft Background Glow Effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#E01A76]/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/4 right-0 w-[30rem] h-[30rem] bg-[#8B004A]/5 rounded-full blur-3xl pointer-events-none"></div>

        <Toaster 
          position="top-center" 
          toastOptions={{
            style: {
              background: '#8B004A',
              color: '#F2EFE7',
              border: 'none',
              fontWeight: 'bold',
              borderRadius: '16px',
              padding: '16px 24px',
              boxShadow: '0 10px 25px -5px rgba(139, 0, 74, 0.3)',
            }
          }}
        />

        {/* TOP STATUS BAR */}
        <div className="w-full max-w-2xl bg-white/80 backdrop-blur-md rounded-[2rem] p-4 sm:p-5 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-[3px] border-white shadow-xl shadow-[#8B004A]/5 relative z-10">
          <div className="flex items-center space-x-4 w-full sm:w-auto">
            <div className="bg-gradient-to-br from-[#8B004A] to-[#E01A76] p-3.5 rounded-2xl text-white flex-shrink-0 shadow-lg shadow-[#E01A76]/20">
              <History size={24} strokeWidth={2.5} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-black text-gray-900 text-[15px] tracking-wide truncate">Dameeto Profile</h3>
              <p className="text-[#8B004A]/70 font-bold text-xs truncate uppercase tracking-widest mt-0.5">
                {userEmail === "guest_user@gmail.com" ? "Guest Mode" : userEmail}
              </p>
            </div>
          </div>
          <div className="flex gap-4 sm:gap-5 text-right bg-gray-50/80 backdrop-blur-sm px-5 py-3.5 rounded-2xl border border-gray-200/60 w-full sm:w-auto justify-between sm:justify-end">
            <div>
              <span className="text-[9px] text-gray-400 font-black uppercase block tracking-[0.2em] mb-0.5">Queries</span>
              <span className="text-lg font-black text-gray-800 leading-none">{history.length}</span>
            </div>
            <div className="border-l-2 border-gray-200 pl-4 sm:pl-5">
              <span className="text-[9px] text-gray-400 font-black uppercase block tracking-[0.2em] mb-0.5">Unique</span>
              <span className="text-lg font-black text-[#E01A76] leading-none">{totalUniqueWords}</span>
            </div>
          </div>
        </div>

        <div className="w-full max-w-2xl relative z-10">
          {/* BRANDING HEADER WITH ACTION BUTTONS */}
          <div className="px-2 mb-6 sm:mb-10 flex flex-col sm:flex-row justify-between sm:items-end gap-5">
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <span className="bg-gradient-to-r from-[#FFB800] to-[#F59E0B] text-[#4A0027] text-[10px] px-3.5 py-1.5 rounded-lg font-black tracking-widest uppercase shadow-md flex items-center gap-1.5 w-max">
                  <Compass size={12} strokeWidth={3} /> PREMIUM NODE
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-[#8B004A] to-[#E01A76] bg-clip-text text-transparent tracking-wide drop-shadow-sm break-words font-playful pb-1">
                Vocab Mastery
              </h1>
              <p className="text-gray-500 font-black text-xs mt-2 uppercase tracking-[0.25em] opacity-80 break-words flex items-center gap-2">
                <Zap size={14} className="text-[#E01A76]" /> AI-Driven Lexicon
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => navigate('/find-vocab')}
                className="flex items-center justify-center gap-2 text-[11px] font-black text-white bg-gradient-to-br from-[#8B004A] to-[#E01A76] transition-all px-6 py-4 rounded-xl shadow-lg shadow-[#E01A76]/20 hover:shadow-[#E01A76]/40 hover:-translate-y-0.5 active:scale-95 uppercase tracking-widest w-full sm:w-auto border border-transparent"
              >
                <Swords size={16} strokeWidth={2.5} className="flex-shrink-0" /> Practice Stack
              </button>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className={`flex items-center justify-center gap-2 text-[11px] font-black transition-all px-6 py-4 rounded-xl border-[3px] shadow-sm active:scale-95 uppercase tracking-widest w-full sm:w-auto ${showHistory ? 'bg-[#8B004A] text-white border-[#8B004A]' : 'bg-white text-[#8B004A] hover:bg-gray-50 border-white hover:border-gray-100'}`}
              >
                {showHistory ? "Close Stack" : "View Stack"}
                <ChevronDown size={16} className={`transform transition-transform duration-500 flex-shrink-0 ${showHistory ? 'rotate-180 text-white' : 'text-[#8B004A]'}`} strokeWidth={3} />
              </button>
            </div>
          </div>

          {/* HISTORY DROPDOWN PANEL */}
          <div className={`w-full grid transition-all duration-500 ease-in-out ${showHistory ? 'grid-rows-[1fr] opacity-100 mb-10' : 'grid-rows-[0fr] opacity-0 mb-0'}`}>
            <div className="overflow-hidden">
              <div className="bg-white/90 backdrop-blur-md border-[3px] border-white rounded-[2rem] p-5 sm:p-7 shadow-2xl shadow-[#8B004A]/10 relative w-full mt-2">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-1.5 bg-gradient-to-r from-[#8B004A] to-[#E01A76] rounded-b-full"></div>
                
                <div className="flex justify-between items-center mb-6 mt-2">
                  <h4 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] break-words flex items-center gap-2">
                    <History size={16} className="text-[#8B004A]" /> Your Flashcards
                  </h4>
                  <span className="text-[9px] text-[#E01A76] font-bold uppercase tracking-widest bg-[#E01A76]/10 px-2.5 py-1.5 rounded-lg border border-[#E01A76]/20">
                    Tap to recall
                  </span>
                </div>

                {history.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 opacity-70">
                    <ImageIcon size={48} className="text-gray-300 mb-4" strokeWidth={1} />
                    <p className="text-center text-sm font-black text-gray-400 uppercase tracking-wider">No words discovered yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar pb-2">
                    {history.map((item) => (
                      <div key={item._id} className="flex items-center gap-2 bg-gray-50/80 border-2 border-gray-100 rounded-2xl p-1.5 shadow-sm hover:shadow-md hover:border-[#8B004A]/20 transition-all w-full group">
                        
                        <div 
                          className="flip-card flex-1 h-[60px] cursor-pointer"
                          onClick={() => toggleFlip(item._id)}
                        >
                          <div className={`flip-card-inner w-full h-full relative ${flippedCards[item._id] ? 'flip-card-flipped' : ''}`}>
                            
                            <div className="flip-card-front absolute w-full h-full bg-white group-hover:bg-[#E01A76]/5 rounded-xl px-4 flex items-center justify-between border border-transparent transition-colors">
                              <span className="text-gray-900 text-[15px] font-black tracking-wide truncate">
                                {item.word} {item.imageUrl && "🖼️"}
                              </span>
                              <span className="text-[8px] text-gray-400 font-bold uppercase tracking-widest bg-gray-100 px-2 py-1 rounded shadow-sm">
                                Tap
                              </span>
                            </div>

                            <div className="flip-card-back absolute w-full h-full bg-gradient-to-r from-[#8B004A] to-[#E01A76] text-white rounded-xl px-3 flex items-center justify-center shadow-inner">
                              <span className="text-[13px] font-bold text-center line-clamp-2 leading-tight w-full">
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
                            className="bg-white hover:bg-[#8B004A] text-[#8B004A] hover:text-white h-[60px] w-[46px] rounded-xl transition-all shadow-sm active:scale-95 border border-gray-200 hover:border-transparent flex items-center justify-center icon-btn"
                            title="Read Details"
                          >
                            <Search size={18} strokeWidth={2.5} className="transition-transform" />
                          </button>
                          
                          <button
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              navigate('/find-vocab'); 
                            }}
                            className="bg-gray-900 hover:bg-[#E01A76] text-white h-[60px] w-[46px] rounded-xl transition-all shadow-sm active:scale-95 border border-transparent flex items-center justify-center icon-btn"
                            title="Take Test"
                          >
                            <Swords size={18} strokeWidth={2.5} className="transition-transform" />
                          </button>
                        </div>

                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* MASSIVE SEARCH BAR */}
          <div className="w-full mb-8 group relative z-20">
            <div className="absolute inset-0 bg-gradient-to-r from-[#8B004A] to-[#E01A76] rounded-[2.5rem] blur-xl opacity-20 group-focus-within:opacity-40 transition-opacity duration-500"></div>
            <div className="relative flex items-center bg-white border-[4px] border-white group-focus-within:border-[#8B004A]/10 rounded-[2.5rem] p-2 shadow-2xl transition-all duration-300 w-full">
              <div className="absolute left-6 text-[#8B004A] transition-transform group-focus-within:scale-110 flex-shrink-0">
                <Search size={26} strokeWidth={3} />
              </div>
              <input
                type="text"
                placeholder={`Analyze: ${placeholderText}`}
                value={word}
                onChange={(e) => setWord(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearchWord()}
                className="flex-1 bg-transparent pl-16 sm:pl-20 pr-4 py-4 sm:py-5 outline-none text-gray-900 font-black placeholder-gray-400 text-lg sm:text-xl w-full tracking-wide"
              />
              <button
                onClick={() => handleSearchWord()}
                disabled={loading}
                className="bg-gradient-to-r from-[#8B004A] to-[#E01A76] hover:from-[#6a0038] hover:to-[#b0135a] text-white px-8 sm:px-12 py-4 sm:py-5 rounded-full text-[13px] font-black uppercase tracking-widest transition-all shadow-xl shadow-[#E01A76]/30 disabled:opacity-70 disabled:cursor-not-allowed border-none active:scale-95 flex items-center justify-center gap-2 flex-shrink-0"
              >
                {loading ? (
                  <Loader2 size={20} className="animate-spin flex-shrink-0" strokeWidth={3} />
                ) : (
                  <>GO <ArrowRight size={18} strokeWidth={3} /></>
                )}
              </button>
            </div>
          </div>

          {/* TOGGLE TABS (AI READ / SEE POSTS) */}
          {activeWord && !loading && (
            <div className="w-full max-w-[440px] mx-auto mb-8 flex bg-white/60 backdrop-blur-md p-2 rounded-2xl border-[3px] border-white shadow-lg animate-stagger-1 relative z-10">
              <button
                onClick={() => setResultView("ai")}
                className={`flex-1 flex items-center justify-center gap-2 py-4 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${
                  resultView === "ai"
                    ? "bg-white text-[#8B004A] shadow-md border border-gray-100"
                    : "text-gray-500 hover:text-[#8B004A] hover:bg-white/50"
                }`}
              >
                <BookOpen size={16} strokeWidth={2.5} /> AI Read
              </button>
              <button
                onClick={() => setResultView("posts")}
                className={`flex-1 flex items-center justify-center gap-2 py-4 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 relative ${
                  resultView === "posts"
                    ? "bg-white text-[#8B004A] shadow-md border border-gray-100"
                    : "text-gray-500 hover:text-[#8B004A] hover:bg-white/50"
                }`}
              >
                <Globe size={16} strokeWidth={2.5} /> See Posts
                {relatedPosts.length > 0 && (
                  <span className="ml-1 px-2.5 py-0.5 rounded-md text-[10px] bg-[#E01A76]/10 text-[#E01A76] border border-[#E01A76]/20">
                    {relatedPosts.length}
                  </span>
                )}
              </button>
            </div>
          )}

          {/* SKELETON LOADER STATE */}
          {loading && (
            <div className="w-full max-w-[440px] mx-auto bg-white border-[4px] border-white rounded-[2.5rem] p-6 sm:p-8 shadow-2xl relative overflow-hidden mb-8">
              <div className="animate-pulse flex flex-col space-y-8">
                <div className="flex justify-between items-start">
                  <div className="h-12 bg-gray-200 rounded-2xl w-1/2"></div>
                  <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                </div>
                <div className="space-y-4">
                  <div className="h-24 bg-gray-100 rounded-2xl w-full"></div>
                  <div className="h-16 bg-gray-100 rounded-2xl w-3/4"></div>
                </div>
                <div className="h-32 bg-gray-50 rounded-2xl w-full border-2 border-dashed border-gray-200"></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-20 bg-gray-100 rounded-2xl w-full"></div>
                  <div className="h-20 bg-gray-100 rounded-2xl w-full"></div>
                </div>
              </div>
            </div>
          )}

          {/* MAIN RESULTS CONTENT */}
          {activeWord && !loading && (
            <div className="w-full flex flex-col items-center relative z-10">
              
              {/* === VIEW 1: AI READ === */}
              {resultView === "ai" && (
                <>
                  <div className="flex justify-end pr-2 w-full max-w-[440px] animate-stagger-1">
                    <div className="bg-gradient-to-r from-[#E01A76] to-[#b0135a] text-white rounded-3xl rounded-tr-sm px-5 sm:px-6 py-4 text-[13px] font-black leading-relaxed max-w-[95%] sm:max-w-[85%] shadow-lg shadow-[#E01A76]/20 break-words relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-white opacity-10 rounded-full blur-xl transform translate-x-1/2 -translate-y-1/2"></div>
                      Explain the exact Hindi meaning, context, and examples for <span className="text-[#FFB800] uppercase tracking-wider text-[15px] mx-1 break-all font-playful border-b border-[#FFB800]/50 pb-0.5">"{activeWord}"</span>.
                    </div>
                  </div>

                  <div className="bg-white border-[4px] border-white rounded-[2.5rem] p-5 sm:p-8 shadow-2xl relative overflow-hidden mt-3 w-full max-w-[440px] mb-8 bg-dots animate-stagger-2">
                    
                    <div className="absolute top-0 right-0 bg-[#F2EFE7] text-[#8B004A] px-4 py-2 rounded-bl-3xl font-black text-[9px] uppercase tracking-[0.25em] border-b-[3px] border-l-[3px] border-white max-w-[60%] truncate text-right shadow-sm">
                      {contextBadge}
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b-2 border-gray-100 pb-5 mb-6 mt-8 sm:mt-4 gap-4">
                      <div className="w-full sm:w-auto min-w-0">
                        <div className="flex flex-wrap items-center gap-3">
                          <h2 className="text-5xl sm:text-6xl font-bold bg-gradient-to-br from-[#8B004A] to-[#E01A76] bg-clip-text text-transparent capitalize tracking-tight break-all font-playful pb-2">
                            {activeWord}
                          </h2>
                          <span className="bg-[#8B004A]/10 text-[#8B004A] border border-[#8B004A]/20 text-[10px] px-3.5 py-1.5 rounded-lg font-black uppercase tracking-widest shadow-sm flex-shrink-0">
                            {partOfSpeech}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handlePronounce(activeWord)}
                        className="bg-[#F2EFE7] hover:bg-[#8B004A] p-4 rounded-2xl text-[#8B004A] hover:text-white transition-all border-2 border-transparent hover:border-[#8B004A]/20 shadow-sm active:scale-90 flex-shrink-0 self-end sm:self-auto group"
                        title="Listen to pronunciation"
                      >
                        <Volume2 size={24} strokeWidth={2.5} className="group-hover:scale-110 transition-transform" />
                      </button>
                    </div>

                    <div className="space-y-6 text-sm w-full animate-stagger-3">
                      <div className="space-y-4">
                        <div className="bg-gradient-to-br from-[#F2EFE7] to-white rounded-[1.5rem] p-5 sm:p-7 border border-gray-100 shadow-sm relative overflow-hidden group hover:border-[#E01A76]/30 transition-colors">
                          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#8B004A] to-[#E01A76] rounded-l-[1.5rem]"></div>
                          <span className="text-[#8B004A]/60 text-[10px] uppercase font-black tracking-[0.25em] mb-2 block flex items-center gap-1.5">
                            <BookOpen size={12} strokeWidth={3} /> Exact Meaning
                          </span>
                          <p className="text-[#8B004A] font-black text-2xl sm:text-3xl leading-snug break-words tracking-tight">{meaning}</p>
                        </div>
                        
                        <div className="pl-5 sm:pl-6 border-l-[4px] border-[#FFB800] w-full py-1">
                          <p className="text-gray-600 font-bold leading-relaxed text-[15px] break-words">{explanation}</p>
                        </div>
                      </div>

                      <div className="pt-4 w-full">
                        <span className="text-gray-400 text-[10px] uppercase font-black tracking-[0.25em] mb-3 flex items-center gap-2">
                          <Sparkles size={16} className="text-[#FFB800] flex-shrink-0" strokeWidth={2.5} /> Real World Usage
                        </span>
                        <div className="bg-gray-50/80 rounded-[1.5rem] p-5 sm:p-7 border-[3px] border-dashed border-gray-200 text-gray-800 whitespace-pre-line font-bold text-[15px] leading-loose shadow-sm break-words w-full overflow-hidden hover:border-gray-300 transition-colors">
                          {sentences}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 w-full">
                        <div className="bg-gray-50 border-2 border-gray-100 rounded-2xl p-5 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                          <span className="text-gray-400 font-black text-[9px] uppercase tracking-[0.25em] block mb-2">Similar Words</span>
                          <span className="text-[#8B004A] font-black text-[15px] tracking-wide break-words block">{synonyms || "N/A"}</span>
                        </div>
                        <div className="bg-gray-50 border-2 border-gray-100 rounded-2xl p-5 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                          <span className="text-gray-400 font-black text-[9px] uppercase tracking-[0.25em] block mb-2">Opposite Words</span>
                          <span className="text-gray-800 font-black text-[15px] tracking-wide break-words block">{antonyms || "N/A"}</span>
                        </div>
                      </div>

                      {/* IMAGE / MEMORY ANCHOR SECTION */}
                      <div className="pt-8 mt-8 border-t-2 border-gray-100 w-full animate-stagger-4">
                        <div className="flex justify-between items-center mb-5">
                          <span className="text-gray-500 text-[10px] uppercase font-black tracking-[0.25em] flex items-center gap-2">
                            <ImageIcon size={18} className="text-[#E01A76] flex-shrink-0" strokeWidth={2.5} /> Visual Memory Anchor
                          </span>
                        </div>
                        
                        <div className={`w-full rounded-[2rem] bg-gray-50 border-[4px] border-white shadow-inner flex flex-col items-center justify-center overflow-hidden relative transition-all duration-500 ${!isImageExpanded ? 'py-12 sm:py-16' : ''}`}>
                          
                          {(isImageLoading || isUploading) && (
                            <div className="flex flex-col items-center justify-center gap-5 absolute inset-0 bg-white/80 backdrop-blur-md z-10 min-h-[200px]">
                              <div className="relative">
                                <div className="w-14 h-14 border-[4px] border-gray-200 rounded-full"></div>
                                <div className="w-14 h-14 border-[4px] border-[#E01A76] border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                              </div>
                              <p className="text-[#8B004A] font-black text-[10px] uppercase tracking-[0.25em] animate-pulse text-center px-4 bg-[#8B004A]/5 py-2 rounded-xl">
                                {isUploading ? 'Uploading Data...' : 'Rendering Visual Concept...'}
                              </p>
                            </div>
                          )}

                          {imageSrc && !isImageExpanded && !isImageLoading && !isUploading && (
                            <div className="flex flex-col items-center text-center px-6 animate-stagger-1 w-full">
                              <div className="bg-gradient-to-br from-[#8B004A] to-[#E01A76] p-5 sm:p-6 rounded-full mb-5 text-white shadow-xl shadow-[#E01A76]/30 flex-shrink-0 transform hover:scale-105 transition-transform">
                                <ImageIcon size={36} strokeWidth={2} />
                              </div>
                              <h3 className="text-xl font-black text-gray-900 mb-1.5 break-words">Visual Concept Ready</h3>
                              <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em] mb-8 break-words px-2 border-b border-gray-200 pb-2">Tap to burn "{activeWord}" into memory</p>
                              <button 
                                onClick={() => setIsImageExpanded(true)}
                                className="px-10 sm:px-12 py-4 sm:py-5 bg-gray-900 hover:bg-[#E01A76] text-white text-[13px] font-black uppercase tracking-[0.25em] rounded-2xl transition-all shadow-xl shadow-gray-900/20 active:scale-95 border-none w-full sm:w-auto flex items-center justify-center gap-3"
                              >
                                Reveal Imagery <ArrowRight size={16} strokeWidth={3} />
                              </button>
                            </div>
                          )}

                          {imageSrc && isImageExpanded && (
                            <div className="relative group w-full">
                              <img 
                                src={imageSrc} 
                                alt={activeWord} 
                                className="w-full h-auto max-h-[500px] object-cover transition-opacity duration-700 block"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4 pointer-events-none">
                                <span className="text-white font-black text-sm uppercase tracking-widest drop-shadow-md">"{activeWord}"</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {imageSrc && isImageExpanded && (
                          <div className="grid grid-cols-3 sm:flex sm:flex-nowrap gap-2 sm:gap-3 mt-4 justify-center animate-stagger-2 w-full">
                            <button
                              onClick={() => handleGenerateImage('regenerate', activeWord)}
                              disabled={isImageLoading || isUploading}
                              className="col-span-1 w-full sm:w-auto py-4 px-2 bg-gray-50 hover:bg-white text-[#8B004A] text-[9px] sm:text-[10px] font-black rounded-xl disabled:opacity-50 transition-all border-2 border-transparent hover:border-gray-200 flex flex-col sm:flex-row justify-center items-center gap-1.5 sm:gap-2 uppercase tracking-widest shadow-sm active:scale-95"
                            >
                              <RefreshCw size={18} className="sm:w-4 sm:h-4" strokeWidth={2.5} /> <span className="truncate mt-1 sm:mt-0">Regenerate</span>
                            </button>
                            
                            <button
                              onClick={() => {
                                const userIdea = window.prompt("Custom visual prompt (e.g., 'A modern neon city'):");
                                if (userIdea !== null && userIdea.trim() !== "") {
                                  handleGenerateImage('refine', activeWord, userIdea);
                                }
                              }}
                              disabled={isImageLoading || isUploading}
                              className="col-span-1 w-full sm:w-auto py-4 px-2 bg-gray-50 hover:bg-white text-[#8B004A] text-[9px] sm:text-[10px] font-black rounded-xl disabled:opacity-50 transition-all border-2 border-transparent hover:border-gray-200 flex flex-col sm:flex-row justify-center items-center gap-1.5 sm:gap-2 uppercase tracking-widest shadow-sm active:scale-95"
                            >
                              <Sparkles size={18} className="sm:w-4 sm:h-4 text-[#FFB800]" strokeWidth={2.5} /> <span className="truncate mt-1 sm:mt-0">Custom</span>
                            </button>

                            <button
                              onClick={() => fileInputRef.current.click()}
                              disabled={isImageLoading || isUploading}
                              className="col-span-1 w-full sm:w-auto py-4 px-2 bg-gray-50 hover:bg-white text-[#8B004A] text-[9px] sm:text-[10px] font-black rounded-xl disabled:opacity-50 transition-all border-2 border-transparent hover:border-gray-200 flex flex-col sm:flex-row justify-center items-center gap-1.5 sm:gap-2 uppercase tracking-widest shadow-sm active:scale-95"
                            >
                              <Upload size={18} className="sm:w-4 sm:h-4" strokeWidth={2.5} /> <span className="truncate mt-1 sm:mt-0">Upload</span>
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

                    <div className="flex flex-col sm:flex-row justify-center sm:justify-end gap-3 border-t-2 border-gray-100 mt-8 pt-6 w-full animate-stagger-4">
                      <button
                        onClick={() => handleSearchWord(activeWord, true)}
                        disabled={loading}
                        className="text-[10px] bg-gray-100 hover:bg-[#8B004A] text-gray-600 hover:text-white flex items-center justify-center gap-2 font-black transition-all uppercase tracking-[0.2em] px-6 py-4 rounded-xl shadow-sm active:scale-95 w-full sm:w-auto"
                      >
                        <RefreshCw size={16} strokeWidth={3} className="flex-shrink-0" /> Alt Context
                      </button>

                      <button
                        onClick={handleShareToCommunity}
                        disabled={isSharing}
                        className={`text-[11px] text-white flex items-center justify-center gap-2 font-black transition-all uppercase tracking-[0.2em] px-6 py-4 rounded-xl shadow-lg active:scale-95 w-full sm:w-auto ${sharedPostId ? 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-emerald-500/30' : 'bg-gradient-to-r from-[#8B004A] to-[#E01A76] shadow-[#E01A76]/30'}`}
                      >
                        {isSharing ? (
                          <><Loader2 size={18} className="animate-spin flex-shrink-0" strokeWidth={3} /> Processing...</>
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
                    <div className="flex flex-col items-center justify-center py-20 bg-white border-[4px] border-white rounded-[2.5rem] w-full max-w-[440px] shadow-xl">
                      <Loader2 className="w-12 h-12 text-[#E01A76] animate-spin mb-5" strokeWidth={2.5} />
                      <span className="text-[11px] text-gray-400 font-black uppercase tracking-widest bg-gray-50 px-4 py-2 rounded-lg">Searching archives...</span>
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
                    <div className="flex flex-col items-center justify-center py-20 px-8 bg-white border-[4px] border-white rounded-[2.5rem] w-full max-w-[440px] text-center shadow-xl">
                      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-gray-100">
                        <Globe className="w-10 h-10 text-gray-300" strokeWidth={2} />
                      </div>
                      <h3 className="text-gray-900 font-black text-2xl mb-3 tracking-tight">No Posts Yet</h3>
                      <p className="text-gray-500 text-[12px] uppercase tracking-widest font-bold leading-relaxed max-w-[280px]">
                        Be the first to share <span className="text-[#E01A76] bg-[#E01A76]/10 px-1.5 py-0.5 rounded">"{activeWord}"</span> with the community!
                      </p>
                      <button 
                        onClick={() => setResultView("ai")}
                        className="mt-8 px-8 py-4 bg-gray-900 hover:bg-[#8B004A] text-white rounded-xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-md flex items-center gap-2"
                      >
                        <BookOpen size={16} strokeWidth={2.5} /> Back to AI Read
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