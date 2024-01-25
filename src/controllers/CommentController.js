const CommentRepository=require("../repositories/CommentRepository")
class CommentController{
    async commentRepairman(req, res) {
        await CommentRepository.commentRepairman(req,res)
    } 
}
module.exports=new CommentController()