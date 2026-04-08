import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth"
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
    authDomain: "interviewiq-e714d.firebaseapp.com",
    projectId: "interviewiq-e714d",
    storageBucket: "interviewiq-e714d.firebasestorage.app",
    messagingSenderId: "107382980162",
    appId: "1:107382980162:web:2ae0d3fc3f94afa9a0f7db"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const provider = new GoogleAuthProvider()

export { auth, provider }