import React, { useState, useEffect, useRef } from "react";
import { Send, UserPlus, ArrowLeft, ExternalLink, RefreshCcw } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// 🔥 1. POSTCARD WALA EXACT HIGHLIGHT ENGINE (Clean Patti)
const highlightText = (text, highlight) => {
  if (!text || !highlight) return text;
  const regex = new RegExp(`(${highlight})`, "gi");
  const parts = String(text).split(regex);
  
  return parts.map((part, i) =>
    regex.test(part) ? (
      <span 
        key={i} 
        className="bg-[#FFB800]/15 text-[#8B004A] font-black px-1.5 py-0.5 rounded-md mx-0.5 border border-[#FFB800]/30 inline-block"
      >
        {part}
      </span>
    ) : (
      part
    )
  );
};

// 🔥 2. EXACT POSTCARD FLIP UI (No Bubble, Just Floating Card)
const SharedFlipCard = ({ msg, isMe, navigate }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [hasHintPlayed, setHasHintPlayed] = useState(false);
  
  const post = msg.postId;
  const word = post.word || post.title || "Unknown";
  const meaning = post.meaning || "View post for details...";

  return (
    <div className={`flex flex-col w-full my-1 ${isMe ? "items-end" : "items-start"}`}>
      
      {/* 🔹 Chhoti Patti / Label (Vocab Drop) */}
      <div className={`flex items-center gap-1.5 mb-1.5 opacity-60 ${isMe ? "mr-1" : "ml-1"}`}>
        <ExternalLink className="w-3 h-3 text-[#8B004A]" />
        <span className="text-[9px] font-black uppercase tracking-widest text-[#8B004A]">Shared Flashcard</span>
      </div>

      {/* 🔹 EXACT PostCard Flashcard (Soft shadow, rounded, inline-flex) */}
      <div className="perspective-[1000px] flex justify-start">
        <motion.div 
          className="cursor-pointer bg-white border border-gray-200 shadow-sm hover:shadow-md rounded-[1.2rem] relative inline-flex items-center justify-center px-5 py-3 min-w-[160px] min-h-[75px] active:scale-[0.98] transition-all"
          
          // 🔥 EXACT SCROLL-TRIGGERED FLIP (Screen pe aate hi flip hoga)
          onViewportEnter={() => {
            if (!hasHintPlayed) {
              setHasHintPlayed(true);
              setIsFlipped(true); 
              setTimeout(() => setIsFlipped(false), 800); 
            }
          }}
          onViewportLeave={() => setHasHintPlayed(false)}
          viewport={{ once: false, amount: 0.5 }}
          
          onClick={() => setIsFlipped(!isFlipped)}
        >
          {/* Hint indicator (Tap) */}
          <div className="absolute top-1.5 right-2 flex items-center gap-1 opacity-40">
             <RefreshCcw size={10} className="text-gray-500" />
             <span className="text-[7px] font-black uppercase tracking-widest text-gray-500">Tap</span>
          </div>

          <AnimatePresence mode="wait">
            {!isFlipped ? (
              // FRONT FACE (WORD)
              <motion.div
                key="front"
                initial={{ rotateX: 90, opacity: 0 }}
                animate={{ rotateX: 0, opacity: 1 }}
                exit={{ rotateX: -90, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="flex items-center gap-3 mt-1.5"
              >
                <h3 className="text-[1.6rem] leading-none font-black text-[#8B004A] tracking-tight capitalize">
                  {word}
                </h3>
              </motion.div>
            ) : (
              // BACK FACE (MEANING W/ PATTI HIGHLIGHT)
              <motion.div
                key="back"
                initial={{ rotateX: 90, opacity: 0 }}
                animate={{ rotateX: 0, opacity: 1 }}
                exit={{ rotateX: -90, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="flex flex-col items-center justify-center mt-1 w-full max-w-[200px]"
              >
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                  {word}
                </span>
                <p className="text-[13px] text-gray-800 font-bold leading-relaxed text-center px-1">
                  {highlightText(meaning, word)}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* 🔹 Clean Link Button (Without heavy background) */}
      <button 
        onClick={(e) => {
          e.stopPropagation(); 
          const targetId = post._id || post;
          navigate(`/community?postId=${targetId}&highlight=${encodeURIComponent(word)}`);
        }} 
        className={`mt-2.5 text-[10px] font-black uppercase tracking-widest text-[#E01A76] hover:text-[#8B004A] transition-colors flex items-center gap-1 ${isMe ? "mr-2" : "ml-2"}`}
      >
        Open in Hub <ArrowLeft className="w-3 h-3 rotate-135" style={{transform: "rotate(135deg)"}} />
      </button>
    </div>
  );
};

export default function SquadChat() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const squad = location.state?.squad; 
  const userEmail = localStorage.getItem("eng_userEmail") || "guest@gmail.com";
  const API_URL = window.location.hostname === "localhost" ? "http://localhost:3000" : "https://serdeptry1st.onrender.com";

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [showAddMember, setShowAddMember] = useState(false);
  const [isInitialLoaded, setIsInitialLoaded] = useState(false); // 🔥 Prevent annoying auto-scroll

  const chatEndRef = useRef(null);

  useEffect(() => {
    if (!squad) {
      toast.error("Please select a squad first!");
      navigate(-1);
    }
  }, [squad, navigate]);

  const fetchMessages = async () => {
    if(!squad?._id) return;
    try {
      const res = await fetch(`${API_URL}/api/squads/${squad._id}/messages?email=${encodeURIComponent(userEmail)}`);
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.error("Failed to fetch messages");
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [squad?._id]);

  // 🔥 SMART SCROLL LOGIC: Sirf pehli baar load hone par scroll karega
  useEffect(() => {
    if (messages.length > 0 && !isInitialLoaded) {
      chatEndRef.current?.scrollIntoView({ behavior: "auto" });
      setIsInitialLoaded(true);
    }
  }, [messages, isInitialLoaded]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !squad?._id) return;

    const currentText = inputText;
    setInputText("");
    
    // 🔥 INSTANT SCROLL: Jab aap message bhejenge tab neeche scroll hoga
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);

    try {
      await fetch(`${API_URL}/api/squads/${squad._id}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderEmail: userEmail,
          type: "text",
          text: currentText
        }),
      });
      fetchMessages(); 
    } catch (err) {
      toast.error("Failed to send message");
    }
  };

  const handleAddMember = async () => {
    if (!newMemberEmail) return toast.error("Enter an email");
    try {
      const res = await fetch(`${API_URL}/api/squads/${squad._id}/add-member`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newMemberEmail }),
      });
      if (res.ok) {
        toast.success(`${newMemberEmail} added to squad!`);
        setNewMemberEmail("");
        setShowAddMember(false);
      }
    } catch (err) {
      toast.error("Failed to add member");
    }
  };

  if (!squad) return null;

  return (
    <div className="flex flex-col h-screen max-h-screen bg-[#F2EFE7] w-full max-w-[450px] mx-auto relative shadow-2xl">
      
      {/* 1. CHAT HEADER */}
      <div className="bg-[#8B004A] text-white px-4 py-3 flex items-center justify-between shadow-md z-10 relative">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1 hover:bg-white/20 rounded-full transition-all active:scale-90">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-black text-lg">
            {squad.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <h2 className="font-black text-sm tracking-wide">{squad.name}</h2>
            <span className="text-[10px] text-white/70 tracking-widest uppercase">
              {squad.members.length} Members
            </span>
          </div>
        </div>
        
        <button onClick={() => setShowAddMember(!showAddMember)} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all active:scale-90">
          <UserPlus className="w-5 h-5" />
        </button>
      </div>

      {/* ADD MEMBER DROPDOWN */}
      {showAddMember && (
        <div className="bg-white p-3 border-b-2 border-gray-200 flex gap-2 animate-in slide-in-from-top-2 relative z-10">
          <input 
            type="email" 
            placeholder="Friend's email..." 
            value={newMemberEmail}
            onChange={(e) => setNewMemberEmail(e.target.value)}
            className="flex-1 bg-gray-100 rounded-xl px-3 text-xs font-bold outline-none focus:ring-2 focus:ring-[#8B004A]/50"
          />
          <button onClick={handleAddMember} className="bg-[#8B004A] text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95">
            Add
          </button>
        </div>
      )}

      {/* 2. CHAT MESSAGES AREA */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
        {messages.length === 0 && (
           <div className="text-center text-gray-400 text-xs font-bold mt-10">Say hi to your squad! 👋</div>
        )}
        
        {messages.map((msg, index) => {
          const isMe = msg.senderEmail === userEmail;
          const showSenderName = !isMe && (index === 0 || messages[index - 1].senderEmail !== msg.senderEmail);

          return (
            <div key={msg._id || index} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
              {showSenderName && (
                <span className="text-[9px] font-bold text-gray-400 mb-1 ml-1">{msg.senderEmail.split("@")[0]}</span>
              )}

              {/* Text Message */}
              {msg.type === "text" && (
                <div className={`px-4 py-2.5 max-w-[75%] rounded-2xl shadow-sm text-sm font-medium ${
                  isMe ? "bg-[#8B004A] text-white rounded-tr-sm" : "bg-white text-gray-800 rounded-tl-sm border border-gray-100"
                }`}>
                  {msg.text}
                </div>
              )}

              {/* 🔥 SHARED POST FLIP CARD (PostCard Style) 🔥 */}
              {msg.type === "post" && msg.postId && (
                <SharedFlipCard msg={msg} isMe={isMe} navigate={navigate} />
              )}
            </div>
          );
        })}
        {/* Invisible div for scroll anchor */}
        <div ref={chatEndRef} className="h-1" />
      </div>

      {/* 3. MESSAGE INPUT BOX */}
      <form onSubmit={handleSendMessage} className="bg-white p-3 border-t-2 border-gray-100 flex items-center gap-2 relative z-10">
        <input 
          type="text" 
          placeholder="Type a message..." 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-1 bg-[#F2EFE7] rounded-full px-5 py-3 text-sm font-bold outline-none focus:bg-white focus:ring-2 focus:ring-[#8B004A]/30 transition-all"
        />
        <button 
          type="submit" 
          disabled={!inputText.trim()}
          className="w-12 h-12 bg-[#8B004A] text-white rounded-full flex items-center justify-center disabled:opacity-50 active:scale-90 transition-transform shadow-md"
        >
          <Send className="w-5 h-5 ml-1" />
        </button>
      </form>
    </div>
  );
}