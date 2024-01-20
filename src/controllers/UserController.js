const UserRepository=require("../repositories/UserRepository")
class UserController{
    async getRepairmans(req,res){
        await UserRepository.getRepairmans(req,res)
    }

    async uploadAvatar(req,res){
        await UserRepository.uploadAvatar(req,res)
    }
}
module.exports=new UserController()