import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import PaymentModal from "../components/PaymentModal"; // Tera naya modal

const plans = [
  {
    id: "trial",
    name: "Day Pass",
    price: "₹1",
    duration: "24 Hours",
    features: ["Full Vault Access", "All Practice Modes", "No Ads", "Basic AI Sound"],
    buttonText: "Start Trial",
    popular: false,
    color: "bg-gray-100",
    textColor: "text-gray-600"
  },
  {
    id: "monthly",
    name: "Pro Learner",
    price: "₹199",
    duration: "1 Month",
    features: ["Everything in Trial", "Priority Support", "Unlimited Uploads", "Cloud Sync"],
    buttonText: "Get Pro Now",
    popular: true,
    color: "bg-red-500",
    textColor: "text-white"
  },
  {
    id: "yearly",
    name: "Mastery Wheel",
    price: "₹1,499",
    duration: "1 Year",
    features: ["Everything in Pro", "Best Value (Save 40%)", "Exclusive Badges", "Offline Mode"],
    buttonText: "Go Master",
    popular: false,
    color: "bg-black",
    textColor: "text-white"
  }
];

export default function Upgrade() {
  const navigate = useNavigate();
  const userEmail = localStorage.getItem("eng_userEmail");
  
  // 🔥 Status States
  const [isPremium, setIsPremium] = useState(localStorage.getItem("isPremium") === "true");
  const [planType, setPlanType] = useState(localStorage.getItem("planType") || "free");
  
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleSubscription = (plan) => {
    if (!userEmail) {
      toast.error("Bhai, pehle login toh kar lo! 🔑");
      return navigate("/");
    }

    if (isPremium && planType === plan.id) {
      return toast.error("Aap pehle se is plan par hain! 💎");
    }

    setSelectedPlan(plan);
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 font-sans text-black pb-24">
      
      {/* 💎 Current Status Badge */}
      <div className="max-w-md mx-auto mb-10">
        <div className={`p-4 rounded-3xl text-center border-2 ${isPremium ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white'}`}>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Current Status</p>
          <h2 className={`text-xl font-black uppercase italic ${isPremium ? 'text-green-600' : 'text-gray-800'}`}>
            {isPremium ? `⭐ PREMIUM (${planType})` : '🆓 FREE MEMBER'}
          </h2>
        </div>
      </div>

      <div className="text-center max-w-2xl mx-auto mb-16">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-4">
          Upgrade <span className="text-red-500">Dameeto</span> Hub
        </h1>
        <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.3em]">
          Master English with our high-performance plans
        </p>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div 
            key={plan.id}
            className={`relative p-8 rounded-[3rem] border border-gray-100 transition-all duration-500 ${plan.popular ? 'bg-white scale-105 z-10 border-red-100 shadow-xl' : 'bg-white/60 backdrop-blur-sm shadow-sm'}`}
          >
            {plan.popular && (
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">
                Recommended
              </span>
            )}

            <div className="mb-8">
              <h3 className="text-xl font-black uppercase italic text-gray-800">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mt-4">
                <span className="text-5xl font-black tracking-tighter">{plan.price}</span>
                <span className="text-gray-400 text-xs font-bold uppercase">/ {plan.duration}</span>
              </div>
            </div>

            <ul className="space-y-4 mb-10 flex-1">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-sm font-bold text-gray-600">
                  <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${plan.popular ? 'bg-red-100 text-red-500' : 'bg-gray-100 text-gray-400'}`}>
                    ✓
                  </span>
                  {feature}
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSubscription(plan)}
              className={`w-full py-5 rounded-[2rem] font-black uppercase text-[11px] tracking-widest transition-all active:scale-95 shadow-xl ${plan.color} ${plan.textColor}`}
            >
              {plan.buttonText}
            </button>
          </div>
        ))}
      </div>

      {/* 💳 Payment Modal Component */}
      {selectedPlan && (
        <PaymentModal 
          show={showModal} 
          handleClose={() => setShowModal(false)} 
          plan={selectedPlan} 
          userEmail={userEmail} 
        />
      )}

      <div className="mt-20 text-center opacity-30 grayscale flex flex-col items-center gap-4">
        <p className="text-[9px] font-black tracking-[0.5em] uppercase">Trusted Dameeto Payment Gateway</p>
        <div className="flex gap-6 text-2xl font-black italic">
            <span>VISA</span> <span>UPI</span> <span>MASTERCARD</span>
        </div>
      </div>
    </div>
  );
}