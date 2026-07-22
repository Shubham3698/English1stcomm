import React from 'react';

const PremiumSoundFeature = ({ children }) => {
  // Ab koi restriction nahi, sabke liye free! 🎧
  return (
    <div className="relative inline-block transition-all hover:scale-110 cursor-pointer">
      {children}
    </div>
  );
};

export default PremiumSoundFeature;