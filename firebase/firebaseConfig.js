// firebase/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
apiKey: "aqui su dato",
authDomain: "aqui su dato",
projectId: "aqui su dato",
storageBucket: "aqui su dato",
messagingSenderId: "aqui su dato",
appId: "aqui su dato"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };