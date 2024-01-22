const nodemailer=require("nodemailer")
const JWT=require("jsonwebtoken")
const dotenv=require("dotenv")
const handlebars=require("handlebars")
const fs=require("fs")
dotenv.config()
const EMAIL_ADDRESS=process.env.EMAIL_ADDRESS
const EMAIL_PASSWORD=process.env.EMAIL_PASSWORD
// const view=require("../views/emailNotificationServiceTemple.hbs")
const repairmanTempleSource=fs.readFileSync("src/views/emailNotificationServiceTemple.hbs","utf-8")
const repairmanTemple=handlebars.compile(repairmanTempleSource)
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
    async sendToRepairman(data){
        const {full_name,service_name}=data
        await this.send("Dịch vụ đang chờ kiểm duyệt",repairmanTemple({full_name,service_name}))
    }
}   