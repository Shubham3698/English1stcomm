import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, Mic, FileText, MoreHorizontal, BookOpen, Library, User } from 'lucide-react';

const BottomNav = () => {
  const location = useLocation();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const menuRef = useRef(null);

  // 🖱️ Screen pe kahin bhi click karne se "More" menu close ho jayega
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🔄 Route change hone pe menu automatically close ho jayega
  useEffect(() => {
    setIsMoreOpen(false);
  }, [location.pathname]);

  // 🎯 Main Navbar Items (Community ke baad Lessons aa gaya)
  const mainNavItems = [
    { name: 'Learn', path: '/home', icon: Home },
    { name: 'Community', path: '/community', icon: Users },
    { name: 'Lessons', path: '/lessons', icon: BookOpen }, // ✅ Lessons ab main menu me hai
    { name: 'Test', path: '/interactive-quiz', icon: FileText },
  ];

  // 📂 More Menu Items (Talk ab andar chala gaya)
  const moreNavItems = [
    { name: 'Talk', path: '/find-vocab', icon: Mic }, // ✅ Talk ab More ke andar hai
    { name: 'E-Books', path: '/ebook-store', icon: Library },
    { name: 'Profile', path: '/user', icon: User },
  ];

  return (
    // Fixed wrapper for entire navigation area
    <div className="fixed bottom-0 w-full z-50 pointer-events-none" ref={menuRef}>
      
      {/* 🔼 MORE MENU POPUP */}
      <div 
        className={`absolute bottom-[75px] right-4 bg-[#121c2d] border border-gray-800 rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.5)] p-2 w-48 transition-all duration-200 origin-bottom-right pointer-events-auto ${
          isMoreOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
        {moreNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                isActive ? 'bg-[#41ffd1]/10 text-[#41ffd1]' : 'text-gray-400 hover:bg-[#1a2538] hover:text-white'
              }`}
            >
              <Icon size={18} />
              <span className="text-xs font-bold uppercase tracking-wider">{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* 🔽 MAIN BOTTOM NAVIGATION BAR */}
      <div className="w-full bg-[#0b101a]/95 backdrop-blur-md border-t border-gray-800 flex justify-between px-6 py-3 pb-4 pointer-events-auto">
        {mainNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path === '/community' && location.pathname === '/');
          
          return (
            <Link 
              key={item.name} 
              to={item.path} 
              className={`flex flex-col items-center justify-center w-12 transition duration-200 ${
                isActive ? 'text-yellow-500' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Icon size={24} />
              <span className="text-[10px] mt-1 font-bold">{item.name}</span>
            </Link>
          );
        })}
        
        {/* MORE BUTTON */}
        <button
          onClick={() => setIsMoreOpen(!isMoreOpen)}
          className={`flex flex-col items-center justify-center w-12 transition duration-200 outline-none ${
            isMoreOpen ? 'text-[#41ffd1]' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          <MoreHorizontal size={24} />
          <span className="text-[10px] mt-1 font-bold">More</span>
        </button>
      </div>
    </div>
  );
};

export default BottomNav;