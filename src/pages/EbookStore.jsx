import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, ShoppingBag, Sparkles, Swords, CheckCircle2, ChevronRight, MessageCircle } from "lucide-react";

export default function EbookStore() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [filter, setFilter] = useState("All");

  const products = [
    {
      id: 1,
      category: "Interactive",
      title: "Master 3000+ Vocab",
      subtitle: "Hindi to English with AI Voice",
      price: 49,
      oldPrice: 199,
      themeBg: "bg-[#8B004A]",
      themeText: "text-[#8B004A]",
      borderAccent: "border-[#8B004A]/30",
      coverImage: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400", 
      icon: "🎯"
    },
    {
      id: 2,
      category: "E-Books",
      title: "Daily Use Sentences",
      subtitle: "500+ Ready-to-use exact scripts",
      price: 29,
      oldPrice: 99,
      themeBg: "bg-[#FFB800]",
      themeText: "text-[#d99d00]",
      borderAccent: "border-[#FFB800]/40",
      coverImage: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=400",
      icon: "✍️"
    },
    {
      id: 3,
      category: "Comics",
      title: "The English Hero",
      subtitle: "Grammar through visual stories",
      price: 79,
      oldPrice: 249,
      themeBg: "bg-[#E01A76]",
      themeText: "text-[#E01A76]",
      borderAccent: "border-[#E01A76]/30",
      coverImage: "https://i.pinimg.com/736x/bd/15/c6/bd15c68a0f97c2a767a3a3d0f7c33793.jpg",
      icon: "🦸‍♂️"
    },
    {
      id: 4,
      category: "Stories",
      title: "Moral Stories Sync",
      subtitle: "Advanced vocab through context",
      price: 19,
      oldPrice: 59,
      themeBg: "bg-emerald-500",
      themeText: "text-emerald-600",
      borderAccent: "border-emerald-500/30",
      coverImage: "https://i.pinimg.com/1200x/70/9d/52/709d522318f132b2a57be4174863b1f5.jpg",
      icon: "📖"
    }
  ];

  // 🔥 HANDLERS
  const handleProductAction = (product) => {
    if (product.id === 1) {
      toast.success("Opening Interactive Hub... 🚀");
      setTimeout(() => {
        navigate("/interactive-quiz");
      }, 800);
    } else {
      if (cart.find(item => item.id === product.id)) {
        toast.error("Already in your queue! 🛒");
        return;
      }
      setCart([...cart, product]);
      toast.success(`${product.title} Linked! 📥`);
    }
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
    toast.error("Removed from Queue");
  };

  const handlePayment = () => {
    const phoneNumber = "7080981033"; 
    const itemsList = cart.map(item => `- ${item.title} (₹${item.price})`).join("%0A");
    const totalAmount = cart.reduce((sum, item) => sum + item.price, 0);
    
    const message = `*NEW DIGITAL ORDER*%0A%0A` +
                    `*Items:*%0A${itemsList}%0A%0A` +
                    `*Total Amount:* ₹${totalAmount}%0A%0A` +
                    `Bhai mujhe ye materials purchase karne hain. QR Code bhej do payment ke liye.`;

    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    
    toast.success("Opening Secure Chat... 🚀");
    setTimeout(() => {
      window.open(whatsappUrl, "_blank");
    }, 1000);
  };

  const filteredProducts = filter === "All" ? products : products.filter(p => p.category === filter);
  const totalAmount = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@600;700;800;900&display=swap');
          
          :root {
            --font-heading: 'Plus Jakarta Sans', sans-serif;
            --font-body: 'Inter', sans-serif;
          }

          /* 🔥 FIX: Global background ko cream color kar diya taaki black background peek na kare */
          html, body {
            background-color: #F2EFE7 !important;
          }

          .font-heading { font-family: var(--font-heading); }
          .font-body { font-family: var(--font-body); }

          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

          .glass-ultra {
            background: rgba(242, 239, 231, 0.65);
            backdrop-filter: blur(24px);
            -webkit-backdrop-filter: blur(24px);
            border: 1px solid rgba(255, 255, 255, 0.9);
            box-shadow: 0 8px 32px 0 rgba(139, 0, 74, 0.05);
          }

          .duo-btn {
            border-bottom-width: 4px;
            transition: all 0.1s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .duo-btn:active:not(:disabled) {
            transform: translateY(4px);
            border-bottom-width: 0px;
            margin-top: 4px;
          }
        `}
      </style>

      <div className="min-h-screen bg-[#F2EFE7] text-gray-900 font-body pb-32 overflow-x-hidden w-full relative selection:bg-[#E01A76]/20 selection:text-[#8B004A]">
        
        {/* VIBRANT GLOWING ORBS FOR BLUR EFFECT */}
        <div className="fixed top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-gradient-to-br from-[#E01A76]/20 to-[#8B004A]/10 rounded-full blur-[100px] pointer-events-none animate-pulse" style={{animationDuration: '6s'}}></div>
        <div className="fixed top-[30%] right-[-20%] w-[60vw] h-[60vw] bg-[#FFB800]/15 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="fixed bottom-[-10%] left-[20%] w-[40vw] h-[40vw] bg-[#8B004A]/10 rounded-full blur-[100px] pointer-events-none"></div>

        <Toaster 
          position="top-center" 
          toastOptions={{
            style: {
              background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(16px)', color: '#8B004A', border: '2px solid rgba(139,0,74,0.3)',
              fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: '800', borderRadius: '20px',
              padding: '14px 24px', boxShadow: '0 10px 25px -5px rgba(139, 0, 74, 0.15)',
            }
          }}
        />

        <div className="max-w-[1200px] mx-auto pt-8 px-4 relative z-10">

          {/* 🌌 GLASS HEADER */}
          <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-6 mb-12">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                <span className="bg-[#8B004A]/10 text-[#8B004A] text-[10px] px-3 py-1.5 rounded-xl font-extrabold tracking-widest uppercase flex items-center gap-1.5 border border-[#8B004A]/20">
                  <BookOpen size={14} fill="currentColor"/> Premium Assets
                </span>
              </div>
              <h1 className="text-5xl sm:text-[3.5rem] font-heading font-black text-gray-900 tracking-tight leading-none drop-shadow-sm">
                Learning <span className="text-transparent bg-clip-text bg-gradient-to-br from-[#8B004A] to-[#E01A76]">Library</span>
              </h1>
            </motion.div>

            {/* 🛒 TOP CART WIDGET */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="bg-white/80 backdrop-blur-xl border border-white p-3 pr-4 rounded-[1.5rem] flex items-center gap-5 shadow-[0_8px_30px_rgb(139,0,74,0.06)]">
                  <div className="bg-[#8B004A]/5 p-3 rounded-xl flex items-center justify-center relative">
                     <ShoppingBag className="text-[#8B004A]" size={22} strokeWidth={2.5}/>
                     {cart.length > 0 && (
                       <span className="absolute -top-2 -right-2 bg-[#E01A76] text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-black border-2 border-white shadow-sm">
                         {cart.length}
                       </span>
                     )}
                  </div>
                  <div className="flex flex-col pr-4">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Queue Total</span>
                      <span className="text-[20px] font-heading font-black text-gray-900 leading-none">₹{totalAmount}</span>
                  </div>
              </div>
            </motion.div>
          </div>

          {/* ⚡ CATEGORY NAVIGATION */}
          <div className="flex gap-2.5 overflow-x-auto no-scrollbar mb-10 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
              {["All", "E-Books", "Comics", "Stories", "Interactive"].map((tab) => (
                  <button 
                    key={tab} 
                    onClick={() => setFilter(tab)}
                    className={`whitespace-nowrap px-6 py-3 rounded-2xl border-2 font-heading font-bold text-[13px] transition-all duration-300 shadow-sm shrink-0 active:scale-95 ${
                      filter === tab 
                        ? 'bg-[#8B004A] text-white border-[#600033] shadow-md' 
                        : 'bg-white text-gray-600 border-gray-100 hover:border-[#8B004A]/30 hover:text-[#8B004A]'
                    }`}
                  >
                      {tab}
                  </button>
              ))}
          </div>

          {/* 📦 VERTICAL PORTRAIT GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((item, idx) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                key={item.id} 
                className="group bg-white/90 backdrop-blur-md border-2 border-white rounded-[2rem] flex flex-col h-auto transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(139,0,74,0.1)] overflow-hidden shadow-sm"
              >
                
                {/* 🖼️ COVER IMAGE SECTION */}
                <div className="relative h-[220px] w-full overflow-hidden bg-gray-100">
                  <img 
                    src={item.coverImage} 
                    alt={item.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  
                  {/* Category Pill Over Image */}
                  <div className="absolute top-4 left-4">
                    <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl bg-white/20 backdrop-blur-md border border-white/40 text-white shadow-sm flex items-center gap-1.5">
                        <span className="text-[14px] leading-none drop-shadow-md">{item.icon}</span> {item.category}
                    </span>
                  </div>
                </div>
                
                {/* CONTENT SECTION */}
                <div className="p-6 flex flex-col flex-1 bg-white">
                  <div className="mb-4 flex-1">
                     <h2 className="text-2xl font-black font-heading tracking-tight leading-tight text-gray-900 mb-2">{item.title}</h2>
                     <p className="text-[13px] font-bold text-gray-500 leading-relaxed font-body">{item.subtitle}</p>
                  </div>

                  {/* Price & Action Section */}
                  <div className="mt-auto space-y-5">
                    <div className="flex items-end justify-between border-t-2 border-gray-50 pt-4">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-black text-gray-400 uppercase line-through leading-none mb-1 decoration-gray-300">₹{item.oldPrice}</span>
                        <div className="flex items-center gap-1.5">
                           <span className={`text-[28px] font-black font-heading tracking-tighter leading-none ${item.themeText}`}>₹{item.price}</span>
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400">
                         <Sparkles size={14}/>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleProductAction(item)}
                      className={`w-full py-4 rounded-2xl font-heading font-black uppercase text-[12px] tracking-wider transition-all duration-300 active:border-b-0 shadow-md flex items-center justify-center gap-2 duo-btn border-black ${
                        item.id === 1 
                          ? 'bg-[#1E1E24] text-white hover:bg-black' 
                          : cart.find(c => c.id === item.id) 
                            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' 
                            : `${item.themeBg} text-white`
                      }`}
                      style={{ borderBottomColor: item.id === 1 ? '#000' : cart.find(c => c.id === item.id) ? '#e5e7eb' : 'rgba(0,0,0,0.2)' }}
                    >
                      {item.id === 1 ? <><Swords size={16}/> Practice Now</> : cart.find(c => c.id === item.id) ? <><CheckCircle2 size={16}/> Added</> : "Unlock Now"}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* 🔒 STICKY BOTTOM NAV FOR MOBILE CART */}
        <AnimatePresence>
          {cart.length > 0 && (
              <motion.div 
                initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
                className="fixed bottom-6 left-0 right-0 px-4 w-full z-[100] flex justify-center pointer-events-none"
              >
                 <div className="w-full max-w-[400px] bg-white/90 backdrop-blur-xl p-3 pr-3.5 rounded-[2rem] shadow-[0_20px_50px_rgba(139,0,74,0.15)] flex justify-between items-center border-2 border-white pointer-events-auto">
                    
                    <div className="flex items-center gap-4 pl-3">
                       <div className="w-12 h-12 bg-[#8B004A]/10 rounded-2xl flex items-center justify-center text-[#8B004A] font-black font-heading text-lg border border-[#8B004A]/20">
                          {cart.length}
                       </div>
                       <div className="flex flex-col">
                           <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-0.5 font-heading">Total Due</p>
                           <p className="text-[22px] font-black tracking-tight leading-none text-gray-900 font-heading">₹{totalAmount}</p>
                       </div>
                    </div>
                    
                    <button 
                      onClick={handlePayment}
                      className="bg-[#25D366] hover:bg-[#1DA851] text-white px-6 py-4 rounded-[1.5rem] font-heading font-black text-[13px] active:scale-95 shadow-lg shadow-[#25D366]/30 transition-all flex items-center gap-2 duo-btn border-[#1DA851]"
                    >
                        <MessageCircle size={18} strokeWidth={2.5}/> Get via Chat
                    </button>
                 </div>
              </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Branding */}
        <div className="mt-24 mb-12 text-center opacity-40">
           <p className="text-[10px] font-extrabold uppercase tracking-widest font-heading text-[#8B004A]">Vocab Mastery • Store Module</p>
        </div>

      </div>
    </>
  );
}