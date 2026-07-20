import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast"; 
import PremiumSoundFeature from "../components/PremiumSoundFeature";
import WordMatchGame from "../components/WordMatchGame";
import { 
  Play, 
  Volume2, 
  Trophy, 
  BrainCircuit, 
  ChevronRight, 
  X, 
  Plus, 
  Crown, 
  FolderOpen,
  ArrowRightLeft
} from "lucide-react";

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
        sortTime: item.nextReview || item.addedAt || item.createdAt
      }))
      .sort((a, b) => new Date(b.sortTime) - new Date(a.sortTime));
  }, [vaultData, filter]);

  // 🔥 SRS LOGIC: Due cards
  const practiceDueList = useMemo(() => {
    const now = new Date().getTime();
    return allFilteredWords.filter(item => {
      if (!item.nextReview) return true;
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

  // 🔥 CHECK ADMIN EMAIL
  const isAdmin = user.email === "pandey0shubham3698@gmail.com";

  return (
    // 🔥 NEW THEME: Murrey (#F2EFE7) Light Base with Alabaster (#8B004A)
    <div className="min-h-screen bg-[#F2EFE7] flex flex-col items-center p-4 font-sans pb-24 text-gray-900 transition-colors duration-500">
      <Toaster 
        position="top-center" 
        toastOptions={{ style: { background: '#8B004A', color: '#F2EFE7', border: '1px solid #E01A76', fontWeight: 'bold' } }} 
      />

      {isPracticeMode ? (
        <div className="w-full max-w-md flex flex-col items-center mt-6 md:mt-10 animate-fade-in">
          {practiceType === "matching" ? (
            <WordMatchGame 
              data={allFilteredWords.slice(0, 8)} 
              onComplete={() => { setIsPracticeMode(false); fetchVault(user.email); }} 
            />
          ) : (
            <>
              {/* Header Status */}
              <div className="text-center mb-8 w-full flex flex-col items-center">
                <span className="text-[10px] font-black text-[#8B004A]/60 uppercase tracking-[0.2em] flex items-center gap-2">
                  <BrainCircuit size={16} /> SRS Active Recall
                </span>
                <div className="mt-3 px-4 py-1.5 bg-[#E01A76]/10 text-[#E01A76] border border-[#E01A76]/20 rounded-full text-xs font-black tracking-widest shadow-sm">
                  {currentIndex + 1} / {practiceDueList.length}
                </div>
              </div>

              {/* Flashcard */}
              <div className="w-full relative group perspective-1000" onClick={() => setShowMeaning(!showMeaning)}>
                <div className={`w-full aspect-[4/5] bg-white border-2 border-[#8B004A]/10 rounded-[2.5rem] shadow-xl flex flex-col items-center justify-center p-12 cursor-pointer active:scale-[0.98] transition-all duration-300 relative overflow-hidden ${showMeaning ? 'border-[#E01A76]/40 shadow-[0_10px_30px_rgba(224,26,118,0.1)]' : ''}`}>
                  
                  {/* Subtle Background Glow */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 bg-[#E01A76]/5 blur-[60px] rounded-full pointer-events-none transition-opacity"></div>

                  <h2 className="text-4xl md:text-5xl font-black text-[#8B004A] capitalize text-center leading-tight tracking-wide z-10 drop-shadow-sm">
                    {practiceDueList[currentIndex]?.word}
                  </h2>
                  
                  {showMeaning ? (
                    <div className="mt-8 animate-fade-in z-10 text-center w-full">
                      <div className="w-12 h-[2px] bg-gray-200 mx-auto mb-6 rounded-full"></div>
                      <p className="text-xl md:text-2xl font-extrabold text-[#E01A76] capitalize leading-relaxed break-words">
                        {practiceDueList[currentIndex]?.meaning}
                      </p>
                    </div>
                  ) : (
                    <p className="mt-12 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] animate-pulse z-10">
                      Tap to reveal
                    </p>
                  )}
                </div>

                {/* Audio Button */}
                <div className="absolute top-6 right-6 z-20">
                  <PremiumSoundFeature isPremiumUser={isPremiumUser}>
                    <button 
                      onClick={(e) => { e.stopPropagation(); speakWord(practiceDueList[currentIndex]?.word); }} 
                      className="w-12 h-12 bg-white hover:bg-[#F2EFE7] border-2 border-gray-100 text-gray-400 hover:text-[#8B004A] hover:border-[#8B004A]/20 rounded-full shadow-sm flex items-center justify-center transition-all active:scale-95"
                    >
                      <Volume2 size={20} strokeWidth={2.5} />
                    </button>
                  </PremiumSoundFeature>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 mt-8 w-full px-1">
                {showMeaning ? (
                  <>
                    <button onClick={() => handleReview('again')} className="p-4 rounded-2xl font-black uppercase text-[10px] tracking-widest bg-red-50 border-2 border-red-100 text-red-500 hover:bg-red-100 hover:border-red-200 transition-all active:scale-95 flex flex-col items-center gap-1 shadow-sm">
                      <span>Again</span><span className="text-[8px] opacity-70">&lt;10m</span>
                    </button>
                    <button onClick={() => handleReview('hard')} className="p-4 rounded-2xl font-black uppercase text-[10px] tracking-widest bg-orange-50 border-2 border-orange-100 text-orange-500 hover:bg-orange-100 hover:border-orange-200 transition-all active:scale-95 flex flex-col items-center gap-1 shadow-sm">
                      <span>Hard</span><span className="text-[8px] opacity-70">1d</span>
                    </button>
                    <button onClick={() => handleReview('good')} className="p-4 rounded-2xl font-black uppercase text-[10px] tracking-widest bg-blue-50 border-2 border-blue-100 text-blue-500 hover:bg-blue-100 hover:border-blue-200 transition-all active:scale-95 flex flex-col items-center gap-1 shadow-sm">
                      <span>Good</span><span className="text-[8px] opacity-70">3d</span>
                    </button>
                    <button onClick={() => handleReview('easy')} className="p-4 rounded-2xl font-black uppercase text-[10px] tracking-widest bg-[#E01A76]/10 border-2 border-[#E01A76]/20 text-[#E01A76] hover:bg-[#E01A76]/20 transition-all active:scale-95 flex flex-col items-center gap-1 shadow-sm">
                      <span>Easy</span><span className="text-[8px] opacity-70">5d+</span>
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => { setIsPracticeMode(false); setShowMeaning(false); }} 
                    className="col-span-2 bg-white border-2 border-gray-200 text-gray-500 hover:text-[#8B004A] hover:bg-gray-50 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] py-4 transition-all shadow-sm active:scale-95"
                  >
                    Abort Session
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      ) : (
        <>
          {/* Dashboard Profile Card */}
          <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-xl shadow-[#8B004A]/5 p-8 border-2 border-[#8B004A]/10 text-center mt-6 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1.5 bg-gradient-to-r from-[#FFB800] via-[#E01A76] to-[#8B004A]"></div>

            <div className="relative w-24 h-24 mx-auto mb-5">
               <div className="w-full h-full bg-[#F2EFE7] border-[3px] border-[#8B004A]/20 text-[#8B004A] rounded-full flex items-center justify-center text-4xl font-black shadow-inner">
                 {user.name.charAt(0).toUpperCase()}
               </div>
               {isPremiumUser && (
                 <span className="absolute -bottom-1 -right-2 bg-[#FFB800] text-[#4A0027] text-[9px] font-black px-2.5 py-0.5 rounded border border-[#E6A600] shadow-md flex items-center gap-1 uppercase tracking-wider">
                   <Crown size={12} /> PRO
                 </span>
               )}
            </div>
            
            <h1 className="text-3xl font-black text-[#8B004A] tracking-wide capitalize drop-shadow-sm">Hey, {user.name.split(' ')[0]}!</h1>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.1em] mt-1.5 mb-8">{user.email}</p>
            
            {/* 🔥 NEW ADMIN BUTTON (Sirf Admin ko dikhega) */}
            {isAdmin && (
              <button 
                onClick={() => navigate("/admin-dashboard")} // Route aap apne hisaab se change kar sakte hain
                className="w-full mb-6 py-3.5 bg-gray-900 hover:bg-black text-[#FFB800] border-2 border-gray-800 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <Crown size={16} /> Admin: Add Lessons
              </button>
            )}

            <div className="flex gap-3 mb-8">
              <button 
                onClick={() => navigate("/community")} 
                className="flex-1 py-3.5 bg-white hover:bg-[#F2EFE7] border-2 border-gray-200 hover:border-[#8B004A]/30 hover:text-[#8B004A] text-gray-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm"
              >
                Explore Hub
              </button>
              <button 
                onClick={() => navigate("/my-posts")} 
                className="flex-1 py-3.5 bg-white hover:bg-[#F2EFE7] border-2 border-gray-200 hover:border-[#8B004A]/30 hover:text-[#8B004A] text-gray-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm"
              >
                My Uploads
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <button 
                onClick={() => {
                   if (practiceDueList.length > 0) { setPracticeType("cards"); setIsPracticeMode(true); } 
                   else toast.success("All caught up! 🏆", { icon: '✨' });
                }}
                className="w-full p-4.5 bg-gradient-to-r from-[#8B004A] to-[#E01A76] hover:scale-[1.02] text-white rounded-2xl font-black uppercase tracking-wider text-[11px] transition-all active:scale-95 shadow-lg shadow-[#8B004A]/20 flex items-center justify-center gap-2 border-none"
              >
                <Play size={16} fill="currentColor" /> Start Practice ({practiceDueList.length})
              </button>
              <button 
                onClick={() => {
                   if (allFilteredWords.length >= 3) { setPracticeType("matching"); setIsPracticeMode(true); } 
                   else toast.error("Add more words! 🧩");
                }}
                className="w-full p-4.5 bg-white hover:bg-[#F2EFE7] text-[#8B004A] border-2 border-[#8B004A]/20 rounded-2xl font-black uppercase tracking-wider text-[11px] transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm"
              >
                <BrainCircuit size={16} /> Matching Game ({allFilteredWords.length})
              </button>
            </div>
          </div>

          {/* Vault Section */}
          <div className="w-full max-w-md mt-10 px-1">
            <div className="flex items-center justify-between mb-4 px-1">
               <h3 className="text-xs font-black text-[#8B004A]/70 uppercase tracking-[0.2em] flex items-center gap-2">
                 <FolderOpen size={16} /> My Vault
               </h3>
               <button 
                 onClick={() => setShowAddModal(true)} 
                 className="text-[10px] bg-white hover:bg-[#F2EFE7] border-2 border-gray-200 hover:border-[#8B004A]/30 text-gray-600 hover:text-[#8B004A] px-3.5 py-2 rounded-lg font-black flex items-center gap-1 transition-all shadow-sm uppercase tracking-wider"
               >
                 <Plus size={14} strokeWidth={3} /> Add
               </button>
            </div>

            {/* Filter Categories */}
            <div className="flex gap-2 mb-6 overflow-x-auto custom-scrollbar pb-2 pt-1">
              {categories.map((lvl) => (
                <button 
                  key={lvl} 
                  onClick={() => { setFilter(lvl); setCurrentIndex(0); }} 
                  className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap shadow-sm
                    ${filter.toLowerCase() === lvl.toLowerCase() 
                      ? 'bg-[#8B004A] border-2 border-[#8B004A] text-white' 
                      : 'bg-white border-2 border-gray-200 text-gray-500 hover:text-[#8B004A] hover:border-[#8B004A]/30 hover:bg-gray-50'}`}
                >
                  {lvl === 'dailyUse' ? 'Daily' : lvl}
                </button>
              ))}
            </div>

            {/* Word List */}
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-4 bg-white rounded-3xl border-2 border-gray-100 shadow-sm">
                <div className="w-8 h-8 border-4 border-[#E01A76] border-t-transparent rounded-full animate-spin"></div>
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Syncing Vault...</div>
              </div>
            ) : allFilteredWords.length > 0 ? (
              <div className="space-y-3 pb-8">
                {allFilteredWords.map((item) => (
                  <div key={item.wordId} className="relative group">
                    <div className="bg-white p-5 rounded-2xl border-2 border-gray-100 hover:border-[#E01A76]/30 flex items-center justify-between transition-all shadow-sm hover:shadow-md">
                      <div onClick={() => navigate(`/community?postId=${item.parentPostId}`)} className="flex flex-col cursor-pointer max-w-[60%]">
                        <h4 className="text-lg font-black text-[#8B004A] capitalize tracking-wide truncate">{item.word}</h4>
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mt-1">{filter}</span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <p className="text-xs font-bold text-[#E01A76] truncate max-w-[90px] text-right">{item.meaning}</p>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setMovingId(movingId === item.wordId ? null : item.wordId); }} 
                          className="p-2.5 bg-[#F2EFE7] hover:bg-[#8B004A]/10 text-gray-500 hover:text-[#8B004A] rounded-xl transition-colors border-none"
                        >
                          <ArrowRightLeft size={16} strokeWidth={2.5} />
                        </button>
                      </div>
                    </div>

                    {/* Move Category Overlay */}
                    {movingId === item.wordId && (
                      <div className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-2xl border-2 border-[#8B004A]/20 z-10 flex items-center justify-center p-3 animate-fade-in shadow-lg">
                        <div className="flex gap-2 flex-wrap justify-center w-full pr-8">
                           {categories.map(cat => (
                             <button 
                               key={cat} 
                               onClick={() => handleMoveWord(item, cat)} 
                               className={`px-3.5 py-2 text-[9px] font-black rounded-lg uppercase tracking-widest transition-all
                                 ${filter.toLowerCase() === cat.toLowerCase() ? 'hidden' : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-[#E01A76] hover:text-[#E01A76] shadow-sm'}`}
                             >
                               {cat}
                             </button>
                           ))}
                        </div>
                        <button 
                          onClick={() => setMovingId(null)} 
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 text-gray-400 hover:text-white hover:bg-gray-800 bg-gray-100 rounded-xl transition-all"
                        >
                          <X size={16} strokeWidth={3} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 bg-white border-2 border-gray-100 rounded-3xl flex flex-col items-center justify-center gap-3 shadow-sm">
                <FolderOpen size={32} className="text-gray-300 mb-1" strokeWidth={1.5} />
                <p className="text-gray-400 font-black text-[10px] uppercase tracking-widest">Category is Empty</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Add Category Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-[#4A0027]/40 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-white w-full max-w-xs rounded-[2rem] p-7 shadow-2xl">
            <h3 className="text-xl font-black text-[#8B004A] mb-5 flex items-center gap-2">
               <Plus size={20} className="text-[#E01A76]" strokeWidth={3} /> New Collection
            </h3>
            <input 
              autoFocus 
              className="w-full p-4 bg-[#F2EFE7] text-gray-900 border-2 border-transparent rounded-xl mb-6 font-bold text-sm outline-none focus:border-[#E01A76] focus:bg-white transition-all placeholder-gray-400" 
              value={newCat} 
              onChange={(e) => setNewCat(e.target.value)} 
              placeholder="e.g. Slangs, Exams..." 
            />
            <div className="flex gap-3">
              <button 
                onClick={() => setShowAddModal(false)} 
                className="flex-1 py-3.5 text-xs font-black bg-gray-100 text-gray-500 rounded-xl hover:bg-gray-200 transition-colors uppercase tracking-wider"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddCategory} 
                className="flex-1 py-3.5 bg-[#8B004A] hover:bg-[#E01A76] text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg transition-all"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
      
      {!isPracticeMode && (
        <p className="mt-8 text-gray-400 text-[9px] font-black uppercase tracking-[0.2em] opacity-80 flex items-center gap-2">
          Dameeto Node <span className="w-1 h-1 bg-[#8B004A]/30 rounded-full"></span> Hybrid SRS
        </p>
      )}
    </div>
  );
}