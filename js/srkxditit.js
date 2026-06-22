import {db}
from "./firebase.js";

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

let allUsers=[];


async function loadUsers(){

usersDiv.innerHTML="";

const snapshot=

await getDocs(

collection(
db,
"users"
)

);


document.getElementById(
"totalUsers"
).innerText=
snapshot.size;


allUsers=[];


snapshot.forEach((item)=>{

allUsers.push({

id:item.id,

...item.data()

});

});


showUsers();

}



function showUsers(){

const search=

document.getElementById(
"searchInput"
)

.value.toLowerCase();


usersDiv.innerHTML="";


allUsers.forEach((user)=>{


if(

user.name
.toLowerCase()
.includes(search)

||

user.email
.toLowerCase()
.includes(search)

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

onclick="deleteUser(
'${user.id}'
)">

Delete User

</button>

</div>

`;

}

});

}


window.deleteUser=

async(id)=>{

if(

confirm(
"Delete user?"
)

){

await deleteDoc(

doc(
db,
"users",
id
)

);

loadUsers();

}

};


document.getElementById(
"searchInput"
)

.oninput=
showUsers;


loadUsers();