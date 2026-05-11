// Scripts ko import karna must hai compat mode ke liye
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Wahi Config jo tune firebase.js mein dala tha
const firebaseConfig = {
  apiKey: "AIzaSyCaZhAb3W_EOgltO9C9W5FaNWgCWWCVifA",
  authDomain: "my-english-community.firebaseapp.com",
  projectId: "my-english-community",
  storageBucket: "my-english-community.firebasestorage.app",
  messagingSenderId: "41659771794",
  appId: "1:41659771794:web:bbd997b29621ad5a28af4b"
};

// Initialize Firebase in Service Worker
firebase.initializeApp(firebaseConfig);

// Messaging initialize karo
const messaging = firebase.messaging();

// --- 🔔 BACKGROUND NOTIFICATION LOGIC ---
// Ye tab chalta hai jab browser tab band ho ya user kisi aur tab pe ho
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title || "New Signal from Dameeto! 📡";
  const notificationOptions = {
    body: payload.notification.body || "Check out the latest vocab update.",
    icon: '/logo192.png', // Tera app ka icon (public folder mein hona chahiye)
    badge: '/logo192.png', // Android top bar icon
    data: {
        url: 'https://dameeto.com' // Notification click karne pe kahan bhejna hai
    }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Notification click handle karna (Optional but Pro feature)
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});