const express=require("express")
const router=express.Router()
const UserController=require("../controllers/UserController")
router.get("/repairmans/:currentPage",UserController.getRepairmans)

module.exports=router