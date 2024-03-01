const express=require("express")
const router=express.Router()
const NotificationController=require("../controllers/NotificationController")
router.get("/",NotificationController.getNotification)
module.exports=router