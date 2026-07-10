import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast"; // ✅ Fixed Toaster import
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

  return (
    <div className="min-h-screen bg-[#0b101a] flex flex-col items-center p-4 font-sans pb-24 text-white">
      <Toaster 
        position="top-center" 
        toastOptions={{ style: { background: '#121c2d', color: '#fff', border: '1px solid #1e293b' } }} 
      />

      {isPracticeMode ? (
        <div className="w-full max-w-md flex flex-col items-center mt-10 animate-fade-in">
          {practiceType === "matching" ? (
            <WordMatchGame 
              data={allFilteredWords.slice(0, 8)} 
              onComplete={() => { setIsPracticeMode(false); fetchVault(user.email); }} 
            />
          ) : (
            <>
              {/* Header Status */}
              <div className="text-center mb-10 w-full flex flex-col items-center">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                  <BrainCircuit size={14} /> SRS Active Recall
                </span>
                <div className="mt-3 px-4 py-1 bg-[#41ffd1]/10 text-[#41ffd1] border border-[#41ffd1]/20 rounded-full text-xs font-bold tracking-widest shadow-[0_0_10px_rgba(65,255,209,0.1)]">
                  {currentIndex + 1} / {practiceDueList.length}
                </div>
              </div>

              {/* Flashcard */}
              <div className="w-full relative group perspective-1000" onClick={() => setShowMeaning(!showMeaning)}>
                <div className={`w-full aspect-[4/5] bg-[#121c2d] border border-blue-900/40 rounded-[2.5rem] shadow-2xl flex flex-col items-center justify-center p-12 cursor-pointer active:scale-[0.98] transition-all duration-300 relative overflow-hidden ${showMeaning ? 'border-[#41ffd1]/50 shadow-[0_0_30px_rgba(65,255,209,0.15)]' : ''}`}>
                  
                  {/* Subtle Background Glow */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-blue-600/10 blur-[60px] rounded-full pointer-events-none"></div>

                  <h2 className="text-4xl md:text-5xl font-bold text-white capitalize text-center leading-tight tracking-wide z-10">
                    {practiceDueList[currentIndex]?.word}
                  </h2>
                  
                  {showMeaning ? (
                    <div className="mt-8 animate-fade-in z-10 text-center w-full">
                      <div className="w-12 h-[1px] bg-gray-700 mx-auto mb-6"></div>
                      <p className="text-xl md:text-2xl font-bold text-[#41ffd1] capitalize leading-relaxed break-words">
                        {practiceDueList[currentIndex]?.meaning}
                      </p>
                    </div>
                  ) : (
                    <p className="mt-12 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] animate-pulse z-10">
                      Tap to reveal
                    </p>
                  )}
                </div>

                {/* Audio Button */}
                <div className="absolute top-6 right-6 z-20">
                  <PremiumSoundFeature isPremiumUser={isPremiumUser}>
                    <button 
                      onClick={(e) => { e.stopPropagation(); speakWord(practiceDueList[currentIndex]?.word); }} 
                      className="w-12 h-12 bg-[#1a2538] hover:bg-gray-700 border border-gray-600 text-gray-300 hover:text-[#41ffd1] rounded-full shadow-lg flex items-center justify-center transition-all"
                    >
                      <Volume2 size={20} />
                    </button>
                  </PremiumSoundFeature>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 mt-10 w-full px-1">
                {showMeaning ? (
                  <>
                    <button onClick={() => handleReview('again')} className="p-4 rounded-2xl font-bold uppercase text-[10px] tracking-widest bg-[#1a2538] border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all active:scale-95 flex flex-col items-center gap-1">
                      <span>Again</span><span className="text-[8px] opacity-70">&lt;10m</span>
                    </button>
                    <button onClick={() => handleReview('hard')} className="p-4 rounded-2xl font-bold uppercase text-[10px] tracking-widest bg-[#1a2538] border border-orange-500/30 text-orange-400 hover:bg-orange-500/10 transition-all active:scale-95 flex flex-col items-center gap-1">
                      <span>Hard</span><span className="text-[8px] opacity-70">1d</span>
                    </button>
                    <button onClick={() => handleReview('good')} className="p-4 rounded-2xl font-bold uppercase text-[10px] tracking-widest bg-[#1a2538] border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 transition-all active:scale-95 flex flex-col items-center gap-1">
                      <span>Good</span><span className="text-[8px] opacity-70">3d</span>
                    </button>
                    <button onClick={() => handleReview('easy')} className="p-4 rounded-2xl font-bold uppercase text-[10px] tracking-widest bg-[#41ffd1]/10 border border-[#41ffd1]/30 text-[#41ffd1] hover:bg-[#41ffd1]/20 transition-all active:scale-95 flex flex-col items-center gap-1 shadow-[0_0_10px_rgba(65,255,209,0.1)]">
                      <span>Easy</span><span className="text-[8px] opacity-70">5d+</span>
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => { setIsPracticeMode(false); setShowMeaning(false); }} 
                    className="col-span-2 text-gray-500 hover:text-gray-300 text-[10px] font-bold uppercase tracking-[0.2em] py-4 transition-colors"
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
          <div className="w-full max-w-md bg-[#121c2d] rounded-[2.5rem] shadow-xl p-8 border border-blue-900/40 text-center mt-6 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-blue-900 via-[#41ffd1] to-blue-900 opacity-30"></div>

            <div className="relative w-20 h-20 mx-auto mb-5">
               <div className="w-full h-full bg-[#1a2538] border-2 border-gray-700 text-[#41ffd1] rounded-full flex items-center justify-center text-3xl font-bold shadow-lg">
                 {user.name.charAt(0).toUpperCase()}
               </div>
               {isPremiumUser && (
                 <span className="absolute -bottom-1 -right-2 bg-yellow-500 text-black text-[9px] font-bold px-2 py-0.5 rounded border border-yellow-300 shadow-md flex items-center gap-1">
                   <Crown size={10} /> PRO
                 </span>
               )}
            </div>
            
            <h1 className="text-2xl font-bold text-white tracking-wide">Hey, {user.name.split(' ')[0]}!</h1>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.1em] mt-1.5 mb-6">{user.email}</p>
            
            <div className="flex gap-3 mb-6">
              <button 
                onClick={() => navigate("/community")} 
                className="flex-1 py-3.5 bg-[#0b101a] hover:bg-gray-800 border border-gray-700 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all"
              >
                Explore Hub
              </button>
              <button 
                onClick={() => navigate("/my-posts")} 
                className="flex-1 py-3.5 bg-[#0b101a] hover:bg-gray-800 border border-gray-700 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all"
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
                className="w-full p-4 bg-[#41ffd1] hover:bg-[#34e5b9] text-black rounded-xl font-bold uppercase tracking-wider text-[11px] transition-all active:scale-95 shadow-[0_0_15px_rgba(65,255,209,0.2)] flex items-center justify-center gap-2"
              >
                <Play size={14} /> Start Practice ({practiceDueList.length})
              </button>
              <button 
                onClick={() => {
                   if (allFilteredWords.length >= 3) { setPracticeType("matching"); setIsPracticeMode(true); } 
                   else toast.error("Add more words! 🧩");
                }}
                className="w-full p-4 bg-[#1a2538] hover:bg-gray-700 text-gray-300 border border-gray-700 rounded-xl font-bold uppercase tracking-wider text-[10px] transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <BrainCircuit size={14} /> Matching Game ({allFilteredWords.length})
              </button>
            </div>
          </div>

          {/* Vault Section */}
          <div className="w-full max-w-md mt-10 px-1">
            <div className="flex items-center justify-between mb-2 px-1">
               <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                 <FolderOpen size={14} /> My Vault
               </h3>
               <button 
                 onClick={() => setShowAddModal(true)} 
                 className="text-[10px] bg-[#1a2538] hover:bg-gray-700 border border-gray-700 text-white px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 transition-colors"
               >
                 <Plus size={12} /> Add
               </button>
            </div>

            {/* Filter Categories */}
            <div className="flex gap-2 mb-6 overflow-x-auto custom-scrollbar pb-2 pt-2">
              {categories.map((lvl) => (
                <button 
                  key={lvl} 
                  onClick={() => { setFilter(lvl); setCurrentIndex(0); }} 
                  className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap border
                    ${filter.toLowerCase() === lvl.toLowerCase() 
                      ? 'bg-[#41ffd1]/10 border-[#41ffd1]/50 text-[#41ffd1]' 
                      : 'bg-[#121c2d] border-gray-800 text-gray-500 hover:text-gray-300'}`}
                >
                  {lvl === 'dailyUse' ? 'Daily' : lvl}
                </button>
              ))}
            </div>

            {/* Word List */}
            {loading ? (
              <div className="py-16 flex flex-col items-center justify-center gap-3">
                <div className="w-6 h-6 border-2 border-[#41ffd1] border-t-transparent rounded-full animate-spin"></div>
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Syncing Vault...</div>
              </div>
            ) : allFilteredWords.length > 0 ? (
              <div className="space-y-3">
                {allFilteredWords.map((item) => (
                  <div key={item.wordId} className="relative group">
                    <div className="bg-[#121c2d] p-5 rounded-2xl border border-gray-800 hover:border-[#41ffd1]/30 flex items-center justify-between transition-all">
                      <div onClick={() => navigate(`/community?postId=${item.parentPostId}`)} className="flex flex-col cursor-pointer max-w-[60%]">
                        <h4 className="text-lg font-bold text-white capitalize tracking-wide truncate">{item.word}</h4>
                        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mt-0.5">{filter}</span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <p className="text-xs font-semibold text-[#41ffd1] truncate max-w-[80px] text-right">{item.meaning}</p>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setMovingId(movingId === item.wordId ? null : item.wordId); }} 
                          className="p-2 bg-[#1a2538] hover:bg-gray-700 text-gray-400 rounded-lg transition-colors border border-gray-700"
                        >
                          <ArrowRightLeft size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Move Category Overlay */}
                    {movingId === item.wordId && (
                      <div className="absolute inset-0 bg-[#121c2d]/95 backdrop-blur-md rounded-2xl border border-blue-900/50 z-10 flex items-center justify-center p-3 animate-fade-in shadow-xl">
                        <div className="flex gap-2 flex-wrap justify-center w-full pr-8">
                           {categories.map(cat => (
                             <button 
                               key={cat} 
                               onClick={() => handleMoveWord(item, cat)} 
                               className={`px-3 py-1.5 text-[9px] font-bold rounded-lg uppercase tracking-wider transition-colors
                                 ${filter.toLowerCase() === cat.toLowerCase() ? 'hidden' : 'bg-[#1a2538] text-gray-300 border border-gray-700 hover:border-[#41ffd1]/50'}`}
                             >
                               {cat}
                             </button>
                           ))}
                        </div>
                        <button 
                          onClick={() => setMovingId(null)} 
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-white bg-[#0b101a] rounded-lg border border-gray-800"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 bg-[#121c2d] border border-gray-800 rounded-2xl flex flex-col items-center justify-center gap-2">
                <FolderOpen size={24} className="text-gray-600 mb-1" />
                <p className="text-gray-500 font-bold text-[10px] uppercase tracking-[0.1em]">Category is Empty</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Add Category Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-[#0b101a]/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-[#121c2d] w-full max-w-xs rounded-3xl p-6 border border-blue-900/50 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
               <Plus size={18} className="text-[#41ffd1]" /> New Collection
            </h3>
            <input 
              autoFocus 
              className="w-full p-4 bg-[#0b101a] text-white border border-gray-800 rounded-xl mb-6 font-bold text-sm outline-none focus:border-[#41ffd1]/50 focus:ring-1 focus:ring-[#41ffd1]/20 transition-all placeholder-gray-600" 
              value={newCat} 
              onChange={(e) => setNewCat(e.target.value)} 
              placeholder="e.g. Slangs, Exams..." 
            />
            <div className="flex gap-3">
              <button 
                onClick={() => setShowAddModal(false)} 
                className="flex-1 py-3 text-xs font-bold bg-[#1a2538] text-gray-400 rounded-xl hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddCategory} 
                className="flex-1 py-3 bg-[#41ffd1] hover:bg-[#34e5b9] text-black rounded-xl text-xs font-bold tracking-wide shadow-lg transition-all"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
      
      <p className="mt-16 text-gray-600 text-[9px] font-bold uppercase tracking-[0.2em] opacity-50 flex items-center gap-2">
        Dameeto Node <span className="w-1 h-1 bg-gray-600 rounded-full"></span> Hybrid SRS
      </p>
    </div>
  );
}