import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, Mic, FileText, MoreHorizontal } from 'lucide-react';

const BottomNav = () => {
  const location = useLocation();
  
  // Tumhare routes ke hisaab se paths set kiye hain
  const navItems = [
    { name: 'Learn', path: '/home', icon: Home },
    { name: 'Community', path: '/community', icon: Users }, // Naya Community Tab
    { name: 'Talk', path: '/find-vocab', icon: Mic }, // Talk ke liye existing koi route daal diya, apne hisab se change kar lena
    { name: 'Test', path: '/interactive-quiz', icon: FileText },
    { name: 'More', path: '/user', icon: MoreHorizontal },
  ];

  return (
    // Fixed bottom styling image jaisi (dark theme)
    <div className="fixed bottom-0 w-full bg-[#0b101a] border-t border-gray-800 flex justify-between px-6 py-4 pb-4 z-50">
      {navItems.map((item) => {
        const Icon = item.icon;
        // Check if route is active (Community root '/' par bhi match karega)
        const isActive = location.pathname === item.path || (item.path === '/community' && location.pathname === '/');
        
        return (
          <Link 
            key={item.name} 
            to={item.path} 
            className={`flex flex-col items-center transition duration-200 ${
              isActive ? 'text-yellow-500' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <Icon size={24} />
            <span className="text-[10px] mt-1 font-semibold">{item.name}</span>
          </Link>
        );
      })}
    </div>
  );
};

export default BottomNav;