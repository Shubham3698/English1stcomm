import React, { useState } from "react";
import { Modal, Button, Spinner } from "react-bootstrap";
import axios from "axios";
import toast from "react-hot-toast";

export default function PaymentModal({ show, handleClose, plan, userEmail }) {
  const [loading, setLoading] = useState(false);

  const BASE_URL = window.location.hostname === "localhost" 
    ? "http://localhost:3000" : "https://serdeptry1st.onrender.com";

  const handlePayment = async () => {
    setLoading(true);
    try {
      // ✅ FIX: "/api/payment" ko badal kar "/api/eng-payment" kar diya hai
      const { data } = await axios.post(`${BASE_URL}/api/eng-payment/create-subscription-order`, {
        amount: plan.price.replace("₹", "").replace(",", ""),
        planId: plan.id,
        email: userEmail
      });

      const options = {
        key: "rzp_live_SOPN1D2wGhStiM", // Teri Dameeto wali Live Key
        amount: data.order.amount,
        currency: "INR",
        name: "LEARN-IGLISH",
        description: `${plan.name} - ${plan.duration}`,
        order_id: data.order.id,
        handler: async (response) => {
          // ✅ Success hone par verify call bhi naye path par jayegi (Backup ke liye)
          try {
            await axios.post(`${BASE_URL}/api/eng-payment/verify-subscription`, {
              ...response,
              email: userEmail,
              planId: plan.id
            });
            
            toast.success("Bhai, Payment Successful! 🔥");
            handleClose();
            window.location.reload(); 
          } catch (err) {
            console.error("Verification Error:", err);
            toast.error("Verification pending, but payment received!");
          }
        },
        prefill: { email: userEmail },
        theme: { color: "#ef4444" },
        modal: { ondismiss: () => setLoading(false) }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error(error);
      toast.error("Payment initiation failed!");
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered backdrop="static">
      <Modal.Body className="text-center p-5 font-sans">
        <h4 className="font-black uppercase italic mb-2">Upgrade to {plan?.name}</h4>
        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-4">Secure Checkout via Razorpay</p>
        
        <h1 className="text-5xl font-black text-red-500 mb-4">{plan?.price}</h1>
        
        <div className="bg-gray-50 p-4 rounded-3xl mb-6">
          <ul className="text-left space-y-2">
            {plan?.features.map((f, i) => (
              <li key={i} className="text-[11px] font-bold text-gray-600 flex items-center gap-2">
                <span className="text-green-500">✓</span> {f}
              </li>
            ))}
          </ul>
        </div>

        <Button 
          onClick={handlePayment} 
          disabled={loading}
          className="w-full py-4 rounded-2xl border-0 font-black uppercase text-xs tracking-widest bg-black shadow-xl active:scale-95 transition-all"
        >
          {loading ? <Spinner size="sm" /> : "Pay & Unlock Now"}
        </Button>
        <button onClick={handleClose} className="mt-4 text-[10px] font-black text-gray-300 uppercase underline">Maybe Later</button>
      </Modal.Body>
    </Modal>
  );
}