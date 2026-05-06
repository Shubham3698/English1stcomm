import React from 'react';
import toast from 'react-hot-toast';

const PremiumSoundFeature = ({ isPremiumUser, children }) => {
  const handleProtectedAction = (e) => {
    if (!isPremiumUser) {
      e.preventDefault();
      e.stopPropagation();
      toast.error("Bhai, AI Voice sirf Premium users ke liye hai! Trial lo aur suno. 🎧");
    }
  };

  return (
    <div 
      onClickCapture={handleProtectedAction} 
      className={`relative inline-block transition-all ${!isPremiumUser ? "opacity-40 grayscale sepia" : "hover:scale-110"}`}
    >
      {children}
      {!isPremiumUser && (
        <span className="absolute -top-1 -right-1 text-[10px] bg-black text-white rounded-full w-4 h-4 flex items-center justify-center border border-white shadow-lg">
          🔒
        </span>
      )}
    </div>
  );
};

export default PremiumSoundFeature;