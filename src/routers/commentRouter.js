const express=require("express")
const router=express.Router()
const CommentController=require("../controllers/CommentController")
router.post("/:service_id/:booking_id",CommentController.commentRepairman)
router.get("/checkToComment",CommentController.getServiceCanComment)
router.get("/:repairman_id",CommentController.getCommentOfService)
module.exports=router