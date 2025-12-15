import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"

// Important knowledge!!!
// This API key is going to cause GitHub to throw some errors at us. That's OK!
// This key is meant to be publically accessable and is required in the frontend
// code in order to work properly with the backend. 

const firebaseConfig = {
  apiKey: "AIzaSyB1k3ZisJHGJxYti4iuEKSW7id0m0QzYSA",
  authDomain: "assignment-time.firebaseapp.com",
  projectId: "assignment-time",
  storageBucket: "assignment-time.firebasestorage.app",
  messagingSenderId: "165521256363",
  appId: "1:165521256363:web:c4a5527605337627802cee"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);