import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import PostCard from "../components/PostCard"; 
import VisualAnchor from "../components/ai-wordsimg/VisualAnchor"; 
import { motion, AnimatePresence } from "framer-motion";

// 🔥 Native Speech imports (Ab sirf fallback ke liye)
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { Capacitor } from '@capacitor/core';

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
  X,
  Send,
  Users,
  Check,
  Bot
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
    "Strategy...", "Objective...", "Efficiency...", "Collaboration...", 
    "Innovation...", "Optimization...", "Productivity...", "Leadership...", 
    "Execution...", "Development..."
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

  // Audio object initialization
  useEffect(() => {
    audioRef.current = new Audio();
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  // Auto-scroll chat to bottom
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

  // 🔥 MAGIC UNLOCKER: Mobile me audio block hone se bachaega
  const unlockAudioEngine = () => {
    if (audioRef.current) {
      audioRef.current.src = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=";
      audioRef.current.play().catch(() => {});
    }
  };

  // 🔥 MASTER PREMIUM AUDIO PLAYER (Always uses API voice)
  const playPremiumAudio = async (textToSpeak, base64Audio = null) => {
    if (!textToSpeak) return;

    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    setIsPlayingAudio(true);

    try {
      let finalAudioSrc = "";

      if (base64Audio) {
        finalAudioSrc = "data:audio/mp3;base64," + base64Audio;
      } 
      else {
        // Agar base64 nahi hai toh backend API se fetch karo
        const res = await fetch(`${API_URL}/api/words/speak`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: textToSpeak })
        });
        const data = await res.json();
        
        if (data.success && data.audioBase64) {
          finalAudioSrc = "data:audio/mp3;base64," + data.audioBase64;
        } else {
          throw new Error("Failed to fetch premium voice from backend");
        }
      }

      audioRef.current.src = finalAudioSrc;
      
      audioRef.current.onended = () => setIsPlayingAudio(false);
      audioRef.current.onerror = () => {
        setIsPlayingAudio(false);
        fallbackSpeak(textToSpeak); // Corrupt file aane par fallback
      };

      await audioRef.current.play();

    } catch (error) {
      console.error("Premium Audio Error, falling back to basic:", error);
      setIsPlayingAudio(false);
      fallbackSpeak(textToSpeak);
    }
  };

  // 🚨 LAST RESORT FALLBACK (Robotic Voice - Sirf Internet fail hone pe)
  const fallbackSpeak = async (text) => {
    if (!text) return;
    try {
      if (isApp) {
        await TextToSpeech.speak({
          text: text,
          lang: 'en-US', // Native english
          rate: 0.9,
          pitch: 1.2,
          volume: 1.0,
        });
      } else {
        if (window.speechSynthesis && window.speechSynthesis.cancel) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = "en-US";
          utterance.pitch = 1.2; 
          utterance.rate = 0.9;
          window.speechSynthesis.speak(utterance);
        }
      }
    } catch (err) {
      console.error("TTS Fallback Error:", err);
    }
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
          if (scoreB !== scoreA) {
            return scoreB - scoreA; 
          }
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        });

        setRelatedPosts(rankedPosts);
        const existingPost = rankedPosts.find(p => p.userEmail === userEmail && p.word?.toLowerCase() === query);
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
    } catch (err) {
      console.error("History fetch error:", err);
    }
  };

  useEffect(() => {
    if (userEmail) {
      fetchHistoryFromDB(true);
    }
  }, [userEmail]);

  const fetchUserSquads = async () => {
    if (!userEmail || userEmail === "guest_user@gmail.com") return;
    setIsFetchingSquads(true);
    try {
      const res = await fetch(`${API_URL}/api/squads/user/${userEmail}`);
      const data = await res.json();
      if (data.success) {
        setUserSquads(data.squads);
      }
    } catch (err) {
      console.error("Failed to fetch squads:", err);
    } finally {
      setIsFetchingSquads(false);
    }
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

    const vocabData = [{
      word: activeWordRef.current, meaning: meaning, sentence: sentences || "",
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
        const newPostId = postResponseData.post?._id || postResponseData.data?._id || postResponseData._id;
        setSharedPostId(newPostId);
        fetchRelatedPosts(activeWordRef.current);
        return newPostId;
      }
    } catch (e) {
      console.error("Error creating base post:", e);
    }
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

    const vocabData = [{
      word: activeWordRef.current,
      meaning: updatedMeaning || meaning,
      sentence: updatedSentences || sentences || "",
      media: currentImages.map(url => ({ type: 'image', url })) 
    }];
    data.append("vocabData", JSON.stringify(vocabData));

    const mediaMetadata = currentImages.map((url) => ({
      type: 'image', url: url, value: url, mode: 'url', vocabIndex: 0
    }));
    data.append("mediaMetadata", JSON.stringify(mediaMetadata));

    try {
      const res = await fetch(`${API_URL}/api/english-posts/update/${sharedPostId}`, { method: "PUT", body: data });
      if (res.ok) {
        if (isManualClick) toast.success("Community Post Updated! 🔄✨");
        fetchRelatedPosts(activeWordRef.current); 
      }
    } catch (e) {
      console.error("Failed to auto-update post", e);
    }
  };

  const toggleSquadSelection = (squadId) => {
    if (sentSquads.has(squadId)) return; 
    
    setSelectedSquads(prev => {
      const newSet = new Set(prev);
      if (newSet.has(squadId)) newSet.delete(squadId);
      else newSet.add(squadId);
      return newSet;
    });
  };

  const handleSendMultiple = async () => {
    if (totalSelected === 0) return;
    setIsSendingMultiple(true);
    
    try {
      const postId = await ensurePostExists();
      if (!postId) {
        toast.error("Failed to prepare flashcard for sharing.");
        setIsSendingMultiple(false);
        return;
      }

      if (isGlobalSelected) {
        setIsGlobalSent(true);
        setIsGlobalSelected(false);
      }

      if (selectedSquads.size > 0) {
        const sendPromises = Array.from(selectedSquads).map(squadId => 
          fetch(`${API_URL}/api/squads/${squadId}/message`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              senderEmail: userEmail,
              type: "post",
              postId: postId
            })
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
      
    } catch (err) {
      toast.error("Network error while sending!");
    } finally {
      setIsSendingMultiple(false);
    }
  };

  const handleGenerateImage = async (actionType = "normal", wordToGenerate, customPrompt = "", skipPostUpdate = false) => {
    if (!wordToGenerate || !userEmail) return;

    if (activeWordRef.current !== wordToGenerate && actionType === "normal") return;

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
        if (activeWordRef.current === wordToGenerate) {
            toast.error("Visual generation failed behind the scenes");
        }
      }
    } catch (err) {
        console.error(err);
    } finally {
      if (activeWordRef.current === wordToGenerate) {
        setIsImageLoading(false);
        setImageAction("");
      }
    }
  };

  const handleCustomImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !userEmail || !activeWordRef.current) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append("image", file);
    formData.append("word", activeWordRef.current);
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
            body: JSON.stringify({ word: activeWordRef.current, userId: userEmail, imageUrls: updatedGallery })
          });
        } catch(err) {}
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

  const handleWebImport = async (selectedImageUrl) => {
    if (!selectedImageUrl) return;
    setIsImageLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/image/import-web`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          word: activeWordRef.current, 
          userId: userEmail, 
          imageUrl: selectedImageUrl 
        }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.imageUrl) {
        toast.success("Image Saved to Collection! 🌍✨");
        const updatedGallery = [...imageGallery, data.imageUrl];
        setImageGallery(updatedGallery);
        setIsImageExpanded(true);
        fetchHistoryFromDB();
        
        if (sharedPostId) handleUpdateCommunityPost(meaning, sentences, updatedGallery);
        
        try {
          await fetch(`${API_URL}/api/words/update-images`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ word: activeWordRef.current, userId: userEmail, imageUrls: updatedGallery })
          });
        } catch(err) {}
        
      } else {
        toast.error(data.error || "Web import fail ho gaya.");
      }
    } catch (err) {
      toast.error("Network error during web import.");
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
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: activeWordRef.current, userId: userEmail, imageUrls: updatedGallery })
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

    setSentSquads(new Set());
    setSelectedSquads(new Set());
    setIsGlobalSelected(false);
    setIsGlobalSent(false);

    setImageGallery([]);
    setIsImageExpanded(false);
    
    // 🔥 CLEAR FOLLOW-UP CHAT ON NEW SEARCH
    setFollowUpChat([]);
    setChatInputText("");

    try {
      const response = await fetch(`${API_URL}/api/words/define`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: searchTarget, userId: userEmail, getAlternative: isAlternative }),
      });
      const resData = await response.json();

      if (response.ok && resData.success) {
        const fetchedWord = resData.data.word;
        setActiveWord(fetchedWord);
        activeWordRef.current = fetchedWord; 

        setPartOfSpeech(resData.data.partOfSpeech);
        setMeaning(resData.data.meaning);
        setExplanation(resData.data.explanation);
        setSynonyms(resData.data.synonyms);
        setAntonyms(resData.data.antonyms);
        setSentences(resData.data.sentences);

        if (!isSilent) {
          if (isAlternative) toast.success("New context generated! 🔄");
          else toast.success("Word analyzed! 🚀");
          // Ab premium voice use hogi!
          playPremiumAudio(fetchedWord);
        }
        
        setWord("");
        fetchHistoryFromDB();
        fetchRelatedPosts(fetchedWord); 

        let newGallery = [];
        if (Array.isArray(resData.data.imageUrls) && resData.data.imageUrls.length > 0) {
          newGallery = [...resData.data.imageUrls];
        } else if (resData.data.imageUrl && resData.data.imageUrl.trim() !== "") {
          newGallery = [resData.data.imageUrl];
        }

        setImageGallery(newGallery);
        setIsImageExpanded(false); 

        if (isAlternative && sharedPostId) handleUpdateCommunityPost(resData.data.meaning, resData.data.sentences, newGallery);
        
        if (newGallery.length === 0) {
          handleGenerateImage("normal", fetchedWord, "", true);
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

  // 🔥 HISTORY SE LOAD KARNE PAR PURANI CHAT BHI LOAD HOGI
  const loadFromHistoryCard = (item, isSilent = false) => {
    setSharedPostId(null);
    
    setActiveWord(item.word);
    activeWordRef.current = item.word; 
    
    setPartOfSpeech(item.partOfSpeech || "Vocabulary");
    setMeaning(item.meaning);
    setExplanation(item.explanation);
    setSynonyms(item.synonyms);
    setAntonyms(item.antonyms);
    setSentences(item.sentences);
    setShowHistory(false);
    setResultView("ai"); 
    
    setSentSquads(new Set());
    setSelectedSquads(new Set());
    setIsGlobalSelected(false);
    setIsGlobalSent(false);
    
    // 🔥 LOAD FOLLOW-UP CHAT DIRECTLY FROM DB
    setFollowUpChat(item.chatHistory || []);
    setChatInputText("");

    if (!isSilent) {
      setContextBadge("Historical Target");
      // Ab premium voice use hogi!
      playPremiumAudio(item.word);
    }
    fetchRelatedPosts(item.word);
    
    let historyImages = [];
    if (Array.isArray(item.imageUrls) && item.imageUrls.length > 0) {
        historyImages = [...item.imageUrls];
    } else if (item.imageUrl && item.imageUrl.trim() !== "") {
        historyImages = [item.imageUrl];
    }

    setImageGallery(historyImages);
    setIsImageExpanded(false);

    if (historyImages.length === 0) {
        handleGenerateImage("normal", item.word, "", true);
    }
  };

  // 🔥 FOLLOW-UP CHAT SEND HANDLER
  const handleSendChatMessage = async () => {
    unlockAudioEngine(); // Tap karte hi audio unlock ho jayega
    
    const userMsg = chatInputText.trim();
    if (!userMsg || !activeWord) return;

    setChatInputText("");
    const newHistory = [...followUpChat, { role: "user", text: userMsg }];
    setFollowUpChat(newHistory);
    setIsChatProcessing(true);

    try {
      const response = await fetch(`${API_URL}/api/words/followup-chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userId: userEmail,
          word: activeWord,
          message: userMsg, 
          history: newHistory 
        })
      });

      const data = await response.json();
      
      if (response.ok && data.reply) {
        setFollowUpChat(prev => [...prev, { role: "ai", text: data.reply, audioBase64: data.audioBase64 }]);
        
        // Auto-play the premium voice returned from backend!
        playPremiumAudio(data.reply, data.audioBase64);

      } else {
        toast.error("Tutor failed to respond.");
      }
    } catch (error) {
      console.error("Chat Error:", error);
      toast.error("Network connection error!");
    } finally {
      setIsChatProcessing(false);
    }
  };

  const toggleFlip = (id) => setFlippedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  const totalUniqueWords = new Set(history.map(item => item.word.toLowerCase())).size;

  const handleCloseShareModal = () => {
    setIsShareModalOpen(false);
    setSelectedSquads(new Set()); 
    setIsGlobalSelected(false);
  };

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;600;700;800&family=Kalam:wght@400;700&display=swap');
          
          :root {
            --font-body: 'Nunito', sans-serif;
            --font-display: 'Fredoka', sans-serif;
            --font-hand: 'Kalam', cursive;
          }

          .font-body { font-family: var(--font-body) !important; }
          .font-playful { font-family: var(--font-display) !important; }
          .font-hand { font-family: var(--font-hand) !important; }

          .btn-3d {
            transition: transform 0.1s cubic-bezier(0.4, 0, 0.2, 1), border-width 0.1s;
            border-bottom-width: 4px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          .btn-3d:active:not(:disabled) {
            transform: translateY(4px);
            border-bottom-width: 0px !important;
            margin-top: 4px; 
          }
          
          .btn-3d-primary {
            background-color: #E01A76;
            border-color: #8B004A;
            color: white;
          }
          .btn-3d-primary:hover { background-color: #f02585; }

          .btn-3d-secondary {
            background-color: white;
            border-color: #cbd5e1; 
            color: #8B004A;
          }
          .btn-3d-secondary:hover { background-color: #f8fafc; }

          .bg-dots {
            background-image: radial-gradient(#E01A76 1px, transparent 1px);
            background-size: 24px 24px;
            background-position: 0 0, 12px 12px;
            background-color: white;
            opacity: 0.98;
          }

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

      <div className="min-h-screen bg-[#F2EFE7] text-gray-900 flex flex-col items-center p-4 py-8 font-body transition-colors duration-500 pb-28 overflow-x-hidden w-full relative selection:bg-[#FFB800] selection:text-[#8B004A]">
        
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#E01A76]/10 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-[#FFB800]/15 rounded-full blur-[80px] pointer-events-none"></div>

        <Toaster 
          position="top-center" 
          toastOptions={{
            style: {
              background: '#8B004A', color: '#F2EFE7', border: '2px solid #E01A76',
              fontFamily: 'Fredoka, sans-serif', fontWeight: '600', borderRadius: '20px',
              padding: '14px 24px', boxShadow: '0 10px 25px -5px rgba(139, 0, 74, 0.3)',
            }
          }}
        />

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

          {activeWord && !loading && (
            <div className="w-full flex flex-col items-center relative z-10">

              {resultView === "ai" && (
                <div className="w-full max-w-[440px] flex flex-col mx-auto relative z-10 pb-4">
                  
                  {/* --- 1. INITIAL USER PROMPT --- */}
                  <div className="flex justify-end pl-12 pr-2 w-full animate-stagger-1 mb-2">
                    <div className="bg-[#8B004A] text-white rounded-[1.5rem] rounded-tr-sm px-5 py-3.5 text-[14px] font-body font-bold leading-relaxed inline-block shadow-md border-b-4 border-[#600033] break-words">
                      Explain the exact Hindi meaning, context, and examples for <span className="text-[#FFB800] uppercase font-playful tracking-wider mx-1 break-all bg-black/20 px-2 py-0.5 rounded-lg">"{activeWord}"</span>.
                    </div>
                  </div>

                  {/* --- 2. MAIN AI WORD EXPLAINER BUBBLE --- */}
                  <div className="flex justify-start pr-6 pl-1 w-full animate-stagger-2 mb-4 mt-1">
                    <div className="bg-dots bg-white border-4 border-gray-100 rounded-[2rem] rounded-tl-sm p-6 sm:p-8 shadow-2xl relative overflow-hidden w-full">
                      
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
                        {/* 🔥 MAIN WORD PLAY BUTTON USES PREMIUM AUDIO */}
                        <button
                          onClick={() => playPremiumAudio(activeWord)}
                          className="bg-[#FFB800] hover:bg-[#f0ad00] p-4 rounded-2xl text-[#4A0027] transition-transform shadow-md active:scale-90 flex-shrink-0 border-b-4 border-[#d99d00] active:border-b-0 active:mt-1"
                          title="Listen to pronunciation"
                        >
                          <Volume2 size={26} strokeWidth={2.5} />
                        </button>
                      </div>

                      <div className="space-y-6 w-full animate-stagger-3">
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

                        <div className="pt-2 w-full">
                          <span className="text-gray-400 font-playful text-[11px] uppercase font-bold tracking-widest mb-2 flex items-center gap-1.5 ml-1">
                            <Sparkles size={16} className="text-[#E01A76]" /> Real World Usage
                          </span>
                          <div className="bg-gray-50 rounded-3xl p-5 border-2 border-gray-100 text-gray-700 whitespace-pre-line font-body font-bold text-[15px] leading-relaxed break-words w-full shadow-inner">
                            {sentences}
                          </div>
                        </div>

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
                             handleWebImport={handleWebImport} 
                             fileInputRef={fileInputRef}
                           />
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row justify-between gap-3 border-t-2 border-gray-100 mt-8 pt-6 w-full animate-stagger-4">
                        <button
                          onClick={() => handleSearchWord(activeWord, true)}
                          disabled={loading}
                          className="font-playful text-[13px] bg-white text-[#8B004A] flex items-center justify-center gap-2 font-bold px-5 h-12 rounded-2xl flex-1 btn-3d btn-3d-secondary border-2 border-gray-200"
                        >
                          <RefreshCw size={16} strokeWidth={3} /> Alt Context
                        </button>

                        <button
                          onClick={() => {
                            setIsShareModalOpen(true);
                            fetchUserSquads();
                          }}
                          className={`font-playful text-[13px] flex items-center justify-center gap-2 font-bold px-5 h-12 rounded-2xl flex-1 btn-3d btn-3d-primary`}
                        >
                          <Share2 size={16} strokeWidth={3} />
                          Share / Send
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* --- 3. FOLLOW-UP CHAT MAP --- */}
                  <div className="flex flex-col gap-3 w-full pt-4 relative z-0">
                    <AnimatePresence>
                      {followUpChat.map((chat, idx) => (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          key={idx} 
                          className={`flex items-end gap-2 w-full ${chat.role === "user" ? "justify-end pl-12 pr-2" : "justify-start pr-12 pl-1"}`}
                        >
                          
                          {chat.role === "ai" && (
                            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#FFB800] to-[#f0ad00] flex items-center justify-center text-[#4A0027] flex-shrink-0 shadow-sm border border-white z-10 mb-1">
                              <Bot size={14} strokeWidth={2.5} />
                            </div>
                          )}

                          <div className={`p-3.5 px-4 text-[14px] font-bold leading-relaxed shadow-sm relative group max-w-[90%] ${
                            chat.role === "user" 
                              ? "bg-gradient-to-br from-[#8B004A] to-[#E01A76] text-white rounded-3xl rounded-br-sm" 
                              : "bg-white text-gray-800 border-2 border-gray-100 rounded-3xl rounded-bl-sm pr-12"
                          }`}>
                            {chat.text}

                            {/* 🔥 CHAT REPLAY USES PREMIUM AUDIO */}
                            {chat.role === "ai" && (
                              <button 
                                onClick={() => {
                                  playPremiumAudio(chat.text, chat.audioBase64);
                                }}
                                className="absolute bottom-2 right-2 p-1.5 bg-gray-50 text-gray-400 hover:text-[#8B004A] hover:bg-[#8B004A]/10 rounded-full transition-all active:scale-90"
                                title="Play Audio"
                              >
                                <Volume2 size={14} strokeWidth={2.5} />
                              </button>
                            )}
                          </div>
                        </motion.div>
                      ))}

                      {/* TYPING INDICATOR */}
                      {isChatProcessing && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start items-end gap-2 pr-12 pl-1 mb-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#FFB800] to-[#f0ad00] flex items-center justify-center text-[#4A0027] flex-shrink-0 shadow-sm border border-white mb-1">
                            <Loader2 size={12} className="animate-spin" strokeWidth={3} />
                          </div>
                          <div className="bg-white px-4 py-3 rounded-3xl rounded-bl-sm border-2 border-gray-100 shadow-sm flex items-center gap-1.5 h-[38px]">
                            <div className="w-1.5 h-1.5 bg-[#E01A76] rounded-full animate-bounce"></div>
                            <div className="w-1.5 h-1.5 bg-[#8B004A] rounded-full animate-bounce" style={{animationDelay: "0.15s"}}></div>
                            <div className="w-1.5 h-1.5 bg-[#FFB800] rounded-full animate-bounce" style={{animationDelay: "0.3s"}}></div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    {/* SCROLL TARGET */}
                    <div ref={chatEndRef} className="h-2" />
                  </div>

                  {/* --- 4. CHAT PATTI (INPUT BAR) --- */}
                  <div className="sticky bottom-4 z-50 px-2 mt-4">
                    <div className="bg-white p-1.5 rounded-[2rem] border-[3px] border-gray-100 focus-within:border-[#E01A76]/40 focus-within:shadow-xl transition-all shadow-lg flex items-end gap-2">
                      <textarea
                        value={chatInputText}
                        onChange={(e) => setChatInputText(e.target.value)}
                        onKeyDown={(e) => {
                          if(e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendChatMessage();
                          }
                        }}
                        placeholder={`Ask about "${activeWord}"...`}
                        className="flex-1 max-h-24 bg-transparent outline-none resize-none py-3 px-4 text-[14px] font-bold text-gray-800 placeholder:text-gray-400 no-scrollbar font-body"
                        rows={Math.min(3, chatInputText.split('\n').length)}
                        disabled={isChatProcessing}
                      />
                      <button 
                        onClick={handleSendChatMessage}
                        disabled={isChatProcessing || !chatInputText.trim()}
                        className="p-3.5 bg-[#8B004A] text-white rounded-full transition-transform active:scale-90 hover:bg-[#E01A76] shadow-md shrink-0 mb-[2px] mr-[2px] disabled:opacity-50 disabled:active:scale-100"
                      >
                        <Send size={18} strokeWidth={2.5} className="ml-0.5" />
                      </button>
                    </div>
                  </div>

                </div>
              )}
              
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

      <AnimatePresence>
        {isShareModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
              onClick={handleCloseShareModal}
            />
            
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 max-w-[450px] mx-auto bg-white rounded-t-[2.5rem] z-[101] p-6 pb-10 shadow-2xl flex flex-col max-h-[85vh] border-t-4 border-[#FFB800]"
            >
              <div className="w-full flex justify-center mb-4">
                 <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
              </div>
              <div className="flex justify-between items-center mb-5">
                 <h3 className="font-playful text-xl font-bold text-[#8B004A] flex items-center gap-2">
                   <Share2 size={20} className="text-[#E01A76]" /> Share to...
                 </h3>
                 <button onClick={handleCloseShareModal} className="p-2 bg-gray-100 hover:bg-gray-200 transition-colors rounded-full text-gray-600 active:scale-90">
                   <X size={20}/>
                 </button>
              </div>

              <div 
                onClick={() => {
                  if (!isGlobalSent) setIsGlobalSelected(!isGlobalSelected);
                }}
                className={`flex items-center justify-between p-3.5 rounded-[1.2rem] mb-4 transition-all cursor-pointer border-2 ${
                  isGlobalSent 
                    ? "opacity-60 bg-gray-50 border-transparent cursor-default" 
                    : isGlobalSelected 
                      ? "bg-[#FFB800]/10 border-[#FFB800]/40 shadow-sm" 
                      : "bg-gradient-to-r from-[#FFB800]/10 to-[#FFB800]/5 border-[#FFB800]/30 hover:shadow-md"
                }`}
              >
                 <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-gradient-to-tr from-[#FFB800] to-[#f0ad00] rounded-full flex items-center justify-center text-[#4A0027] shadow-sm">
                       <Globe size={20} strokeWidth={2.5} />
                    </div>
                    <div>
                      <p className="font-playful font-bold text-gray-900 text-[14px]">Global Hub</p>
                      <p className="text-[10px] text-[#E01A76] uppercase tracking-widest font-bold">Public Feed</p>
                    </div>
                 </div>
                 
                 <div className="flex items-center justify-center mr-2">
                   {isGlobalSent ? (
                     <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Shared</span>
                   ) : (
                     <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all border-2 ${
                       isGlobalSelected ? "bg-[#FFB800] border-[#FFB800]" : "bg-white border-gray-300"
                     }`}>
                       {isGlobalSelected && <Check size={14} className="text-[#4A0027]" strokeWidth={3} />}
                     </div>
                   )}
                 </div>
              </div>

              <div className="flex items-center gap-3 my-2 opacity-50">
                 <div className="h-px bg-gray-300 flex-1"></div>
                 <span className="font-playful text-[10px] font-bold uppercase tracking-widest text-gray-400">YOUR SQUADS</span>
                 <div className="h-px bg-gray-300 flex-1"></div>
              </div>

              <div className="overflow-y-auto flex-1 pr-1 custom-scrollbar mt-2 relative">
                 {isFetchingSquads ? (
                   <div className="flex flex-col items-center justify-center py-8">
                     <Loader2 className="animate-spin text-[#E01A76] w-8 h-8 mb-2" />
                     <span className="font-playful text-[10px] text-gray-400 font-bold uppercase tracking-widest">Loading Squads...</span>
                   </div>
                 ) : userSquads.length === 0 ? (
                   <div className="flex flex-col items-center text-center py-6 px-4">
                     <Users size={32} className="text-gray-300 mb-2" />
                     <p className="text-sm font-bold text-gray-500 font-body">No squads found.</p>
                     <p className="text-[11px] text-gray-400 mt-1">Create a squad in Community tab to share privately!</p>
                   </div>
                 ) : (
                   <div className="pb-16">
                     {userSquads.map(squad => {
                       const isSent = sentSquads.has(squad._id);
                       const isSelected = selectedSquads.has(squad._id);
                       
                       return (
                         <div 
                           key={squad._id} 
                           onClick={() => toggleSquadSelection(squad._id)}
                           className={`flex items-center justify-between p-2.5 rounded-2xl mb-1.5 transition-all cursor-pointer border-2 ${
                             isSent 
                               ? "opacity-60 bg-gray-50 border-transparent cursor-default" 
                               : isSelected 
                                 ? "bg-[#E01A76]/5 border-[#E01A76]/30 shadow-sm" 
                                 : "hover:bg-gray-50 border-transparent hover:border-gray-100"
                           }`}
                         >
                           <div className="flex items-center gap-3">
                              <div className="w-11 h-11 bg-gradient-to-tr from-[#8B004A]/10 to-[#E01A76]/5 text-[#8B004A] font-playful font-black text-xl rounded-full flex items-center justify-center border border-[#8B004A]/10">
                                 {squad.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-bold text-gray-900 text-[14px] font-body">{squad.name}</p>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{squad.members?.length || 0} Members</p>
                              </div>
                           </div>
                           
                           <div className="flex items-center justify-center mr-2">
                             {isSent ? (
                               <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Sent</span>
                             ) : (
                               <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all border-2 ${
                                 isSelected ? "bg-[#E01A76] border-[#E01A76]" : "bg-white border-gray-300"
                               }`}>
                                 {isSelected && <Check size={14} className="text-white" strokeWidth={3} />}
                               </div>
                             )}
                           </div>
                         </div>
                       )
                     })}
                   </div>
                 )}
              </div>

              <AnimatePresence>
                {totalSelected > 0 && (
                  <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 50, opacity: 0 }}
                    className="absolute bottom-6 left-6 right-6"
                  >
                    <button
                      onClick={handleSendMultiple}
                      disabled={isSendingMultiple}
                      className="w-full bg-[#8B004A] text-white py-4 rounded-[1.2rem] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                    >
                      {isSendingMultiple ? (
                        <><Loader2 size={18} className="animate-spin" /> Sending...</>
                      ) : (
                        <>Send Selected ({totalSelected}) <Send size={16} /></>
                      )}
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