import { Toaster } from 'react-hot-toast';
import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import toast from "react-hot-toast"; 
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';

// ✅ Firebase functions (Web ke liye)
import { requestForToken, onMessageListener } from "./firebase"; 

// ✅ Components Imports
import Navbar from "./components/Navbar";
import BottomNav from "./components/BottomNav"; 

// ✅ Pages Imports
import Home from "./pages/Home";
import CommunityPost from "./pages/CommunityPost";
import User from "./pages/User"; 
import EnglishAppMyPosts from "./pages/EnglishAppMyPosts";
import SavedPosts from "./pages/SavedPosts";
import Upgrade from "./pages/Upgrade";
import FindVocab from "./pages/FindVocab";
import EbookStore from "./pages/EbookStore";
import InteractiveQuizPage from "./pages/InteractiveQuizPage";
import VocabDeckPage from "./pages/VocabDeckPage";
import AdminDashboard from "./pages/AdminDashboard";
import LessonsPage from "./pages/LessonsPage"; 
import SquadChat from './pages/SquadChat';
import SquadList from './pages/SquadList'; 
import SinglePostView from './pages/SinglePostView';

export default function App() {
  const userEmail = localStorage.getItem("eng_userEmail");
  const API_URL = Capacitor.isNativePlatform() 
    ? "https://serdeptry1st.onrender.com" 
    : (window.location.hostname === "localhost" ? "http://localhost:3000" : "https://serdeptry1st.onrender.com");

  useEffect(() => {
    // 1. 🛡️ Security: Disable Right Click & F12
    const handleKey = (e) => {
      if (e.ctrlKey && (e.key === "u" || e.key === "i")) e.preventDefault();
      if (e.key === "F12") e.preventDefault();
    };
    document.addEventListener("keydown", handleKey);

    // 2. 🔥 SMART PUSH NOTIFICATION SETUP (NATIVE + WEB)
    if (userEmail) {
      if (Capacitor.isNativePlatform()) {
        // 📱 MOBILE APP LOGIC (Background me chalne ke liye)
        registerNativePush();
      } else {
        // 💻 WEB BROWSER LOGIC (Foreground ke liye)
        requestForToken(userEmail);
        onMessageListener().then((payload) => {
          showToastNotification(payload.notification.title, payload.notification.body);
        }).catch(err => console.log("Web notification error:", err));
      }
    }

    return () => document.removeEventListener("keydown", handleKey);
  }, [userEmail]);

  // ⚙️ Native Push Notification Function
  const registerNativePush = async () => {
    try {
      let permStatus = await PushNotifications.checkPermissions();
      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
      }
      if (permStatus.receive !== 'granted') return;

      await PushNotifications.register();

      // Jab Device ka naya address (Token) mile
      PushNotifications.addListener('registration', async (token) => {
        console.log('FCM Token:', token.value);
        // Backend par token bhejo
        try {
          await fetch(`${API_URL}/api/notifications/save-token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: userEmail, fcmToken: token.value })
          });
        } catch (err) {
          console.error("Token sync failed", err);
        }
      });

      // Jab app khuli ho aur push notification aaye
      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        showToastNotification(notification.title, notification.body);
      });

    } catch (error) {
      console.error("Native Push Error:", error);
    }
  };

  const showToastNotification = (title, body) => {
    toast((t) => (
      <div className="flex flex-col">
        <span className="font-black text-[12px] uppercase italic text-blue-400">{title}</span>
        <span className="text-[10px] font-bold text-white">{body}</span>
      </div>
    ), {
      icon: '📡',
      duration: 5000,
      style: { background: '#0d0d0f', border: '1px solid #1e1e24', padding: '12px', borderRadius: '15px' },
    });
  };

  return (
    <BrowserRouter>
      <Toaster 
        position="top-center" 
        reverseOrder={false} 
        toastOptions={{
          duration: 2000,
          style: { background: '#121c2d', color: '#fff', fontSize: '14px', fontWeight: 'bold', borderRadius: '10px', border: '1px solid #1e293b' }
        }}
      />
      <div onContextMenu={(e) => e.preventDefault()} style={{ background: "#0b101a", minHeight: "100vh", paddingBottom: "80px", position: "relative" }}>
        <Navbar />
        <Routes>
          <Route path="/" element={<CommunityPost />} />
          <Route path="/community" element={<CommunityPost />} />
          <Route path="/home" element={<Home />} />
          <Route path="/saved-posts" element={<SavedPosts />} />
          <Route path="/user" element={<User />} /> 
          <Route path="/upgrade" element={<Upgrade />} />
          <Route path="/my-posts" element={<EnglishAppMyPosts />} /> 
          <Route path="/find-vocab" element={<FindVocab />} />
          <Route path="/ebook-store" element={<EbookStore />} />
          <Route path="/vocab-deck" element={<VocabDeckPage />} />
          <Route path="/interactive-quiz" element={<InteractiveQuizPage />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/lessons" element={<LessonsPage />} />
          <Route path="/squads" element={<SquadList />} />
          <Route path="/squad-chat" element={<SquadChat />} />
          <Route path="/post/:postId" element={<SinglePostView />} />
        </Routes>
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}