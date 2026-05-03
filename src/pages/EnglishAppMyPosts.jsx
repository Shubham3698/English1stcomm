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
  const [mediaItems, setMediaItems] = useState([]); // [{type, value, mode}]
  const [editingId, setEditingId] = useState(null);

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

  // ➕ Add Media Slot
  const addMediaSlot = (type) => {
    setMediaItems([...mediaItems, { type, value: "", mode: "url" }]);
  };

  // ❌ Remove Media Slot
  const removeMediaSlot = (index) => {
    setMediaItems(mediaItems.filter((_, i) => i !== index));
  };

  // ✍️ Update Media Value
  const updateMediaValue = (index, val, mode = "url") => {
    const updated = [...mediaItems];
    updated[index].value = val;
    updated[index].mode = mode;
    setMediaItems(updated);
  };

  // 🗑️ Delete Logic
  const handleDelete = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this?")) return;
    try {
      const res = await fetch(`${API_URL}/api/english-posts/delete/${postId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Post Removed");
        fetchMyPosts();
      }
    } catch (err) { toast.error("Delete Failed"); }
  };

  // 📝 Edit Logic
  const startEdit = (post) => {
    setEditingId(post._id);
    setWord(post.word);
    setMeaning(post.meaning);
    // Convert existing media to our local state
    const existingMedia = post.media?.map(m => ({
      type: m.type,
      value: m.url,
      mode: "url"
    })) || [];
    setMediaItems(existingMedia);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    if (mediaItems.length === 0) return toast.error("Please add at least one media item");
    
    setUploading(true);
    const userEmail = localStorage.getItem("eng_userEmail");
    const dataToSend = new FormData();
    
    dataToSend.append("word", word);
    dataToSend.append("meaning", meaning);
    dataToSend.append("userEmail", userEmail);

    const mediaMetadata = [];
    mediaItems.forEach((item) => {
      if (item.mode === "file" && item.value) {
        dataToSend.append("images", item.value); // Field name matches backend upload.array("images")
        mediaMetadata.push({ type: item.type, mode: "file" });
      } else {
        mediaMetadata.push({ type: item.type, mode: "url", url: item.value });
      }
    });

    dataToSend.append("mediaMetadata", JSON.stringify(mediaMetadata));

    try {
      const url = editingId 
        ? `${API_URL}/api/english-posts/update/${editingId}` 
        : `${API_URL}/api/english-posts/create`;
      
      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        body: dataToSend,
      });

      if (res.ok) {
        toast.success(editingId ? "Entry Updated" : "Sequence Published");
        setWord(""); setMeaning(""); setMediaItems([]); setEditingId(null);
        fetchMyPosts();
      }
    } catch (err) { toast.error("Submission failed"); }
    finally { setUploading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 flex flex-col items-center font-sans pb-24">
      
      {/* 📤 Multi-Media Upload Card */}
      <div className="w-full max-w-sm bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 mb-8">
        <div className="flex justify-between items-center mb-4 px-1">
           <h2 className="text-xl font-black text-gray-800 italic uppercase">
             {editingId ? "Edit Sequence" : "New Sequence"}
           </h2>
           {editingId && (
             <button onClick={() => {setEditingId(null); setMediaItems([]); setWord(""); setMeaning("");}} className="text-[10px] font-bold text-red-500 uppercase">Cancel</button>
           )}
        </div>

        <form onSubmit={handleFinalSubmit} className="space-y-3">
          <input type="text" placeholder="Word" value={word} required className="w-full p-3 bg-gray-50 rounded-2xl outline-none border focus:border-red-500 text-sm font-bold" onChange={e => setWord(e.target.value)} />
          <input type="text" placeholder="Meaning" value={meaning} required className="w-full p-3 bg-gray-50 rounded-2xl outline-none border focus:border-red-500 text-sm font-bold" onChange={e => setMeaning(e.target.value)} />

          {/* 🎞️ Dynamic Media Slots Area */}
          <div className="space-y-2 py-2">
            {mediaItems.map((item, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-2xl border border-gray-100 relative">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[9px] font-black uppercase text-gray-400 italic">#{index + 1} {item.type}</span>
                  <div className="flex gap-1">
                    <button type="button" onClick={() => updateMediaValue(index, "", "file")} className={`px-2 py-1 rounded-lg text-[8px] font-bold ${item.mode === 'file' ? 'bg-red-500 text-white' : 'bg-gray-200'}`}>File</button>
                    <button type="button" onClick={() => updateMediaValue(index, "", "url")} className={`px-2 py-1 rounded-lg text-[8px] font-bold ${item.mode === 'url' ? 'bg-red-500 text-white' : 'bg-gray-200'}`}>Link</button>
                    <button type="button" onClick={() => removeMediaSlot(index)} className="ml-2 text-gray-300 font-bold px-1">×</button>
                  </div>
                </div>

                {item.mode === "file" ? (
                  <input type="file" accept={item.type === 'video' ? 'video/*' : 'image/*'} onChange={(e) => updateMediaValue(index, e.target.files[0], "file")} className="text-[10px] w-full" />
                ) : (
                  <input type="text" placeholder={`Paste ${item.type} URL`} value={item.value} className="w-full bg-transparent border-b border-gray-200 text-xs py-1 outline-none font-bold" onChange={(e) => updateMediaValue(index, e.target.value, "url")} />
                )}
              </div>
            ))}
          </div>

          {/* Add Buttons */}
          <div className="flex gap-2 pb-2">
            <button type="button" onClick={() => addMediaSlot('image')} className="flex-1 bg-gray-100 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider text-gray-600">+ Image</button>
            <button type="button" onClick={() => addMediaSlot('video')} className="flex-1 bg-gray-100 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider text-gray-600">+ Video</button>
            <button type="button" onClick={() => addMediaSlot('embed')} className="flex-1 bg-gray-100 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider text-gray-600">+ YT Link</button>
          </div>

          <button disabled={uploading} className="w-full bg-red-500 text-white p-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-red-100 active:scale-95 transition-all disabled:bg-gray-300">
            {uploading ? "Publishing..." : (editingId ? "Update Entry" : "Post Sequence")}
          </button>
        </form>
      </div>

      {/* 🖼️ List Section (My History) */}
      <div className="w-full max-w-sm">
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-2">My Archive</h3>
        {loading ? <p className="text-center font-bold text-gray-300 animate-pulse">Syncing...</p> : 
          myPosts.map((post) => (
            <div key={post._id} className="bg-white mb-8 rounded-[2.5rem] overflow-hidden shadow-sm border border-gray-100 relative">
              
              {/* Management Buttons */}
              <div className="absolute top-4 right-4 flex gap-2 z-10">
                <button onClick={() => startEdit(post)} className="w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full shadow-md flex items-center justify-center text-xs border border-gray-100">✍️</button>
                <button onClick={() => handleDelete(post._id)} className="w-9 h-9 bg-red-500 rounded-full shadow-lg flex items-center justify-center text-white text-xs">🗑️</button>
              </div>

              {/* Preview Image (First item in sequence) */}
              <img src={post.media?.[0]?.url || post.image} className="w-full h-64 object-cover" alt={post.word} />
              
              <div className="flex justify-between items-center px-6 py-5">
                <div className="flex flex-col">
                  <h3 className="font-black text-xl text-gray-800 uppercase leading-none tracking-tighter italic">{post.word}</h3>
                  <span className="text-[8px] font-black text-gray-300 uppercase mt-1 tracking-widest">
                    Sequence: {post.media?.length || 1} Items
                  </span>
                </div>
                <span className="text-red-500 font-bold text-sm bg-red-50 px-4 py-1.5 rounded-xl italic">{post.meaning}</span>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}