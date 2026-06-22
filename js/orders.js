import {db,auth}
from "./firebase.js";

import {

collection,
query,
where,
getDocs

}

from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import {

onAuthStateChanged

}

from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";


onAuthStateChanged(

auth,

async(user)=>{

const q=

query(

collection(
db,
"Orders"
),

where(
"uid",
"==",
user.uid
)

);


const snapshot=
await getDocs(q);

snapshot.forEach((doc)=>{

const data=
doc.data();

document.getElementById(
"orders"
)

.innerHTML += `

<div>

<h3>

${data.productId}

</h3>

<p>

${data.status}

</p>

</div>

`;

});

});