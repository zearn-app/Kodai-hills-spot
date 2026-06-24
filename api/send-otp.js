import twilio from "twilio";

const client=twilio(
process.env.TWILIO_SID,
process.env.TWILIO_AUTH
);

export default async function handler(req,res){

const {phone}=req.body;

try{

await client.verify.v2
.services(
process.env.VERIFY_SERVICE
)
.verifications
.create({
to:"+91"+phone,
channel:"sms"
});

res.json({
success:true
});

}
catch(error){

res.json({
success:false,
message:error.message
});

}

}
