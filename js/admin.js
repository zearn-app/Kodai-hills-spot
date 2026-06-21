import { db } from "./firebase.js";

import {
collection,
addDoc
}
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


const addBtn=
document.getElementById("addBtn");


addBtn.onclick=
async ()=>{

const product={

name:
document.getElementById(
"name"
).value,

price:
Number(
document.getElementById(
"price"
).value
),

category:
document.getElementById(
"category"
).value,

Stock:
document.getElementById(
"stock"
).value,

Image:
document.getElementById(
"image"
).value,

description:
document.getElementById(
"description"
).value

};


try{

await addDoc(
collection(db,"Products"),
product
);

alert(
"Product Added Successfully"
);

location.reload();

}
catch(error){

alert(
error.message
);

}

};