const StripeRepository=require("../repositories/StripeRepository")
class StripeController{
    async StripePayment(req,res){
        await StripeRepository.StripePayment(req,res)
    }
}
module.exports=new StripeController()