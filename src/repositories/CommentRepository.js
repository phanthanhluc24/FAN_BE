const CommentModel = require("../models/CommentModel")
const validator = require("validator")
class CommentRepository {
    async commentRepairman(req, res) {
        try {
            const commenter_id = req.user._id
            const { receiver_id, content, star } = req.body
            if (validator.isEmpty(content)||content.trim().length===0) {
                return res.status(201).json({ status: 400, message: "Nội dung comment không được bỏ trống" })
            }
            if (validator.isEmpty(star)||star.trim().length===0) {
                return res.status(201).json({ status: 400, message: "Sao đánh giá không được trống" })
            }
            const comment = new CommentModel()
            comment.commenter_id = commenter_id
            comment.receiver_id = receiver_id
            comment.content = content
            comment.star = star
            await comment.save()
            return res.status(201).json({status:201,message:"Bình luận và đánh giá thành công"})
        } catch (error) {
            return res.status(500).json({status:500,message:"Có lỗi xảy ra trong quá trình bình luận"})
        }
    }
}
module.exports = new CommentRepository()