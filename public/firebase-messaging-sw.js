// public/firebase-messaging-sw.js

importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyCaZhAb3W_EOgltO9C9W5FaNWgCWWCVifA",
  authDomain: "my-english-community.firebaseapp.com",
  projectId: "my-english-community",
  storageBucket: "my-english-community.firebasestorage.app",
  messagingSenderId: "41659771794",
  appId: "1:41659771794:web:bbd997b29621ad5a28af4b"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// --- 🔔 BACKGROUND NOTIFICATION LOGIC ---
messaging.onBackgroundMessage((payload) => {
  console.log('[sw.js] Background message received:', payload);
  
  // 🔥 ASLI FIX: Backend se bheja gaya link nikaalo
  // Payload structure check: data.link ya notification.click_action
  const dynamicLink = payload.data?.link || 
                      payload.fcmOptions?.link || 
                      payload.notification?.click_action || 
                      'https://english1stcomm.vercel.app/'; // Default fallback

  const notificationTitle = payload.notification.title || "New Signal Detected! 📡";
  const notificationOptions = {
    body: payload.notification.body || "Tap to learn now! 🚀",
    icon: '/logo192.png',
    badge: '/logo192.png',
    data: {
        url: dynamicLink // ✅ Ab ye fixed nahi, dynamic hai!
    },
    // Click action for browsers that support it directly
    click_action: dynamicLink 
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// --- 🎯 NOTIFICATION CLICK HANDLER ---
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  // Jo URL humne upar 'data' mein set kiya tha usey uthao
  const targetUrl = event.notification.data.url;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // 1. Agar window pehle se khuli hai toh focus karo
      for (let client of windowClients) {
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      // 2. Warna naya window kholo
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});