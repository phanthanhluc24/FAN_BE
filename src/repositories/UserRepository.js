const UserModel=require("../models/UserModel")
class UserRepository{
    async getRepairmans(req,res){
        const currentPage=parseInt(req.params.currentPage) 
        const pageSize=10
        const startIndex=(currentPage-1)*pageSize
        const endIndex=currentPage*pageSize
        try {
            const repairmans=await UserModel.find({role:"RPM",status:"active"});
            const paginatePage=repairmans.slice(startIndex,endIndex)
            return res.json({ "status": 200, "data":paginatePage,"total":repairmans.length })
        } catch (error) {
            console.log(error);
            return res.status(500).json(error)
        }
    }
}

module.exports=new UserRepository()