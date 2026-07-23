import React, { useState, useEffect } from "react";
import { 
  Image as ImageIcon, 
  Loader2, 
  ArrowRight, 
  X, 
  RefreshCw, 
  Sparkles, 
  Upload
} from "lucide-react";

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
  fileInputRef
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // 🔥 Two-Step Deletion ke liye naya state
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // Agar image delete ho aur index out of bounds chala jaye
  useEffect(() => {
    if (currentIndex >= imageGallery.length) {
      setCurrentIndex(Math.max(0, imageGallery.length - 1));
    }
  }, [imageGallery.length, currentIndex]);

  // Agar user swipe kar de delete confirmation ke time, toh confirmation cancel kar do
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
    if (isConfirmingDelete) return; // Delete confirmation time par swipe disable
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  const onTouchMove = (e) => {
    if (!isConfirmingDelete) setTouchEnd(e.targetTouches[0].clientX);
  };
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd || isConfirmingDelete) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) nextImage();
    if (isRightSwipe) prevImage();
  };

  return (
    <div className="pt-6 mt-6 border-t border-gray-100 w-full animate-stagger-4">
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

        {/* 🔥 NAYA: Agar Image NAHI aayi (Failed State) 🔥 */}
        {imageGallery.length === 0 && !isImageLoading && !isUploading && (
          <div className="flex flex-col items-center justify-center text-center px-4 py-8 w-full">
            <div className="bg-red-500/10 p-4 rounded-full mb-3 text-red-500">
              <ImageIcon size={28} strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Visual Missing</h3>
            <p className="text-gray-400 font-medium text-[11px]">
              AI couldn't generate an image for "{activeWord}".<br/>Try regenerating or upload your own!
            </p>
          </div>
        )}

        {/* Agar Image aa gayi aur Expand nahi ki hai */}
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
            <img 
              src={imageGallery[currentIndex]} 
              alt={`${activeWord}-${currentIndex}`} 
              className={`w-full h-full object-contain transition-all duration-300 ${isConfirmingDelete ? 'opacity-40 blur-sm scale-95' : 'opacity-100'}`}
            />
            
            {/* "X" Button */}
            {!isConfirmingDelete && (
              <button 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  setIsConfirmingDelete(true); 
                }}
                className="absolute top-3 right-3 bg-red-500/90 hover:bg-red-600 text-white p-2 rounded-full opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-md shadow-lg z-20 active:scale-90"
                title="Remove this image"
              >
                <X size={16} strokeWidth={2.5} />
              </button>
            )}

            {/* Delete Confirmation Overlay */}
            {isConfirmingDelete && (
              <div className="absolute inset-0 flex flex-col items-center justify-center z-30 px-6">
                <span className="text-white text-sm font-bold mb-4 tracking-wide bg-black/60 px-4 py-2 rounded-lg backdrop-blur-md border border-gray-700">
                  Permanently delete this image?
                </span>
                <div className="flex gap-3">
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      setIsConfirmingDelete(false); 
                    }}
                    className="px-5 py-2.5 bg-gray-600 hover:bg-gray-500 text-white text-[11px] uppercase font-bold tracking-wider rounded-xl transition-colors active:scale-95 shadow-lg"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      setIsConfirmingDelete(false);
                      handleRemoveImage(currentIndex); 
                    }}
                    className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-[11px] uppercase font-bold tracking-wider rounded-xl transition-colors active:scale-95 shadow-lg shadow-red-600/30"
                  >
                    Yes, Delete
                  </button>
                </div>
              </div>
            )}

            {/* Dot Indicators */}
            {imageGallery.length > 1 && !isConfirmingDelete && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-sm z-10 transition-opacity">
                {imageGallery.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      idx === currentIndex ? 'bg-[#E01A76] w-5' : 'bg-white/50 hover:bg-white w-2'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 🔥 FIX: Buttons ab tab bhi dikhenge agar image 0 ho (imageGallery.length === 0) 🔥 */}
      {(imageGallery.length === 0 || isImageExpanded) && (
        <div className="grid grid-cols-3 gap-2 mt-3 w-full animate-stagger-2">
          <button
            onClick={() => handleGenerateImage('regenerate', activeWord)}
            disabled={isImageLoading || isUploading || isConfirmingDelete}
            className="py-3 px-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-[10px] font-bold rounded-xl border border-gray-200 transition-colors flex flex-col items-center gap-1 uppercase tracking-wider active:scale-95 disabled:opacity-50"
          >
            <RefreshCw size={16} strokeWidth={2} className="text-[#8B004A]" /> Regenerate
          </button>
          
          <button
            onClick={() => {
              const userIdea = window.prompt("Custom prompt (e.g., 'A modern neon city'):");
              if (userIdea && userIdea.trim() !== "") {
                handleGenerateImage('refine', activeWord, userIdea);
              }
            }}
            disabled={isImageLoading || isUploading || isConfirmingDelete}
            className="py-3 px-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-[10px] font-bold rounded-xl border border-gray-200 transition-colors flex flex-col items-center gap-1 uppercase tracking-wider active:scale-95 disabled:opacity-50"
          >
            <Sparkles size={16} strokeWidth={2} className="text-[#FFB800]" /> Custom
          </button>

          <button
            onClick={() => fileInputRef.current.click()}
            disabled={isImageLoading || isUploading || isConfirmingDelete}
            className="py-3 px-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-[10px] font-bold rounded-xl border border-gray-200 transition-colors flex flex-col items-center gap-1 uppercase tracking-wider active:scale-95 disabled:opacity-50"
          >
            <Upload size={16} strokeWidth={2} className="text-gray-500" /> Upload
          </button>

          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef} 
            onChange={handleCustomImageUpload} 
            className="hidden" 
          />
        </div>
      )}
    </div>
  );
}