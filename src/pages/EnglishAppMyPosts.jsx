import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import * as fabric from "fabric"; 
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

export default function EnglishAppMyPosts() {
  const [myPosts, setMyPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [translating, setTranslating] = useState(false); 
  const [word, setWord] = useState("");
  const [meaning, setMeaning] = useState("");
  const [mediaItems, setMediaItems] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [tempImage, setTempImage] = useState(null);
  const [activeEditIndex, setActiveEditIndex] = useState(null);
  const [brushColor, setBrushColor] = useState("#ff0000");
  const [isCropping, setIsCropping] = useState(true);
  const [displayDims, setDisplayDims] = useState({ w: 320, h: 400 });
  const [drawMode, setDrawMode] = useState("select"); 
  
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const imgRef = useRef(null);
  const fabricCanvasRef = useRef(null);

  const navigate = useNavigate();
  const API_URL = window.location.hostname === "localhost" 
    ? "http://localhost:3000" : "https://serdeptry1st.onrender.com";

  const handleAutoTranslate = async (englishWord) => {
    if (!englishWord || englishWord.trim().length < 2 || editingId) return;
    setTranslating(true);
    try {
      const res = await fetch(`${API_URL}/api/english-posts/auto-translate?text=${englishWord}`);
      const data = await res.json();
      if (data.success && data.translated) {
        setMeaning(data.translated);
        toast.success("Google AI Meaning Added! ✨", { 
          style: { borderRadius: '15px', background: '#333', color: '#fff', fontSize: '10px' } 
        });
      }
    } catch (err) { console.error("Translation Error:", err); } 
    finally { setTranslating(false); }
  };

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

  useEffect(() => {
    if (!isCropping && tempImage) {
      const timeout = setTimeout(() => {
        if (fabric && fabric.Canvas) {
          const canvas = new fabric.Canvas("fabric-canvas", {
            width: displayDims.w,
            height: displayDims.h,
            backgroundColor: "transparent",
          });
          fabricCanvasRef.current = canvas;
        }
      }, 200);
      return () => {
        clearTimeout(timeout);
        if (fabricCanvasRef.current) {
          fabricCanvasRef.current.dispose();
          fabricCanvasRef.current = null;
        }
      };
    }
  }, [isCropping, tempImage, displayDims]);

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (canvas) {
      if (drawMode === "free") {
        if (!canvas.freeDrawingBrush) canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
        canvas.isDrawingMode = true;
        canvas.freeDrawingBrush.color = brushColor;
        canvas.freeDrawingBrush.width = 4;
      } else {
        canvas.isDrawingMode = false;
      }
      canvas.renderAll();
    }
  }, [drawMode, brushColor]);

  // --- 🎨 DESIGN TOOLS ---
  const addRect = () => {
    if (!fabricCanvasRef.current) return;
    setDrawMode("select");
    const rect = new fabric.Rect({
      left: 50, top: 50, fill: 'transparent', stroke: brushColor,
      strokeWidth: 4, width: 80, height: 80, cornerColor: 'blue'
    });
    fabricCanvasRef.current.add(rect);
    fabricCanvasRef.current.setActiveObject(rect);
  };

  const addCircle = () => {
    if (!fabricCanvasRef.current) return;
    setDrawMode("select");
    const circle = new fabric.Circle({
      left: 70, top: 70, fill: 'transparent', stroke: brushColor,
      strokeWidth: 4, radius: 45, cornerColor: 'blue'
    });
    fabricCanvasRef.current.add(circle);
    fabricCanvasRef.current.setActiveObject(circle);
  };

  const addArrow = () => {
    if (!fabricCanvasRef.current) return;
    setDrawMode("select");
    const arrow = new fabric.Path('M 0 0 L 50 0 M 50 0 L 40 -5 M 50 0 L 40 5', {
      left: 100, top: 100, stroke: brushColor, strokeWidth: 4,
      fill: 'transparent', scaleX: 2, scaleY: 2, cornerColor: 'blue'
    });
    fabricCanvasRef.current.add(arrow);
    fabricCanvasRef.current.setActiveObject(arrow);
  };

  // 🔥 NEW: TEXT TOOL
  const addText = () => {
    if (!fabricCanvasRef.current) return;
    setDrawMode("select");
    const text = new fabric.IText("Double Tap to Edit", {
      left: 50, top: 150, fontFamily: 'Arial', fontWeight: '900',
      fontSize: 28, fill: brushColor, fontStyle: 'italic', cornerColor: 'red'
    });
    fabricCanvasRef.current.add(text);
    fabricCanvasRef.current.setActiveObject(text);
    fabricCanvasRef.current.renderAll();
  };

  // 🔥 NEW: UNDO LOGIC
  const undo = () => {
    if (!fabricCanvasRef.current) return;
    const canvas = fabricCanvasRef.current;
    const objects = canvas.getObjects();
    if (objects.length > 0) {
      canvas.remove(objects[objects.length - 1]);
      canvas.renderAll();
    }
  };

  const deleteSelected = () => {
    if (!fabricCanvasRef.current) return;
    const canvas = fabricCanvasRef.current;
    const active = canvas.getActiveObjects();
    if (active.length > 0) {
      active.forEach(obj => canvas.remove(obj));
      canvas.discardActiveObject();
      canvas.renderAll();
    }
  };

  const getCroppedImg = async () => {
    const image = imgRef.current;
    if (!completedCrop || !image) return;
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const canvas = document.createElement('canvas');
    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(image, completedCrop.x * scaleX, completedCrop.y * scaleY, completedCrop.width * scaleX, completedCrop.height * scaleY, 0, 0, canvas.width, canvas.height);
    const screenW = Math.min(window.innerWidth - 60, 350);
    setDisplayDims({ w: screenW, h: screenW * (completedCrop.height / completedCrop.width) });
    return canvas.toDataURL('image/png');
  };

  const finalizeImage = async () => {
    const bgImg = new Image();
    bgImg.src = tempImage;
    bgImg.onload = async () => {
      const finalCanvas = document.createElement("canvas");
      finalCanvas.width = bgImg.naturalWidth;
      finalCanvas.height = bgImg.naturalHeight;
      const ctx = finalCanvas.getContext("2d");
      ctx.drawImage(bgImg, 0, 0);
      const multiplier = bgImg.naturalWidth / displayDims.w;
      const fabricDataURL = fabricCanvasRef.current.toDataURL({ format: 'png', multiplier });
      const overlayImg = new Image();
      overlayImg.src = fabricDataURL;
      overlayImg.onload = async () => {
        ctx.drawImage(overlayImg, 0, 0);
        const blob = await new Promise(r => finalCanvas.toBlob(r, 'image/png'));
        updateMediaValue(activeEditIndex, new File([blob], `final_${Date.now()}.png`, { type: "image/png" }), "file");
        setTempImage(null);
        toast.success("Design Saved! 🚀");
      };
    };
  };

  const addMediaSlot = (type) => setMediaItems([...mediaItems, { type, value: "", mode: "url" }]);
  const removeMediaSlot = (index) => setMediaItems(mediaItems.filter((_, i) => i !== index));
  const updateMediaValue = (index, val, mode = "url") => {
    const updated = [...mediaItems];
    updated[index].value = val;
    updated[index].mode = mode;
    setMediaItems(updated);
  };

  const handleFileChange = (index, file) => {
    if (!file) return;
    updateMediaValue(index, file, "file");
  };

  const handleOpenEditor = (index) => {
    const item = mediaItems[index];
    if (!item.value) return toast.error("Bhai, image select karo!");
    setActiveEditIndex(index);
    setIsCropping(true);
    if (item.value instanceof File) {
      const reader = new FileReader();
      reader.onload = () => setTempImage(reader.result);
      reader.readAsDataURL(item.value);
    } else { setTempImage(item.value); }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm("Bhai delete karu?")) return;
    try {
      const res = await fetch(`${API_URL}/api/english-posts/delete/${postId}`, { method: "DELETE" });
      if (res.ok) { toast.success("Post Removed"); fetchMyPosts(); }
    } catch (err) { toast.error("Failed"); }
  };

  const startEdit = (post) => {
    setEditingId(post._id);
    setWord(post.word);
    setMeaning(post.meaning);
    setMediaItems(post.media?.map(m => ({ type: m.type, value: m.url, mode: "url" })) || []);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    if (!word.trim()) return toast.error("Word missing!");
    const hindiRegex = /[\u0900-\u097F]/;
    const englishRegex = /[a-zA-Z]/;
    if (!meaning.trim() || englishRegex.test(meaning) || !hindiRegex.test(meaning)) {
      return toast.error("Hindi Meaning error! ✋");
    }
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
    dataToSend.append("mediaMetadata", JSON.stringify(mediaItems.map(m => ({ type: m.type, mode: m.mode, url: m.mode === 'url' ? m.value : null }))));
    try {
      const url = editingId ? `${API_URL}/api/english-posts/update/${editingId}` : `${API_URL}/api/english-posts/create`;
      const res = await fetch(url, { method: editingId ? "PUT" : "POST", body: dataToSend });
      if (res.ok) {
        toast.success("Published! 🚀");
        setWord(""); setMeaning(""); setMediaItems([]); setEditingId(null);
        fetchMyPosts();
      }
    } catch (err) { toast.error("Failed"); }
    finally { setUploading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-24 flex flex-col items-center font-sans">
      
      {/* ✂️🖼️ EDITOR MODAL */}
      {tempImage && (
        <div className="fixed inset-0 z-[10000] bg-black/95 flex flex-col items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white p-5 rounded-[2.5rem] w-full max-w-sm shadow-2xl my-auto">
            <div className="flex justify-between items-center mb-4 px-1">
                <h3 className="text-[10px] font-black uppercase text-gray-400 italic">{isCropping ? "1. Crop" : "2. Design Studio"}</h3>
                <button onClick={() => setTempImage(null)} className="text-[10px] font-black text-red-500 uppercase p-2">Cancel</button>
            </div>

            {isCropping ? (
              <div className="bg-gray-50 rounded-3xl overflow-hidden p-2 flex justify-center border border-gray-100 max-h-[400px] overflow-auto">
                <ReactCrop crop={crop} onChange={c => setCrop(c)} onComplete={c => setCompletedCrop(c)}>
                  <img ref={imgRef} src={tempImage} onLoad={e => setCrop(centerCrop(makeAspectCrop({ unit: '%', width: 90 }, undefined, e.currentTarget.width, e.currentTarget.height), e.currentTarget.width, e.currentTarget.height))} alt="" className="max-w-full h-auto" />
                </ReactCrop>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-4 gap-1.5 bg-gray-100 p-1.5 rounded-2xl">
                  <button onClick={() => setDrawMode("free")} className={`p-2 rounded-xl text-[8px] font-black uppercase ${drawMode === 'free' ? 'bg-black text-white' : 'bg-white text-gray-400'}`}>Brush</button>
                  <button onClick={addRect} className="p-2 bg-white rounded-xl text-[8px] font-black uppercase">Rect</button>
                  <button onClick={addCircle} className="p-2 bg-white rounded-xl text-[8px] font-black uppercase">Circle</button>
                  <button onClick={addArrow} className="p-2 bg-white rounded-xl text-[8px] font-black uppercase">Arrow</button>
                  <button onClick={addText} className="p-2 bg-white rounded-xl text-[8px] font-black uppercase text-blue-600">Text</button>
                  <button onClick={undo} className="p-2 bg-white rounded-xl text-[8px] font-black uppercase">Undo</button>
                  <button onClick={deleteSelected} className="p-2 bg-red-50 text-red-500 rounded-xl text-[8px] font-black uppercase col-span-2">Delete</button>
                </div>
                <div className="rounded-3xl overflow-hidden border bg-gray-50 relative mx-auto shadow-inner" style={{ width: displayDims.w, height: displayDims.h }}>
                  <img src={tempImage} className="absolute inset-0 w-full h-full object-cover pointer-events-none" alt="" />
                  <canvas id="fabric-canvas" className="relative z-10" />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3 mt-6">
              {!isCropping && (
                <div className="flex justify-between items-center px-1">
                  <input type="color" value={brushColor} onChange={e => setBrushColor(e.target.value)} className="w-10 h-10 rounded-full border-0 shadow-md cursor-pointer" />
                  <button onClick={() => setDrawMode("select")} className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase ${drawMode === 'select' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-400'}`}>Move Tool</button>
                </div>
              )}
              <button onClick={isCropping ? async () => { const hq = await getCroppedImg(); setTempImage(hq); setIsCropping(false); } : finalizeImage} 
                className={`w-full ${isCropping ? 'bg-black' : 'bg-red-500'} text-white py-4 rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl active:scale-95 transition-all`}>
                {isCropping ? "Next: Shapes" : "Save Final HD"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 📤 FORM AREA */}
      <div className="w-full max-w-sm bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 mb-8">
        <h2 className="text-xl font-black italic uppercase mb-4 px-1">{editingId ? "Edit Sequence" : "New Sequence"}</h2>
        <form onSubmit={handleFinalSubmit} className="space-y-3">
          <div className="relative">
            <input type="text" placeholder="Enter English Word" value={word} className="w-full p-4 bg-gray-50 rounded-2xl outline-none border focus:border-red-500 text-sm font-bold uppercase" onChange={e => setWord(e.target.value)} onBlur={() => handleAutoTranslate(word)} />
            {translating && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[8px] font-black text-blue-500 animate-pulse uppercase italic">Translating...</span>}
          </div>
          <input type="text" placeholder="Hindi Meaning" value={meaning} className="w-full p-4 bg-gray-50 rounded-2xl outline-none border focus:border-red-500 text-sm font-bold" onChange={e => setMeaning(e.target.value)} />
          <div className="space-y-3 py-2">
            {mediaItems.map((item, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex justify-between items-center mb-2 px-1">
                  <span className="text-[9px] font-black uppercase text-gray-400 italic">#{index + 1} {item.type}</span>
                  <div className="flex gap-1">
                    <button type="button" onClick={() => updateMediaValue(index, "", "file")} className={`px-2 py-1 rounded-lg text-[8px] font-bold ${item.mode === 'file' ? 'bg-red-500 text-white' : 'bg-gray-200'}`}>File</button>
                    <button type="button" onClick={() => updateMediaValue(index, "", "url")} className={`px-2 py-1 rounded-lg text-[8px] font-bold ${item.mode === 'url' ? 'bg-red-500 text-white' : 'bg-gray-200'}`}>Link</button>
                    <button type="button" onClick={() => removeMediaSlot(index)} className="text-gray-300 font-bold px-1 text-xs">×</button>
                  </div>
                </div>
                {item.mode === "file" ? (
                  <div className="space-y-2">
                    {item.value && (
                      <div className="w-full h-32 rounded-xl overflow-hidden bg-white border">
                         <img src={item.value instanceof File ? URL.createObjectURL(item.value) : item.value} className="w-full h-full object-contain" alt="" />
                      </div>
                    )}
                    <input type="file" onChange={(e) => handleFileChange(index, e.target.files[0])} className="text-[10px] w-full" />
                    {item.value && item.type === 'image' && <button type="button" onClick={() => handleOpenEditor(index)} className="bg-blue-50 text-blue-600 text-[9px] font-black py-2.5 rounded-xl border border-blue-100 uppercase w-full mt-3">⚡ Edit / Design</button>}
                  </div>
                ) : <input type="text" placeholder={`Paste ${item.type} URL`} value={item.value} className="w-full bg-transparent border-b border-gray-200 text-xs py-1 outline-none font-bold" onChange={(e) => updateMediaValue(index, e.target.value, "url")} />}
              </div>
            ))}
          </div>
          <div className="flex gap-2 pb-2">
            <button type="button" onClick={() => addMediaSlot('image')} className="flex-1 bg-gray-100 py-4 rounded-2xl text-[9px] font-black uppercase">+ Image</button>
            <button type="button" onClick={() => addMediaSlot('video')} className="flex-1 bg-gray-100 py-4 rounded-2xl text-[9px] font-black uppercase">+ Video</button>
            <button type="button" onClick={() => addMediaSlot('embed')} className="flex-1 bg-gray-100 py-4 rounded-2xl text-[9px] font-black uppercase">+ YT</button>
          </div>
          <button disabled={uploading || translating} className="w-full bg-red-500 text-white p-5 rounded-[2rem] font-black uppercase text-xs shadow-xl active:scale-95 transition-all disabled:bg-gray-300">
            {uploading ? "Publishing..." : (editingId ? "Update Entry" : "Post Sequence")}
          </button>
        </form>
      </div>

      {/* 🖼️ Archive */}
      <div className="w-full max-w-sm">
        {myPosts.map((post) => (
          <div key={post._id} className="bg-white mb-8 rounded-[2.5rem] overflow-hidden shadow-sm border border-gray-100 relative">
            <div className="absolute top-4 right-4 flex gap-2 z-10">
              <button onClick={() => startEdit(post)} className="w-9 h-9 bg-white/90 rounded-full shadow-md flex items-center justify-center text-xs">✍️</button>
              <button onClick={() => handleDelete(post._id)} className="w-9 h-9 bg-red-500 rounded-full shadow-lg flex items-center justify-center text-white text-xs font-bold">×</button>
            </div>
            <img src={post.media?.[0]?.url || post.image} className="w-full h-64 object-cover" alt="" />
            <div className="flex justify-between items-center px-6 py-5">
              <div>
                <h3 className="font-black text-xl text-gray-800 uppercase italic tracking-tighter">{post.word}</h3>
                <span className="text-[8px] font-black text-gray-300 uppercase">Items: {post.media?.length || 1}</span>
              </div>
              <span className="text-red-500 font-bold text-sm bg-red-50 px-4 py-1.5 rounded-xl italic">{post.meaning}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}