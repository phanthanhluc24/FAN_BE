const validator=require("validator")
const dotenv=require("dotenv")
dotenv.config()
const JWT=require("jsonwebtoken")
const ACCESS_TOKEN=process.env.ACCESS_TOKEN
function authMiddleware(req,res,next){
    const accessToken=req.headers.authorization
    if (!accessToken) {
        return res.status(401).json({status:401,message:"Chưa cung cấp mã token"})
    }
    const token=accessToken.split(" ")
    JWT.verify(token[1],ACCESS_TOKEN,(err,decode)=>{
        if (err) {
            return res.status(401).json({status:401,message:"Mã token đã hết hạn"})
        }
        req.user=decode
        next()
    })
}
module.exports=authMiddleware