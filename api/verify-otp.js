import twilio from "twilio";

const client=twilio(
process.env.TWILIO_SID,
process.env.TWILIO_AUTH
);

export default async function handler(req,res){

const {phone,otp}=req.body;

try{

const result=
await client.verify.v2
.services(
process.env.VERIFY_SERVICE
)
.verificationChecks
.create({
to:"+91"+phone,
code:otp
});

res.json({
verified:
result.status==="approved"
});

}
catch(error){

res.json({
verified:false
});

}

}
