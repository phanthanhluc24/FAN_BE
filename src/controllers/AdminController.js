const AdminRepository=require("../repositories/AdminRepository")
class AdminController{
    async getRepairmans(req,res){
        await AdminRepository.getRepairmans(req,res)
    }

    async getRepairmanFinder(req,res){
        await AdminRepository.getRepairmanFinder(req,res)
    }

    async getServiceOfRepairman(req,res){
        await AdminRepository.getServiceOfRepairman(req,res)
    }

    async adminLogin(req,res){
        await AdminRepository.adminLogin(req,res)
    }

    async blockAccountUser(req,res){
        await AdminRepository.blockAccountUser(req,res)
    }

    async checkPermissionService(req,res){
        await AdminRepository.checkPermissionService(req,res)
    }
}
module.exports=new AdminController()