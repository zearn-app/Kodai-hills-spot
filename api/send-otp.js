import twilio from "twilio";

export default async function handler(req,res){

console.log("===== SEND OTP START =====");

try{

console.log(
"TWILIO SID:",
process.env.TWILIO_SID
);

console.log(
"VERIFY SERVICE:",
process.env.VERIFY_SERVICE
);

console.log(
"AUTH TOKEN EXISTS:",
!!process.env.TWILIO_AUTH_TOKEN
);

const client=twilio(
process.env.TWILIO_SID,
process.env.TWILIO_AUTH_TOKEN
);

let {phone}=req.body;

console.log(
"Phone before:",
phone
);

phone=phone.trim();

if(!phone.startsWith("+91")){

phone="+91"+phone;

}

console.log(
"Phone after:",
phone
);

const result=
await client.verify.v2
.services(
process.env.VERIFY_SERVICE
)
.verifications
.create({

to:phone,
channel:"sms"

});

console.log(
"Twilio success:",
result
);

return res.status(200).json({

success:true,
sid:result.sid

});

}
catch(error){

console.log(
"===== TWILIO ERROR ====="
);

console.log(
error
);

console.log(
error.message
);

return res.status(500).json({

success:false,
message:error.message

});

}

}