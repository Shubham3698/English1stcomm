import React, { useState, useEffect, useRef } from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { SpeechRecognition as CapSpeech } from "@capacitor-community/speech-recognition";
// 🔥 NAYA IMPORT: Native TTS Plugin jisse aawaz 100% bajegi (Fallback ke liye)
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { Capacitor } from "@capacitor/core";
import { Mic, MicOff, Loader2, Sparkles, User, Volume2, AudioLines, Bot, Send } from "lucide-react";
import toast from "react-hot-toast";
import 'regenerator-runtime/runtime';

export default function AIVoiceTutor({ userEmail }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  
  const [inputText, setInputText] = useState("");

  const [isNativeListening, setIsNativeListening] = useState(false);

  const [chatHistory, setChatHistory] = useState([
    { role: "ai", text: "Namaste! Main aapka AI English coach hoon. Mic par tap karo aur chalo practice shuru karte hain!" }
  ]);

  const {
    transcript: webTranscript,
    listening: webListening,
    resetTranscript: resetWebTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  const chatEndRef = useRef(null);
  const audioRef = useRef(null);
  const isApp = Capacitor.isNativePlatform();

  // Backend URL Generator
  const getBackendUrl = () => {
    let BACKEND_URL = "https://serdeptry1st.onrender.com"; 
    if (!isApp) {
      const currentHost = window.location.hostname;
      if (currentHost === "localhost" || currentHost === "127.0.0.1") {
        BACKEND_URL = "http://localhost:3000"; 
      } else if (currentHost.startsWith("192.168.")) {
        BACKEND_URL = `http://${currentHost}:3000`; 
      }
    }
    return BACKEND_URL;
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isProcessing, inputText]);

  useEffect(() => {
    audioRef.current = new Audio(); // Component load hote hi audio setup
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      if (isApp) {
        CapSpeech.removeAllListeners();
      }
    };
  }, [isApp]);

  useEffect(() => {
    if (!isApp && webListening && webTranscript) {
      setInputText(webTranscript);
    }
  }, [webTranscript, webListening, isApp]);

  // 🔥 THE MAGIC UNLOCKER: Ye browser/OS ko trick karega ki user ne play allow kar diya hai
  const unlockAudioEngine = () => {
    if (audioRef.current) {
      audioRef.current.src = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=";
      audioRef.current.play().catch(() => {});
    }
  };

  const toggleMic = async () => {
    unlockAudioEngine(); // Tap karte hi audio engine unlock

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlayingAudio(false);
    }

    const currentlyListening = isApp ? isNativeListening : webListening;

    if (currentlyListening) {
      if (isApp) {
        setIsNativeListening(false);
        CapSpeech.stop().catch(err => console.log("Stop error:", err));
        CapSpeech.removeAllListeners();
      } else {
        SpeechRecognition.stopListening();
      }
    } else {
      setInputText(""); 
      
      if (isApp) {
        try {
          const { speechRecognition } = await CapSpeech.requestPermissions();
          if (speechRecognition !== 'granted') {
            return toast.error("Mic permission denied!");
          }

          setIsNativeListening(true);
          
          await CapSpeech.start({
            language: "en-IN",
            partialResults: true,
            popup: false 
          });

          CapSpeech.addListener("partialResults", (data) => {
            if (data.matches && data.matches.length > 0) {
              const text = data.matches[0];
              if (text && text.trim().length > 0) {
                setInputText(text); 
              }
            }
          });
        } catch (error) {
          setIsNativeListening(false);
          toast.error("Phone mic error!");
        }
      } else {
        if (!browserSupportsSpeechRecognition) {
          return toast.error("Your browser doesn't support speech recognition.");
        }
        resetWebTranscript();
        SpeechRecognition.startListening({ continuous: true, language: 'en-IN' });
      }
    }
  };

  const handleSendMessage = () => {
    unlockAudioEngine(); // Message bhejte waqt bhi unlock ensure karein

    const textToSend = inputText.trim();
    if (!textToSend) return;

    if (isApp && isNativeListening) {
      setIsNativeListening(false);
      CapSpeech.stop().catch(e => console.log(e));
      CapSpeech.removeAllListeners();
    } else if (!isApp && webListening) {
      SpeechRecognition.stopListening();
    }

    sendToGemini(textToSend);
  };

  const sendToGemini = async (userText) => {
    setIsProcessing(true);
    setInputText(""); 
    if (!isApp) resetWebTranscript(); 
    
    const updatedHistory = [...chatHistory, { role: "user", text: userText }];
    setChatHistory(updatedHistory);

    try {
      const BACKEND_URL = getBackendUrl();
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
        setChatHistory(prev => [...prev, { role: "ai", text: data.reply, audioBase64: data.audioBase64 }]);
        
        // 🔥 AUDIO FIX: Ab directly Premium Player Use hoga!
        playPremiumAudio(data.reply, data.audioBase64);
        
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

  // 🔥 MASTER PREMIUM AUDIO PLAYER (Always uses API voice)
  const playPremiumAudio = async (textToSpeak, base64Audio = null) => {
    if (!textToSpeak) return;

    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    setIsPlayingAudio(true);

    try {
      let finalAudioSrc = "";

      // Agar /voice-chat route se direct base64 audio aa gaya hai
      if (base64Audio) {
        finalAudioSrc = "data:audio/mp3;base64," + base64Audio;
      } 
      // Agar base64 nahi hai (Jaise Namaste wala pehla message) toh premium API hit karo
      else {
        const BACKEND_URL = getBackendUrl();
        const res = await fetch(`${BACKEND_URL}/api/words/speak`, {
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
        fallbackSpeak(textToSpeak); // Agar file corrupt ho
      };

      await audioRef.current.play();

    } catch (error) {
      console.error("Premium Audio Error, falling back to basic:", error);
      setIsPlayingAudio(false);
      fallbackSpeak(textToSpeak);
    }
  };

  // 🔥 YEH HAI MASTER NATIVE FALLBACK (Robotic aawaz sirf internet crash hone par)
  const fallbackSpeak = async (text) => {
    if (!text) return;
    try {
      if (Capacitor.isNativePlatform()) {
        await TextToSpeech.speak({
          text: text,
          lang: 'en-IN',
          rate: 0.95, 
          pitch: 1.0,
          volume: 1.0,
        });
      } else {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.rate = 0.95;
          utterance.pitch = 1.0;
          utterance.lang = 'hi-IN'; 
          window.speechSynthesis.speak(utterance);
        }
      }
    } catch (err) {
      console.error("TTS Fallback Error:", err);
    }
  };

  const isMicActive = isApp ? isNativeListening : webListening;

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;600;700;800&display=swap');
          .font-body { font-family: 'Nunito', sans-serif; }
          .font-playful { font-family: 'Fredoka', sans-serif; }
          .bg-chat-pattern {
            background-color: #F2EFE7;
            background-image: radial-gradient(#E01A76 0.75px, transparent 0.75px);
            background-size: 15px 15px;
          }
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}
      </style>

      <div className="w-full sm:max-w-md mx-auto bg-white flex flex-col h-screen relative font-body shadow-2xl overflow-hidden">
        
        {/* HEADER */}
        <div className="bg-white px-5 py-4 flex items-center justify-between border-b-2 border-gray-100 z-20 shadow-sm shrink-0">
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
            <Bot size={12} className="text-[#8B004A]" />
            <span className="text-[10px] font-playful font-bold text-[#8B004A] uppercase tracking-wider">Coach</span>
          </div>
        </div>

        {/* CHAT FEED */}
        <div className="flex-1 overflow-y-auto p-5 bg-chat-pattern space-y-5 no-scrollbar relative z-0">
          {chatHistory.map((chat, idx) => (
            <div key={idx} className={`flex ${chat.role === "user" ? "justify-end" : "justify-start"} items-end gap-2 w-full`}>
              
              {chat.role === "ai" && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#FFB800] to-[#f0ad00] flex items-center justify-center text-[#4A0027] flex-shrink-0 shadow-sm border border-white z-10">
                  <Bot size={16} strokeWidth={2.5} />
                </div>
              )}

              <div className={`max-w-[80%] p-3.5 px-4 text-[14px] font-bold leading-relaxed shadow-sm relative group ${
                chat.role === "user" 
                  ? "bg-gradient-to-br from-[#8B004A] to-[#E01A76] text-white rounded-3xl rounded-br-sm" 
                  : "bg-white text-gray-800 border-2 border-gray-100 rounded-3xl rounded-bl-sm pr-12"
              }`}>
                {chat.text}

                {/* AI REPLAY BUTTON - Ab yahan direct playPremiumAudio call hoga */}
                {chat.role === "ai" && (
                  <button 
                    onClick={() => playPremiumAudio(chat.text, chat.audioBase64)}
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

        {/* STATUS BAR */}
        {isPlayingAudio && (
          <div className="bg-[#E01A76]/10 py-1.5 flex justify-center items-center gap-2 text-[#E01A76] shrink-0 border-t border-[#E01A76]/10">
            <AudioLines size={14} className="animate-pulse" />
            <span className="text-[10px] font-playful font-bold uppercase tracking-widest">Tutor is speaking...</span>
          </div>
        )}
        {isMicActive && !isPlayingAudio && (
          <div className="bg-[#8B004A]/10 py-1.5 flex justify-center items-center gap-2 text-[#8B004A] shrink-0 border-t border-[#8B004A]/10">
            <span className="w-2 h-2 rounded-full bg-[#E01A76] animate-ping"></span>
            <span className="text-[10px] font-playful font-bold uppercase tracking-widest">Listening... You can edit before sending</span>
          </div>
        )}

        {/* INPUT AREA */}
        <div className="p-3 bg-white border-t-2 border-gray-100 shrink-0 shadow-[0_-10px_20px_rgba(0,0,0,0.03)] z-20 pb-safe">
          <div className="flex items-end gap-2 bg-[#F9F8F6] p-1.5 rounded-3xl border border-gray-200 focus-within:border-[#8B004A]/30 focus-within:bg-white transition-colors shadow-inner">
            
            <button 
              onClick={toggleMic}
              disabled={isProcessing || isPlayingAudio}
              className={`p-3 rounded-full transition-all duration-300 outline-none shrink-0 ${
                isMicActive 
                  ? "bg-[#E01A76] text-white shadow-md animate-pulse" 
                  : "bg-transparent text-gray-500 hover:bg-gray-200"
              } disabled:opacity-50`}
            >
              {isMicActive ? <MicOff size={22} strokeWidth={2.5} /> : <Mic size={22} strokeWidth={2.5} />}
            </button>

            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Tap mic to speak, or type here..."
              className="flex-1 max-h-24 bg-transparent outline-none resize-none py-3 px-2 text-sm font-bold text-gray-800 placeholder:text-gray-400 no-scrollbar"
              rows={Math.min(3, inputText.split('\n').length)}
              disabled={isProcessing}
            />

            {inputText.trim().length > 0 && (
              <button 
                onClick={handleSendMessage}
                disabled={isProcessing}
                className="p-3 bg-[#8B004A] text-white rounded-full transition-transform active:scale-90 hover:bg-[#E01A76] shadow-md shrink-0 mb-[2px] mr-[2px]"
              >
                <Send size={20} strokeWidth={2.5} className="ml-0.5" />
              </button>
            )}
          </div>
        </div>

      </div>
    </>
  );
}