const express=require("express")
const router=express.Router()
const CommentController=require("../controllers/CommentController")
router.post("/",CommentController.commentRepairman)

module.exports=router