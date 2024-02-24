const express=require("express")
const router=express.Router()
const AskAndAnswerController=require("../controllers/AskAndAnswerController")
router.post("/",AskAndAnswerController.aiResponse)

module.exports=router
