import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import * as fabric from "fabric";
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import Tesseract from "tesseract.js";

export default function EnglishAppMyPosts() {
  const [myPosts, setMyPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [translating, setTranslating] = useState(null);

  // 🔥 Smart Deck States
  const [vocabItems, setVocabItems] = useState([{ word: "", meaning: "", sentence: "" }]);
  const [mediaItems, setMediaItems] = useState([]);
  const [editingId, setEditingId] = useState(null);

  // 🎨 Editor States
  const [tempImage, setTempImage] = useState(null);
  const [activeMediaIndex, setActiveMediaIndex] = useState(null);
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

  // --- 🤖 AUTO TRANSLATE ---
  const handleAutoTranslate = async (englishWord, index) => {
    if (!englishWord || englishWord.trim().length < 2 || editingId) return;
    setTranslating(index);
    try {
      const res = await fetch(`${API_URL}/api/english-posts/auto-translate?text=${encodeURIComponent(englishWord)}`);
      const data = await res.json();
      if (data.success && data.translated) {
        updateVocabValue(index, "meaning", data.translated);
        toast.success("AI Meaning Synced! ✨");
      }
    } catch (err) { console.error(err); }
    finally { setTranslating(null); }
  };

  // --- 🎨 FABRIC ENGINE ---
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
      } else { canvas.isDrawingMode = false; }
      canvas.renderAll();
    }
  }, [drawMode, brushColor]);

  // --- 🖌️ TOOLS ---
  const addRect = () => {
    const rect = new fabric.Rect({ left: 50, top: 50, fill: 'transparent', stroke: brushColor, strokeWidth: 4, width: 80, height: 80 });
    fabricCanvasRef.current?.add(rect);
  };
  const addCircle = () => {
    const circle = new fabric.Circle({ left: 70, top: 70, fill: 'transparent', stroke: brushColor, strokeWidth: 4, radius: 45 });
    fabricCanvasRef.current?.add(circle);
  };
  const addArrow = () => {
    const points = [{ x: 0, y: 5 }, { x: 30, y: 5 }, { x: 30, y: 0 }, { x: 45, y: 10 }, { x: 30, y: 20 }, { x: 30, y: 15 }, { x: 0, y: 15 }];
    const arrow = new fabric.Polygon(points, { left: 100, top: 100, fill: brushColor, scaleX: 1.2, scaleY: 1.2 });
    fabricCanvasRef.current?.add(arrow);
  };
  const addText = () => {
    const text = new fabric.IText("Double Tap", { left: 50, top: 150, fontFamily: 'Arial', fontWeight: '900', fontSize: 24, fill: brushColor });
    fabricCanvasRef.current?.add(text);
  };
  const undo = () => {
    const canvas = fabricCanvasRef.current;
    if (canvas && canvas.getObjects().length > 0) {
      canvas.remove(canvas.getObjects()[canvas.getObjects().length - 1]);
      canvas.renderAll();
    }
  };
  const deleteSelected = () => {
    const canvas = fabricCanvasRef.current;
    if (canvas) {
      canvas.getActiveObjects().forEach(obj => canvas.remove(obj));
      canvas.discardActiveObject().renderAll();
    }
  };

  // --- 🖼️ IMAGE PROCESSING ---
  const getCroppedImg = async () => {
    const image = imgRef.current;
    if (!completedCrop || !image) return;
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const canvas = document.createElement('canvas');
    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, completedCrop.x * scaleX, completedCrop.y * scaleY, completedCrop.width * scaleX, completedCrop.height * scaleY, 0, 0, canvas.width, canvas.height);
    const screenW = Math.min(window.innerWidth - 60, 350);
    setDisplayDims({ w: screenW, h: screenW * (completedCrop.height / completedCrop.width) });
    return canvas.toDataURL('image/png');
  };

  const finalizeImage = async (skipMarkup = false) => {
    const bgImg = new Image();
    bgImg.crossOrigin = "anonymous";
    bgImg.src = tempImage;
    bgImg.onload = async () => {
      const finalCanvas = document.createElement("canvas");
      finalCanvas.width = bgImg.naturalWidth;
      finalCanvas.height = bgImg.naturalHeight;
      const ctx = finalCanvas.getContext("2d");
      ctx.drawImage(bgImg, 0, 0);

      if (!skipMarkup && fabricCanvasRef.current) {
        const multiplier = bgImg.naturalWidth / displayDims.w;
        const fabricDataURL = fabricCanvasRef.current.toDataURL({ format: 'png', multiplier });
        const overlayImg = new Image();
        overlayImg.src = fabricDataURL;
        await new Promise(r => overlayImg.onload = r);
        ctx.drawImage(overlayImg, 0, 0);
      }

      const blob = await new Promise(r => finalCanvas.toBlob(r, 'image/png'));
      const finalFile = new File([blob], `dameeto_${Date.now()}.png`, { type: "image/png" });
      updateMediaValue(activeMediaIndex, finalFile, "file");

      // 🔥 AUTO-SCAN SENTENCE
      const vocabIdx = mediaItems[activeMediaIndex].vocabIndex;
      const scanToast = toast.loading("Dameeto AI: Scanning Text...");
      try {
        const result = await Tesseract.recognize(finalFile, 'eng');
        if (result.data && result.data.text) {
          updateVocabValue(vocabIdx, "sentence", result.data.text.replace(/\n/g, ' ').trim());
          toast.success("Text Found & Filled! 📝", { id: scanToast });
        }
      } catch (e) { toast.error("OCR Failed", { id: scanToast }); }

      setTempImage(null);
    };
  };

  // --- 📺 YT HELPERS ---
  const getYTId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url?.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // --- 📦 DATA HELPERS (FIXED addVocabSlot) ---
  const addVocabSlot = () => setVocabItems([...vocabItems, { word: "", meaning: "", sentence: "" }]);
  
  const removeVocabSlot = (vIdx) => {
    setVocabItems(vocabItems.filter((_, i) => i !== vIdx));
    setMediaItems(mediaItems.filter(m => m.vocabIndex !== vIdx));
  };

  const updateVocabValue = (vIdx, field, val) => {
    const updated = [...vocabItems];
    updated[vIdx][field] = val;
    setVocabItems(updated);
  };

  const addMediaToVocab = (type, vIdx) => {
    setMediaItems([...mediaItems, { type, value: "", mode: "file", vocabIndex: vIdx }]);
  };

  const updateMediaValue = (mIdx, val, mode) => {
    const updated = [...mediaItems];
    updated[mIdx].value = val;
    updated[mIdx].mode = mode;
    setMediaItems(updated);
  };

  const resetForm = () => {
    if (window.confirm("Bhai, clear karu?")) {
      setVocabItems([{ word: "", meaning: "", sentence: "" }]);
      setMediaItems([]);
      setEditingId(null);
      setTempImage(null);
    }
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

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    if (vocabItems.some(i => !i.word.trim())) return toast.error("Word missing!");
    setUploading(true);
    const dataToSend = new FormData();
    dataToSend.append("userEmail", localStorage.getItem("eng_userEmail"));
    dataToSend.append("vocabData", JSON.stringify(vocabItems));

    mediaItems.forEach(item => {
      if (item.value instanceof File) dataToSend.append("images", item.value);
    });

    dataToSend.append("mediaMetadata", JSON.stringify(mediaItems.map(m => ({
      type: m.type, mode: m.mode, url: m.mode === 'url' ? m.value : null, vocabIndex: m.vocabIndex
    }))));

    try {
      const url = editingId ? `${API_URL}/api/english-posts/update/${editingId}` : `${API_URL}/api/english-posts/create`;
      const res = await fetch(url, { method: editingId ? "PUT" : "POST", body: dataToSend });
      if (res.ok) { toast.success("Deck Published! 🚀"); resetForm(); fetchMyPosts(); }
    } catch (err) { toast.error("Failed"); }
    finally { setUploading(false); }
  };

  const startEdit = (post) => {
    setEditingId(post._id);
    setVocabItems(post.vocabData || [{ word: post.word, meaning: post.meaning, sentence: "" }]);
    const reconstructed = [];
    post.vocabData?.forEach((v, vIdx) => {
      v.media?.forEach(m => reconstructed.push({ type: m.type, value: m.url, mode: "url", vocabIndex: vIdx }));
    });
    setMediaItems(reconstructed);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-24 flex flex-col items-center font-sans text-black">

      {/* ✂️ DESIGN EDITOR MODAL */}
      {tempImage && (
        <div className="fixed inset-0 z-[10000] bg-black/95 flex flex-col items-center justify-center p-4">
          <div className="bg-white p-5 rounded-[2.5rem] w-full max-w-sm shadow-2xl overflow-y-auto max-h-[95vh]">
            <div className="flex justify-between items-center mb-4 px-1">
              <h3 className="text-[10px] font-black uppercase text-gray-400 italic">{isCropping ? "1. Crop Area" : "2. Design & Auto-Scan"}</h3>
              <button onClick={() => setTempImage(null)} className="text-[10px] font-black text-red-500 uppercase p-2">✕ Close</button>
            </div>
            
            {isCropping ? (
              <div className="bg-gray-50 rounded-3xl overflow-hidden p-2 flex justify-center border border-gray-100 max-h-[400px] overflow-auto">
                <ReactCrop crop={crop} onChange={c => setCrop(c)} onComplete={c => setCompletedCrop(c)}>
                  <img crossOrigin="anonymous" ref={imgRef} src={tempImage} className="max-w-full h-auto" onLoad={e => setCrop(centerCrop(makeAspectCrop({ unit: '%', width: 90 }, undefined, e.currentTarget.width, e.currentTarget.height), e.currentTarget.width, e.currentTarget.height))} />
                </ReactCrop>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-4 gap-1.5 bg-gray-100 p-1.5 rounded-2xl">
                  <button type="button" onClick={() => setDrawMode("free")} className={`p-2 rounded-xl text-[8px] font-black uppercase ${drawMode === 'free' ? 'bg-black text-white' : 'bg-white'}`}>Brush</button>
                  <button type="button" onClick={addRect} className="p-2 bg-white rounded-xl text-[8px] font-black uppercase">Rect</button>
                  <button type="button" onClick={addCircle} className="p-2 bg-white rounded-xl text-[8px] font-black uppercase">Circle</button>
                  <button type="button" onClick={addArrow} className="p-2 bg-white rounded-xl text-[8px] font-black uppercase">Arrow</button>
                  <button type="button" onClick={addText} className="p-2 bg-white rounded-xl text-[8px] font-black uppercase">Text</button>
                  <button type="button" onClick={undo} className="p-2 bg-white rounded-xl text-[8px] font-black uppercase">Undo</button>
                  <button type="button" onClick={deleteSelected} className="p-2 bg-red-50 text-red-500 rounded-xl text-[8px] font-black uppercase">Del</button>
                  <button type="button" onClick={() => setDrawMode("select")} className={`p-2 rounded-xl text-[8px] font-black uppercase ${drawMode === 'select' ? 'bg-blue-500 text-white' : 'bg-white'}`}>Move</button>
                  <input type="color" value={brushColor} onChange={e => setBrushColor(e.target.value)} className="w-full h-8 rounded-lg border-none" />
                </div>
                <div className="rounded-3xl overflow-hidden border bg-gray-50 relative mx-auto shadow-inner" style={{ width: displayDims.w, height: displayDims.h }}>
                  <img crossOrigin="anonymous" src={tempImage} className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-40" />
                  <canvas id="fabric-canvas" className="relative z-10" />
                </div>
              </div>
            )}

            <div className="flex gap-2 mt-6">
              {isCropping ? (
                 <button onClick={async () => { const hq = await getCroppedImg(); setTempImage(hq); setIsCropping(false); }} className="flex-1 bg-black text-white py-4 rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl">Next: Design</button>
              ) : (
                <>
                  <button onClick={() => finalizeImage(true)} className="flex-1 bg-gray-200 text-black py-4 rounded-2xl font-black uppercase text-[9px]">Skip Design</button>
                  <button onClick={() => finalizeImage(false)} className="flex-[2] bg-red-500 text-white py-4 rounded-2xl font-black uppercase text-[11px] shadow-xl">Save & Scan</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 📥 MAIN DECK FORM */}
      <div className="w-full max-w-sm bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 mb-8 relative">
        <div className="flex justify-between items-center mb-6 px-1">
          <h2 className="text-xl font-black italic uppercase">{editingId ? "Edit Memory" : "Magic Deck"}</h2>
          <button onClick={resetForm} className="text-[10px] font-black text-gray-400 hover:text-red-500 uppercase tracking-tighter">✕ Reset</button>
        </div>
        
        <form onSubmit={handleFinalSubmit} className="space-y-8">
          {vocabItems.map((vItem, vIdx) => (
            <div key={vIdx} className="space-y-4 p-5 bg-gray-50 rounded-[3rem] border border-gray-100 relative shadow-inner">
              {vocabItems.length > 1 && ( <button type="button" onClick={() => removeVocabSlot(vIdx)} className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full font-bold shadow-md">✕</button> )}
              
              <div className="space-y-2">
                <input type="text" placeholder="WORD" value={vItem.word} className="w-full bg-transparent outline-none border-b-2 border-gray-200 py-1 text-sm font-black uppercase italic" 
                  onChange={e => updateVocabValue(vIdx, "word", e.target.value)} onBlur={() => handleAutoTranslate(vItem.word, vIdx)} />
                <input type="text" placeholder="HINDI MEANING" value={vItem.meaning} className="w-full bg-transparent outline-none text-xs font-bold text-red-500 italic" 
                  onChange={e => updateVocabValue(vIdx, "meaning", e.target.value)} />
                {translating === vIdx && <span className="text-[7px] font-black text-blue-500 animate-pulse uppercase">AI Translating...</span>}
                
                <textarea placeholder="PRACTICE SENTENCE (Auto-scans from image)" value={vItem.sentence} className="w-full bg-white rounded-2xl p-4 text-[10px] font-bold mt-2 outline-none border-none resize-none shadow-sm h-20"
                  onChange={e => updateVocabValue(vIdx, "sentence", e.target.value)} />
              </div>

              <div className="space-y-3">
                {mediaItems.filter(m => m.vocabIndex === vIdx).map((mItem) => {
                  const actualIdx = mediaItems.findIndex(m => m === mItem);
                  const ytId = mItem.mode === "url" ? getYTId(mItem.value) : null;
                  const previewUrl = mItem.value instanceof File ? URL.createObjectURL(mItem.value) : mItem.value;
                  return (
                    <div key={actualIdx} className="p-3 bg-white rounded-2xl border border-gray-100 shadow-sm relative">
                      <button type="button" onClick={() => setMediaItems(mediaItems.filter((_, i) => i !== actualIdx))} className="absolute top-1 right-2 text-gray-300 font-bold">✕</button>
                      <div className="flex gap-2 mb-2">
                        <button type="button" onClick={() => updateMediaValue(actualIdx, mItem.value, "file")} className={`flex-1 py-1 rounded-md text-[7px] font-black ${mItem.mode === 'file' ? 'bg-black text-white' : 'bg-gray-100'}`}>FILE</button>
                        <button type="button" onClick={() => updateMediaValue(actualIdx, mItem.value, "url")} className={`flex-1 py-1 rounded-md text-[7px] font-black ${mItem.mode === 'url' ? 'bg-black text-white' : 'bg-gray-100'}`}>YT LINK</button>
                      </div>
                      {mItem.mode === "file" ? (
                        <div className="space-y-2">
                          <input type="file" className="text-[8px] w-full" onChange={(e) => updateMediaValue(actualIdx, e.target.files[0], "file")} /> 
                          {mItem.value && (
                            <div className="relative rounded-xl overflow-hidden border">
                              <img src={previewUrl} className="w-full h-24 object-contain bg-gray-50" />
                              <button type="button" onClick={() => { setActiveMediaIndex(actualIdx); setIsCropping(true); setTempImage(previewUrl); }} className="w-full py-2 bg-blue-50 text-blue-600 text-[8px] font-black uppercase">Edit & Scan Text</button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <input type="text" placeholder="YouTube URL" className="w-full text-xs font-bold border-b py-1 outline-none" value={mItem.value || ""} onChange={(e) => updateMediaValue(actualIdx, e.target.value, "url")} />
                          {ytId && (
                            <div className="rounded-lg overflow-hidden shadow-inner relative z-10 pointer-events-auto">
                              <iframe className="w-full h-36" src={`https://www.youtube.com/embed/${ytId}?controls=1&modestbranding=1&rel=0`} frameBorder="0" allowFullScreen></iframe>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
                <button type="button" onClick={() => addMediaToVocab('image', vIdx)} className="w-full bg-white py-3 rounded-xl text-[8px] font-black uppercase border-2 border-dashed border-gray-100 hover:border-black transition-all">+ Add Photo / Video</button>
              </div>
            </div>
          ))}
          {/* addVocabSlot Error Fixed Here */}
          <button type="button" onClick={addVocabSlot} className="w-full py-4 border-2 border-dashed border-gray-100 rounded-[2rem] text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-black transition-all">+ Add New Word Card</button>
          
          <button disabled={uploading} className="w-full bg-red-600 text-white p-6 rounded-[2.5rem] font-black uppercase text-xs shadow-xl active:scale-95 disabled:bg-gray-300">
            {uploading ? "Publishing Memory..." : "Save Smart Deck 🚀"}
          </button>
        </form>
      </div>

      {/* 🖼️ ARCHIVE LIST */}
      <div className="w-full max-w-sm space-y-4 mt-10">
        <p className="text-[10px] font-black text-gray-400 uppercase text-center tracking-[0.3em]">Your Memories</p>
        {myPosts.map((post) => (
          <div key={post._id} className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-gray-100 flex items-center p-4 gap-4 transition-all hover:shadow-md">
            <img src={post.vocabData?.[0]?.media?.[0]?.url || post.image} className="w-16 h-16 rounded-2xl object-cover bg-gray-50 shadow-inner" alt="" />
            <div className="flex-1">
              <h3 className="font-black text-xs uppercase italic truncate">{post.vocabData?.[0]?.word || post.word}</h3>
              <span className="text-[8px] font-black text-blue-500 uppercase">{post.vocabData?.length || 1} Cards</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => startEdit(post)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs shadow-sm active:scale-90 transition-all">✍️</button>
              <button onClick={async () => { if(window.confirm("Delete?")){ await fetch(`${API_URL}/api/english-posts/delete/${post._id}`, { method: "DELETE" }); fetchMyPosts(); toast.success("Deleted!"); } }} className="w-8 h-8 bg-red-50 text-red-500 rounded-full font-bold shadow-sm active:scale-90 transition-all">✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}