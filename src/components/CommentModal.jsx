import React, { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCcw, BookOpen, Loader2, ChevronDown } from "lucide-react"; 

export default function CommentModal({ post, activeVocab, userEmail, onClose, API_URL, onRefresh }) {
  const [comment, setComment] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [viewImage, setViewImage] = useState(null);
  const [isContextFlipped, setIsContextFlipped] = useState(false);

  // 🔥 NAYA STATE: Expand/Collapse ke liye
  const [isContextExpanded, setIsContextExpanded] = useState(false);

  // DB Details State
  const [dbDetails, setDbDetails] = useState({ explanation: "", synonyms: "", antonyms: "", sentence: "" });
  const [isFetchingDetails, setIsFetchingDetails] = useState(true);

  const fileInputRef = useRef(null);
  const currentUser = userEmail?.split("@")[0];

  const wordData = activeVocab || post?.vocabData?.[0] || post;
  const wordName = wordData?.word || "Vocabulary";
  const meaningText = wordData?.meaning || "Meaning details not available.";

  // 🔥 DATABASE FETCH EFFECT 🔥
  useEffect(() => {
    const fetchFromDB = async () => {
      if (!wordName || !post.userEmail) {
        setIsFetchingDetails(false);
        return;
      }
      try {
        const res = await fetch(`${API_URL}/api/english-posts/word-details?word=${wordName}&email=${post.userEmail}`);
        const result = await res.json();
        
        if (result.success && result.data) {
          setDbDetails({
            explanation: result.data.explanation || "",
            synonyms: result.data.synonyms || "",
            antonyms: result.data.antonyms || "",
            sentence: result.data.sentences || result.data.sentence || ""
          });
        }
      } catch (err) {
        console.error("DB Fetch Failed", err);
      } finally {
        setIsFetchingDetails(false);
      }
    };
    fetchFromDB();
  }, [wordName, post.userEmail, API_URL]);

  // MERGING LOGIC
  const explanationText = dbDetails.explanation || wordData?.explanation || "";
  const synonymsText = dbDetails.synonyms || wordData?.synonyms || "";
  const antonymsText = dbDetails.antonyms || wordData?.antonyms || "";
  const sentenceText = dbDetails.sentence || wordData?.sentence || wordData?.sentences || "";

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!comment.trim() && !imageFile) return; 
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", currentUser);
      formData.append("text", comment);
      formData.append("email", userEmail || "anonymous@learner.com"); 

      if (imageFile) formData.append("image", imageFile);

      const res = await fetch(`${API_URL}/api/english-posts/comment/${post._id}`, {
        method: "POST", body: formData, 
      });

      if (res.ok) {
        setComment(""); setImageFile(null); setImagePreview(null); onRefresh();
        toast.success("Reaction sent! 🚀", { style: { background: '#8B004A', color: '#F2EFE7' } });
      } else {
        const errorData = await res.json(); throw new Error(errorData.message || "Failed");
      }
    } catch (err) { 
      toast.error("Transmission Failed", { style: { background: '#EF4444', color: '#fff' } });
    } finally { setLoading(false); }
  };

  const handleDeleteComment = async (commentId) => {
    toast((t) => (
      <div className="flex flex-col gap-3 p-2 bg-white text-gray-900 rounded-2xl border-[3px] border-gray-100 shadow-2xl">
        <p className="text-[10px] font-black uppercase tracking-widest text-[#8B004A]">Delete this transmission? 🗑️</p>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                const res = await fetch(`${API_URL}/api/english-posts/comment/${post._id}/${commentId}`, { method: "DELETE" });
                if (res.ok) { toast.success("Deleted", { style: { background: '#8B004A', color: '#F2EFE7' } }); onRefresh(); }
              } catch (err) { toast.error("Failed"); }
            }}
            className="bg-red-50 border-2 border-red-100 text-red-500 px-4 py-2 rounded-xl text-[9px] font-black uppercase hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-sm"
          >Confirm</button>
          <button onClick={() => toast.dismiss(t.id)} className="bg-gray-100 border-2 border-gray-200 px-4 py-2 rounded-xl text-[9px] font-black uppercase text-gray-500 hover:bg-gray-200 transition-all shadow-sm">Abort</button>
        </div>
      </div>
    ), { position: 'top-center', style: { background: 'transparent', boxShadow: 'none' } });
  };

  const handleUpdateComment = async (commentId) => {
    if (!editText.trim()) return;
    try {
      const res = await fetch(`${API_URL}/api/english-posts/comment/${post._id}/${commentId}`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: editText })
      });
      if (res.ok) { setEditingId(null); toast.success("Transmission Updated", { style: { background: '#8B004A', color: '#F2EFE7' } }); onRefresh(); }
    } catch (err) { toast.error("Failed"); }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[300] flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div className="bg-white w-full max-w-md h-[85vh] sm:h-[650px] rounded-t-[2.5rem] sm:rounded-[2rem] flex flex-col shadow-2xl border-t-4 sm:border-[3px] border-[#8B004A]/10 overflow-hidden animate-in slide-in-from-bottom duration-500 relative">
          
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-gray-200 rounded-full sm:hidden"></div>

          <div className="flex justify-between items-center px-6 sm:px-8 py-5 sm:py-6 bg-white border-b-2 border-gray-100 z-10 shadow-sm">
            <div>
              <h3 className="font-black uppercase text-[11px] tracking-[0.2em] text-[#8B004A] italic">Post Discussion</h3>
              <p className="text-[9px] font-bold text-gray-500 uppercase mt-0.5 tracking-wider">{post.comments?.length || 0} Signal(s) Received</p>
            </div>
            <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-gray-50 border-2 border-gray-100 rounded-xl text-gray-400 hover:text-[#8B004A] hover:bg-[#8B004A]/10 hover:border-[#8B004A]/20 transition-all active:scale-95">✕</button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 custom-scrollbar bg-[#F2EFE7]/50">
            
            <div className="w-full animate-in fade-in slide-in-from-top-4 duration-500 mb-6">
              
              {/* FLIP CARD */}
              <motion.div 
                className="cursor-pointer bg-white border-2 border-gray-100 shadow-sm hover:shadow-md rounded-[1.5rem] relative flex flex-col items-center justify-center p-6 min-h-[130px] active:scale-[0.98] transition-all mb-2"
                onClick={() => setIsContextFlipped(!isContextFlipped)}
              >
                <div className="absolute top-3 right-3 flex items-center gap-1 opacity-40">
                  <RefreshCcw size={12} className="text-gray-500" />
                  <span className="text-[8px] font-black uppercase tracking-widest text-gray-500">Tap</span>
                </div>

                <AnimatePresence mode="wait">
                  {!isContextFlipped ? (
                    <motion.div key="front" initial={{ rotateX: 90, opacity: 0 }} animate={{ rotateX: 0, opacity: 1 }} exit={{ rotateX: -90, opacity: 0 }} transition={{ duration: 0.2, ease: "easeInOut" }} className="flex flex-col items-center justify-center w-full">
                      <h2 className="text-3xl font-black text-[#8B004A] capitalize text-center tracking-tight font-playful">{wordName}</h2>
                    </motion.div>
                  ) : (
                    <motion.div key="back" initial={{ rotateX: 90, opacity: 0 }} animate={{ rotateX: 0, opacity: 1 }} exit={{ rotateX: -90, opacity: 0 }} transition={{ duration: 0.2, ease: "easeInOut" }} className="flex flex-col items-center justify-center w-full">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 border-b-2 border-gray-100 pb-1">Meaning</span>
                      <p className="text-[15px] font-bold text-[#8B004A] text-center leading-snug px-2">{meaningText}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* 🔥 TOGGLE BUTTON FOR DEEP CONTEXT 🔥 */}
              <div className="flex justify-center mb-4">
                <button 
                  onClick={() => setIsContextExpanded(!isContextExpanded)}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-white border-2 border-gray-100 rounded-full text-[9px] font-black uppercase tracking-widest text-gray-500 hover:text-[#8B004A] hover:border-[#8B004A]/30 transition-all shadow-sm active:scale-95"
                >
                  {isContextExpanded ? "Hide Context" : "Deep Context"}
                  <ChevronDown size={14} className={`transition-transform duration-300 ${isContextExpanded ? "rotate-180 text-[#E01A76]" : ""}`} strokeWidth={3} />
                </button>
              </div>

              {/* 🔥 EXPANDABLE DB DATA RENDER ZONE 🔥 */}
              <AnimatePresence>
                {isContextExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0, y: -10 }}
                    animate={{ height: "auto", opacity: 1, y: 0 }}
                    exit={{ height: 0, opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="bg-white p-4 rounded-[1.5rem] border-2 border-gray-100 shadow-sm space-y-4 min-h-[100px] relative mb-4">
                      
                      {isFetchingDetails && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-[1.5rem]">
                          <Loader2 className="w-6 h-6 text-[#E01A76] animate-spin mb-2" />
                          <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Loading Context...</span>
                        </div>
                      )}

                      {explanationText ? (
                        <div>
                          <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest block mb-1">Explanation</span>
                          <p className="text-xs font-bold text-gray-700 leading-relaxed border-l-[3px] border-[#E01A76] pl-3 py-0.5">{explanationText}</p>
                        </div>
                      ) : (
                        !isFetchingDetails && (
                          <div className="text-[10px] text-gray-400 italic text-center py-2 opacity-70">
                            Detailed analysis unavailable for this entry.
                          </div>
                        )
                      )}
                      
                      {sentenceText && (
                        <div className="bg-[#FFB800]/10 border-l-[3px] border-[#FFB800] p-3 rounded-r-xl">
                          <span className="text-[9px] font-black uppercase text-[#FFB800] tracking-widest block mb-1 flex items-center gap-1.5">
                            <BookOpen size={12} strokeWidth={3} /> Example Usage
                          </span>
                          <p className="text-[13px] font-bold text-gray-800 italic leading-snug">"{sentenceText}"</p>
                        </div>
                      )}
                      
                      {(synonymsText || antonymsText) && (
                        <div className="flex gap-2 mt-3 pt-2 border-t-2 border-gray-50">
                          {synonymsText && (
                            <div className="flex-1 bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                              <span className="text-[9px] font-black uppercase text-emerald-600 tracking-widest block mb-0.5">Similar</span>
                              <p className="text-[11px] font-bold text-emerald-800 line-clamp-2 leading-tight">{synonymsText}</p>
                            </div>
                          )}
                          {antonymsText && (
                            <div className="flex-1 bg-rose-50 rounded-xl p-3 border border-rose-100">
                              <span className="text-[9px] font-black uppercase text-rose-600 tracking-widest block mb-0.5">Opposite</span>
                              <p className="text-[11px] font-bold text-rose-800 line-clamp-2 leading-tight">{antonymsText}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* DIVIDER FOR COMMENTS */}
              <div className="flex items-center gap-3 mt-4 mb-2 opacity-60">
                <div className="h-[2px] bg-gray-200 flex-1 rounded-full"></div>
                <span className="font-black text-[10px] uppercase tracking-widest text-gray-500">Discussion</span>
                <div className="h-[2px] bg-gray-200 flex-1 rounded-full"></div>
              </div>
            </div>

            {/* COMMENTS LOOP */}
            {post.comments?.length > 0 ? (
              post.comments.map((c, i) => {
                const isOwner = c.name === currentUser;
                const isEditing = editingId === c._id;

                return (
                  <div key={i} className="flex gap-3 sm:gap-4 items-start group animate-in fade-in slide-in-from-left-4 duration-300">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#8B004A] to-[#E01A76] text-white flex items-center justify-center font-black text-[12px] flex-shrink-0 uppercase shadow-md border-2 border-white">
                      {c.name?.charAt(0)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1.5 px-1">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest truncate">{c.name}</span>
                        {isOwner && !isEditing && (
                          <div className="flex gap-3 sm:gap-4 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2">
                            <button onClick={() => { setEditingId(c._id); setEditText(c.text); }} className="text-[9px] font-black uppercase text-[#E01A76] hover:text-[#8B004A] transition-colors">Edit</button>
                            <button onClick={() => handleDeleteComment(c._id)} className="text-[9px] font-black uppercase text-gray-400 hover:text-red-500 transition-colors">Delete</button>
                          </div>
                        )}
                      </div>

                      {isEditing ? (
                        <div className="mt-2 space-y-2">
                          <textarea className="w-full bg-white p-4 rounded-xl text-sm font-bold border-2 border-gray-200 text-gray-900 outline-none shadow-sm focus:border-[#E01A76] transition-all resize-none h-24" value={editText} onChange={(e) => setEditText(e.target.value)} />
                          <div className="flex gap-2">
                            <button onClick={() => handleUpdateComment(c._id)} className="px-5 py-2.5 bg-[#8B004A] hover:bg-[#E01A76] text-white rounded-xl text-[9px] font-black uppercase shadow-md transition-colors">Update</button>
                            <button onClick={() => setEditingId(null)} className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-[9px] font-black uppercase border-2 border-transparent transition-colors">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <div className="relative">
                          <div className="bg-white p-4 rounded-2xl rounded-tl-sm border-2 border-gray-100 shadow-sm flex flex-col gap-2">
                            {c.text && <p className="text-sm font-bold text-gray-700 leading-relaxed break-words">{c.text}</p>}
                            {c.image && <img src={c.image} alt="attached" onClick={() => setViewImage(c.image)} className="w-auto max-w-[120px] sm:max-w-[140px] h-auto object-contain rounded-xl border-2 border-gray-100 mt-1 cursor-zoom-in hover:opacity-90 active:scale-95 transition-all shadow-sm" loading="lazy" />}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center pt-4 pb-12 text-center">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 border-[3px] border-gray-100 shadow-sm">
                  <span className="text-3xl opacity-40">📡</span>
                </div>
                <p className="font-black text-[10px] uppercase tracking-[0.4em] text-gray-400">Waiting for signals...</p>
              </div>
            )}
          </div>

          <div className="p-4 sm:p-6 bg-white border-t-2 border-gray-100 z-10 shadow-[0_-10px_30px_rgba(0,0,0,0.02)] flex flex-col">
            {imagePreview && (
              <div className="relative mb-3 animate-in fade-in slide-in-from-bottom-2 self-start">
                <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-[#E01A76] shadow-md relative bg-gray-50 flex items-center justify-center">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/10"></div>
                </div>
                <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }} className="absolute -top-2 -right-2 w-6 h-6 bg-white border-2 border-gray-200 text-gray-600 hover:text-red-500 hover:border-red-500 rounded-full flex items-center justify-center text-xs font-black shadow-sm transition-all z-10">✕</button>
              </div>
            )}

            <form onSubmit={handlePostComment} className="relative flex items-center gap-2 sm:gap-3">
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
              <button type="button" onClick={() => fileInputRef.current.click()} className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-50 border-2 border-gray-100 text-gray-400 rounded-2xl flex items-center justify-center hover:bg-[#8B004A]/5 hover:text-[#8B004A] hover:border-[#8B004A]/20 transition-all active:scale-95 flex-shrink-0" title="Attach an image">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
              </button>

              <input type="text" placeholder="Transmit a reaction..." className="flex-1 bg-gray-50 border-2 border-gray-100 p-3 sm:p-4 rounded-2xl outline-none text-sm font-bold text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-[#E01A76] focus:shadow-[0_0_15px_rgba(224,26,118,0.1)] transition-all" value={comment} onChange={(e) => setComment(e.target.value)} />
              <button disabled={loading || (!comment.trim() && !imageFile)} className="w-12 h-12 sm:w-14 sm:h-14 bg-[#8B004A] text-white rounded-2xl flex items-center justify-center shadow-lg shadow-[#8B004A]/30 hover:bg-[#E01A76] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale group flex-shrink-0">
                {loading ? <div className="w-5 h-5 border-[3px] border-white/30 border-t-white rounded-full animate-spin"></div> : <span className="text-xl group-hover:translate-x-1 transition-transform">→</span>}
              </button>
            </form>
          </div>
        </div>
      </div>

      {viewImage && (
        <div className="fixed inset-0 z-[400] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={() => setViewImage(null)}>
          <div className="relative w-full h-full flex items-center justify-center max-w-5xl">
            <button className="absolute top-4 right-4 sm:top-8 sm:right-8 w-12 h-12 bg-white/10 hover:bg-white/20 border-2 border-white/30 text-white rounded-full flex items-center justify-center text-xl transition-all active:scale-95 z-50" onClick={(e) => { e.stopPropagation(); setViewImage(null); }}>✕</button>
            <img src={viewImage} alt="Preview" className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()} />
          </div>
        </div>
      )}
    </>
  );
}