const AuthRepository=require("../repositories/AuthRepository")
class AuthController{
    async register(req,res){
        await AuthRepository.register(req,res)
    }
    async verificationCode(req,res){
        await AuthRepository.verificationCode(req,res)
    }
    async reSendVerificationCode(req,res){
        await AuthRepository.reSendVerificationCode(req,res)
    }
    async login(req,res){
        await AuthRepository.login(req,res)
    }
    async verificationAccount(req,res){
        await AuthRepository.verificationAccount(req,res)
    }
    async resetNewPassword(req,res){
        await AuthRepository.resetNewPassword(req,res)
    }
    async refreshToken(req,res){
        await AuthRepository.refreshToken(req,res)
    }
}
module.exports=new AuthController()