import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import PremiumSoundFeature from "../components/PremiumSoundFeature";
import WordMatchGame from "../components/WordMatchGame";

export default function EnglishAppUser() {
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: "", email: "" });
  const [vaultData, setVaultData] = useState(null);
  const [filter, setFilter] = useState("hard");
  const [loading, setLoading] = useState(true);
  const [isPremiumUser] = useState(localStorage.getItem("eng_isPremium") === "true");

  const [isPracticeMode, setIsPracticeMode] = useState(false);
  const [practiceType, setPracticeType] = useState("cards");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMeaning, setShowMeaning] = useState(false);

  const [movingId, setMovingId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCat, setNewCat] = useState("");

  const API_URL = window.location.hostname === "localhost"
    ? "http://localhost:3000" : "https://serdeptry1st.onrender.com";

  const fetchVault = async (email) => {
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/personal-vault/my-vault?email=${email}&t=${Date.now()}`);
      const data = await res.json();
      setVaultData(data);
    } catch (err) {
      toast.error("Vault Refresh Failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const email = localStorage.getItem("eng_userEmail");
    const name = localStorage.getItem("eng_userName");
    if (!email) return navigate("/");
    setUser({ name: name || "Learner", email });
    fetchVault(email);
  }, [navigate]);

  // 🔥 CORE ENGINE: Filtering & SRS Sorting
  const allFilteredWords = useMemo(() => {
    if (!vaultData || !vaultData.vaultItems) return [];
    
    return vaultData.vaultItems
      .filter(item => item.category.toLowerCase() === filter.toLowerCase())
      .map(item => ({
        ...item,
        _id: item.wordId || item._id,
        // Ensure sortTime and reviewDate exist for the engine
        sortTime: item.nextReview || item.addedAt || item.createdAt
      }))
      .sort((a, b) => new Date(b.sortTime) - new Date(a.sortTime));
  }, [vaultData, filter]);

  // 🔥 SRS LOGIC: Wahi card dikhao jo "Due" hain
  const practiceDueList = useMemo(() => {
    const now = new Date().getTime();
    return allFilteredWords.filter(item => {
      // Agar nextReview nahi hai toh matlab naya word hai, practice mein dikhao
      if (!item.nextReview) return true;
      // Agar nextReview time nikal gaya hai (Due ho gaya hai) toh dikhao
      return new Date(item.nextReview).getTime() <= now;
    });
  }, [allFilteredWords]);

  const handleReview = async (intervalType) => {
    const currentItem = practiceDueList[currentIndex];
    if (!currentItem) return;

    let nextReviewDate = new Date();
    const intervals = { again: 1, hard: 6, good: 10, easy: 4320 }; // minutes
    nextReviewDate.setMinutes(nextReviewDate.getMinutes() + intervals[intervalType]);

    try {
      // Update Hub and Vault simultaneously via backend
      const res = await fetch(`${API_URL}/api/english-posts/update-word-stat/${currentItem.parentPostId}/${currentItem.wordId}`, {
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
          toast.success("Great job! Session complete. 🏆");
          fetchVault(user.email);
          setCurrentIndex(0);
          setShowMeaning(false);
        }
      }
    } catch (err) {
      toast.error("Sync Failed");
    }
  };

  const handleMoveWord = async (item, targetLvl) => {
    const tid = toast.loading(`Moving to ${targetLvl}...`);
    try {
      const res = await fetch(`${API_URL}/api/personal-vault/move-word`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, wordId: item.wordId, newCategory: targetLvl })
      });
      if (res.ok) {
        toast.success("Moved!", { id: tid });
        setMovingId(null);
        fetchVault(user.email);
      }
    } catch (err) { toast.error("Move Failed"); }
  };

  const handleAddCategory = async () => {
    if (!newCat.trim()) return;
    try {
      const res = await fetch(`${API_URL}/api/personal-vault/add-category`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, categoryName: newCat })
      });
      if (res.ok) {
        toast.success("Category Added!");
        setNewCat(""); setShowAddModal(false);
        fetchVault(user.email);
      }
    } catch (err) { toast.error("Failed"); }
  };

  const speakWord = (word) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  const categories = useMemo(() => 
    vaultData?.customCategories?.length > 0 ? vaultData.customCategories : ['hard', 'dailyUse', 'heard', 'easy'], 
  [vaultData]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 font-sans pb-24 text-black">
      {isPracticeMode ? (
        <div className="w-full max-w-md flex flex-col items-center mt-10 animate-in fade-in zoom-in duration-500">
          {practiceType === "matching" ? (
            <WordMatchGame 
              data={allFilteredWords.slice(0, 8)} 
              onComplete={() => { setIsPracticeMode(false); fetchVault(user.email); }} 
            />
          ) : (
            <>
              <div className="text-center mb-10">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">SRS ACTIVE RECALL</span>
                <div className="mt-2 px-4 py-1 bg-red-100 text-red-600 rounded-full text-[12px] font-black">{currentIndex + 1} / {practiceDueList.length}</div>
              </div>
              <div className="w-full relative" onClick={() => setShowMeaning(!showMeaning)}>
                <div className="w-full aspect-[4/5] bg-white rounded-[4rem] shadow-2xl flex flex-col items-center justify-center p-12 cursor-pointer border-2 border-gray-50 active:scale-95 transition-all">
                  <h2 className="text-5xl font-black text-gray-900 uppercase italic text-center leading-tight tracking-tighter">{practiceDueList[currentIndex]?.word}</h2>
                  {showMeaning ? (
                    <p className="mt-10 text-2xl font-black text-red-500 italic uppercase animate-in slide-in-from-top-4 text-center">{practiceDueList[currentIndex]?.meaning}</p>
                  ) : (
                    <p className="mt-10 text-[9px] font-black text-gray-300 uppercase tracking-widest animate-pulse">Tap to reveal</p>
                  )}
                </div>
                <div className="absolute top-8 right-8">
                  <PremiumSoundFeature isPremiumUser={isPremiumUser}>
                    <button onClick={(e) => { e.stopPropagation(); speakWord(practiceDueList[currentIndex]?.word); }} className="w-14 h-14 bg-red-500 text-white rounded-full shadow-lg flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7"><path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.5A2.25 2.25 0 002.25 9.75v4.5a2.25 2.25 0 002.25 2.25h1.94l4.5 4.5c.944.945 2.56.276 2.56-1.06V4.06z" /></svg>
                    </button>
                  </PremiumSoundFeature>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-12 w-full px-2">
                {showMeaning ? ['again', 'hard', 'good', 'easy'].map(lvl => (
                  <button key={lvl} onClick={() => handleReview(lvl)} className={`p-5 rounded-3xl font-black uppercase text-[10px] text-white shadow-lg active:scale-95 transition-all ${lvl === 'again' ? 'bg-black' : lvl === 'hard' ? 'bg-orange-500' : lvl === 'good' ? 'bg-blue-500' : 'bg-green-500'}`}>{lvl}</button>
                )) : (
                  <button onClick={() => { setIsPracticeMode(false); setShowMeaning(false); }} className="col-span-2 text-gray-300 text-[10px] font-black uppercase tracking-widest underline underline-offset-8">End Session</button>
                )}
              </div>
            </>
          )}
        </div>
      ) : (
        <>
          <div className="w-full max-w-md bg-white rounded-[3rem] shadow-sm p-10 border border-gray-100 text-center mt-4">
            <div className="relative w-24 h-24 mx-auto mb-6">
               <div className="w-full h-full bg-gradient-to-tr from-red-600 to-orange-400 text-white rounded-full flex items-center justify-center text-4xl font-black shadow-xl">
                 {user.name.charAt(0).toUpperCase()}
               </div>
               {isPremiumUser && <span className="absolute -bottom-1 -right-1 bg-yellow-400 text-[8px] font-black px-2 py-1 rounded-full border-2 border-white shadow-sm">PRO</span>}
            </div>
            <h1 className="text-3xl font-black text-gray-800 italic tracking-tighter">Hey, {user.name.split(' ')[0]}!</h1>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2 mb-8">{user.email}</p>
            <div className="flex gap-2 mb-6">
              <button onClick={() => navigate("/community")} className="flex-1 py-4 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 shadow-md">Explore Hub</button>
              <button onClick={() => navigate("/my-posts")} className="flex-1 py-4 border-2 border-black rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95">My Uploads</button>
            </div>
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => {
                   if (practiceDueList.length > 0) { setPracticeType("cards"); setIsPracticeMode(true); } 
                   else toast.error("All caught up! 🏆");
                }}
                className="w-full p-5 bg-red-50 text-red-600 rounded-[2rem] font-black uppercase tracking-widest text-[10px] border border-red-100 active:scale-95"
              >
                🎓 START PRACTICE ({practiceDueList.length})
              </button>
              <button 
                onClick={() => {
                   if (allFilteredWords.length >= 3) { setPracticeType("matching"); setIsPracticeMode(true); } 
                   else toast.error("Add more words! 🧩");
                }}
                className="w-full p-4 bg-gray-50 text-gray-500 rounded-[2rem] font-black uppercase tracking-widest text-[9px] border border-gray-100 active:scale-95"
              >
                🧩 MATCHING GAME ({allFilteredWords.length})
              </button>
            </div>
          </div>

          <div className="w-full max-w-md mt-12 px-2">
            <div className="flex items-center gap-2 mb-8 overflow-x-auto no-scrollbar pb-2">
              <div className="flex bg-gray-200/50 p-1.5 rounded-[2rem] shadow-inner">
                {categories.map((lvl) => (
                  <button key={lvl} onClick={() => { setFilter(lvl); setCurrentIndex(0); }} className={`px-5 py-3 rounded-[1.5rem] text-[9px] font-black uppercase transition-all whitespace-nowrap ${filter.toLowerCase() === lvl.toLowerCase() ? 'bg-white shadow-md text-red-500 scale-105' : 'text-gray-400'}`}>
                    {lvl === 'dailyUse' ? 'Daily' : lvl}
                  </button>
                ))}
              </div>
              <button onClick={() => setShowAddModal(true)} className="w-10 h-10 bg-black text-white rounded-full flex-shrink-0 flex items-center justify-center shadow-lg active:scale-90 font-bold">+</button>
            </div>

            {loading ? (
              <div className="py-20 text-center text-[10px] font-black text-gray-300 animate-pulse uppercase tracking-widest">Syncing Vault...</div>
            ) : allFilteredWords.length > 0 ? (
              <div className="space-y-4">
                {allFilteredWords.map((item) => (
                  <div key={item.wordId} className="relative group">
                    <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center justify-between active:scale-95 transition-all">
                      <div onClick={() => navigate(`/community?postId=${item.parentPostId}`)} className="flex flex-col cursor-pointer">
                        <h4 className="text-2xl font-black text-gray-800 uppercase italic tracking-tighter leading-none mb-1">{item.word}</h4>
                        <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest italic">{filter}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="text-sm font-black italic uppercase text-red-500">{item.meaning}</p>
                        <button onClick={(e) => { e.stopPropagation(); setMovingId(movingId === item.wordId ? null : item.wordId); }} className="p-2 bg-gray-50 rounded-full">
                          <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeWidth="3" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>
                        </button>
                      </div>
                    </div>
                    {movingId === item.wordId && (
                      <div className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-[2.5rem] z-10 flex flex-wrap items-center justify-center gap-2 p-4 animate-in fade-in zoom-in duration-200">
                         {categories.map(cat => (
                           <button key={cat} onClick={() => handleMoveWord(item, cat)} className={`px-3 py-2 text-[8px] font-black rounded-xl uppercase ${filter.toLowerCase() === cat.toLowerCase() ? 'hidden' : 'bg-black text-white'}`}>{cat}</button>
                         ))}
                         <button onClick={() => setMovingId(null)} className="absolute top-4 right-6 text-gray-300 font-black text-[10px]">X</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 flex flex-col items-center"><p className="text-gray-400 font-black text-[10px] uppercase tracking-widest italic">Vault Empty</p></div>
            )}
          </div>
        </>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-xs rounded-[2.5rem] p-8 shadow-2xl">
            <h3 className="text-xl font-black italic uppercase mb-4 tracking-tighter">New Collection</h3>
            <input autoFocus className="w-full p-4 bg-gray-100 rounded-2xl mb-4 font-black uppercase text-[10px] outline-none" value={newCat} onChange={(e) => setNewCat(e.target.value)} placeholder="e.g. SLANGS..." />
            <div className="flex gap-2">
              <button onClick={() => setShowAddModal(false)} className="flex-1 py-3 text-[10px] font-black uppercase text-gray-400">Cancel</button>
              <button onClick={handleAddCategory} className="flex-1 py-3 bg-red-500 text-white rounded-xl text-[10px] font-black uppercase shadow-lg">Create</button>
            </div>
          </div>
        </div>
      )}
      <p className="mt-20 text-gray-300 text-[8px] font-black uppercase tracking-[0.4em] opacity-50">Dameeto Engine v3.0 • Hybrid SRS</p>
    </div>
  );
}