import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, Mic, FileText, MoreHorizontal, BookOpen, Library, User, MessageCircle } from 'lucide-react'; 

const BottomNav = () => {
  const location = useLocation();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const menuRef = useRef(null);
  
  // 🔥 NEW STATE: Track if there are any unread messages
  const [hasUnreadSquads, setHasUnreadSquads] = useState(false);
  const userEmail = localStorage.getItem("eng_userEmail") || "guest@gmail.com";
  const API_URL = window.location.hostname === "localhost" ? "http://localhost:3000" : "https://serdeptry1st.onrender.com";

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

  useEffect(() => {
    setIsMoreOpen(false);
  }, [location.pathname]);

  // 🚀 BACKGROUND FETCH: Check for unread messages
  useEffect(() => {
    const fetchUnreadStatus = async () => {
      if (!userEmail || userEmail === "guest@gmail.com") return;
      try {
        const res = await fetch(`${API_URL}/api/squads/user/${userEmail}`);
        const data = await res.json();
        if (data.success) {
          // Check if ANY squad has an unreadCount > 0
          const hasUnread = data.squads.some(squad => squad.unreadCount > 0);
          setHasUnreadSquads(hasUnread);
        }
      } catch (error) {
        console.error("Error fetching unread status", error);
      }
    };

    fetchUnreadStatus();
    // Har 15 second mein check karega taaki badge automatically update ho
    const interval = setInterval(fetchUnreadStatus, 15000);
    return () => clearInterval(interval);
  }, [userEmail, API_URL]);

  // 🎯 Main Navbar Items 
  const mainNavItems = [
    { name: 'Learn', path: '/home', icon: Home },
    { name: 'Community', path: '/community', icon: Users },
    { name: 'Lessons', path: '/lessons', icon: BookOpen }, 
    { name: 'Talk', path: '/interactive-quiz', icon: Mic }, 
  ];

  // 📂 More Menu Items 
  const moreNavItems = [
    { name: 'Squads', path: '/squads', icon: MessageCircle }, 
    { name: 'Test', path: '/find-vocab', icon: FileText }, 
    { name: 'E-Books', path: '/ebook-store', icon: Library },
    { name: 'Profile', path: '/user', icon: User },
  ];

  return (
    <div className="fixed bottom-0 w-full z-50 pointer-events-none" ref={menuRef}>
      
      {/* 🔼 MORE MENU POPUP */}
      <div 
        className={`absolute bottom-[75px] right-4 bg-white border-2 border-[#8B004A]/10 rounded-2xl shadow-xl shadow-[#8B004A]/10 p-2 w-48 transition-all duration-300 origin-bottom-right ${
          isMoreOpen 
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto visible' 
            : 'opacity-0 scale-95 translate-y-2 pointer-events-none invisible'
        }`}
      >
        {moreNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.includes(item.path);
          return (
            <Link
              key={item.name}
              to={item.path}
              tabIndex={isMoreOpen ? 0 : -1} 
              onClick={(e) => {
                if (!isMoreOpen) e.preventDefault();
                // Jab click kare, to turant local state me dot hata do for snappy UI
                if (item.name === 'Squads') setHasUnreadSquads(false); 
              }} 
              className={`flex items-center gap-3 p-3 rounded-xl transition-all font-bold ${
                isActive ? 'bg-[#E01A76]/10 text-[#E01A76]' : 'text-gray-500 hover:bg-[#F2EFE7] hover:text-[#8B004A]'
              }`}
            >
              {/* 🔥 SQUADS MENU ITEM DOT 🔥 */}
              <div className="relative">
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                {item.name === 'Squads' && hasUnreadSquads && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#E01A76] rounded-full border-2 border-white animate-pulse"></span>
                )}
              </div>
              <span className="text-xs uppercase tracking-wider">{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* 🔽 MAIN BOTTOM NAVIGATION BAR */}
      <div className="w-full bg-[#F2EFE7]/95 backdrop-blur-md border-t-2 border-[#8B004A]/10 shadow-[0_-5px_20px_rgba(139,0,74,0.05)] flex justify-between px-6 py-3 pb-4 pointer-events-auto transition-colors duration-500">
        {mainNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path === '/community' && location.pathname === '/');
          
          return (
            <Link 
              key={item.name} 
              to={item.path} 
              className={`flex flex-col items-center justify-center w-12 transition-all duration-300 group ${
                isActive ? 'text-[#E01A76]' : 'text-gray-400 hover:text-[#8B004A]'
              }`}
            >
              <div className={`p-1.5 rounded-full transition-all duration-300 ${isActive ? 'bg-[#E01A76]/10 scale-110' : 'group-hover:scale-110'}`}>
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] mt-1 uppercase tracking-wider font-extrabold transition-all duration-300 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-70 translate-y-0.5 group-hover:opacity-100'}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
        
        {/* MORE BUTTON */}
        <button
          onClick={() => setIsMoreOpen(!isMoreOpen)}
          className={`flex flex-col items-center justify-center w-12 transition-all duration-300 outline-none group ${
            isMoreOpen ? 'text-[#E01A76]' : 'text-gray-400 hover:text-[#8B004A]'
          }`}
        >
          {/* 🔥 MAIN MORE BUTTON DOT 🔥 */}
          <div className={`relative p-1.5 rounded-full transition-all duration-300 ${isMoreOpen ? 'bg-[#E01A76]/10 scale-110' : 'group-hover:scale-110'}`}>
            <MoreHorizontal size={24} strokeWidth={isMoreOpen ? 2.5 : 2} />
            {hasUnreadSquads && !isMoreOpen && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#E01A76] rounded-full border-2 border-[#F2EFE7] animate-pulse"></span>
            )}
          </div>
          <span className={`text-[10px] mt-1 uppercase tracking-wider font-extrabold transition-all duration-300 ${isMoreOpen ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>
            More
          </span>
        </button>
      </div>
    </div>
  );
};

export default BottomNav;