import {db}
from "./firebase.js";

import {

collection,
addDoc,
getDocs,
deleteDoc,
doc

}

from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


const productsDiv=
document.getElementById("products");


document.getElementById(
"addBtn"
)

.onclick=async()=>{

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

const querySnapshot=
await getDocs(
collection(
db,
"Products"
)
);

querySnapshot.forEach((item)=>{

const data=
item.data();

productsDiv.innerHTML +=`

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

}


loadProducts();