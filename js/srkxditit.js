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

let allUsers=[];


/* Load users */

async function loadUsers(){

try{

usersDiv.innerHTML="Loading...";

const snapshot = await getDocs(
collection(db,"Users") // FIXED
);

document.getElementById(
"totalUsers"
).innerText=snapshot.size;

allUsers=[];

snapshot.forEach((item)=>{

allUsers.push({

id:item.id,
...item.data()

});

});

showUsers();

}

catch(error){

console.log(error);

usersDiv.innerHTML=
"Error loading users";

}

}



/* Show users */

function showUsers(){

const search=

document.getElementById(
"searchInput"
)
.value
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


if(

name.includes(search)

||

email.includes(search)

){

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

<div class="info">
🏠 ${user.address||"-"}
</div>

<button
class="delete"
onclick="deleteUser('${user.id}')">

Delete User

</button>

</div>

`;

}

});

}



/* Delete user */

window.deleteUser=

async(id)=>{

const confirmDelete=
confirm(
"Delete user?"
);

if(!confirmDelete) return;

try{

await deleteDoc(

doc(
db,
"Users", // FIXED
id
)

);

alert(
"User deleted"
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



document
.getElementById(
"searchInput"
)
.addEventListener(
"input",
showUsers
);


loadUsers();