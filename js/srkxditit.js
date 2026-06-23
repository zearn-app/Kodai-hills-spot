import { auth, db }
from "./firebase.js";

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


const usersDiv=
document.getElementById(
"users"
);

const totalUsers=
document.getElementById(
"totalUsers"
);

const searchInput=
document.getElementById(
"searchInput"
);

let allUsers=[];


console.log("JS Loaded");


onAuthStateChanged(
auth,
(user)=>{

console.log(
"Current User:",
user
);

if(!user){

usersDiv.innerHTML=
"❌ Login Required";

return;

}


let email=
user.email
.trim()
.toLowerCase();


if(
email!==
"kodaihillsspot@gmail.com"
){

usersDiv.innerHTML=
"❌ Admin access denied";

return;

}


loadUsers();

}
);


async function loadUsers(){

try{

usersDiv.innerHTML=
"Loading Users...";

console.log(
"Fetching Users..."
);

const snapshot=
await getDocs(
collection(
db,
"Users"
)
);

console.log(
"Users:",
snapshot.size
);


allUsers=[];


snapshot.forEach(
(docSnap)=>{

let data=
docSnap.data();

allUsers.push({

id:docSnap.id,
...data

});

});


totalUsers.innerText=
allUsers.length;

showUsers();

}
catch(error){

console.log(error);

usersDiv.innerHTML=`

<div class="user">

❌ ${error.message}

</div>

`;

}

}



function showUsers(){

usersDiv.innerHTML="";


let search=
searchInput.value
.toLowerCase();


let filtered=
allUsers.filter(
(user)=>{

return JSON.stringify(
user
)
.toLowerCase()
.includes(search);

}
);


if(filtered.length===0){

usersDiv.innerHTML=`

<div class="user">

No Users Found

</div>

`;

return;

}



filtered.forEach(
(user)=>{

usersDiv.innerHTML+=`

<div class="user">

<h3>

${user.name||
user.username||
"No Name"}

</h3>

<div class="info">

📧 Email:
${user.email||"-"}

</div>

<div class="info">

📱 Phone:
${user.phone||
user.mobile||
"-"}

</div>

<div class="info">

🆔 User ID:
${user.id}

</div>

<button
class="delete"
data-id="${user.id}">

Delete User

</button>

</div>

`;

});


document
.querySelectorAll(
".delete"
)
.forEach(
(btn)=>{

btn.onclick=
async()=>{

let id=
btn.dataset.id;

if(
confirm(
"Delete User?"
)
){

await deleteDoc(
doc(
db,
"Users",
id
)
);

loadUsers();

}

};

});

}


searchInput
.addEventListener(
"input",
showUsers
);