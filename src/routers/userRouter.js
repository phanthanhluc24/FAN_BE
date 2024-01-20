const express=require("express")
const router=express.Router()
const UserController=require("../controllers/UserController")
const multer=require("multer")
const upload =multer({storage:multer.memoryStorage()})
const authMiddleware=require("../middlewares/AuthMiddleware")
router.get("/repairmans/:currentPage",UserController.getRepairmans)
router.post("/uploadImage",authMiddleware,upload.single("image"),UserController.uploadAvatar)
module.exports=router