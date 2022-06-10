import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { getAuth, signInWithPopup, FacebookAuthProvider } from 'firebase/auth'

initializeApp({
  apiKey: "AIzaSyDGJRpddQcbJOb2rbClU937FNfFS3AqDNw",
  authDomain: "note-clone1.firebaseapp.com",
  projectId: "note-clone1",
  storageBucket: "note-clone1.appspot.com",
  messagingSenderId: "78757740195",
  appId: "1:78757740195:web:02f492d2c26ceef168c916",
  measurementId: "G-1F5EHG1H6D"
})

export const auth = getAuth();
export const db = getFirestore();

const fbProvider = new FacebookAuthProvider();
export const signInWithFacebookPopup = () =>  signInWithPopup(auth, fbProvider);

