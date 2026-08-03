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
  Search
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

  // 🔥 NAYE STATES WEB SEARCH MODAL KE LIYE
  const [isWebSearchOpen, setIsWebSearchOpen] = useState(false);
  const [isSearchingWeb, setIsSearchingWeb] = useState(false);
  const [webImages, setWebImages] = useState([]);

  // Base API URL
  const API_URL = import.meta.env.DEV ? "http://localhost:3000" : "https://serdeptry1st.onrender.com";

  // Jab bhi naya word aaye, image 1st wali par set ho jaye
  useEffect(() => {
    setCurrentIndex(0);
    setIsConfirmingDelete(false);
  }, [activeWord]);

  // Web se images dhoondhne wala function
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

  useEffect(() => {
    if (currentIndex >= imageGallery.length) {
      setCurrentIndex(Math.max(0, imageGallery.length - 1));
    }
  }, [imageGallery.length, currentIndex]);

  useEffect(() => {
    setIsConfirmingDelete(false);
  }, [currentIndex]);

  const nextImage = () => {
    if (!isConfirmingDelete) setCurrentIndex((prev) => (prev + 1) % imageGallery.length);
  };
  const prevImage = () => {
    if (!isConfirmingDelete) setCurrentIndex((prev) => (prev - 1 + imageGallery.length) % imageGallery.length);
  };

  const minSwipeDistance = 50;
  const onTouchStart = (e) => {
    if (isConfirmingDelete) return;
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  const onTouchMove = (e) => {
    if (!isConfirmingDelete) setTouchEnd(e.targetTouches[0].clientX);
  };
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd || isConfirmingDelete) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance) nextImage();
    if (distance < -minSwipeDistance) prevImage();
  };

  return (
    <div className="pt-6 mt-6 border-t border-gray-100 w-full animate-stagger-4 relative">
      <div className="flex justify-between items-center mb-4">
        <span className="text-gray-500 text-[10px] uppercase font-bold tracking-widest flex items-center gap-1.5">
          <ImageIcon size={14} className="text-[#E01A76]" /> Visual Anchor ({imageGallery.length})
        </span>
      </div>
      
      <div className={`w-full rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden relative transition-all duration-500 ${!isImageExpanded && imageGallery.length > 0 ? 'py-10' : 'p-3'}`}>
        
        {(isImageLoading || isUploading) && (
          <div className="flex flex-col items-center justify-center gap-4 absolute inset-0 bg-white/80 backdrop-blur-sm z-10 min-h-[160px]">
            <Loader2 size={32} className="animate-spin text-[#E01A76]" strokeWidth={2} />
            <p className="text-[#8B004A] font-bold text-[10px] uppercase tracking-widest animate-pulse">
              {isUploading ? 'Uploading...' : 'Rendering Concept...'}
            </p>
          </div>
        )}

        {/* Failed / Empty State */}
        {imageGallery.length === 0 && !isImageLoading && !isUploading && (
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
        {imageGallery.length > 0 && !isImageExpanded && !isImageLoading && !isUploading && (
          <div className="flex flex-col items-center text-center px-4 w-full">
            <div className="bg-[#8B004A]/10 p-4 rounded-full mb-3 text-[#8B004A]">
              <ImageIcon size={28} strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Visual Ready</h3>
            <p className="text-gray-400 font-medium text-[11px] mb-5">Tap to reveal {imageGallery.length > 1 ? `${imageGallery.length} memory anchors` : "the memory anchor"} for "{activeWord}"</p>
            <button 
              onClick={() => setIsImageExpanded(true)}
              className="px-8 py-3 bg-gray-900 hover:bg-[#E01A76] text-white text-[12px] font-bold uppercase tracking-wider rounded-xl transition-colors active:scale-95 flex items-center justify-center gap-2"
            >
              Reveal Image <ArrowRight size={14} strokeWidth={2} />
            </button>
          </div>
        )}

        {/* PURE SWIPEABLE UI */}
        {imageGallery.length > 0 && isImageExpanded && (
          <div 
            className="relative w-full bg-black rounded-xl group aspect-square flex items-center justify-center overflow-hidden touch-pan-y"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {/* 🔥 ASLI MAGIC YAHAN HAI: Key me sirf activeWord dala hai taaki React naya samjhe */}
            <img 
              key={activeWord}
              src={imageGallery[currentIndex]} 
              alt={`${activeWord}-${currentIndex}`} 
              className={`w-full h-full object-contain transition-all duration-300 ${isConfirmingDelete ? 'opacity-40 blur-sm scale-95' : 'opacity-100'}`}
            />
            
            {!isConfirmingDelete && (
              <button 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  setIsConfirmingDelete(true); 
                }}
                className="absolute top-3 right-3 bg-red-500/90 hover:bg-red-600 text-white p-2 rounded-full opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-md shadow-lg z-20 active:scale-90"
              >
                <X size={16} strokeWidth={2.5} />
              </button>
            )}

            {isConfirmingDelete && (
              <div className="absolute inset-0 flex flex-col items-center justify-center z-30 px-6">
                <span className="text-white text-sm font-bold mb-4 tracking-wide bg-black/60 px-4 py-2 rounded-lg backdrop-blur-md border border-gray-700">
                  Permanently delete this image?
                </span>
                <div className="flex gap-3">
                  <button onClick={(e) => { e.stopPropagation(); setIsConfirmingDelete(false); }} className="px-5 py-2.5 bg-gray-600 hover:bg-gray-500 text-white text-[11px] uppercase font-bold tracking-wider rounded-xl">Cancel</button>
                  <button onClick={(e) => { e.stopPropagation(); setIsConfirmingDelete(false); handleRemoveImage(currentIndex); }} className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-[11px] uppercase font-bold tracking-wider rounded-xl shadow-lg shadow-red-600/30">Yes, Delete</button>
                </div>
              </div>
            )}

            {imageGallery.length > 1 && !isConfirmingDelete && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-sm z-10 transition-opacity">
                {imageGallery.map((_, idx) => (
                  <button key={idx} onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }} className={`h-2 rounded-full transition-all duration-300 ${idx === currentIndex ? 'bg-[#E01A76] w-5' : 'bg-white/50 hover:bg-white w-2'}`} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 🎛️ 4 ACTION BUTTONS (2x2 GRID) */}
      {(imageGallery.length === 0 || isImageExpanded) && (
        <div className="grid grid-cols-2 gap-2 mt-4 w-full animate-stagger-2">
          <button
            onClick={() => handleGenerateImage('regenerate', activeWord)}
            disabled={isImageLoading || isUploading || isConfirmingDelete}
            className="py-3 px-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-[10px] font-bold rounded-xl border border-gray-200 transition-colors flex items-center justify-center gap-2 uppercase tracking-wider active:scale-95 disabled:opacity-50"
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
            className="py-3 px-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-[10px] font-bold rounded-xl border border-gray-200 transition-colors flex items-center justify-center gap-2 uppercase tracking-wider active:scale-95 disabled:opacity-50"
          >
            <Sparkles size={16} strokeWidth={2.5} className="text-[#FFB800]" /> AI Custom
          </button>

          {/* SEARCH WEB BUTTON */}
          <button
            onClick={searchWebForImages}
            disabled={isImageLoading || isUploading || isConfirmingDelete}
            className="py-3 px-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-[10px] font-bold rounded-xl border border-gray-200 transition-colors flex items-center justify-center gap-2 uppercase tracking-wider active:scale-95 disabled:opacity-50"
          >
            <Globe size={16} strokeWidth={2.5} className="text-indigo-500" /> Search Web
          </button>

          <button
            onClick={() => fileInputRef.current.click()}
            disabled={isImageLoading || isUploading || isConfirmingDelete}
            className="py-3 px-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-[10px] font-bold rounded-xl border border-gray-200 transition-colors flex items-center justify-center gap-2 uppercase tracking-wider active:scale-95 disabled:opacity-50"
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
              className="fixed bottom-0 left-0 right-0 max-w-[450px] mx-auto bg-white rounded-t-[2rem] z-[201] p-5 shadow-2xl flex flex-col h-[75vh]"
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-4">
                 <div>
                    <h3 className="font-playful text-xl font-bold text-[#8B004A] flex items-center gap-2">
                      <Search size={20} className="text-indigo-500" /> Image Results
                    </h3>
                    <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mt-1">Tap an image to save it</p>
                 </div>
                 <button onClick={() => setIsWebSearchOpen(false)} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600">
                   <X size={20}/>
                 </button>
              </div>

              {/* Grid Content */}
              <div className="flex-1 overflow-y-auto custom-scrollbar pb-10">
                {isSearchingWeb ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <Loader2 className="animate-spin text-indigo-500 w-10 h-10 mb-3" />
                    <p className="font-playful text-gray-500 font-bold">Scanning the web...</p>
                  </div>
                ) : webImages.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {webImages.map((imgUrl, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => onWebImageSelect(imgUrl)}
                        className="relative rounded-xl overflow-hidden aspect-square border-2 border-transparent hover:border-[#E01A76] cursor-pointer group shadow-sm bg-gray-100"
                      >
                        {/* Fix: Android WebView Image Blocking fix */}
                        <img 
                          src={imgUrl} 
                          alt={`Search result ${idx}`} 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
                          loading="lazy" 
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/300?text=Blocked+by+Site";
                          }}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                           <span className="bg-white text-[#8B004A] text-[10px] font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0 shadow-lg">Save Image</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
                    <Globe size={40} className="mb-3 opacity-30" />
                    <p className="font-playful font-bold text-sm">No exact matches found.</p>
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