import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import CanvasDraw from "react-canvas-draw";
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

export default function EnglishAppMyPosts() {
  const [myPosts, setMyPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [word, setWord] = useState("");
  const [meaning, setMeaning] = useState("");
  const [mediaItems, setMediaItems] = useState([]);
  const [editingId, setEditingId] = useState(null);

  // 🎨 Editor States (HQ maintained)
  const [tempImage, setTempImage] = useState(null);
  const [activeEditIndex, setActiveEditIndex] = useState(null);
  const [brushColor, setBrushColor] = useState("#ff0000");
  const [isCropping, setIsCropping] = useState(true);
  const [canvasReady, setCanvasReady] = useState(false);
  const [displayDims, setDisplayDims] = useState({ w: 320, h: 400 });
  
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const imgRef = useRef(null);
  const canvasRef = useRef(null);

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

  // --- Original Multi-Media Functionality ---
  const addMediaSlot = (type) => setMediaItems([...mediaItems, { type, value: "", mode: "url" }]);
  const removeMediaSlot = (index) => setMediaItems(mediaItems.filter((_, i) => i !== index));
  const updateMediaValue = (index, val, mode = "url") => {
    const updated = [...mediaItems];
    updated[index].value = val;
    updated[index].mode = mode;
    setMediaItems(updated);
  };

  // --- ✂️ High-Resolution Crop Logic ---
  const getCroppedImg = async () => {
    const image = imgRef.current;
    if (!completedCrop || !image) return;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const canvas = document.createElement('canvas');
    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;

    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0, 0, canvas.width, canvas.height
    );

    const screenWidth = Math.min(window.innerWidth - 60, 350);
    const aspect = completedCrop.height / completedCrop.width;
    setDisplayDims({ w: screenWidth, h: screenWidth * aspect });

    return canvas.toDataURL('image/png');
  };

  // --- 🎨 HD Finalization (Markup Merging) ---
  const finalizeImage = async () => {
    const drawingCanvas = canvasRef.current.canvasContainer.children[1];
    const bgImg = new Image();
    bgImg.src = tempImage;

    bgImg.onload = async () => {
      const finalCanvas = document.createElement("canvas");
      finalCanvas.width = bgImg.width;
      finalCanvas.height = bgImg.height;
      const ctx = finalCanvas.getContext("2d");
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      ctx.drawImage(bgImg, 0, 0);
      ctx.save();
      ctx.scale(finalCanvas.width / displayDims.w, finalCanvas.height / displayDims.h);
      ctx.drawImage(drawingCanvas, 0, 0);
      ctx.restore();
      
      const dataUrl = finalCanvas.toDataURL("image/png");
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], `hq_post_${Date.now()}.png`, { type: "image/png" });

      updateMediaValue(activeEditIndex, file, "file");
      setTempImage(null);
      setCanvasReady(false);
      toast.success("Image Finalized! ✨");
    };
  };

  // --- 🔥 Improved Logic: Selects file but doesn't open Modal ---
  const handleFileChange = (index, file) => {
    if (!file) return;
    updateMediaValue(index, file, "file");
  };

  // --- 🔥 Trigger Editor Manually via Button ---
  const handleOpenEditor = (index) => {
    const item = mediaItems[index];
    if (!item.value) return toast.error("Bhai, pehle image select karo!");

    setActiveEditIndex(index);
    setIsCropping(true);
    setCanvasReady(false);

    if (item.value instanceof File) {
      const reader = new FileReader();
      reader.onload = () => setTempImage(reader.result);
      reader.readAsDataURL(item.value);
    } else {
      setTempImage(item.value);
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm("Bhai, pakka delete karna hai?")) return;
    try {
      const res = await fetch(`${API_URL}/api/english-posts/delete/${postId}`, { method: "DELETE" });
      if (res.ok) { toast.success("Post Removed"); fetchMyPosts(); }
    } catch (err) { toast.error("Delete Failed"); }
  };

  const startEdit = (post) => {
    setEditingId(post._id);
    setWord(post.word);
    setMeaning(post.meaning);
    const existingMedia = post.media?.map(m => ({ type: m.type, value: m.url, mode: "url" })) || [];
    setMediaItems(existingMedia);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    if (!word.trim()) return toast.error("Bhai, Word toh likho! ✍️");
    
    const hindiRegex = /[\u0900-\u097F]/;
    const englishRegex = /[a-zA-Z]/;
    if (!meaning.trim()) return toast.error("Hindi Meaning anivarya hai! ❌");
    if (englishRegex.test(meaning)) return toast.error("Hindi Meaning mein English allow nahi hai! ✋");
    if (!hindiRegex.test(meaning)) return toast.error("Hindi Meaning mein Hindi characters hone chahiye! ✋");

    if (mediaItems.length === 0) return toast.error("Add at least one item!");
    
    setUploading(true);
    const dataToSend = new FormData();
    dataToSend.append("word", word);
    dataToSend.append("meaning", meaning);
    dataToSend.append("userEmail", localStorage.getItem("eng_userEmail"));

    const mediaMetadata = [];
    mediaItems.forEach((item) => {
      if (item.mode === "file" && item.value) {
        dataToSend.append("images", item.value); 
        mediaMetadata.push({ type: item.type, mode: "file" });
      } else {
        mediaMetadata.push({ type: item.type, mode: "url", url: item.value });
      }
    });
    dataToSend.append("mediaMetadata", JSON.stringify(mediaMetadata));

    try {
      const url = editingId ? `${API_URL}/api/english-posts/update/${editingId}` : `${API_URL}/api/english-posts/create`;
      const res = await fetch(url, { method: editingId ? "PUT" : "POST", body: dataToSend });
      if (res.ok) {
        toast.success(editingId ? "Entry Updated" : "Sequence Published");
        setWord(""); setMeaning(""); setMediaItems([]); setEditingId(null);
        fetchMyPosts();
      }
    } catch (err) { toast.error("Failed"); }
    finally { setUploading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-24 flex flex-col items-center">
      
      {/* ✂️🖼️ EDITOR MODAL (Triggered only by button) */}
      {tempImage && (
        <div className="fixed inset-0 z-[10000] bg-black/95 flex flex-col items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white p-5 rounded-[2.5rem] w-full max-w-sm shadow-2xl my-auto">
            <div className="flex justify-between items-center mb-4 px-1">
               <h3 className="text-[10px] font-black uppercase text-gray-400 italic">{isCropping ? "1. High-Res Crop" : "2. HD Markup"}</h3>
               <button onClick={() => {setTempImage(null); setCanvasReady(false);}} className="text-[10px] font-black text-red-500 uppercase p-2">Cancel</button>
            </div>

            {isCropping ? (
              <div className="bg-gray-50 rounded-3xl overflow-hidden p-2 flex justify-center border border-gray-100 max-h-[450px] overflow-y-auto">
                <ReactCrop crop={crop} onChange={(c) => setCrop(c)} onComplete={(c) => setCompletedCrop(c)}>
                  <img ref={imgRef} src={tempImage} onLoad={(e) => setCrop(centerCrop(makeAspectCrop({ unit: '%', width: 90 }, undefined, e.currentTarget.width, e.currentTarget.height), e.currentTarget.width, e.currentTarget.height))} alt="" className="max-w-full h-auto" />
                </ReactCrop>
              </div>
            ) : (
              <div className="rounded-3xl overflow-hidden border bg-gray-50 flex flex-col items-center justify-center relative shadow-inner mx-auto" style={{ width: displayDims.w, height: displayDims.h }}>
                <img src={tempImage} className="absolute inset-0 w-full h-full object-cover" alt="" />
                {!canvasReady ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                    {setTimeout(() => setCanvasReady(true), 600) && null}
                  </div>
                ) : (
                  <CanvasDraw ref={canvasRef} brushColor={brushColor} brushRadius={3} backgroundColor="transparent" canvasWidth={displayDims.w} canvasHeight={displayDims.h} lazyRadius={0} className="relative z-10" />
                )}
              </div>
            )}

            <div className="flex flex-col gap-3 mt-6">
              {!isCropping && (
                <div className="flex justify-between items-center px-1">
                  <input type="color" value={brushColor} onChange={e => setBrushColor(e.target.value)} className="w-10 h-10 rounded-full border-0 shadow-md cursor-pointer" />
                  <button onClick={() => canvasRef.current.undo()} className="text-[10px] font-black uppercase text-gray-500">Undo</button>
                </div>
              )}
              <button onClick={isCropping ? async () => { const hq = await getCroppedImg(); setTempImage(hq); setIsCropping(false); setCanvasReady(false); } : finalizeImage} 
                className={`w-full ${isCropping ? 'bg-black' : 'bg-red-500'} text-white py-4 rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl active:scale-95 transition-all`}>
                {isCropping ? "Confirm Selection" : "Save Final HD"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 📤 Multi-Media Upload Card */}
      <div className="w-full max-w-sm bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 mb-8">
        <h2 className="text-xl font-black italic uppercase mb-4 px-1">{editingId ? "Edit Sequence" : "New Sequence"}</h2>
        <form onSubmit={handleFinalSubmit} className="space-y-3">
          <input type="text" placeholder="Word" value={word} className="w-full p-4 bg-gray-50 rounded-2xl outline-none border focus:border-red-500 text-sm font-bold" onChange={e => setWord(e.target.value)} />
          <input type="text" placeholder="Hindi Meaning" value={meaning} className="w-full p-4 bg-gray-50 rounded-2xl outline-none border focus:border-red-500 text-sm font-bold" onChange={e => setMeaning(e.target.value)} />

          <div className="space-y-2 py-2">
            {mediaItems.map((item, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex justify-between items-center mb-2 px-1">
                  <span className="text-[9px] font-black uppercase text-gray-400 italic">#{index + 1} {item.type}</span>
                  <div className="flex gap-1">
                    <button type="button" onClick={() => updateMediaValue(index, "", "file")} className={`px-2 py-1 rounded-lg text-[8px] font-bold ${item.mode === 'file' ? 'bg-red-500 text-white' : 'bg-gray-200'}`}>File</button>
                    <button type="button" onClick={() => updateMediaValue(index, "", "url")} className={`px-2 py-1 rounded-lg text-[8px] font-bold ${item.mode === 'url' ? 'bg-red-500 text-white' : 'bg-gray-200'}`}>Link</button>
                    <button type="button" onClick={() => removeMediaSlot(index)} className="ml-1 text-gray-300 font-bold px-1 text-xs">×</button>
                  </div>
                </div>

                {item.mode === "file" ? (
                  <div className="space-y-2">
                    {item.value && (
                      <div className="w-full h-32 rounded-xl overflow-hidden bg-white border">
                         <img src={item.value instanceof File ? URL.createObjectURL(item.value) : item.value} className="w-full h-full object-contain" alt="" />
                      </div>
                    )}
                    <input type="file" accept={item.type === 'video' ? 'video/*' : 'image/*' } onChange={(e) => handleFileChange(index, e.target.files[0])} className="text-[10px] w-full" />
                    
                    {/* 🔥 Separate Edit Button: Sirf image hone par hi dikhega */}
                    {item.value && item.type === 'image' && (
                      <button type="button" onClick={() => handleOpenEditor(index)} className="bg-blue-50 text-blue-600 text-[9px] font-black py-2.5 rounded-xl border border-blue-100 uppercase tracking-tighter w-full mt-2 active:scale-95 transition-all">⚡ Edit / Markup</button>
                    )}
                  </div>
                ) : (
                  <input type="text" placeholder={`Paste ${item.type} URL`} value={item.value} className="w-full bg-transparent border-b border-gray-200 text-xs py-1 outline-none font-bold" onChange={(e) => updateMediaValue(index, e.target.value, "url")} />
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-2 pb-2">
            <button type="button" onClick={() => addMediaSlot('image')} className="flex-1 bg-gray-100 py-2.5 rounded-xl text-[9px] font-black uppercase text-gray-600 tracking-wider">+ Image</button>
            <button type="button" onClick={() => addMediaSlot('video')} className="flex-1 bg-gray-100 py-2.5 rounded-xl text-[9px] font-black uppercase text-gray-600">+ Video</button>
            <button type="button" onClick={() => addMediaSlot('embed')} className="flex-1 bg-gray-100 py-2.5 rounded-xl text-[9px] font-black uppercase text-gray-600">+ YT</button>
          </div>

          <button disabled={uploading} className="w-full bg-red-500 text-white p-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg disabled:bg-gray-300 active:scale-95 transition-all">
            {uploading ? "Publishing..." : (editingId ? "Update Entry" : "Post Sequence")}
          </button>
        </form>
      </div>

      {/* 🖼️ My Archive Section */}
      <div className="w-full max-w-sm">
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-2 italic">My Archive</h3>
        {loading ? <p className="text-center font-bold text-gray-300 animate-pulse">Syncing...</p> : 
          myPosts.map((post) => (
            <div key={post._id} className="bg-white mb-8 rounded-[2.5rem] overflow-hidden shadow-sm border border-gray-100 relative">
              <div className="absolute top-4 right-4 flex gap-2 z-10">
                <button onClick={() => startEdit(post)} className="w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full shadow-md flex items-center justify-center text-xs border border-gray-100">✍️</button>
                <button onClick={() => handleDelete(post._id)} className="w-9 h-9 bg-red-500 rounded-full shadow-lg flex items-center justify-center text-white text-xs font-sans">×</button>
              </div>
              <img src={post.media?.[0]?.url || post.image} className="w-full h-64 object-cover" alt="" />
              <div className="flex justify-between items-center px-6 py-5">
                <div className="flex flex-col">
                  <h3 className="font-black text-xl text-gray-800 uppercase leading-none italic tracking-tighter">{post.word}</h3>
                  <span className="text-[8px] font-black text-gray-300 uppercase mt-1 tracking-widest">Sequence: {post.media?.length || 1} Items</span>
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