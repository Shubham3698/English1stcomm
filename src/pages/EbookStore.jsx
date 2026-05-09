import React, { useState } from "react";
import toast from 'react-hot-toast';

export default function EbookStore() {
  const [cart, setCart] = useState([]);
  const [filter, setFilter] = useState("All");

  const products = [
    {
      id: 1,
      category: "E-Books",
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

  const addToCart = (product) => {
    if (cart.find(item => item.id === product.id)) {
      toast.error("Already in grid! 🛒");
      return;
    }
    setCart([...cart, product]);
    toast.success(`${product.title} Linked! 📥`);
  };

  const filteredProducts = filter === "All" ? products : products.filter(p => p.category === filter);
  const totalAmount = cart.reduce((sum, item) => sum + item.price, 0);

  // 🔥 WhatsApp Redirection Logic
  const handlePayment = () => {
    const phoneNumber = "7080981033"; // Bhai apna number yahan change kar lena (91 prefix zaroori hai)
    
    // Items ki list banana formatted tareeke se
    const itemsList = cart.map(item => `- ${item.title} (₹${item.price})`).join("%0A");
    
    const message = `*NEW DIGITAL ORDER*%0A%0A` +
                    `*Items:*%0A${itemsList}%0A%0A` +
                    `*Total Amount:* ₹${totalAmount}%0A%0A` +
                    `Bhai mujhe ye materials purchase karne hain. QR Code bhej do payment ke liye.`;

    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    
    toast.success("Redirecting to Neural Chat... 🚀");
    setTimeout(() => {
      window.open(whatsappUrl, "_blank");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#050507] text-white p-4 font-sans max-w-[1200px] mx-auto pb-32 overflow-x-hidden">
      
      {/* 🌌 GLASS HEADER */}
      <div className="mt-8 mb-10 flex flex-col md:flex-row justify-between items-end gap-6 px-2">
        <div className="space-y-1">
          <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none">
            NEURAL<span className="text-blue-500">_STORE</span>
          </h1>
          <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.4em] italic">Access Digital Assets</p>
        </div>

        {/* 🛒 TOP CART WIDGET */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-2xl flex items-center gap-6 shadow-2xl">
            <div className="flex flex-col">
                <span className="text-[8px] font-black text-gray-500 uppercase">Items: {cart.length}</span>
                <span className="text-xl font-black italic text-blue-500 leading-none">₹{totalAmount}</span>
            </div>
            <button 
                onClick={handlePayment}
                disabled={cart.length === 0}
                className={`px-6 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${cart.length > 0 ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(59,130,246,0.4)] active:scale-95' : 'bg-white/5 text-gray-700'}`}
            >
                CHECKOUT
            </button>
        </div>
      </div>

      {/* ⚡ CATEGORY NAVIGATION */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-10">
          {["All", "E-Books", "Comics", "Stories"].map((tab) => (
              <button 
                key={tab} 
                onClick={() => setFilter(tab)}
                className={`whitespace-nowrap px-6 py-2 rounded-xl border font-black uppercase italic text-[10px] transition-all ${filter === tab ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'bg-transparent border-white/10 text-gray-500 hover:text-white'}`}
              >
                  {tab}
              </button>
          ))}
      </div>

      {/* 📦 VERTICAL PORTRAIT GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredProducts.map((item) => (
          <div key={item.id} className={`group relative bg-[#0d0d0f] border ${item.border} rounded-2xl flex flex-col h-[500px] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.6)] overflow-hidden`}>
            
            {/* 🖼️ COVER IMAGE SECTION */}
            <div className="absolute inset-0 z-0">
              <img 
                src={item.coverImage} 
                alt={item.title} 
                className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-110 transition-all duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[#0d0d0f]/20 via-transparent to-[#0d0d0f]"></div>
              <div className={`absolute inset-0 bg-gradient-to-t ${item.theme} opacity-40`}></div>
            </div>
            
            {/* CONTENT OVERLAY */}
            <div className="relative z-10 p-6 flex flex-col h-full">
              <div className="flex justify-between items-start mb-6">
                 <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded border border-white/20 bg-black/60 backdrop-blur-md`}>
                     {item.category}
                 </span>
                 <div className="text-3xl filter drop-shadow-2xl">{item.icon}</div>
              </div>

              <div className="flex-1 space-y-2 flex flex-col justify-end mb-6">
                 <h2 className="text-2xl font-black uppercase italic tracking-tighter leading-tight drop-shadow-lg">{item.title}</h2>
                 <p className="text-[10px] font-bold text-gray-200 uppercase tracking-widest leading-relaxed opacity-90">{item.subtitle}</p>
              </div>

              {/* Price & Action Section */}
              <div className="space-y-5">
                <div className="flex items-end justify-between border-t border-white/10 pt-4 backdrop-blur-sm">
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase line-through italic leading-none">₹{item.oldPrice}</p>
                    <p className={`text-3xl font-black italic tracking-tighter ${item.accent} leading-none drop-shadow-md`}>₹{item.price}</p>
                  </div>
                  <div className="text-[8px] font-black text-green-400 uppercase italic">Digital Sync</div>
                </div>

                <button 
                  onClick={() => addToCart(item)}
                  className={`w-full py-4 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] transition-all shadow-xl active:scale-95 ${cart.find(c => c.id === item.id) ? 'bg-white text-black border-white' : 'bg-black/60 border border-white/20 backdrop-blur-md text-white hover:bg-white hover:text-black'}`}
                >
                  {cart.find(c => c.id === item.id) ? "LOCKED_IN_GRID" : "ACCESS_VAULT"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 🔒 STICKY BOTTOM CART */}
      {cart.length > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-[400px] bg-blue-600/30 backdrop-blur-2xl text-white p-5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[100] flex justify-between items-center border border-white/20 animate-in fade-in slide-in-from-bottom-10">
              <div className="flex flex-col">
                  <p className="text-[8px] font-black uppercase opacity-60 tracking-[0.3em]">Queue_Size: {cart.length}</p>
                  <p className="text-2xl font-black italic tracking-tighter leading-none">₹{totalAmount}</p>
              </div>
              <button 
                onClick={handlePayment}
                className="bg-blue-600 text-white px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest active:scale-95 shadow-[0_0_20px_rgba(59,130,246,0.6)]"
              >
                  INITIALIZE_PAYMENT
              </button>
          </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}} />
    </div>
  );
}