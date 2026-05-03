import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import CanvasDraw from "react-canvas-draw";
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

export default function EnglishAppMyPosts() {
  const [dbPosts, setDbPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [word, setWord] = useState("");
  const [meaning, setMeaning] = useState("");
  const [mediaItems, setMediaItems] = useState([]);
  const [editingId, setEditingId] = useState(null);

  // 🎨 Editor States
  const [tempImage, setTempImage] = useState(null);
  const [activeEditIndex, setActiveEditIndex] = useState(null);
  const [brushColor, setBrushColor] = useState("#ff0000");
  const [isCropping, setIsCropping] = useState(true);
  
  // ✂️ Selector States (React-Image-Crop)
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
      setDbPosts(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchMyPosts(); }, []);

  const addMediaSlot = (type) => setMediaItems([...mediaItems, { type, value: "", mode: "url" }]);
  const removeMediaSlot = (index) => setMediaItems(mediaItems.filter((_, i) => i !== index));
  const updateMediaValue = (index, val, mode = "url") => {
    const updated = [...mediaItems];
    updated[index].value = val;
    updated[index].mode = mode;
    setMediaItems(updated);
  };

  // 🔥 Default Selector Frame Setup
  function onImageLoad(e) {
    const { width, height } = e.currentTarget;
    const initialCrop = centerCrop(
      makeAspectCrop({ unit: '%', width: 80 }, undefined, width, height),
      width,
      height
    );
    setCrop(initialCrop);
  }

  // ✂️ Logic to Cut Image based on Selector
  const getCroppedImg = async () => {
    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );

    return canvas.toDataURL('image/jpeg', 0.9);
  };

  const handleFileChange = (index, file) => {
    if (!file) return;
    // Puraana logic as it is: direct state update
    updateMediaValue(index, file, "file");

    if (file.type.startsWith("video/")) return;

    const reader = new FileReader();
    reader.onload = () => {
      setTempImage(reader.result);
      setActiveEditIndex(index);
      setIsCropping(true);
    };
    reader.readAsDataURL(file);
  };

  const finalizeImage = async () => {
    const finalDataUrl = canvasRef.current.getDataURL("image/png", false, "#ffffff");
    const res = await fetch(finalDataUrl);
    const blob = await res.blob();
    const file = new File([blob], `edit_${Date.now()}.png`, { type: "image/png" });
    updateMediaValue(activeEditIndex, file, "file");
    setTempImage(null);
    setActiveEditIndex(null);
    toast.success("Markup Applied! 🎨");
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    if (!word.trim() || !meaning.trim()) return toast.error("Word/Meaning Missing!");
    setUploading(true);
    const dataToSend = new FormData();
    dataToSend.append("word", word);
    dataToSend.append("meaning", meaning);
    dataToSend.append("userEmail", localStorage.getItem("eng_userEmail"));
    
    mediaItems.forEach((item) => {
      if (item.mode === "file" && item.value) {
        dataToSend.append("images", item.value);
      }
    });
    
    dataToSend.append("mediaMetadata", JSON.stringify(mediaItems.map(m => ({type: m.type, mode: m.mode, url: m.mode === 'url' ? m.value : null}))));

    try {
      const url = editingId ? `${API_URL}/api/english-posts/update/${editingId}` : `${API_URL}/api/english-posts/create`;
      const res = await fetch(url, { method: editingId ? "PUT" : "POST", body: dataToSend });
      if (res.ok) { fetchMyPosts(); setWord(""); setMeaning(""); setMediaItems([]); setEditingId(null); toast.success("Success! 🚀"); }
    } catch (err) { toast.error("Fail!"); }
    finally { setUploading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-24 font-sans flex flex-col items-center">
      
      {/* ✂️🖼️ MANUAL SELECTOR MODAL */}
      {tempImage && (
        <div className="fixed inset-0 z-[10000] bg-black/95 flex flex-col items-center justify-start p-4 overflow-y-auto">
          <div className="bg-white p-5 rounded-[2.5rem] w-full max-w-sm shadow-2xl my-auto">
            <div className="flex justify-between items-center mb-4">
               <h3 className="text-[10px] font-black uppercase text-gray-400 italic">
                 {isCropping ? "Resize Selection Frame" : "Add Your Markup"}
               </h3>
               <button onClick={() => setTempImage(null)} className="text-[10px] font-black text-red-500 uppercase p-2">Cancel</button>
            </div>

            {isCropping ? (
              <div className="bg-gray-50 rounded-3xl overflow-hidden p-2 flex justify-center border border-gray-100 max-h-[60vh] overflow-y-auto" style={{ touchAction: 'none' }}>
                <ReactCrop
                  crop={crop}
                  onChange={(c) => setCrop(c)}
                  onComplete={(c) => setCompletedCrop(c)}
                >
                  <img 
                    ref={imgRef} 
                    src={tempImage} 
                    onLoad={onImageLoad} 
                    alt="to crop" 
                    className="max-w-full h-auto"
                  />
                </ReactCrop>
              </div>
            ) : (
              <div className="rounded-3xl overflow-hidden border bg-gray-50 flex flex-col items-center">
                <div className="flex w-full justify-between p-3 bg-gray-100 border-b border-gray-200">
                   <input type="color" value={brushColor} onChange={e => setBrushColor(e.target.value)} className="w-8 h-8 rounded-full border-0 cursor-pointer shadow-sm" />
                   <button onClick={() => canvasRef.current.undo()} className="text-[10px] font-black uppercase text-gray-500">Undo</button>
                </div>
                <CanvasDraw 
                  ref={canvasRef} 
                  brushColor={brushColor} 
                  brushRadius={3} 
                  imgSrc={tempImage} 
                  canvasWidth={window.innerWidth < 400 ? window.innerWidth - 80 : 320} 
                  canvasHeight={400} 
                  lazyRadius={0} 
                  enablePanAndZoom={false}
                />
              </div>
            )}

            <div className="flex gap-2 mt-6">
              {isCropping ? (
                <button 
                  onClick={async () => { 
                    if (!completedCrop?.width) return toast.error("Area select karo!");
                    const cropped = await getCroppedImg();
                    setTempImage(cropped);
                    setIsCropping(false); 
                  }} 
                  className="w-full bg-black text-white py-4 rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl active:scale-95 transition-all"
                >
                  Confirm Selection
                </button>
              ) : (
                <button 
                  onClick={finalizeImage} 
                  className="w-full bg-red-500 text-white py-4 rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl shadow-red-200 active:scale-95 transition-all"
                >
                  Apply & Finalize
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 📤 FORM AREA */}
      <div className="w-full max-w-sm bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm mb-8">
        <h2 className="text-xl font-black italic uppercase mb-4 px-1">{editingId ? "Edit" : "New"} Post</h2>
        <form onSubmit={handleFinalSubmit} className="space-y-3">
          <input type="text" placeholder="Word" value={word} className="w-full p-4 bg-gray-50 rounded-2xl outline-none border focus:border-red-500 text-sm font-bold" onChange={e => setWord(e.target.value)} />
          <input type="text" placeholder="Hindi Meaning" value={meaning} className="w-full p-4 bg-gray-50 rounded-2xl outline-none border focus:border-red-500 text-sm font-bold" onChange={e => setMeaning(e.target.value)} />

          <div className="space-y-2 py-2">
            {mediaItems.map((item, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[9px] font-black uppercase text-gray-400 italic">#{index+1} {item.type}</span>
                  <div className="flex gap-1">
                    <button type="button" onClick={() => updateMediaValue(index, "", "file")} className={`px-2 py-1 rounded-lg text-[8px] font-bold ${item.mode==='file'?'bg-red-500 text-white':'bg-gray-200'}`}>File</button>
                    <button type="button" onClick={() => updateMediaValue(index, "", "url")} className={`px-2 py-1 rounded-lg text-[8px] font-bold ${item.mode==='url'?'bg-red-500 text-white':'bg-gray-200'}`}>Link</button>
                    <button type="button" onClick={() => removeMediaSlot(index)} className="ml-1 text-gray-400 font-bold font-sans text-xs">×</button>
                  </div>
                </div>

                {item.mode === "file" ? (
                  <div className="flex flex-col gap-2">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => handleFileChange(index, e.target.files[0])} 
                      className="text-[10px] w-full" 
                    />
                    {/* 🔥 Manual Button: tabhi dikhega jab file select ho jayegi */}
                    {item.value && (item.value instanceof File || typeof item.value === 'string') && (
                      <button 
                        type="button"
                        onClick={() => {
                          const reader = new FileReader();
                          reader.onload = () => {
                            setTempImage(reader.result);
                            setActiveEditIndex(index);
                            setIsCropping(true);
                          };
                          // Agar editing mode mein string URL hai toh direct reader ki zarurat nahi, 
                          // par handleFileChange file object deta hai.
                          if(item.value instanceof File) {
                             reader.readAsDataURL(item.value);
                          } else {
                             setTempImage(item.value);
                             setActiveEditIndex(index);
                             setIsCropping(true);
                          }
                        }}
                        className="bg-blue-50 text-blue-600 text-[10px] font-black py-2.5 rounded-xl border border-blue-100 uppercase"
                      >
                        ⚡ Edit / Crop Image
                      </button>
                    )}
                  </div>
                ) : (
                  <input type="text" placeholder="URL" value={item.value} className="w-full bg-transparent border-b border-gray-200 text-xs py-1 outline-none font-bold" onChange={(e) => updateMediaValue(index, e.target.value, "url")} />
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <button type="button" onClick={() => addMediaSlot('image')} className="flex-1 bg-gray-100 py-3 rounded-xl text-[9px] font-black uppercase tracking-wider text-gray-600 active:scale-95 transition-all">+ Image</button>
            <button type="button" onClick={() => addMediaSlot('video')} className="flex-1 bg-gray-100 py-3 rounded-xl text-[9px] font-black uppercase tracking-wider text-gray-600 active:scale-95 transition-all">+ Video</button>
            <button type="button" onClick={() => addMediaSlot('embed')} className="flex-1 bg-gray-100 py-3 rounded-xl text-[9px] font-black uppercase tracking-wider text-gray-600 active:scale-95 transition-all">+ YT</button>
          </div>

          <button disabled={uploading} className="w-full bg-red-500 text-white p-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg disabled:bg-gray-300">
            {uploading ? "Publishing..." : (editingId ? "Update" : "Post Sequence")}
          </button>
        </form>
      </div>

      {/* 🖼️ Archive */}
      <div className="w-full max-w-[450px]">
        {dbPosts.map((post) => (
          <div key={post._id} id={post._id} className="mb-12 border-b border-gray-100 pb-6 bg-white rounded-[2.5rem] overflow-hidden shadow-sm relative">
            <div className="absolute top-4 right-4 flex gap-2 z-10">
               <button onClick={() => { setEditingId(post._id); setWord(post.word); setMeaning(post.meaning); window.scrollTo({top:0, behavior:'smooth'}); }} className="w-9 h-9 bg-white/90 rounded-full shadow-md flex items-center justify-center">✍️</button>
               <button onClick={async () => { if(window.confirm("Delete?")) { await fetch(`${API_URL}/api/english-posts/delete/${post._id}`, {method:"DELETE"}); fetchMyPosts(); } }} className="w-9 h-9 bg-red-500 rounded-full shadow-md text-white">🗑️</button>
            </div>
            <img src={post.media?.[0]?.url || post.image} className="w-full h-64 object-cover" alt="" />
            <div className="px-6 py-5 flex justify-between items-center">
               <div>
                  <h3 className="font-black text-2xl uppercase italic tracking-tighter leading-none">{post.word}</h3>
                  <p className="text-[8px] font-black text-gray-300 uppercase mt-1 italic">{post.media?.length || 1} Items</p>
               </div>
               <span className="bg-red-50 text-red-500 px-4 py-1.5 rounded-xl text-sm font-black italic">{post.meaning}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}