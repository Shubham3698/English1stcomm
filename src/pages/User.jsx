import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import PremiumSoundFeature from "../components/PremiumSoundFeature";

export default function EnglishAppUser() {
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: "", email: "" });
  const [savedWords, setSavedWords] = useState([]);
  const [filter, setFilter] = useState("hard"); 
  const [loading, setLoading] = useState(true);
  const [isPremiumUser, setIsPremiumUser] = useState(localStorage.getItem("eng_isPremium") === "true");

  const [isPracticeMode, setIsPracticeMode] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMeaning, setShowMeaning] = useState(false);
  const [tick, setTick] = useState(0);

  const API_URL = window.location.hostname === "localhost" 
    ? "http://localhost:3000" : "https://serdeptry1st.onrender.com";

  const speakWord = (word) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    const email = localStorage.getItem("eng_userEmail");
    const name = localStorage.getItem("eng_userName");
    const premium = localStorage.getItem("eng_isPremium") === "true";

    if (!email) {
      navigate("/");
    } else {
      setUser({ name: name || "Learner", email: email });
      setIsPremiumUser(premium);
      fetchSavedWords(email);
    }
  }, [navigate]);

  useEffect(() => {
    const timer = setInterval(() => setTick(prev => prev + 1), 5000); 
    return () => clearInterval(timer);
  }, []);

  const fetchSavedWords = async (email) => {
    try {
      const res = await fetch(`${API_URL}/api/english-posts/saved?email=${email}`);
      const data = await res.json();
      setSavedWords(Array.isArray(data) ? data : []);
    } catch (err) {
      setSavedWords([]);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 THE MASTER LOGIC: Decks ko todna aur Individual Words filter/sort karna
  const getFinalDisplayList = () => {
    if (!Array.isArray(savedWords)) return [];

    const allWords = savedWords.flatMap(post => {
      // 1. Agar Smart Deck (vocabData) hai
      if (post.vocabData && post.vocabData.length > 0) {
        return post.vocabData
          .filter(wordItem => {
            const stat = wordItem.wordStats?.find(s => s.email === user.email);
            if (!stat || stat.level !== filter) return false;
            // Practice mode mein sirf pending words dikhao
            if (isPracticeMode && stat.nextReview) {
              return new Date(stat.nextReview).getTime() <= new Date().getTime();
            }
            return true;
          })
          .map(wordItem => ({
            ...wordItem,
            parentPostId: post._id,
            isDeckItem: true,
            // Sort ke liye timestamp nikaalna
            sortTime: wordItem.wordStats?.find(s => s.email === user.email)?.nextReview || post.createdAt
          }));
      }
      
      // 2. Fallback: Purana Single Word system
      const postStat = post.userStats?.find(s => s.email === user.email);
      if (postStat && postStat.level === filter) {
        if (isPracticeMode && postStat.nextReview) {
          if (new Date(postStat.nextReview).getTime() > new Date().getTime()) return [];
        }
        return [{
          word: post.word,
          meaning: post.meaning,
          _id: post._id,
          parentPostId: post._id,
          isDeckItem: false,
          sortTime: postStat.nextReview || post.createdAt
        }];
      }
      return [];
    });

    // 🔥 SORTING: Naya word sabse upar (Latest sortTime first)
    return allWords.sort((a, b) => new Date(b.sortTime) - new Date(a.sortTime));
  };

  const finalDisplayList = getFinalDisplayList();

  const handleReview = async (wordId, parentPostId, intervalType) => {
    let nextReviewDate = new Date();
    if (intervalType === 'again') nextReviewDate.setMinutes(nextReviewDate.getMinutes() + 1);
    else if (intervalType === 'hard') nextReviewDate.setMinutes(nextReviewDate.getMinutes() + 6);
    else if (intervalType === 'good') nextReviewDate.setMinutes(nextReviewDate.getMinutes() + 10);
    else if (intervalType === 'easy') nextReviewDate.setDate(nextReviewDate.getDate() + 3);

    try {
      // Targeted URL based on deck or single post
      const isSingle = finalDisplayList[currentIndex]?.isDeckItem === false;
      const endpoint = isSingle 
        ? `${API_URL}/api/english-posts/update-stat/${parentPostId}`
        : `${API_URL}/api/english-posts/update-word-stat/${parentPostId}/${wordId}`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, level: filter, nextReview: nextReviewDate })
      });

      if (res.ok) {
        if (currentIndex < finalDisplayList.length - 1) {
          setCurrentIndex(currentIndex + 1);
          setShowMeaning(false);
        } else {
          setIsPracticeMode(false);
          toast.success("Review Session Complete! 🏆");
          fetchSavedWords(user.email); 
        }
      }
    } catch (err) { toast.error("Sync Failed"); }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 font-sans pb-24 text-black">
      
      {isPracticeMode ? (
        /* 🎯 FLASHCARD PRACTICE UI */
        <div className="w-full max-w-md flex flex-col items-center mt-10 animate-in fade-in zoom-in duration-500">
          <div className="flex flex-col items-center mb-10">
             <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Targeting: {filter}</span>
             <span className="text-[12px] font-black mt-2">{currentIndex + 1} / {finalDisplayList.length}</span>
          </div>
          
          <div className="w-full relative">
            <div 
                onClick={() => setShowMeaning(!showMeaning)}
                className="w-full aspect-[4/5] bg-white rounded-[3.5rem] shadow-xl flex flex-col items-center justify-center p-10 cursor-pointer border border-gray-100"
            >
                <h2 className="text-5xl font-black text-gray-900 uppercase tracking-tighter italic text-center leading-tight">
                   {finalDisplayList[currentIndex]?.word}
                </h2>
                
                {showMeaning ? (
                   <p className="mt-8 text-2xl font-black text-red-500 uppercase italic text-center animate-in slide-in-from-top-4">
                     {finalDisplayList[currentIndex]?.meaning}
                   </p>
                ) : (
                   <p className="mt-6 text-[8px] font-black text-gray-300 uppercase tracking-widest">Tap to reveal</p>
                )}
            </div>

            <div className="absolute top-8 right-8">
              <PremiumSoundFeature isPremiumUser={isPremiumUser}>
                <button onClick={(e) => { e.stopPropagation(); speakWord(finalDisplayList[currentIndex]?.word); }} className="w-14 h-14 bg-red-500 text-white rounded-full shadow-lg flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7"><path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.5A2.25 2.25 0 002.25 9.75v4.5a2.25 2.25 0 002.25 2.25h1.94l4.5 4.5c.944.945 2.56.276 2.56-1.06V4.06z" /></svg>
                </button>
              </PremiumSoundFeature>
            </div>
          </div>

          {showMeaning && (
            <div className="grid grid-cols-2 gap-3 mt-12 w-full px-2">
              <button onClick={() => handleReview(finalDisplayList[currentIndex]?._id, finalDisplayList[currentIndex]?.parentPostId, 'again')} className="p-5 bg-black text-white rounded-3xl font-black uppercase text-[10px]">Again</button>
              <button onClick={() => handleReview(finalDisplayList[currentIndex]?._id, finalDisplayList[currentIndex]?.parentPostId, 'hard')} className="p-5 bg-orange-500 text-white rounded-3xl font-black uppercase text-[10px]">Hard</button>
              <button onClick={() => handleReview(finalDisplayList[currentIndex]?._id, finalDisplayList[currentIndex]?.parentPostId, 'good')} className="p-5 bg-blue-500 text-white rounded-3xl font-black uppercase text-[10px]">Good</button>
              <button onClick={() => handleReview(finalDisplayList[currentIndex]?._id, finalDisplayList[currentIndex]?.parentPostId, 'easy')} className="p-5 bg-green-500 text-white rounded-3xl font-black uppercase text-[10px]">Easy</button>
            </div>
          )}
        </div>
      ) : (
        /* 👤 PROFILE & VAULT UI */
        <>
          <div className="w-full max-w-md bg-white rounded-[3rem] shadow-sm p-10 border border-gray-100 text-center mt-4">
            <div className="relative w-24 h-24 mx-auto mb-6">
               <div className="w-full h-full bg-gradient-to-tr from-red-600 to-orange-400 text-white rounded-full flex items-center justify-center text-4xl font-black shadow-xl shadow-red-200">
                 {user.name.charAt(0).toUpperCase()}
               </div>
               {isPremiumUser && <span className="absolute -bottom-1 -right-1 bg-yellow-400 text-[8px] font-black px-2 py-1 rounded-full border-2 border-white shadow-sm">PRO</span>}
            </div>
            
            <h1 className="text-3xl font-black text-gray-800 tracking-tighter italic">Hey, {user.name.split(' ')[0]}!</h1>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2 mb-8">{user.email}</p>

            <div className="flex gap-2 mb-3">
              <button onClick={() => navigate("/community")} className="flex-1 py-4 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-md">Explore Hub</button>
              <button onClick={() => navigate("/my-posts")} className="flex-1 py-4 border-2 border-black rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all">My Uploads</button>
            </div>

            <button 
              onClick={() => {
                if (finalDisplayList.length > 0) setIsPracticeMode(true);
                else toast.error("No words due for review!");
              }}
              className="w-full p-5 bg-red-50 text-red-600 rounded-[2rem] font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 active:scale-95 transition-all border border-red-100"
            >
              🎓 START TARGETING {filter} ({finalDisplayList.length})
            </button>
          </div>

          <div className="w-full max-w-md mt-12 px-2">
            <div className="flex items-center justify-between mb-6 px-2">
              <h3 className="text-[12px] font-black text-gray-900 uppercase tracking-widest italic">Personal Vault</h3>
              <span className="text-[9px] font-black text-gray-300 uppercase">{finalDisplayList.length} words</span>
            </div>

            <div className="flex bg-gray-200/50 p-1.5 rounded-[2rem] mb-8 shadow-inner overflow-x-auto no-scrollbar">
              {['hard', 'dailyUse', 'heard', 'easy'].map((lvl) => (
                <button 
                   key={lvl}
                   onClick={() => { setFilter(lvl); setCurrentIndex(0); }} 
                   className={`flex-1 px-4 py-3 rounded-[1.5rem] text-[9px] font-black uppercase transition-all ${filter === lvl ? 'bg-white shadow-md text-red-500 scale-105' : 'text-gray-400'}`}
                >
                  {lvl === 'dailyUse' ? 'Daily' : lvl}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex flex-col items-center py-20 gap-4">
                 <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                 <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Syncing Records...</p>
              </div>
            ) : finalDisplayList.length > 0 ? (
              <div className="space-y-4">
                {finalDisplayList.map((item, idx) => (
                  <div key={`${item.parentPostId}-${idx}`} 
                    onClick={() => navigate(`/community?postId=${item.parentPostId}`)}
                    className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center justify-between group active:scale-95 transition-all cursor-pointer relative overflow-hidden"
                  >
                    <div className="flex flex-col relative z-10">
                      <h4 className="text-2xl font-black text-gray-800 uppercase tracking-tighter italic group-hover:text-red-500 transition-colors">
                        {item.word}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                         <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest italic">Hub Record</span>
                         {item.isDeckItem && <span className="text-[7px] font-black bg-blue-50 text-blue-500 px-2 py-0.5 rounded-full">DECK WORD</span>}
                      </div>
                    </div>
                    <p className={`text-sm font-black italic uppercase relative z-10 ${filter === 'hard' ? 'text-red-500' : filter === 'dailyUse' ? 'text-blue-500' : filter === 'heard' ? 'text-orange-500' : 'text-green-500'}`}>
                       {item.meaning}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white/40 border-4 border-dashed border-gray-100 rounded-[3rem] py-16 flex flex-col items-center">
                <div className="text-4xl mb-4 grayscale opacity-20">📂</div>
                <p className="text-gray-400 font-black text-[10px] uppercase tracking-widest italic">Vault Empty for Now</p>
                <button onClick={() => navigate("/community")} className="mt-4 text-red-500 font-black text-[10px] uppercase tracking-widest border-b-2 border-red-500 pb-1">Refill Deck</button>
              </div>
            )}
          </div>
        </>
      )}

      <p className="mt-20 text-gray-300 text-[8px] font-black uppercase tracking-[0.4em] opacity-50">Dameeto SRS Engine v2.0</p>
    </div>
  );
}