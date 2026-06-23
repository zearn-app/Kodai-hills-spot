import { initializeApp }
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import {

getAuth,
createUserWithEmailAndPassword,
signInWithEmailAndPassword

}

from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";


import {

getFirestore,
doc,
setDoc

}

from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";



const firebaseConfig={

apiKey:"AIzaSyAXtM0DnYPTYbdQmvv93KAQwcqxty2C1vQ",

authDomain:
"kodaihillsspot-4a1b8.firebaseapp.com",

projectId:
"kodaihillsspot-4a1b8",

storageBucket:
"kodaihillsspot-4a1b8.firebasestorage.app",

messagingSenderId:
"396566428046",

appId:
"1:396566428046:web:c9bafa2143b34e7d64ccdf"

};


const app=
initializeApp(
firebaseConfig
);

const auth=
getAuth(app);

const db=
getFirestore(app);



/* SIGNUP */

document
.getElementById(
"signupBtn"
)

.onclick=

async()=>{

try{

const name=
document
.getElementById(
"name"
)
.value.trim();

const email=
document
.getElementById(
"email"
)
.value.trim();

const password=
document
.getElementById(
"password"
)
.value.trim();


if(
!name||
!email||
!password
){

alert(
"Fill all fields"
);

return;

}


const userCredential=

await createUserWithEmailAndPassword(

auth,
email,
password

);


const user=
userCredential.user;


await setDoc(

doc(
db,
"Users",
user.uid
),

{

uid:user.uid,
name:name,
email:email

}

);


alert(
"Signup successful"
);

window.location=
"home.html";

}

catch(error){

alert(
error.message
);

}

};



/* LOGIN */

document
.getElementById(
"loginBtn"
)

.onclick=

async()=>{

try{

const email=
document
.getElementById(
"loginEmail"
)
.value.trim();

const password=
document
.getElementById(
"loginPassword"
)
.value.trim();


await signInWithEmailAndPassword(

auth,
email,
password

);

alert(
"Login successful"
);

window.location=
"home.html";

}

catch(error){

alert(
error.message
);

}

};