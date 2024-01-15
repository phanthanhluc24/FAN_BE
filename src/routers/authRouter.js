const express=require("express")
const router=express.Router()
const AuthController=require("../controllers/AuthController")
router.post("/register",AuthController.register)
router.post("/verificationCode",AuthController.verificationCode)
router.post("/reSendVerificationCode",AuthController.reSendVerificationCode)
router.post("/login",AuthController.login)
module.exports=router