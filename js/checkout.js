import { db, auth }
from "./firebase.js";

import {
doc,
getDoc,
setDoc
}
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import {
RecaptchaVerifier,
signInWithPhoneNumber,
onAuthStateChanged
}
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";


const phoneInput=
document.getElementById(
"phone"
);

const sendOtpBtn=
document.getElementById(
"sendOtpBtn"
);

const verifyOtpBtn=
document.getElementById(
"verifyOtpBtn"
);

const otpInput=
document.getElementById(
"otp"
);

const verifyStatus=
document.getElementById(
"verifyStatus"
);

let confirmationResult;

let isVerified=false;

let currentUser=null;


/* Auth user */

onAuthStateChanged(

auth,

async(user)=>{

currentUser=user;

if(!user){

window.location=
"login.html";

return;
}

checkVerification();

});


/* Check first order verification */

async function checkVerification(){

const verifyRef=
doc(
db,
"VerifiedUsers",
currentUser.uid
);

const snap=
await getDoc(
verifyRef
);

if(
snap.exists()
){

isVerified=true;

document.getElementById(
"otpSection"
).style.display=
"none";

}

}


/* Recaptcha */

window.recaptchaVerifier=
new RecaptchaVerifier(

auth,

"recaptcha-container",

{
size:"normal"
}

);


/* Send OTP */


sendOtpBtn.onclick=async()=>{

try{

verifyStatus.innerHTML=
"Sending...";

const response=
await fetch(
"/api/send-otp",
{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
phone:phoneInput.value
})
}
);

const data=
await response.json();

console.log(
"Frontend Response:",
data
);

verifyStatus.innerHTML=
JSON.stringify(data);

}
catch(error){

console.log(
"Frontend Error:",
error
);

verifyStatus.innerHTML=
error.message;

}

};

/* Verify OTP */

verifyOtpBtn.onclick=
async()=>{

const response=
await fetch(
"/api/verify-otp",
{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({

phone:
phoneInput.value,

otp:
otpInput.value

})
}
);

const data=
await response.json();

if(data.verified){

isVerified=true;

verifyStatus.innerHTML=
"Phone Verified";

}
else{

verifyStatus.innerHTML=
"Wrong OTP";

}

};
/* Place Order */

document.getElementById(
"placeOrder"
)

.addEventListener(

"click",

()=>{

if(!isVerified){

alert(
"Please verify phone number first"
);

return;

}

alert(
"Order placed successfully"
);

}

);



const stateSelect=
document.getElementById(
"state"
);

const districtSelect=
document.getElementById(
"district"
);


const statesAndDistricts={

"Andhra Pradesh":[
"Anantapur",
"Chittoor",
"Guntur",
"Kadapa",
"Krishna",
"Kurnool",
"Nellore",
"Prakasam",
"Srikakulam",
"Visakhapatnam",
"Vizianagaram"
],

"Arunachal Pradesh":[
"Itanagar",
"Tawang",
"West Siang"
],

"Assam":[
"Guwahati",
"Dibrugarh",
"Silchar",
"Nagaon"
],

"Bihar":[
"Patna",
"Gaya",
"Muzaffarpur",
"Bhagalpur"
],

"Chhattisgarh":[
"Raipur",
"Bilaspur",
"Durg"
],

"Goa":[
"North Goa",
"South Goa"
],

"Gujarat":[
"Ahmedabad",
"Surat",
"Rajkot",
"Vadodara"
],

"Haryana":[
"Gurgaon",
"Faridabad",
"Panipat"
],

"Himachal Pradesh":[
"Shimla",
"Kullu",
"Manali"
],

"Jharkhand":[
"Ranchi",
"Jamshedpur",
"Dhanbad"
],

"Karnataka":[
"Bangalore",
"Mysore",
"Mangalore",
"Hubli"
],

"Kerala":[
"Thiruvananthapuram",
"Kochi",
"Kozhikode",
"Kollam"
],

"Madhya Pradesh":[
"Bhopal",
"Indore",
"Gwalior"
],

"Maharashtra":[
"Mumbai",
"Pune",
"Nagpur",
"Nashik"
],

"Manipur":[
"Imphal"
],

"Meghalaya":[
"Shillong"
],

"Mizoram":[
"Aizawl"
],

"Nagaland":[
"Kohima"
],

"Odisha":[
"Bhubaneswar",
"Cuttack",
"Puri"
],

"Punjab":[
"Amritsar",
"Ludhiana",
"Jalandhar"
],

"Rajasthan":[
"Jaipur",
"Jodhpur",
"Udaipur"
],

"Sikkim":[
"Gangtok"
],

"Tamil Nadu":[
"Chennai",
"Coimbatore",
"Madurai",
"Tirunelveli",
"Salem",
"Tiruppur",
"Erode",
"Trichy",
"Kanyakumari",
"Dindigul",
"Thanjavur"
],

"Telangana":[
"Hyderabad",
"Warangal",
"Karimnagar"
],

"Tripura":[
"Agartala"
],

"Uttar Pradesh":[
"Lucknow",
"Kanpur",
"Agra",
"Varanasi"
],

"Uttarakhand":[
"Dehradun",
"Haridwar"
],

"West Bengal":[
"Kolkata",
"Howrah",
"Darjeeling"
]

};


/* Load States */

Object.keys(
statesAndDistricts
)

.forEach(state=>{

stateSelect.innerHTML+=`

<option>

${state}

</option>

`;

});


/* Load Districts */

stateSelect.addEventListener(

"change",

()=>{

districtSelect.innerHTML=`

<option value="">

Select District

</option>

`;

const districts=

statesAndDistricts[
stateSelect.value
];

districts.forEach(

district=>{

districtSelect.innerHTML+=`

<option>

${district}

</option>

`;

}

);

}

);