import React, { useState, useEffect, useRef } from "react";
import { Send, UserPlus, ArrowLeft, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate, useLocation } from "react-router-dom";

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
      const res = await fetch(`${API_URL}/api/squads/${squad._id}/messages`);
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

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !squad?._id) return;

    try {
      await fetch(`${API_URL}/api/squads/${squad._id}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderEmail: userEmail,
          type: "text",
          text: inputText
        }),
      });
      setInputText("");
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
      <div className="bg-[#8B004A] text-white px-4 py-3 flex items-center justify-between shadow-md z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1 hover:bg-white/20 rounded-full transition-all">
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
        
        <button onClick={() => setShowAddMember(!showAddMember)} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all">
          <UserPlus className="w-5 h-5" />
        </button>
      </div>

      {/* ADD MEMBER DROPDOWN */}
      {showAddMember && (
        <div className="bg-white p-3 border-b-2 border-gray-200 flex gap-2 animate-in slide-in-from-top-2">
          <input 
            type="email" 
            placeholder="Friend's email..." 
            value={newMemberEmail}
            onChange={(e) => setNewMemberEmail(e.target.value)}
            className="flex-1 bg-gray-100 rounded-xl px-3 text-xs font-bold outline-none focus:ring-2 focus:ring-[#8B004A]/50"
          />
          <button onClick={handleAddMember} className="bg-[#8B004A] text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">
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

              {msg.type === "text" && (
                <div className={`px-4 py-2.5 max-w-[75%] rounded-2xl shadow-sm text-sm font-medium ${
                  isMe ? "bg-[#8B004A] text-white rounded-tr-sm" : "bg-white text-gray-800 rounded-tl-sm border border-gray-100"
                }`}>
                  {msg.text}
                </div>
              )}

              {msg.type === "post" && msg.postId && (
                <div className={`max-w-[80%] rounded-2xl shadow-sm border-2 overflow-hidden ${
                  isMe ? "bg-[#8B004A]/10 border-[#8B004A]/30" : "bg-white border-gray-200"
                }`}>
                  <div className="bg-gray-100/50 p-2 border-b border-gray-200 flex items-center gap-2">
                    <ExternalLink className="w-3 h-3 text-[#8B004A]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#8B004A]">Shared Community Post</span>
                  </div>
                  <div className="p-3">
                    <h3 className="font-black text-lg text-gray-900 capitalize mb-1">{msg.postId.word || msg.postId.title}</h3>
                    <p className="text-xs text-gray-600 line-clamp-2">{msg.postId.meaning || "View post for details..."}</p>
                    
                    {/* 🔥 YAHAN NAVIGATE LOGIC LAGA DIYA HAI 🔥 */}
                    <button 
                      onClick={() => {
                        const targetId = msg.postId._id || msg.postId;
                        const targetWord = msg.postId.word || msg.postId.title || "";
                        navigate(`/community?postId=${targetId}&highlight=${encodeURIComponent(targetWord)}`);
                      }} 
                      className="mt-3 w-full bg-[#8B004A] text-white py-2 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-transform"
                    >
                      View Full Post
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      {/* 3. MESSAGE INPUT BOX */}
      <form onSubmit={handleSendMessage} className="bg-white p-3 border-t-2 border-gray-100 flex items-center gap-2">
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