import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import PaymentModal from "../components/PaymentModal";

// 🔥 DYNAMIC URL: Localhost port 3000 aur Render dono ke liye path set hai
const BASE_URL = window.location.hostname === "localhost" 
  ? "http://localhost:3000" 
  : "https://englishcom1st.onrender.com";

const plans = [
  {
    id: "trial",
    name: "Day Pass",
    price: "1",
    duration: "24 Hours",
    features: ["Full Vault Access", "All Practice Modes", "No Ads", "Basic AI Sound"],
    buttonText: "Start Trial",
    popular: false,
    theme: "from-gray-700 to-gray-900"
  },
  {
    id: "monthly",
    name: "Pro Learner",
    price: "199",
    duration: "1 Month",
    features: ["Everything in Trial", "Priority Support", "Unlimited Uploads", "Cloud Sync"],
    buttonText: "Get Pro Now",
    popular: true,
    theme: "from-red-500 to-red-700"
  },
  {
    id: "yearly",
    name: "Mastery Wheel",
    price: "1,499",
    duration: "1 Year",
    features: ["Everything in Pro", "Best Value (Save 40%)", "Exclusive Badges", "Offline Mode"],
    buttonText: "Go Master",
    popular: false,
    theme: "from-black to-blue-900"
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

  // 🔄 1. AUTO-SYNC: Sahi endpoint path ke saath status check
  useEffect(() => {
    const syncStatus = async () => {
      if (!userEmail) {
        setLoading(false);
        return;
      }
      try {
        // 🔥 Path updated to match your backend: /api/english-community/users/status
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

  // ⏳ 2. LIVE TIMER: Tick-Tock countdown
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-black italic uppercase tracking-widest text-xs text-gray-400">Verifying Membership...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfcfc] py-12 px-4 font-sans text-black pb-32">
      
      {/* 🚀 Dynamic Status Header */}
      <div className="max-w-2xl mx-auto mb-20">
        <div className={`relative overflow-hidden p-8 rounded-[3rem] transition-all duration-700 shadow-2xl ${isPremium ? 'bg-black text-white' : 'bg-white border border-gray-100'}`}>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div>
              <p className={`text-[10px] font-black uppercase tracking-[0.3em] mb-1 ${isPremium ? 'text-gray-400' : 'text-red-500'}`}>Membership Status</p>
              <h2 className="text-3xl font-[1000] italic leading-tight uppercase tracking-tighter">
                {isPremium ? `${planType} Access` : 'Free Member'}
              </h2>
            </div>

            {isPremium && (
              <div className="flex gap-2">
                {Object.entries(timeLeft).map(([label, value]) => (
                  <div key={label} className="flex flex-col items-center bg-white/10 backdrop-blur-md rounded-2xl p-3 min-w-[55px] border border-white/10">
                    <span className="text-xl font-black font-mono leading-none">{value}</span>
                    <span className="text-[8px] uppercase font-bold mt-1 text-gray-400">{label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className={`absolute -right-10 -top-10 w-40 h-40 rounded-full blur-[80px] ${isPremium ? 'bg-blue-600/30' : 'bg-red-500/10'}`}></div>
        </div>
      </div>

      <div className="text-center mb-16">
        <h1 className="text-4xl font-[1000] italic uppercase tracking-tighter leading-none mb-2">Upgrade <span className="text-red-500 text-5xl">Hub</span></h1>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Unlock Premium English Resources</p>
      </div>

      {/* Plans Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
        {plans.map((plan) => {
          const isActive = isPremium && planType === plan.id;
          return (
            <div 
              key={plan.id}
              className={`group relative p-10 rounded-[4rem] border transition-all duration-500 flex flex-col overflow-hidden ${
                isActive 
                ? 'bg-black text-white border-black scale-105 shadow-2xl' 
                : 'bg-white border-gray-100 hover:border-red-200 hover:shadow-2xl shadow-sm'
              }`}
            >
              {isActive && (
                <div className="absolute top-6 right-8 flex items-center gap-2 bg-green-500 text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest text-white shadow-lg">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span> Active
                </div>
              )}

              <div className="mb-10">
                <p className="text-[10px] font-black uppercase tracking-widest mb-2 text-gray-400">{plan.name}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-6xl font-[1000] tracking-tighter leading-none">₹{plan.price}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">/ {plan.duration}</span>
                </div>
              </div>

              <ul className="space-y-5 mb-12 flex-1">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-4 text-sm font-bold opacity-80">
                    <span className={`flex-shrink-0 mt-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] ${isActive ? 'bg-white text-black' : 'bg-black text-white'}`}>✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscription(plan)}
                disabled={isActive}
                className={`w-full py-6 rounded-[2.5rem] font-black uppercase text-[11px] tracking-[0.2em] transition-all transform active:scale-95 ${
                    isActive 
                    ? 'bg-white/10 text-white cursor-default border border-white/20' 
                    : `bg-gradient-to-r ${plan.theme} text-white shadow-lg`
                }`}
              >
                {isActive ? "Owned" : plan.buttonText}
              </button>
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
            toast.success("Payment Successful! 🚀");
            window.location.reload(); 
          }}
        />
      )}
    </div>
  );
}