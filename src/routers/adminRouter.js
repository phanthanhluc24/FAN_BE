const express=require("express")
const router=express.Router()
const AdminController=require("../controllers/AdminController")
router.get("/repairmans/:currentPage",AdminController.getRepairmans)
router.get("/repairmanFinder/:currentPage",AdminController.getRepairmanFinder)
router.get("/service/:currentPage",AdminController.getServiceOfRepairman)
router.post("/login",AdminController.adminLogin)
module.exports=router