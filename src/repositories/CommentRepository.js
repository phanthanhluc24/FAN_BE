const CommentModel = require("../models/CommentModel")
const BookingModel =require("../models/BookingModel")
const ServiceModel =require("../models/ServiceModel")
const validator = require("validator")
class CommentRepository {
    async commentRepairman(req, res) {
        try {
            const commenter_id = req.user._id
            const service_id=req.params.service_id
            const booking_id=req.params.booking_id
            const {content, star } = req.body
            if (validator.isEmpty(content)||content.trim().length===0) {
                return res.status(201).json({ status: 400, message: "Nội dung comment không được bỏ trống" })
            }
            if (validator.isEmpty(star)||star.trim().length===0) {
                return res.status(201).json({ status: 400, message: "Sao đánh giá không được trống" })
            }
            const receiver_id=await ServiceModel.findOne({_id:service_id})
            const booking=await BookingModel.findOne({_id:booking_id})
            const comment = new CommentModel()
            comment.commenter_id = commenter_id
            comment.receiver_id = receiver_id.user_id
            comment.service_id = service_id
            comment.content = content
            comment.star = star
            await comment.save()
            booking.comment="inactive"
            await booking.save()
            return res.status(201).json({status:201,message:"Bình luận và đánh giá thành công"})
        } catch (error) {
            return res.status(500).json({status:500,message:"Có lỗi xảy ra trong quá trình bình luận"})
        }
    }

    async getServiceCanComment(req,res){
        try {
            const userId=req.user._id
            const checkComment=await BookingModel.find({user_id:userId,comment:"active"}).populate("service_id")
            if (checkComment.length<1) {
                return res.status(200).json({status:400,message:"Chưa có dịch vụ nào để bình luận",data:[]})
            }
            return res.status(200).json({status:200,data:checkComment})
        } catch (error) {
            return res.status(500).json({status:500,message:error.message})
        }
    }

    async getCommentOfService(req,res){
        try {
            const repairman_id=req.params.repairman_id
            const comment =await CommentModel.find({receiver_id:repairman_id}).populate({path:"commenter_id",select: { image: 1, full_name: 1 }})
            if (comment.length<1) {
                return res.status(200).json({status:200,message:"Chưa có bình luận nào"})
            }
            return res.status(200).json({status:200,data:comment,length:comment.length})
        } catch (error) {
            console.log(error);
            return res.status(500).json({status:500,message:error.message})
        }
    }
}
module.exports = new CommentRepository()