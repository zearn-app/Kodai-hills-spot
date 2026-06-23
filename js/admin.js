import { initializeApp }
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import {
getAuth,
onAuthStateChanged
}
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
getFirestore,
collection,
addDoc,
getDocs,
deleteDoc,
doc,
updateDoc,
getCountFromServer
}
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";



const firebaseConfig={

apiKey:"AIzaSyAXtM0DnYPTYbdQmvv93KAQwcqxty2C1vQ",

authDomain:"kodaihillsspot-4a1b8.firebaseapp.com",

projectId:"kodaihillsspot-4a1b8",

storageBucket:"kodaihillsspot-4a1b8.firebasestorage.app",

messagingSenderId:"396566428046",

appId:"1:396566428046:web:c9bafa2143b34e7d64ccdf"

};


const app=
initializeApp(firebaseConfig);

const auth=
getAuth(app);

const db=
getFirestore(app);



const productsDiv=
document.getElementById(
"products"
);

const ordersDiv=
document.getElementById(
"allOrders"
);

let selectedOrderId=null;



/* LOGIN CHECK */

onAuthStateChanged(

auth,

(user)=>{

if(!user){

window.location=
"index.html";

return;

}


if(
user.email!==
"kodaihillsspot@gmail.com"
){

alert(
"Access denied"
);

window.location=
"home.html";

return;

}


loadStats();

loadProducts();

loadOrders();

}

);



/* USER PAGE */

document
.getElementById(
"userBtn"
)

.addEventListener(

"click",

()=>{

window.location=
"srkxditit.html";

}

);



/* ADD PRODUCT */

document
.getElementById(
"addBtn"
)

.addEventListener(

"click",

async()=>{

try{

const name=
document
.getElementById(
"name"
)
.value.trim();

const price=
document
.getElementById(
"price"
)
.value.trim();

const category=
document
.getElementById(
"category"
)
.value;

const image=
document
.getElementById(
"image"
)
.value.trim();

const description=
document
.getElementById(
"description"
)
.value.trim();


if(
!name||
!price||
!image||
!description
){

alert(
"Fill all fields"
);

return;

}


await addDoc(

collection(
db,
"Products"
),

{

name:name,
price:price,
category:category,
Image:image,
description:description

}

);


alert(
"Product Added"
);


document.getElementById(
"name"
).value="";

document.getElementById(
"price"
).value="";

document.getElementById(
"image"
).value="";

document.getElementById(
"description"
).value="";


loadProducts();

loadStats();

}

catch(error){

alert(
error.message
);

}

}

);



/* PRODUCTS */

async function loadProducts(){

productsDiv.innerHTML=
"Loading...";


const snapshot=

await getDocs(

collection(
db,
"Products"
)

);


productsDiv.innerHTML="";


snapshot.forEach(

(item)=>{

const data=
item.data();


productsDiv.innerHTML+=`

<div style="
background:white;
padding:15px;
margin:10px 0;
border-radius:15px;
">

<img
src="${data.Image}"
style="
width:100%;
height:150px;
object-fit:cover;
border-radius:10px;
">

<h3>${data.name}</h3>

<p>₹${data.price}</p>

<p>${data.category}</p>

<button
onclick="deleteProduct('${item.id}')"
style="
background:red;
color:white;
padding:10px;
border:none;
border-radius:10px;
">

Delete

</button>

</div>

`;

}

);

}



/* DELETE */

window.deleteProduct=

async(id)=>{

await deleteDoc(

doc(
db,
"Products",
id
)

);

loadProducts();

loadStats();

};



/* STATS */

async function loadStats(){

const products=

await getCountFromServer(

collection(
db,
"Products"
)

);

const orders=

await getCountFromServer(

collection(
db,
"Orders"
)

);


document.getElementById(
"totalProducts"
)

.innerText=

products.data().count;


document.getElementById(
"totalOrders"
)

.innerText=

orders.data().count;

}



/* ORDERS */

async function loadOrders(){

ordersDiv.innerHTML="";


const snapshot=

await getDocs(

collection(
db,
"Orders"
)

);


snapshot.forEach(

(item)=>{

const data=
item.data();

ordersDiv.innerHTML+=`

<div style="
background:white;
padding:15px;
margin:10px 0;
border-radius:15px;
">

<h3>${data.name||""}</h3>

<p>${data.email||""}</p>

<p>₹${data.price||""}</p>

<p>Status:
${data.status||"Pending"}
</p>

</div>

`;

}

);

}