import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";

// Your web app's Firebase configuration
// IMPORTANT: These values should be stored in environment variables and not hardcoded.
// e.g., in a .env file that is included in your .gitignore
const firebaseConfig = {

  apiKey: "AIzaSyDuQNWXDBfIWAYLpPEdKvWvuOWORi1tuH4",

  authDomain: "innovativegadget-ee6ce.firebaseapp.com",

  projectId: "innovativegadget-ee6ce",

  storageBucket: "innovativegadget-ee6ce.appspot.com",

  messagingSenderId: "791003289853",

  appId: "1:791003289853:web:eb06460656ced51c4dc694",

  measurementId: "G-KZ25EET7T7"

};


// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

try {
  app = initializeApp(firebaseConfig);
  
  // Get Firebase services that can be used throughout the app
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);

} catch (error) {
    console.error("Firebase initialization error:", error);
    // In a real app, you might want to show a user-facing error message
    // or disable features that depend on Firebase.
}


// Export the services for use in other components
export { app, auth, db, storage };