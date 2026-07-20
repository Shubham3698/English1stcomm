import React, { useState, useEffect, useRef } from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { Mic, MicOff, Loader2, Sparkles, User, Volume2 } from "lucide-react";
import toast from "react-hot-toast";
import 'regenerator-runtime/runtime';

export default function AIVoiceTutor({ userEmail, API_URL }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    { role: "ai", text: "Hello! I am your AI English coach powered by Gemini. Tap the mic and let's practice!" }
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
  }, [chatHistory, transcript]);

  if (!browserSupportsSpeechRecognition) {
    return <div className="p-4 text-red-500 bg-red-50 rounded-xl">Browser doesn't support speech recognition. Please use Google Chrome.</div>;
  }

  const handleMicClick = () => {
    if (listening) {
      SpeechRecognition.stopListening();
      if (transcript.trim()) {
        sendToGemini(transcript);
      }
    } else {
      resetTranscript();
      if (audioRef.current) audioRef.current.pause();
      setIsPlayingAudio(false);
      SpeechRecognition.startListening({ continuous: true, language: 'en-IN' });
    }
  };

  const sendToGemini = async (userText) => {
    setIsProcessing(true);
    setChatHistory(prev => [...prev, { role: "user", text: userText }]);
    resetTranscript();

    try {
      const response = await fetch(`${API_URL}/api/ai-tutor/gemini-voice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText, email: userEmail })
      });

      const data = await response.json();
      
      if (response.ok && data.reply) {
        setChatHistory(prev => [...prev, { role: "ai", text: data.reply }]);
        
        // Agar backend se audio stream ya URL aaya hai toh play karenge
        if (data.audioUrl) {
          playAudioResponse(data.audioUrl);
        } else {
          fallbackSpeak(data.reply);
        }
      } else {
        toast.error("Gemini failed to respond.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Network connection error!");
    } finally {
      setIsProcessing(false);
    }
  };

  const playAudioResponse = (url) => {
    setIsPlayingAudio(true);
    const audio = new Audio(url);
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
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="w-full max-w-[440px] mx-auto bg-white border-[3px] border-[#8B004A]/10 rounded-[2rem] shadow-xl shadow-[#8B004A]/5 flex flex-col overflow-hidden h-[520px] font-sans">
      
      {/* HEADER */}
      <div className="bg-[#F2EFE7] px-5 py-4 border-b-2 border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-[#8B004A] to-[#E01A76] rounded-full flex items-center justify-center text-white shadow-md">
            <Sparkles size={20} />
          </div>
          <div>
            <h2 className="text-[14px] font-black text-[#8B004A] uppercase tracking-wide">Gemini AI Tutor</h2>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Voice Practice Arena</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-[#FFB800]/10 px-2.5 py-1 rounded-full border border-[#FFB800]/30">
          <div className="w-2 h-2 bg-[#8B004A] rounded-full animate-pulse"></div>
          <span className="text-[9px] font-black text-[#8B004A] uppercase tracking-wider">Gemini 1.5</span>
        </div>
      </div>

      {/* CHAT FEED */}
      <div className="flex-1 overflow-y-auto p-5 bg-[#F2EFE7]/30 space-y-4 custom-scrollbar">
        {chatHistory.map((chat, idx) => (
          <div key={idx} className={`flex ${chat.role === "user" ? "justify-end" : "justify-start"} items-end gap-2`}>
            
            {chat.role === "ai" && (
              <div className="w-7 h-7 rounded-full bg-[#8B004A] flex items-center justify-center text-white flex-shrink-0 shadow-sm">
                <Sparkles size={14} />
              </div>
            )}

            <div className={`max-w-[75%] p-3.5 rounded-2xl text-[13px] font-medium leading-relaxed shadow-sm ${
              chat.role === "user" 
                ? "bg-gray-900 text-white rounded-br-sm" 
                : "bg-white text-gray-800 border-2 border-gray-100 rounded-bl-sm"
            }`}>
              {chat.text}
            </div>

            {chat.role === "user" && (
              <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 flex-shrink-0 shadow-sm">
                <User size={14} />
              </div>
            )}
          </div>
        ))}

        {listening && transcript && (
          <div className="flex justify-end items-end gap-2 opacity-75">
             <div className="max-w-[75%] p-3.5 rounded-2xl text-[13px] font-medium bg-gray-900 text-white rounded-br-sm border border-gray-700 italic">
              {transcript}...
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="flex justify-start items-end gap-2">
            <div className="w-7 h-7 rounded-full bg-[#8B004A] flex items-center justify-center text-white flex-shrink-0">
              <Loader2 size={14} className="animate-spin" />
            </div>
            <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-sm border-2 border-gray-100 shadow-sm flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-gray-400">Gemini is thinking</span>
              <div className="w-1.5 h-1.5 bg-[#E01A76] rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-[#E01A76] rounded-full animate-bounce" style={{animationDelay: "0.2s"}}></div>
              <div className="w-1.5 h-1.5 bg-[#E01A76] rounded-full animate-bounce" style={{animationDelay: "0.4s"}}></div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* FOOTER CONTROLS */}
      <div className="p-4 bg-white border-t-2 border-gray-50 flex flex-col items-center gap-3">
        <div className="flex items-center gap-2">
          {isPlayingAudio && <Volume2 size={16} className="text-[#E01A76] animate-pulse" />}
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            {listening ? "Listening to you... Tap to send" : isPlayingAudio ? "Gemini is speaking..." : "Tap mic to speak"}
          </p>
        </div>

        <button 
          onClick={handleMicClick}
          disabled={isProcessing}
          className={`relative flex items-center justify-center w-16 h-16 rounded-full transition-all duration-300 ${
            listening 
              ? "bg-[#E01A76] text-white scale-110 shadow-[0_0_25px_rgba(224,26,118,0.4)]" 
              : "bg-[#8B004A] text-white hover:bg-[#E01A76] shadow-xl"
          } disabled:opacity-50`}
        >
          {listening && (
            <>
              <div className="absolute inset-0 bg-[#E01A76] rounded-full animate-ping opacity-30"></div>
              <div className="absolute inset-[-8px] border-2 border-[#E01A76]/60 rounded-full animate-pulse"></div>
            </>
          )}
          {listening ? <MicOff size={26} /> : <Mic size={26} />}
        </button>
      </div>

    </div>
  );
}