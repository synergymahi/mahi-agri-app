import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyCSQW4O5_9RDLQiW5N8p8fegOJ39p_4zMQ",
    authDomain: "mahi-agri-nextjs-app.firebaseapp.com",
    projectId: "mahi-agri-nextjs-app",
    storageBucket: "mahi-agri-nextjs-app.firebasestorage.app",
    messagingSenderId: "75852551484",
    appId: "1:75852551484:web:7a4464f87c41c65b7dba39",
    measurementId: "G-GJEMYJ593S"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
// const analytics = getAnalytics(app); // Analytics only works in browser, might need conditional check for SSR

export { db };
