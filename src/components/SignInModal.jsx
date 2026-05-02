import React, { useState } from "react";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup // 👈 Popup use karenge refresh se bachne ke liye
} from "firebase/auth";

export default function SignInModal({ onClose }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const navigate = useNavigate();

  const API_BASE_URL = window.location.hostname === "localhost" 
    ? "http://localhost:3000" 
    : "https://serdeptry1st.onrender.com";

  // --- 🔄 BACKEND SYNC FUNCTION ---
  const syncToBackend = async (uName, uEmail, uUid) => {
    setLoading(true);
    try {
      console.log("Syncing to Backend...");
      const res = await fetch(`${API_BASE_URL}/api/english-community/users/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: uName, email: uEmail, firebaseUid: uUid }),
      });
      
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("eng_userEmail", data.email);
        localStorage.setItem("eng_userName", data.name);
        onClose();
        navigate("/user");
      } else {
        throw new Error(data.message || "Backend Sync failed");
      }
    } catch (err) {
      console.error("Sync Error:", err);
      setError("Database sync failed!");
    } finally {
      setLoading(false);
    }
  };

  // --- 🔑 GOOGLE LOGIN (POPUP METHOD) ---
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    const provider = new GoogleAuthProvider();
    
    try {
      // 🚀 Refresh nahi hoga, seedha window khulegi
      const result = await signInWithPopup(auth, provider);
      if (result?.user) {
        await syncToBackend(result.user.displayName, result.user.email, result.user.uid);
      }
    } catch (err) {
      console.error("Google Auth Error:", err);
      setError("Google Login Failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    try {
      let userCred;
      if (isLogin) {
        userCred = await signInWithEmailAndPassword(auth, cleanEmail, cleanPassword);
      } else {
        userCred = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPassword);
      }

      if (userCred?.user) {
        await syncToBackend(name || "User", cleanEmail, userCred.user.uid);
      }
    } catch (err) {
      console.error("Auth Error:", err.code);
      if (err.code === "auth/email-already-in-use") {
        setError("Email already registered. Please login.");
      } else if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password") {
        setError("Invalid email or password.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[100] p-4">
      <div className="bg-white w-full max-w-md p-8 rounded-[2.5rem] shadow-2xl relative border border-gray-100">
        <button onClick={onClose} className="absolute right-6 top-6 text-gray-400 hover:text-black text-xl font-bold transition-all">✕</button>
        
        <h2 className="text-3xl font-black text-center mb-2 text-red-500 italic tracking-tighter uppercase">English Hub</h2>
        <p className="text-center text-gray-400 text-[10px] font-black uppercase tracking-widest mb-8 italic">Clean UI • No Conflict</p>

        {error && <p className="bg-red-50 text-red-500 p-4 rounded-2xl text-[10px] font-black mb-4 border border-red-100 text-center uppercase tracking-wider">{error}</p>}
        
        <button 
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-100 p-4 rounded-2xl mb-6 font-bold text-sm hover:bg-gray-50 active:scale-95 transition-all shadow-sm"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="G" />
          Continue with Google
        </button>

        <form onSubmit={handleAuth} className="space-y-3">
          {!isLogin && (
            <input 
              type="text" placeholder="Full Name" required 
              className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 ring-red-500 font-bold text-sm" 
              onChange={(e) => setName(e.target.value)} 
            />
          )}
          <input 
            type="email" placeholder="Email Address" required 
            className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 ring-red-500 font-bold text-sm" 
            onChange={(e) => setEmail(e.target.value)} 
          />
          <input 
            type="password" placeholder="Password" required 
            className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 ring-red-500 font-bold text-sm" 
            onChange={(e) => setPassword(e.target.value)} 
          />
          
          <button disabled={loading} className="w-full bg-red-500 text-white p-4 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-red-600 active:scale-95 transition-all mt-4">
            {loading ? "Processing..." : isLogin ? "Login Now" : "Join Now"}
          </button>
        </form>

        <p className="text-center mt-8 text-gray-400 font-bold text-xs uppercase">
          {isLogin ? "New to Hub?" : "Already a member?"} 
          <span className="text-red-500 cursor-pointer ml-2 hover:underline tracking-tighter" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Join Now" : "Login Instead"}
          </span>  
        </p>
      </div>
    </div>
  );
}