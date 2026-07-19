import React, { useState, useRef } from "react";
import { Mic, MicOff, AlertCircle } from "lucide-react";

export default function BasicVoiceTest() {
  const [isListening, setIsListening] = useState(false);
  const [spokenText, setSpokenText] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  
  // Reference banaya taaki hum beech me stop kar sakein
  const recognitionRef = useRef(null);

  const toggleListening = () => {
    // Agar already chal raha hai, toh stop kar do
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      return;
    }

    // Speech API check
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setErrorMsg("Tumhara browser Speech Recognition support nahi karta. Please Google Chrome use karo.");
      return;
    }

    // Naya instance start karna
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    
    recognition.lang = 'en-US'; // English sunne ke liye
    recognition.interimResults = true; // 🔥 Isko true rakha hai taaki bolte time live text dikhe
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setSpokenText(""); // Purana text clear kar do
      setErrorMsg("");   // Purana error clear kar do
    };

    recognition.onresult = (event) => {
      // Jo bhi bola gaya hai usko jod kar text banana
      const currentTranscript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');
      setSpokenText(currentTranscript);
    };

    recognition.onerror = (event) => {
      console.error("Mic Error:", event.error);
      setErrorMsg(`Error pakda gaya: ${event.error}`); // Exact error screen par dikhega
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    // Mic on karo
    recognition.start();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 font-sans text-gray-800">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md text-center">
        
        <h2 className="text-2xl font-black text-gray-800 mb-2">Mic Testing Lab 🎤</h2>
        <p className="text-gray-500 text-sm font-medium mb-8">Tap karo, English bolo, aur dekho.</p>

        {/* Display Area for Spoken Text */}
        <div className="bg-gray-50 min-h-[120px] rounded-2xl p-4 border-2 border-gray-200 mb-8 flex items-center justify-center relative">
          {spokenText ? (
            <p className="text-lg font-bold text-gray-800">{spokenText}</p>
          ) : (
            <p className="text-gray-400 text-sm uppercase tracking-widest font-black">
              {isListening ? "Listening..." : "Text yahan aayega..."}
            </p>
          )}
          
          {isListening && (
            <div className="absolute top-3 right-3 flex gap-1">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            </div>
          )}
        </div>

        {/* Display Area for Errors (Agar aaye toh) */}
        {errorMsg && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-6 text-sm flex items-center justify-center gap-2 font-bold border border-red-200">
            <AlertCircle size={18} />
            {errorMsg}
          </div>
        )}

        {/* Mic Control Button */}
        <button
          onClick={toggleListening}
          className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
            isListening 
              ? 'bg-red-500 text-white scale-110 shadow-red-500/50' 
              : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105'
          }`}
        >
          {isListening ? <MicOff size={32} /> : <Mic size={32} />}
        </button>

        <p className="mt-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
          {isListening ? "Tap to Stop" : "Tap to Speak"}
        </p>

      </div>
    </div>
  );
}