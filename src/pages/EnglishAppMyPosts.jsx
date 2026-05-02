import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function EnglishAppMyPosts() {
  const [myPosts, setMyPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  const [word, setWord] = useState("");
  const [meaning, setMeaning] = useState("");
  
  // 🔥 Multi-Media State
  const [mediaItems, setMediaItems] = useState([]); // [{type: 'image', value: File/URL, mode: 'file/url'}]

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

  // ➕ Add New Media Slot
  const addMediaSlot = (type) => {
    setMediaItems([...mediaItems, { type, value: "", mode: "url" }]);
  };

  // ❌ Remove Media Slot
  const removeMediaSlot = (index) => {
    const updated = mediaItems.filter((_, i) => i !== index);
    setMediaItems(updated);
  };

  // ✍️ Update Slot Value
  const updateMediaValue = (index, val, mode = "url") => {
    const updated = [...mediaItems];
    updated[index].value = val;
    updated[index].mode = mode;
    setMediaItems(updated);
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    if (mediaItems.length === 0) return toast.error("ADD AT LEAST ONE MEDIA");
    
    setUploading(true);
    const userEmail = localStorage.getItem("eng_userEmail");
    const dataToSend = new FormData();
    
    dataToSend.append("word", word);
    dataToSend.append("meaning", meaning);
    dataToSend.append("userEmail", userEmail);

    // Structure media data for backend
    const mediaMetadata = [];

    mediaItems.forEach((item, index) => {
      if (item.mode === "file" && item.value) {
        dataToSend.append("images", item.value); // Multi-file upload
        mediaMetadata.push({ type: item.type, mode: "file" });
      } else {
        mediaMetadata.push({ type: item.type, mode: "url", url: item.value });
      }
    });

    dataToSend.append("mediaMetadata", JSON.stringify(mediaMetadata));

    try {
      const res = await fetch(`${API_URL}/api/english-posts/create`, {
        method: "POST",
        body: dataToSend,
      });

      if (res.ok) {
        toast.success("STORY PUBLISHED 🚀");
        setWord(""); setMeaning(""); setMediaItems([]);
        fetchMyPosts();
      }
    } catch (err) { toast.error("UPLOAD FAILED"); }
    finally { setUploading(false); }
  };

  return (
    <div className="min-h-screen bg-white p-4 flex flex-col items-center font-sans pb-24">
      
      {/* 📤 MULTI-UPLOAD PANEL */}
      <div className="w-full max-w-md bg-zinc-900 text-white p-8 rounded-[3rem] shadow-2xl transition-all">
        <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-6">Create Sequence</h2>
        
        <form onSubmit={handleFinalSubmit} className="space-y-4">
          <input type="text" placeholder="WORD" value={word} required className="w-full p-4 bg-black rounded-2xl outline-none border border-zinc-800 focus:border-white text-sm font-bold uppercase" onChange={e => setWord(e.target.value)} />
          <input type="text" placeholder="MEANING" value={meaning} required className="w-full p-4 bg-black rounded-2xl outline-none border border-zinc-800 focus:border-white text-sm font-bold uppercase" onChange={e => setMeaning(e.target.value)} />

          {/* 🔥 Media Slots Area */}
          <div className="space-y-3 mt-6">
            <p className="text-[10px] font-black text-zinc-500 tracking-[0.3em] uppercase mb-2">Sequence Content</p>
            {mediaItems.map((item, index) => (
              <div key={index} className="bg-black p-4 rounded-3xl border border-zinc-800 flex flex-col gap-3 relative">
                <button type="button" onClick={() => removeMediaSlot(index)} className="absolute -top-2 -right-2 bg-red-500 w-6 h-6 rounded-full text-[10px] font-bold">X</button>
                
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase text-zinc-400 italic">#{index + 1} {item.type}</span>
                  <div className="flex bg-zinc-800 rounded-lg p-1 text-[8px] font-bold">
                    <button type="button" onClick={() => updateMediaValue(index, "", "file")} className={`px-2 py-1 rounded-md ${item.mode === 'file' ? 'bg-zinc-600' : ''}`}>FILE</button>
                    <button type="button" onClick={() => updateMediaValue(index, "", "url")} className={`px-2 py-1 rounded-md ${item.mode === 'url' ? 'bg-zinc-600' : ''}`}>URL</button>
                  </div>
                </div>

                {item.mode === "file" ? (
                  <input type="file" accept={item.type === 'video' ? 'video/*' : 'image/*'} onChange={(e) => updateMediaValue(index, e.target.files[0], "file")} className="text-[10px] text-zinc-500" />
                ) : (
                  <input type="text" placeholder={`PASTE ${item.type.toUpperCase()} URL`} value={item.value} className="w-full bg-transparent border-b border-zinc-800 py-2 outline-none text-xs" onChange={(e) => updateMediaValue(index, e.target.value, "url")} />
                )}
              </div>
            ))}
          </div>

          {/* ➕ Add Buttons */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            <button type="button" onClick={() => addMediaSlot('image')} className="bg-zinc-800 p-3 rounded-2xl text-[9px] font-black uppercase border border-zinc-700 hover:bg-white hover:text-black transition-all">+ IMAGE</button>
            <button type="button" onClick={() => addMediaSlot('video')} className="bg-zinc-800 p-3 rounded-2xl text-[9px] font-black uppercase border border-zinc-700 hover:bg-white hover:text-black transition-all">+ VIDEO</button>
            <button type="button" onClick={() => addMediaSlot('embed')} className="bg-zinc-800 p-3 rounded-2xl text-[9px] font-black uppercase border border-zinc-700 hover:bg-white hover:text-black transition-all">+ YT LINK</button>
          </div>

          <button disabled={uploading} className="w-full bg-white text-black p-5 rounded-[2rem] font-black uppercase tracking-widest text-xs mt-6 active:scale-95 transition-all disabled:bg-zinc-700">
            {uploading ? "SYNCING TO HUB..." : "PUBLISH TO COMMUNITY"}
          </button>
        </form>
      </div>

      {/* --- Rest of the History List (Same as before) --- */}
    </div>
  );
}