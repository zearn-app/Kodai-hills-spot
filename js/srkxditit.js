import { db } 
from "./firebase.js";

import {
collection,
getDocs,
deleteDoc,
doc
}
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const usersDiv =
document.getElementById("users");

const totalUsers =
document.getElementById("totalUsers");

const searchInput =
document.getElementById("searchInput");

let allUsers=[];


/* Load Users */

async function loadUsers(){

try{

usersDiv.innerHTML=
"Loading...";

const snapshot=
await getDocs(
collection(db,"Users")
);

allUsers=[];

snapshot.forEach((docItem)=>{

allUsers.push({

id:docItem.id,
...docItem.data()

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

usersDiv.innerHTML=
"Error loading users";

}

}


/* Show Users */

function showUsers(){

const search=
searchInput.value
.toLowerCase();

usersDiv.innerHTML="";


if(allUsers.length===0){

usersDiv.innerHTML=
"No users found";

return;

}


allUsers.forEach((user)=>{

const name=
(user.name||"")
.toLowerCase();

const email=
(user.email||"")
.toLowerCase();

const phone=
user.phone||"-";

const address=
user.address||"-";


if(
name.includes(search)
||
email.includes(search)
){

usersDiv.innerHTML+=`

<div class="user">

<h3>
${user.name || "No Name"}
</h3>

<div>
📧 ${user.email || "-"}
</div>

<div>
📱 ${phone}
</div>

<div>
🏠 ${address}
</div>

<button
onclick="deleteUser('${user.id}')">

Delete User

</button>

</div>

`;

}

});

}



/* Delete */

window.deleteUser=
async(id)=>{

try{

await deleteDoc(
doc(
db,
"Users",
id
)
);

loadUsers();

}
catch(error){

console.log(error);

alert(
"Delete failed"
);

}

};


searchInput.addEventListener(
"input",
showUsers
);


loadUsers();