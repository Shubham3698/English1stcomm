import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyCaZhAb3W_EOgltO9C9W5FaNWgCWWCVifA",
  authDomain: "my-english-community.firebaseapp.com",
  projectId: "my-english-community",
  storageBucket: "my-english-community.firebasestorage.app",
  messagingSenderId: "41659771794",
  appId: "1:41659771794:web:bbd997b29621ad5a28af4b",
  measurementId: "G-70XHY22MLS"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
const messaging = getMessaging(app);

// 🎯 Function: Token lena aur Backend bhejna
export const requestForToken = async (userEmail) => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, { 
        vapidKey: 'BBfxeZLvXqBiQ4aLuUaKRhwmaBzjkDzN_i7SpMxJ6QzSJulJwNFf0JFRDt_QKmUPQ_QZQ3N3BZerpARf9hArg_E' 
      });
      
      if (token) {
        console.log("FCM Token Generated:", token);

        // 🔥 DYNAMIC URL LOGIC: Localhost pe ho toh 3000 pe jayega, warna Render pe
        const API_BASE_URL = window.location.hostname === "localhost" 
          ? "http://localhost:3000" 
          : "https://serdeptry1st.onrender.com";

        // ✅ Updated Path: /api/notifications/save-token
        const response = await fetch(`${API_BASE_URL}/api/notifications/save-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: userEmail, fcmToken: token })
        });

        const data = await response.json();
        if(data.success) {
            console.log("Token saved ✅");
        }
      }
    } else {
      console.log("Notification permission denied.");
    }
  } catch (err) {
    console.error("FCM Token Error:", err);
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });

export default app;