const ServiceRepository = require("../repositories/ServiceRepository")
class ServiceController{
    async addService(req,res){
        await ServiceRepository.addService(req,res)
    }
    async getServices(req,res){
        await ServiceRepository.getServices(req,res)
    }
    async researchRepairman(req,res){
        await ServiceRepository.researchService(req,res)
    }
    async getServiceById(req,res){
        await ServiceRepository.getServiceById(req,res)
    }
    async getServiceOfRepairmanSpecific(req,res){
        await ServiceRepository.getServiceOfRepairmanSpecific(req,res)
    }
    async getServiceOfRepairmanCurrent(req,res){
        await ServiceRepository.getServiceOfRepairmanCurrent(req,res)
    }
    
}
module.exports=new ServiceController()