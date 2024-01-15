const nodemailer=require("nodemailer")
const JWT=require("jsonwebtoken")
const dotenv=require("dotenv")
dotenv.config()
const EMAIL_ADDRESS=process.env.EMAIL_ADDRESS
const EMAIL_PASSWORD=process.env.EMAIL_PASSWORD
const CODE_TOKEN=process.env.CODE_TOKEN
module.exports=class Email{
    constructor(user){
        this.to=user.email
        this.from='Fix All Now <noreply>'
    }

    newTransport(){
        return nodemailer.createTransport({
            service:"Gmail",
            auth:{
                user:EMAIL_ADDRESS,
                pass:EMAIL_PASSWORD
            }
        })

    }

    async send(subject,content){
        const mailOption={
            from:this.from,
            to:this.to,
            subject:subject,
            html:content
        }

        await this.newTransport().sendMail(mailOption)
    }

    async sendCodeToConfirm(code){
        await this.send("Mã xác thực tài khoản",`Mã xác thực của bạn là: ${code}`)
    }
}   