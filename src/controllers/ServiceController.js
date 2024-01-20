const ServiceRepository = require("../repositories/ServiceRepository")
class ServiceController{
    async addService(req,res){
        await ServiceRepository.addService(req,res)
    }
}
module.exports=new ServiceController()