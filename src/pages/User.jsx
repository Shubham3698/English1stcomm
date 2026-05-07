import { useEffect, useState, useMemo } from "react";
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
    if (!email) return navigate("/");
    setUser({ name: name || "Learner", email });
    fetchSavedWords(email);
  }, [navigate]);

  const fetchSavedWords = async (email) => {
    setLoading(true);
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

  const allFilteredWords = useMemo(() => {
    if (!Array.isArray(savedWords)) return [];
    const extracted = savedWords.flatMap(post => {
      if (post.vocabData?.length > 0) {
        return post.vocabData
          .filter(item => item.wordStats?.some(s => s.email === user.email && s.level === filter))
          .map(item => ({
            ...item,
            _id: item._id,
            parentPostId: post._id,
            isDeckItem: true,
            sortTime: item.wordStats?.find(s => s.email === user.email)?.nextReview || post.createdAt
          }));
      }
      const stat = post.userStats?.find(s => s.email === user.email);
      if (stat && stat.level === filter) {
        return [{
          word: post.word, meaning: post.meaning, _id: post._id,
          parentPostId: post._id, isDeckItem: false,
          sortTime: stat.nextReview || post.createdAt
        }];
      }
      return [];
    });
    return extracted.sort((a, b) => new Date(b.sortTime) - new Date(a.sortTime));
  }, [savedWords, filter, user.email]);

  const practiceDueList = useMemo(() => {
    return allFilteredWords.filter(item => {
      const stat = item.isDeckItem 
        ? item.wordStats?.find(s => s.email === user.email)
        : savedWords.find(p => p._id === item.parentPostId)?.userStats?.find(s => s.email === user.email);
      if (!stat || !stat.nextReview) return true;
      return new Date(stat.nextReview).getTime() <= new Date().getTime();
    });
  }, [allFilteredWords, isPracticeMode]);

  const handleReview = async (intervalType) => {
    const currentItem = practiceDueList[currentIndex];
    if (!currentItem) return;
    let nextReviewDate = new Date();
    const intervals = { again: 1, hard: 6, good: 10, easy: 4320 };
    nextReviewDate.setMinutes(nextReviewDate.getMinutes() + intervals[intervalType]);

    try {
      const endpoint = !currentItem.isDeckItem
        ? `${API_URL}/api/english-posts/update-stat/${currentItem.parentPostId}`
        : `${API_URL}/api/english-posts/update-word-stat/${currentItem.parentPostId}/${currentItem._id}`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, level: filter, nextReview: nextReviewDate })
      });

      if (res.ok) {
        if (currentIndex < practiceDueList.length - 1) {
          setCurrentIndex(prev => prev + 1);
          setShowMeaning(false);
        } else {
          setIsPracticeMode(false);
          toast.success("Review Done! 🏆");
          fetchSavedWords(user.email);
          setCurrentIndex(0);
        }
      }
    } catch (err) { toast.error("Sync Failed"); }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 font-sans pb-24 text-black">
      
      {isPracticeMode ? (
        <div className="w-full max-w-md flex flex-col items-center mt-10 animate-in fade-in zoom-in duration-500">
           {/* Card Practice Logic (Wahi purana mast wala) */}
           <div className="text-center mb-10">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Recall: {filter}</span>
              <div className="mt-2 px-4 py-1 bg-red-100 text-red-600 rounded-full text-[12px] font-black">{currentIndex + 1} / {practiceDueList.length}</div>
           </div>
           
           <div className="w-full relative" onClick={() => setShowMeaning(!showMeaning)}>
              <div className="w-full aspect-[4/5] bg-white rounded-[4rem] shadow-2xl flex flex-col items-center justify-center p-12 cursor-pointer border-2 border-gray-50 active:scale-95 transition-all">
                  <h2 className="text-5xl font-black text-gray-900 uppercase italic text-center">{practiceDueList[currentIndex]?.word}</h2>
                  {showMeaning ? <p className="mt-10 text-2xl font-black text-red-500 italic uppercase animate-in slide-in-from-top-4">{practiceDueList[currentIndex]?.meaning}</p> : <p className="mt-10 text-[9px] font-black text-gray-300 uppercase tracking-widest">Tap to reveal</p>}
              </div>
              <div className="absolute top-8 right-8">
                <PremiumSoundFeature isPremiumUser={isPremiumUser}>
                  <button onClick={(e) => { e.stopPropagation(); speakWord(practiceDueList[currentIndex]?.word); }} className="w-14 h-14 bg-red-500 text-white rounded-full shadow-lg flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7"><path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.5A2.25 2.25 0 002.25 9.75v4.5a2.25 2.25 0 002.25 2.25h1.94l4.5 4.5c.944.945 2.56.276 2.56-1.06V4.06z" /></svg></button>
                </PremiumSoundFeature>
              </div>
           </div>

           <div className="grid grid-cols-2 gap-4 mt-12 w-full px-2">
             {showMeaning ? ['again', 'hard', 'good', 'easy'].map(lvl => (
               <button key={lvl} onClick={() => handleReview(lvl)} className={`p-5 rounded-3xl font-black uppercase text-[10px] text-white shadow-lg active:scale-95 transition-all ${lvl==='again'?'bg-black':lvl==='hard'?'bg-orange-500':lvl==='good'?'bg-blue-500':'bg-green-500'}`}>{lvl}</button>
             )) : <button onClick={() => setIsPracticeMode(false)} className="col-span-2 text-gray-300 text-[10px] font-black uppercase tracking-widest underline underline-offset-8">End Session</button>}
           </div>
        </div>
      ) : (
        <>
          {/* 👤 PROFILE CARD - Buttons are BACK! */}
          <div className="w-full max-w-md bg-white rounded-[3rem] shadow-sm p-10 border border-gray-100 text-center mt-4">
            <div className="relative w-24 h-24 mx-auto mb-6">
               <div className="w-full h-full bg-gradient-to-tr from-red-600 to-orange-400 text-white rounded-full flex items-center justify-center text-4xl font-black shadow-xl shadow-red-200">
                 {user.name.charAt(0).toUpperCase()}
               </div>
               {isPremiumUser && <span className="absolute -bottom-1 -right-1 bg-yellow-400 text-[8px] font-black px-2 py-1 rounded-full border-2 border-white shadow-sm">PRO</span>}
            </div>
            
            <h1 className="text-3xl font-black text-gray-800 italic">Hey, {user.name.split(' ')[0]}!</h1>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2 mb-8">{user.email}</p>

            {/* 🔥 YE RAHE TERE BUTTONS! 🔥 */}
            <div className="flex gap-2 mb-6">
              <button onClick={() => navigate("/community")} className="flex-1 py-4 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 shadow-md">Explore Hub</button>
              <button onClick={() => navigate("/my-posts")} className="flex-1 py-4 border-2 border-black rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95">My Uploads</button>
            </div>

            <button 
              onClick={() => practiceDueList.length > 0 ? setIsPracticeMode(true) : toast.error("All caught up!")}
              className="w-full p-5 bg-red-50 text-red-600 rounded-[2rem] font-black uppercase tracking-widest text-[10px] border border-red-100 active:scale-95"
            >
              🎓 START {filter.toUpperCase()} PRACTICE ({practiceDueList.length})
            </button>
          </div>

          <div className="w-full max-w-md mt-12 px-2">
            <div className="flex bg-gray-200/50 p-1.5 rounded-[2rem] mb-8 shadow-inner overflow-x-auto no-scrollbar">
              {['hard', 'dailyUse', 'heard', 'easy'].map((lvl) => (
                <button key={lvl} onClick={() => { setFilter(lvl); setCurrentIndex(0); }} className={`flex-1 px-4 py-3 rounded-[1.5rem] text-[9px] font-black uppercase transition-all ${filter === lvl ? 'bg-white shadow-md text-red-500 scale-105' : 'text-gray-400'}`}>
                  {lvl === 'dailyUse' ? 'Daily' : lvl}
                </button>
              ))}
            </div>

            {loading ? <div className="py-20 text-center text-[10px] font-black text-gray-300 animate-pulse uppercase tracking-widest">Syncing Records...</div> : allFilteredWords.length > 0 ? (
              <div className="space-y-4">
                {allFilteredWords.map((item, idx) => (
                  <div key={`${item.parentPostId}-${idx}`} onClick={() => navigate(`/community?postId=${item.parentPostId}`)} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center justify-between group active:scale-95 transition-all cursor-pointer">
                    <div className="flex flex-col">
                      <h4 className="text-2xl font-black text-gray-800 uppercase italic group-hover:text-red-500 transition-colors">{item.word}</h4>
                      <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest italic mt-1">{item.isDeckItem ? 'DECK WORD' : 'HUB RECORD'}</span>
                    </div>
                    <p className={`text-sm font-black italic uppercase ${filter === 'hard' ? 'text-red-500' : 'text-blue-500'}`}>{item.meaning}</p>
                  </div>
                ))}
              </div>
            ) : <div className="py-16 flex flex-col items-center"><p className="text-gray-400 font-black text-[10px] uppercase tracking-widest italic">Vault Empty</p></div>}
          </div>
        </>
      )}
      <p className="mt-20 text-gray-300 text-[8px] font-black uppercase tracking-[0.4em] opacity-50">Dameeto Engine v2.0</p>
    </div>
  );
}