import React, { useState } from "react";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
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

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!isLogin) {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        await fetch(`${API_BASE_URL}/api/english-community/users/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, firebaseUid: userCred.user.uid }),
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }

      const loginRes = await fetch(`${API_BASE_URL}/api/english-community/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await loginRes.json();

      if (loginRes.ok) {
        localStorage.setItem("eng_userEmail", data.email);
        localStorage.setItem("eng_userName", data.name);
        onClose();
        navigate("/user"); // ✅ Direct redirection
      } else {
        throw new Error(data.message || "Sync failed");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[100] p-4">
      <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-2xl relative">
        <button onClick={onClose} className="absolute right-6 top-6 text-gray-400 hover:text-black text-xl font-bold">✕</button>
        <h2 className="text-3xl font-black text-center mb-8 text-red-500 italic tracking-tighter">ENGLISH HUB</h2>
        {error && <p className="bg-red-50 text-red-500 p-3 rounded-xl text-xs font-bold mb-4 border border-red-100">{error}</p>}
        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && <input type="text" placeholder="Your Name" required className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 ring-red-500 transition-all font-medium" onChange={(e) => setName(e.target.value)} />}
          <input type="email" placeholder="Email Address" required className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 ring-red-500 transition-all font-medium" onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="Password" required className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 ring-red-500 transition-all font-medium" onChange={(e) => setPassword(e.target.value)} />
          <button disabled={loading} className="w-full bg-red-500 text-white p-4 rounded-2xl font-black uppercase tracking-widest shadow-lg hover:bg-red-600 transition-all active:scale-95 disabled:opacity-50">
            {loading ? "Please wait..." : isLogin ? "Sign In" : "Join Now"}
          </button>
        </form>
        <p className="text-center mt-8 text-gray-400 font-bold text-sm">
          {isLogin ? "Don't have an account?" : "Already a member?"} 
          <span className="text-red-500 cursor-pointer ml-2 hover:underline" onClick={() => setIsLogin(!isLogin)}>{isLogin ? "Create one" : "Login here"}</span>
        </p>
      </div>
    </div>
  );
}