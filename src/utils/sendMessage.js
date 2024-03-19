const twilio = require("twilio")
const dotenv = require("dotenv")
dotenv.config()
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER
const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
)

function sendMassageCode(to, message) {
    client.messages
        .create({
            from: TWILIO_PHONE_NUMBER,
            to: to,
            body: message,
        })
        .then((message) => {
            console.log(
                `SMS message sent from ${from} to ${to}. Message SID: ${message.sid}`
            );
        })
        .catch((error) => {
            console.error(error.message);
        });
}

module.exports={sendMassageCode}