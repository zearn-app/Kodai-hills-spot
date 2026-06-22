import {auth}
from "./firebase.js";

import {

signInWithEmailAndPassword

}

from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";


document.getElementById(
"loginBtn"
)

.onclick=async()=>{

try{

await signInWithEmailAndPassword(

auth,

document.getElementById(
"email"
).value,

document.getElementById(
"password"
).value

);

window.location=
"admin.html";

}

catch(error){

alert(
"Invalid Admin"
);

}

};