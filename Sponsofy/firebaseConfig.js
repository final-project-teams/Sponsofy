// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

import {getAuth} from "firebase/auth"

import {getFirestore} from "firebase/firestore"



// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCS5-Wq76TeAem67jkR6f9lPSX4Jxfx69g",
  authDomain: "thesis-e111a.firebaseapp.com",
  projectId: "thesis-e111a",
  storageBucket: "thesis-e111a.firebasestorage.app",
  messagingSenderId: "833287120022",
  appId: "1:833287120022:web:8e20042cbfdf9a5dcbceb7",
  measurementId: "G-E0KHHFN0HH"
};

// Initialize Firebase
export const FIREBASE_APP = initializeApp(firebaseConfig);

export const FIREBASE_AUTH = getAuth(FIREBASE_APP);

export const FIREBASE_DB = getFirestore(FIREBASE_APP);
