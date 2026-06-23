import {auth,db}
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
document.getElementById("users");

const totalUsers=
document.getElementById("totalUsers");

const searchInput=
document.getElementById("searchInput");

let allUsers=[];


/* Admin check */

onAuthStateChanged(

auth,

(user)=>{

if(!user){

window.location=
"index.html";

return;

}

if(
user.email!=="kodaihillsspot@gmail.com"
){

alert(
"Access denied"
);

window.location=
"index.html";

return;

}

loadUsers();

}

);


/* Load users */

async function loadUsers(){

try{

usersDiv.innerHTML=
"Loading...";

const snapshot=

await getDocs(
collection(
db,
"Users"
)
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

console.log(error);

usersDiv.innerHTML=

`<div class="user">
${error.message}
</div>`;

}

}


/* Display users */

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

return(
name.includes(search)
||
email.includes(search)
);

});


if(filtered.length===0){

usersDiv.innerHTML=

`<div class="user">
No users found
</div>`;

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


/* Search */

searchInput.addEventListener(
"input",
showUsers
);


/* Delete */

window.deleteUser=

async(id)=>{

if(
!confirm(
"Delete user?"
)
)return;

await deleteDoc(

doc(
db,
"Users",
id
)

);

loadUsers();

};