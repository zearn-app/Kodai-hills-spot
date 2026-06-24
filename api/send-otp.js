import twilio from "twilio";

const client = twilio(
process.env.TWILIO_SID,
process.env.TWILIO_AUTH_TOKEN
);

export default async function handler(req,res){

try{

if(req.method!=="POST"){

return res.status(405).json({
success:false,
message:"Method not allowed"
});

}

let {phone}=req.body;

phone=phone.trim();

if(!phone.startsWith("+91")){

phone="+91"+phone;

}

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

return res.status(200).json({

success:true,
sid:result.sid

});

}
catch(error){

console.log(error);

return res.status(500).json({

success:false,
message:error.message

});

}

}