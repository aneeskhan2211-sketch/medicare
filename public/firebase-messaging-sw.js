// Import and configure the Firebase SDK
// These scripts are made available when the app is served or deployed on Firebase Hosting
// If you're not using Firebase Hosting, replace with the URL of the SDK's CDN
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in the messagingSenderId
firebase.initializeApp({
  apiKey: "AIzaSyB2PtgiAYv0HWepm_J33tLKkI4Ey5Nt0w8",
  authDomain: "gen-lang-client-0452100779.firebaseapp.com",
  projectId: "gen-lang-client-0452100779",
  storageBucket: "gen-lang-client-0452100779.firebasestorage.app",
  messagingSenderId: "720322821996",
  appId: "1:720322821996:web:06f7f1f76ca782cd64bd49"
});

// Retrieve an instance of Firebase Messaging so that it can handle background messages
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon || '/logo192.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
