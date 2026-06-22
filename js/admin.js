import { auth, db }
from "./firebase.js";

import {

onAuthStateChanged

}

from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";


import {

collection,
addDoc,
getDocs,
deleteDoc,
doc,
getCountFromServer

}

from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


onAuthStateChanged(

auth,

async(user)=>{

if(!user){

window.location=
"admin-login.html";

return;

}


/* Replace with your admin Gmail */

if(
user.email !==
"youradmin@gmail.com"
){

alert(
"Access Denied"
);

window.location=
"index.html";

return;

}


loadStats();

loadProducts();

}


);


const productsDiv=
document.getElementById(
"products"
);


document.getElementById(
"addBtn"
)

.onclick=
async()=>{

await addDoc(

collection(
db,
"Products"
),

{

name:
document.getElementById(
"name"
).value,

price:
document.getElementById(
"price"
).value,

category:
document.getElementById(
"category"
).value,

Image:
document.getElementById(
"image"
).value,

description:
document.getElementById(
"description"
).value

}

);

alert(
"Product Added"
);

location.reload();

};



async function loadProducts(){

productsDiv.innerHTML="";

const snapshot=

await getDocs(
collection(
db,
"Products"
)
);

snapshot.forEach((item)=>{

const data=
item.data();

productsDiv.innerHTML += `

<div class="product">

<img src="${data.Image}">

<h3>${data.name}</h3>

<p>₹${data.price}</p>

<p>${data.category}</p>

<button
class="delete"
onclick="deleteProduct('${item.id}')">

Delete

</button>

</div>

`;

});

}


window.deleteProduct=
async(id)=>{

await deleteDoc(

doc(
db,
"Products",
id
)

);

location.reload();

};


async function loadStats(){

const count=

await getCountFromServer(

collection(
db,
"Products"
)

);

document.getElementById(
"totalProducts"
)

.innerText=
count.data().count;

}