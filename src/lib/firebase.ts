import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCYS_P676k8ROeuEqWaHAao7kxLwV80MPk",
  authDomain: "subhaphotos.firebaseapp.com",
  projectId: "subhaphotos",
  storageBucket: "subhaphotos.firebasestorage.app",
  messagingSenderId: "952623129178",
  appId: "1:952623129178:web:20efca3eba593d3d3f6e63"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
