import React, { useState, useEffect, useRef } from "react";
import toast, { Toaster } from "react-hot-toast";
import { 
  Search, 
  History, 
  Volume2, 
  RefreshCw, 
  Sparkles, 
  Image as ImageIcon, 
  Upload, 
  ChevronDown 
} from "lucide-react";

export default function VocabPage() {
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

  // --- IMAGE STATES ---
  const [imageSrc, setImageSrc] = useState(null);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [imageAction, setImageAction] = useState(""); 
  const [isImageExpanded, setIsImageExpanded] = useState(false);

  // Custom Image Upload Ke Liye
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const [userEmail, setUserEmail] = useState("");

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

  const fetchHistoryFromDB = async () => {
    if (!userEmail) return;
    try {
      const response = await fetch(`${API_URL}/api/words/history/${encodeURIComponent(userEmail)}`);
      const resData = await response.json();
      if (response.ok && resData.success) {
        setHistory(resData.data);
      }
    } catch (err) {
      console.error("History fetch error:", err);
    }
  };

  useEffect(() => {
    if (userEmail) {
      fetchHistoryFromDB();
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

  const handleSearchWord = async (wordToSearch = word, isAlternative = false) => {
    const searchTarget = wordToSearch ? wordToSearch.trim() : "";
    if (!searchTarget) return toast.error("Please enter a word first ✍️");
    if (!userEmail || userEmail === "guest_user@gmail.com") return toast.error("Please login first! 🚫");

    setLoading(true);
    setShowHistory(false);

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

        if (isAlternative) toast.success("New context generated! 🔄");
        else toast.success("Word analyzed 🚀");

        handlePronounce(resData.data.word);
        setWord("");
        fetchHistoryFromDB(); 

        if (resData.data.imageUrl) {
            setImageSrc(resData.data.imageUrl);
            setIsImageExpanded(false); 
        } else {
            handleGenerateImage("normal", resData.data.word);
        }

      } else {
        toast.error(resData.message || "Server did not return data!");
      }
    } catch (err) {
      toast.error("Failed to connect to backend!");
    } finally {
      setLoading(false);
    }
  };

  const loadFromHistoryCard = (item) => {
    setActiveWord(item.word);
    setPartOfSpeech(item.partOfSpeech || "Vocabulary");
    setMeaning(item.meaning);
    setExplanation(item.explanation);
    setSynonyms(item.synonyms);
    setAntonyms(item.antonyms);
    setSentences(item.sentences);
    setShowHistory(false);
    handlePronounce(item.word);
    
    if (item.imageUrl) {
        setImageSrc(item.imageUrl);
        setIsImageExpanded(false);
    } else {
        handleGenerateImage("normal", item.word);
    }
  };

  const totalUniqueWords = new Set(history.map(item => item.word.toLowerCase())).size;

  return (
    // Background matches the reference image deep navy
    <div className="min-h-screen bg-[#0b101a] text-white flex flex-col items-center p-4 py-8 font-sans">
      <Toaster 
        position="top-center" 
        toastOptions={{
          style: {
            background: '#121c2d',
            color: '#fff',
            border: '1px solid #1e293b'
          }
        }}
      />

      {/* TOP STATUS BAR - Styled like progress card */}
      <div className="w-full max-w-2xl bg-[#121c2d] rounded-2xl p-4 mb-6 flex items-center justify-between border border-blue-900/50 shadow-lg">
        <div className="flex items-center space-x-4">
          <div className="bg-blue-900/50 p-2.5 rounded-full text-blue-400">
            <History size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">Dameeto Profile</h3>
            <p className="text-gray-400 text-xs truncate max-w-[150px] sm:max-w-xs">
              {userEmail === "guest_user@gmail.com" ? "Guest Mode" : userEmail}
            </p>
          </div>
        </div>
        <div className="flex gap-4 text-right">
          <div>
            <span className="text-[10px] text-gray-500 font-bold uppercase block">Queries</span>
            <span className="text-sm font-bold text-white">{history.length}</span>
          </div>
          <div className="border-l border-gray-700 pl-4">
            <span className="text-[10px] text-gray-500 font-bold uppercase block">Unique</span>
            <span className="text-sm font-bold text-[#41ffd1]">{totalUniqueWords}</span>
          </div>
        </div>
      </div>

      <div className="w-full max-w-2xl w-full">
        {/* BRANDING HEADER */}
        <div className="px-2 mb-6 flex justify-between items-end">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-yellow-500 text-[10px] border border-yellow-500 px-1.5 py-0.5 rounded font-bold tracking-wider">
                PREMIUM NODE
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-wide">Vocab Mastery</h1>
            <p className="text-gray-400 text-xs mt-1">AI-Driven Structural Lexicon</p>
          </div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors bg-[#121c2d] px-3 py-1.5 rounded-lg border border-gray-800"
          >
            {showHistory ? "Close Stack" : "View Stack"}
            <ChevronDown size={14} className={`transform transition-transform ${showHistory ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* HISTORY DROPDOWN PANEL */}
        {showHistory && (
          <div className="bg-[#121c2d] border border-blue-900/50 rounded-2xl p-4 mb-6 shadow-xl animate-fade-in">
            <h4 className="text-xs font-semibold text-gray-400 uppercase mb-3">Your Word Arsenal</h4>
            {history.length === 0 ? (
              <p className="text-center text-sm text-gray-500 py-4">No words discovered yet.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {history.map((item) => (
                  <button
                    key={item._id}
                    onClick={() => loadFromHistoryCard(item)}
                    className="bg-[#0b101a] border border-gray-800 hover:border-[#41ffd1]/50 rounded-xl p-3 text-left transition-all group"
                  >
                    <div className="text-white text-sm font-bold truncate group-hover:text-[#41ffd1]">
                      {item.word} {item.imageUrl && "🖼️"}
                    </div>
                    <div className="text-[10px] text-gray-500 truncate mt-1">
                      {item.meaning}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SEARCH BAR - Sleek & Modern */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Enter a word to analyze..."
              value={word}
              onChange={(e) => setWord(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearchWord()}
              className="w-full bg-[#121c2d] border border-gray-800 rounded-2xl pl-12 pr-4 py-4 outline-none text-white font-medium placeholder-gray-500 focus:border-[#41ffd1]/50 transition-all text-sm"
            />
          </div>
          <button
            onClick={() => handleSearchWord()}
            disabled={loading}
            className="bg-[#41ffd1] hover:bg-[#34e5b9] text-black px-8 py-4 rounded-2xl text-sm font-bold uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(65,255,209,0.2)] disabled:opacity-70 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {loading ? "Analyzing..." : "Analyze"}
          </button>
        </div>

        {/* RESULT CARD - Chat/Content Hybrid */}
        {activeWord && (
          <div className="space-y-4 animate-fade-in">
            {/* User Query Bubble */}
            <div className="flex justify-end pr-2">
              <div className="bg-[#1a2538] border border-gray-700 text-gray-200 rounded-2xl rounded-tr-sm px-4 py-3 text-xs leading-relaxed max-w-[85%] shadow-md">
                Explain the exact Hindi meaning, context, and examples for <span className="font-bold text-[#41ffd1] uppercase">{activeWord}</span>.
              </div>
            </div>

            {/* AI Response Card */}
            <div className="bg-[#121c2d] border border-blue-900/40 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
              {/* Decorative top border glow */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-[#41ffd1] to-blue-600 opacity-50"></div>

              {/* Word Header */}
              <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl sm:text-3xl font-bold text-white capitalize">{activeWord}</h2>
                    <span className="bg-blue-900/40 border border-blue-800 text-blue-300 text-[10px] px-2 py-1 rounded-md font-semibold uppercase tracking-wider">
                      {partOfSpeech}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handlePronounce(activeWord)}
                  className="bg-white/5 hover:bg-white/10 p-2.5 rounded-xl text-gray-300 transition-all border border-gray-700"
                  title="Listen to pronunciation"
                >
                  <Volume2 size={18} />
                </button>
              </div>

              {/* Content Grid */}
              <div className="space-y-5 text-sm">
                {/* Meaning & Explanation */}
                <div className="space-y-3">
                  <div className="bg-[#0b101a] rounded-xl p-4 border border-gray-800">
                    <span className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-1 block">Meaning</span>
                    <p className="text-[#41ffd1] font-semibold text-lg">{meaning}</p>
                  </div>
                  
                  <div className="pl-4 border-l-2 border-gray-700">
                    <p className="text-gray-300 leading-relaxed text-sm italic">{explanation}</p>
                  </div>
                </div>

                {/* Examples */}
                <div>
                  <span className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-2 block flex items-center gap-1.5">
                    <Sparkles size={14} className="text-yellow-500" /> Examples
                  </span>
                  <div className="bg-[#1a2538] rounded-xl p-4 border border-gray-800 text-gray-200 whitespace-pre-line font-mono text-xs leading-loose">
                    {sentences}
                  </div>
                </div>

                {/* Synonyms & Antonyms */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="bg-[#0b101a] border border-gray-800 rounded-xl p-3.5">
                    <span className="text-gray-500 font-bold text-[10px] uppercase block mb-1">Similar Words</span>
                    <span className="text-gray-200 font-medium">{synonyms || "N/A"}</span>
                  </div>
                  <div className="bg-[#0b101a] border border-gray-800 rounded-xl p-3.5">
                    <span className="text-gray-500 font-bold text-[10px] uppercase block mb-1">Opposite Words</span>
                    <span className="text-gray-200 font-medium">{antonyms || "N/A"}</span>
                  </div>
                </div>

                {/* VISUAL EXPRESSION */}
                <div className="pt-6 mt-4 border-t border-gray-800">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-400 text-xs uppercase font-bold tracking-wider flex items-center gap-1.5">
                      <ImageIcon size={14} className="text-fuchsia-400" /> Visual Context
                    </span>
                  </div>
                  
                  <div className={`w-full rounded-2xl bg-[#0b101a] border border-gray-800 flex flex-col items-center justify-center overflow-hidden relative transition-all duration-500 ${!isImageExpanded ? 'py-10' : ''}`}>
                    
                    {(isImageLoading || isUploading) && (
                      <div className="flex flex-col items-center justify-center gap-3 absolute inset-0 bg-[#0b101a]/80 backdrop-blur-sm z-10 min-h-[150px]">
                        <div className="w-6 h-6 border-2 border-[#41ffd1] border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-gray-400 text-[10px] uppercase tracking-widest animate-pulse">
                          {isUploading ? 'Uploading Image...' : 'Rendering Visual...'}
                        </p>
                      </div>
                    )}

                    {/* Step 1: Image Ready but hidden */}
                    {imageSrc && !isImageExpanded && !isImageLoading && !isUploading && (
                      <div className="flex flex-col items-center text-center px-4 animate-fade-in">
                        <div className="bg-blue-900/30 p-3 rounded-full mb-3 text-blue-400">
                          <ImageIcon size={24} />
                        </div>
                        <h3 className="text-sm font-bold text-white mb-1">Visual Concept Ready</h3>
                        <p className="text-gray-500 text-[10px] uppercase tracking-wider mb-4">Tap to reveal visualization for "{activeWord}"</p>
                        <button 
                          onClick={() => setIsImageExpanded(true)}
                          className="px-6 py-2 bg-[#1a2538] hover:bg-gray-700 text-white border border-gray-600 text-xs font-bold rounded-lg transition-all"
                        >
                          Reveal Image
                        </button>
                      </div>
                    )}

                    {/* Step 2: Expanded Image */}
                    {imageSrc && isImageExpanded && (
                      <img 
                        src={imageSrc} 
                        alt={activeWord} 
                        className="w-full h-auto max-h-[400px] object-cover transition-opacity duration-700"
                      />
                    )}
                  </div>

                  {/* Image Action Buttons */}
                  {imageSrc && isImageExpanded && (
                    <div className="flex gap-2 mt-3 justify-center animate-fade-in">
                      <button
                        onClick={() => handleGenerateImage('regenerate', activeWord)}
                        disabled={isImageLoading || isUploading}
                        className="flex-1 py-2.5 bg-[#1a2538] hover:bg-gray-700 text-gray-300 text-[10px] font-bold rounded-xl disabled:opacity-50 transition-all border border-gray-700 flex justify-center items-center gap-1.5 uppercase tracking-wide"
                      >
                        <RefreshCw size={12} /> Regenerate
                      </button>
                      
                      <button
                        onClick={() => {
                          const userIdea = window.prompt("Custom visual prompt (e.g., 'A modern neon city'):");
                          if (userIdea !== null && userIdea.trim() !== "") {
                            handleGenerateImage('refine', activeWord, userIdea);
                          }
                        }}
                        disabled={isImageLoading || isUploading}
                        className="flex-1 py-2.5 bg-[#1a2538] hover:bg-gray-700 text-gray-300 text-[10px] font-bold rounded-xl disabled:opacity-50 transition-all border border-gray-700 flex justify-center items-center gap-1.5 uppercase tracking-wide"
                      >
                        <Sparkles size={12} /> Custom Prompt
                      </button>

                      <button
                        onClick={() => fileInputRef.current.click()}
                        disabled={isImageLoading || isUploading}
                        className="flex-1 py-2.5 bg-[#1a2538] hover:bg-gray-700 text-gray-300 text-[10px] font-bold rounded-xl disabled:opacity-50 transition-all border border-gray-700 flex justify-center items-center gap-1.5 uppercase tracking-wide"
                      >
                        <Upload size={12} /> Upload
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

              {/* Bottom Actions */}
              <div className="flex justify-end border-t border-gray-800 mt-6 pt-4">
                <button
                  onClick={() => handleSearchWord(activeWord, true)}
                  disabled={loading}
                  className="text-[10px] text-gray-400 hover:text-white flex items-center gap-1.5 font-bold transition-all uppercase tracking-wider"
                >
                  <RefreshCw size={12} /> Alternative Context
                </button>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}