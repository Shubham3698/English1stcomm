import React, { useState, useEffect, useRef } from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { Mic, MicOff, Loader2, Sparkles, User, Volume2, AudioLines, Bot } from "lucide-react";
import toast from "react-hot-toast";
import 'regenerator-runtime/runtime';

export default function AIVoiceTutor({ userEmail }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
const [chatHistory, setChatHistory] = useState([
    { role: "ai", text: "Namaste! Main aapka AI English coach hoon. Mic par tap karo aur chalo practice shuru karte hain!" }
  ]);
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  const chatEndRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, transcript, isProcessing]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="p-6 bg-red-50 border-2 border-red-200 rounded-3xl text-center m-4">
        <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
          <MicOff size={24} />
        </div>
        <h3 className="font-playful font-bold text-red-600 text-lg mb-1">Browser Not Supported</h3>
        <p className="font-body text-sm text-red-500 font-medium">Please use Google Chrome for voice features.</p>
      </div>
    );
  }

  const handleMicClick = () => {
    if (listening) {
      SpeechRecognition.stopListening();
      if (transcript.trim()) {
        sendToGemini(transcript);
      }
    } else {
      resetTranscript();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setIsPlayingAudio(false);
      SpeechRecognition.startListening({ continuous: true, language: 'en-IN' });
    }
  };

  const sendToGemini = async (userText) => {
    setIsProcessing(true);
    
    // Naya message history me add karo
    const updatedHistory = [...chatHistory, { role: "user", text: userText }];
    setChatHistory(updatedHistory);
    resetTranscript();

    try {
      const currentHost = window.location.hostname;
      let BACKEND_URL = "https://serdeptry1st.onrender.com"; 

      if (currentHost === "localhost" || currentHost === "127.0.0.1") {
        BACKEND_URL = "http://localhost:3000"; 
      } else if (currentHost.startsWith("192.168.")) {
        BACKEND_URL = `http://${currentHost}:3000`; 
      }

      const response = await fetch(`${BACKEND_URL}/api/words/voice-chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: userText, 
          history: updatedHistory 
        })
      });

      const data = await response.json();
      
      if (response.ok && data.reply) {
        // 🔥 HISTORY ME AUDIO BASE64 BHI SAVE KAR RAHE HAIN 🔥
        setChatHistory(prev => [...prev, { role: "ai", text: data.reply, audioBase64: data.audioBase64 }]);
        
        if (data.audioBase64) {
          playAudioResponse("data:audio/mp3;base64," + data.audioBase64);
        } else {
          fallbackSpeak(data.reply);
        }
      } else {
        toast.error("Tutor failed to respond.");
      }
    } catch (error) {
      console.error("Chat Error:", error);
      toast.error("Network connection error!");
    } finally {
      setIsProcessing(false);
    }
  };

  const playAudioResponse = (audioSrc) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    setIsPlayingAudio(true);
    const audio = new Audio(audioSrc);
    audioRef.current = audio;
    audio.play();
    
    audio.onended = () => setIsPlayingAudio(false);
    audio.onerror = () => {
      setIsPlayingAudio(false);
      fallbackSpeak(chatHistory[chatHistory.length - 1]?.text);
    };
  };

  const fallbackSpeak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.lang = 'en-IN';
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;600;700;800&display=swap');
          .font-body { font-family: 'Nunito', sans-serif; }
          .font-playful { font-family: 'Fredoka', sans-serif; }
          .bg-dots {
            background-image: radial-gradient(#E01A76 1px, transparent 1px);
            background-size: 20px 20px;
            background-color: #F9F8F6;
            opacity: 0.8;
          }
        `}
      </style>

      <div className="w-full max-w-[420px] mx-auto bg-white border-4 border-white rounded-[2.5rem] shadow-2xl shadow-[#8B004A]/10 flex flex-col overflow-hidden h-[580px] relative font-body">
        
        {/* HEADER */}
        <div className="bg-white px-5 py-4 flex items-center justify-between border-b-2 border-gray-100 z-10 relative shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-tr from-[#8B004A] to-[#E01A76] rounded-[1rem] flex items-center justify-center text-white shadow-md rotate-3">
              <Sparkles size={22} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-[16px] font-playful font-bold text-[#8B004A] tracking-wide leading-tight">AI Voice Tutor</h2>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Online
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-[#FFB800]/15 px-3 py-1.5 rounded-xl border-2 border-[#FFB800]/30 shadow-sm">
            <Sparkles size={12} className="text-[#8B004A]" />
            <span className="text-[10px] font-playful font-bold text-[#8B004A] uppercase tracking-wider">Gemini Audio</span>
          </div>
        </div>

        {/* CHAT FEED */}
        <div className="flex-1 overflow-y-auto p-5 bg-dots space-y-5 custom-scrollbar relative z-0">
          {chatHistory.map((chat, idx) => (
            <div key={idx} className={`flex ${chat.role === "user" ? "justify-end" : "justify-start"} items-end gap-2 w-full`}>
              
              {chat.role === "ai" && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#FFB800] to-[#f0ad00] flex items-center justify-center text-[#4A0027] flex-shrink-0 shadow-sm border border-white z-10">
                  <Bot size={16} strokeWidth={2.5} />
                </div>
              )}

              {/* 🔥 BUBBLE WRAPPER FOR REPLAY BUTTON 🔥 */}
              <div className={`max-w-[80%] p-4 text-[14px] font-bold leading-relaxed shadow-sm relative group ${
                chat.role === "user" 
                  ? "bg-gradient-to-br from-[#8B004A] to-[#E01A76] text-white rounded-3xl rounded-br-sm" 
                  : "bg-white text-gray-800 border-2 border-gray-100 rounded-3xl rounded-bl-sm pr-12"
              }`}>
                {chat.text}

                {/* AI REPLAY BUTTON */}
                {chat.role === "ai" && (
                  <button 
                    onClick={() => {
                      if (chat.audioBase64) {
                        playAudioResponse("data:audio/mp3;base64," + chat.audioBase64);
                      } else {
                        fallbackSpeak(chat.text);
                      }
                    }}
                    className="absolute bottom-2 right-2 p-2 bg-gray-50 text-gray-400 hover:text-[#8B004A] hover:bg-[#8B004A]/10 rounded-full transition-all active:scale-90"
                    title="Play Audio"
                  >
                    <Volume2 size={16} strokeWidth={2.5} />
                  </button>
                )}
              </div>

              {chat.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 flex-shrink-0 shadow-sm border border-white z-10">
                  {userEmail && userEmail !== "guest_user@gmail.com" ? (
                    <span className="font-playful font-bold text-xs uppercase">{userEmail.charAt(0)}</span>
                  ) : (
                    <User size={16} strokeWidth={2.5} />
                  )}
                </div>
              )}
            </div>
          ))}

          {/* LIVE TRANSCRIPT BUBBLE */}
          {listening && transcript && (
            <div className="flex justify-end items-end gap-2 opacity-80 animate-in fade-in slide-in-from-bottom-2">
               <div className="max-w-[80%] p-3 px-4 rounded-3xl rounded-br-sm text-[13px] font-medium bg-gray-800 text-white shadow-sm italic">
                {transcript}<span className="animate-pulse">...</span>
              </div>
            </div>
          )}

          {/* TYPING INDICATOR */}
          {isProcessing && (
            <div className="flex justify-start items-end gap-2 animate-in fade-in">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#FFB800] to-[#f0ad00] flex items-center justify-center text-[#4A0027] flex-shrink-0 shadow-sm border border-white">
                <Loader2 size={14} className="animate-spin" strokeWidth={3} />
              </div>
              <div className="bg-white px-5 py-3.5 rounded-3xl rounded-bl-sm border-2 border-gray-100 shadow-sm flex items-center gap-1.5 h-[42px]">
                <div className="w-2 h-2 bg-[#E01A76] rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-[#8B004A] rounded-full animate-bounce" style={{animationDelay: "0.15s"}}></div>
                <div className="w-2 h-2 bg-[#FFB800] rounded-full animate-bounce" style={{animationDelay: "0.3s"}}></div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} className="h-2" />
        </div>

        {/* FOOTER CONTROLS */}
        <div className="p-5 bg-white border-t-2 border-gray-100 flex flex-col items-center gap-4 z-10 relative shadow-[0_-10px_30px_rgba(0,0,0,0.02)]">
          
          <div className="flex items-center justify-center h-5 w-full">
            {isPlayingAudio ? (
              <div className="flex items-center gap-2 text-[#E01A76] bg-[#E01A76]/10 px-4 py-1 rounded-full">
                <AudioLines size={14} className="animate-pulse" />
                <span className="text-[10px] font-playful font-bold uppercase tracking-widest">Tutor is speaking...</span>
              </div>
            ) : listening ? (
              <div className="flex items-center gap-2 text-[#8B004A] bg-[#8B004A]/10 px-4 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-[#E01A76] animate-ping"></span>
                <span className="text-[10px] font-playful font-bold uppercase tracking-widest">Listening... Tap to send</span>
              </div>
            ) : (
              <span className="text-[11px] font-playful font-bold text-gray-400 uppercase tracking-widest">Tap the mic to start speaking</span>
            )}
          </div>

          {/* PLAYFUL 3D MIC BUTTON */}
          <button 
            onClick={handleMicClick}
            disabled={isProcessing || isPlayingAudio}
            className={`relative flex items-center justify-center w-20 h-20 rounded-full transition-all duration-300 outline-none ${
              listening 
                ? "bg-[#E01A76] text-white scale-[1.05]" 
                : "bg-[#8B004A] text-white hover:bg-[#E01A76] active:scale-95"
            } disabled:opacity-50 disabled:active:scale-100 disabled:bg-gray-400 border-4 border-white shadow-xl`}
          >
            {listening && (
              <>
                <div className="absolute inset-0 bg-[#E01A76] rounded-full animate-ping opacity-40"></div>
                <div className="absolute -inset-3 border-2 border-[#E01A76]/30 rounded-full animate-pulse"></div>
              </>
            )}
            {listening ? <MicOff size={32} strokeWidth={2.5} /> : <Mic size={32} strokeWidth={2.5} />}
          </button>
        </div>

      </div>
    </>
  );
}