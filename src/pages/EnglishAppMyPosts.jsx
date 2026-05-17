import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Tesseract from "tesseract.js";

import DesignEditor from "../myuploadComponents/DesignEditor";
import VocabCard from "../myuploadComponents/VocabCard";
import ArchiveItem from "../myuploadComponents/ArchiveItem";

export default function EnglishAppMyPosts() {
  const [vocabItems, setVocabItems] = useState([{ word: "", meaning: "", sentence: "" }]);
  const [mediaItems, setMediaItems] = useState([]);
  const [tempImage, setTempImage] = useState(null);
  const [activeMediaIndex, setActiveMediaIndex] = useState(null);
  const [displayDims, setDisplayDims] = useState({ w: 320, h: 400 });
  const [myPosts, setMyPosts] = useState([]);
  const [translating, setTranslating] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isCropping, setIsCropping] = useState(true); // 🔥 Add this for Prop fix

  const navigate = useNavigate();
  const API_URL = window.location.hostname === "localhost" ? "http://localhost:3000" : "https://serdeptry1st.onrender.com";

  useEffect(() => { fetchMyPosts(); }, []);

  const fetchMyPosts = async () => {
    const email = localStorage.getItem("eng_userEmail");
    if (!email) return navigate("/");
    try {
      const res = await fetch(`${API_URL}/api/english-posts/my-posts?email=${email}`);
      const data = await res.json();
      setMyPosts(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
  };

  const handleAutoTranslate = async (word, index) => {
    if (!word || word.trim().length < 2 || editingId) return;
    setTranslating(index);
    try {
      const res = await fetch(`${API_URL}/api/english-posts/auto-translate?text=${encodeURIComponent(word)}`);
      const data = await res.json();
      if (data.success && data.translated) {
        updateVocabValue(index, "meaning", data.translated);
        toast.success("AI Meaning Synced! ✨");
      }
    } catch (err) { console.error(err); }
    finally { setTranslating(null); }
  };

const startEdit = (post) => {
    setEditingId(post._id);

    // 🔥 FIX 1: Root Title ko vocabData ke andar map karo taaki VocabCard usey pakad sake
    const reconstructedVocab = post.vocabData?.map((v, idx) => ({
      ...v,
      title: idx === 0 ? post.title : v.title, // Pehle card me root title dalo
      isSynced: false // Force VocabCard to run sync
    })) || [{ 
      word: post.word, 
      meaning: post.meaning, 
      sentence: post.sentence || "",
      title: post.title, // Fallback for old single posts
      isSynced: false
    }];

    setVocabItems(reconstructedVocab);

    const reconstructedMedia = [];
    if (post.vocabData) {
      post.vocabData.forEach((v, vIdx) => {
        v.media?.forEach(m => {
          // 🔥 FIX 2: Mode handling taaki URL wala preview dikhe
          const isUrl = typeof m.url === 'string' && m.url.startsWith('http');
          reconstructedMedia.push({ 
            type: m.type || 'image', 
            value: m.url, 
            mode: isUrl ? 'url' : 'file', // URL he toh url mode set karo
            vocabIndex: vIdx 
          });
        });
      } );
    } else if (post.image) {
      // For old single posts
      reconstructedMedia.push({ type: 'image', value: post.image, mode: 'url', vocabIndex: 0 });
    }

    setMediaItems(reconstructedMedia);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast.success("Ready to Edit! ✍️");
  };

  const resetForm = () => {
    setVocabItems([{ word: "", meaning: "", sentence: "" }]);
    setMediaItems([]);
    setEditingId(null);
    setTempImage(null);
  };

  const updateVocabValue = (vIdx, field, val) => {
    const updated = [...vocabItems];
    updated[vIdx][field] = val;
    setVocabItems(updated);
  };

  const updateMediaValue = (mIdx, val, mode) => {
    const updated = [...mediaItems];
    updated[mIdx].value = val;
    updated[mIdx].mode = mode;
    setMediaItems(updated);
  };

  const finalizeImage = async (fabricCanvas) => {
    const bgImg = new Image();
    bgImg.crossOrigin = "anonymous";
    bgImg.src = tempImage;
    bgImg.onload = async () => {
      const finalCanvas = document.createElement("canvas");
      finalCanvas.width = bgImg.naturalWidth;
      finalCanvas.height = bgImg.naturalHeight;
      const ctx = finalCanvas.getContext("2d");
      ctx.drawImage(bgImg, 0, 0);

      if (fabricCanvas) {
        const multiplier = bgImg.naturalWidth / displayDims.w;
        const overlayImg = new Image();
        overlayImg.src = fabricCanvas.toDataURL({ format: 'png', multiplier });
        await new Promise(r => overlayImg.onload = r);
        ctx.drawImage(overlayImg, 0, 0);
      }

      const blob = await new Promise(r => finalCanvas.toBlob(r, 'image/png'));
      const finalFile = new File([blob], `edit_${Date.now()}.png`, { type: "image/png" });
      updateMediaValue(activeMediaIndex, finalFile, "file");

      const scanToast = toast.loading("AI Scanning Text...");
      try {
        const result = await Tesseract.recognize(finalFile, 'eng');
        const vocabIdx = mediaItems[activeMediaIndex].vocabIndex;
        updateVocabValue(vocabIdx, "sentence", result.data.text.replace(/\n/g, ' ').trim());
        toast.success("Text Found!", { id: scanToast });
      } catch (e) { toast.error("OCR Failed", { id: scanToast }); }
      setTempImage(null);
    };
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    const data = new FormData();
    data.append("userEmail", localStorage.getItem("eng_userEmail"));
    data.append("vocabData", JSON.stringify(vocabItems));
    mediaItems.forEach(m => { if (m.value instanceof File) data.append("images", m.value); });
    data.append("mediaMetadata", JSON.stringify(mediaItems.map(m => ({ ...m, url: m.value instanceof File ? null : m.value }))));

    try {
      const url = editingId ? `${API_URL}/api/english-posts/update/${editingId}` : `${API_URL}/api/english-posts/create`;
      const res = await fetch(url, { method: editingId ? "PUT" : "POST", body: data });
      if (res.ok) { toast.success("Success!"); resetForm(); fetchMyPosts(); }
    } catch (e) { toast.error("Error"); } finally { setUploading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-24 flex flex-col items-center">
      {tempImage && (
        <DesignEditor tempImage={tempImage} setTempImage={setTempImage} displayDims={displayDims} setDisplayDims={setDisplayDims} onSave={finalizeImage} />
      )}

      <div className="w-full max-w-sm bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 mb-8">
        <div className="flex justify-between items-center mb-6 px-1">
          <h2 className="text-xl font-black italic uppercase">{editingId ? "Edit Memory" : "Magic Deck"}</h2>
          {editingId && <button onClick={resetForm} className="text-[10px] font-black text-red-500 uppercase">✕ Cancel</button>}
        </div>
        <form onSubmit={handleFinalSubmit} className="space-y-8">
          {vocabItems.map((vItem, vIdx) => (
            <VocabCard 
              key={vIdx} vItem={vItem} vIdx={vIdx} 
              updateVocabValue={updateVocabValue} 
              removeVocabSlot={(idx) => setVocabItems(vocabItems.filter((_, i) => i !== idx))} 
              handleAutoTranslate={handleAutoTranslate} 
              translating={translating} 
              mediaItems={mediaItems} 
              setMediaItems={setMediaItems} 
              updateMediaValue={updateMediaValue} 
              setTempImage={setTempImage} 
              setActiveMediaIndex={setActiveMediaIndex}
              setIsCropping={setIsCropping} // 🔥 FIXED PROP
            />
          ))}
          <button type="button" onClick={() => setVocabItems([...vocabItems, { word: "", meaning: "", sentence: "" }])} className="w-full py-4 border-2 border-dashed border-gray-100 rounded-[2rem] text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-black transition-all">+ Add New Card</button>
          <button disabled={uploading} className="w-full bg-red-600 text-white p-6 rounded-[2.5rem] font-black uppercase text-xs shadow-xl active:scale-95 disabled:bg-gray-400 transition-all">
            {uploading ? "Processing..." : editingId ? "Update Smart Deck ✅" : "Save Smart Deck 🚀"}
          </button>
        </form>
      </div>

      <div className="w-full max-w-sm space-y-4">
        <p className="text-[10px] font-black text-gray-400 uppercase text-center tracking-[0.3em]">Your Memories</p>
        {myPosts.map(post => (
          <ArchiveItem key={post._id} post={post} onDelete={async (id) => { if(window.confirm("Delete?")){ await fetch(`${API_URL}/api/english-posts/delete/${id}`, { method: 'DELETE' }); fetchMyPosts(); toast.success("Deleted!"); } }} onEdit={startEdit} />
        ))}
      </div>
    </div>
  );
}