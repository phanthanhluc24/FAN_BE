const ServiceRepository = require("../repositories/ServiceRepository")
class ServiceController{
    async addService(req,res){
        await ServiceRepository.addService(req,res)
    }
    async getServices(req,res){
        await ServiceRepository.getServices(req,res)
    }
}
module.exports=new ServiceController()