
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAnEVtIhc_3gOyUj4GnBMi0t0QW0eZ7kpg",
  authDomain: "ntriniiw-ncha2llah.firebaseapp.com",
  projectId: "ntriniiw-ncha2llah",
  storageBucket: "ntriniiw-ncha2llah.firebasestorage.app",
  messagingSenderId: "523419844329",
  appId: "1:523419844329:web:af4ed62019b0cb4b843a78"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export { app };
