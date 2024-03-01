const express=require("express")
const router=express.Router()
const ServiceController=require("../controllers/ServiceController")
const multer=require("multer")
const upload =multer({storage:multer.memoryStorage()})
router.post("/research",ServiceController.researchRepairman)
router.post("/",upload.single("image"),ServiceController.addService)
router.get("/",ServiceController.getServices)
router.get("/:id",ServiceController.getServiceById)
router.get("/repairman/detail/:id",ServiceController.getServiceOfRepairmanSpecific)
router.get("/repairman/current",ServiceController.getServiceOfRepairmanCurrent)
router.get("/relatedByCategory/:service_id",ServiceController.getServiceRelateByCategory)
router.put("/editService/:id",upload.single("image"),ServiceController.editServiceOfRepairman)
module.exports=router