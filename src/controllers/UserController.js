const UserRepository=require("../repositories/UserRepository")
class UserController{
    async getRepairmans(req,res){
        await UserRepository.getRepairmans(req,res)
    }

    async uploadAvatar(req,res){
        await UserRepository.uploadAvatar(req,res)
    }

    async getRepairmanByCategory(req,res){
        await UserRepository.getRepairmanByCategory(req,res)
    }

    async getRepairmanById(req,res){
        await UserRepository.getRepairmanById(req,res)
    }
    async editInformation(req,res){
        await UserRepository.editInformation(req,res)
    }
}
module.exports=new UserController()