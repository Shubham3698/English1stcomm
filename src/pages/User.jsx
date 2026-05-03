import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function EnglishAppUser() {
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: "", email: "" });
  const [savedWords, setSavedWords] = useState([]);
  const [filter, setFilter] = useState("hard"); 
  const [loading, setLoading] = useState(true);

  // 🔥 Flashcard (Practice) States
  const [isPracticeMode, setIsPracticeMode] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMeaning, setShowMeaning] = useState(false);

  // 🕒 Timer state to force re-render every few seconds
  const [tick, setTick] = useState(0);

  const API_URL = window.location.hostname === "localhost" 
    ? "http://localhost:3000" : "https://serdeptry1st.onrender.com";

  useEffect(() => {
    const email = localStorage.getItem("eng_userEmail");
    const name = localStorage.getItem("eng_userName");

    if (!email) {
      navigate("/");
    } else {
      setUser({ name: name || "Learner", email: email });
      fetchSavedWords(email);
    }
  }, [navigate]);

  // 🔄 AUTO-REFRESH LOGIC: Har 5 second mein UI check karega ki time up hua ya nahi
  useEffect(() => {
    const timer = setInterval(() => {
      setTick(prev => prev + 1);
    }, 5000); 
    return () => clearInterval(timer);
  }, []);

  const fetchSavedWords = async (email) => {
    try {
      const res = await fetch(`${API_URL}/api/english-posts/saved?email=${email}`);
      const data = await res.json();
      setSavedWords(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching saved words", err);
      setSavedWords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("eng_userEmail");
    localStorage.removeItem("eng_userName");
    navigate("/");
    toast.success("Logged out successfully");
  };

  // 🧠 SRS Filtering Logic: 
  // Milliseconds comparison (Global Time) use kiya hai taaki timezone issue na ho
  const filteredWords = Array.isArray(savedWords) ? savedWords.filter(post => 
    post.userStats?.some(stat => {
      if (stat.email !== user.email || stat.level !== filter) return false;
      
      if (stat.nextReview) {
        const now = new Date().getTime();
        const reviewDate = new Date(stat.nextReview).getTime();
        return reviewDate <= now; 
      }
      
      return true; 
    })
  ) : [];

  const startPractice = () => {
    if (filteredWords.length === 0) {
      return toast.error(`Abhi koi ${filter} word review ke liye pending nahi hai!`, {
        style: { borderRadius: '15px', background: '#333', color: '#fff', fontSize: '11px', fontWeight: 'bold' }
      });
    }
    setCurrentIndex(0);
    setShowMeaning(false);
    setIsPracticeMode(true);
  };

  const handleReview = async (postId, intervalType) => {
    let nextReviewDate = new Date();
    
    if (intervalType === 'again') nextReviewDate.setMinutes(nextReviewDate.getMinutes() + 1);
    else if (intervalType === 'hard') nextReviewDate.setMinutes(nextReviewDate.getMinutes() + 6);
    else if (intervalType === 'good') nextReviewDate.setMinutes(nextReviewDate.getMinutes() + 10);
    else if (intervalType === 'easy') nextReviewDate.setDate(nextReviewDate.getDate() + 3);

    try {
      const res = await fetch(`${API_URL}/api/english-posts/update-stat/${postId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: user.email, 
          level: filter, 
          nextReview: nextReviewDate 
        })
      });

      if (res.ok) {
        if (currentIndex < filteredWords.length - 1) {
          setCurrentIndex(currentIndex + 1);
          setShowMeaning(false);
        } else {
          setIsPracticeMode(false);
          toast.success("Review Complete! Scheduled for later.");
          fetchSavedWords(user.email); 
        }
      }
    } catch (err) {
      toast.error("Sync Failed");
    }
  };

  if (isPracticeMode) {
    const current = filteredWords[currentIndex];
    return (
      <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center p-6 font-sans">
        <div className="w-full max-sm flex flex-col items-center">
          <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] mb-10 text-center">
            {filter.toUpperCase()} Practice — {currentIndex + 1} / {filteredWords.length}
          </span>
          
          <div 
            onClick={() => setShowMeaning(!showMeaning)}
            className="w-full aspect-square bg-gray-50 rounded-[3rem] border-4 border-dashed border-gray-100 flex flex-col items-center justify-center p-8 cursor-pointer active:scale-95 transition-all shadow-sm"
          >
            <h2 className="text-4xl font-black text-gray-900 uppercase tracking-tighter italic text-center leading-none">
              {current.word}
            </h2>
            {showMeaning ? (
              <p className="mt-6 text-2xl font-black text-red-500 uppercase italic animate-in fade-in zoom-in duration-300">
                {current.meaning}
              </p>
            ) : (
              <p className="mt-4 text-[9px] font-black text-gray-300 uppercase tracking-widest">Tap to reveal meaning</p>
            )}
          </div>

          {showMeaning ? (
            <div className="grid grid-cols-2 gap-3 mt-10 w-full px-2">
              <button onClick={() => handleReview(current._id, 'again')} className="p-4 bg-red-500 text-white rounded-2xl font-black uppercase text-[9px] shadow-lg shadow-red-100">Again (1m)</button>
              <button onClick={() => handleReview(current._id, 'hard')} className="p-4 bg-orange-500 text-white rounded-2xl font-black uppercase text-[9px] shadow-lg shadow-orange-100">Hard (6m)</button>
              <button onClick={() => handleReview(current._id, 'good')} className="p-4 bg-blue-500 text-white rounded-2xl font-black uppercase text-[9px] shadow-lg shadow-blue-100">Good (10m)</button>
              <button onClick={() => handleReview(current._id, 'easy')} className="p-4 bg-green-500 text-white rounded-2xl font-black uppercase text-[9px] shadow-lg shadow-green-100">Easy (3d)</button>
            </div>
          ) : (
            <button onClick={() => setIsPracticeMode(false)} className="mt-12 p-5 bg-gray-100 text-gray-400 rounded-[2rem] font-black uppercase text-[10px] w-full tracking-[0.2em]">End Practice</button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 font-sans pb-20 text-black">
      
      {/* 👤 Profile Card */}
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-sm p-8 border border-gray-100 text-center mt-4">
        <div className="w-20 h-20 bg-red-500 text-white rounded-full flex items-center justify-center text-3xl mx-auto mb-4 font-black shadow-lg shadow-red-200">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <h1 className="text-2xl font-black text-gray-800 tracking-tight">Hi, {user.name}!</h1>
        <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1 mb-6">{user.email}</p>

        <div className="flex gap-2 mb-2">
          <button onClick={() => navigate("/community")} className="flex-1 p-3 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all">Explore Hub</button>
          <button onClick={() => navigate("/my-posts")} className="flex-1 p-3 border-2 border-black rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all">My Uploads</button>
        </div>

        <button 
          onClick={startPractice}
          className="w-full mt-2 p-4 bg-red-50 text-red-500 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 active:scale-95 transition-all border border-red-100 shadow-sm"
        >
          🎓 Practice {filter} ({filteredWords.length} Due)
        </button>

        <button onClick={handleLogout} className="w-full py-2 text-gray-300 text-[9px] font-black uppercase tracking-[0.2em] mt-4 hover:text-red-500 transition-all">Logout Session</button>
      </div>

      {/* 📚 Collection Section */}
      <div className="w-full max-w-md mt-8 px-2">
        <div className="flex flex-col mb-6 gap-3 text-center sm:text-left">
          <h3 className="text-[11px] font-black text-gray-800 uppercase tracking-widest italic">Personal Vault</h3>
          <div className="flex bg-gray-200 p-1 rounded-2xl text-[8px] font-black justify-between overflow-x-auto shadow-inner">
            <button onClick={() => setFilter("hard")} className={`flex-1 px-2 py-2.5 rounded-xl transition-all ${filter === 'hard' ? 'bg-white shadow-sm text-red-500' : 'text-gray-500'}`}>HARD</button>
            <button onClick={() => setFilter("dailyUse")} className={`flex-1 px-2 py-2.5 rounded-xl transition-all ${filter === 'dailyUse' ? 'bg-white shadow-sm text-blue-500' : 'text-gray-500'}`}>DAILY</button>
            <button onClick={() => setFilter("heard")} className={`flex-1 px-2 py-2.5 rounded-xl transition-all ${filter === 'heard' ? 'bg-white shadow-sm text-orange-500' : 'text-gray-500'}`}>HEARD</button>
            <button onClick={() => setFilter("easy")} className={`flex-1 px-2 py-2.5 rounded-xl transition-all ${filter === 'easy' ? 'bg-white shadow-sm text-green-500' : 'text-gray-500'}`}>EASY</button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10 animate-pulse text-gray-300 font-black tracking-widest text-[10px]">SYNCING VAULT...</div>
        ) : filteredWords.length > 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {filteredWords.map((post) => (
              <div key={post._id} 
                onClick={() => navigate("/community")}
                className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm flex items-center justify-between group active:scale-95 transition-all cursor-pointer"
              >
                <div className="flex flex-col">
                  <h4 className="text-xl font-black text-gray-800 uppercase tracking-tighter leading-none italic group-hover:text-red-500 transition-colors">
                    {post.word}
                  </h4>
                  <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest mt-1 italic font-bold">Vocabulary Record</span>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-black italic leading-none uppercase ${filter === 'hard' ? 'text-red-500' : filter === 'dailyUse' ? 'text-blue-500' : filter === 'heard' ? 'text-orange-500' : 'text-green-500'}`}>
                    {post.meaning}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white/50 border-2 border-dashed border-gray-200 rounded-[2rem] py-12 text-center">
            <p className="text-gray-300 font-black text-[10px] uppercase tracking-widest italic">Vault Empty for Now ✨</p>
            <button onClick={() => navigate("/community")} className="mt-2 text-red-400 font-black text-[9px] uppercase underline tracking-widest">Visit Community</button>
          </div>
        )}
      </div>

      <p className="mt-12 text-gray-300 text-[8px] font-black uppercase tracking-[0.4em]">Vault Security Verified v1.2</p>
    </div>
  );
}