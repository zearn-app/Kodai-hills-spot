import {
getAuth
}
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";


const auth=
getAuth(app);

export{
db,
auth
};


import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAXtM0DnYPTYbdQmvv93KAQwcqxty2C1vQ",
  authDomain: "kodaihillsspot-4a1b8.firebaseapp.com",
  projectId: "kodaihillsspot-4a1b8",
  storageBucket: "kodaihillsspot-4a1b8.firebasestorage.app",
  messagingSenderId: "396566428046",
  appId: "1:396566428046:web:c9bafa2143b34e7d64ccdf",
  measurementId: "G-BZ8MBZEJQ4"
};


const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

export {auth,db};