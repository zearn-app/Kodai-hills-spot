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


const usersDiv=
document.getElementById("users");

const totalUsers=
document.getElementById("totalUsers");

const searchInput=
document.getElementById("searchInput");

let allUsers=[];


/* Admin check */

onAuthStateChanged(auth,async(user)=>{

console.log(user);

if(!user){

alert("Please login");

window.location="index.html";

return;

}

if(
user.email !==
"kodaihillsspot@gmail.com"
){

alert("Access denied");

window.location="index.html";

return;

}

await loadUsers();

});



async function loadUsers(){

try{

usersDiv.innerHTML=
"Loading users...";

const snapshot=
await getDocs(
collection(db,"Users")
);

console.log(
"Users:",
snapshot.size
);

allUsers=[];

snapshot.forEach((docSnap)=>{

allUsers.push({

id:docSnap.id,

...docSnap.data()

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

Error:
${error.message}

</div>

`;

}

}



function showUsers(){

usersDiv.innerHTML="";

const search=
searchInput.value
.toLowerCase();

const filtered=
allUsers.filter((user)=>{

const name=
(user.name||"")
.toLowerCase();

const email=
(user.email||"")
.toLowerCase();

const phone=
(user.phone||"")
.toLowerCase();

return(

name.includes(search)

||

email.includes(search)

||

phone.includes(search)

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

const userCard=
document.createElement(
"div"
);

userCard.className=
"user";

userCard.innerHTML=`

<h3>
${user.name||"No Name"}
</h3>

<div class="info">
📧 ${user.email||"-"}
</div>

<div class="info">
📱 ${user.phone||"-"}
</div>

`;

const deleteBtn=
document.createElement(
"button"
);

deleteBtn.className=
"delete";

deleteBtn.innerText=
"Delete User";

deleteBtn.onclick=
()=>deleteUser(
user.id
);

userCard.appendChild(
deleteBtn
);

usersDiv.appendChild(
userCard
);

});

}



searchInput.addEventListener(
"input",
showUsers
);



async function deleteUser(id){

const confirmDelete=
confirm(
"Delete this user?"
);

if(!confirmDelete){

return;

}

try{

await deleteDoc(
doc(
db,
"Users",
id
)
);

alert(
"User deleted"
);

loadUsers();

}
catch(error){

alert(
error.message
);

}

}