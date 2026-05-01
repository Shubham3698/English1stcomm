import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function EnglishAppMyPosts() {
  const [myPosts, setMyPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  const [word, setWord] = useState("");
  const [meaning, setMeaning] = useState("");
  const [file, setFile] = useState(null); // File ke liye
  const [urlLink, setUrlLink] = useState(""); // Link ke liye
  const [uploadMode, setUploadMode] = useState("file");

  const navigate = useNavigate();
  const API_URL = window.location.hostname === "localhost" 
    ? "http://localhost:3000" : "https://serdeptry1st.onrender.com";

  const fetchMyPosts = async () => {
    const email = localStorage.getItem("eng_userEmail");
    if (!email) return navigate("/");
    try {
      const res = await fetch(`${API_URL}/api/english-posts/my-posts?email=${email}`);
      const data = await res.json();
      setMyPosts(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchMyPosts(); }, []);

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    const userEmail = localStorage.getItem("eng_userEmail");
    const dataToSend = new FormData();
    
    dataToSend.append("word", word);
    dataToSend.append("meaning", meaning);
    dataToSend.append("userEmail", userEmail);

    if (uploadMode === "file") {
      if (!file) {
        alert("Pehle photo select karo bhai!");
        setUploading(false);
        return;
      }
      dataToSend.append("image", file); // Key 'image' matching Backend
    } else {
      if (!urlLink) {
        alert("Pehle link dalo bhai!");
        setUploading(false);
        return;
      }
      dataToSend.append("image", urlLink);
    }

    try {
      const res = await fetch(`${API_URL}/api/english-posts/create`, {
        method: "POST",
        body: dataToSend, // Fetch handles headers automatically for FormData
      });

      if (res.ok) {
        alert("Post uploaded successfully! 🚀");
        setWord(""); setMeaning(""); setFile(null); setUrlLink("");
        fetchMyPosts();
      } else {
        alert("Server error, check console.");
      }
    } catch (err) {
      console.error("Submit Error:", err);
      alert("Submission failed!");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 flex flex-col items-center font-sans">
      
      {/* 📤 Quick Upload Card */}
      <div className="w-full max-w-sm bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 mb-8">
        <div className="flex justify-between items-center mb-4">
           <h2 className="text-xl font-black text-gray-800 italic uppercase">New Word</h2>
           <div className="flex bg-gray-100 p-1 rounded-xl text-[10px] font-bold uppercase">
              <button onClick={() => setUploadMode("file")} className={`px-3 py-1 rounded-lg ${uploadMode === 'file' ? 'bg-white shadow-sm' : ''}`}>File</button>
              <button onClick={() => setUploadMode("url")} className={`px-3 py-1 rounded-lg ${uploadMode === 'url' ? 'bg-white shadow-sm' : ''}`}>Link</button>
           </div>
        </div>

        <form onSubmit={handleFinalSubmit} className="space-y-3">
          <input type="text" placeholder="Word" value={word} required className="w-full p-3 bg-gray-50 rounded-2xl outline-none border focus:border-red-500 text-sm font-bold" onChange={e => setWord(e.target.value)} />
          <input type="text" placeholder="Meaning" value={meaning} required className="w-full p-3 bg-gray-50 rounded-2xl outline-none border focus:border-red-500 text-sm font-bold" onChange={e => setMeaning(e.target.value)} />
          
          {uploadMode === "file" ? (
            <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} className="w-full p-3 bg-gray-50 rounded-2xl text-xs border border-dashed border-gray-300" />
          ) : (
            <input type="text" placeholder="Paste Image URL" value={urlLink} className="w-full p-3 bg-gray-50 rounded-2xl outline-none border focus:border-red-500 text-sm font-bold" onChange={e => setUrlLink(e.target.value)} />
          )}

          <button disabled={uploading} className="w-full bg-red-500 text-white p-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-red-100 active:scale-95 transition-all disabled:bg-gray-300">
            {uploading ? "Uploading to Community..." : "Post Now"}
          </button>
        </form>
      </div>

      {/* 🖼️ List Section */}
      <div className="w-full max-w-sm">
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-2">My Posts</h3>
        {loading ? <p className="text-center font-bold text-gray-300 animate-pulse">Loading...</p> : 
          myPosts.map((post, i) => (
            <div key={i} className="bg-white mb-6 rounded-[2rem] overflow-hidden shadow-sm border border-gray-100 transition-transform active:scale-[0.98]">
              <img src={post.image} className="w-full h-60 object-cover" alt={post.word} />
              <div className="flex justify-between items-center px-6 py-4">
                <h3 className="font-black text-lg text-gray-800 uppercase leading-none tracking-tighter">{post.word}</h3>
                <span className="text-red-500 font-bold text-sm bg-red-50 px-3 py-1 rounded-xl italic">{post.meaning}</span>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}