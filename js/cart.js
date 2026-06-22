const cartItems=
document.getElementById("cartItems");

const total=
document.getElementById("total");

let cart=
JSON.parse(
localStorage.getItem("cart")
)||[];


let totalPrice=0;

cartItems.innerHTML="";


cart.forEach((item,index)=>{

totalPrice+=Number(item.price);

cartItems.innerHTML+=`

<div class="card">

<img src="${item.Image}">

<div class="details">

<h3>${item.name}</h3>

<div class="price">

₹${item.price}

</div>

<button
class="remove"
onclick="removeItem(${index})">

Remove

</button>

</div>

</div>

`;

});


total.innerText=
"Total : ₹"+totalPrice;


function removeItem(index){

cart.splice(index,1);

localStorage.setItem(
"cart",
JSON.stringify(cart)
);

location.reload();

}