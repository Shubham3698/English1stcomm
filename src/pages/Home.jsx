import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import PostCard from "../components/PostCard"; 
import VisualAnchor from "../components/ai-wordsimg/VisualAnchor"; 
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";

// 🔥 Native Speech imports
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { Capacitor } from '@capacitor/core';

import { 
  Search, History, Volume2, RefreshCw, Sparkles, Image as ImageIcon, 
  ChevronDown, Swords, Share2, Globe, Loader2, X, Send, Check, Bot
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
  const activeWordRef = useRef("");

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

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const [userSquads, setUserSquads] = useState([]);
  const [isFetchingSquads, setIsFetchingSquads] = useState(false);
  const [sentSquads, setSentSquads] = useState(new Set()); 
  const [selectedSquads, setSelectedSquads] = useState(new Set()); 
  
  const [isGlobalSelected, setIsGlobalSelected] = useState(false);
  const [isGlobalSent, setIsGlobalSent] = useState(false);
  
  const [isSendingMultiple, setIsSendingMultiple] = useState(false);
  
  const totalSelected = selectedSquads.size + (isGlobalSelected ? 1 : 0);
  
  const classicWords = [
    "Strategy", "Objective", "Efficiency", "Collaboration", 
    "Innovation", "Optimization", "Productivity", "Leadership", 
    "Execution", "Development"
  ];

  // 🔥 CHAT STATE & REFS
  const [followUpChat, setFollowUpChat] = useState([]);
  const [chatInputText, setChatInputText] = useState("");
  const [isChatProcessing, setIsChatProcessing] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const chatEndRef = useRef(null);
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

  // 🔥 SLEEK STICKY HEADER SCROLL LOGIC
  const { scrollY } = useScroll();
  const [showStickyHeader, setShowStickyHeader] = useState(false);
  const [isStickyDismissed, setIsStickyDismissed] = useState(false); 

  // Auto-reset sticky header when switching back to AI view
  useEffect(() => {
    if (resultView === "ai") {
      setIsStickyDismissed(false);
    }
  }, [resultView]);

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 380 && activeWord && resultView === "ai") {
      setShowStickyHeader(true);
    } else {
      setShowStickyHeader(false);
    }
  });

  // Handle Overflow lock for Modals
  useEffect(() => {
    if (isShareModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => { document.body.style.overflow = "auto"; };
  }, [isShareModalOpen]);

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
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [followUpChat, isChatProcessing]);

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

  useEffect(() => {
    const loggedInUserEmail = localStorage.getItem("eng_userEmail");
    if (loggedInUserEmail) {
      setUserEmail(loggedInUserEmail.trim());
    } else {
      setUserEmail("guest_user@gmail.com"); 
    }
  }, []);

  const unlockAudioEngine = () => {
    if (audioRef.current) {
      audioRef.current.src = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=";
      audioRef.current.play().catch(() => {});
    }
  };

  const playPremiumAudio = async (textToSpeak, base64Audio = null) => {
    if (!textToSpeak) return;
    if (audioRef.current) audioRef.current.pause();
    setIsPlayingAudio(true);

    try {
      let finalAudioSrc = "";
      if (base64Audio) {
        finalAudioSrc = "data:audio/mp3;base64," + base64Audio;
      } else {
        const res = await fetch(`${API_URL}/api/words/speak`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: textToSpeak })
        });
        const data = await res.json();
        if (data.success && data.audioBase64) {
          finalAudioSrc = "data:audio/mp3;base64," + data.audioBase64;
        } else {
          throw new Error("Failed to fetch premium voice");
        }
      }

      audioRef.current.src = finalAudioSrc;
      audioRef.current.onended = () => setIsPlayingAudio(false);
      audioRef.current.onerror = () => {
        setIsPlayingAudio(false);
        fallbackSpeak(textToSpeak);
      };
      await audioRef.current.play();
    } catch (error) {
      setIsPlayingAudio(false);
      fallbackSpeak(textToSpeak);
    }
  };

  const fallbackSpeak = async (text) => {
    if (!text) return;
    try {
      if (isApp) {
        await TextToSpeech.speak({ text: text, lang: 'en-US', rate: 0.9, pitch: 1.2, volume: 1.0 });
      } else {
        if (window.speechSynthesis && window.speechSynthesis.cancel) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = "en-US"; utterance.pitch = 1.2; utterance.rate = 0.9;
          window.speechSynthesis.speak(utterance);
        }
      }
    } catch (err) { console.error("TTS Fallback Error:", err); }
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

        const rankedPosts = matchedPosts.sort((a, b) => {
          const scoreA = (a.voteCount || 0) * 1 + ((a.comments?.length) || 0) * 3 + ((a.savedBy?.length) || 0) * 5;
          const scoreB = (b.voteCount || 0) * 1 + ((b.comments?.length) || 0) * 3 + ((b.savedBy?.length) || 0) * 5;
          if (scoreB !== scoreA) return scoreB - scoreA; 
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        });

        setRelatedPosts(rankedPosts);
        const existingPost = rankedPosts.find(p => p.userEmail === userEmail && p.word?.toLowerCase() === query);
        if (existingPost) setSharedPostId(existingPost._id);
        else setSharedPostId(null);
      }
    } catch (err) { } finally { setIsFetchingPosts(false); }
  };

  const fetchHistoryFromDB = async (isFirstLoad = false) => {
    if (!userEmail) return;
    try {
      const response = await fetch(`${API_URL}/api/words/history/${encodeURIComponent(userEmail)}?t=${Date.now()}`);
      const resData = await response.json();
      if (response.ok && resData.success) {
        const fetchedHistory = resData.data;
        setHistory(fetchedHistory);
        if (isFirstLoad) {
          if (fetchedHistory.length > 0) {
            loadFromHistoryCard(fetchedHistory[0], true);
            setContextBadge("Latest Resumed");
          } else {
            handleSearchWord("magic", false, true); 
            setContextBadge("Example Target");
          }
        }
      }
    } catch (err) { }
  };

  useEffect(() => {
    if (userEmail) fetchHistoryFromDB(true);
  }, [userEmail]);

  const fetchUserSquads = async () => {
    if (!userEmail || userEmail === "guest_user@gmail.com") return;
    setIsFetchingSquads(true);
    try {
      const res = await fetch(`${API_URL}/api/squads/user/${userEmail}`);
      const data = await res.json();
      if (data.success) setUserSquads(data.squads);
    } catch (err) { } finally { setIsFetchingSquads(false); }
  };

  const ensurePostExists = async () => {
    if (sharedPostId) {
      await handleUpdateCommunityPost(meaning, sentences, imageGallery, false);
      return sharedPostId;
    }
    const data = new FormData();
    data.append("userEmail", userEmail);
    data.append("title", `Lexicon Entry: ${activeWordRef.current.toUpperCase()}`); 
    data.append("word", activeWordRef.current);
    data.append("meaning", meaning);
    data.append("sentence", sentences || "");

    const vocabData = [{ word: activeWordRef.current, meaning: meaning, sentence: sentences || "", media: imageGallery.map(url => ({ type: 'image', url })) }];
    data.append("vocabData", JSON.stringify(vocabData));

    if (imageGallery.length > 0) {
      const mediaMetadata = imageGallery.map(url => ({ type: 'image', url: url, value: url, mode: 'url', vocabIndex: 0 }));
      data.append("mediaMetadata", JSON.stringify(mediaMetadata));
    }

    try {
      const res = await fetch(`${API_URL}/api/english-posts/create`, { method: "POST", body: data });
      const postResponseData = await res.json(); 
      if (res.ok) {
        const newPostId = postResponseData.post?._id || postResponseData.data?._id || postResponseData._id;
        setSharedPostId(newPostId);
        fetchRelatedPosts(activeWordRef.current);
        return newPostId;
      }
    } catch (e) { }
    return null;
  };

  const handleUpdateCommunityPost = async (updatedMeaning, updatedSentences, updatedGallery, isManualClick = false) => {
    if (!sharedPostId || !userEmail) return;
    const currentImages = updatedGallery || imageGallery;
    const data = new FormData();
    data.append("title", `Lexicon Entry: ${activeWordRef.current.toUpperCase()}`); 
    data.append("word", activeWordRef.current);
    data.append("meaning", updatedMeaning || meaning);
    data.append("sentence", updatedSentences || sentences || "");

    const vocabData = [{ word: activeWordRef.current, meaning: updatedMeaning || meaning, sentence: updatedSentences || sentences || "", media: currentImages.map(url => ({ type: 'image', url })) }];
    data.append("vocabData", JSON.stringify(vocabData));

    const mediaMetadata = currentImages.map((url) => ({ type: 'image', url: url, value: url, mode: 'url', vocabIndex: 0 }));
    data.append("mediaMetadata", JSON.stringify(mediaMetadata));

    try {
      const res = await fetch(`${API_URL}/api/english-posts/update/${sharedPostId}`, { method: "PUT", body: data });
      if (res.ok) {
        if (isManualClick) toast.success("Community Post Updated! 🔄✨");
        fetchRelatedPosts(activeWordRef.current); 
      }
    } catch (e) { }
  };

  const toggleSquadSelection = (squadId) => {
    if (sentSquads.has(squadId)) return; 
    setSelectedSquads(prev => {
      const newSet = new Set(prev);
      if (newSet.has(squadId)) newSet.delete(squadId); else newSet.add(squadId);
      return newSet;
    });
  };

  const handleSendMultiple = async () => {
    if (totalSelected === 0) return;
    setIsSendingMultiple(true);
    try {
      const postId = await ensurePostExists();
      if (!postId) { toast.error("Failed to prepare flashcard."); setIsSendingMultiple(false); return; }

      if (isGlobalSelected) { setIsGlobalSent(true); setIsGlobalSelected(false); }

      if (selectedSquads.size > 0) {
        const sendPromises = Array.from(selectedSquads).map(squadId => 
          fetch(`${API_URL}/api/squads/${squadId}/message`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ senderEmail: userEmail, type: "post", postId: postId })
          }).then(res => ({ squadId, success: res.ok }))
        );

        const results = await Promise.all(sendPromises);
        const successfulSquads = results.filter(r => r.success).map(r => r.squadId);

        if (successfulSquads.length > 0) {
          setSentSquads(prev => {
            const newSet = new Set(prev);
            successfulSquads.forEach(id => newSet.add(id));
            return newSet;
          });
          setSelectedSquads(new Set()); 
        }
      }
      toast.success("Shared successfully! 🚀");
    } catch (err) { toast.error("Network error!"); } finally { setIsSendingMultiple(false); }
  };

  const handleGenerateImage = async (actionType = "normal", wordToGenerate, customPrompt = "", skipPostUpdate = false) => {
    if (!wordToGenerate || !userEmail) return;
    if (activeWordRef.current !== wordToGenerate && actionType === "normal") return;

    setIsImageLoading(true);
    setImageAction(actionType);
    if (actionType === "normal") { setImageGallery([]); setIsImageExpanded(false); }

    try {
      const response = await fetch(`${API_URL}/api/image/generate`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phrase: wordToGenerate, actionType, userId: userEmail, customPrompt }),
      });
      const data = await response.json();

      if (response.ok && data.imageUrl) {
        fetchHistoryFromDB(); 
        if (activeWordRef.current === wordToGenerate) {
            setImageGallery(prev => {
                const newGallery = actionType === "normal" ? [data.imageUrl] : [...prev, data.imageUrl];
                if (sharedPostId && !skipPostUpdate) handleUpdateCommunityPost(meaning, sentences, newGallery);
                return newGallery;
            });
            setIsImageExpanded(true); 
        }
      } else {
        if (activeWordRef.current === wordToGenerate) toast.error("Visual generation failed");
      }
    } catch (err) { } finally {
      if (activeWordRef.current === wordToGenerate) { setIsImageLoading(false); setImageAction(""); }
    }
  };

  const handleCustomImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !userEmail || !activeWordRef.current) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append("image", file); formData.append("word", activeWordRef.current); formData.append("userId", userEmail);

    try {
      const response = await fetch(`${API_URL}/api/image/upload-custom`, { method: "POST", body: formData });
      const data = await response.json();
      if (response.ok && data.imageUrl) {
        toast.success("Image added! 🎉");
        const updatedGallery = [...imageGallery, data.imageUrl]; 
        setImageGallery(updatedGallery); 
        try {
          await fetch(`${API_URL}/api/words/update-images`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ word: activeWordRef.current, userId: userEmail, imageUrls: updatedGallery })
          });
        } catch(err) {}
        fetchHistoryFromDB(); 
        if (sharedPostId) handleUpdateCommunityPost(meaning, sentences, updatedGallery);
      } else toast.error(data.error || "Upload failed.");
    } catch (err) { toast.error("Upload error!"); } finally {
      setIsUploading(false); if (fileInputRef.current) fileInputRef.current.value = ""; 
    }
  };

  // 🔥 SAFE WEB IMPORT LOGIC UPDATED 🔥
  const handleWebImport = async (selectedImage) => {
    let safeUrl = "";
    if (typeof selectedImage === "string") {
      safeUrl = selectedImage;
    } else if (selectedImage && typeof selectedImage === "object") {
      safeUrl = selectedImage.url || selectedImage.link || selectedImage.src || "";
    }

    if (!safeUrl) {
      toast.error("Could not extract image URL.");
      return;
    }

    setIsImageLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/image/import-web`, {
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        // 🔥 FIX: Added 'url', 'imageUrl', and 'imageUrls' as array to satisfy ANY backend requirement 🔥
        body: JSON.stringify({ 
          word: activeWordRef.current, 
          userId: userEmail, 
          url: safeUrl, 
          imageUrl: safeUrl,
          imageUrls: [safeUrl] 
        }),
      });
      const data = await response.json();
      
      const savedImgUrl = data.imageUrl || data.url; // Backend jo bhi key wapas kare

      if (response.ok && savedImgUrl) {
        toast.success("Image Saved! 🌍✨");
        const updatedGallery = [...imageGallery, savedImgUrl];
        setImageGallery(updatedGallery); 
        setIsImageExpanded(true); 
        fetchHistoryFromDB();
        if (sharedPostId) handleUpdateCommunityPost(meaning, sentences, updatedGallery);
        try {
          await fetch(`${API_URL}/api/words/update-images`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ word: activeWordRef.current, userId: userEmail, imageUrls: updatedGallery })
          });
        } catch(err) {}
      } else {
        toast.error(data.error || "Web import fail.");
      }
    } catch (err) { 
        toast.error("Network error."); 
    } finally { 
        setIsImageLoading(false); 
    }
  };

  const handleRemoveImage = async (indexToRemove) => {
    const updatedGallery = imageGallery.filter((_, index) => index !== indexToRemove);
    setImageGallery(updatedGallery);
    if (sharedPostId) handleUpdateCommunityPost(meaning, sentences, updatedGallery, true);
    try {
      const response = await fetch(`${API_URL}/api/words/update-images`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: activeWordRef.current, userId: userEmail, imageUrls: updatedGallery })
      });
      if (response.ok) { toast.success("Image removed 🗑️"); fetchHistoryFromDB(); }
    } catch (err) {}
  };

  const handleSearchWord = async (wordToSearch = word, isAlternative = false, isSilent = false) => {
    const searchTarget = wordToSearch ? wordToSearch.trim() : "";
    if (!searchTarget && !isSilent) return toast.error("Please enter a word");
    if (!userEmail || userEmail === "guest_user@gmail.com") {
        if (!isSilent) return toast.error("Please login first! 🚫");
    }

    if (!isAlternative) setSharedPostId(null);
    setLoading(true); setShowHistory(false); setResultView("ai"); 
    if (!isSilent) setContextBadge("Analyzed Target");

    setSentSquads(new Set()); setSelectedSquads(new Set()); setIsGlobalSelected(false); setIsGlobalSent(false);
    setImageGallery([]); setIsImageExpanded(false); setFollowUpChat([]); setChatInputText("");
    
    // 🔥 RESET STICKY HEADER DISMISS STATE FOR NEW WORD
    setIsStickyDismissed(false); 

    try {
      const response = await fetch(`${API_URL}/api/words/define`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: searchTarget, userId: userEmail, getAlternative: isAlternative }),
      });
      const resData = await response.json();

      if (response.ok && resData.success) {
        const fetchedWord = resData.data.word;
        setActiveWord(fetchedWord); activeWordRef.current = fetchedWord; 
        setPartOfSpeech(resData.data.partOfSpeech); setMeaning(resData.data.meaning); setExplanation(resData.data.explanation);
        setSynonyms(resData.data.synonyms); setAntonyms(resData.data.antonyms); setSentences(resData.data.sentences);

        if (!isSilent) {
          if (isAlternative) toast.success("New context generated! 🔄");
          else toast.success("Word analyzed! 🚀");
          playPremiumAudio(fetchedWord);
        }
        
        setWord(""); fetchHistoryFromDB(); fetchRelatedPosts(fetchedWord); 

        let newGallery = [];
        if (Array.isArray(resData.data.imageUrls) && resData.data.imageUrls.length > 0) newGallery = [...resData.data.imageUrls];
        else if (resData.data.imageUrl && resData.data.imageUrl.trim() !== "") newGallery = [resData.data.imageUrl];

        setImageGallery(newGallery); setIsImageExpanded(false); 

        if (isAlternative && sharedPostId) handleUpdateCommunityPost(resData.data.meaning, resData.data.sentences, newGallery);
        if (newGallery.length === 0) handleGenerateImage("normal", fetchedWord, "", true);
      } else { if (!isSilent) toast.error(resData.message || "Server did not return data!"); }
    } catch (err) { if (!isSilent) toast.error("Failed to connect to backend!"); } finally { setLoading(false); }
  };

  const loadFromHistoryCard = (item, isSilent = false) => {
    setSharedPostId(null);
    setActiveWord(item.word); activeWordRef.current = item.word; 
    setPartOfSpeech(item.partOfSpeech || "Vocabulary"); setMeaning(item.meaning); setExplanation(item.explanation);
    setSynonyms(item.synonyms); setAntonyms(item.antonyms); setSentences(item.sentences);
    setShowHistory(false); setResultView("ai"); 
    setSentSquads(new Set()); setSelectedSquads(new Set()); setIsGlobalSelected(false); setIsGlobalSent(false);
    setFollowUpChat(item.chatHistory || []); setChatInputText("");

    // 🔥 RESET STICKY HEADER DISMISS STATE ON HISTORY LOAD
    setIsStickyDismissed(false);

    if (!isSilent) {
      setContextBadge("Historical Target");
      playPremiumAudio(item.word);
    }
    fetchRelatedPosts(item.word);
    
    let historyImages = [];
    if (Array.isArray(item.imageUrls) && item.imageUrls.length > 0) historyImages = [...item.imageUrls];
    else if (item.imageUrl && item.imageUrl.trim() !== "") historyImages = [item.imageUrl];

    setImageGallery(historyImages); setIsImageExpanded(false);
    if (historyImages.length === 0) handleGenerateImage("normal", item.word, "", true);
  };

  const handleSendChatMessage = async () => {
    unlockAudioEngine(); 
    const userMsg = chatInputText.trim();
    if (!userMsg || !activeWord) return;

    setChatInputText("");
    const newHistory = [...followUpChat, { role: "user", text: userMsg }];
    setFollowUpChat(newHistory); setIsChatProcessing(true);

    try {
      const response = await fetch(`${API_URL}/api/words/followup-chat`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userEmail, word: activeWord, message: userMsg, history: newHistory })
      });
      const data = await response.json();
      if (response.ok && data.reply) {
        setFollowUpChat(prev => [...prev, { role: "ai", text: data.reply, audioBase64: data.audioBase64 }]);
        playPremiumAudio(data.reply, data.audioBase64);
      } else toast.error("Tutor failed to respond.");
    } catch (error) { toast.error("Network connection error!"); } finally { setIsChatProcessing(false); }
  };

  const toggleFlip = (id) => setFlippedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  const totalUniqueWords = new Set(history.map(item => item.word.toLowerCase())).size;

  const handleCloseShareModal = () => {
    setIsShareModalOpen(false); setSelectedSquads(new Set()); setIsGlobalSelected(false);
  };

  // 🔥 CUSTOM ANIMATION VARIANTS FOR SCROLL
  const scrollVariant = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", bounce: 0.4, duration: 0.6 } }
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

          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

          /* Glassmorphism Ultra Premium - Adjusted for F2EFE7 */
          .glass-ultra {
            background: rgba(242, 239, 231, 0.6);
            backdrop-filter: blur(24px);
            -webkit-backdrop-filter: blur(24px);
            border: 1px solid rgba(255, 255, 255, 0.8);
            box-shadow: 0 8px 32px 0 rgba(139, 0, 74, 0.05);
          }

          .glass-solid {
            background: rgba(255, 255, 255, 0.85);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 1);
            box-shadow: 0 4px 20px 0 rgba(139, 0, 74, 0.06);
          }

          /* Duolingo Style Bold Button */
          .duo-btn {
            border-bottom-width: 4px;
            transition: all 0.1s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .duo-btn:active:not(:disabled) {
            transform: translateY(4px);
            border-bottom-width: 0px;
            margin-top: 4px;
          }

          /* Clean Flip Card */
          .flip-card { perspective: 1000px; }
          .flip-card-inner { transform-style: preserve-3d; transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
          .flip-card-flipped { transform: rotateY(180deg); }
          .flip-card-front, .flip-card-back { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
          .flip-card-back { transform: rotateY(180deg); }
        `}
      </style>

      {/* --- EXACT MURREY/ALABASTER COMBO BACKGROUND --- */}
      <div className="min-h-screen bg-[#F2EFE7] text-gray-900 flex flex-col items-center p-4 py-8 font-body pb-32 overflow-x-hidden w-full relative selection:bg-[#E01A76]/20 selection:text-[#8B004A]">
        
        {/* VIBRANT GLOWING ORBS FOR BLUR EFFECT */}
        <div className="fixed top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-gradient-to-br from-[#E01A76]/20 to-[#8B004A]/10 rounded-full blur-[100px] pointer-events-none animate-pulse" style={{animationDuration: '6s'}}></div>
        <div className="fixed top-[30%] right-[-20%] w-[60vw] h-[60vw] bg-[#FFB800]/15 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="fixed bottom-[-10%] left-[20%] w-[40vw] h-[40vw] bg-[#8B004A]/10 rounded-full blur-[100px] pointer-events-none"></div>

        {/* --- 1. MINIMAL PREMIUM HEADER --- */}
        <div className="w-full max-w-2xl flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 z-10">
          <div className="glass-ultra px-4 py-3 rounded-3xl flex items-center gap-3 w-full sm:w-auto">
             <div className="bg-white p-2.5 rounded-2xl text-[#8B004A] shadow-sm">
               <History size={18} strokeWidth={3} />
             </div>
             <div>
               <p className="text-[10px] text-gray-500 font-extrabold uppercase tracking-widest leading-none mb-1">Explorer</p>
               <p className="font-heading font-black text-[#8B004A] text-sm truncate">
                 {userEmail === "guest_user@gmail.com" ? "Guest Mode" : userEmail}
               </p>
             </div>
          </div>

          <div className="flex gap-4 w-full sm:w-auto">
            <div className="glass-ultra px-6 py-3 rounded-3xl flex items-center gap-6 w-full justify-center">
              <div className="text-center">
                <span className="text-[10px] text-gray-500 font-extrabold uppercase tracking-wider block mb-0.5">Searches</span>
                <span className="font-heading font-black text-gray-900 text-[18px] leading-none">{history.length}</span>
              </div>
              <div className="w-px h-8 bg-gray-300"></div>
              <div className="text-center">
                <span className="text-[10px] text-gray-500 font-extrabold uppercase tracking-wider block mb-0.5">Words</span>
                <span className="font-heading font-black text-[#E01A76] text-[18px] leading-none">{totalUniqueWords}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full max-w-2xl relative z-10">
          {/* --- 2. CLEAN BOLD TITLE AREA --- */}
          <div className="mb-10 text-center sm:text-left flex flex-col sm:flex-row justify-between items-center sm:items-end gap-5">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-3">
                <span className="bg-[#8B004A]/10 text-[#8B004A] text-[10px] px-3 py-1.5 rounded-xl font-extrabold tracking-widest uppercase flex items-center gap-1.5 border border-[#8B004A]/20">
                  <Sparkles size={14} fill="currentColor"/> Elite Node
                </span>
              </div>
              <h1 className="text-5xl sm:text-[3.8rem] font-heading font-black text-gray-900 tracking-tight leading-none drop-shadow-sm">
                Vocab <span className="text-transparent bg-clip-text bg-gradient-to-br from-[#8B004A] to-[#E01A76]">Mastery</span>
              </h1>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex gap-3">
              <button
                onClick={() => navigate('/find-vocab')}
                className="flex items-center gap-2 bg-[#8B004A] text-white px-5 py-3.5 rounded-[1.5rem] text-sm font-bold shadow-lg duo-btn border-[#5A0030]"
              >
                <Swords size={18} strokeWidth={2.5}/> Practice
              </button>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className={`flex items-center gap-2 px-5 py-3.5 rounded-[1.5rem] text-sm font-bold shadow-md duo-btn ${showHistory ? 'glass-ultra text-[#8B004A] border-white' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
              >
                {showHistory ? "Hide Stack" : "History"}
                <ChevronDown size={18} strokeWidth={2.5} className={`transition-transform duration-300 ${showHistory ? 'rotate-180' : ''}`} />
              </button>
            </motion.div>
          </div>

          {/* --- 3. SLEEK HISTORY CARDS --- */}
          <AnimatePresence>
            {showHistory && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mb-10"
              >
                <div className="glass-ultra rounded-[2rem] p-5">
                  {history.length === 0 ? (
                    <div className="py-8 text-center opacity-60">
                      <ImageIcon size={40} className="mx-auto text-gray-400 mb-3" />
                      <p className="font-heading text-sm font-bold text-gray-600">Your collection is empty.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      {history.map((item) => (
                        <div key={item._id} className="flex gap-2 group">
                          <div className="flip-card flex-1 h-[60px] cursor-pointer" onClick={() => toggleFlip(item._id)}>
                            <div className={`flip-card-inner w-full h-full relative ${flippedCards[item._id] ? 'flip-card-flipped' : ''}`}>
                              <div className="flip-card-front absolute w-full h-full bg-white/90 backdrop-blur-md border border-white rounded-[1.2rem] px-5 flex items-center justify-between hover:bg-white transition-colors shadow-sm">
                                <span className="font-heading font-black text-[#8B004A] text-[16px] truncate">
                                  {item.word} {(item.imageUrl || (item.imageUrls && item.imageUrls.length > 0)) && <span className="text-[12px] ml-1">🖼️</span>}
                                </span>
                                <span className="text-[10px] text-[#E01A76] font-extrabold tracking-widest uppercase bg-[#E01A76]/10 px-2 py-1 rounded-lg">Flip</span>
                              </div>
                              <div className="flip-card-back absolute w-full h-full bg-gradient-to-br from-[#8B004A] to-[#600033] text-white rounded-[1.2rem] px-4 flex items-center justify-center shadow-inner">
                                <span className="text-[13px] text-center font-bold line-clamp-2 leading-tight">
                                  {item.meaning}
                                </span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); loadFromHistoryCard(item); }}
                            className="w-[60px] h-[60px] bg-white border border-white rounded-[1.2rem] flex items-center justify-center text-gray-400 hover:bg-[#FFB800] hover:text-[#8B004A] hover:border-[#FFB800] transition-colors shadow-sm shrink-0 active:scale-95"
                          >
                            <Search size={22} strokeWidth={3}/>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* --- 4. BOLD SEARCH BAR --- */}
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-full mb-12 group z-20">
            <div className="absolute inset-[-4px] bg-gradient-to-r from-[#E01A76] via-[#FFB800] to-[#8B004A] rounded-[2.5rem] blur-xl opacity-30 group-focus-within:opacity-60 transition-opacity duration-500"></div>
            <div className="glass-solid relative flex items-center p-2 rounded-[2.5rem] transition-all box-border group-focus-within:bg-white group-focus-within:border-[#E01A76]/50">
              <div className="pl-6 pr-2 text-gray-400 group-focus-within:text-[#8B004A] transition-colors">
                <Search size={26} strokeWidth={3} />
              </div>
              <input
                type="text"
                placeholder={`Analyze: ${placeholderText}`}
                value={word}
                onChange={(e) => setWord(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearchWord()}
                className="flex-1 bg-transparent border-none outline-none py-4 sm:py-5 text-lg sm:text-xl font-heading font-black text-gray-900 placeholder:text-gray-400 truncate w-full"
              />
              <button
                onClick={() => handleSearchWord()}
                disabled={loading}
                className="bg-gradient-to-r from-[#E01A76] to-[#8B004A] hover:opacity-90 text-white px-7 sm:px-10 h-[56px] sm:h-[64px] rounded-[2rem] font-heading font-black text-sm sm:text-base tracking-wide flex items-center justify-center gap-2 disabled:opacity-70 shrink-0 ml-2 duo-btn border-[#600033]"
              >
                {loading ? <Loader2 size={20} className="animate-spin" /> : <><Sparkles size={18} fill="currentColor"/><span className="hidden sm:inline">Analyze</span></>}
              </button>
            </div>
          </motion.div>

          {/* --- 5. BOLD SEGMENTED CONTROL TABS --- */}
          {activeWord && !loading && (
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex p-1.5 bg-white/40 backdrop-blur-md rounded-2xl w-full max-w-[320px] mx-auto mb-10 z-10 relative border border-white">
              <button
                // 🔥 RESET DISMISS STATE ON TAB CHANGE
                onClick={() => { setResultView("ai"); setIsStickyDismissed(false); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[14px] font-black transition-all duration-300 ${
                  resultView === "ai" ? "bg-white text-[#8B004A] shadow-md" : "text-gray-500 hover:text-gray-800"
                }`}
              >
                <Bot size={18} strokeWidth={2.5}/> AI Chat
              </button>
              <button
                onClick={() => setResultView("posts")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[14px] font-black transition-all duration-300 ${
                  resultView === "posts" ? "bg-white text-[#8B004A] shadow-md" : "text-gray-500 hover:text-gray-800"
                }`}
              >
                <Globe size={18} strokeWidth={2.5}/> Community
                {relatedPosts.length > 0 && <span className="text-[11px] bg-[#FFB800] text-[#8B004A] px-2 py-0.5 rounded-md font-black">{relatedPosts.length}</span>}
              </button>
            </motion.div>
          )}

          {loading && (
            <div className="w-full max-w-[480px] mx-auto glass-ultra rounded-[2.5rem] p-8 mb-8">
              <div className="animate-pulse space-y-6">
                <div className="flex justify-between items-center">
                  <div className="h-6 bg-[#8B004A]/10 rounded-lg w-1/3"></div>
                  <div className="h-12 w-12 bg-[#8B004A]/10 rounded-full"></div>
                </div>
                <div className="h-24 bg-white/50 rounded-2xl w-full"></div>
                <div className="h-32 bg-white/60 rounded-2xl w-full"></div>
              </div>
            </div>
          )}

          {activeWord && !loading && (
            <div className="w-full flex flex-col items-center relative z-10">

              {resultView === "ai" && (
                <div className="w-full max-w-[500px] flex flex-col mx-auto relative z-10 pb-4 gap-6">
                  
                  <div className="flex justify-center mb-1">
                    <span className="glass-solid text-[#8B004A] text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest shadow-sm">{contextBadge}</span>
                  </div>

                  {/* --- ILLUSION OF CHAT (SCROLL ANIMATED) --- */}
                  
                  {/* STEP 1: INITIAL REQUEST -> MEANING */}
                  <motion.div variants={scrollVariant} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} className="flex w-full items-end gap-2 justify-end pl-12 pr-2">
                    <div className="bg-[#8B004A] text-white rounded-[1.5rem] rounded-br-sm px-5 py-4 text-[15px] font-bold shadow-md max-w-[85%] border-b-4 border-[#600033]">
                       Explain the exact meaning and context for <span className="text-[#FFB800] font-black">"{activeWord}"</span>.
                    </div>
                  </motion.div>

                  <motion.div variants={scrollVariant} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} className="flex w-full items-start gap-3 justify-start pr-8 pl-1">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#FFB800] to-[#E01A76] flex items-center justify-center shadow-md shrink-0 z-10 border-2 border-white mt-1">
                      <Bot size={20} className="text-[#8B004A]" strokeWidth={2.5}/>
                    </div>
                    
                    {/* 🔥 UNIFIED MEANING & CONTEXT CARD 🔥 */}
                    <div className="glass-solid rounded-[2rem] rounded-tl-sm p-6 sm:p-8 w-full relative overflow-hidden">
                       <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#FFB800] to-[#E01A76]"></div>
                       
                       <div className="flex justify-between items-start mb-6">
                         <div className="flex flex-col gap-1.5">
                           <h3 className="text-[32px] sm:text-[40px] font-black font-heading text-[#8B004A] tracking-tight leading-none">{activeWord}</h3>
                           <span className="w-max bg-[#E01A76]/10 text-[#E01A76] text-[11px] px-3 py-1 rounded-lg font-bold uppercase tracking-widest border border-[#E01A76]/20">{partOfSpeech}</span>
                         </div>
                         <button onClick={() => playPremiumAudio(activeWord)} className="w-12 h-12 rounded-full bg-[#FFB800] text-[#8B004A] flex items-center justify-center hover:bg-[#F0AD00] transition-colors shrink-0 duo-btn border-[#D99D00]">
                           <Volume2 size={20} strokeWidth={3}/>
                         </button>
                       </div>
                       
                       <div className="mb-6 bg-white/90 rounded-[1.2rem] p-5 shadow-sm border border-white">
                         <span className="text-[11px] font-black text-[#E01A76] uppercase tracking-widest block mb-2 font-heading">Meaning</span>
                         <p className="text-[18px] sm:text-[22px] font-bold text-gray-900 leading-snug">{meaning}</p>
                       </div>

                       <div className="pl-4 border-l-[4px] border-[#E01A76] ml-1">
                         <p className="text-[15px] text-gray-700 leading-relaxed font-bold">{explanation}</p>
                       </div>
                    </div>
                  </motion.div>

                  {/* STEP 2: SENTENCES */}
                  <motion.div variants={scrollVariant} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} className="flex w-full items-end gap-2 justify-end pl-12 pr-2 mt-2">
                    <div className="bg-[#8B004A] text-white rounded-[1.5rem] rounded-br-sm px-5 py-4 text-[15px] font-bold shadow-md max-w-[85%] border-b-4 border-[#600033]">
                       Give me some real-world examples.
                    </div>
                  </motion.div>

                  <motion.div variants={scrollVariant} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} className="flex w-full items-start gap-3 justify-start pr-8 pl-1">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#FFB800] to-[#E01A76] flex items-center justify-center shadow-md shrink-0 z-10 border-2 border-white mt-1">
                      <Bot size={20} className="text-[#8B004A]" strokeWidth={2.5}/>
                    </div>
                    <div className="glass-solid rounded-[2rem] rounded-tl-sm p-6 sm:p-7 w-full border-t-[3px] border-t-[#8B004A]">
                       <p className="text-[15px] text-gray-800 whitespace-pre-line leading-relaxed font-bold">{sentences}</p>
                    </div>
                  </motion.div>

                  {/* STEP 3: SYN/ANT */}
                  <motion.div variants={scrollVariant} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} className="flex w-full items-end gap-2 justify-end pl-12 pr-2 mt-2">
                    <div className="bg-[#8B004A] text-white rounded-[1.5rem] rounded-br-sm px-5 py-4 text-[15px] font-bold shadow-md max-w-[85%] border-b-4 border-[#600033]">
                       What are some similar and opposite words?
                    </div>
                  </motion.div>

                  <motion.div variants={scrollVariant} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} className="flex w-full items-start gap-3 justify-start pr-8 pl-1">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#FFB800] to-[#E01A76] flex items-center justify-center shadow-md shrink-0 z-10 border-2 border-white mt-1">
                      <Bot size={20} className="text-[#8B004A]" strokeWidth={2.5}/>
                    </div>
                    <div className="glass-solid rounded-[2rem] rounded-tl-sm p-5 w-full border-t-[3px] border-t-[#FFB800]">
                       {/* 🔥 CHANGED TO FLEX-COL HERE FOR UPER-NEECHE LAYOUT 🔥 */}
                       <div className="flex flex-col gap-3">
                          <div className="bg-emerald-50/80 border-2 border-emerald-200 rounded-[1.2rem] p-4 flex flex-col w-full">
                            <span className="text-[11px] font-black uppercase text-emerald-600 block mb-2 font-heading tracking-widest shrink-0">Similar</span>
                            <div className="flex flex-wrap gap-1.5">
                              {synonyms ? synonyms.split(',').map((w, idx) => w.trim() && (
                                <span key={idx} className="bg-emerald-200/50 text-emerald-900 text-[12px] sm:text-[13px] px-2.5 py-1 rounded-md font-bold font-body">{w.trim()}</span>
                              )) : <span className="text-emerald-900 font-bold">-</span>}
                            </div>
                          </div>
                          <div className="bg-rose-50/80 border-2 border-rose-200 rounded-[1.2rem] p-4 flex flex-col w-full">
                            <span className="text-[11px] font-black uppercase text-rose-600 block mb-2 font-heading tracking-widest shrink-0">Opposite</span>
                            <div className="flex flex-wrap gap-1.5">
                              {antonyms ? antonyms.split(',').map((w, idx) => w.trim() && (
                                <span key={idx} className="bg-rose-200/50 text-rose-900 text-[12px] sm:text-[13px] px-2.5 py-1 rounded-md font-bold font-body">{w.trim()}</span>
                              )) : <span className="text-rose-900 font-bold">-</span>}
                            </div>
                          </div>
                       </div>
                    </div>
                  </motion.div>

                  {/* STEP 4: VISUALS */}
                  <motion.div variants={scrollVariant} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} className="flex w-full items-end gap-2 justify-end pl-12 pr-2 mt-2">
                    <div className="bg-[#8B004A] text-white rounded-[1.5rem] rounded-br-sm px-5 py-4 text-[15px] font-bold shadow-md max-w-[85%] border-b-4 border-[#600033]">
                       Can you visualize this for me?
                    </div>
                  </motion.div>

                  <motion.div variants={scrollVariant} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} className="flex w-full items-start gap-3 justify-start pr-8 pl-1">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#FFB800] to-[#E01A76] flex items-center justify-center shadow-md shrink-0 z-10 border-2 border-white mt-1">
                      <Bot size={20} className="text-[#8B004A]" strokeWidth={2.5}/>
                    </div>
                    <div className="glass-solid rounded-[2rem] rounded-tl-sm p-5 w-full border-t-[3px] border-t-[#E01A76]">
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
                         handleWebImport={handleWebImport} 
                         fileInputRef={fileInputRef}
                       />
                    </div>
                  </motion.div>

                  {/* --- STEP 5: AI SUGGESTION CHIPS (WHAT NEXT) --- */}
                  <motion.div variants={scrollVariant} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} className="flex w-full items-start gap-3 justify-start pr-8 pl-1 mt-4 mb-2">
                    <div className="w-10 h-10 rounded-full bg-[#E01A76] flex items-center justify-center shadow-md shrink-0 z-10 border-2 border-white mt-1">
                      <Bot size={20} className="text-white" strokeWidth={2.5}/>
                    </div>
                    <div className="flex flex-col gap-3 w-full">
                      <div className="glass-solid text-[#8B004A] rounded-[1.5rem] rounded-tl-sm p-4 shadow-sm max-w-[85%] text-[15px] font-bold border border-white">
                        What would you like to do next?
                      </div>
                      <div className="flex flex-wrap gap-2.5">
                        <button
                          onClick={() => handleSearchWord(activeWord, true)}
                          disabled={loading}
                          className="bg-white border-2 border-gray-200 text-[#E01A76] font-heading text-[13px] font-black px-5 py-3 rounded-xl flex items-center gap-2 shadow-sm duo-btn active:border-b-0"
                        >
                          <RefreshCw size={16} strokeWidth={3} /> Re-phrase Context
                        </button>
                        <button
                          onClick={() => { setIsShareModalOpen(true); fetchUserSquads(); }}
                          className="bg-white border-2 border-gray-200 text-[#8B004A] font-heading text-[13px] font-black px-5 py-3 rounded-xl flex items-center gap-2 shadow-sm duo-btn active:border-b-0"
                        >
                          <Share2 size={16} strokeWidth={3} /> Share with Squad
                        </button>
                      </div>
                    </div>
                  </motion.div>

                  {/* --- REAL VIBRANT BOLD FOLLOW UP CHAT --- */}
                  <div className="flex flex-col gap-5 w-full mt-4">
                    <AnimatePresence>
                      {followUpChat.map((chat, idx) => (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{type:"spring", bounce:0.4}} key={idx} 
                          className={`flex w-full items-start gap-3 ${chat.role === "user" ? "justify-end pl-12 pr-2" : "justify-start pr-8 pl-1"}`}
                        >
                          {chat.role === "ai" && (
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-md shrink-0 z-10 border-2 border-gray-100 mt-1">
                              <Bot size={20} className="text-[#8B004A]" strokeWidth={2.5}/>
                            </div>
                          )}
                          <div className={`relative px-6 py-4 text-[15px] leading-relaxed max-w-[85%] shadow-md font-bold ${
                            chat.role === "user" 
                              ? "bg-[#8B004A] text-white rounded-[1.5rem] rounded-br-sm border-b-4 border-[#600033]" 
                              : "glass-solid text-gray-900 rounded-[1.5rem] rounded-tl-sm border-t-[3px] border-t-[#8B004A]"
                          }`}>
                            {chat.text}
                            {chat.role === "ai" && (
                              <button 
                                onClick={() => playPremiumAudio(chat.text, chat.audioBase64)}
                                className="mt-3 text-[#8B004A] bg-[#8B004A]/10 hover:bg-[#8B004A]/20 active:scale-90 transition-all flex items-center justify-center rounded-full w-9 h-9"
                              >
                                <Volume2 size={16} strokeWidth={3}/>
                              </button>
                            )}
                          </div>
                        </motion.div>
                      ))}

                      {isChatProcessing && (
                        <motion.div initial={{ opacity: 0, y:20 }} animate={{ opacity: 1, y:0 }} className="flex justify-start items-start gap-3 pr-8 pl-1 mb-2">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#FFB800] to-[#E01A76] flex items-center justify-center shadow-md shrink-0 z-10 border-2 border-white mt-1">
                            <Loader2 size={18} className="animate-spin text-white" strokeWidth={3}/>
                          </div>
                          <div className="glass-solid px-5 py-4 rounded-[1.5rem] rounded-tl-sm flex items-center gap-2 h-14">
                            <div className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2.5 h-2.5 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: "0.15s"}}></div>
                            <div className="w-2.5 h-2.5 bg-[#8B004A] rounded-full animate-bounce" style={{animationDelay: "0.3s"}}></div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <div ref={chatEndRef} className="h-6" />
                  </div>

                  {/* Chat Input Bar */}
                  <div className="sticky bottom-4 z-50 mt-2 px-1">
                    <div className="glass-ultra p-1.5 rounded-[2.5rem] border border-white focus-within:border-[#8B004A]/50 transition-all shadow-[0_10px_40px_rgb(139,0,74,0.15)] flex items-center gap-2 box-border w-full">
                      <input
                        value={chatInputText}
                        onChange={(e) => setChatInputText(e.target.value)}
                        onKeyDown={(e) => { if(e.key === "Enter") handleSendChatMessage(); }}
                        placeholder={`Ask about "${activeWord}"...`}
                        className="flex-1 bg-transparent border-none outline-none px-5 py-3.5 text-[16px] font-bold text-gray-900 placeholder:text-gray-500 w-full truncate font-heading"
                        disabled={isChatProcessing}
                      />
                      <button 
                        onClick={handleSendChatMessage}
                        disabled={isChatProcessing || !chatInputText.trim()}
                        className="w-14 h-14 rounded-full bg-gradient-to-r from-[#E01A76] to-[#8B004A] text-white flex items-center justify-center shadow-md disabled:opacity-50 active:scale-90 shrink-0 transition-all duo-btn border-[#600033]"
                      >
                        <Send size={20} className="ml-1" strokeWidth={2.5}/>
                      </button>
                    </div>
                  </div>

                </div>
              )}
              
              {/* --- COMMUNITY POSTS VIEW --- */}
              {resultView === "posts" && (
                <div className="w-full flex flex-col items-center">
                  {isFetchingPosts ? (
                    <div className="flex flex-col items-center justify-center py-16 glass-ultra rounded-[2rem] w-full max-w-[440px]">
                      <Loader2 className="w-12 h-12 text-[#8B004A] animate-spin mb-4" strokeWidth={3} />
                      <span className="text-[12px] font-heading text-[#8B004A] font-black uppercase tracking-widest">Searching Hub</span>
                    </div>
                  ) : relatedPosts.length > 0 ? (
                    <div className="w-full flex flex-col items-center space-y-5">
                      {relatedPosts.map((post, idx) => (
                        <div key={post._id} className="w-full max-w-[440px]">
                          <PostCard 
                            post={post} userEmail={userEmail} isPremiumUser={isPremiumUser} activeIndex={activeIndex} setActiveIndex={setActiveIndex} 
                            onRefresh={() => fetchRelatedPosts(activeWord)} API_URL={API_URL} highlightWord={activeWord} 
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 px-6 glass-ultra rounded-[2rem] w-full max-w-[440px] text-center">
                      <Globe className="w-14 h-14 text-gray-400 mb-4" strokeWidth={2} />
                      <h3 className="text-gray-900 font-black font-heading text-2xl mb-1 tracking-tight">No Posts Yet</h3>
                      <p className="text-gray-600 text-[15px] font-bold mb-8 font-body">Be the first to share this word.</p>
                      <button 
                        onClick={() => setResultView("ai")}
                        className="bg-white border border-gray-200 text-[#8B004A] px-8 py-4 rounded-xl text-sm font-black shadow-sm font-heading duo-btn active:border-b-0"
                      >
                        Back to Analysis
                      </button>
                    </div>
                  )}
                </div>
              )}

            </div>
          )}
        </div>
      </div>

      {/* --- STICKY WORD REMINDER (LATAKTI PATTI) --- */}
      <AnimatePresence>
        {showStickyHeader && activeWord && !isStickyDismissed && resultView === "ai" && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ type: "spring", bounce: 0.4, duration: 0.5 }}
            className="fixed top-[85px] left-0 right-0 px-4 w-full z-[90] flex justify-center pointer-events-none"
          >
            <div className="bg-white/95 backdrop-blur-xl border-2 border-gray-100 pl-5 pr-2 py-2 rounded-full shadow-[0_10px_30px_rgba(139,0,74,0.15)] flex items-center justify-between gap-3 pointer-events-auto max-w-max">
               <div className="flex flex-col gap-0.5 overflow-hidden pr-2">
                 <span className="font-heading font-black text-[17px] text-[#8B004A] leading-none drop-shadow-sm tracking-tight truncate">{activeWord}</span>
                 <span className="font-body font-bold text-[13px] text-gray-500 truncate max-w-[150px] sm:max-w-[250px] leading-none mt-0.5">{meaning}</span>
               </div>
               
               <div className="flex items-center gap-1.5 border-l-2 border-gray-100 pl-3">
                 <button 
                   onClick={() => playPremiumAudio(activeWord)} 
                   className="w-10 h-10 rounded-full bg-[#FFB800] text-[#8B004A] flex items-center justify-center hover:bg-[#F0AD00] transition-transform active:scale-90 shrink-0 shadow-sm"
                   title="Play Pronunciation"
                 >
                   <Volume2 size={18} strokeWidth={2.5}/>
                 </button>
                 <button 
                   onClick={() => setIsStickyDismissed(true)} 
                   className="w-8 h-8 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors active:scale-90 shrink-0"
                   title="Dismiss Reminder"
                 >
                   <X size={16} strokeWidth={3}/>
                 </button>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- SHARE MODAL --- */}
      <AnimatePresence>
        {isShareModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[#8B004A]/40 backdrop-blur-md z-[100]"
              onClick={handleCloseShareModal}
            />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 max-w-[450px] mx-auto bg-white/95 backdrop-blur-xl rounded-t-[2.5rem] z-[101] p-6 pb-8 shadow-2xl flex flex-col max-h-[85vh] border-t-2 border-[#8B004A]"
            >
              <div className="w-14 h-1.5 bg-gray-300 rounded-full mx-auto mb-6" />
              
              <div className="flex justify-between items-center mb-8">
                 <h3 className="text-2xl font-black font-heading text-[#8B004A] flex items-center gap-2">
                   <Share2 size={24} className="text-[#E01A76]" strokeWidth={2.5}/> Share to...
                 </h3>
                 <button onClick={handleCloseShareModal} className="bg-gray-100 p-2.5 rounded-xl text-gray-600 hover:bg-gray-200 active:scale-90 transition-all"><X size={20} strokeWidth={2.5}/></button>
              </div>

              <div 
                onClick={() => { if (!isGlobalSent) setIsGlobalSelected(!isGlobalSelected); }}
                className={`flex items-center justify-between p-4 rounded-2xl mb-5 transition-all cursor-pointer border-2 ${
                  isGlobalSent ? "opacity-50 bg-gray-50 border-transparent" : isGlobalSelected ? "bg-[#FFB800]/10 border-[#FFB800]/50 shadow-sm" : "bg-white border-gray-100 hover:border-gray-200"
                }`}
              >
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#FFB800] rounded-xl flex items-center justify-center text-[#8B004A] shadow-sm"><Globe size={22} strokeWidth={2.5} /></div>
                    <div>
                      <p className="font-black text-gray-900 text-[16px] font-heading">Global Hub</p>
                      <p className="text-[11px] text-[#E01A76] font-bold uppercase tracking-widest font-body mt-0.5">Public Feed</p>
                    </div>
                 </div>
                 <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isGlobalSelected || isGlobalSent ? 'bg-[#FFB800] border-[#FFB800]' : 'border-gray-200'}`}>
                   {(isGlobalSelected || isGlobalSent) && <Check size={14} className="text-[#8B004A]" strokeWidth={3}/>}
                 </div>
              </div>

              <div className="text-[11px] font-extrabold font-heading text-gray-400 uppercase tracking-widest mb-3 px-1">Your Squads</div>

              <div className="overflow-y-auto flex-1 pb-16 custom-scrollbar pr-2">
                 {isFetchingSquads ? (
                   <div className="py-8 text-center"><Loader2 className="animate-spin text-[#8B004A] w-8 h-8 mx-auto" /></div>
                 ) : userSquads.length === 0 ? (
                   <p className="text-sm font-bold font-body text-gray-500 text-center py-6">No squads found.</p>
                 ) : (
                   userSquads.map(squad => {
                     const isSent = sentSquads.has(squad._id);
                     const isSelected = selectedSquads.has(squad._id);
                     return (
                       <div 
                         key={squad._id} 
                         onClick={() => toggleSquadSelection(squad._id)}
                         className={`flex items-center justify-between p-3.5 rounded-2xl mb-2.5 transition-all cursor-pointer border-2 ${
                           isSent ? "opacity-50 bg-gray-50 border-transparent" : isSelected ? "bg-[#8B004A]/5 border-[#8B004A]/30 shadow-sm" : "bg-white border-gray-100 hover:border-gray-200"
                         }`}
                       >
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-100 text-[#8B004A] font-black font-heading text-lg rounded-xl flex items-center justify-center border border-gray-200">
                               {squad.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 text-[15px] font-heading">{squad.name}</p>
                              <p className="text-[11px] text-gray-500 font-bold font-body mt-0.5">{squad.members?.length || 0} members</p>
                            </div>
                         </div>
                         <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected || isSent ? 'bg-[#8B004A] border-[#8B004A]' : 'border-gray-200'}`}>
                           {(isSelected || isSent) && <Check size={14} className="text-white" strokeWidth={3}/>}
                         </div>
                       </div>
                     )
                   })
                 )}
              </div>

              <AnimatePresence>
                {totalSelected > 0 && (
                  <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="absolute bottom-6 left-6 right-6">
                    <button
                      onClick={handleSendMultiple}
                      disabled={isSendingMultiple}
                      className="w-full bg-[#8B004A] text-white py-4 rounded-[1.5rem] font-black text-[16px] font-heading shadow-xl flex items-center justify-center gap-2 duo-btn border-[#600033] active:border-b-0"
                    >
                      {isSendingMultiple ? <><Loader2 size={20} className="animate-spin" /> Sending...</> : <>Send ({totalSelected}) <Send size={18} strokeWidth={2.5}/></>}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
              
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </>
  );
}