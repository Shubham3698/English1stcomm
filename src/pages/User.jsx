import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function EnglishAppUser() {
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: "", email: "" });

  useEffect(() => {
    // ✅ English App ki specific keys hi check kar rahe hain
    const email = localStorage.getItem("eng_userEmail");
    const name = localStorage.getItem("eng_userName");

    if (!email) {
      navigate("/"); // Agar login nahi hai toh home page pe bhej do
    } else {
      setUser({
        name: name || "Learner",
        email: email,
      });
    }
  }, [navigate]);

  const handleLogout = () => {
    // ⚠️ Dameeto ka data safe rahega, sirf English app ka session remove hoga
    localStorage.removeItem("eng_userEmail");
    localStorage.removeItem("eng_userName");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-6 font-sans">
      <div className="w-full max-w-2xl bg-white rounded-[40px] shadow-sm p-10 border border-gray-100 text-center mt-6">
        
        {/* Profile Avatar */}
        <div className="w-24 h-24 bg-red-100 text-red-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 font-black shadow-inner">
          {user.name.charAt(0).toUpperCase()}
        </div>

        {/* Welcome Message */}
        <h1 className="text-3xl font-black text-gray-800 tracking-tight">Hello, {user.name}! 👋</h1>
        <p className="text-gray-400 font-medium mb-10">{user.email}</p>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 gap-4">
          
          {/* 1. Go to Community (To see all posts) */}
          <button 
            onClick={() => navigate("/community")} 
            className="w-full p-5 bg-red-500 text-white rounded-3xl font-black uppercase tracking-widest shadow-xl shadow-red-100 active:scale-95 transition-all"
          >
            Explore Community
          </button>

          {/* 2. My Posts (Specialized page to see & create own posts) */}
          <button 
            onClick={() => navigate("/my-posts")} 
            className="w-full p-5 bg-white text-red-500 border-2 border-red-500 rounded-3xl font-black uppercase tracking-widest hover:bg-red-50 active:scale-95 transition-all"
          >
            📝 View My Posts
          </button>

          {/* 3. Logout */}
          <button 
            onClick={handleLogout} 
            className="w-full p-5 bg-gray-100 text-gray-400 rounded-3xl font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-500 transition-all mt-4"
          >
            Logout Session
          </button>
        </div>
      </div>

      {/* Footer info */}
      <p className="mt-10 text-gray-300 text-xs font-bold uppercase tracking-[0.3em]">
        English Community Hub v1.0
      </p>
    </div>
  );
}