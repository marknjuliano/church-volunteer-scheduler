import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';

export const firebaseConfig = {
  apiKey: "AIzaSyCOrGbO748DUm4P_iFH74Nf3cbRSxlsiBQ",
  authDomain: "church-volunteer-scheduler.firebaseapp.com",
  projectId: "church-volunteer-scheduler",
  storageBucket: "church-volunteer-scheduler.firebasestorage.app",
  messagingSenderId: "692048809358",
  appId: "1:692048809358:web:f4dd7340279692077ea8df"
};

export const firebaseConfigured = true;
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
