const express=require("express")
const router=express.Router()
const ServiceController=require("../controllers/ServiceController")
const multer=require("multer")
const upload =multer({storage:multer.memoryStorage()})
router.post("/",upload.single("image"),ServiceController.addService)
router.get("/",ServiceController.getServices)
module.exports=router