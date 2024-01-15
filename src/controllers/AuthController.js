const AuthRepository=require("../repositories/AuthRepository")
class AuthController{
    async register(req,res){
        await AuthRepository.register(req,res)
    }
}
module.exports=new AuthController()