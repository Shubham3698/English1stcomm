import React, { useState, useEffect } from "react";
import { 
  Image as ImageIcon, 
  Loader2, 
  ArrowRight, 
  X, 
  RefreshCw, 
  Sparkles, 
  Upload,
  Globe,
  Search,
  AlertCircle
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";

export default function VisualAnchor({
  activeWord,
  imageGallery,
  isImageExpanded,
  setIsImageExpanded,
  isImageLoading,
  isUploading,
  handleGenerateImage,
  handleCustomImageUpload,
  handleRemoveImage,
  handleWebImport, 
  fileInputRef
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [imageError, setImageError] = useState(false); // 🔥 NAYA STATE: Image fail hone par

  // NAYE STATES WEB SEARCH MODAL KE LIYE
  const [isWebSearchOpen, setIsWebSearchOpen] = useState(false);
  const [isSearchingWeb, setIsSearchingWeb] = useState(false);
  const [webImages, setWebImages] = useState([]);

  // Base API URL
  const API_URL = import.meta.env.DEV ? "http://localhost:3000" : "https://serdeptry1st.onrender.com";

  // 🔥 DEFENSIVE PROGRAMMING: Ensure gallery is always an array to prevent crashes
  const safeGallery = Array.isArray(imageGallery) ? imageGallery : [];
  const galleryLength = safeGallery.length;

  // Jab bhi naya word aaye, sab kuch reset ho jaye
  useEffect(() => {
    setCurrentIndex(0);
    setIsConfirmingDelete(false);
    setImageError(false); // Naye word pe error reset
  }, [activeWord]);

  // Handle out-of-bounds index silently
  useEffect(() => {
    if (galleryLength > 0 && currentIndex >= galleryLength) {
      setCurrentIndex(Math.max(0, galleryLength - 1));
    }
  }, [galleryLength, currentIndex]);

  const searchWebForImages = async () => {
    setIsWebSearchOpen(true);
    setIsSearchingWeb(true);
    setWebImages([]);

    try {
      const res = await fetch(`${API_URL}/api/image/search-web?word=${activeWord}`);
      const data = await res.json();
      if (res.ok && data.images && data.images.length > 0) {
        setWebImages(data.images);
      } else {
        toast.error("No images found online.");
      }
    } catch (err) {
      console.error("Web Search Error");
      toast.error("Failed to connect to search.");
    } finally {
      setIsSearchingWeb(false);
    }
  };

  const onWebImageSelect = (imgUrl) => {
    setIsWebSearchOpen(false);
    handleWebImport(imgUrl);
  };

  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // 🔥 FIX: Prevent Modulo Zero Crash
  const nextImage = () => {
    if (!isConfirmingDelete && galleryLength > 0) {
      setImageError(false);
      setCurrentIndex((prev) => (prev + 1) % galleryLength);
    }
  };
  
  const prevImage = () => {
    if (!isConfirmingDelete && galleryLength > 0) {
      setImageError(false);
      setCurrentIndex((prev) => (prev - 1 + galleryLength) % galleryLength);
    }
  };

  const minSwipeDistance = 50;
  const onTouchStart = (e) => {
    if (isConfirmingDelete || galleryLength === 0) return;
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  const onTouchMove = (e) => {
    if (!isConfirmingDelete && galleryLength > 0) {
      setTouchEnd(e.targetTouches[0].clientX);
    }
  };
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd || isConfirmingDelete || galleryLength === 0) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance) nextImage();
    if (distance < -minSwipeDistance) prevImage();
  };

  return (
    <div className="pt-6 mt-6 border-t border-gray-100 w-full animate-stagger-4 relative">
      <div className="flex justify-between items-center mb-4">
        <span className="text-gray-500 text-[10px] uppercase font-bold tracking-widest flex items-center gap-1.5">
          <ImageIcon size={14} className="text-[#E01A76]" /> Visual Anchor ({galleryLength})
        </span>
      </div>
      
      <div className={`w-full rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden relative transition-all duration-500 ${!isImageExpanded && galleryLength > 0 ? 'py-10' : 'p-3'}`}>
        
        {(isImageLoading || isUploading) && (
          <div className="flex flex-col items-center justify-center gap-4 absolute inset-0 bg-white/80 backdrop-blur-sm z-40 min-h-[160px]">
            <Loader2 size={32} className="animate-spin text-[#E01A76]" strokeWidth={2} />
            <p className="text-[#8B004A] font-bold text-[10px] uppercase tracking-widest animate-pulse">
              {isUploading ? 'Uploading...' : 'Rendering Concept...'}
            </p>
          </div>
        )}

        {/* Failed / Empty State */}
        {galleryLength === 0 && !isImageLoading && !isUploading && (
          <div className="flex flex-col items-center justify-center text-center px-4 py-8 w-full">
            <div className="bg-red-500/10 p-4 rounded-full mb-3 text-red-500">
              <ImageIcon size={28} strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Visual Missing</h3>
            <p className="text-gray-400 font-medium text-[11px]">
              Find an image for "{activeWord}" online,<br/>generate it with AI, or upload your own!
            </p>
          </div>
        )}

        {/* Expand State */}
        {galleryLength > 0 && !isImageExpanded && !isImageLoading && !isUploading && (
          <div className="flex flex-col items-center text-center px-4 w-full">
            <div className="bg-[#8B004A]/10 p-4 rounded-full mb-3 text-[#8B004A]">
              <ImageIcon size={28} strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Visual Ready</h3>
            <p className="text-gray-400 font-medium text-[11px] mb-5">Tap to reveal {galleryLength > 1 ? `${galleryLength} memory anchors` : "the memory anchor"} for "{activeWord}"</p>
            <button 
              onClick={() => setIsImageExpanded(true)}
              className="px-8 py-3 bg-gray-900 hover:bg-[#E01A76] text-white text-[12px] font-bold uppercase tracking-wider rounded-xl transition-colors active:scale-95 flex items-center justify-center gap-2 shadow-md shadow-gray-900/20"
            >
              Reveal Image <ArrowRight size={14} strokeWidth={2} />
            </button>
          </div>
        )}

        {/* PURE SWIPEABLE UI */}
        {galleryLength > 0 && isImageExpanded && (
          <div 
            className="relative w-full bg-black/5 rounded-xl group aspect-square flex items-center justify-center overflow-hidden touch-pan-y border border-gray-200 shadow-inner"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {/* 🔥 FIX: Handle broken image URLs natively without crashing */}
            {!imageError ? (
              <img 
                key={`${activeWord}-${currentIndex}-${safeGallery[currentIndex]}`} // Unique key forces clean remount
                src={safeGallery[currentIndex]} 
                alt={`${activeWord}-${currentIndex}`} 
                className={`w-full h-full object-contain transition-all duration-300 ${isConfirmingDelete ? 'opacity-40 blur-sm scale-95' : 'opacity-100'}`}
                loading="lazy"
                onError={(e) => {
                  console.error("Image load failed inside VisualAnchor");
                  setImageError(true);
                }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center w-full h-full bg-gray-100 text-gray-400">
                <AlertCircle size={40} className="mb-2 opacity-50" />
                <span className="font-playful text-sm font-bold">Image Unavailable</span>
                <span className="text-[10px] uppercase tracking-widest mt-1">Please delete or regenerate</span>
              </div>
            )}
            
            {!isConfirmingDelete && (
              <button 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  setIsConfirmingDelete(true); 
                }}
                className="absolute top-3 right-3 bg-white/90 hover:bg-red-50 text-red-500 p-2.5 rounded-full opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-md shadow-md z-20 active:scale-90 border border-gray-200"
              >
                <X size={16} strokeWidth={3} />
              </button>
            )}

            {isConfirmingDelete && (
              <div className="absolute inset-0 flex flex-col items-center justify-center z-30 px-6 bg-black/40 backdrop-blur-sm">
                <span className="text-gray-900 text-sm font-black mb-4 tracking-wide bg-white px-5 py-3 rounded-2xl shadow-xl border-2 border-gray-100 text-center leading-snug">
                  Permanently delete this image?
                </span>
                <div className="flex gap-3">
                  <button onClick={(e) => { e.stopPropagation(); setIsConfirmingDelete(false); }} className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 text-[11px] uppercase font-bold tracking-wider rounded-xl shadow-sm border border-gray-200">Cancel</button>
                  <button onClick={(e) => { e.stopPropagation(); setIsConfirmingDelete(false); handleRemoveImage(currentIndex); }} className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white text-[11px] uppercase font-bold tracking-wider rounded-xl shadow-lg shadow-red-600/30 border border-red-700">Delete</button>
                </div>
              </div>
            )}

            {galleryLength > 1 && !isConfirmingDelete && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/30 px-3 py-1.5 rounded-full backdrop-blur-md z-10 transition-opacity shadow-sm border border-white/10">
                {safeGallery.map((_, idx) => (
                  <button key={idx} onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); setImageError(false); }} className={`h-2 rounded-full transition-all duration-300 ${idx === currentIndex ? 'bg-[#FFB800] w-6 shadow-[0_0_8px_rgba(255,184,0,0.8)]' : 'bg-white/60 hover:bg-white w-2'}`} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 🎛️ 4 ACTION BUTTONS (2x2 GRID) */}
      {(galleryLength === 0 || isImageExpanded) && (
        <div className="grid grid-cols-2 gap-2 mt-4 w-full animate-stagger-2">
          <button
            onClick={() => handleGenerateImage('regenerate', activeWord)}
            disabled={isImageLoading || isUploading || isConfirmingDelete}
            className="py-3 px-2 bg-gray-50 hover:bg-white text-gray-700 text-[10px] font-bold rounded-xl border-2 border-gray-100 hover:border-[#8B004A]/30 hover:shadow-sm transition-all flex items-center justify-center gap-2 uppercase tracking-wider active:scale-95 disabled:opacity-50"
          >
            <RefreshCw size={16} strokeWidth={2.5} className="text-[#8B004A]" /> AI Auto
          </button>
          
          <button
            onClick={() => {
              const userIdea = window.prompt("Custom prompt (e.g., 'A modern neon city'):");
              if (userIdea && userIdea.trim() !== "") {
                handleGenerateImage('refine', activeWord, userIdea);
              }
            }}
            disabled={isImageLoading || isUploading || isConfirmingDelete}
            className="py-3 px-2 bg-gray-50 hover:bg-white text-gray-700 text-[10px] font-bold rounded-xl border-2 border-gray-100 hover:border-[#FFB800]/50 hover:shadow-sm transition-all flex items-center justify-center gap-2 uppercase tracking-wider active:scale-95 disabled:opacity-50"
          >
            <Sparkles size={16} strokeWidth={2.5} className="text-[#FFB800]" /> AI Custom
          </button>

          {/* SEARCH WEB BUTTON */}
          <button
            onClick={searchWebForImages}
            disabled={isImageLoading || isUploading || isConfirmingDelete}
            className="py-3 px-2 bg-gray-50 hover:bg-white text-gray-700 text-[10px] font-bold rounded-xl border-2 border-gray-100 hover:border-indigo-200 hover:shadow-sm transition-all flex items-center justify-center gap-2 uppercase tracking-wider active:scale-95 disabled:opacity-50"
          >
            <Globe size={16} strokeWidth={2.5} className="text-indigo-500" /> Search Web
          </button>

          <button
            onClick={() => fileInputRef.current.click()}
            disabled={isImageLoading || isUploading || isConfirmingDelete}
            className="py-3 px-2 bg-gray-50 hover:bg-white text-gray-700 text-[10px] font-bold rounded-xl border-2 border-gray-100 hover:border-emerald-200 hover:shadow-sm transition-all flex items-center justify-center gap-2 uppercase tracking-wider active:scale-95 disabled:opacity-50"
          >
            <Upload size={16} strokeWidth={2.5} className="text-emerald-500" /> Upload File
          </button>
          
          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleCustomImageUpload} className="hidden" />
        </div>
      )}

      {/* ========================================================= */}
      {/* 🖼️ IN-APP WEB SEARCH MODAL (BOTTOM SHEET UI) */}
      {/* ========================================================= */}
      <AnimatePresence>
        {isWebSearchOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
              onClick={() => setIsWebSearchOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 max-w-[450px] mx-auto bg-white rounded-t-[2.5rem] z-[201] p-6 shadow-2xl flex flex-col h-[75vh]"
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-5">
                 <div>
                    <h3 className="font-playful text-2xl font-bold text-[#8B004A] flex items-center gap-2">
                      <Search size={24} className="text-indigo-500" /> Image Results
                    </h3>
                    <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mt-1">Tap an image to save it to "{activeWord}"</p>
                 </div>
                 <button onClick={() => setIsWebSearchOpen(false)} className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 active:scale-90 transition-transform">
                   <X size={20} strokeWidth={2.5}/>
                 </button>
              </div>

              {/* Grid Content */}
              <div className="flex-1 overflow-y-auto custom-scrollbar pb-10 pr-2">
                {isSearchingWeb ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <Loader2 className="animate-spin text-indigo-500 w-12 h-12 mb-4" strokeWidth={2.5} />
                    <p className="font-playful text-gray-500 font-bold text-lg">Scanning the web...</p>
                  </div>
                ) : webImages.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {webImages.map((imgUrl, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => onWebImageSelect(imgUrl)}
                        className="relative rounded-2xl overflow-hidden aspect-square border-2 border-gray-100 hover:border-[#E01A76] cursor-pointer group shadow-sm bg-gray-50"
                      >
                        <img 
                          src={imgUrl} 
                          alt={`Search result ${idx}`} 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                          loading="lazy" 
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/300?text=Blocked+by+Site";
                          }}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center backdrop-blur-[1px]">
                           <span className="bg-white text-[#8B004A] text-[11px] font-black px-4 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0 shadow-lg uppercase tracking-wider">Save Image</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
                    <Globe size={48} className="mb-4 opacity-30" strokeWidth={1.5} />
                    <p className="font-playful font-bold text-lg">No matches found.</p>
                    <p className="text-xs uppercase tracking-widest mt-1">Try AI generation instead.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}