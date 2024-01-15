const AuthRepository=require("../repositories/AuthRepository")
class AuthController{
    async register(req,res){
        await AuthRepository.register(req,res)
    }
    async verificationCode(req,res){
        await AuthRepository.verificationCode(req,res)
    }
}
module.exports=new AuthController()