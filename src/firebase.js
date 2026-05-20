import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from "firebase/auth";
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCOsupE3Rx_5dA6wXSWCNuxBgNhguigt7c",
  authDomain: "dominio-ar.firebaseapp.com",
  projectId: "dominio-ar",
  storageBucket: "dominio-ar.firebasestorage.app",
  messagingSenderId: "1046383236626",
  appId: "1:1046383236626:web:484fc534d6d67660a26acb",
  measurementId: "G-15QCFXZKM5"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export { signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile };
export { collection, getDocs, addDoc, updateDoc, deleteDoc, doc };
export { ref, uploadBytesResumable, getDownloadURL, deleteObject };
