import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import PaymentModal from "../components/PaymentModal";

// 🔥 Updated URL logic for consistency
const BASE_URL = window.location.hostname === "localhost" 
  ? "http://localhost:3000" 
  : "https://serdeptry1st.onrender.com";

const plans = [
  {
    id: "trial",
    name: "Day Pass",
    price: "1",
    duration: "24 Hours",
    features: ["Full Vault Access", "All Practice Modes", "No Ads", "Basic AI Sound"],
    buttonText: "Start Trial",
    theme: "from-zinc-800 to-zinc-950",
    border: "border-zinc-700/50"
  },
  {
    id: "monthly",
    name: "Pro Learner",
    price: "199",
    duration: "1 Month",
    features: ["Everything in Trial", "Priority Support", "Unlimited Uploads", "Cloud Sync"],
    buttonText: "Get Pro Now",
    popular: true,
    theme: "from-red-600 to-rose-900",
    border: "border-red-500/50"
  },
  {
    id: "yearly",
    name: "Mastery Wheel",
    price: "1,499",
    duration: "1 Year",
    features: ["Everything in Pro", "Save 40% Annually", "Exclusive Badges", "Offline Mode"],
    buttonText: "Go Master",
    theme: "from-indigo-600 to-blue-900",
    border: "border-indigo-500/50"
  }
];

export default function Upgrade() {
  const navigate = useNavigate();
  const userEmail = localStorage.getItem("eng_userEmail");
  
  const [isPremium, setIsPremium] = useState(localStorage.getItem("eng_isPremium") === "true");
  const [planType, setPlanType] = useState(localStorage.getItem("eng_planType") || "free");
  const [timeLeft, setTimeLeft] = useState({ d: "00", h: "00", m: "00", s: "00" });
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // 🔄 1. AUTO-SYNC: Fetches current membership from your Render DB
  useEffect(() => {
    const syncStatus = async () => {
      if (!userEmail) { setLoading(false); return; }
      try {
        const res = await axios.get(`${BASE_URL}/api/english-community/users/status?email=${userEmail}`);
        const { isPremium: dbPremium, planType: dbPlan, premiumExpiry } = res.data;
        
        setIsPremium(dbPremium);
        setPlanType(dbPlan);
        
        localStorage.setItem("eng_isPremium", dbPremium);
        localStorage.setItem("eng_planType", dbPlan);
        localStorage.setItem("eng_planExpiry", premiumExpiry);
      } catch (err) {
        console.error("❌ Sync Error:", err);
      } finally {
        setLoading(false);
      }
    };
    syncStatus();
  }, [userEmail]);

  // ⏳ 2. LIVE TIMER: Real-time countdown to expiry
  useEffect(() => {
    const timer = setInterval(() => {
      const expiry = localStorage.getItem("eng_planExpiry");
      if (expiry && isPremium) {
        const now = new Date().getTime();
        const distance = new Date(expiry).getTime() - now;
        
        if (distance < 0) {
          setIsPremium(false);
          localStorage.setItem("eng_isPremium", "false");
          clearInterval(timer);
        } else {
          setTimeLeft({
            d: Math.floor(distance / (1000 * 60 * 60 * 24)).toString().padStart(2, '0'),
            h: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString().padStart(2, '0'),
            m: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0'),
            s: Math.floor((distance % (1000 * 60)) / 1000).toString().padStart(2, '0')
          });
        }
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [isPremium]);

  const handleSubscription = (plan) => {
    if (!userEmail) {
      toast.error("Bhai, pehle login toh kar lo! 🔑");
      return;
    }
    if (isPremium && planType === plan.id) {
      return toast.error("Aapka ye plan abhi active hai! 💎");
    }
    setSelectedPlan(plan);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a]">
        <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4 shadow-[0_0_20px_rgba(220,38,38,0.5)]"></div>
        <p className="font-black italic uppercase tracking-[0.5em] text-[10px] text-zinc-500">Authenticating</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white py-20 px-4 overflow-hidden selection:bg-red-500/30">
      
      {/* Dynamic Background */}
      <div className="fixed top-0 left-0 w-full h-full -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-red-900/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[120px]"></div>
      </div>

      {/* Header Status Dashboard */}
      <div className="max-w-4xl mx-auto mb-24">
        <div className={`p-[1px] rounded-[2.5rem] bg-gradient-to-r ${isPremium ? 'from-red-600 to-blue-600' : 'from-zinc-800 to-zinc-800'}`}>
          <div className="bg-zinc-950 rounded-[2.5rem] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Membership System</span>
              <h2 className="text-4xl md:text-5xl font-[1000] italic uppercase tracking-tighter mt-2">
                {isPremium ? (
                  <span className="bg-gradient-to-r from-red-500 to-blue-500 bg-clip-text text-transparent">
                    {planType} Mode Active
                  </span>
                ) : (
                  "Standard Access"
                )}
              </h2>
            </div>
            
            {isPremium ? (
              <div className="flex gap-3">
                {Object.entries(timeLeft).map(([label, value]) => (
                  <div key={label} className="bg-zinc-900 border border-zinc-800 px-4 py-3 rounded-2xl text-center min-w-[70px]">
                    <p className="text-2xl font-black font-mono">{value}</p>
                    <p className="text-[8px] font-bold text-zinc-500 uppercase">{label}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-6 py-3 bg-zinc-900 border border-zinc-800 rounded-full text-[10px] font-black uppercase tracking-widest text-zinc-400">
                LOCKED CONTENT
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="text-center mb-20 relative">
        <h1 className="text-6xl md:text-9xl font-[1000] italic uppercase tracking-tighter mb-4 opacity-5 absolute left-1/2 -translate-x-1/2 -top-16 w-full pointer-events-none">
          PREMIUM
        </h1>
        <h2 className="text-5xl md:text-6xl font-[1000] italic uppercase tracking-tighter relative z-10">
          Tier <span className="text-red-600">Selection</span>
        </h2>
        <p className="text-zinc-500 font-bold uppercase tracking-[0.3em] text-[10px] mt-4 relative z-10">
          Professional English Development Resources
        </p>
      </div>

      {/* Grid Layout */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => {
          const isActive = isPremium && planType === plan.id;
          return (
            <div 
              key={plan.id}
              className={`relative p-[1px] rounded-[3.5rem] transition-all duration-500 ${plan.popular ? 'scale-105 md:-translate-y-4 shadow-[0_0_50px_rgba(220,38,38,0.15)]' : 'scale-100'} ${isActive ? 'opacity-100' : 'opacity-90 hover:opacity-100'}`}
            >
              <div className={`h-full bg-zinc-950 border ${plan.border} rounded-[3.5rem] p-10 flex flex-col`}>
                {plan.popular && (
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[9px] font-black px-6 py-2 rounded-full uppercase tracking-widest shadow-[0_0_20px_rgba(220,38,38,0.5)]">
                    Most Popular
                  </span>
                )}

                <div className="mb-12">
                  <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">{plan.name}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-6xl font-[1000] italic tracking-tighter leading-none">₹{plan.price}</span>
                    <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">/ {plan.duration}</span>
                  </div>
                </div>

                <div className="space-y-5 mb-16 flex-1">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-4 group">
                      <div className="w-5 h-5 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[10px] text-red-500 group-hover:scale-110 transition-transform">✓</div>
                      <p className="text-sm font-bold text-zinc-400 tracking-tight">{feature}</p>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleSubscription(plan)}
                  disabled={isActive}
                  className={`w-full py-6 rounded-[2rem] font-[1000] uppercase text-[11px] tracking-[0.2em] transition-all relative overflow-hidden group/btn ${
                    isActive 
                    ? 'bg-zinc-900 text-zinc-600 cursor-default' 
                    : `bg-gradient-to-br ${plan.theme} text-white shadow-xl hover:shadow-2xl active:scale-95`
                  }`}
                >
                  <span className="relative z-10">{isActive ? "Owned" : plan.buttonText}</span>
                  {!isActive && <div className="absolute inset-0 bg-white/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></div>}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {selectedPlan && (
        <PaymentModal 
          show={showModal} 
          handleClose={() => setShowModal(false)} 
          plan={selectedPlan} 
          userEmail={userEmail} 
          onSuccess={() => {
            toast.success("Welcome to the Master Circle! 🚀");
            window.location.reload(); 
          }}
        />
      )}
    </div>
  );
}