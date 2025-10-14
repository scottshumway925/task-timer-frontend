import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  // API Key goes here //  
  // ...
  authDomain: "assignment-time.firebaseapp.com",
  projectId: "assignment-time",
  storageBucket: "assignment-time.firebasestorage.app",
  messagingSenderId: "165521256363",
  appId: "1:165521256363:web:c4a5527605337627802cee"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);