import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDe1ot-HmPZCKSK3Lyd3gglKdZOoFPNIRM",
  authDomain: "tngbcngay.firebaseapp.com",
  databaseURL: "https://tngbcngay-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "tngbcngay",
  storageBucket: "tngbcngay.appspot.com",
  messagingSenderId: "240580685394",
  appId: "1:240580685394:web:bcdca8966e06b01caef98b"
};
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);