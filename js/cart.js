let cart = JSON.parse(
localStorage.getItem("cart")
) || [];


function addToCart(product){

cart.push(product);

localStorage.setItem(
"cart",
JSON.stringify(cart)
);

alert("Added to Cart");

}


function displayCart(){

const cartDiv=
document.getElementById("cartItems");

if(!cartDiv) return;

cartDiv.innerHTML="";

let total=0;

cart.forEach((item,index)=>{

total += Number(item.price);

cartDiv.innerHTML += `

<div style="
padding:10px;
margin:10px;
border:1px solid #ddd;
border-radius:10px;
">

<img src="${item.Image}"
width="100">

<h3>${item.name}</h3>

<p>₹${item.price}</p>

<button onclick="
removeItem(${index})
">
Remove
</button>

</div>

`;

});

document.getElementById(
"total"
).innerText=
"Total: ₹"+total;

}


function removeItem(index){

cart.splice(index,1);

localStorage.setItem(
"cart",
JSON.stringify(cart)
);

location.reload();

}

displayCart();

window.addToCart=addToCart;
window.removeItem=removeItem;