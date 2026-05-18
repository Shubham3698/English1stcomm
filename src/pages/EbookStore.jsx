import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import toast, { Toaster } from 'react-hot-toast';

export default function EbookStore() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [filter, setFilter] = useState("All");

  const products = [
    {
      id: 1,
      category: "prime method ✨",
      title: "Master 3000+ Vocabulary",
      subtitle: "Hindi to English with AI Voice",
      price: 49,
      oldPrice: 199,
      theme: "from-blue-600/20 to-blue-400/10",
      accent: "text-blue-400",
      border: "border-blue-500/30",
      coverImage: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400", 
      icon: "📚"
    },
    {
      id: 2,
      category: "E-Books",
      title: "Daily Use Sentences",
      subtitle: "500+ Ready-to-use neural scripts",
      price: 29,
      oldPrice: 99,
      theme: "from-amber-600/20 to-amber-400/10",
      accent: "text-amber-400",
      border: "border-amber-500/30",
      coverImage: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=400",
      icon: "✍️"
    },
    {
      id: 3,
      category: "Comics",
      title: "The English Hero: Vol 1",
      subtitle: "Grammar through visual storytelling",
      price: 79,
      oldPrice: 249,
      theme: "from-purple-600/20 to-purple-400/10",
      accent: "text-purple-400",
      border: "border-purple-500/30",
      coverImage: "https://i.pinimg.com/736x/bd/15/c6/bd15c68a0f97c2a767a3a3d0f7c33793.jpg",
      icon: "🦸‍♂️"
    },
    {
      id: 4,
      category: "Stories",
      title: "Neon Moral Stories",
      subtitle: "Advanced vocab through context",
      price: 19,
      oldPrice: 59,
      theme: "from-emerald-600/20 to-emerald-400/10",
      accent: "text-emerald-400",
      border: "border-emerald-500/30",
      coverImage: "https://i.pinimg.com/1200x/70/9d/52/709d522318f132b2a57be4174863b1f5.jpg",
      icon: "📖"
    }
  ];

  // 🔥 HANDLERS
  const handleProductAction = (product) => {
    if (product.id === 1) {
      toast.success("Initializing Interactive Hub... 🚀");
      setTimeout(() => {
        navigate("/interactive-quiz");
      }, 800);
    } else {
      if (cart.find(item => item.id === product.id)) {
        toast.error("Already in grid! 🛒");
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
    
    toast.success("Opening Secure Neural Chat... 🚀");
    setTimeout(() => {
      window.open(whatsappUrl, "_blank");
    }, 1000);
  };

  const filteredProducts = filter === "All" ? products : products.filter(p => p.category === filter);
  const totalAmount = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="min-h-screen bg-[#050507] text-white p-4 font-sans max-w-[1400px] mx-auto pb-32 overflow-x-hidden">
      <Toaster />

      {/* 🌌 GLASS HEADER */}
      <div className="mt-12 mb-14 flex flex-col md:flex-row justify-between items-start md:items-end gap-8 px-4">
        <div className="space-y-2">
          <h1 className="text-6xl font-[1000] italic uppercase tracking-tighter leading-none animate-in fade-in slide-in-from-left duration-700">
            NEURAL<span className="text-blue-500">_STORE</span>
          </h1>
          <div className="flex items-center gap-3">
             <div className="h-[1px] w-12 bg-blue-500/50"></div>
             <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.5em] italic">Access Digital Assets</p>
          </div>
        </div>

        {/* 🛒 TOP CART WIDGET */}
        <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 p-5 rounded-[2rem] flex items-center gap-8 shadow-3xl animate-in fade-in slide-in-from-right duration-700">
            <div className="flex flex-col">
                <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Queue: {cart.length}</span>
                <span className="text-2xl font-black italic text-blue-500 leading-none">₹{totalAmount}</span>
            </div>
            <button 
                onClick={handlePayment}
                disabled={cart.length === 0}
                className={`px-8 py-3.5 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] transition-all duration-500 ${cart.length > 0 ? 'bg-blue-600 text-white shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:scale-105 active:scale-95' : 'bg-white/5 text-gray-700 cursor-not-allowed'}`}
            >
                INITIALIZE_PAYMENT
            </button>
        </div>
      </div>

      {/* ⚡ CATEGORY NAVIGATION */}
      <div className="flex gap-3 overflow-x-auto no-scrollbar mb-12 px-2">
          {["All", "E-Books", "Comics", "Stories"].map((tab) => (
              <button 
                key={tab} 
                onClick={() => setFilter(tab)}
                className={`whitespace-nowrap px-8 py-3 rounded-2xl border font-black uppercase italic text-[11px] tracking-widest transition-all duration-300 ${filter === tab ? 'bg-white text-black border-white shadow-[0_0_25px_rgba(255,255,255,0.15)] scale-105' : 'bg-transparent border-white/10 text-gray-500 hover:text-white hover:border-white/30'}`}
              >
                  {tab}
              </button>
          ))}
      </div>

      {/* 📦 VERTICAL PORTRAIT GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 px-2">
        {filteredProducts.map((item) => (
          <div key={item.id} className={`group relative bg-[#0d0d0f] border ${item.border} rounded-[2.5rem] flex flex-col h-[520px] transition-all duration-700 hover:-translate-y-4 hover:shadow-[0_30px_60px_rgba(0,0,0,0.8)] overflow-hidden`}>
            
            {/* 🖼️ COVER IMAGE SECTION */}
            <div className="absolute inset-0 z-0">
              <img 
                src={item.coverImage} 
                alt={item.title} 
                className="w-full h-full object-cover opacity-40 group-hover:opacity-60 group-hover:scale-110 transition-all duration-1000" 
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0d0d0f]/40 to-[#0d0d0f] z-10"></div>
              <div className={`absolute inset-0 bg-gradient-to-t ${item.theme} opacity-30 z-10`}></div>
            </div>
            
            {/* CONTENT OVERLAY */}
            <div className="relative z-20 p-8 flex flex-col h-full">
              <div className="flex justify-between items-start mb-6">
                 <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-xl border border-white/10 bg-black/40 backdrop-blur-md text-gray-300`}>
                     {item.category}
                 </span>
                 <div className="text-4xl filter drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">{item.icon}</div>
              </div>

              <div className="flex-1 flex flex-col justify-end mb-8 space-y-3">
                 <h2 className="text-3xl font-[1000] uppercase italic tracking-tighter leading-[0.9] drop-shadow-2xl">{item.title}</h2>
                 <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] leading-relaxed line-clamp-2">{item.subtitle}</p>
              </div>

              {/* Price & Action Section */}
              <div className="space-y-6">
                <div className="flex items-end justify-between border-t border-white/5 pt-6">
                  <div>
                    <p className="text-[10px] font-black text-gray-600 uppercase line-through italic leading-none mb-1">₹{item.oldPrice}</p>
                    <p className={`text-4xl font-black italic tracking-tighter ${item.accent} leading-none`}>₹{item.price}</p>
                  </div>
                  <div className="text-[9px] font-black text-green-500/80 uppercase tracking-widest border border-green-500/20 px-2 py-1 rounded-lg">Live_Sync</div>
                </div>

                <button 
                  onClick={() => handleProductAction(item)}
                  className={`w-full py-5 rounded-2xl font-black uppercase text-[11px] tracking-[0.3em] transition-all duration-500 active:scale-95 shadow-2xl ${item.id === 1 ? 'bg-blue-600 text-white border-blue-400/50 shadow-[0_0_40px_rgba(59,130,246,0.3)]' : cart.find(c => c.id === item.id) ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.4)]' : 'bg-white/5 border border-white/10 text-white hover:bg-white hover:text-black hover:border-white'}`}
                >
                  {item.id === 1 ? "INITIALIZE_INTERACTIVE" : cart.find(c => c.id === item.id) ? "LOCKED_IN_SYNC" : "ACCESS_VAULT"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 🔒 STICKY BOTTOM NAV FOR MOBILE CART */}
      {cart.length > 0 && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-[450px] bg-black/60 backdrop-blur-3xl p-6 rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.9)] z-[100] flex justify-between items-center border border-white/10 animate-in fade-in slide-in-from-bottom-12 duration-500">
              <div className="flex flex-col">
                  <p className="text-[9px] font-black uppercase text-blue-500 tracking-[0.4em] mb-1">Grid_Total</p>
                  <p className="text-3xl font-[1000] italic tracking-tighter leading-none text-white">₹{totalAmount}</p>
              </div>
              <button 
                onClick={handlePayment}
                className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black uppercase text-[11px] tracking-[0.3em] active:scale-95 shadow-[0_0_40px_rgba(59,130,246,0.5)] transition-all"
              >
                  CHECKOUT_NOW
              </button>
          </div>
      )}

      {/* Footer Branding */}
      <div className="mt-24 mb-12 text-center opacity-20">
         <p className="text-[10px] font-black uppercase tracking-[1em]">Neural_Store_Operations_Mumbai_Division</p>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        body { background-color: #050507; }
      `}} />
    </div>
  );
}