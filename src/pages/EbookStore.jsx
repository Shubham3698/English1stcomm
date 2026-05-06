import React from "react";
import toast from 'react-hot-toast';

export default function EbookStore() {
  const books = [
    {
      id: 1,
      title: "Master 3000+ Vocabulary",
      subtitle: "Hindi to English Meaning with AI Pronunciation",
      price: "49",
      oldPrice: "199",
      tag: "Best Seller",
      color: "from-red-600 to-orange-500",
      image: "📚"
    },
    {
      id: 2,
      title: "Daily Use Sentences",
      subtitle: "500+ Ready-to-use sentences for office & home",
      price: "29",
      oldPrice: "99",
      tag: "New",
      color: "from-blue-600 to-cyan-500",
      image: "✍️"
    }
  ];

  const handleBuy = (book) => {
    toast.success(`Redirecting to payment for ${book.title}... 🚀`);
    // Yahan tera Razorpay logic aayega
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 font-sans max-w-[1200px] mx-auto pb-20">
      {/* Header */}
      <div className="mt-6 mb-12 lg:px-4 text-center lg:text-left">
        <h1 className="text-4xl font-[1000] italic uppercase tracking-tighter text-gray-900 leading-none">
          DIGITAL <span className="text-red-600">LIBRARY</span>
        </h1>
        <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.4em] mt-2 italic">Premium Educational Resources</p>
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:mx-4">
        {books.map((book) => (
          <div key={book.id} className="bg-white rounded-[3rem] overflow-hidden shadow-xl border border-gray-100 flex flex-col h-full group">
            {/* Upper Section */}
            <div className={`bg-gradient-to-br ${book.color} p-10 text-white relative`}>
               <span className="absolute top-6 right-8 bg-white/20 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">{book.tag}</span>
               <div className="text-6xl mb-4">{book.image}</div>
               <h2 className="text-3xl font-[1000] uppercase italic tracking-tighter leading-tight">{book.title}</h2>
               <p className="text-[11px] font-bold opacity-80 uppercase tracking-widest mt-2 leading-relaxed">{book.subtitle}</p>
            </div>

            {/* Lower Section */}
            <div className="p-8 flex-1 flex flex-col justify-between">
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-2">
                  <span className="text-green-500 text-sm">✔</span>
                  <p className="text-[12px] font-bold text-gray-600">Lifetime Access to Content</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500 text-sm">✔</span>
                  <p className="text-[12px] font-bold text-gray-600">AI Voice Support Included</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500 text-sm">✔</span>
                  <p className="text-[12px] font-bold text-gray-600">Printable PDF Format</p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black text-gray-300 uppercase line-through italic">₹{book.oldPrice}</p>
                  <p className="text-4xl font-black italic tracking-tighter text-gray-900 leading-none">₹{book.price}</p>
                </div>
                <button 
                  onClick={() => handleBuy(book)}
                  className="bg-black text-white px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest active:scale-90 transition-all shadow-lg group-hover:bg-red-600"
                >
                  Download Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Razorpay Trust Section */}
      <div className="mt-20 p-10 bg-white rounded-[3rem] border border-gray-100 text-center lg:mx-4">
        <h3 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] mb-4">Payment Partner</h3>
        <div className="flex justify-center opacity-40 grayscale">
          <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/Razorpay_logo.svg" alt="Razorpay" className="h-6" />
        </div>
        <p className="text-[9px] font-bold text-gray-400 uppercase mt-4 italic leading-relaxed">
          100% Secure SSL Encrypted Payments. <br />
          Instant Delivery to your registered Email.
        </p>
      </div>
    </div>
  );
}