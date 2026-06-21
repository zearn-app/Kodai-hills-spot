import { auth } from "./firebase.js";

import {
createUserWithEmailAndPassword,
signInWithEmailAndPassword,
GoogleAuthProvider,
signInWithPopup
}

from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";


const signupBtn=document.getElementById("signupBtn");

const loginBtn=document.getElementById("loginBtn");

const googleBtn=document.getElementById("googleBtn");


signupBtn.onclick=()=>{

const email=document.getElementById("email").value;

const password=document.getElementById("password").value;


createUserWithEmailAndPassword(
auth,
email,
password
)

.then(()=>{

alert("Signup successful");

})

.catch((error)=>{

alert(error.message);

});

};


loginBtn.onclick=()=>{

const email=document.getElementById("email").value;

const password=document.getElementById("password").value;


signInWithEmailAndPassword(
auth,
email,
password
)

.then(()=>{

alert("Login successful");

window.location="index.html";

})

.catch((error)=>{

alert(error.message);

});

};


googleBtn.onclick=()=>{

const provider=
new GoogleAuthProvider();

signInWithPopup(
auth,
provider
)

.then(()=>{

alert("Google Login Success");

window.location="index.html";

})

.catch((error)=>{

alert(error.message);

});

};
