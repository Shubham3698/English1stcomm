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
  const [translating, setTranslating] = useState(null); // Track specific index

  // 🔥 Smart Deck States (Original word/meaning upgraded to Array)
  const [vocabItems, setVocabItems] = useState([{ word: "", meaning: "" }]);
  const [mediaItems, setMediaItems] = useState([]); // { type, value, mode, vocabIndex }
  const [editingId, setEditingId] = useState(null);

  // 🎨 Editor States (Fabric + Crop)
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

  // 🔥 1. AUTO TRANSLATE (Original Logic Ke Saath)
  const handleAutoTranslate = async (englishWord, index) => {
    if (!englishWord || englishWord.trim().length < 2 || editingId) return;
    setTranslating(index);
    try {
      const res = await fetch(`${API_URL}/api/english-posts/auto-translate?text=${englishWord}`);
      const data = await res.json();
      if (data.success && data.translated) {
        updateVocabValue(index, "meaning", data.translated);
        toast.success("AI Meaning Added! ✨", { 
          style: { borderRadius: '15px', background: '#333', color: '#fff', fontSize: '10px' } 
        });
      }
    } catch (err) { console.error("Translation Error:", err); } 
    finally { setTranslating(null); }
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

  // --- 🔥 Fabric Canvas Initialization ---
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

  // --- 🖌️ Tool Logic (SELECT, DRAW, SHAPES, TEXT) ---
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

  const addRect = () => {
    if (!fabricCanvasRef.current) return;
    setDrawMode("select");
    const rect = new fabric.Rect({
      left: 50, top: 50, fill: 'transparent', stroke: brushColor,
      strokeWidth: 4, width: 80, height: 80, cornerColor: 'blue', transparentCorners: false
    });
    fabricCanvasRef.current.add(rect);
    fabricCanvasRef.current.setActiveObject(rect);
  };

  const addCircle = () => {
    if (!fabricCanvasRef.current) return;
    setDrawMode("select");
    const circle = new fabric.Circle({
      left: 70, top: 70, fill: 'transparent', stroke: brushColor,
      strokeWidth: 4, radius: 45, cornerColor: 'blue', transparentCorners: false
    });
    fabricCanvasRef.current.add(circle);
    fabricCanvasRef.current.setActiveObject(circle);
  };

  const addText = () => {
    if (!fabricCanvasRef.current) return;
    setDrawMode("select");
    const text = new fabric.IText("Double Tap", {
      left: 50, top: 150, fontFamily: 'Arial', fontWeight: '900',
      fontSize: 28, fill: brushColor, fontStyle: 'italic', cornerColor: 'red'
    });
    fabricCanvasRef.current.add(text);
    fabricCanvasRef.current.setActiveObject(text);
  };

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
        // Correctly update the media value with processed file
        updateMediaValue(activeMediaIndex, new File([blob], `final_${Date.now()}.png`, { type: "image/png" }), "file");
        setTempImage(null);
        toast.success("Design Saved! 🚀");
      };
    };
  };

  // --- 🔥 DECK LOGIC HELPERS ---
  const addVocabSlot = () => setVocabItems([...vocabItems, { word: "", meaning: "" }]);
  
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

  const removeMediaSlot = (mIdx) => {
    setMediaItems(mediaItems.filter((_, i) => i !== mIdx));
  };

  const updateMediaValue = (mIdx, val, mode) => {
    const updated = [...mediaItems];
    updated[mIdx].value = val;
    updated[mIdx].mode = mode;
    setMediaItems(updated);
  };

  const handleOpenEditor = (mIdx) => {
    const item = mediaItems[mIdx];
    if (!item.value) return toast.error("Bhai, file select karo!");
    setActiveMediaIndex(mIdx);
    setIsCropping(true);
    if (item.value instanceof File) {
      const reader = new FileReader();
      reader.onload = () => setTempImage(reader.result);
      reader.readAsDataURL(item.value);
    } else { setTempImage(item.value); }
  };

  // --- 📤 FINAL SUBMISSION ---
  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    if (vocabItems.some(i => !i.word.trim())) return toast.error("Word missing in deck!");
    
    setUploading(true);
    const dataToSend = new FormData();
    dataToSend.append("userEmail", localStorage.getItem("eng_userEmail"));
    dataToSend.append("vocabData", JSON.stringify(vocabItems));

    const metadata = [];
    mediaItems.forEach((item) => {
      if (item.mode === "file" && item.value instanceof File) {
        dataToSend.append("images", item.value);
        metadata.push({ type: item.type, mode: "file", vocabIndex: item.vocabIndex });
      } else {
        metadata.push({ type: item.type, mode: "url", url: item.value, vocabIndex: item.vocabIndex });
      }
    });
    dataToSend.append("mediaMetadata", JSON.stringify(metadata));

    try {
      const url = editingId ? `${API_URL}/api/english-posts/update/${editingId}` : `${API_URL}/api/english-posts/create`;
      const res = await fetch(url, { method: editingId ? "PUT" : "POST", body: dataToSend });
      if (res.ok) {
        toast.success("Deck Published! 🚀");
        setVocabItems([{ word: "", meaning: "" }]); setMediaItems([]); setEditingId(null);
        fetchMyPosts();
      }
    } catch (err) { toast.error("Failed"); }
    finally { setUploading(false); }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm("Bhai delete karu?")) return;
    try {
      const res = await fetch(`${API_URL}/api/english-posts/delete/${postId}`, { method: "DELETE" });
      if (res.ok) { toast.success("Removed"); fetchMyPosts(); }
    } catch (err) { toast.error("Failed"); }
  };

  const startEdit = (post) => {
    setEditingId(post._id);
    setVocabItems(post.vocabData || [{ word: post.word, meaning: post.meaning }]);
    // Reconstruct media items with indices
    const reconstructedMedia = [];
    post.vocabData?.forEach((v, vIdx) => {
      v.media?.forEach(m => {
        reconstructedMedia.push({ type: m.type, value: m.url, mode: "url", vocabIndex: vIdx });
      });
    });
    setMediaItems(reconstructedMedia);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-24 flex flex-col items-center font-sans text-black">
      
      {/* ✂️🖼️ EDITOR MODAL (Original Fabric Logic Unchanged) */}
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
                  <button type="button" onClick={() => setDrawMode("free")} className={`p-2 rounded-xl text-[8px] font-black uppercase ${drawMode === 'free' ? 'bg-black text-white' : 'bg-white text-gray-400'}`}>Brush</button>
                  <button type="button" onClick={addRect} className="p-2 bg-white rounded-xl text-[8px] font-black uppercase">Rect</button>
                  <button type="button" onClick={addCircle} className="p-2 bg-white rounded-xl text-[8px] font-black uppercase">Circle</button>
                  <button type="button" onClick={addText} className="p-2 bg-white rounded-xl text-[8px] font-black uppercase">Text</button>
                  <button type="button" onClick={undo} className="p-2 bg-white rounded-xl text-[8px] font-black uppercase">Undo</button>
                  <button type="button" onClick={deleteSelected} className="p-2 bg-red-50 text-red-500 rounded-xl text-[8px] font-black uppercase">Del</button>
                </div>
                <div className="rounded-3xl overflow-hidden border bg-gray-50 relative mx-auto shadow-inner" style={{ width: displayDims.w, height: displayDims.h }}>
                  <img src={tempImage} className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-40" alt="" />
                  <canvas id="fabric-canvas" className="relative z-10" />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3 mt-6">
              {!isCropping && (
                <div className="flex justify-between items-center px-1">
                  <input type="color" value={brushColor} onChange={e => setBrushColor(e.target.value)} className="w-10 h-10 rounded-full border-0 shadow-md cursor-pointer" />
                  <button onClick={() => setDrawMode("select")} className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase ${drawMode === 'select' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-400'}`}>Move</button>
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

      {/* 📤 MAIN DECK FORM */}
      <div className="w-full max-w-sm bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 mb-8">
        <h2 className="text-xl font-black italic uppercase mb-6 px-1">{editingId ? "Edit Deck" : "New Smart Deck"}</h2>
        <form onSubmit={handleFinalSubmit} className="space-y-8">
          
          {vocabItems.map((vItem, vIdx) => (
            <div key={vIdx} className="space-y-4 p-5 bg-gray-50 rounded-[2.5rem] border border-gray-100 relative animate-in slide-in-from-bottom-4">
              {vocabItems.length > 1 && (
                <button type="button" onClick={() => removeVocabSlot(vIdx)} className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full shadow-lg font-bold">×</button>
              )}
              
              <div className="space-y-2">
                <input type="text" placeholder="Word" value={vItem.word} className="w-full bg-transparent outline-none border-b-2 border-gray-200 py-1 text-sm font-black uppercase italic" 
                  onChange={e => updateVocabValue(vIdx, "word", e.target.value)} onBlur={() => handleAutoTranslate(vItem.word, vIdx)} />
                <input type="text" placeholder="Hindi Meaning" value={vItem.meaning} className="w-full bg-transparent outline-none text-xs font-bold text-red-500 italic" 
                  onChange={e => updateVocabValue(vIdx, "meaning", e.target.value)} />
                {translating === vIdx && <span className="text-[7px] font-black text-blue-500 animate-pulse uppercase">AI...</span>}
              </div>

              {/* Media List for THIS Word */}
              <div className="space-y-3">
                {mediaItems.filter(m => m.vocabIndex === vIdx).map((mItem, mIdxGlobal) => {
                   const actualIdx = mediaItems.findIndex(m => m === mItem);
                   return (
                    <div key={mIdxGlobal} className="p-3 bg-white rounded-2xl border border-gray-100 shadow-sm relative">
                      <button type="button" onClick={() => removeMediaSlot(actualIdx)} className="absolute top-1 right-2 text-gray-300 font-bold text-lg">×</button>
                      <div className="flex gap-2 mb-2">
                        <button type="button" onClick={() => updateMediaValue(actualIdx, null, "file")} className={`px-2 py-1 rounded-md text-[7px] font-black ${mItem.mode === 'file' ? 'bg-black text-white' : 'bg-gray-100'}`}>FILE</button>
                        <button type="button" onClick={() => updateMediaValue(actualIdx, "", "url")} className={`px-2 py-1 rounded-md text-[7px] font-black ${mItem.mode === 'url' ? 'bg-black text-white' : 'bg-gray-100'}`}>LINK</button>
                      </div>
                      {mItem.mode === "file" ? (
                        <div className="space-y-2">
                          <input type="file" className="text-[8px] w-full" onChange={(e) => updateMediaValue(actualIdx, e.target.files[0], "file")} />
                          {mItem.value && (
                            <div className="relative rounded-xl overflow-hidden border">
                              {mItem.type === 'video' ? 
                                <video src={mItem.value instanceof File ? URL.createObjectURL(mItem.value) : mItem.value} className="w-full h-24 object-contain bg-gray-50" controls/> :
                                <img src={mItem.value instanceof File ? URL.createObjectURL(mItem.value) : mItem.value} className="w-full h-24 object-contain bg-gray-50" />
                              }
                              {mItem.type === 'image' && <button type="button" onClick={() => handleOpenEditor(actualIdx)} className="w-full py-2 bg-blue-50 text-blue-600 text-[8px] font-black uppercase">Edit Design</button>}
                            </div>
                          )}
                        </div>
                      ) : (
                        <input type="text" placeholder="URL" className="w-full text-xs font-bold border-b py-1 outline-none" value={mItem.value || ""} onChange={(e) => updateMediaValue(actualIdx, e.target.value, "url")} />
                      )}
                    </div>
                   );
                })}
                <div className="flex gap-2">
                  <button type="button" onClick={() => addMediaToVocab('image', vIdx)} className="flex-1 bg-white py-3 rounded-xl text-[8px] font-black uppercase border-2 border-dashed border-gray-100">+ Photo</button>
                  <button type="button" onClick={() => addMediaToVocab('video', vIdx)} className="flex-1 bg-white py-3 rounded-xl text-[8px] font-black uppercase border-2 border-dashed border-gray-100">+ Video</button>
                  <button type="button" onClick={() => addMediaToVocab('embed', vIdx)} className="flex-1 bg-white py-3 rounded-xl text-[8px] font-black uppercase border-2 border-dashed border-gray-100">+ YT</button>
                </div>
              </div>
            </div>
          ))}

          <div className="space-y-3">
            <button type="button" onClick={addVocabSlot} className="w-full py-4 border-2 border-dashed border-gray-200 rounded-[2rem] text-[10px] font-black text-gray-400 uppercase tracking-widest hover:border-black hover:text-black transition-all">+ Add New Word Card</button>
            <button disabled={uploading} className="w-full bg-red-500 text-white p-6 rounded-[2.5rem] font-black uppercase text-xs shadow-xl active:scale-95 disabled:bg-gray-300">
              {uploading ? "Publishing Deck..." : (editingId ? "Update Deck" : "Publish Deck")}
            </button>
          </div>
        </form>
      </div>

      {/* 🖼️ Archive (Simple List) */}
      <div className="w-full max-w-sm space-y-4">
        <p className="text-[10px] font-black text-gray-400 uppercase text-center tracking-[0.3em]">Your Smart Decks</p>
        {myPosts.map((post) => (
          <div key={post._id} className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-gray-100 flex items-center p-4 gap-4">
            <img src={post.image || (post.vocabData?.[0]?.media?.[0]?.url)} className="w-16 h-16 rounded-2xl object-cover bg-gray-50" alt="" />
            <div className="flex-1">
              <h3 className="font-black text-sm uppercase italic leading-none">{post.vocabData?.[0]?.word || post.word}</h3>
              <span className="text-[8px] font-black text-blue-500 uppercase">{post.vocabData?.length || 1} Cards</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => startEdit(post)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs">✍️</button>
              <button onClick={() => handleDelete(post._id)} className="w-8 h-8 bg-red-50 text-red-500 rounded-full font-bold">×</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}