import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { Capacitor } from '@capacitor/core'; // 🔥 Capacitor Import Kiya
import { 
  Plus, 
  Save, 
  X, 
  Sparkles, 
  Layers, 
  Compass,
  RefreshCw,
  Wand2,
  History, // 🔥 Naya icon import kiya
  CheckSquare, // 🔥 Naya icon
  Square // 🔥 Naya icon
} from "lucide-react";

import DesignEditor from "../myuploadComponents/DesignEditor";
import VocabCard from "../myuploadComponents/VocabCard";
import ArchiveItem from "../myuploadComponents/ArchiveItem";

export default function EnglishAppMyPosts() {
  const [deckTitle, setDeckTitle] = useState(""); 
  const [vocabItems, setVocabItems] = useState([{ word: "", meaning: "", sentence: "" }]);
  const [mediaItems, setMediaItems] = useState([]);
  const [tempImage, setTempImage] = useState(null);
  const [activeMediaIndex, setActiveMediaIndex] = useState(null);
  const [displayDims, setDisplayDims] = useState({ w: 320, h: 400 });
  const [myPosts, setMyPosts] = useState([]);
  const [translating, setTranslating] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isCropping, setIsCropping] = useState(true);
  
  const [aiLoading, setAiLoading] = useState(null);

  // 🔥 NAYE STATES HISTORY IMPORT KE LIYE 🔥
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [userHistory, setUserHistory] = useState([]);
  const [selectedHistoryIds, setSelectedHistoryIds] = useState(new Set());
  const [isFetchingHistory, setIsFetchingHistory] = useState(false);

  const navigate = useNavigate();

  // 👇 NAYA API URL LOGIC: Mobile app seedha live server ko hit karegi
  const API_URL = Capacitor.isNativePlatform() 
    ? "https://serdeptry1st.onrender.com" 
    : (window.location.hostname === "localhost" ? "http://localhost:3000" : "https://serdeptry1st.onrender.com");

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

  // 🔥 FETCH HISTORY (STACK) FROM DB 🔥
  const fetchHistoryForImport = async () => {
    const email = localStorage.getItem("eng_userEmail");
    if (!email) {
        toast.error("Please login to see history!");
        return;
    }
    setIsFetchingHistory(true);
    setShowHistoryModal(true);
    try {
      const res = await fetch(`${API_URL}/api/words/history/${encodeURIComponent(email)}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setUserHistory(data.data);
      } else {
        toast.error("Could not fetch history");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error fetching stack!");
    } finally {
      setIsFetchingHistory(false);
    }
  };

  // 🔥 TOGGLE SELECTION IN HISTORY MODAL 🔥
  const toggleHistorySelection = (id) => {
    setSelectedHistoryIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  // 🔥 MAGIC IMPORT FUNCTION: HISTORY SE DIRECT DECK ME LAANA 🔥
  const handleImportSelectedHistory = () => {
    if (selectedHistoryIds.size === 0) {
        toast.error("Please select at least one word!");
        return;
    }

    const selectedItems = userHistory.filter(item => selectedHistoryIds.has(item._id));
    
    let currentVocabList = [...vocabItems];
    let currentMediaList = [...mediaItems];

    // Agar pehla card khaali hai, toh usko remove kardo taaki import clean ho
    if (currentVocabList.length === 1 && !currentVocabList[0].word && !currentVocabList[0].meaning) {
        currentVocabList = [];
    }

    selectedItems.forEach((item) => {
        const vIdx = currentVocabList.length;
        
        // 1. Add Word Data
        currentVocabList.push({
            word: item.word || "",
            meaning: item.meaning || "",
            sentence: item.sentences || "", // History me sentences hota hai backend se
            title: deckTitle
        });

        // 2. Add Media Data automatically
        if (item.imageUrls && item.imageUrls.length > 0) {
            item.imageUrls.forEach(url => {
                currentMediaList.push({ type: 'image', value: url, mode: 'url', vocabIndex: vIdx });
            });
        } else if (item.imageUrl) {
            currentMediaList.push({ type: 'image', value: item.imageUrl, mode: 'url', vocabIndex: vIdx });
        }
    });

    setVocabItems(currentVocabList);
    setMediaItems(currentMediaList);
    setShowHistoryModal(false);
    setSelectedHistoryIds(new Set()); // reset selection
    toast.success(`${selectedItems.length} words imported successfully! 🎉`);
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

  const handleAiMagic = async (word, vIdx) => {
    if (!word || word.trim().length < 2) {
      return toast.error("Pehle ek word likho magic ke liye! ✍️");
    }
    
    setAiLoading(vIdx);
    const userEmail = localStorage.getItem("eng_userEmail") || "guest_user@gmail.com";

    try {
      const res = await fetch(`${API_URL}/api/words/define`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: word.trim(), userId: userEmail, getAlternative: false }),
      });
      const resData = await res.json();

      if (res.ok && resData.success && resData.data) {
        const aiData = resData.data;
        updateVocabValue(vIdx, "meaning", aiData.meaning);
        updateVocabValue(vIdx, "sentence", aiData.sentences); 
        
        let imgUrlToUse = "";
        if (aiData.imageUrls && aiData.imageUrls.length > 0) imgUrlToUse = aiData.imageUrls[0];
        else if (aiData.imageUrl) imgUrlToUse = aiData.imageUrl;
        else {
          toast("Generating visual context...", { icon: '🎨' });
          try {
            const imgRes = await fetch(`${API_URL}/api/image/generate`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ phrase: word, actionType: "normal", userId: userEmail })
            });
            const imgData = await imgRes.json();
            if (imgRes.ok && imgData.imageUrl) {
              imgUrlToUse = imgData.imageUrl;
            }
          } catch(err) {}
        }

        if (imgUrlToUse) {
          setMediaItems(prev => {
            const newItems = [...prev];
            const emptySlotIdx = newItems.findIndex(m => m.vocabIndex === vIdx && m.mode === "select");
            if (emptySlotIdx !== -1) {
              newItems[emptySlotIdx] = { type: 'image', value: imgUrlToUse, mode: 'url', vocabIndex: vIdx };
            } else {
              newItems.push({ type: 'image', value: imgUrlToUse, mode: 'url', vocabIndex: vIdx });
            }
            return newItems;
          });
        }
        toast.success("AI Magic Applied Successfully! 🪄✨");
      } else {
        toast.error("AI failed to find this word.");
      }
    } catch (err) {
      toast.error("Network issue with AI engine!");
    } finally {
      setAiLoading(null);
    }
  };

  const startEdit = (post) => {
    setEditingId(post._id);
    setDeckTitle(post.title || ""); 

    const reconstructedVocab = post.vocabData?.map((v, idx) => ({
      ...v,
      title: idx === 0 ? post.title : v.title,
      isSynced: false
    })) || [{ 
      word: post.word, 
      meaning: post.meaning, 
      sentence: post.sentence || "",
      title: post.title,
      isSynced: false
    }];

    setVocabItems(reconstructedVocab);

    const reconstructedMedia = [];
    if (post.vocabData) {
      post.vocabData.forEach((v, vIdx) => {
        v.media?.forEach(m => {
          const isUrl = typeof m.url === 'string' && m.url.startsWith('http');
          reconstructedMedia.push({ 
            type: m.type || 'image', 
            value: m.url, 
            mode: isUrl ? 'url' : 'file', 
            vocabIndex: vIdx 
          });
        });
      });
    } else if (post.image) {
      reconstructedMedia.push({ type: 'image', value: post.image, mode: 'url', vocabIndex: 0 });
    }

    setMediaItems(reconstructedMedia);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast.success("Ready to Edit! ✍️");
  };

  const resetForm = () => {
    setDeckTitle(""); 
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

      setTempImage(null);
      toast.success("Design Saved! 🎨");
    };
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    if(!deckTitle.trim()){
      toast.error("Please enter a Deck Title!");
      return;
    }
    
    setUploading(true);
    const userEmail = localStorage.getItem("eng_userEmail");
    const data = new FormData();
    data.append("userEmail", userEmail);
    data.append("title", deckTitle); 
    data.append("vocabData", JSON.stringify(vocabItems));
    mediaItems.forEach(m => { if (m.value instanceof File) data.append("images", m.value); });
    data.append("mediaMetadata", JSON.stringify(mediaItems.map(m => ({ ...m, url: m.value instanceof File ? null : m.value }))));

    try {
      const url = editingId ? `${API_URL}/api/english-posts/update/${editingId}` : `${API_URL}/api/english-posts/create`;
      const res = await fetch(url, { method: editingId ? "PUT" : "POST", body: data });
      const postResponseData = await res.json(); 

      if (res.ok) { 
        toast.success("Deck Saved Successfully! 🎉"); 
        if (!editingId) {
          try {
            const squadsRes = await fetch(`${API_URL}/api/squads/user/${userEmail}`);
            const squadsData = await squadsRes.json();
            if (squadsData.success && squadsData.squads.length > 0) {
              const newPostId = postResponseData.post?._id || postResponseData.data?._id || postResponseData._id;
              if (newPostId) {
                squadsData.squads.forEach(async (squad) => {
                  await fetch(`${API_URL}/api/squads/${squad._id}/message`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      senderEmail: userEmail, type: "post", postId: newPostId, text: `Hey squad! I just added a new deck: ${deckTitle}`
                    }),
                  });
                });
              }
            }
          } catch (squadErr) {}
        }
        resetForm(); 
        fetchMyPosts(); 
      } else {
        toast.error(postResponseData.message || "Failed to save post");
      }
    } catch (e) { 
      toast.error("Something went wrong!"); 
    } finally { 
      setUploading(false); 
    }
  };

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Kalam:wght@400;700&display=swap');
          .font-playful { font-family: 'Kalam', cursive !important; }
          .hide-scrollbar::-webkit-scrollbar { display: none; }
          .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}
      </style>

      <div className="min-h-screen bg-[#F2EFE7] text-gray-900 flex flex-col items-center p-4 py-8 font-sans transition-colors duration-500 pb-28 overflow-x-hidden w-full relative">
        
        <Toaster 
          position="top-center" 
          toastOptions={{
            style: { background: '#8B004A', color: '#F2EFE7', border: 'none', fontWeight: 'bold', borderRadius: '1rem' }
          }}
        />

        {tempImage && (
          <DesignEditor tempImage={tempImage} setTempImage={setTempImage} displayDims={displayDims} setDisplayDims={setDisplayDims} onSave={finalizeImage} />
        )}

        <div className="w-full max-w-[100vw] sm:max-w-md bg-white p-5 sm:p-7 rounded-[2.5rem] shadow-xl shadow-[#8B004A]/10 border-[4px] border-[#8B004A]/10 mb-10 overflow-hidden relative">
          
          {/* Header */}
          <div className="flex justify-between items-center mb-6 border-b-2 border-gray-100 pb-4">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="bg-[#FFB800] text-[#4A0027] text-[9px] px-2.5 py-1 rounded-md font-black tracking-widest uppercase shadow-sm flex items-center gap-1 w-max">
                  <Compass size={10} strokeWidth={3} /> MASTER NODE
                </span>
              </div>
              <h2 className="text-4xl font-bold text-[#8B004A] font-playful tracking-wide drop-shadow-sm flex items-center gap-2">
                {editingId ? "Edit Memory" : "Magic Deck"} <Sparkles size={24} className="text-[#FFB800]" />
              </h2>
            </div>
            
            {editingId && (
              <button onClick={resetForm} className="bg-[#F2EFE7] hover:bg-red-500 text-red-500 hover:text-white p-3 rounded-full transition-all border-2 border-transparent active:scale-90 shadow-sm">
                <X size={20} strokeWidth={3} />
              </button>
            )}
          </div>

          <form onSubmit={handleFinalSubmit} className="space-y-6">
            
            {/* Title Input */}
            <div className="px-1 group">
              <label className="text-[10px] font-black text-[#8B004A]/70 uppercase tracking-[0.2em] ml-2 mb-2 block flex items-center gap-1.5">
                <Wand2 size={12} /> Ultimate Deck Title
              </label>
              <input 
                type="text" 
                placeholder="E.G. 'JOKER MOVIE VOCAB'..." 
                value={deckTitle} 
                onChange={(e) => setDeckTitle(e.target.value)} 
                required
                className="w-full bg-[#F2EFE7] border-[3px] border-transparent focus:border-[#E01A76] rounded-2xl px-5 py-4 text-sm font-black text-gray-900 outline-none transition-all uppercase tracking-wider placeholder:text-gray-400 shadow-inner group-focus-within:shadow-md" 
              />
            </div>

            {/* 🔥 NEW: IMPORT FROM STACK BUTTON 🔥 */}
            {!editingId && (
                <div className="px-1">
                    <button 
                        type="button" 
                        onClick={fetchHistoryForImport}
                        className="w-full bg-indigo-50 border-[2px] border-indigo-200 text-indigo-700 hover:bg-indigo-600 hover:text-white py-3.5 rounded-[1rem] font-black uppercase text-[11px] tracking-widest shadow-sm active:scale-95 transition-all flex justify-center items-center gap-2"
                    >
                        <History size={16} strokeWidth={2.5} /> Pull Words From Stack (History)
                    </button>
                </div>
            )}

            {/* MAIN SWIPER */}
            <div className="flex overflow-x-auto gap-5 pb-6 pt-2 px-1 snap-x snap-mandatory hide-scrollbar items-center">
              
              {vocabItems.map((vItem, vIdx) => (
                <div key={vIdx} className="w-[85vw] max-w-[340px] shrink-0 snap-center h-[680px] bg-white rounded-[2rem] shadow-xl overflow-hidden border-[3px] border-[#8B004A]/20 transition-all hover:border-[#E01A76] relative group">
                  <VocabCard 
                    vItem={vItem} 
                    vIdx={vIdx} 
                    updateVocabValue={updateVocabValue} 
                    removeVocabSlot={(idx) => setVocabItems(vocabItems.filter((_, i) => i !== idx))} 
                    handleAutoTranslate={handleAutoTranslate} 
                    translating={translating} 
                    mediaItems={mediaItems} 
                    setMediaItems={setMediaItems} 
                    updateMediaValue={updateMediaValue} 
                    setTempImage={setTempImage} 
                    setActiveMediaIndex={setActiveMediaIndex}
                    setIsCropping={setIsCropping} 
                    handleAiMagic={handleAiMagic}
                    aiLoading={aiLoading}
                  />
                </div>
              ))}

              {/* Add New Card Button */}
              <div className="w-[85vw] max-w-[340px] shrink-0 snap-center h-[680px] flex py-2">
                <button type="button" onClick={() => setVocabItems([...vocabItems, { word: "", meaning: "", sentence: "" }])} className="w-full h-full bg-white border-[3px] border-dashed border-[#8B004A]/30 rounded-[2.5rem] text-[12px] font-black text-[#8B004A] uppercase tracking-widest hover:text-white hover:border-transparent hover:bg-[#8B004A] transition-all flex flex-col items-center justify-center gap-4 shadow-sm active:scale-95 group">
                  <div className="w-16 h-16 rounded-full bg-[#F2EFE7] group-hover:bg-white group-hover:text-[#8B004A] flex items-center justify-center shadow-md text-[#8B004A] transition-colors border-2 border-transparent group-hover:border-[#8B004A]/10">
                    <Plus size={32} strokeWidth={3} />
                  </div>
                  Add New Card
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2 px-1">
              <button disabled={uploading} className="w-full bg-[#8B004A] hover:bg-[#E01A76] text-white py-5 rounded-full font-black uppercase text-xs tracking-widest shadow-xl shadow-[#8B004A]/30 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed border-none transition-all flex justify-center items-center gap-2">
                {uploading ? ( <><RefreshCw size={18} className="animate-spin" /> Processing...</> ) : editingId ? ( <><Save size={18} strokeWidth={2.5} /> Update Smart Deck</> ) : ( <><Save size={18} strokeWidth={2.5} /> Save Smart Deck</> )}
              </button>
            </div>
          </form>
        </div>

        {/* Your Memories Section */}
        <div className="w-full max-w-sm space-y-5">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="bg-[#E01A76]/10 text-[#E01A76] text-[10px] px-4 py-2 rounded-xl font-black tracking-[0.2em] uppercase shadow-sm flex items-center gap-2 border border-[#E01A76]/20">
              <Layers size={14} strokeWidth={3} /> Your Arsenal Archives
            </span>
          </div>

          {myPosts.length === 0 ? (
            <p className="text-center text-sm font-black text-gray-400 py-6 uppercase tracking-wider bg-white rounded-3xl border-2 border-dashed border-gray-200">No memories found yet.</p>
          ) : (
            <div className="space-y-4">
              {myPosts.map(post => (
                <div key={post._id} className="bg-white border-[3px] border-[#8B004A]/10 hover:border-[#8B004A]/30 rounded-3xl p-1 transition-all shadow-sm overflow-hidden">
                  <ArchiveItem 
                    post={post} 
                    onDelete={async (id) => { 
                      if(window.confirm("Are you sure you want to delete this deck?")) { 
                        await fetch(`${API_URL}/api/english-posts/delete/${id}`, { method: 'DELETE' }); 
                        fetchMyPosts(); 
                        toast.success("Deck Deleted! 🗑️"); 
                      } 
                    }} 
                    onEdit={startEdit} 
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 🔥 HISTORY SELECTION MODAL 🔥 */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center">
            <div className="bg-white w-full sm:max-w-md h-[80vh] sm:h-[70vh] sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col animate-in slide-in-from-bottom-10">
                <div className="flex justify-between items-center p-5 border-b border-gray-100">
                    <h3 className="font-playful text-xl font-bold text-[#8B004A] flex items-center gap-2">
                        <History size={20} className="text-[#E01A76]" /> Select Words
                    </h3>
                    <button onClick={() => setShowHistoryModal(false)} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 active:scale-90">
                        <X size={18} />
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-3">
                    {isFetchingHistory ? (
                        <div className="flex justify-center items-center h-full text-[#E01A76]">
                            <RefreshCw className="animate-spin" size={32} />
                        </div>
                    ) : userHistory.length === 0 ? (
                        <div className="text-center text-gray-400 font-bold mt-10">
                            No search history found! 
                        </div>
                    ) : (
                        userHistory.map(item => {
                            const isSelected = selectedHistoryIds.has(item._id);
                            return (
                                <div 
                                    key={item._id} 
                                    onClick={() => toggleHistorySelection(item._id)}
                                    className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all cursor-pointer ${isSelected ? 'bg-indigo-50 border-indigo-400 shadow-sm' : 'bg-gray-50 border-transparent hover:border-gray-200'}`}
                                >
                                    <div className={`text-${isSelected ? 'indigo-600' : 'gray-400'}`}>
                                        {isSelected ? <CheckSquare size={24} /> : <Square size={24} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-gray-900 capitalize text-[15px] truncate">{item.word}</p>
                                        <p className="text-[11px] text-gray-500 font-medium truncate">{item.meaning}</p>
                                    </div>
                                    {(item.imageUrl || (item.imageUrls && item.imageUrls.length > 0)) && (
                                        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-gray-200">
                                            <img src={item.imageUrl || item.imageUrls[0]} alt="thumb" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                </div>
                            )
                        })
                    )}
                </div>

                <div className="p-4 border-t border-gray-100 bg-gray-50 sm:rounded-b-3xl">
                    <button 
                        onClick={handleImportSelectedHistory}
                        disabled={selectedHistoryIds.size === 0}
                        className="w-full bg-indigo-600 text-white font-black py-4 rounded-xl uppercase tracking-wider active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100"
                    >
                        Import {selectedHistoryIds.size} Words
                    </button>
                </div>
            </div>
        </div>
      )}
    </>
  );
}