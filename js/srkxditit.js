import { auth, db } from "./firebase.js";

import {
onAuthStateChanged
}
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
collection,
getDocs,
deleteDoc,
doc
}
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


const usersDiv=document.getElementById("users");
const totalUsers=document.getElementById("totalUsers");
const searchInput=document.getElementById("searchInput");

let allUsers=[];


/* Check admin login */

onAuthStateChanged(auth,(user)=>{

console.log("User:",user);

if(!user){

alert("Login first");

window.location="index.html";

return;

}

if(user.email!=="kodaihillsspot@gmail.com"){

alert("Access denied");

window.location="index.html";

return;

}

loadUsers();

});



async function loadUsers(){

try{

usersDiv.innerHTML="Loading...";

console.log("Fetching users");

const snapshot=await getDocs(
collection(db,"Users")
);

console.log(
"Documents found:",
snapshot.size
);

allUsers=[];

snapshot.forEach((item)=>{

allUsers.push({

id:item.id,
...item.data()

});

});

totalUsers.innerText=
allUsers.length;

showUsers();

}

catch(error){

console.log(
"Firestore Error:",
error
);

usersDiv.innerHTML=`

<div class="user">

Error:<br>

${error.message}

</div>

`;

}

}



function showUsers(){

usersDiv.innerHTML="";

const search=
searchInput.value.toLowerCase();

const filtered=
allUsers.filter(user=>{

const name=
(user.name||"")
.toLowerCase();

const email=
(user.email||"")
.toLowerCase();

return(

name.includes(search)

||

email.includes(search)

);

});


if(filtered.length===0){

usersDiv.innerHTML=`

<div class="user">

No users found

</div>

`;

return;

}


filtered.forEach((user)=>{

usersDiv.innerHTML+=`

<div class="user">

<h3>

${user.name||"No Name"}

</h3>

<div class="info">

📧 ${user.email||"-"}

</div>

<div class="info">

📱 ${user.phone||"-"}

</div>

<button
class="delete"
onclick="deleteUser('${user.id}')">

Delete User

</button>

</div>

`;

});

}


searchInput.addEventListener(
"input",
showUsers
);


window.deleteUser=
async(id)=>{

try{

await deleteDoc(
doc(db,"Users",id)
);

loadUsers();

}
catch(error){

alert(error.message);

}

};