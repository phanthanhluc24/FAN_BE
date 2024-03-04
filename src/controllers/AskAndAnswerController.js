const AskAndAnswerRepository=require("../repositories/AskAndAnswerRepository")
class AskAndAnswerController{
    async aiResponse(req,res){
        await AskAndAnswerRepository.aiResponse(req,res)
    }


}
module.exports=new AskAndAnswerController()