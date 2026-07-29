import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// إعدادات مشروع Firebase ديال "novels-empire"
const firebaseConfig = {
  apiKey: "AIzaSyBwayjJSi1JxG_CxJdasVSrYA6AW17Z0IM",
  authDomain: "novels-empire.firebaseapp.com",
  projectId: "novels-empire",
  storageBucket: "novels-empire.firebasestorage.app",
  messagingSenderId: "855912239572",
  appId: "1:855912239572:web:34735c7ccc3f418b854641",
  measurementId: "G-0P0BWQM0RH",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export default app;
