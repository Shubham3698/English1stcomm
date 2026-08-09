import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, Mic, FileText, MoreHorizontal, BookOpen, Library, User, MessageCircle } from 'lucide-react'; 
import { motion, useScroll, useMotionValueEvent } from "framer-motion";

const BottomNav = () => {
  const location = useLocation();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const menuRef = useRef(null);
  
  const [hasUnreadSquads, setHasUnreadSquads] = useState(false);
  const userEmail = localStorage.getItem("eng_userEmail") || "guest@gmail.com";
  const API_URL = window.location.hostname === "localhost" ? "http://localhost:3000" : "https://serdeptry1st.onrender.com";

  // 🔥 SMOOTH STABLE SCROLL ENGINE
  const [isHidden, setIsHidden] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { scrollY } = useScroll();

  // 🔥 ADDED /ebook-store TO HIDE-ON-SCROLL PAGES
  const isScrollHidePage = location.pathname === "/" || location.pathname === "/community" || location.pathname === "/ebook-store";

  useEffect(() => {
    setIsHidden(false);
    setIsMounted(false);
    const timer = setTimeout(() => setIsMounted(true), 300);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (!isScrollHidePage || !isMounted) {
      setIsHidden(false);
      return;
    }
    const previous = scrollY.getPrevious();
    if (latest <= 60) {
      setIsHidden(false);
      return;
    }

    const diff = latest - previous;
    if (diff > 12) {
      setIsHidden(true);
      setIsMoreOpen(false); 
    } else if (diff < -12) {
      setIsHidden(false);
    }
  });

  // 🔥 SCROLL LOCK EFFECT
  useEffect(() => {
    if (isMoreOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => { document.body.style.overflow = "auto"; };
  }, [isMoreOpen]);

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

  useEffect(() => {
    const fetchUnreadStatus = async () => {
      if (!userEmail || userEmail === "guest@gmail.com") return;
      try {
        const res = await fetch(`${API_URL}/api/squads/user/${userEmail}`);
        const data = await res.json();
        if (data.success) {
          const hasUnread = data.squads.some(squad => squad.unreadCount > 0);
          setHasUnreadSquads(hasUnread);
        }
      } catch (error) {}
    };

    fetchUnreadStatus();
    const interval = setInterval(fetchUnreadStatus, 15000);
    return () => clearInterval(interval);
  }, [userEmail, API_URL]);

  const mainNavItems = [
    { name: 'Learn', path: '/home', icon: Home },
    { name: 'Community', path: '/', icon: Users },
    { name: 'Lessons', path: '/lessons', icon: BookOpen }, 
    { name: 'Talk', path: '/interactive-quiz', icon: Mic }, 
  ];

  const moreNavItems = [
    { name: 'Squads', path: '/squads', icon: MessageCircle }, 
    { name: 'Test', path: '/find-vocab', icon: FileText }, 
    { name: 'E-Books', path: '/ebook-store', icon: Library },
    { name: 'Profile', path: '/user', icon: User },
  ];

  return (
    <>
      {/* 🌑 DEEP BLUR BACKDROP */}
      <div 
        onClick={() => setIsMoreOpen(false)}
        className={`fixed inset-0 bg-[#4A0027]/60 backdrop-blur-md z-[45] transition-opacity duration-500 ${isMoreOpen ? 'opacity-100 visible pointer-events-auto' : 'opacity-0 invisible pointer-events-none'}`} 
      />

      <motion.div 
        initial={{ y: 0 }}
        animate={{ y: isHidden ? "100%" : "0%" }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="fixed bottom-0 w-full z-50 pointer-events-none" 
        ref={menuRef}
      >
        
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
                  if (item.name === 'Squads') setHasUnreadSquads(false); 
                }} 
                className={`flex items-center gap-3 p-3 rounded-xl transition-all font-bold ${
                  isActive ? 'bg-[#E01A76]/10 text-[#E01A76]' : 'text-gray-500 hover:bg-[#F2EFE7] hover:text-[#8B004A]'
                }`}
              >
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
            const isActive = location.pathname === item.path || (item.path === '/' && location.pathname === '/community');
            
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
      </motion.div>
    </>
  );
};

export default BottomNav;