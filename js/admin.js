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
updateDoc,
getCountFromServer

}

from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


const productsDiv=
document.getElementById(
"products"
);

const ordersDiv=
document.getElementById(
"allOrders"
);

let selectedOrderId=null;


/* Admin Authentication */

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

user.email!==

"kodaihillsspot@gmail.com"

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

loadOrders();

}

);


/* User Page Button */

document.getElementById(
"userBtn"
)

.onclick=()=>{

window.location=
"srkxditit.html";

};


/* Add Product */

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
name.value,

price:
price.value,

category:
category.value,

Image:
image.value,

description:
description.value

}

);

alert(
"Product Added"
);

location.reload();

};


/* Load Products */

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

productsDiv.innerHTML +=`

<div class="product">

<img
src="${data.Image}">

<h3>

${data.name}

</h3>

<p>

₹${data.price}

</p>

<p>

${data.category}

</p>

<button
class="delete"

onclick="deleteProduct(
'${item.id}'
)">

Delete

</button>

</div>

`;

});

}


/* Delete Product */

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


/* Dashboard Stats */

async function loadStats(){

const products=

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

products.data().count;

}


/* Load Orders */

async function loadOrders(){

ordersDiv.innerHTML="";

const snapshot=

await getDocs(

collection(
db,
"Orders"
)

);


document.getElementById(
"totalOrders"
)

.innerText=

snapshot.size;


snapshot.forEach((docItem)=>{

const data=
docItem.data();

ordersDiv.innerHTML +=`

<div
class="product"

onclick="openPopup(
'${docItem.id}'
)">

<img
src="${data.image}">

<h3>

${data.name}

</h3>

<p>

${data.email||""}

</p>

<p>

₹${data.price}

</p>

<p>

Qty :
${data.quantity}

</p>

<p>

Status :
${data.status}

</p>

</div>

`;

});

}


/* Open Popup */

window.openPopup=(id)=>{

selectedOrderId=id;

document.getElementById(
"statusPopup"
)

.style.display=
"flex";

};


/* Close Popup */

window.closePopup=()=>{

document.getElementById(
"statusPopup"
)

.style.display=
"none";

};


/* Status Change */

statusSelect.onchange=()=>{

if(

statusSelect.value
==="Approved"

){

trackingId.style.display=
"block";

}

else{

trackingId.style.display=
"none";

}

};


/* Update Status */

updateBtn.onclick=

async()=>{

await updateDoc(

doc(
db,
"Orders",
selectedOrderId
),

{

status:
statusSelect.value,

trackingId:
trackingId.value

}

);

alert(
"Updated Successfully"
);

closePopup();

loadOrders();

};