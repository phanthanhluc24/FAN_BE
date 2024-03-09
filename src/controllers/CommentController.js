const CommentRepository=require("../repositories/CommentRepository")
class CommentController{
    async commentRepairman(req, res) {
        await CommentRepository.commentRepairman(req,res)
    } 

    async getServiceCanComment(req,res){
        await CommentRepository.getServiceCanComment(req,res)
    }

    async getCommentOfService(req,res){
        await CommentRepository.getCommentOfService(req,res)
    }
}
module.exports=new CommentController()