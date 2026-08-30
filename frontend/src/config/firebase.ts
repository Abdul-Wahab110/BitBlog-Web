import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCAFPLOA3pTesXwuiLTSYngh7UGI7QDb30",
  authDomain: "bitblog-61397.firebaseapp.com",
  projectId: "bitblog-61397",
  storageBucket: "bitblog-61397.firebasestorage.app",
  messagingSenderId: "1006090230009",
  appId: "1:1006090230009:web:34a180c69286ff5afbea28",
  measurementId: "G-GC12RWJVR3"
};

export const firebaseApp = initializeApp(firebaseConfig);

export const firebaseAuth = getAuth(firebaseApp);

export const googleAuthProvider = new GoogleAuthProvider();
googleAuthProvider.setCustomParameters({
  prompt: 'select_account',
});

